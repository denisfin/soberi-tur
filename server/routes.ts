import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tourSearchSchema, generateTourSchema } from "@shared/schema";
import https from "https";
import fs from "fs";
import path from "path";

const russianCaCert = fs.readFileSync(path.join(import.meta.dirname, "russian-ca-chain.pem"));
const gigaChatAgent = new https.Agent({ ca: russianCaCert });

let gigaChatToken: string | null = null;
let gigaChatTokenExpiresAt = 0;

async function gigaChatFetch(url: string, options: RequestInit): Promise<Response> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = typeof options.body === "string" ? options.body : "";
    const headers: Record<string, string> = {};
    if (options.headers) {
      const h = options.headers as Record<string, string>;
      for (const [k, v] of Object.entries(h)) {
        headers[k] = v;
      }
    }
    headers["Content-Length"] = Buffer.byteLength(postData).toString();

    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || "GET",
        headers,
        agent: gigaChatAgent,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf-8");
          resolve(new Response(body, {
            status: res.statusCode || 500,
            statusText: res.statusMessage || "",
            headers: res.headers as any,
          }));
        });
      }
    );
    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function getGigaChatToken(): Promise<string> {
  const now = Date.now();
  if (gigaChatToken && now < gigaChatTokenExpiresAt - 60000) {
    return gigaChatToken;
  }

  const authKey = process.env.GIGACHAT_AUTH_KEY;
  if (!authKey) {
    throw new Error("GIGACHAT_AUTH_KEY is not configured");
  }

  const rquid = crypto.randomUUID();

  const response = await gigaChatFetch("https://ngw.devices.sberbank.ru:9443/api/v2/oauth", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "RqUID": rquid,
      "Authorization": `Basic ${authKey}`,
    },
    body: "scope=GIGACHAT_API_PERS",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GigaChat OAuth failed: ${response.status} ${text}`);
  }

  const data = await response.json() as { access_token: string; expires_at: number };
  gigaChatToken = data.access_token;
  gigaChatTokenExpiresAt = data.expires_at;

  return gigaChatToken;
}

async function callGigaChat(prompt: string): Promise<string> {
  const token = await getGigaChatToken();

  const response = await gigaChatFetch("https://gigachat.devices.sberbank.ru/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: "GigaChat",
      messages: [
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GigaChat API failed: ${response.status} ${text}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content || "";
}

function buildTourPrompt(params: {
  from: string;
  to: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
  childrenAges: number[];
}): string {
  const dateFromObj = new Date(params.dateFrom);
  const dateToObj = new Date(params.dateTo);
  const dateFromStr = dateFromObj.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const dateToStr = dateToObj.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  const childrenCount = params.childrenAges.length;
  const childrenInfo = childrenCount > 0
    ? `${childrenCount} детей (возраст: ${params.childrenAges.map(a => a === 0 ? "до 1 года" : `${a} лет`).join(", ")})`
    : "без детей";

  return `Ты эксперт по персонализированным путешествиям по России. Создай подробный маршрут тура на основе пользовательских данных:

Исходные данные:
- Откуда: ${params.from} (город выезда)
- Куда: ${params.to} (основной пункт назначения)
- Даты: с ${dateFromStr} по ${dateToStr} (укажи количество дней/ночей)
- Состав группы: ${params.guests} взрослых, ${childrenInfo}

Формат вывода — СТРОГО Markdown. Соблюдай структуру и форматирование ТОЧНО как в примере ниже:

## Персональный тур ${params.from} — ${params.to}

### Проживание в ${params.to}

**Экономно:**  
✨ **[Название отеля](ссылка_на_сайт_отеля)**  
*Адрес:* полный адрес  
*Цена от:* XXXX руб./сутки  
*Описание:* краткое описание отеля

**Комфортно:**  
✨ **[Название отеля](ссылка_на_сайт_отеля)**  
*Адрес:* полный адрес  
*Цена от:* XXXX руб./сутки  
*Описание:* краткое описание отеля

**Роскошно:**  
✨ **[Название отеля](ссылка_на_сайт_отеля)**  
*Адрес:* полный адрес  
*Цена от:* XXXX руб./сутки  
*Описание:* краткое описание отеля

---

### Где поесть в ${params.to}

1. **«Название заведения»**  
   *Адрес:* полный адрес  
   *Средний чек:* XXX–XXXX руб.  
   *Рейтинг:* X.X (Яндекс.Карты)

2. **«Название заведения»**  
   *Адрес:* полный адрес  
   *Средний чек:* XXX–XXXX руб.  
   *Рейтинг:* X.X (Яндекс.Карты)

(3-5 заведений, разнообразная кухня, рейтинг 4.5+)

---

### Маршрут тура по дням

#### День 1 ({дата}, {день_недели}) — Заголовок дня (3-5 слов)

🌞 **Заголовок дня:** краткое описание  
📍 **Активности:**  
1. Описание активности, ссылка на [название объекта](официальный_сайт)  
2. Описание активности  
3. Описание активности

#### День 2 ({дата}, {день_недели}) — Заголовок дня

(повтори структуру для каждого дня)

---

### Общие рекомендации

- совет по погоде и одежде  
- совет по бронированию  
- совет по логистике

ПРАВИЛА генерации:
1. Разбей тур равномерно по дням (3-5 активностей/день, утром/днём/вечером).
2. Первый день = прибытие, последний день = отъезд (если не overnight).
3. Гостиницы: 3 варианта по ценовым сегментам. ПРОВЕРЬ возможность проживания с детьми (если есть дети в группе). Названия отелей — кликабельные ссылки на их сайты.
4. Рестораны/кафе: 3-5 шт., разнообразие (русская, европейская, азиатская, кафе), рейтинг 4.5+ с Яндекс.Карт. Средний чек реалистичный.
5. Ссылки: для музеев/достопримечательностей — официальные сайты, для отелей — их сайты.
6. Стиль: дружеский, уважительный, живой. Как опытный гид рассказывает друзьям. Без сленга.
7. Длительность тура: рассчитай по датам, учти день недели для каждой даты.
8. Логистика: укажи как добраться из ${params.from} в ${params.to} (поезд, автобус, авто).
9. Активности: миксуй историю, природу, гастрономию, шопинг. Учитывай сезон.
10. Используй Markdown: ## для главного заголовка, ### для разделов, #### для дней, **жирный** для названий, *курсив* для подписей (Адрес, Цена, Описание), --- для разделителей между блоками.
11. Используй эмодзи-маркеры для дней: 🌞 🌿 🚗 🍽️ 🏔️ 🎭 🚂 и подобные — по тематике дня.

Сгенерируй ТОЧНО в указанном Markdown-формате.`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/cities", async (_req, res) => {
    const cities = await storage.getCities();
    res.json(cities);
  });

  app.post("/api/search", async (req, res) => {
    const parsed = tourSearchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid search parameters" });
    }
    const results = await storage.searchTours(parsed.data);
    res.json(results);
  });

  app.get("/api/route-cards", async (_req, res) => {
    const cards = await storage.getRouteCards();
    res.json(cards);
  });

  app.get("/api/tours/:id", async (req, res) => {
    const tour = await storage.getPreGeneratedTour(req.params.id);
    if (!tour) {
      return res.status(404).json({ error: "Тур не найден" });
    }
    res.json(tour);
  });

  app.post("/api/generate-tour", async (req, res) => {
    const parsed = generateTourSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Некорректные параметры запроса", details: parsed.error.errors });
    }

    try {
      const prompt = buildTourPrompt(parsed.data);
      const tourContent = await callGigaChat(prompt);
      res.json({ content: tourContent });
    } catch (error: any) {
      console.error("GigaChat error:", error.message);
      res.status(500).json({ error: "Ошибка генерации тура. Попробуйте позже." });
    }
  });

  return httpServer;
}

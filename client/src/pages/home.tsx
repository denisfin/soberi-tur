import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, Search, ArrowRight, Clock, ChevronDown, Compass, Baby } from "lucide-react";
import { SiTelegram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import type { RouteCard } from "@shared/schema";

const RUSSIAN_CITIES = [
  "Абакан", "Азов", "Александров", "Алексин", "Альметьевск", "Анапа", "Ангарск", "Анжеро-Судженск",
  "Апатиты", "Арзамас", "Армавир", "Арсеньев", "Артём", "Архангельск", "Астрахань", "Ачинск",
  "Балаково", "Балахна", "Балашиха", "Балашов", "Барнаул", "Батайск", "Белгород", "Белебей",
  "Белово", "Белогорск", "Белорецк", "Белореченск", "Бердск", "Берёзники", "Берёзовский",
  "Бийск", "Биробиджан", "Благовещенск", "Бор", "Борисоглебск", "Братск", "Брянск", "Бугульма",
  "Будённовск", "Бузулук", "Буйнакск", "Великие Луки", "Великий Новгород", "Верхняя Пышма",
  "Видное", "Владивосток", "Владикавказ", "Владимир", "Волгоград", "Волгодонск", "Волжск",
  "Волжский", "Вологда", "Вольск", "Воркута", "Воронеж", "Воскресенск", "Воткинск", "Всеволожск",
  "Выборг", "Выкса", "Вязьма", "Гатчина", "Геленджик", "Георгиевск", "Глазов", "Горно-Алтайск",
  "Грозный", "Губкин", "Гуково", "Гусь-Хрустальный", "Дербент", "Дзержинск", "Димитровград",
  "Дмитров", "Долгопрудный", "Домодедово", "Донской", "Дубна", "Евпатория", "Егорьевск",
  "Ейск", "Екатеринбург", "Елабуга", "Елец", "Ессентуки", "Железногорск", "Жигулёвск",
  "Жуковский", "Забайкальск", "Заречный", "Зеленогорск", "Зеленодольск", "Златоуст",
  "Иваново", "Ижевск", "Избербаш", "Иркутск", "Искитим", "Ишим", "Ишимбай", "Йошкар-Ола",
  "Кавказские Минеральные Воды", "Калининград", "Калуга", "Каменск-Уральский", "Каменск-Шахтинский",
  "Камышин", "Канск", "Каспийск", "Кемерово", "Керчь", "Кинешма", "Кириши", "Киров",
  "Кирово-Чепецк", "Кисловодск", "Клин", "Клинцы", "Ковров", "Когалым", "Коломна",
  "Комсомольск-на-Амуре", "Копейск", "Королёв", "Кострома", "Котлас", "Красногорск",
  "Краснодар", "Краснокаменск", "Краснотурьинск", "Красноярск", "Кропоткин", "Крымск",
  "Кстово", "Кузнецк", "Кумертау", "Кунгур", "Курган", "Курск", "Кызыл",
  "Лабинск", "Лениногорск", "Ленинск-Кузнецкий", "Лесосибирск", "Липецк", "Лиски",
  "Лобня", "Лысьва", "Люберцы", "Магадан", "Магнитогорск", "Майкоп", "Махачкала",
  "Междуреченск", "Мелеуз", "Миасс", "Минеральные Воды", "Минусинск", "Михайловка",
  "Михайловск", "Мичуринск", "Москва", "Мурманск", "Муром", "Мытищи", "Набережные Челны",
  "Назрань", "Нальчик", "Нарьян-Мар", "Находка", "Невинномысск", "Нерюнгри", "Нефтекамск",
  "Нефтеюганск", "Нижневартовск", "Нижнекамск", "Нижний Новгород", "Нижний Тагил",
  "Новоалтайск", "Новокузнецк", "Новокуйбышевск", "Новомосковск", "Новороссийск",
  "Новосибирск", "Новотроицк", "Новоуральск", "Новочебоксарск", "Новочеркасск", "Новошахтинск",
  "Новый Уренгой", "Ногинск", "Норильск", "Ноябрьск", "Нягань", "Обнинск", "Одинцово",
  "Озёрск", "Октябрьский", "Омск", "Орёл", "Оренбург", "Орехово-Зуево", "Орск",
  "Пенза", "Первоуральск", "Пермь", "Петрозаводск", "Петропавловск-Камчатский",
  "Подольск", "Полевской", "Прокопьевск", "Прохладный", "Псков", "Пушкино", "Пятигорск",
  "Раменское", "Ревда", "Реутов", "Ржев", "Рославль", "Россошь", "Ростов-на-Дону",
  "Рубцовск", "Рыбинск", "Рязань", "Салават", "Салехард", "Сальск", "Самара", "Саранск",
  "Сарапул", "Саратов", "Саров", "Свободный", "Севастополь", "Северодвинск", "Северск",
  "Серов", "Серпухов", "Симферополь", "Славянск-на-Кубани", "Смоленск", "Соликамск",
  "Сосновый Бор", "Сочи", "Ставрополь", "Старый Оскол", "Стерлитамак", "Ступино",
  "Сургут", "Сызрань", "Сыктывкар", "Тамбов", "Тверь", "Тимашёвск", "Тихвин", "Тихорецк",
  "Тобольск", "Тольятти", "Томск", "Троицк", "Туапсе", "Тула", "Тюмень",
  "Узловая", "Улан-Удэ", "Ульяновск", "Усолье-Сибирское", "Уссурийск", "Усть-Илимск",
  "Уфа", "Ухта", "Хабаровск", "Ханты-Мансийск", "Хасавюрт", "Химки", "Чайковский",
  "Чапаевск", "Чебоксары", "Челябинск", "Черемхово", "Череповец", "Черкесск", "Черногорск",
  "Чехов", "Чистополь", "Чита", "Шадринск", "Шахты", "Шуя", "Щёкино", "Щёлково",
  "Электросталь", "Элиста", "Энгельс", "Южно-Сахалинск", "Юрга", "Якутск", "Ялта",
  "Ярославль",
  "Байкал", "Камчатка",
];

const ROUTE_CARDS_DATA: RouteCard[] = [
  {
    id: "moscow-tula",
    from: "Москва",
    to: "Тула",
    description: "Пряничная столица России. Кремль, музей оружия, усадьба Ясная Поляна и знаменитые тульские пряники.",
    image: "/images/route-moscow-tula.png",
    duration: "3 дня / 2 ночи",
  },
  {
    id: "spb-petrozavodsk",
    from: "Санкт-Петербург",
    to: "Петрозаводск",
    description: "Ворота Карелии. Водопад Кивач, Онежское озеро, Марциальные воды и суровая красота северной природы.",
    image: "/images/route-spb-petrozavodsk.png",
    duration: "3 дня / 2 ночи",
  },
  {
    id: "moscow-plyos",
    from: "Москва",
    to: "Плёс",
    description: "Город-вдохновение Левитана. Волжские пейзажи, старинные церкви и тишина русской провинции.",
    image: "/images/route-moscow-plyos.png",
    duration: "3 дня / 2 ночи",
  },
  {
    id: "moscow-yaroslavl",
    from: "Москва",
    to: "Ярославль",
    description: "Жемчужина Золотого кольца. Спасо-Преображенский монастырь, набережная Волги и тысячелетняя история.",
    image: "/images/route-moscow-yaroslavl.png",
    duration: "3 дня / 2 ночи",
  },
  {
    id: "krasnodar-sochi",
    from: "Краснодар",
    to: "Сочи",
    description: "Курортная столица. Красная Поляна, Чёрное море, олимпийский парк и субтропическая природа побережья.",
    image: "/images/route-krasnodar-sochi.png",
    duration: "3 дня / 2 ночи",
  },
  {
    id: "nn-kazan",
    from: "Нижний Новгород",
    to: "Казань",
    description: "Встреча двух культур. Казанский Кремль, мечеть Кул-Шариф, улица Баумана и татарская кухня.",
    image: "/images/route-nn-kazan.png",
    duration: "3 дня / 2 ночи",
  },
];

const NAV_LINKS = [
  { label: "Главная", href: "#hero" },
  { label: "Направления", href: "#cities" },
  { label: "Контакты", href: "#footer" },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function CityAutocomplete({
  value,
  onChange,
  placeholder,
  icon: Icon,
  testId,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: typeof MapPin;
  testId: string;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const filtered = RUSSIAN_CITIES.filter((c) =>
    c.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 6);
  const showDropdown = focused && value.length > 0 && filtered.length > 0;

  return (
    <div className="relative flex-1 min-w-0">
      <div className="flex items-center gap-2 px-3 py-3">
        <Icon className={`w-4 h-4 shrink-0 ${hasError ? "text-red-400" : "text-[#00bfff]"}`} />
        <input
          data-testid={testId}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => setTimeout(() => { setFocused(false); setOpen(false); }, 200)}
          placeholder={hasError ? "Заполните поле" : placeholder}
          className={`w-full bg-transparent text-white text-sm outline-none ${hasError ? "placeholder:text-red-400/70" : "placeholder:text-white/40"}`}
        />
      </div>
      {showDropdown && open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md bg-[#2c2c31] border border-white/10 overflow-hidden">
          {filtered.map((city) => (
            <button
              key={city}
              data-testid={`option-city-${city}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(city); setOpen(false); setFocused(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-white/90 hover-elevate cursor-pointer"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface SearchData {
  from: string;
  to: string;
  dates: DateRange | undefined;
  guests: number;
  childrenAges: number[];
}

function getLastSearch(): { from: string; to: string; dates: DateRange | undefined; guests: number; childrenAges: number[] } {
  try {
    const stored = sessionStorage.getItem("tourParams");
    if (!stored) return { from: "", to: "", dates: undefined, guests: 2, childrenAges: [] };
    const p = JSON.parse(stored);
    const dates: DateRange | undefined = p.dateFrom && p.dateTo
      ? { from: new Date(p.dateFrom), to: new Date(p.dateTo) }
      : undefined;
    return {
      from: p.from || "",
      to: p.to || "",
      dates,
      guests: p.guests || 2,
      childrenAges: p.childrenAges || [],
    };
  } catch {
    return { from: "", to: "", dates: undefined, guests: 2, childrenAges: [] };
  }
}

function SearchBar({ onSubmit, isPending }: { onSubmit: (data: SearchData) => void; isPending: boolean }) {
  const last = getLastSearch();
  const [from, setFrom] = useState(last.from);
  const [to, setTo] = useState(last.to);
  const [dates, setDates] = useState<DateRange | undefined>(last.dates);
  const [guests, setGuests] = useState(last.guests);
  const [childrenAges, setChildrenAges] = useState<number[]>(last.childrenAges);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<{ from?: boolean; to?: boolean; dates?: boolean }>({});

  const addChild = () => {
    if (childrenAges.length < 6) setChildrenAges([...childrenAges, 5]);
  };
  const removeChild = () => {
    if (childrenAges.length > 0) setChildrenAges(childrenAges.slice(0, -1));
  };
  const setChildAge = (index: number, age: number) => {
    const updated = [...childrenAges];
    updated[index] = age;
    setChildrenAges(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { from?: boolean; to?: boolean; dates?: boolean } = {};
    if (!from.trim()) newErrors.from = true;
    if (!to.trim()) newErrors.to = true;
    if (!dates?.from) newErrors.dates = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSubmit({ from, to, dates, guests, childrenAges });
  };

  const dateLabel = dates?.from
    ? dates.to
      ? `${format(dates.from, "d MMM", { locale: ru })} — ${format(dates.to, "d MMM", { locale: ru })}`
      : format(dates.from, "d MMM yyyy", { locale: ru })
    : "";

  return (
    <form onSubmit={handleSubmit} data-testid="search-bar-form">
      <div className="flex flex-col lg:flex-row lg:items-center items-stretch bg-[#2c2c31]/90 backdrop-blur-xl border border-white/10 rounded-md overflow-visible">
        <CityAutocomplete
          value={from}
          onChange={(v) => { setFrom(v); if (errors.from) setErrors((e) => ({ ...e, from: false })); }}
          placeholder="Откуда"
          icon={MapPin}
          testId="input-from"
          hasError={errors.from}
        />

        <div className="hidden lg:block w-px h-6 bg-white/10" />
        <div className="block lg:hidden h-px bg-white/10 mx-3" />

        <CityAutocomplete
          value={to}
          onChange={(v) => { setTo(v); if (errors.to) setErrors((e) => ({ ...e, to: false })); }}
          placeholder="Куда"
          icon={MapPin}
          testId="input-to"
          hasError={errors.to}
        />

        <div className="hidden lg:block w-px h-6 bg-white/10" />
        <div className="block lg:hidden h-px bg-white/10 mx-3" />

        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-testid="button-dates"
              className="flex items-center gap-2 px-3 py-3 flex-1 min-w-0 text-left hover-elevate"
            >
              <Calendar className={`w-4 h-4 shrink-0 ${errors.dates ? "text-red-400" : "text-[#00bfff]"}`} />
              <span className={`text-sm truncate ${dateLabel ? "text-white" : errors.dates ? "text-red-400/70" : "text-white/40"}`}>
                {dateLabel || (errors.dates ? "Выберите даты" : "Даты")}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#2c2c31] border-white/10" align="start">
            <CalendarComponent
              mode="range"
              selected={dates}
              onSelect={(range) => {
                setDates(range);
                if (errors.dates) setErrors((e) => ({ ...e, dates: false }));
                if (range?.to) setCalendarOpen(false);
              }}
              numberOfMonths={2}
              disabled={{ before: new Date() }}
              className="text-white"
            />
          </PopoverContent>
        </Popover>

        <div className="hidden lg:block w-px h-6 bg-white/10" />
        <div className="block lg:hidden h-px bg-white/10 mx-3" />

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-testid="button-guests"
              className="flex items-center gap-2 px-3 py-3 flex-shrink-0 text-left hover-elevate"
            >
              <Users className="w-4 h-4 text-[#00bfff] shrink-0" />
              <span className="text-sm text-white">
                {guests} взр.{childrenAges.length > 0 ? `, ${childrenAges.length} дет.` : ""}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-[#2c2c31] border-white/10 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#00bfff] shrink-0" />
                  <span className="text-sm text-white">Взрослые</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    data-testid="button-guests-minus"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-7 h-7 text-white text-xs"
                  >
                    -
                  </Button>
                  <span className="text-sm text-white min-w-[1.5rem] text-center" data-testid="text-guests-count">
                    {guests}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    data-testid="button-guests-plus"
                    onClick={() => setGuests(Math.min(10, guests + 1))}
                    className="w-7 h-7 text-white text-xs"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-[#00bfff] shrink-0" />
                  <span className="text-sm text-white">Дети</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    data-testid="button-children-minus"
                    onClick={removeChild}
                    className="w-7 h-7 text-white text-xs"
                  >
                    -
                  </Button>
                  <span className="text-sm text-white min-w-[1.5rem] text-center" data-testid="text-children-count">
                    {childrenAges.length}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    data-testid="button-children-plus"
                    onClick={addChild}
                    className="w-7 h-7 text-white text-xs"
                  >
                    +
                  </Button>
                </div>
              </div>
              {childrenAges.length > 0 && (
                <>
                  <div className="h-px bg-white/10" />
                  <div className="space-y-2">
                    <span className="text-xs text-white/50">Возраст детей</span>
                    {childrenAges.map((age, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-white/70">Ребёнок {i + 1}</span>
                        <select
                          data-testid={`select-child-age-${i}`}
                          value={age}
                          onChange={(e) => setChildAge(i, Number(e.target.value))}
                          className="bg-white/10 text-white text-sm rounded-md px-2 py-1 border border-white/10 outline-none"
                        >
                          {Array.from({ length: 18 }, (_, a) => (
                            <option key={a} value={a} className="bg-[#2c2c31] text-white">
                              {a === 0 ? "до 1 года" : `${a} ${a === 1 ? "год" : a < 5 ? "года" : "лет"}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="submit"
          data-testid="button-create-tour"
          disabled={isPending}
          className="m-2 px-6 bg-gradient-to-r from-[#00bfff] to-[#0080ff] text-white font-semibold shrink-0 border-0 no-default-hover-elevate no-default-active-elevate"
        >
          <Search className="w-4 h-4 mr-2" />
          {isPending ? "Поиск..." : "Собери тур!"}
        </Button>
      </div>
    </form>
  );
}

function RouteCardComponent({ route, index }: { route: RouteCard; index: number }) {
  const { ref, inView } = useInView(0.1);
  const [, navigate] = useLocation();

  const handleClick = () => {
    navigate(`/tour/${route.id}`);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    >
      <Card
        data-testid={`card-route-${route.id}`}
        onClick={handleClick}
        className="group relative overflow-visible bg-[#2c2c31] border-white/5 hover-elevate cursor-pointer"
      >
        <div className="relative overflow-hidden rounded-md rounded-b-none aspect-[3/4]">
          <img
            src={route.image}
            alt={`${route.from} — ${route.to}`}
            data-testid={`img-route-${route.id}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute top-3 left-3">
            <Badge className="bg-[#242428]/70 backdrop-blur-sm text-white border-0 text-xs no-default-hover-elevate no-default-active-elevate">
              <Clock className="w-3 h-3 mr-1" />
              <span data-testid={`text-duration-${route.id}`}>{route.duration}</span>
            </Badge>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white mb-1 font-serif" data-testid={`text-route-name-${route.id}`}>
              {route.from} — {route.to}
            </h3>
          </div>
        </div>

        <div className="p-4">
          <p className="text-white/60 text-sm leading-relaxed line-clamp-2" data-testid={`text-desc-${route.id}`}>
            {route.description}
          </p>
          <div className="mt-3 flex items-center gap-1 flex-wrap text-[#00bfff] text-sm font-medium">
            <span data-testid={`link-details-${route.id}`}>Подробнее</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  const [submitting, setSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (data: SearchData) => {
    const tourParams = {
      from: data.from,
      to: data.to,
      dateFrom: data.dates?.from?.toISOString() || "",
      dateTo: data.dates?.to?.toISOString() || "",
      guests: data.guests,
      childrenAges: data.childrenAges,
    };
    sessionStorage.setItem("tourParams", JSON.stringify(tourParams));
    setSubmitting(true);
    navigate("/tour");
  };

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#242428] text-white overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300">
        <div className="bg-[#242428]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 h-16">
              <button
                onClick={() => scrollToSection("#hero")}
                className="flex items-center gap-2 shrink-0"
                data-testid="link-logo"
              >
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#00bfff] to-[#0060cc] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
                  <span className="text-[#00bfff]">Собери</span>Тур
                </span>
              </button>

              <div className="hidden md:flex items-center gap-6 flex-wrap">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    data-testid={`link-nav-${link.label}`}
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  data-testid="button-mobile-menu"
                  className="md:hidden flex flex-col gap-1.5 p-2"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span className={`w-5 h-0.5 bg-white transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
                  <span className={`w-5 h-0.5 bg-white transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
                  <span className={`w-5 h-0.5 bg-white transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#242428]/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    data-testid={`link-mobile-nav-${link.label}`}
                    onClick={() => scrollToSection(link.href)}
                    className="text-left text-white/70 hover:text-white transition-colors py-2"
                  >
                    {link.label}
                  </button>
                ))}
                <Button
                  data-testid="button-mobile-cta"
                  onClick={() => { scrollToSection("#search"); setMobileMenuOpen(false); }}
                  className="bg-gradient-to-r from-[#00bfff] to-[#0080ff] text-white font-medium border-0 no-default-hover-elevate no-default-active-elevate mt-2"
                >
                  Собрать тур
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section id="hero" ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0"
        >
          <img
            src="/images/hero-bg.png"
            alt="Путешествие по России"
            data-testid="img-hero-bg"
            className="w-full h-full object-cover scale-110"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#242428]" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
              <span className="text-[#00bfff] text-sm font-medium tracking-widest uppercase" data-testid="text-hero-label">
                Персонализированные туры
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 font-serif"
              data-testid="text-hero-title"
            >
              Собери свой идеальный
              <br />
              <span className="bg-gradient-to-r from-[#00bfff] to-[#00e5ff] bg-clip-text text-transparent">
                тур по России!
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
              Откройте для себя величие России — от белоснежных вершин Кавказа
              до загадочных вулканов Камчатки. Мы создадим маршрут вашей мечты.
            </p>
          </motion.div>

        </motion.div>

      </section>

      <section id="search" className="relative z-20 -mt-16 sm:-mt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SearchBar onSubmit={handleSearchSubmit} isPending={submitting} />
          </motion.div>
        </div>
      </section>

      <section id="cities" className="py-20 sm:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="text-[#00bfff] text-sm font-medium tracking-widest uppercase mb-3 block" data-testid="text-cities-label">
              Направления
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif" data-testid="text-cities-title">
              Туры выходного дня
            </h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto" data-testid="text-cities-desc">
              Готовые маршруты на выходные с подробным описанием по дням
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROUTE_CARDS_DATA.map((route, i) => (
              <RouteCardComponent key={route.id} route={route} index={i} />
            ))}
          </div>
        </div>
      </section>

      <footer id="footer" className="border-t border-white/5 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#00bfff] to-[#0060cc] flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white" data-testid="text-footer-logo">
                <span className="text-[#00bfff]">Собери</span>Тур
              </span>
            </div>

            <p className="text-white/40 text-sm" data-testid="text-copyright">
              &copy; {new Date().getFullYear()} СобериТур. Все права защищены.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <a href="#" data-testid="link-social-telegram" className="w-9 h-9 rounded-md bg-white/5 flex items-center justify-center text-white/50 hover:text-[#00bfff] transition-colors hover-elevate">
                <SiTelegram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

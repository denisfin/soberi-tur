import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Compass, MapPin, Calendar, Users, Loader2, AlertCircle, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface TourParams {
  from: string;
  to: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
  childrenAges: number[];
}

export default function TourPage() {
  const [, navigate] = useLocation();
  const [tourContent, setTourContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<TourParams | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("tourParams");
    if (!stored) {
      navigate("/");
      return;
    }

    const tourParams: TourParams = JSON.parse(stored);
    setParams(tourParams);

    const cachedParams = sessionStorage.getItem("tourCachedParams");
    const cachedContent = sessionStorage.getItem("tourCachedContent");
    if (cachedContent && cachedParams && cachedParams === stored) {
      setTourContent(cachedContent);
      setLoading(false);
      return;
    }

    const generateTour = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiRequest("POST", "/api/generate-tour", tourParams);
        const data = await res.json() as { content: string };
        setTourContent(data.content);
        sessionStorage.setItem("tourCachedParams", stored);
        sessionStorage.setItem("tourCachedContent", data.content);
      } catch (err: any) {
        setError(err.message || "Произошла ошибка при генерации тура");
      } finally {
        setLoading(false);
      }
    };

    generateTour();
  }, [navigate]);

  const handleRetry = async () => {
    if (!params) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest("POST", "/api/generate-tour", params);
      const data = await res.json() as { content: string };
      setTourContent(data.content);
      const paramsStr = JSON.stringify(params);
      sessionStorage.setItem("tourCachedParams", paramsStr);
      sessionStorage.setItem("tourCachedContent", data.content);
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при генерации тура");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#242428] text-white">
      <nav className="sticky top-0 z-[100] bg-[#242428]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 shrink-0"
              data-testid="link-logo-tour"
            >
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#00bfff] to-[#0060cc] flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
                <span className="text-[#00bfff]">Собери</span>Тур
              </span>
            </button>
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white/70"
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {params && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-[#2c2c31] border-white/5 p-5 mb-8" data-testid="card-tour-params">
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00bfff] shrink-0" />
                  <span className="text-sm">
                    <span className="text-white/50">Откуда: </span>
                    <span className="font-medium" data-testid="text-tour-from">{params.from}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00bfff] shrink-0" />
                  <span className="text-sm">
                    <span className="text-white/50">Куда: </span>
                    <span className="font-medium" data-testid="text-tour-to">{params.to}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00bfff] shrink-0" />
                  <span className="text-sm" data-testid="text-tour-dates">
                    <span className="text-white/50">Даты: </span>
                    <span className="font-medium">
                      {format(new Date(params.dateFrom), "d MMM", { locale: ru })} — {format(new Date(params.dateTo), "d MMM", { locale: ru })}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#00bfff] shrink-0" />
                  <span className="text-sm" data-testid="text-tour-guests">
                    <span className="text-white/50">Группа: </span>
                    <span className="font-medium">
                      {params.guests} взр.{params.childrenAges.length > 0 ? `, ${params.childrenAges.length} дет.` : ""}
                    </span>
                  </span>
                </div>
                {params.childrenAges.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-[#00bfff] shrink-0" />
                    <span className="text-sm" data-testid="text-tour-children">
                      <span className="text-white/50">Возраст: </span>
                      <span className="font-medium">
                        {params.childrenAges.map(a => a === 0 ? "до 1" : a).join(", ")} лет
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-2 border-[#00bfff]/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#00bfff] animate-spin" />
              </div>
            </div>
            <h2 className="text-xl font-serif font-bold mb-3" data-testid="text-loading-title">
              Составляем ваш маршрут
            </h2>
            <p className="text-white/50 text-sm text-center max-w-md" data-testid="text-loading-desc">
              Наш ИИ-помощник подбирает лучшие отели, рестораны и достопримечательности для вашего путешествия. Это может занять до минуты.
            </p>
            <div className="flex gap-1 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#00bfff]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-[#2c2c31] border-white/5 p-8 text-center" data-testid="card-tour-error">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-serif font-bold mb-2">Не удалось создать маршрут</h2>
              <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">{error}</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-white/10 text-white"
                  data-testid="button-error-back"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  На главную
                </Button>
                <Button
                  onClick={handleRetry}
                  className="bg-gradient-to-r from-[#00bfff] to-[#0080ff] text-white border-0 no-default-hover-elevate no-default-active-elevate"
                  data-testid="button-error-retry"
                >
                  Попробовать снова
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {tourContent && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-[#2c2c31] border-white/5 p-6 sm:p-8" data-testid="card-tour-result">
              <div className="prose prose-invert prose-sm sm:prose-base max-w-none
                prose-headings:font-serif prose-headings:text-white
                prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:mb-6 prose-h1:text-[#00bfff]
                prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-[#00bfff]
                prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-white/80 prose-p:leading-relaxed
                prose-a:text-[#00bfff] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white
                prose-li:text-white/80
                prose-hr:border-white/10
                [&_ol]:list-decimal [&_ol]:pl-5
                [&_ul]:list-disc [&_ul]:pl-5"
                data-testid="text-tour-content"
              >
                <ReactMarkdown>{tourContent}</ReactMarkdown>
              </div>
            </Card>

            <div className="flex gap-3 justify-center flex-wrap mt-8 mb-12">
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-white/10 text-white"
                data-testid="button-result-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Новый поиск
              </Button>
              <Button
                onClick={handleRetry}
                className="bg-gradient-to-r from-[#00bfff] to-[#0080ff] text-white border-0 no-default-hover-elevate no-default-active-elevate"
                data-testid="button-result-regenerate"
              >
                Сгенерировать заново
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

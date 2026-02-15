import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Compass, MapPin, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PreGeneratedTour } from "@shared/schema";

export default function TourPreviewPage() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const [tour, setTour] = useState<PreGeneratedTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/tours/${params.id}`);
        if (!res.ok) {
          throw new Error("Тур не найден");
        }
        const data = await res.json();
        setTour(data);
      } catch (err: any) {
        setError(err.message || "Произошла ошибка при загрузке тура");
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [params.id]);

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
              data-testid="button-back"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">Назад</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#00bfff] to-[#0060cc] flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">
                <span className="text-[#00bfff]">Собери</span>Тур
              </span>
            </div>

            {tour && (
              <div className="flex items-center gap-1.5 text-white/50 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span data-testid="text-route-label">{tour.from} — {tour.to}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-md bg-[#00bfff]/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#00bfff] animate-spin" />
              </div>
            </div>
            <p className="text-white/60 text-sm">Загружаем маршрут...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-red-500/10 border-red-500/20 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-300 mb-4" data-testid="text-error">{error}</p>
              <Button
                onClick={handleBack}
                data-testid="button-back-home"
                className="bg-gradient-to-r from-[#00bfff] to-[#0080ff] text-white border-0 no-default-hover-elevate no-default-active-elevate"
              >
                Вернуться на главную
              </Button>
            </Card>
          </motion.div>
        )}

        {tour && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-[#2c2c31] border-white/5 p-6 sm:p-8 lg:p-10" data-testid="card-tour-content">
              <div className="prose prose-invert prose-sm sm:prose-base max-w-none
                prose-headings:font-serif prose-headings:text-white
                prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-0
                prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:text-[#00bfff] prose-h3:mt-8 prose-h3:mb-4
                prose-h4:text-lg prose-h4:text-white/90 prose-h4:mt-6 prose-h4:mb-3
                prose-p:text-white/70 prose-p:leading-relaxed
                prose-strong:text-white
                prose-em:text-white/50
                prose-li:text-white/70
                prose-a:text-[#00bfff] prose-a:no-underline hover:prose-a:underline
                prose-hr:border-white/10 prose-hr:my-8
                prose-ol:text-white/70
                prose-ul:text-white/70
              ">
                <ReactMarkdown>{tour.content}</ReactMarkdown>
              </div>
            </Card>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                data-testid="button-back-bottom"
                className="border-white/10 text-white/70"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к маршрутам
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

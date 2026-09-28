import { TableSession } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { RotateCcw, Sparkles, MessageCircle } from "lucide-react";
import logoHeader from "@/assets/logo-header.png";
import { clientConfig } from "@/config/clientConfig";

interface GameHeaderProps {
  session: TableSession;
  currentStep: number;
  activeMode: "game" | "feedback";
  onChangeMode: (mode: "game" | "feedback") => void;
  onOpenAdmin?: () => void;
  onResetSession: () => void;
  onOpenTableStand?: () => void;
  onSelectStep?: (step: number) => void;
}

export function GameHeader({
  session,
  currentStep,
  activeMode,
  onChangeMode,
  onResetSession,
  onSelectStep,
}: GameHeaderProps) {
  const { t } = useLanguage();

  const gameSteps = [
    { num: 1, label: t("Tus Datos", "Your Info") },
    { num: 2, label: t("El Desafío", "The Challenge") },
    { num: 3, label: t("Tu Premio", "Your Prize") },
    { num: 4, label: t("Calificación", "Review") },
  ];

  const isDebug = typeof window !== "undefined" && window.location.search.includes("debug=1");

  return (
    <header className="border-b border-gold/20 bg-background/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="shell py-3">
        {/* Barra superior limpia orientada al comensal (sin ruido backend) */}
        <div className="flex items-center justify-between gap-3 text-xs pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold tracking-wide text-foreground">
              {session.tableNumber}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground font-light">
              {t("Cortesía de la Casa", "Complimentary House Treat")}
            </span>
          </div>

          {/* Atajo discreto exclusivo para modo desarrollo (?debug=1) */}
          {isDebug && (
            <button
              onClick={onResetSession}
              type="button"
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded text-muted-foreground hover:text-foreground bg-muted/40"
              title="Debug: Reiniciar sesión"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Debug Reset</span>
            </button>
          )}
        </div>

        {/* Marca y Selector de Modo o Stepper */}
        <div className="pt-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={clientConfig.brand.logoUrl || logoHeader}
                alt={clientConfig.brand.name}
                className="h-9 w-auto object-contain brightness-0 invert-0"
              />
              <div className="border-l border-gold/30 pl-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-gold font-semibold">
                  {t("Experiencia en Mesa", "Table Experience")}
                </p>
                <p className="text-xs font-serif text-foreground/80">
                  {t("Juego de Premios & Gratitud", "Prize Game & Hospitality")}
                </p>
              </div>
            </div>

            {/* Píldoras para alternar entre Juego y Solo Feedback */}
            <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/70 text-xs">
              <button
                type="button"
                onClick={() => onChangeMode("game")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-medium ${
                  activeMode === "game"
                    ? "bg-card text-gold font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t("Juego de Premios", "Prize Game")}</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeMode("feedback")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-medium ${
                  activeMode === "feedback"
                    ? "bg-card text-gold font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{t("Solo Calificar", "Rate Only")}</span>
              </button>
            </div>
          </div>

          {/* Stepper horizontal si está en modo Juego */}
          {activeMode === "game" && (
            <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-2">
              {gameSteps.map((s) => {
                const isCompleted = s.num < currentStep;
                const isCurrent = s.num === currentStep;

                return (
                  <div key={s.num} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectStep && onSelectStep(s.num)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer hover:scale-105 ${
                        isCurrent
                          ? "bg-gold text-white shadow-xs font-semibold ring-2 ring-gold/40"
                          : isCompleted
                            ? "bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25"
                            : "bg-muted/60 text-muted-foreground/80 border border-transparent hover:bg-muted"
                      }`}
                      title={`Ir al Paso ${s.num}: ${s.label}`}
                    >
                      <span className="h-4 w-4 rounded-full flex items-center justify-center text-[10px] bg-black/10">
                        {isCompleted ? "✓" : s.num}
                      </span>
                      <span className="hidden md:inline">{s.label}</span>
                    </button>
                    {s.num < gameSteps.length && (
                      <span className="text-muted-foreground/30 text-[10px]">›</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

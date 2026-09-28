import { useState, useEffect } from "react";
import { TableSession } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Clock, QrCode, Settings, RotateCcw, Sparkles, MessageCircle } from "lucide-react";
import logoHeader from "@/assets/logo-header.png";

interface GameHeaderProps {
  session: TableSession;
  currentStep: number;
  activeMode: "game" | "feedback";
  onChangeMode: (mode: "game" | "feedback") => void;
  onOpenAdmin: () => void;
  onResetSession: () => void;
  onOpenTableStand?: () => void;
}

export function GameHeader({
  session,
  currentStep,
  activeMode,
  onChangeMode,
  onOpenAdmin,
  onResetSession,
  onOpenTableStand,
}: GameHeaderProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [session.expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const gameSteps = [
    { num: 1, label: t("Tus Datos", "Your Info") },
    { num: 2, label: t("Story IG", "IG Story") },
    { num: 3, label: t("Ruleta", "Roulette") },
    { num: 4, label: t("Premio QR", "QR Prize") },
    { num: 5, label: t("Feedback", "Feedback") },
  ];

  return (
    <header className="border-b border-gold/20 bg-background/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="shell py-4">
        {/* Barra superior de estado de sesión de pago */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold tracking-wider text-foreground">
              {session.tableNumber}
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span className="inline-flex items-center gap-1 text-gold font-medium">
              <QrCode className="h-3.5 w-3.5" />
              {t("QR de Pago Escaneado", "Scanned Payment QR")}
            </span>
            <span className="text-muted-foreground/60 hidden sm:inline">·</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3 text-muted-foreground/80" />
              {t("Expira en:", "Expires in:")}{" "}
              <strong className="text-foreground font-mono">{timeFormatted}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTableStand && (
              <button
                onClick={onOpenTableStand}
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg border border-gold/40 bg-gold/10 text-gold font-medium hover:bg-gold/20 transition-all shadow-2xs"
                title={t("Ver e imprimir cartel para la mesa o caja", "View and print placard for table or cashier")}
              >
                <QrCode className="h-3 w-3" />
                <span className="hidden sm:inline">{t("Imprimir QR", "Print QR")}</span>
              </button>
            )}
            <button
              onClick={onResetSession}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title={t("Reiniciar simulación con nueva mesa", "Reset simulation with new table")}
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">{t("Nueva Sesión", "New Session")}</span>
            </button>
            <button
              onClick={onOpenAdmin}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] rounded-lg bg-gold/10 border border-gold/40 text-gold font-medium hover:bg-gold/20 transition-all shadow-2xs"
            >
              <Settings className="h-3 w-3" />
              <span>{t("Panel Admin", "Admin Panel")}</span>
            </button>
          </div>
        </div>

        {/* Marca y Selector de Modo o Stepper */}
        <div className="pt-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={logoHeader}
                alt="Bliss Soul Bakery | Experiencia de repostería fina en Sabaneta"
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
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        isCurrent
                          ? "bg-gold text-white shadow-xs font-semibold"
                          : isCompleted
                            ? "bg-gold/15 text-gold border border-gold/30"
                            : "bg-muted/60 text-muted-foreground/60 border border-transparent"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full flex items-center justify-center text-[10px] bg-black/10">
                        {isCompleted ? "✓" : s.num}
                      </span>
                      <span className="hidden md:inline">{s.label}</span>
                    </div>
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

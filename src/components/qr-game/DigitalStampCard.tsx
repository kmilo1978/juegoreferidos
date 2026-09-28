import { StampCardState } from "@/lib/stampService";
import { Sparkles, Trophy, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface DigitalStampCardProps {
  stampCard: StampCardState;
  customerName: string;
}

export function DigitalStampCard({ stampCard, customerName }: DigitalStampCardProps) {
  const { t } = useLanguage();
  const stamps = Array.from({ length: stampCard.totalRequired }, (_, i) => i + 1);

  return (
    <div className="rounded-3xl border-2 border-gold/40 bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 p-6 text-center shadow-md relative overflow-hidden">
      {/* Detalle decorativo de fondo */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-gold/10 blur-xl pointer-events-none" />

      {/* Encabezado de la tarjeta */}
      <div className="space-y-1.5 mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/40">
          <Sparkles className="h-3 w-3" />
          <span>{t("Tarjeta de Sellos Digital", "Digital Stamp Card")}</span>
        </div>

        <h3 className="font-display text-xl text-foreground font-semibold">
          {t("¡Completa 5 visitas y gana!", "Collect 5 visits and win!")}
        </h3>
        <p className="text-xs text-muted-foreground font-light max-w-sm mx-auto">
          {t(
            "Cada vez que el personal valide tu cuenta con el PIN, sumas un sello automático en tu teléfono.",
            "Every time staff validates your bill with PIN, you earn an automatic stamp on your phone."
          )}
        </p>
      </div>

      {/* CÍRCULOS DE SELLOS */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 my-6">
        {stamps.map((index) => {
          const isStamped = index <= stampCard.currentStamps;
          const isFinal = index === stampCard.totalRequired;

          return (
            <div key={index} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 transform ${
                  isStamped
                    ? "bg-gradient-to-tr from-gold to-amber-500 text-white shadow-lg shadow-gold/30 scale-105 border-2 border-amber-300"
                    : isFinal
                    ? "border-2 border-dashed border-gold/60 bg-gold/10 text-gold"
                    : "border-2 border-dashed border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                {isStamped ? (
                  <span className="text-xl sm:text-2xl animate-fade-in">⭐</span>
                ) : isFinal ? (
                  <span className="text-xl sm:text-2xl">🎁</span>
                ) : (
                  <span className="text-xs sm:text-sm font-bold font-mono">{index}</span>
                )}
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {isStamped ? t("Listo", "Done") : isFinal ? t("Premio", "Prize") : `#${index}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* ESTADO DE PROGRESO */}
      <div className="pt-2">
        {stampCard.isRewardUnlocked ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-600 animate-bounce" />
            <span>
              {t(
                `🎉 ¡Felicidades ${customerName}! Desbloqueaste: ${stampCard.rewardTitle}`,
                `🎉 Congratulations ${customerName}! You unlocked: ${stampCard.rewardTitle}`
              )}
            </span>
          </div>
        ) : (
          <div className="space-y-2 max-w-xs mx-auto">
            <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
              <span>{t("Progreso de fidelidad", "Loyalty progress")}</span>
              <span className="font-bold text-gold">
                {stampCard.currentStamps} de {stampCard.totalRequired} sellos
              </span>
            </div>
            <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden border border-border">
              <div
                className="bg-gold h-full rounded-full transition-all duration-700"
                style={{ width: `${(stampCard.currentStamps / stampCard.totalRequired) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              {t(
                `Te faltan solo ${stampCard.totalRequired - stampCard.currentStamps} visitas para tu ${stampCard.rewardTitle}`,
                `Only ${stampCard.totalRequired - stampCard.currentStamps} visits left for your ${stampCard.rewardTitle}`
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

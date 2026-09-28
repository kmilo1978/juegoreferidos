import { useState } from "react";
import {
  StampCardState,
  StampService,
  STAMP_REWARDS_15,
  StampReward,
} from "@/lib/stampService";
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  Lock,
  Gift,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface DigitalStampCardProps {
  stampCard: StampCardState;
  customerName: string;
}

export function DigitalStampCard({
  stampCard: initialStampCard,
  customerName,
}: DigitalStampCardProps) {
  const { t } = useLanguage();
  const [selectedReward, setSelectedReward] = useState<StampReward | null>(null);
  const [showAllCatalog, setShowAllCatalog] = useState(false);
  const [activeMode, setActiveMode] = useState<10 | 15>(() => initialStampCard.mode || 15);

  const totalRequired = activeMode;
  const stamps = Array.from({ length: totalRequired }, (_, i) => i + 1);

  const handleModeChange = (mode: 10 | 15) => {
    setActiveMode(mode);
    StampService.setGlobalMode(mode);
  };

  const currentStamps = Math.min(initialStampCard.currentStamps, totalRequired);
  const currentReward = StampService.getRewardForStamp(currentStamps);
  const nextReward = StampService.getRewardForStamp(Math.min(currentStamps + 1, totalRequired));
  const isCompleted = currentStamps >= totalRequired;

  return (
    <div className="rounded-3xl border-2 border-gold/40 bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 p-5 sm:p-7 text-center shadow-lg relative overflow-hidden">
      {/* Detalle decorativo de fondo */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 rounded-full bg-gold/15 blur-2xl pointer-events-none" />

      {/* ENCABEZADO Y SELECTOR DE MODALIDAD (10 O 15 SELLOS) */}
      <div className="space-y-2 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/40">
            <Sparkles className="h-3 w-3" />
            <span>{t("Fidelización VIP", "VIP Loyalty")}</span>
          </div>

          {/* Toggle de 10 o 15 sellos */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-background border border-border text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleModeChange(10)}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeMode === 10
                  ? "bg-gold text-slate-950 font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              10 Sellos
            </button>
            <button
              type="button"
              onClick={() => handleModeChange(15)}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeMode === 15
                  ? "bg-gold text-slate-950 font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              15 Sellos (Completo)
            </button>
          </div>
        </div>

        <h3 className="font-display text-xl sm:text-2xl text-foreground font-semibold">
          {activeMode === 15
            ? t("Ruta de 15 Visitas · ¡15 Premios Diferentes!", "15 Visits Journey · 15 Unique Rewards!")
            : t("Tarjeta de 10 Visitas · 10 Premios Progresivos", "10 Visits Card · 10 Progressive Rewards")}
        </h3>
        <p className="text-xs text-muted-foreground font-light max-w-md mx-auto">
          {t(
            "Cada vez que disfrutes en mesa y el cajero valide tu cuenta con su PIN, acumulas un nuevo sello y desbloqueas un beneficio mayor.",
            "Each visit validated with PIN earns a stamp and unlocks a higher-tier culinary perk."
          )}
        </p>
      </div>

      {/* REJILLA DE CASILLAS DE SELLOS (ADAPTABLE PARA 10 O 15) */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 my-6 max-w-lg mx-auto">
        {stamps.map((index) => {
          const isStamped = index <= currentStamps;
          const isCurrent = index === currentStamps;
          const reward = StampService.getRewardForStamp(index);
          const isFinal = index === totalRequired;

          return (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedReward(reward)}
              className={`relative p-2 rounded-2xl flex flex-col items-center justify-between transition-all transform active:scale-95 border text-center ${
                isStamped
                  ? "bg-gradient-to-tr from-amber-500/25 via-gold/20 to-amber-400/30 border-gold shadow-md text-foreground"
                  : isFinal
                  ? "border-2 border-dashed border-gold/70 bg-gold/10 text-gold hover:bg-gold/20"
                  : "border-border/70 bg-background/80 text-muted-foreground hover:border-gold/40"
              }`}
            >
              {/* Insignia de sello listo */}
              {isStamped && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                  ✓
                </span>
              )}

              {/* Icono del premio */}
              <span className="text-xl sm:text-2xl my-0.5 filter drop-shadow-xs">
                {reward.icon}
              </span>

              {/* Número del sello */}
              <span className="text-[10px] font-mono font-bold">
                {isStamped ? `Sello #${index}` : `#${index}`}
              </span>

              {/* Título miniatura */}
              <span className="text-[8px] leading-tight text-muted-foreground truncate w-full mt-0.5">
                {reward.category.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {/* PREMIO SELECCIONADO EN DETALLE (INTERACTIVO AL TOCAR UN SELLO) */}
      {selectedReward && (
        <div className="p-3.5 mb-5 rounded-2xl bg-background border border-gold/40 text-left animate-fade-in flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedReward.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-gold px-2 py-0.2 rounded bg-gold/10 font-mono">
                  Sello #{selectedReward.stamp} de {totalRequired}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {selectedReward.stamp <= currentStamps ? "✓ Desbloqueado" : "🔒 Por Desbloquear"}
                </span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-foreground">
                {selectedReward.title}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {selectedReward.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedReward(null)}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted/60"
          >
            ✕
          </button>
        </div>
      )}

      {/* BARRA DE PROGRESO */}
      <div className="space-y-3 max-w-md mx-auto pt-2">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>{t("Progreso de fidelidad", "Loyalty progress")}</span>
          <span className="font-bold text-gold">
            {currentStamps} de {totalRequired} sellos ({Math.round((currentStamps / totalRequired) * 100)}%)
          </span>
        </div>

        <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden border border-border">
          <div
            className="bg-gradient-to-r from-amber-500 to-gold h-full rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${(currentStamps / totalRequired) * 100}%` }}
          />
        </div>

        {/* Tarjeta de estado actual */}
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs text-left flex items-start gap-2.5">
          <Gift className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800 block">
              {isCompleted ? "🎉 ¡Ruta Completada!" : `Próximo Beneficio (Sello #${Math.min(currentStamps + 1, totalRequired)}):`}
            </span>
            <p className="font-bold text-foreground">
              {isCompleted ? currentReward.title : nextReward.title}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isCompleted
                ? `¡Felicitaciones ${customerName}! Presenta tu código al cajero para reclamar tu premio supremo.`
                : `Te faltan solo ${totalRequired - currentStamps} visita(s) para completar la tarjeta.`}
            </p>
          </div>
        </div>

        {/* BOTÓN PARA DESPLEGAR EL CATÁLOGO COMPLETO DE LOS 15 PREMIOS */}
        <button
          type="button"
          onClick={() => setShowAllCatalog(!showAllCatalog)}
          className="w-full py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-muted/60 text-xs font-semibold text-foreground inline-flex items-center justify-center gap-2 transition-colors"
        >
          <Award className="h-4 w-4 text-gold" />
          <span>
            {showAllCatalog
              ? "Ocultar catálogo de premios"
              : `📜 Ver los ${totalRequired} premios diferentes`}
          </span>
          {showAllCatalog ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {/* CATÁLOGO COMPLETO DE PREMIOS */}
        {showAllCatalog && (
          <div className="pt-3 space-y-2 text-left animate-fade-in border-t border-border/80">
            <p className="text-[11px] text-muted-foreground font-medium text-center">
              Recompensas escalonadas para premiar cada una de tus visitas:
            </p>

            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {STAMP_REWARDS_15.slice(0, totalRequired).map((r) => {
                const isEarned = r.stamp <= currentStamps;
                return (
                  <div
                    key={r.stamp}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      isEarned
                        ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                        : r.highlight
                        ? "bg-gold/10 border-gold/50 text-foreground font-semibold"
                        : "bg-background border-border/70 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{r.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[10px] text-gold">
                            Sello #{r.stamp}
                          </span>
                          <strong className="text-foreground text-[11px]">{r.title}</strong>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{r.description}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                        isEarned
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isEarned ? "Obtenido" : "Pendiente"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

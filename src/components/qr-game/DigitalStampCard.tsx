import { useState } from "react";
import {
  StampCardState,
  StampService,
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
  Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { AddToHomeScreenModal } from "./AddToHomeScreenModal";

interface DigitalStampCardProps {
  stampCard: StampCardState;
  customerName: string;
  onOpenMissions?: () => void;
}

export function DigitalStampCard({
  stampCard: initialStampCard,
  customerName,
  onOpenMissions,
}: DigitalStampCardProps) {
  const { t } = useLanguage();
  const [selectedReward, setSelectedReward] = useState<StampReward | null>(null);
  const [showAllCatalog, setShowAllCatalog] = useState(false);
  const isHappyHourActive = StampService.isHappyHour();

  const totalRequired = 15;
  const stamps = Array.from({ length: totalRequired }, (_, i) => i + 1);

  const currentStamps = Math.min(initialStampCard.currentStamps, totalRequired);
  const currentReward = StampService.getRewardForStamp(currentStamps);
  const nextReward = StampService.getRewardForStamp(Math.min(currentStamps + 1, totalRequired));
  const nextMilestone = StampService.getNextMilestone(currentStamps);
  const isCompleted = currentStamps >= totalRequired;

  return (
    <div className="rounded-3xl border-2 border-gold/40 bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 p-5 sm:p-7 text-center shadow-lg relative overflow-hidden">
      {/* Detalle decorativo de fondo */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 rounded-full bg-gold/15 blur-2xl pointer-events-none" />

      {/* ENCABEZADO VIP */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/40">
            <Sparkles className="h-3 w-3" />
            <span>{t("Fidelización VIP · 15 Visitas", "VIP Loyalty · 15 Visits")}</span>
          </div>

          <span className="text-[11px] font-bold font-mono text-gold px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30">
            3 Hitos · Cada 5 Visitas
          </span>
        </div>

        <h3 className="font-display text-xl sm:text-2xl text-foreground font-semibold">
          {t("Tarjeta de 15 Visitas · Premios Cada 5 Sellos", "15 Visits Card · Rewards Every 5 Stamps")}
        </h3>
        <p className="text-xs text-muted-foreground font-light max-w-md mx-auto">
          {t(
            "Cada vez que disfrutes en mesa y el cajero valide tu cuenta con su PIN, acumulas un nuevo sello y desbloqueas un gran premio cada 5 visitas.",
            "Each visit validated with PIN earns a stamp and unlocks a major reward every 5 visits."
          )}
        </p>

        {/* GEMA 1: BANNER DE HORA FELIZ / HORAS MUERTAS (3:00 PM - 6:00 PM) */}
        {isHappyHourActive ? (
          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-gold/30 to-amber-500/20 border-2 border-gold text-amber-950 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm animate-pulse">
            <Zap className="h-4 w-4 text-amber-600 fill-amber-500 shrink-0" />
            <span>
              ⚡ {t("¡HORA FELIZ ACTIVA (3:00 PM - 6:00 PM)! Hoy cada visita suma DOBLE SELLO (x2) en caja.", "⚡ HAPPY HOUR ACTIVE (3:00 PM - 6:00 PM)! Visits award DOUBLE STAMPS (x2) today.")}
            </span>
          </div>
        ) : (
          <div className="mt-2 py-1.5 px-3 rounded-full bg-muted/60 text-muted-foreground text-[10px] inline-flex items-center gap-1.5 border border-border/60">
            <Zap className="h-3 w-3 text-gold" />
            <span>
              {t("Horas Felices (3 PM a 6 PM): Cada visita en la tarde otorga Doble Sello (x2)", "Happy Hours (3 PM to 6 PM): Afternoon visits earn Double Stamps (x2)")}
            </span>
          </div>
        )}

        {/* BANNER ACCESO AL CENTRO DE MISIONES Y EMBAJADORES */}
        {onOpenMissions && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-gold/40 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎯</span>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {t("¿Quieres sellos extra sin esperar a tu próxima visita?", "Want extra stamps without waiting for your next visit?")}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {t("Gana hasta +3 sellos compartiendo en TikTok, Trustpilot o WhatsApp.", "Earn up to +3 stamps reviewing on TikTok, Trustpilot or WhatsApp.")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenMissions}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-gold hover:bg-gold/90 text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            >
              {t("Ver Misiones", "Missions")} →
            </button>
          </div>
        )}
      </div>

      {/* MAPA VISUAL DE LOS 3 HITOS CADA 5 VISITAS */}
      {(() => {
        const m5 = StampService.getRewardForStamp(5) || STAMP_MILESTONES_3[0];
        const m10 = StampService.getRewardForStamp(10) || STAMP_MILESTONES_3[1];
        const m15 = StampService.getRewardForStamp(15) || STAMP_MILESTONES_3[2];
        return (
          <div className="grid grid-cols-3 gap-2 my-4 max-w-lg mx-auto text-left">
            {/* HITO 1: SELLO 5 */}
            <div
              onClick={() => setSelectedReward(m5)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                currentStamps >= 5
                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs"
                  : currentStamps >= 1
                  ? "bg-gold/10 border-gold/40 text-foreground"
                  : "bg-background/80 border-border/80 text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">{m5.icon || "🍰"}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    currentStamps >= 5 ? "bg-emerald-600 text-white" : "bg-gold/20 text-gold"
                  }`}
                >
                  {currentStamps >= 5 ? "Ganado" : "5 Sellos"}
                </span>
              </div>
              <p className="text-[11px] font-bold truncate text-foreground">{m5.title || "Hito 1: Sello 5"}</p>
              <span className="text-[10px] text-muted-foreground block truncate">
                {currentStamps >= 5 ? "✓ Reclamable" : `Faltan ${Math.max(0, 5 - currentStamps)} sellos`}
              </span>
            </div>

            {/* HITO 2: SELLO 10 */}
            <div
              onClick={() => setSelectedReward(m10)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                currentStamps >= 10
                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs"
                  : currentStamps >= 5
                  ? "bg-gold/10 border-gold/40 text-foreground"
                  : "bg-background/80 border-border/80 text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">{m10.icon || "👑"}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    currentStamps >= 10 ? "bg-emerald-600 text-white" : "bg-gold/20 text-gold"
                  }`}
                >
                  {currentStamps >= 10 ? "Ganado" : "10 Sellos"}
                </span>
              </div>
              <p className="text-[11px] font-bold truncate text-foreground">{m10.title || "Hito 2: Sello 10"}</p>
              <span className="text-[10px] text-muted-foreground block truncate">
                {currentStamps >= 10 ? "✓ Reclamable" : `Faltan ${Math.max(0, 10 - currentStamps)} sellos`}
              </span>
            </div>

            {/* HITO 3: SELLO 15 */}
            <div
              onClick={() => setSelectedReward(m15)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                currentStamps >= 15
                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs"
                  : currentStamps >= 10
                  ? "bg-gold/10 border-gold/40 text-foreground"
                  : "bg-background/80 border-border/80 text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">{m15.icon || "🌟"}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    currentStamps >= 15 ? "bg-emerald-600 text-white" : "bg-gold/20 text-gold"
                  }`}
                >
                  {currentStamps >= 15 ? "Ganado" : "15 Sellos"}
                </span>
              </div>
              <p className="text-[11px] font-bold truncate text-foreground">{m15.title || "Hito 3: Sello 15"}</p>
              <span className="text-[10px] text-muted-foreground block truncate">
                {currentStamps >= 15 ? "✓ ¡Premio Mayor!" : `Faltan ${Math.max(0, 15 - currentStamps)} sellos`}
              </span>
            </div>
          </div>
        );
      })()}

      {/* REJILLA DE CASILLAS DE 15 SELLOS (3 FILAS DE 5 COLUMNAS) */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5 my-5 max-w-lg mx-auto">
        {stamps.map((index) => {
          const isStamped = index <= currentStamps;
          const isMilestone = StampService.isPrizeStamp(index);
          const prize = StampService.getRewardForStamp(index);
          const visitIcon = StampService.getVisitIcon();

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                if (prize) {
                  setSelectedReward(prize);
                } else {
                  setSelectedReward({
                    stamp: index,
                    title: `Visita #${index} (Paso al Premio)`,
                    description: `Sello de acumulación de visitas. Recuerda que recibes un premio exclusivo cada 5 visitas (Sellos #5, #10 y #15).`,
                    category: "visita" as any,
                    icon: visitIcon || "☕",
                  });
                }
              }}
              className={`relative p-2 rounded-2xl flex flex-col items-center justify-between transition-all transform active:scale-95 border text-center ${
                isStamped
                  ? isMilestone
                    ? "bg-gradient-to-tr from-amber-500/35 via-gold/30 to-amber-400/45 border-2 border-gold shadow-md text-amber-950 font-bold"
                    : "bg-gradient-to-br from-emerald-500/25 to-emerald-600/15 border-2 border-emerald-500/80 text-emerald-950 font-bold shadow-xs"
                  : isMilestone
                  ? "border-2 border-dashed border-gold/70 bg-gold/15 text-gold hover:bg-gold/25"
                  : "border-2 border-dashed border-border/80 bg-white/80 text-muted-foreground hover:border-gold/50"
              }`}
            >
              {/* Insignia de sello completado */}
              {isStamped && (
                <span
                  className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold shadow-xs ${
                    isMilestone ? "bg-amber-600" : "bg-emerald-600"
                  }`}
                >
                  ✓
                </span>
              )}

              {/* Icono: Trofeo/Regalo para hitos, Café para visitas */}
              <span className={`my-0.5 filter drop-shadow-xs ${isMilestone ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl opacity-85"}`}>
                {isMilestone ? (prize?.icon || "🎁") : (visitIcon || "☕")}
              </span>

              {/* Número del sello */}
              <span className="text-[10px] font-mono font-bold">
                {isMilestone ? (
                  <span className="text-amber-800 font-extrabold">🎁 #{index}</span>
                ) : (
                  <span>#{index}</span>
                )}
              </span>

              {/* Etiqueta */}
              <span className="text-[8px] leading-tight truncate w-full mt-0.5 font-semibold">
                {isMilestone ? (
                  <span className="text-gold uppercase tracking-wider">¡PREMIO!</span>
                ) : (
                  <span className="text-muted-foreground">Visita</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* DETALLE DEL SELLO / PREMIO SELECCIONADO */}
      {selectedReward && (
        <div className="p-3.5 mb-5 rounded-2xl bg-background border border-gold/40 text-left animate-fade-in flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedReward.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-gold px-2 py-0.2 rounded bg-gold/10 font-mono">
                  {StampService.isPrizeStamp(selectedReward.stamp)
                    ? `🎁 Premio Sello #${selectedReward.stamp}`
                    : `Visita #${selectedReward.stamp} de 15`}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {selectedReward.stamp <= currentStamps ? "✓ Acumulado" : "🔒 Pendiente"}
                </span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-foreground mt-0.5">
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

        {/* Tarjeta de estado actual con enfoque en hitos cada 5 visitas */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-gold/10 border border-gold/40 text-amber-950 text-xs text-left flex items-start gap-3">
          <Gift className="h-5 w-5 text-gold mt-0.5 shrink-0" />
          <div className="space-y-0.5 w-full">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-900 block">
                {isCompleted
                  ? "🎉 ¡15 Visitas VIP Completadas!"
                  : `Próximo Gran Hito (Sello #${nextMilestone.targetStamp}):`}
              </span>
              {!isCompleted && (
                <span className="text-[10px] font-bold text-gold px-2 py-0.2 rounded-full bg-gold/15 font-mono">
                  Faltan {nextMilestone.remaining} visita(s)
                </span>
              )}
            </div>
            <p className="font-bold text-foreground text-xs sm:text-sm">
              {isCompleted ? currentReward.title : nextMilestone.reward.title}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isCompleted
                ? `¡Felicitaciones ${customerName}! Presenta tu código al cajero para disfrutar de tu Experiencia VIP.`
                : `${nextMilestone.reward.description}.`}
            </p>
          </div>
        </div>

        {/* GEMA 3: GUARDAR TARJETA EN PANTALLA DE INICIO (1-TAP) */}
        <div className="pt-1">
          <AddToHomeScreenModal />
        </div>

        {/* BOTÓN PARA DESPLEGAR EL CATÁLOGO DE LOS 3 GRANDES PREMIOS */}
        <button
          type="button"
          onClick={() => setShowAllCatalog(!showAllCatalog)}
          className="w-full py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-muted/60 text-xs font-semibold text-foreground inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Award className="h-4 w-4 text-gold" />
          <span>
            {showAllCatalog
              ? "Ocultar premios por visitas"
              : `📜 Ver los 3 Grandes Premios (Sellos #5, #10 y #15)`}
          </span>
          {showAllCatalog ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {/* CATÁLOGO DE LOS 3 PREMIOS EXCLUSIVOS */}
        {showAllCatalog && (
          <div className="pt-3 space-y-2 text-left animate-fade-in border-t border-border/80">
            <p className="text-[11px] text-muted-foreground font-medium text-center">
              Recibes un gran beneficio cada 5 visitas completadas en mesa:
            </p>

            <div className="space-y-2">
              {StampService.getMilestoneRewards().map((r, idx) => {
                const isEarned = r.stamp <= currentStamps;
                return (
                  <div
                    key={r.stamp}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                      isEarned
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                        : "bg-gold/10 border-gold/40 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{r.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[10px] text-gold px-1.5 py-0.2 rounded bg-gold/15">
                            Hito #{idx + 1} · {r.stamp} Visitas
                          </span>
                          <strong className="text-foreground text-xs">{r.title}</strong>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{r.description}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                        isEarned
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isEarned ? "Desbloqueado" : `Faltan ${Math.max(0, r.stamp - currentStamps)}`}
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

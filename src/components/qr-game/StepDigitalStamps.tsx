import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import {
  Sparkles,
  Trophy,
  Gift,
  Coffee,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowLeft,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { StampService, StampCardState, StampReward } from "@/lib/stampService";
import { clientConfig } from "@/config/clientConfig";
import { AddToHomeScreenModal } from "./AddToHomeScreenModal";
import { DigitalWalletPassModal } from "./DigitalWalletPassModal";

interface StepDigitalStampsProps {
  customerName?: string | undefined;
  customerWhatsapp?: string | undefined;
  onProceedToMissions: () => void;
  onBackToSecondChance?: () => void;
}

export function StepDigitalStamps({
  customerName = "Cliente VIP",
  customerWhatsapp = "",
  onProceedToMissions,
  onBackToSecondChance,
}: StepDigitalStampsProps) {
  const { t } = useLanguage();
  const cleanPhone = (customerWhatsapp || "").replace(/\D/g, "");
  const [stampCard, setStampCard] = useState<StampCardState>(() =>
    StampService.getCustomerStampCard(cleanPhone)
  );
  const [selectedReward, setSelectedReward] = useState<StampReward | null>(null);
  const [showAllCatalog, setShowAllCatalog] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const isHappyHourActive = StampService.isHappyHour();

  const totalRequired = StampService.getTotalRequired();
  const visitIcon = StampService.getVisitIcon();
  const currentStamps = Math.min(stampCard.currentStamps, totalRequired);
  const progressPercent = Math.round((currentStamps / totalRequired) * 100);
  const isCompleted = currentStamps >= totalRequired;
  const nextMilestone = StampService.getNextMilestone(currentStamps);

  const gridColsClass =
    totalRequired <= 6
      ? "grid-cols-3"
      : totalRequired <= 8
        ? "grid-cols-4"
        : totalRequired <= 10
          ? "grid-cols-5"
          : totalRequired <= 12
            ? "grid-cols-4 sm:grid-cols-6"
            : "grid-cols-5";

  useEffect(() => {
    // Sincronizar estado de sellos desde la base de datos o servicio local
    const card = StampService.getCustomerStampCard(cleanPhone);
    setStampCard(card);
  }, [cleanPhone]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5 text-left">
      {/* 1. ENCABEZADO DE LA ETAPA 7: PASAPORTE DE SELLOS VIP */}
      <Reveal delay={0}>
        <div className="flex flex-col gap-2">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-[#1c1b1f] border border-[#f2be71]/40 text-[#ffddb1] shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#f2be71]" />
            <span className="font-label-sm text-[11px] font-bold tracking-wide">
              {t("Paso 7 de 8 · Pasaporte de Fidelización VIP", "Step 7 of 8 · VIP Loyalty Passport")}
            </span>
          </div>

          <h2 className="font-headline-xl-mobile text-2xl sm:text-3xl text-[#e6e1e7] tracking-tight mt-1">
            {t("Tu Tarjeta de", "Your Digital")}{" "}
            <span className="text-[#f2be71] italic font-serif">
              {totalRequired} {t("Sellos de la Casa", "Dining Stamps")}
            </span>
          </h2>

          <p className="font-body-md text-xs sm:text-sm text-[#ccc3d8] leading-relaxed">
            {t(
              `Cada vez que visites el salón y valides tu cuenta con el personal, acumulas sellos para desbloquear beneficios gastronómicos exclusivos de la casa.`,
              `Each dining visit validated with our team earns stamps towards exclusive treats.`
            )}
          </p>

          {/* Banner de Hora Feliz / Doble Sello (3 PM - 6 PM) */}
          {isHappyHourActive ? (
            <div className="mt-1 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-gold/30 to-amber-500/20 border border-[#f2be71] text-[#ffddb1] text-xs font-semibold flex items-center gap-2 shadow-sm animate-pulse">
              <Zap className="h-4 w-4 text-[#f2be71] fill-[#f2be71] shrink-0" />
              <span>
                ⚡ {t("¡HORA FELIZ ACTIVA! Hoy cada visita en mesa suma DOBLE SELLO (x2).", "⚡ HAPPY HOUR ACTIVE! Table visits award DOUBLE STAMPS (x2) today.")}
              </span>
            </div>
          ) : (
            <div className="mt-1 py-2 px-3 rounded-xl bg-[#1c1b1f] border border-[#2b292e] text-[#ccc3d8] text-[11px] flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-[#f2be71] shrink-0" />
              <span>
                {t("Horas Felices (3 PM a 6 PM): Cada visita en la tarde te otorga Doble Sello (x2)", "Happy Hours (3 PM to 6 PM): Afternoon visits earn Double Stamps (x2)")}
              </span>
            </div>
          )}
        </div>
      </Reveal>

      {/* 2. TARJETA DIGITAL MODULAR DE SELLOS */}
      <Reveal delay={100}>
        <div className="w-full rounded-3xl bg-[#1c1b1f] border border-[#f2be71]/40 p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
          {/* Halo ambiental decorativo */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#f2be71]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Barra superior de estado */}
          <div className="flex items-center justify-between border-b border-[#2b292e] pb-3">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] uppercase tracking-wider text-[#ccc3d8]">
                {t("Titular VIP", "VIP Guest")}
              </span>
              <span className="text-sm font-bold text-[#e6e1e7]">
                {customerName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full badge-gold shadow-sm">
              <span className="font-mono text-xs font-black text-[#121115]">
                {currentStamps} / {totalRequired} {t("Sellos", "Stamps")}
              </span>
            </div>
          </div>

          {/* Cuadrícula Modular de Sellos */}
          <div className={`grid ${gridColsClass} gap-2 sm:gap-2.5 pt-1`}>
            {Array.from({ length: totalRequired }, (_, i) => i + 1).map((selloNum) => {
              const isEarned = selloNum <= currentStamps;
              const isPrize = StampService.isPrizeStamp(selloNum);
              const prizeReward = StampService.getRewardForStamp(selloNum);
              const isLast = selloNum === totalRequired;

              return (
                <div
                  key={selloNum}
                  onClick={() => {
                    if (prizeReward) setSelectedReward(prizeReward);
                  }}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                    isEarned
                      ? "badge-gold shadow-[0_0_12px_rgba(242,190,113,0.5)] scale-105 font-bold"
                      : isLast
                        ? "bg-gradient-to-tr from-[#684400] to-[#3a383d] border border-[#f2be71]/60 text-[#f2be71]"
                        : isPrize
                          ? "bg-[#2b292e] border border-[#f2be71]/60 text-[#f2be71]"
                          : "bg-[#201f23] border border-[#2b292e] text-[#ccc3d8]/40"
                  }`}
                >
                  {isEarned ? (
                    <span className="text-sm sm:text-base font-black text-[#121115]">
                      {visitIcon || "✓"}
                    </span>
                  ) : isLast ? (
                    <>
                      <Trophy className="h-4 w-4" />
                      <span className="text-[7px] font-bold mt-0.5">{selloNum} VIP</span>
                    </>
                  ) : isPrize ? (
                    <>
                      <span className="text-xs">{prizeReward?.icon || "🎁"}</span>
                      <span className="text-[8px] font-bold mt-0.5">{selloNum}</span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold">{selloNum}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal / Card desplegable al tocar un sello */}
          {selectedReward && (
            <div className="p-3.5 rounded-2xl bg-[#0f0e12] border border-[#f2be71]/50 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedReward.icon || "🎁"}</span>
                <div>
                  <p className="font-bold text-[#e6e1e7]">
                    {selectedReward.stamp <= currentStamps ? "✓ Desbloqueado: " : "🔒 Sello #" + selectedReward.stamp + ": "}
                    {selectedReward.title}
                  </p>
                  <p className="text-[11px] text-[#ccc3d8]">{selectedReward.description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReward(null)}
                className="text-[#ccc3d8] hover:text-white text-xs px-2 py-1 rounded bg-[#201f23] cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Barra de Progreso */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex justify-between text-xs text-[#ccc3d8]">
              <span>{t("Progreso de fidelidad", "Loyalty progress")}</span>
              <span className="text-[#f2be71] font-mono font-bold">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-[#0f0e12] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#363439]">
              <div
                className="badge-gold h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Tarjeta de Próximo Gran Hito */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#684400]/25 via-[#201f23] to-[#2b292e] border border-[#f2be71]/30 flex items-start gap-3">
            <Gift className="h-5 w-5 text-[#f2be71] mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#f2be71]">
                  {isCompleted
                    ? "🎉 ¡15 Sellos VIP Completados!"
                    : `Próximo Gran Hito (Sello #${nextMilestone.targetStamp}):`}
                </span>
                {!isCompleted && (
                  <span className="text-[10px] font-bold text-[#121115] px-2 py-0.2 rounded-full badge-gold font-mono">
                    Faltan {nextMilestone.remaining} visita(s)
                  </span>
                )}
              </div>
              <p className="font-bold text-[#e6e1e7] text-xs sm:text-sm">
                {isCompleted ? "Cena Doble VIP Desbloqueada" : nextMilestone.reward.title}
              </p>
              <p className="text-[11px] text-[#ccc3d8]">
                {nextMilestone.reward.description}
              </p>
            </div>
          </div>

          {/* Botón Guardar en Apple Wallet / Google Wallet */}
          <button
            type="button"
            onClick={() => setIsWalletOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0f0e12] border border-[#f2be71]/40 text-[#f2be71] hover:border-[#f2be71]/80 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 shadow-sm"
          >
            <Smartphone className="h-4 w-4 text-[#f2be71]" />
            <span>{t("📱 Guardar Tarjeta en Apple / Google Wallet", "📱 Save Card to Apple / Google Wallet")}</span>
          </button>

          {/* Opción de guardar en pantalla de inicio */}
          <AddToHomeScreenModal />

          {/* Desplegable de los Hitos */}
          <button
            type="button"
            onClick={() => setShowAllCatalog(!showAllCatalog)}
            className="w-full py-2 flex items-center justify-center gap-1.5 text-xs text-[#ccc3d8] hover:text-[#f2be71] transition-colors cursor-pointer border-t border-[#2b292e] pt-3"
          >
            <span>
              {showAllCatalog
                ? t("Ocultar catálogo de beneficios", "Hide rewards catalog")
                : t("📜 Ver Grandes Premios e Hitos Desbloqueables", "📜 View Major Rewards & Unlockable Milestones")}
            </span>
            {showAllCatalog ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showAllCatalog && (
            <div className="space-y-2 pt-1 animate-in fade-in">
              {StampService.getMilestoneRewards().map((r, idx) => {
                const isEarned = r.stamp <= currentStamps;
                return (
                  <div
                    key={r.stamp}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                      isEarned
                        ? "bg-[#684400]/30 border-[#f2be71]/60 text-[#ffddb1]"
                        : "bg-[#0f0e12] border-[#2b292e] text-[#ccc3d8]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{r.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[10px] text-[#f2be71] px-1.5 py-0.2 rounded bg-[#684400]/40">
                            Hito #{idx + 1} · {r.stamp} Visitas
                          </span>
                          <strong className="text-[#e6e1e7] text-xs">{r.title}</strong>
                        </div>
                        <p className="text-[11px] text-[#ccc3d8]/80 mt-0.5">{r.description}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        isEarned ? "badge-gold" : "bg-[#201f23] text-[#ccc3d8]/60"
                      }`}
                    >
                      {isEarned ? "Desbloqueado" : `Faltan ${Math.max(0, r.stamp - currentStamps)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Reveal>

      {/* 3. NAVEGACIÓN Y ACCIÓN PRINCIPAL AL PASO 8 (MISIONES VIP) */}
      <Reveal delay={150}>
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Botón Principal: Avanzar a la Pantalla 8 (Misiones) */}
          <button
            type="button"
            onClick={onProceedToMissions}
            className="w-full h-13 py-3 px-6 rounded-full btn-gold text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(242,190,113,0.35)] active:scale-98 transition-all cursor-pointer hover:brightness-105"
          >
            <span>{t("Ver Misiones para Ganar +Sellos (Paso 8)", "View Missions to Earn +Stamps (Step 8)")}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Botón Auxiliar: Volver al Reto de Precisión */}
          {onBackToSecondChance && (
            <button
              type="button"
              onClick={onBackToSecondChance}
              className="w-full py-2.5 text-center text-xs text-[#ccc3d8] hover:text-[#f2be71] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t("Volver al Reto de Precisión 10s (Paso 6)", "Back to 10s Challenge (Step 6)")}</span>
            </button>
          )}

          {/* Garantía de Seguridad */}
          <div className="flex items-center justify-center gap-1.5 text-center text-[#ccc3d8]/70 pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#f2be71]" />
            <span className="font-label-sm text-[11px]">
              {t("Tus sellos quedan vinculados a tu número de WhatsApp", "Your stamps remain linked to your WhatsApp number")}
            </span>
          </div>
        </div>
      </Reveal>

      {/* Modal Digital Wallet Pass */}
      <DigitalWalletPassModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        type="stamps"
        customerName={customerName}
        customerWhatsapp={customerWhatsapp}
        currentStamps={currentStamps}
        totalStamps={totalRequired}
        nextRewardTitle={nextMilestone.reward.title}
        prizeCode={`STAMP-${cleanPhone || "VIP"}`}
      />
    </div>
  );
}

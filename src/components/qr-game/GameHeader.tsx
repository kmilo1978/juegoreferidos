import { TableSession } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { RotateCcw, Sparkles, MessageCircle, Wifi } from "lucide-react";
import emblemaDorado from "@/assets/emblema-dorado.png";
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
  onOpenMissions?: () => void;
  onOpenPushPrompt?: () => void;
  onOpenKioskPortal?: () => void;
}

export function GameHeader({
  session,
  currentStep,
  activeMode,
  onChangeMode,
  onResetSession,
  onSelectStep,
  onOpenMissions,
  onOpenKioskPortal,
}: GameHeaderProps) {
  const { t, language, setLanguage } = useLanguage();

  const gameSteps = [
    { num: 1, label: t("1. Datos", "1. Info"), short: t("Datos", "Info") },
    { num: 2, label: t("2. Redes", "2. Social"), short: t("Redes", "Social") },
    { num: 3, label: t("3. Ruleta", "3. Wheel"), short: t("Ruleta", "Wheel") },
    { num: 4, label: t("4. Voucher", "4. Voucher"), short: t("Voucher", "Voucher") },
    { num: 5, label: t("5. Reputación", "5. Review"), short: t("Reseña", "Review") },
    { num: 6, label: t("6. 2ª Oportunidad", "6. 2nd Chance"), short: t("2ª Op.", "2nd Ch.") },
    { num: 7, label: t("7. Misiones VIP", "7. VIP Hub"), short: t("Misiones", "Missions") },
  ];

  const currentStepObj = gameSteps.find((s) => s.num === currentStep) || gameSteps[0];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 pt-safe bg-[#0f0e12]/92 backdrop-blur-xl border-b border-[#2b292e] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-lg md:max-w-4xl mx-auto px-3.5 sm:px-6 py-2">
        {/* FILA 1: MARCA, MESA Y ACCIONES RÁPIDAS (MOBILE OPTIMIZED) */}
        <div className="flex items-center justify-between gap-2">
          {/* Identidad de Marca & Mesa Activa */}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={clientConfig.brand.logoUrl || emblemaDorado}
              alt={clientConfig.brand.name}
              className="h-7 w-7 rounded-full object-contain shrink-0 ring-1 ring-[#f2be71]/40 p-0.5 bg-[#201f23]"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#e6e1e7] truncate tracking-tight leading-tight">
                {clientConfig.brand.name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f2be71] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f2be71]"></span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#f2be71] font-bold">
                  {session.tableNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas del Comensal */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Idioma ES / EN */}
            <button
              type="button"
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
              className="h-7 px-2 rounded-full bg-[#201f23] hover:bg-[#2b292e] border border-[#363439] text-[10px] text-[#ccc3d8] flex items-center gap-0.5 transition-colors cursor-pointer"
              title="Cambiar idioma / Switch language"
            >
              <span className={language === "es" ? "text-[#f2be71] font-bold" : "text-[#ccc3d8]"}>ES</span>
              <span className="text-[8px] text-[#ccc3d8]/40">/</span>
              <span className={language === "en" ? "text-[#f2be71] font-bold" : "text-[#ccc3d8]"}>EN</span>
            </button>

            {/* Portal Cautivo WiFi Kiosko (si está activo) */}
            {onOpenKioskPortal && (
              <button
                type="button"
                onClick={onOpenKioskPortal}
                className="h-7 px-2 rounded-full bg-[#047857]/20 hover:bg-[#047857]/30 text-[#10b981] border border-[#10b981]/40 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="WiFi VIP Kiosko"
              >
                <Wifi className="h-3 w-3 animate-pulse text-[#10b981]" />
                <span className="hidden xs:inline">WiFi</span>
              </button>
            )}

            {/* Botón Misiones VIP con Badge Destacado */}
            {onOpenMissions && (
              <button
                type="button"
                onClick={onOpenMissions}
                className="h-7 inline-flex items-center gap-1 px-2.5 rounded-full bg-[#8a4fff]/25 hover:bg-[#8a4fff]/40 text-[#d1bcff] border border-[#8a4fff]/50 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                title="Ver Misiones y Sellos VIP"
              >
                <span>🎯</span>
                <span className="font-bold">{t("Misiones", "Missions")}</span>
                <span className="bg-[#f2be71] text-[#121115] text-[8px] px-1 py-0.2 rounded-full font-black">
                  +Sellos
                </span>
              </button>
            )}

            {/* Reiniciar Demo (Icono Compacto) */}
            <button
              onClick={onResetSession}
              type="button"
              className="h-7 w-7 rounded-full text-[#ccc3d8] hover:text-[#f2be71] bg-[#201f23] hover:bg-[#2b292e] border border-[#363439] flex items-center justify-center transition-all cursor-pointer"
              title="Reiniciar la demo al Paso 1"
            >
              <RotateCcw className="h-3 w-3 text-[#f2be71]" />
            </button>
          </div>
        </div>

        {/* FILA 2: INDICADOR DE ETAPA Y BARRA SEGMENTADA (100% RESPONSIVE, CERO SCROLLBAR) */}
        <div className="pt-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            {/* Texto de la etapa actual */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="px-1.5 py-0.5 rounded-md bg-[#684400]/40 border border-[#f2be71]/30 text-[#f2be71] font-mono font-bold text-[10px]">
                {currentStep}/7
              </span>
              <span className="text-[11px] font-bold text-[#e6e1e7] truncate">
                {currentStepObj.label}
              </span>
            </div>

            {/* Selector de Modo: Juego / Calificar */}
            <div className="flex items-center p-0.5 bg-[#201f23] rounded-full border border-[#363439] shrink-0">
              <button
                type="button"
                onClick={() => onChangeMode("game")}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] transition-all font-medium cursor-pointer ${
                  activeMode === "game"
                    ? "bg-gradient-to-r from-[#f2be71] to-[#ffddb1] text-[#141317] font-bold shadow-xs"
                    : "text-[#ccc3d8] hover:text-white"
                }`}
              >
                <Sparkles className="h-2.5 w-2.5" />
                <span>{t("Juego", "Game")}</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeMode("feedback")}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] transition-all font-medium cursor-pointer ${
                  activeMode === "feedback"
                    ? "bg-gradient-to-r from-[#f2be71] to-[#ffddb1] text-[#141317] font-bold shadow-xs"
                    : "text-[#ccc3d8] hover:text-white"
                }`}
              >
                <MessageCircle className="h-2.5 w-2.5" />
                <span>{t("Calificar", "Rate")}</span>
              </button>
            </div>
          </div>

          {/* BARRA SEGMENTADA DE 7 PASOS (SIN SCROLL HORIZONTAL) */}
          {activeMode === "game" && (
            <div className="grid grid-cols-7 gap-1 w-full pt-0.5">
              {gameSteps.map((s) => {
                const isCompleted = s.num < currentStep;
                const isCurrent = s.num === currentStep;

                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => onSelectStep && onSelectStep(s.num)}
                    title={s.label}
                    className={`h-1.5 rounded-full transition-all cursor-pointer relative ${
                      isCurrent
                        ? "bg-gradient-to-r from-[#d1bcff] via-[#f2be71] to-[#ffddb1] shadow-[0_0_8px_rgba(242,190,113,0.8)] scale-y-125"
                        : isCompleted
                          ? "bg-[#f2be71] hover:brightness-110"
                          : "bg-[#252429] hover:bg-[#363439]"
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

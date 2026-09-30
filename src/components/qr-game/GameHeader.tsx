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
    <header className="fixed top-0 left-0 right-0 w-full z-50 pt-safe bg-[#0f0e12]/95 backdrop-blur-xl border-b border-[#2b292e] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      {/* Contenedor exactamente del mismo ancho (grosor) de la aplicación */}
      <div className="max-w-lg mx-auto w-full px-4 py-2 flex flex-col items-center">
        {/* 1. ARRIBA DEL LOGO: SWITCH ESPAÑOL / INGLÉS Y UTILIDADES */}
        <div className="w-full flex items-center justify-between text-xs pb-1">
          {/* Indicador de mesa activa */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f2be71] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f2be71]"></span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#f2be71] font-bold">
              {session.tableNumber}
            </span>
          </div>

          {/* Switch de Idioma ES / EN centrado arriba del logo */}
          <div className="flex items-center bg-[#201f23] p-0.5 rounded-full border border-[#363439] shadow-inner">
            <button
              type="button"
              onClick={() => setLanguage("es")}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                language === "es"
                  ? "bg-[#f2be71] text-[#121115] shadow-xs"
                  : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                language === "en"
                  ? "bg-[#f2be71] text-[#121115] shadow-xs"
                  : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          {/* Acciones auxiliares (WiFi + Reiniciar) */}
          <div className="flex items-center gap-1.5">
            {onOpenKioskPortal && (
              <button
                type="button"
                onClick={onOpenKioskPortal}
                className="h-6 w-6 rounded-full bg-[#047857]/20 text-[#10b981] border border-[#10b981]/40 flex items-center justify-center text-[10px] cursor-pointer"
                title="WiFi Kiosko"
              >
                <Wifi className="h-3 w-3 animate-pulse" />
              </button>
            )}
            <button
              type="button"
              onClick={onResetSession}
              className="h-6 w-6 rounded-full bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-[#f2be71] border border-[#363439] flex items-center justify-center transition-all cursor-pointer"
              title="Reiniciar Demo al Paso 1"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* 2. EL LOGO EN EL CENTRO Y CON MÁS PROTAGONISMO */}
        <div className="flex flex-col items-center justify-center py-1">
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#684400] via-[#f2be71] to-[#ffddb1] p-0.5 shadow-[0_0_16px_rgba(242,190,113,0.35)]">
              <img
                src={clientConfig.brand.logoUrl || emblemaDorado}
                alt={clientConfig.brand.name}
                className="w-full h-full rounded-full object-contain bg-[#141317] p-1.5"
              />
            </div>
          </div>
          <h1 className="font-headline-sm text-sm sm:text-base font-bold text-[#e6e1e7] tracking-tight mt-1 text-center">
            {clientConfig.brand.name}
          </h1>
        </div>

        {/* 3. MISIONES Y LÍNEA DE TIEMPO MÁS CORTA (DEL MISMO GROSOR/ANCHO DE LA APP) */}
        <div className="w-full pt-1 flex flex-col gap-1.5">
          {/* Fila de Controles: Misiones, Etapa y Modo */}
          <div className="flex items-center justify-between gap-2">
            {/* Botón Misiones [+Sellos] */}
            {onOpenMissions && (
              <button
                type="button"
                onClick={onOpenMissions}
                className="h-7 inline-flex items-center gap-1 px-2.5 rounded-full bg-[#8a4fff]/25 hover:bg-[#8a4fff]/40 text-[#d1bcff] border border-[#8a4fff]/50 text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                title="Ver Misiones y Sellos VIP"
              >
                <span>🎯</span>
                <span className="font-bold">{t("Misiones", "Missions")}</span>
                <span className="bg-[#f2be71] text-[#121115] text-[8px] px-1 py-0.2 rounded-full font-black">
                  +Sellos
                </span>
              </button>
            )}

            {/* Texto de la etapa actual */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="px-1.5 py-0.5 rounded-md bg-[#684400]/40 border border-[#f2be71]/30 text-[#f2be71] font-mono font-bold text-[10px]">
                {currentStep}/7
              </span>
              <span className="text-[11px] font-bold text-[#e6e1e7] truncate max-w-[130px] sm:max-w-none">
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

          {/* LÍNEA DE TIEMPO DEBAJO, MÁS CORTA Y DEL MISMO GROSOR/ANCHO */}
          {activeMode === "game" && (
            <div className="w-full max-w-xs sm:max-w-sm mx-auto grid grid-cols-7 gap-1 pt-0.5">
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

import { TableSession } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { RotateCcw, Wifi, Bell } from "lucide-react";
import emblemaDorado from "@/assets/emblema-dorado.png";
import { clientConfig } from "@/config/clientConfig";

interface GameHeaderProps {
  session: TableSession;
  currentStep: number;
  onResetSession: () => void;
  onOpenKioskPortal?: () => void;
  onOpenPushModal?: () => void;
  onStepClick?: (step: number) => void;
}

export function GameHeader({
  session,
  currentStep,
  onResetSession,
  onOpenKioskPortal,
  onOpenPushModal,
  onStepClick,
}: GameHeaderProps) {
  const { t, lang, setLang } = useLanguage();

  const gameSteps = [
    { num: 1, label: t("1. Datos", "1. Info"), short: t("Datos", "Info") },
    { num: 2, label: t("2. Redes", "2. Social"), short: t("Redes", "Social") },
    { num: 3, label: t("3. Minijuego", "3. Minigame"), short: t("Juego", "Game") },
    { num: 4, label: t("4. Voucher", "4. Voucher"), short: t("Voucher", "Voucher") },
    { num: 5, label: t("5. Reputación", "5. Review"), short: t("Reseña", "Review") },
    { num: 6, label: t("6. 2ª Oportunidad", "6. 2nd Chance"), short: t("2ª Op.", "2nd Ch.") },
    { num: 7, label: t("7. Sellos VIP", "7. VIP Stamps"), short: t("Sellos", "Stamps") },
    { num: 8, label: t("8. Misiones VIP", "8. VIP Hub"), short: t("Misiones", "Missions") },
  ];

  const currentStepObj = gameSteps.find((s) => s.num === currentStep) || gameSteps[0];
  const progressPercent = Math.round((currentStep / 8) * 100);

  return (
    <header className="sticky top-0 left-0 right-0 w-full z-50 pt-safe bg-[#0f0e12]/98 backdrop-blur-2xl border-b border-[#2b292e]/80 shadow-[0_8px_32px_rgba(0,0,0,0.65)]">
      <div className="max-w-lg mx-auto w-full px-5 sm:px-6 pt-3 pb-4 flex flex-col items-center gap-3">

        {/* 1. FILA SUPERIOR: MESA · IDIOMA · BOTONES */}
        <div className="w-full flex items-center justify-between">
          {/* Mesa activa */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--gold)]"></span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--gold)] font-bold">
              {session.tableNumber}
            </span>
          </div>

          {/* Switch ES / EN */}
          <div className="flex items-center bg-[#201f23] p-0.5 rounded-full border border-[#363439] shadow-inner">
            <button
              type="button"
              onClick={() => setLang("es")}
              className={`px-3 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                lang === "es" ? "badge-gold shadow-xs" : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                lang === "en" ? "badge-gold shadow-xs" : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          {/* Acciones auxiliares */}
          <div className="flex items-center gap-2">
            {onOpenPushModal && (
              <button
                type="button"
                onClick={onOpenPushModal}
                className="h-7 w-7 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 flex items-center justify-center cursor-pointer hover:bg-[var(--gold)]/25 transition-colors"
                title="Notificaciones VIP & Gestión de Bajas"
              >
                <Bell className="h-3.5 w-3.5" />
              </button>
            )}
            {onOpenKioskPortal && (
              <button
                type="button"
                onClick={onOpenKioskPortal}
                className="h-7 w-7 rounded-full bg-[#047857]/20 text-[#10b981] border border-[#10b981]/40 flex items-center justify-center cursor-pointer hover:bg-[#047857]/30 transition-colors"
                title="WiFi Kiosko"
              >
                <Wifi className="h-3.5 w-3.5 animate-pulse" />
              </button>
            )}
            <button
              type="button"
              onClick={onResetSession}
              className="h-7 w-7 rounded-full bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-[var(--gold)] border border-[#363439] flex items-center justify-center transition-all cursor-pointer"
              title="Reiniciar Demo al Paso 1"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* 2. LOGO + NOMBRE DE MARCA */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#684400] via-[var(--gold)] to-[var(--gold-light)] p-0.5 shadow-[0_0_16px_rgba(242,190,113,0.45)]">
            {clientConfig.brand.logoUrl && !clientConfig.brand.logoUrl.includes("emblema-dorado") ? (
              <img
                src={clientConfig.brand.logoUrl}
                alt={clientConfig.brand.name}
                className="w-full h-full rounded-full object-contain bg-[#141317] p-1"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#141317] flex items-center justify-center text-[var(--gold)] text-xl font-black">
                👑
              </div>
            )}
          </div>
          <h1 className="font-headline-sm text-xs sm:text-sm font-bold text-[#e6e1e7] tracking-tight text-center">
            {clientConfig.brand.name}
          </h1>
        </div>

        {/* 3. INDICADOR DE PASO + BARRA DE PROGRESO */}
        <div className="w-full flex flex-col gap-2 max-w-xs sm:max-w-sm">
          {/* Etiqueta del paso actual */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-md bg-[#684400]/40 border border-[var(--gold)]/30 text-[var(--gold)] font-mono font-bold text-[10px] shrink-0">
                {currentStep}/8
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-[#e6e1e7] truncate">
                {currentStepObj.label}
              </span>
            </div>
            <span className="text-[10px] text-[#ccc3d8] font-mono font-medium shrink-0 ml-2">
              {progressPercent}%
            </span>
          </div>

          {/* Barra segmentada de 8 pasos — cada una es un botón táctil */}
          <div className="grid grid-cols-8 gap-1.5 w-full">
            {gameSteps.map((s) => {
              const isCompleted = s.num < currentStep;
              const isCurrent = s.num === currentStep;
              return (
                <button
                  type="button"
                  key={s.num}
                  onClick={() => onStepClick?.(s.num)}
                  title={`${s.label}`}
                  className={`h-2.5 rounded-full transition-all cursor-pointer active:scale-95 ${
                    isCurrent
                      ? "bg-gradient-to-r from-[#d1bcff] via-[var(--gold)] to-[var(--gold-light)] shadow-[0_0_10px_rgba(242,190,113,0.85)] scale-y-110"
                      : isCompleted
                        ? "bg-[var(--gold)] hover:brightness-110"
                        : "bg-[#252429] hover:bg-[#363439]"
                  }`}
                />
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
}

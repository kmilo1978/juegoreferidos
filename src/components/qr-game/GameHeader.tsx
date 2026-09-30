import { TableSession } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { RotateCcw, Sparkles, MessageCircle, Wifi, Bell, ShieldCheck } from "lucide-react";
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
  onOpenPushPrompt,
  onOpenKioskPortal,
}: GameHeaderProps) {
  const { t, language, setLanguage } = useLanguage();

  const gameSteps = [
    { num: 1, label: t("1. Datos", "1. Info") },
    { num: 2, label: t("2. Redes", "2. Social") },
    { num: 3, label: t("3. Ruleta", "3. Wheel") },
    { num: 4, label: t("4. Voucher", "4. Voucher") },
    { num: 5, label: t("5. Reputación", "5. Review") },
    { num: 6, label: t("6. 2ª Oportunidad", "6. 2nd Chance") },
    { num: 7, label: t("7. Misiones VIP", "7. VIP Hub") },
  ];

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#0f0e12]/85 backdrop-blur-xl border-b border-[#2b292e] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5">
        {/* Barra superior de estado y accesos rápidos */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#2b292e]/60 text-xs">
          <div className="flex items-center gap-2">
            {/* Chip de Mesa En Vivo estilo Stitch */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201f23] border border-[#f2be71]/30 shadow-[0_0_12px_rgba(242,190,113,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f2be71] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f2be71]"></span>
              </span>
              <span className="font-label-sm text-[11px] text-[#f2be71] tracking-wider uppercase font-bold whitespace-nowrap">
                {session.tableNumber} • EN VIVO
              </span>
            </div>

            <span className="hidden sm:inline text-xs text-[#ccc3d8]/60">•</span>
            <span className="hidden sm:inline text-xs text-[#ccc3d8]">
              {t("Cortesía asegurada para tu mesa", "Complimentary treat guaranteed")}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Idioma ES / EN */}
            <button
              type="button"
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
              className="h-8 px-2.5 rounded-full bg-[#201f23] hover:bg-[#2b292e] border border-[#363439] text-[11px] text-[#ccc3d8] flex items-center gap-1 transition-colors cursor-pointer"
              title="Cambiar idioma / Switch language"
            >
              <span className={language === "es" ? "text-[#f2be71] font-bold" : "text-[#ccc3d8]"}>ES</span>
              <span>/</span>
              <span className={language === "en" ? "text-[#f2be71] font-bold" : "text-[#ccc3d8]"}>EN</span>
            </button>

            {/* Portal Cautivo WiFi Kiosko */}
            {onOpenKioskPortal && (
              <button
                type="button"
                onClick={onOpenKioskPortal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#047857]/20 hover:bg-[#047857]/30 text-[#10b981] border border-[#10b981]/40 text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Abrir Pantalla de Kiosko / Portal WiFi para Tablets"
              >
                <Wifi className="h-3.5 w-3.5 animate-pulse text-[#10b981]" />
                <span className="hidden xs:inline">WiFi</span>
              </button>
            )}

            {/* Misiones VIP siempre visible con badge */}
            {onOpenMissions && (
              <button
                type="button"
                onClick={onOpenMissions}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#8a4fff]/25 hover:bg-[#8a4fff]/40 text-[#d1bcff] border border-[#8a4fff]/50 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                title="Ver Misiones y Sellos VIP"
              >
                <span>🎯</span>
                <span className="font-bold">{t("Misiones", "Missions")}</span>
                <span className="bg-[#f2be71] text-[#121115] text-[9px] px-1.5 py-0.2 rounded-full font-black">
                  +Sellos
                </span>
              </button>
            )}

            {/* Reiniciar Demo */}
            <button
              onClick={onResetSession}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-[#ccc3d8] hover:text-[#f2be71] bg-[#201f23] hover:bg-[#2b292e] border border-[#363439] transition-all cursor-pointer"
              title="Reiniciar la demo al Paso 1 (Tus Datos)"
            >
              <RotateCcw className="h-3 w-3 text-[#f2be71]" />
              <span className="hidden sm:inline">{t("Reiniciar", "Reset")}</span>
            </button>
          </div>
        </div>

        {/* Marca de cabecera y Stepper de etapas */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src={clientConfig.brand.logoUrl || logoHeader}
                alt={clientConfig.brand.name}
                className="h-8 w-auto object-contain brightness-110"
              />
              <div className="border-l border-[#f2be71]/30 pl-2.5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#f2be71] font-bold">
                  {clientConfig.brand.name}
                </p>
                <p className="text-[11px] font-sans text-[#ccc3d8]/80 leading-tight">
                  {t("Experiencia Gastronómica & Fidelización", "Fine Dining Loyalty Experience")}
                </p>
              </div>
            </div>

            {/* Alternar Juego / Feedback */}
            <div className="flex items-center p-0.5 bg-[#201f23] rounded-full border border-[#363439] text-xs">
              <button
                type="button"
                onClick={() => onChangeMode("game")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-all font-medium ${
                  activeMode === "game"
                    ? "bg-gradient-to-r from-[#f2be71] to-[#ffddb1] text-[#141317] font-bold shadow-xs"
                    : "text-[#ccc3d8] hover:text-white"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>{t("Juego", "Game")}</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeMode("feedback")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-all font-medium ${
                  activeMode === "feedback"
                    ? "bg-gradient-to-r from-[#f2be71] to-[#ffddb1] text-[#141317] font-bold shadow-xs"
                    : "text-[#ccc3d8] hover:text-white"
                }`}
              >
                <MessageCircle className="h-3 w-3" />
                <span>{t("Calificar", "Rate")}</span>
              </button>
            </div>
          </div>

          {/* Stepper Horizontal de 7 Etapas */}
          {activeMode === "game" && (
            <div className="flex items-center justify-between sm:justify-end gap-1 overflow-x-auto py-0.5 no-scrollbar">
              {gameSteps.map((s) => {
                const isCompleted = s.num < currentStep;
                const isCurrent = s.num === currentStep;

                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => onSelectStep && onSelectStep(s.num)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? "bg-[#f2be71] text-[#141317] font-bold shadow-[0_0_12px_rgba(242,190,113,0.4)] scale-105"
                        : isCompleted
                          ? "bg-[#201f23] text-[#f2be71] border border-[#f2be71]/40 hover:bg-[#2b292e]"
                          : "bg-[#1c1b1f] text-[#ccc3d8]/60 border border-transparent hover:text-[#e6e1e7]"
                    }`}
                    title={`Paso ${s.num}: ${s.label}`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-[9px] bg-black/20">
                      {isCompleted ? "✓" : s.num}
                    </span>
                    <span className="hidden md:inline">{s.label.split(".")[1]}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

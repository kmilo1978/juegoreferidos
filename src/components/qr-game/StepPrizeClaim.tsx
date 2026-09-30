import { useState, useEffect } from "react";
import { WonPrize, SecondChanceConfig } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { GoldenQRCode } from "./GoldenQRCode";
import {
  Sparkles,
  Copy,
  Check,
  Hourglass,
  Lock,
  Share2,
  ArrowRight,
  MessageCircle,
  Trophy,
} from "lucide-react";
import { waLink } from "@/data/site";
import { clientConfig } from "@/config/clientConfig";

interface StepPrizeClaimProps {
  prize: WonPrize;
  onValidateAtCashier: () => void;
  secondChanceConfig?: SecondChanceConfig | undefined;
  onUnlockSecondChance?: (() => void) | undefined;
  onOpenMissions?: () => void;
  onProceedToFeedback?: () => void;
}

export function StepPrizeClaim({
  prize,
  onValidateAtCashier,
  onUnlockSecondChance,
  onOpenMissions,
  onProceedToFeedback,
}: StepPrizeClaimProps) {
  const { lang, t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState(false);

  const isUsed = prize.status === "UTILIZADO";
  const prizeDisplayName = lang === "en" ? prize.prizeNameEn : prize.prizeName;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(prize.uniqueCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const brandName = clientConfig.brand.name;
    const msg = `🎉 ¡Hola! Me gané un *${prizeDisplayName}* en mi mesa en *${brandName}* con el código ${prize.uniqueCode}.`;
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Ticket Perforado de Lujo estilo Stitch */}
      <Reveal delay={50}>
        <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#2a2215] via-[#1e1b24] to-[#17151e] border border-[#f2be71]/35 shadow-[0_16px_40px_rgba(0,0,0,0.75)] overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#f2be71]/15 blur-2xl pointer-events-none" />

          {/* Sección Superior del Ticket */}
          <div className="p-6 flex flex-col items-center text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2be71]/15 text-[#f2be71] mb-3 border border-[#f2be71]/30">
              <Sparkles className="h-3.5 w-3.5 text-[#f2be71]" />
              <span className="font-label-sm text-[10px] tracking-wider uppercase font-bold">
                {t("Voucher Exclusivo de Mesa", "Exclusive Table Voucher")}
              </span>
            </div>

            <h2 className="font-headline-lg text-2xl sm:text-3xl text-[#ffddb1] font-bold mb-1">
              {prizeDisplayName}
            </h2>
            <p className="font-body-sm text-xs text-[#ccc3d8] italic mb-4">
              {t("Válido de inmediato con la cuenta de tu mesa", "Valid immediately with your table bill")}
            </p>

            {/* Código Único con Toque para Copiar */}
            <div className="flex items-center justify-between w-full max-w-[270px] bg-[#0f0e12]/80 border border-[#363439] px-4 py-2 rounded-xl mb-4">
              <span className="font-label-sm text-[10px] text-[#ccc3d8] tracking-wider uppercase">
                {t("Código:", "Code:")}
              </span>
              <span className="font-headline-sm text-base text-[#f2be71] tracking-widest font-mono font-bold">
                {prize.uniqueCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="w-7 h-7 rounded-lg bg-[#201f23] flex items-center justify-center text-[#ccc3d8] hover:text-white transition-colors cursor-pointer"
                title="Copiar código"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-[#10b981]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Marco de Código QR de Alta Calidad */}
            <div className="relative p-3 rounded-2xl bg-[#0f0e12] border border-[#f2be71]/30 shadow-inner flex flex-col items-center justify-center">
              <GoldenQRCode
                value={`https://${clientConfig.brand.name.toLowerCase().replace(/\s+/g, "")}.com/validar?code=${prize.uniqueCode}`}
                size={170}
              />
            </div>
          </div>

          {/* Línea de Perforación de Ticket con Semicírculos Laterales estilo Stitch */}
          <div className="relative w-full h-8 flex items-center justify-between px-0 overflow-hidden bg-transparent">
            <div className="w-5 h-8 bg-[#141317] rounded-r-full -ml-2.5 border-r border-[#f2be71]/30" />
            <div className="flex-1 border-t-2 border-dashed border-[#4a4455]/60 mx-2" />
            <div className="w-5 h-8 bg-[#141317] rounded-l-full -mr-2.5 border-l border-[#f2be71]/30" />
          </div>

          {/* Sección Inferior del Ticket */}
          <div className="p-5 pt-2 flex flex-col items-center gap-3 text-center relative z-10">
            {/* Pastilla de Temporizador */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#684400]/40 border border-[#f2be71]/30 text-[#f2be71]">
              <Hourglass className="h-3.5 w-3.5 animate-pulse" />
              <span className="font-label-md text-xs font-semibold tracking-wide">
                {isUsed ? t("Canjeado en Mesa", "Redeemed at Table") : t("Válido para la visita de hoy", "Valid for today's visit")}
              </span>
            </div>

            <p className="font-body-sm text-xs text-[#ccc3d8] max-w-[280px]">
              {t(
                "Muestra este código al mesero o en caja al momento de pedir tu cuenta.",
                "Present this code to your waiter or at the cashier when asking for the bill."
              )}
            </p>

            {/* Botón de Canje para el Personal de Caja */}
            <button
              type="button"
              onClick={onValidateAtCashier}
              disabled={isUsed}
              className={`w-full h-12 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                isUsed
                  ? "bg-[#047857]/40 text-[#10b981] border border-[#10b981]/40"
                  : "btn-purple hover:brightness-105 active:scale-95 shadow-[0_4px_20px_rgba(138,79,255,0.4)]"
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>
                {isUsed
                  ? t("✓ PREMIO VALIDADO EN CAJA", "✓ PRIZE VALIDATED AT CASHIER")
                  : t("Canjear en Caja / Mesero (PIN)", "Redeem at Cashier / Waiter (PIN)")}
              </span>
            </button>
          </div>
        </div>
      </Reveal>

      {/* Acciones para Continuar el Embudo */}
      <Reveal delay={100}>
        <div className="flex flex-col gap-2.5">
          {/* Botón hacia el Paso 5: Calificación & Reputación */}
          {onProceedToFeedback && (
            <button
              type="button"
              onClick={onProceedToFeedback}
              className="w-full h-13 py-3 px-6 rounded-full btn-gold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(242,190,113,0.35)] active:scale-98 transition-all cursor-pointer hover:brightness-105"
            >
              <span>{t("Calificar Visita & Desbloquear 2ª Oportunidad", "Rate Visit & Unlock 2nd Chance")}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {/* Botón hacia la 2ª Oportunidad directa */}
          {onUnlockSecondChance && (
            <button
              type="button"
              onClick={onUnlockSecondChance}
              className="w-full h-12 rounded-full btn-outline-gold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <Trophy className="h-4 w-4 text-[#f2be71]" />
              <span>{t("Probar Reto de Precisión 10.00s (2ª Oportunidad)", "Try 10.00s Precision Challenge (2nd Chance)")}</span>
            </button>
          )}

          {/* Botón hacia Misiones VIP */}
          {onOpenMissions && (
            <button
              type="button"
              onClick={onOpenMissions}
              className="w-full h-12 rounded-full btn-outline-gold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <span>🎯</span>
              <span>{t("Ver Centro de Misiones & 15 Sellos VIP", "View VIP Missions & 15 Stamps Hub")}</span>
            </button>
          )}

          {/* Compartir por WhatsApp */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-2.5 text-center text-xs text-[#ccc3d8] hover:text-[#f2be71] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5 text-[#f2be71]" />
            <span>{t("Compartir mi premio por WhatsApp", "Share my prize on WhatsApp")}</span>
          </button>
        </div>
      </Reveal>
    </div>
  );
}

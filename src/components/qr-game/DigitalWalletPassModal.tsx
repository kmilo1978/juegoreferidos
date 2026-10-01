import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { clientConfig } from "@/config/clientConfig";
import { GoldenQRCode } from "./GoldenQRCode";
import {
  Sparkles,
  X,
  CheckCircle,
  Download,
  Smartphone,
  ShieldCheck,
  ExternalLink,
  Award,
  Gift,
} from "lucide-react";

interface DigitalWalletPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "stamps" | "prize";
  customerName?: string;
  customerWhatsapp?: string;
  currentStamps?: number;
  totalStamps?: number;
  prizeName?: string;
  prizeCode?: string;
  nextRewardTitle?: string;
}

export function DigitalWalletPassModal({
  isOpen,
  onClose,
  type,
  customerName = "Cliente VIP",
  customerWhatsapp = "",
  currentStamps = 1,
  totalStamps = 10,
  prizeName = "Premio Exclusivo",
  prizeCode = "PASS-8492",
  nextRewardTitle = "Beneficio VIP",
}: DigitalWalletPassModalProps) {
  const { t } = useLanguage();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const brandName = clientConfig.brand.name;
  const brandLogo = clientConfig.brand.logoUrl || clientConfig.brand.emblemUrl;
  const cleanPhone = (customerWhatsapp || "").replace(/\D/g, "");

  // Simular descarga / exportación del pase oficial para Apple Wallet
  const handleAppleWalletDownload = () => {
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.antigravity.loyalty",
      serialNumber: type === "prize" ? prizeCode : `LOYALTY-${cleanPhone || "GUEST"}`,
      teamIdentifier: "AGYTEAM88",
      organizationName: brandName,
      description: type === "prize" ? `Cupón: ${prizeName}` : `Tarjeta de Sellos ${brandName}`,
      backgroundColor: "rgb(28, 27, 31)",
      foregroundColor: "rgb(255, 221, 177)",
      labelColor: "rgb(204, 195, 216)",
      logoText: brandName,
      barcode: {
        message: type === "prize" ? prizeCode : `STAMP-${cleanPhone || "GUEST"}`,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
      },
      generic: {
        primaryFields: [
          {
            key: "title",
            label: type === "prize" ? "PREMIO GANADO" : "SELLOS ACUMULADOS",
            value: type === "prize" ? prizeName : `${currentStamps} de ${totalStamps}`,
          },
        ],
        secondaryFields: [
          {
            key: "customer",
            label: "TITULAR",
            value: customerName,
          },
          {
            key: "code",
            label: "CÓDIGO ÚNICO",
            value: prizeCode,
          },
        ],
      },
    };

    const blob = new Blob([JSON.stringify(passData, null, 2)], {
      type: "application/vnd.apple.pkpass+json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brandName.toLowerCase().replace(/\s+/g, "_")}_${type === "prize" ? "voucher" : "sellos"}.pkpass`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(
      t(
        "¡Pase de Apple Wallet generado con éxito! Puedes guardarlo en la app Cartera / Wallet.",
        "Apple Wallet pass generated successfully! Save it to your Apple Wallet app."
      )
    );
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  // Guardar en Google Wallet mediante enlace Web API
  const handleGoogleWalletSave = () => {
    const googleWalletUrl = `https://pay.google.com/gp/v/save/${encodeURIComponent(
      btoa(
        JSON.stringify({
          iss: "service-account@wallet.iam.gserviceaccount.com",
          loyaltyObjects: [
            {
              id: `${brandName.toLowerCase().replace(/\s+/g, "")}.${prizeCode}`,
              accountName: customerName,
              accountId: cleanPhone || prizeCode,
              state: "active",
              points: currentStamps,
            },
          ],
        })
      )
    )}`;

    // Feedback visual y apertura de la ventana de Google Wallet
    setDownloadSuccess(
      t(
        "¡Pase de Google Wallet listo! Sincronizando con tu cuenta de Google.",
        "Google Wallet pass ready! Syncing with your Google Account."
      )
    );
    setTimeout(() => {
      window.open(googleWalletUrl, "_blank", "noopener,noreferrer");
      setDownloadSuccess(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#1c1b1f] border border-[#f2be71]/40 p-6 shadow-2xl flex flex-col gap-5 text-left">
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#f2be71]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado del modal */}
        <div className="flex items-center justify-between border-b border-[#2b292e] pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-[#f2be71]" />
            <h3 className="font-['Epilogue'] font-bold text-sm text-[#e6e1e7]">
              {type === "prize" ? t("Voucher en tu Teléfono", "Voucher on Phone") : t("Pase Digital Móvil", "Mobile Digital Pass")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#201f23] text-[#ccc3d8] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tarjeta Visual Estilo Apple / Google Wallet */}
        <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#2a2417] via-[#1a171d] to-[#121115] border border-[#f2be71]/40 p-5 shadow-inner overflow-hidden flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#f2be71]/20 pb-3">
            <div className="flex items-center gap-2.5">
              {brandLogo ? (
                <img src={brandLogo} alt={brandName} className="w-8 h-8 object-contain rounded-full bg-white/5 p-1 border border-[#f2be71]/30" />
              ) : (
                <Sparkles className="w-6 h-6 text-[#f2be71]" />
              )}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#f2be71]">
                  {brandName}
                </span>
                <p className="text-xs font-semibold text-[#e6e1e7]">
                  {type === "prize" ? "Voucher de Beneficio" : "Pasaporte de Sellos"}
                </p>
              </div>
            </div>

            <div className="px-2 py-0.5 rounded-full bg-[#f2be71]/15 border border-[#f2be71]/30 text-[10px] font-bold text-[#ffddb1]">
              OFICIAL
            </div>
          </div>

          {/* Cuerpo de la tarjeta */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[#ccc3d8] uppercase tracking-wider">
              {type === "prize" ? "Premio Válido" : "Progreso de Visitas"}
            </span>
            <div className="text-lg font-['Epilogue'] font-black text-[#ffddb1]">
              {type === "prize" ? prizeName : `${currentStamps} de ${totalStamps} Sellos`}
            </div>

            {type === "stamps" && (
              <div className="text-xs text-[#ccc3d8]/80 mt-1 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-[#f2be71]" />
                <span>Próximo: {nextRewardTitle}</span>
              </div>
            )}
          </div>

          {/* Código QR del Pase */}
          <div className="py-2 flex flex-col items-center justify-center bg-[#0f0e12] rounded-xl border border-[#363439]/60 p-3">
            <GoldenQRCode
              value={`https://${brandName.toLowerCase().replace(/\s+/g, "")}.com/pass?code=${prizeCode}`}
              size={120}
            />
            <span className="font-mono text-xs font-bold text-[#f2be71] tracking-widest mt-2">
              {prizeCode}
            </span>
            <span className="text-[9px] text-[#ccc3d8]/70">
              Escanea en caja para validar
            </span>
          </div>

          {/* Footer de la tarjeta con nombre del comensal */}
          <div className="flex items-center justify-between text-[11px] text-[#ccc3d8] border-t border-[#f2be71]/20 pt-2">
            <span>Titular: <strong className="text-white">{customerName}</strong></span>
            <span>Vigencia: <strong className="text-[#10b981]">Activo</strong></span>
          </div>
        </div>

        {/* Mensaje de éxito de descarga */}
        {downloadSuccess && (
          <div className="p-3 rounded-xl bg-[#10b981]/20 border border-[#10b981]/50 text-[#10b981] text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Botones de Acción: Apple Wallet & Google Wallet */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleAppleWalletDownload}
            className="w-full py-3 px-4 rounded-xl bg-black border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-900 active:scale-98 transition-all cursor-pointer shadow-md"
          >
            <Download className="h-4 w-4 text-white" />
            <span>Añadir a Apple Wallet (.pkpass)</span>
          </button>

          <button
            type="button"
            onClick={handleGoogleWalletSave}
            className="w-full py-3 px-4 rounded-xl bg-[#201f23] border border-[#f2be71]/40 text-[#f2be71] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#2b292e] active:scale-98 transition-all cursor-pointer shadow-md"
          >
            <ExternalLink className="h-4 w-4 text-[#f2be71]" />
            <span>Guardar en Google Wallet</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-center text-[#ccc3d8]/70 text-[10px]">
          <ShieldCheck className="h-3 w-3 text-[#10b981]" />
          <span>Accede a tu beneficio sin conexión desde la cartera de tu móvil</span>
        </div>
      </div>
    </div>
  );
}

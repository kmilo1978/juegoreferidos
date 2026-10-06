import { useMemo, useState } from "react";
import {
  Wand2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  QrCode,
  Palette,
  Building2,
  Phone,
  Image as ImageIcon,
  Smartphone,
} from "lucide-react";

/**
 * Generador de Demo Personalizado "desde la calle".
 *
 * Un comercial frente a un cliente potencial introduce nombre, color, teléfono
 * y (opcional) una URL de logo. La herramienta arma un enlace autoconfigurable
 * (?demo=true&brand=&color=&tel=&logo=) que, al abrirse, muestra la app con la
 * marca del prospecto aplicada en vivo (ver branding por querystring en
 * src/config/clientConfig.ts). Entrega enlace copiable, QR y envío por WhatsApp.
 */
export function DemoGenerator() {
  const [brandName, setBrandName] = useState("");
  const [color, setColor] = useState("#f2be71");
  const [tel, setTel] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [tagline, setTagline] = useState("");
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://tudominio.com";

  // Construye el enlace del demo con los parámetros de marca
  const demoUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("demo", "true");
    if (brandName.trim()) params.set("brand", brandName.trim());
    if (color) params.set("color", color.replace("#", ""));
    const cleanTel = tel.replace(/[^0-9]/g, "");
    if (cleanTel) params.set("tel", cleanTel);
    if (logoUrl.trim() && /^https?:\/\//i.test(logoUrl.trim())) {
      params.set("logo", logoUrl.trim());
    }
    if (tagline.trim()) params.set("tagline", tagline.trim());
    return `${origin}/?${params.toString()}`;
  }, [brandName, color, tel, logoUrl, tagline, origin]);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    demoUrl
  )}&color=${color.replace("#", "")}&bgcolor=1c1b1f&margin=12`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(demoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappShareUrl = useMemo(() => {
    const cleanTel = tel.replace(/[^0-9]/g, "");
    const msg = `¡Hola${brandName.trim() ? ` ${brandName.trim()}` : ""}! 👋 Te comparto una demo personalizada de cómo se vería tu sistema de fidelización y juegos en mesa:\n\n${demoUrl}\n\nÁbrela desde tu celular para probarla. 🎁`;
    const base = cleanTel ? `https://wa.me/${cleanTel}` : "https://wa.me/";
    return `${base}?text=${encodeURIComponent(msg)}`;
  }, [demoUrl, tel, brandName]);

  const isReady = brandName.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue'] flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-[var(--gold)]" />
          <span>Generador de Demo Personalizado</span>
        </h2>
        <p className="text-sm text-[#ccc3d8] mt-0.5">
          Crea un demo en vivo con la marca del cliente en segundos. Comparte el enlace o el QR
          y el prospecto verá la app con su nombre, color y datos aplicados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* COLUMNA 1: FORMULARIO */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#363439] pb-3 font-['Epilogue']">
            <Building2 className="w-4 h-4 text-[var(--gold)]" />
            <span>Datos del Cliente Potencial</span>
          </h3>

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[var(--gold)]" />
              Nombre del Restaurante / Negocio *
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ej: Café Luna"
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm focus:border-[var(--gold)] focus:outline-none"
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[var(--gold)]" />
              Color de Marca
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-11 w-14 rounded-xl border border-[#363439] cursor-pointer p-0.5 bg-[#201f23]"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 flex-1 text-sm font-mono uppercase focus:border-[var(--gold)] focus:outline-none"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
              WhatsApp del Negocio (con código de país)
            </label>
            <input
              type="tel"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              placeholder="Ej: 573001234567"
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm font-mono focus:border-[var(--gold)] focus:outline-none"
            />
          </div>

          {/* Logo URL (opcional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[var(--gold)]" />
              URL del Logo (opcional)
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://.../logo.png"
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm focus:border-[var(--gold)] focus:outline-none"
            />
            <span className="text-[10px] text-[#958da1]">
              Debe ser una imagen ya publicada en internet (URL pública). Si lo dejas vacío, se usa el emblema por defecto.
            </span>
          </div>

          {/* Tagline (opcional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider">
              Eslogan (opcional)
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ej: Sabores que enamoran"
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm focus:border-[var(--gold)] focus:outline-none"
            />
          </div>
        </div>

        {/* COLUMNA 2: RESULTADO (ENLACE + QR + COMPARTIR) */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#363439] pb-3 font-['Epilogue']">
            <QrCode className="w-4 h-4 text-[var(--gold)]" />
            <span>Demo Listo para Compartir</span>
          </h3>

          {!isReady ? (
            <div className="text-center py-10 text-[#958da1] text-sm">
              Escribe al menos el <strong className="text-[#ccc3d8]">nombre del negocio</strong> para generar el demo.
            </div>
          ) : (
            <>
              {/* QR */}
              <div className="flex flex-col items-center justify-center p-4 bg-[#141317] rounded-xl border border-[#363439]">
                <img
                  src={qrImageUrl}
                  alt={`Código QR del demo de ${brandName}`}
                  className="w-52 h-52 rounded-lg shadow-md border border-[var(--gold)]/30 p-1 bg-[#1c1b1f]"
                />
                <span className="text-[11px] text-[var(--gold)] font-mono mt-2 font-bold text-center">
                  Escanea para abrir el demo de {brandName}
                </span>
              </div>

              {/* Enlace */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#958da1] uppercase block">
                  Enlace del demo
                </label>
                <div className="bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2.5 text-[11px] text-[#e6e1e7] font-mono break-all">
                  {demoUrl}
                </div>
              </div>

              {/* Acciones */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-[#201f23] border border-[#363439] hover:bg-[#2b292e] text-[#ccc3d8] text-xs font-bold rounded-xl px-3 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4 text-[var(--gold)]" />}
                  <span>{copied ? "Copiado" : "Copiar"}</span>
                </button>

                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#201f23] border border-[#363439] hover:bg-[#2b292e] text-[#ccc3d8] text-xs font-bold rounded-xl px-3 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-[var(--gold)]" />
                  <span>Abrir</span>
                </a>

                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#10b981]/15 border border-[#10b981]/40 hover:bg-[#10b981]/25 text-[#10b981] text-xs font-bold rounded-xl px-3 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-[#958da1] pt-1 border-t border-[#363439]/50">
                <Smartphone className="w-3.5 h-3.5 text-[var(--gold)] shrink-0 mt-0.5" />
                <span>
                  Al abrir el enlace, la app se personaliza sola con estos datos (sin iniciar sesión).
                  Ideal para mostrarlo en vivo desde tu celular o enviarlo por WhatsApp al prospecto.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  Loader2,
  Star,
  Save,
  ShieldAlert,
  ExternalLink,
  ThumbsUp,
  Heart,
  Coffee,
  Utensils,
  Smile,
  Sparkles,
  Smartphone,
  MessageCircle,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";
import { ImageUploader } from "../components/ImageUploader";

export function Reputation() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulario editable
  const [googleMapsUrl, setGoogleMapsUrl] = useState("https://maps.google.com");
  const [whatsappManager, setWhatsappManager] = useState("573001234567");
  const [minStarsGoogle, setMinStarsGoogle] = useState(4);
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [ratingIcon, setRatingIcon] = useState<"star" | "heart" | "coffee" | "dish" | "emoji">("star");

  // Mensajes desplegables para 1, 2 y 3 estrellas (Privado / Quejas)
  const [lowRatingTitle, setLowRatingTitle] = useState("¿En qué podemos mejorar?");
  const [lowRatingMessage, setLowRatingMessage] = useState(
    "Lamentamos que tu visita no haya sido perfecta hoy. Déjanos tus comentarios para que la gerencia pueda atenderlo de inmediato."
  );
  const [lowRatingWhatsappText, setLowRatingWhatsappText] = useState(
    "Hola, quiero compartir una sugerencia confidencial sobre mi visita en mesa: "
  );

  // Mensajes desplegables para 4 y 5 estrellas (Público / Google Maps)
  const [highRatingTitle, setHighRatingTitle] = useState("¡Nos alegra que hayas disfrutado!");
  const [highRatingMessage, setHighRatingMessage] = useState(
    "Ayúdanos con 1 minuto de tu tiempo compartiendo tu recomendación en Google Maps para que más personas nos conozcan y desbloquea el Reto de Precisión."
  );
  const [highRatingCtaText, setHighRatingCtaText] = useState("Publicar Reseña en Google Maps ⭐⭐⭐⭐⭐");

  // Estado para la vista previa interactiva móvil
  const [previewRating, setPreviewRating] = useState(5);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/reputation");
      if (!res.ok) throw new Error("Error al obtener datos de reputación");
      const json = await res.json();
      setData(json);

      if (json.config) {
        if (json.config.googleBusinessUrl) setGoogleMapsUrl(json.config.googleBusinessUrl);
        if (json.config.googleMapsUrl) setGoogleMapsUrl(json.config.googleMapsUrl);
        if (json.config.whatsappPrivateNumber) setWhatsappManager(json.config.whatsappPrivateNumber);
        if (json.config.whatsappManager) setWhatsappManager(json.config.whatsappManager);
        if (json.config.minRatingForGoogle) setMinStarsGoogle(json.config.minRatingForGoogle);
        if (json.config.minStarsGoogle) setMinStarsGoogle(json.config.minStarsGoogle);
        if (json.config.customLogoUrl) setCustomLogoUrl(json.config.customLogoUrl);
        if (json.config.ratingIcon) setRatingIcon(json.config.ratingIcon);

        if (json.config.lowRatingTitle) setLowRatingTitle(json.config.lowRatingTitle);
        if (json.config.lowRatingMessage) setLowRatingMessage(json.config.lowRatingMessage);
        if (json.config.lowRatingWhatsappText) setLowRatingWhatsappText(json.config.lowRatingWhatsappText);

        if (json.config.highRatingTitle) setHighRatingTitle(json.config.highRatingTitle);
        if (json.config.highRatingMessage) setHighRatingMessage(json.config.highRatingMessage);
        if (json.config.highRatingCtaText) setHighRatingCtaText(json.config.highRatingCtaText);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        googleBusinessUrl: googleMapsUrl,
        googleMapsUrl,
        whatsappPrivateNumber: whatsappManager,
        whatsappManager,
        minRatingForGoogle: minStarsGoogle,
        minStarsGoogle,
        customLogoUrl,
        ratingIcon,
        lowRatingTitle,
        lowRatingMessage,
        lowRatingWhatsappText,
        highRatingTitle,
        highRatingMessage,
        highRatingCtaText,
      };

      const res = await fetch("/api/reputation/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar configuración");
      setSuccess("¡Configuración del embudo de calificación guardada correctamente!");
      setTimeout(() => setSuccess(null), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  const avgRating = data?.stats?.averageRating || data?.stats?.avgRating || "5.0";
  const totalReviews = data?.stats?.total || 0;
  const googleRedirects = data?.stats?.googleCount || 0;
  const privateFeedbacks = data?.stats?.whatsappCount || 0;
  const protectionRate = data?.stats?.protectionRate || 100;

  // Renderizador de iconos de puntuación
  const renderIcon = (idx: number, isSelected: boolean) => {
    switch (ratingIcon) {
      case "heart":
        return <Heart className={`w-6 h-6 ${isSelected ? "text-red-500 fill-red-500" : "text-zinc-600"}`} />;
      case "coffee":
        return <Coffee className={`w-6 h-6 ${isSelected ? "text-[var(--gold)] fill-[var(--gold)]" : "text-zinc-600"}`} />;
      case "dish":
        return <Utensils className={`w-6 h-6 ${isSelected ? "text-[var(--gold)] fill-[var(--gold)]" : "text-zinc-600"}`} />;
      case "emoji":
        const emojis = ["😡", "🙁", "😐", "😊", "😍"];
        return <span className="text-2xl">{emojis[idx] || "⭐"}</span>;
      default:
        return <Star className={`w-6 h-6 ${isSelected ? "text-[var(--gold)] fill-[var(--gold)]" : "text-zinc-600"}`} />;
    }
  };

  const isPositivePreview = previewRating >= minStarsGoogle;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Encabezado */}
      <div className="flex justify-between items-center border-b border-[#363439] pb-6">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue'] flex items-center gap-2">
            <Star className="w-6 h-6 text-[var(--gold)] fill-[var(--gold)]" />
            Embudo Inteligente de Reputación & Calificación
          </h2>
          <p className="text-sm text-[#ccc3d8] mt-1">
            Personaliza el logo, los iconos de juego (estrellas, corazones, emojis), y los mensajes desplegables para 1, 2 y 3 estrellas frente a 4 y 5 estrellas.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Tarjetas de Métricas del Embudo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Calificación Promedio</span>
            <Star className="w-4 h-4 text-[var(--gold)] fill-[var(--gold)]" />
          </div>
          <div className="text-2xl font-black text-[var(--gold)] mt-2 font-mono">{avgRating} ★</div>
          <span className="text-[11px] text-[#ccc3d8]">{totalReviews} opiniones de comensales</span>
        </div>

        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Desviadas a Google Maps</span>
            <ThumbsUp className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-2xl font-black text-[#10b981] mt-2 font-mono">+{googleRedirects}</div>
          <span className="text-[11px] text-[#ccc3d8]">Calificaciones de 4 y 5 estrellas</span>
        </div>

        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Filtro WhatsApp Privado</span>
            <ShieldAlert className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl font-black text-[#f59e0b] mt-2 font-mono">{privateFeedbacks}</div>
          <span className="text-[11px] text-[#ccc3d8]">1, 2 y 3★ contenidas sin daño público</span>
        </div>

        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#ccc3d8]">Tasa de Protección</span>
            <span className="text-xs text-[#d1bcff]">🛡️ Activo</span>
          </div>
          <div className="text-2xl font-black text-[#d1bcff] mt-2 font-mono">{protectionRate}%</div>
          <span className="text-[11px] text-[#ccc3d8]">Cero quejas destructivas en Google</span>
        </div>
      </div>

      {/* Formulario y Vista Previa en Vivo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulario */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] border-b border-[#363439] pb-3">
            ⚙️ Personalización del Embudo & Reglas
          </h3>

          {/* 1. Selector de Iconos del Juego */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Icono de Evaluación para los Comensales
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: "star", label: "Estrellas ⭐", icon: "⭐" },
                { id: "heart", label: "Corazones ❤️", icon: "❤️" },
                { id: "coffee", label: "Café ☕", icon: "☕" },
                { id: "dish", label: "Platos 🍽️", icon: "🍽️" },
                { id: "emoji", label: "Emojis 😍", icon: "😍" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRatingIcon(item.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 text-xs ${
                    ratingIcon === item.id
                      ? "bg-[#2b292e] border-[var(--gold)] text-[var(--gold)] font-bold shadow-md"
                      : "bg-[#201f23] border-[#363439] text-[#ccc3d8] hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[11px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Logo Personalizado del Embudo con Especificaciones Sugeridas */}
          <ImageUploader
            label="Logo Específico para el Embudo de Calificación"
            value={customLogoUrl}
            onChange={setCustomLogoUrl}
            recommendedDimensions="400 x 120 px (Horizontal) o 250 x 250 px"
            aspectRatio="3:1 horizontal o 1:1 cuadrado"
            maxWeight="Menor a 200 KB"
            formats="PNG transparente o WebP"
            description="Este logotipo se mostrará en la cabecera de la tarjeta de evaluación del comensal. Si lo dejas vacío, se usará el logo general de la marca."
            placeholder="Pega URL o sube una imagen desde tu equipo"
            previewHeight="h-16"
          />

          {/* 3. Umbral y Enlaces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#363439] pt-4">
            <div>
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1.5">
                Mínimo para ir a Google Maps
              </label>
              <select
                value={minStarsGoogle}
                onChange={(e) => setMinStarsGoogle(Number(e.target.value))}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2.5 w-full text-xs"
              >
                <option value={4}>4 Estrellas o más (1, 2 y 3 van a Privado)</option>
                <option value={5}>Solo 5 Estrellas (1, 2, 3 y 4 van a Privado)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1.5">
                WhatsApp Privado de Gerencia
              </label>
              <input
                type="text"
                required
                value={whatsappManager}
                onChange={(e) => setWhatsappManager(e.target.value)}
                placeholder="573001234567"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2.5 w-full text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Enlace de tu Perfil en Google Maps / My Business *
            </label>
            <input
              type="url"
              required
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs"
            />
          </div>

          {/* 4. CONFIGURACIÓN: 1, 2 Y 3 ESTRELLAS (QUEJAS PRIVADAS) */}
          <div className="rounded-2xl bg-[#201f23]/60 border border-[#f59e0b]/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-[#f59e0b] font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Mensajes Desplegables para 1, 2 y 3 Estrellas (Filtro Privado)</span>
            </div>

            <div>
              <label className="text-[11px] text-[#ccc3d8] font-semibold block mb-1">Título Desplegado</label>
              <input
                type="text"
                required
                value={lowRatingTitle}
                onChange={(e) => setLowRatingTitle(e.target.value)}
                className="bg-[#1c1b1f] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs focus:border-[var(--gold)]/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#ccc3d8] font-semibold block mb-1">Mensaje Explicativo</label>
              <textarea
                rows={2}
                required
                value={lowRatingMessage}
                onChange={(e) => setLowRatingMessage(e.target.value)}
                className="bg-[#1c1b1f] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs focus:border-[var(--gold)]/60 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#ccc3d8] font-semibold block mb-1">Plantilla de WhatsApp para Gerencia</label>
              <input
                type="text"
                value={lowRatingWhatsappText}
                onChange={(e) => setLowRatingWhatsappText(e.target.value)}
                className="bg-[#1c1b1f] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs focus:border-[var(--gold)]/60 focus:outline-none"
              />
            </div>
          </div>

          {/* 5. CONFIGURACIÓN: 4 Y 5 ESTRELLAS (GOOGLE MAPS) */}
          <div className="rounded-2xl bg-[#201f23]/60 border border-[#10b981]/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-[#10b981] font-bold text-xs">
              <ThumbsUp className="w-4 h-4" />
              <span>Mensajes Desplegables para 4 y 5 Estrellas (Google Maps)</span>
            </div>

            <div>
              <label className="text-[11px] text-[#ccc3d8] font-semibold block mb-1">Título Desplegado</label>
              <input
                type="text"
                required
                value={highRatingTitle}
                onChange={(e) => setHighRatingTitle(e.target.value)}
                className="bg-[#1c1b1f] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs focus:border-[var(--gold)]/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#ccc3d8] font-semibold block mb-1">Mensaje Explicativo</label>
              <textarea
                rows={2}
                required
                value={highRatingMessage}
                onChange={(e) => setHighRatingMessage(e.target.value)}
                className="bg-[#1c1b1f] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs focus:border-[var(--gold)]/60 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#ccc3d8] font-semibold block mb-1">Texto del Botón a Google</label>
              <input
                type="text"
                required
                value={highRatingCtaText}
                onChange={(e) => setHighRatingCtaText(e.target.value)}
                className="bg-[#1c1b1f] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs focus:border-[var(--gold)]/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-[var(--gold)] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center gap-2 text-sm shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Guardar Reglas del Embudo</span>
            </button>
          </div>
        </form>

        {/* VISTA PREVIA INTERACTIVA EN VIVO */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] bg-[#000000] rounded-[42px] p-4 border-4 border-[#363439] shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative">
            <div className="w-24 h-4 bg-[#141317] rounded-full mx-auto mb-4" />

            <div className="text-center mb-3">
              <span className="text-[10px] text-[#ccc3d8] font-mono tracking-widest uppercase">
                Simulador del Embudo en Vivo
              </span>
            </div>

            {/* Pantalla del Comensal */}
            <div className="rounded-3xl bg-[#1c1b1f] border border-[var(--gold)]/40 p-4 text-center space-y-4">
              {/* Logo */}
              {customLogoUrl ? (
                <img src={customLogoUrl} alt="Logo" className="w-12 h-12 object-contain mx-auto rounded-full bg-white/5 p-1 border border-[var(--gold)]/30" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/50 text-[var(--gold)] flex items-center justify-center mx-auto text-lg font-black">
                  ⭐
                </div>
              )}

              {/* Selector interactivo de iconos */}
              <div>
                <p className="text-xs text-[#ccc3d8] mb-2 font-semibold">Toca para probar la reacción:</p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPreviewRating(num)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      {renderIcon(num - 1, num <= previewRating)}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-mono font-bold text-[var(--gold)] mt-1 block">
                  {previewRating} de 5 {ratingIcon === "heart" ? "Corazones" : "Estrellas"}
                </span>
              </div>

              {/* Mensaje Desplegable Dinámico */}
              <div className={`p-3.5 rounded-2xl border text-left space-y-2 transition-all ${
                isPositivePreview
                  ? "bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]"
                  : "bg-[#f59e0b]/10 border-[#f59e0b]/40 text-[#f59e0b]"
              }`}>
                <h4 className="text-xs font-bold font-['Epilogue']">
                  {isPositivePreview ? highRatingTitle : lowRatingTitle}
                </h4>
                <p className="text-[11px] text-[#ccc3d8] leading-relaxed">
                  {isPositivePreview ? highRatingMessage : lowRatingMessage}
                </p>

                {isPositivePreview ? (
                  <div className="w-full py-2 px-3 rounded-xl bg-[var(--gold)] text-[#121115] font-black text-[11px] text-center shadow-md">
                    {highRatingCtaText}
                  </div>
                ) : (
                  <div className="w-full py-2 px-3 rounded-xl bg-[#25D366] text-white font-bold text-[11px] text-center flex items-center justify-center gap-1.5 shadow-md">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Enviar a Gerencia por WhatsApp</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-center text-[10px] text-[#ccc3d8]/60">
              Prueba tocar 1, 2 o 3 vs 4 o 5 para ver cómo cambia la experiencia del cliente.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

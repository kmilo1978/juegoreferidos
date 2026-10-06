import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Instagram, MapPin, Save, Share2, Users } from "lucide-react";
import { apiUrl, getAuthToken } from "../../lib/apiClient";

export function Channels() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados editables
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [enableWhatsAppPhoto, setEnableWhatsAppPhoto] = useState(true);
  const [instagramHandle, setInstagramHandle] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [whatsappCommunityUrl, setWhatsappCommunityUrl] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch(apiUrl("/config"));
      if (!res.ok) throw new Error("Error al cargar canales");
      const data = await res.json();
      setConfig(data.settings);

      if (data.settings?.channels) {
        setWhatsappNumber(data.settings.channels.whatsappNumber || "");
        setWhatsappMessage(data.settings.channels.whatsappPhotoMessage || "");
        setEnableWhatsAppPhoto(data.settings.channels.enableWhatsAppPhoto ?? true);
        setInstagramHandle(data.settings.channels.instagramHandle || "");
        setGoogleMapsUrl(data.settings.channels.googleMapsReviewUrl || "");
        setWhatsappCommunityUrl(data.settings.channels.whatsappCommunityUrl || "");
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
      const res = await fetch(apiUrl("/config"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
        body: JSON.stringify({
          channels: {
            whatsappNumber,
            whatsappPhotoMessage: whatsappMessage,
            enableWhatsAppPhoto,
            instagramHandle,
            googleMapsReviewUrl: googleMapsUrl,
            whatsappCommunityUrl,
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar canales");
      setSuccess("Canales y WhatsApp actualizados con éxito");
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">Canales & WhatsApp</h2>
          <p className="text-sm text-[#ccc3d8]">Configura los puntos de contacto directo con los comensales (WhatsApp, Instagram Stories y Comunidad VIP).</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#363439] pb-4">
          <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[var(--gold)]" />
            <span>Configuración de Canales de Atención</span>
          </h3>
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--gold)] text-[#121115] font-bold rounded-xl px-5 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Canales</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Número de WhatsApp para Validación de Mesa
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="573022777295"
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
              required
            />
            <span className="text-[11px] text-[#958da1]">Número con código de país que recibe las fotos de los clientes que no usan Instagram.</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Handle Oficial de Instagram
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-[var(--gold)] font-bold text-sm">@</span>
              <input
                type="text"
                value={instagramHandle.replace(/^@/, "")}
                onChange={(e) => setInstagramHandle(`@${e.target.value.replace(/^@/, "")}`)}
                placeholder="turestaurante"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl pl-8 pr-4 py-3 w-full text-sm"
                required
              />
            </div>
            <span className="text-[11px] text-[#958da1]">Esta es la mención que se copia automáticamente en Instagram Stories (Paso 2).</span>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Mensaje Predefinido para Enviar Foto por WhatsApp
            </label>
            <textarea
              rows={3}
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm resize-none"
            />
            <span className="text-[11px] text-[#958da1]">Variables automáticas soportadas: &#123;tableNumber&#125; y &#123;participantName&#125;.</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Enlace de Invitación a la Comunidad VIP de WhatsApp
            </label>
            <input
              type="url"
              value={whatsappCommunityUrl}
              onChange={(e) => setWhatsappCommunityUrl(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
            />
            <span className="text-[11px] text-[#958da1]">Utilizado en el Paso 8 de Misiones para sumar sellos VIP al unirse.</span>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="enableWaPhoto"
              checked={enableWhatsAppPhoto}
              onChange={(e) => setEnableWhatsAppPhoto(e.target.checked)}
              className="w-4 h-4 accent-[var(--gold)]"
            />
            <label htmlFor="enableWaPhoto" className="text-xs text-[#e6e1e7] cursor-pointer">
              Habilitar botón secundario "¿No usas Instagram? Enviar por WhatsApp" en el Paso 2
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}

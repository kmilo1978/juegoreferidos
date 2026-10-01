import { useEffect, useState } from "react";
import { Loader2, Save, Wifi as WifiIcon, ExternalLink, Sparkles, CheckCircle, Smartphone } from "lucide-react";
import { ImageUploader } from "../components/ImageUploader";

export function WifiPortal() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulario de configuración
  const [ssid, setSsid] = useState("WiFi Clientes VIP");
  const [sessionMinutes, setSessionMinutes] = useState(120);
  const [requireEmail, setRequireEmail] = useState(true);
  const [portalLogoUrl, setPortalLogoUrl] = useState("");
  const [welcomeTitle, setWelcomeTitle] = useState("¡Bienvenido a nuestro restaurante!");

  useEffect(() => {
    fetch("/api/portal/status")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        if (data.wifiSSID) setSsid(data.wifiSSID);
        if (data.logoUrl) setPortalLogoUrl(data.logoUrl);
        if (data.welcomeMessage) setWelcomeTitle(data.welcomeMessage);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captivePortal: {
            ssid,
            sessionDurationMinutes: Number(sessionMinutes),
            requireEmail,
            logoUrl: portalLogoUrl,
            welcomeTitle,
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar configuración");
      setSuccess("¡Configuración del portal WiFi guardada correctamente!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue'] flex items-center gap-2">
            <WifiIcon className="w-6 h-6 text-[#f2be71]" />
            <span>Portal Cautivo WiFi & Kiosko</span>
          </h2>
          <p className="text-sm text-[#ccc3d8]">
            Configura la pantalla de bienvenida y captación de clientes al conectarse a la red WiFi del restaurante.
          </p>
        </div>

        <a
          href="/?demo=true&paso=1"
          target="_blank"
          rel="noreferrer"
          className="bg-[#201f23] border border-[#f2be71]/40 hover:bg-[#2b292e] text-[#f2be71] text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Smartphone className="w-4 h-4" />
          <span>Ver Pantalla Kiosko</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de Estado del Router / Portal */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 text-center shadow-lg">
            <div
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                status?.active !== false ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#363439] text-[#958da1]"
              }`}
            >
              <WifiIcon className="w-8 h-8" />
            </div>
            <h4 className="text-[#e6e1e7] font-bold text-xl mb-1">
              {status?.active !== false ? "Portal En Línea" : "Fuera de Línea"}
            </h4>
            <p className="text-[#958da1] text-xs">Servicio de Captación Activo</p>

            <div className="mt-6 pt-6 border-t border-[#363439] text-left space-y-2">
              <span className="text-[11px] uppercase font-bold text-[#ccc3d8] block">Red WiFi Asignada:</span>
              <span className="text-sm font-mono font-bold text-[#f2be71] block bg-[#141317] p-2 rounded-lg border border-[#363439]">
                {ssid}
              </span>
            </div>
          </div>
        </div>

        {/* Formulario de Configuración con ImageUploader */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 shadow-lg">
            <h4 className="text-[#e6e1e7] font-bold border-b border-[#363439] pb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f2be71]" />
              <span>Personalización y Reglas de Conexión</span>
            </h4>

            {/* Logo o Banner del Portal con ImageUploader */}
            <ImageUploader
              label="Logotipo o Banner de Bienvenida del WiFi"
              value={portalLogoUrl}
              onChange={setPortalLogoUrl}
              recommendedDimensions="600 x 200 px (Horizontal) o 300 x 300 px"
              aspectRatio="3:1 horizontal"
              maxWeight="Menor a 250 KB"
              formats="PNG transparente, WebP o JPG"
              description="Aparece en la cabecera emergente del celular del comensal cuando se conecta al WiFi del restaurante."
              placeholder="Pega URL o sube una imagen desde tu equipo"
              previewHeight="h-16"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#ccc3d8] text-xs uppercase font-bold mb-1.5">Nombre SSID de la Red WiFi</label>
                <input
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[#ccc3d8] text-xs uppercase font-bold mb-1.5">Duración de Sesión (Minutos)</label>
                <input
                  type="number"
                  min={15}
                  max={480}
                  value={sessionMinutes}
                  onChange={(e) => setSessionMinutes(Number(e.target.value))}
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#ccc3d8] text-xs uppercase font-bold mb-1.5">Mensaje de Bienvenida</label>
                <input
                  type="text"
                  value={welcomeTitle}
                  onChange={(e) => setWelcomeTitle(e.target.value)}
                  placeholder="¡Bienvenido a nuestro restaurante! Disfruta de internet libre."
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-[#363439]">
              <input
                type="checkbox"
                id="req-email"
                checked={requireEmail}
                onChange={(e) => setRequireEmail(e.target.checked)}
                className="w-4 h-4 accent-[#f2be71] rounded bg-[#201f23] border-[#363439]"
              />
              <label htmlFor="req-email" className="text-xs text-[#ccc3d8] cursor-pointer">
                Solicitar Correo Electrónico además de WhatsApp para acceder al WiFi
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-xs disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Configuración WiFi</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

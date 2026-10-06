import { useEffect, useState } from "react";
import {
  Loader2,
  Save,
  Wifi,
  ExternalLink,
  Sparkles,
  CheckCircle,
  Smartphone,
  Router,
  Radio,
  Server,
  Download,
  Clock,
  Shield,
  Trash2,
  Plus,
  RefreshCw,
  Award,
  Globe,
  HardDrive,
  Users,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react";
import { ImageUploader } from "../components/ImageUploader";

export function WifiPortal() {
  const [activeTab, setActiveTab] = useState<"general" | "hardware" | "devices" | "preview">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados de Configuración
  const [enabled, setEnabled] = useState(true);
  const [ssid, setSsid] = useState("WiFi Clientes VIP");
  const [sessionMinutes, setSessionMinutes] = useState(120);
  const [welcomeTitle, setWelcomeTitle] = useState("¡Bienvenido a nuestro restaurante!");
  const [welcomeDescription, setWelcomeDescription] = useState(
    "Conéctate al WiFi de alta velocidad, recibe tu primer sello de visita y participa por premios en mesa."
  );
  const [portalLogoUrl, setPortalLogoUrl] = useState("");
  const [requireWhatsapp, setRequireWhatsapp] = useState(true);
  const [requireEmail, setRequireEmail] = useState(false);
  const [grantStampOnConnect, setGrantStampOnConnect] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState("/?demo=true&paso=1");

  // Configuración de Hardware
  const [hardwareType, setHardwareType] = useState<"mikrotik" | "unifi" | "kiosk_dns">("mikrotik");
  const [mikrotikGateway, setMikrotikGateway] = useState("192.168.88.1");
  const [mikrotikServer, setMikrotikServer] = useState("hotspot1");
  const [mikrotikDns, setMikrotikDns] = useState("wifi.local");
  const [unifiUrl, setUnifiUrl] = useState("https://192.168.1.10:8443");
  const [unifiSite, setUnifiSite] = useState("default");
  const [unifiApiKey, setUnifiApiKey] = useState("");

  // Dispositivos Conectados en Vivo
  const [devices, setDevices] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/portal/status");
      if (!res.ok) throw new Error("Error al consultar el portal WiFi");
      const data = await res.json();

      setEnabled(data.active !== false);
      if (data.wifiSSID) setSsid(data.wifiSSID);
      if (data.sessionMinutes) setSessionMinutes(data.sessionMinutes);
      if (data.welcomeMessage) setWelcomeTitle(data.welcomeMessage);
      if (data.welcomeDescription) setWelcomeDescription(data.welcomeDescription);
      if (data.logoUrl) setPortalLogoUrl(data.logoUrl);
      if (data.hardwareType) setHardwareType(data.hardwareType);
      if (typeof data.requireWhatsapp === "boolean") setRequireWhatsapp(data.requireWhatsapp);
      if (typeof data.requireEmail === "boolean") setRequireEmail(data.requireEmail);
      if (typeof data.grantStampOnConnect === "boolean") setGrantStampOnConnect(data.grantStampOnConnect);
      if (data.redirectUrl) setRedirectUrl(data.redirectUrl);

      if (data.mikrotik) {
        setMikrotikGateway(data.mikrotik.gatewayIp || "192.168.88.1");
        setMikrotikServer(data.mikrotik.hotspotServer || "hotspot1");
        setMikrotikDns(data.mikrotik.dnsName || "wifi.local");
      }
      if (data.unifi) {
        setUnifiUrl(data.unifi.controllerUrl || "https://192.168.1.10:8443");
        setUnifiSite(data.unifi.site || "default");
        setUnifiApiKey(data.unifi.apiKey || "");
      }
      if (Array.isArray(data.connectedDevices)) {
        setDevices(data.connectedDevices);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        enabled,
        ssid,
        sessionDurationMinutes: Number(sessionMinutes),
        welcomeTitle,
        welcomeDescription,
        logoUrl: portalLogoUrl,
        hardwareType,
        requireWhatsapp,
        requireEmail,
        grantStampOnConnect,
        redirectUrl,
        mikrotik: {
          gatewayIp: mikrotikGateway,
          hotspotServer: mikrotikServer,
          dnsName: mikrotikDns,
        },
        unifi: {
          controllerUrl: unifiUrl,
          site: unifiSite,
          apiKey: unifiApiKey,
        },
      };

      const res = await fetch("/api/portal/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar la configuración");
      setSuccess("¡Configuración del portal cautivo y router guardada con éxito!");
      setTimeout(() => setSuccess(null), 3500);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (mac: string) => {
    try {
      const res = await fetch("/api/portal/devices/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac }),
      });
      if (res.ok) {
        setSuccess(`Dispositivo ${mac} desconectado.`);
        setTimeout(() => setSuccess(null), 3000);
        fetchData();
      }
    } catch (err) {
      setError("No se pudo desconectar el dispositivo");
    }
  };

  const handleExtendSession = async (mac: string) => {
    try {
      const res = await fetch("/api/portal/devices/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac, extraMinutes: 60 }),
      });
      if (res.ok) {
        setSuccess(`Sesión extendida +60 minutos para ${mac}.`);
        setTimeout(() => setSuccess(null), 3000);
        fetchData();
      }
    } catch (err) {
      setError("No se pudo extender la sesión");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[var(--gold)] animate-spin" />
          <span className="text-sm text-[#ccc3d8] font-medium font-['Epilogue']">Cargando Portal Cautivo WiFi...</span>
        </div>
      </div>
    );
  }

  const activeDevices = devices.filter((d) => d.status === "authorized");

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
              Estándar RFC 8908 & CNA
            </span>
            <span className="text-xs text-[var(--gold)] font-mono font-bold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              {activeDevices.length} Clientes Navegando
            </span>
          </div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue'] flex items-center gap-2.5">
            <Wifi className="w-6 h-6 text-[var(--gold)]" />
            <span>Portal Cautivo WiFi & Kiosko de Bienvenida</span>
          </h2>
          <p className="text-sm text-[#ccc3d8]">
            Gestiona la detección automática en iPhone y Android, conecta routers <strong>MikroTik o UniFi</strong> y otorga sellos de fidelización al conectar.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/hotspot-detect.html"
            target="_blank"
            rel="noreferrer"
            className="bg-[#201f23] hover:bg-[#252429] text-[#ccc3d8] hover:text-[var(--gold)] border border-[#363439] text-xs font-semibold rounded-xl px-4 py-2.5 flex items-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simular Popup Móvil (CNA)</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="bg-[var(--gold)] text-[#121115] font-bold rounded-xl px-5 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-xs shadow-md"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Configuración</span>
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline cursor-pointer">Cerrar</button>
        </div>
      )}

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {/* Pestañas de Navegación del Módulo */}
      <div className="flex items-center gap-2 border-b border-[#363439] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "general"
              ? "bg-[#2b292e] text-[var(--gold)] border border-[var(--gold)]/40 shadow-sm"
              : "text-[#ccc3d8] hover:text-white hover:bg-[#201f23]"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>1. Identidad & Pantalla de Bienvenida</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hardware")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "hardware"
              ? "bg-[#2b292e] text-[var(--gold)] border border-[var(--gold)]/40 shadow-sm"
              : "text-[#ccc3d8] hover:text-white hover:bg-[#201f23]"
          }`}
        >
          <Router className="w-4 h-4" />
          <span>2. Routers & Hardware (MikroTik / UniFi)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("devices")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "devices"
              ? "bg-[#2b292e] text-[var(--gold)] border border-[var(--gold)]/40 shadow-sm"
              : "text-[#ccc3d8] hover:text-white hover:bg-[#201f23]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>3. Dispositivos en Vivo ({activeDevices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "preview"
              ? "bg-[#2b292e] text-[var(--gold)] border border-[var(--gold)]/40 shadow-sm"
              : "text-[#ccc3d8] hover:text-white hover:bg-[#201f23]"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>4. Vista Previa Popup Celular</span>
        </button>
      </div>

      {/* PESTAÑA 1: IDENTIDAD & PANTALLA DE BIENVENIDA */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-5 shadow-xl">
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2 border-b border-[#363439] pb-3">
                <Sparkles className="w-5 h-5 text-[var(--gold)]" />
                <span>Textos y Reglas de Captación en Mesa</span>
              </h3>

              <ImageUploader
                label="Logotipo o Banner del Portal Cautivo"
                value={portalLogoUrl}
                onChange={setPortalLogoUrl}
                recommendedDimensions="600 x 200 px (Horizontal) o 300 x 300 px"
                aspectRatio="3:1 horizontal"
                maxWeight="Menor a 250 KB"
                formats="PNG transparente, WebP o JPG"
                description="Se despliega en la parte superior de la ventana emergente en el celular del cliente."
                placeholder="Pega la URL de tu imagen o sube desde el equipo"
                previewHeight="h-16"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                    Nombre SSID de la Red WiFi
                  </label>
                  <input
                    type="text"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    placeholder="ej: Restaurante Gourmet - WiFi VIP"
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono font-bold focus:border-[var(--gold)] focus:outline-none"
                  />
                  <span className="text-[11px] text-[#958da1]">El nombre visible de la red inalámbrica en los celulares.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                    Duración Máxima de Sesión (Minutos)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={480}
                    value={sessionMinutes}
                    onChange={(e) => setSessionMinutes(Number(e.target.value))}
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[var(--gold)] focus:outline-none"
                  />
                  <span className="text-[11px] text-[#958da1]">Tiempo de internet libre antes de solicitar renovación (ej: 120m).</span>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                    Título de Bienvenida
                  </label>
                  <input
                    type="text"
                    value={welcomeTitle}
                    onChange={(e) => setWelcomeTitle(e.target.value)}
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-semibold focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                    Mensaje / Promesa de Recompensa
                  </label>
                  <textarea
                    rows={2}
                    value={welcomeDescription}
                    onChange={(e) => setWelcomeDescription(e.target.value)}
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs focus:border-[var(--gold)] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                    URL de Redirección Tras Conectar
                  </label>
                  <input
                    type="text"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="/?demo=true&paso=1"
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[var(--gold)] focus:outline-none"
                  />
                  <span className="text-[11px] text-[#958da1]">Página que se abre en el navegador al completar la conexión.</span>
                </div>
              </div>

              {/* Casillas de Fidelización y Requisitos */}
              <div className="space-y-3 pt-4 border-t border-[#363439]">
                <label className="flex items-center gap-3 p-3 bg-[#201f23] border border-[#363439] rounded-xl cursor-pointer hover:bg-[#252429]">
                  <input
                    type="checkbox"
                    checked={grantStampOnConnect}
                    onChange={(e) => setGrantStampOnConnect(e.target.checked)}
                    className="w-4 h-4 accent-[var(--gold)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#e6e1e7] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[var(--gold)]" />
                      <span>Otorgar +1 Sello de Visita Automático al Conectar</span>
                    </span>
                    <span className="text-[11px] text-[#958da1]">Incentiva a los comensales a identificarse con su WhatsApp real.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#201f23] border border-[#363439] rounded-xl cursor-pointer hover:bg-[#252429]">
                  <input
                    type="checkbox"
                    checked={requireWhatsapp}
                    onChange={(e) => setRequireWhatsapp(e.target.checked)}
                    className="w-4 h-4 accent-[var(--gold)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#e6e1e7]">Solicitar WhatsApp Obligatorio</span>
                    <span className="text-[11px] text-[#958da1] block">Crea el perfil del cliente en el CRM y le acredita sus premios.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#201f23] border border-[#363439] rounded-xl cursor-pointer hover:bg-[#252429]">
                  <input
                    type="checkbox"
                    checked={requireEmail}
                    onChange={(e) => setRequireEmail(e.target.checked)}
                    className="w-4 h-4 accent-[var(--gold)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#e6e1e7]">Solicitar Correo Electrónico Opcional / Obligatorio</span>
                    <span className="text-[11px] text-[#958da1] block">Para enviar novedades y boletines mensuales.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Tarjeta Lateral de Estado y Resumen */}
          <div className="space-y-6">
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 text-center shadow-xl space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981]">
                <Wifi className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue']">Servicio Wi-Fi Activo</h4>
                <span className="text-xs text-[#10b981] font-mono font-bold">● Detección CNA Lista</span>
              </div>

              <div className="text-left bg-[#141317] p-4 rounded-xl border border-[#363439] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#958da1]">Red SSID:</span>
                  <span className="text-[var(--gold)] font-mono font-bold truncate max-w-[150px]">{ssid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#958da1]">Sesión:</span>
                  <span className="text-white font-mono">{sessionMinutes} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#958da1]">Controlador:</span>
                  <span className="text-white uppercase font-bold">{hardwareType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#958da1]">Sello al Conectar:</span>
                  <span className="text-[#10b981] font-bold">{grantStampOnConnect ? "+1 Sello" : "Inactivo"}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="/hotspot-detect.html"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-[var(--gold)] hover:brightness-105 text-[#121115] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <span>Probar Popup de Conexión</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: HARDWARE & ROUTERS (MIKROTIK / UNIFI / KIOSKO) */}
      {activeTab === "hardware" && (
        <div className="space-y-6">
          {/* Selector de Arquitectura de Hardware */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: "mikrotik",
                title: "MikroTik RouterOS",
                desc: "Equipos hEX, RB, Cloud Router Switch con Hotspot nativo y Walled Garden.",
                icon: Router,
                badge: "MÁS USADO",
              },
              {
                id: "unifi",
                title: "Ubiquiti UniFi",
                desc: "Access Points U6, Dream Machine o Cloud Gateway con External Guest Portal.",
                icon: Radio,
                badge: "EMPRESARIAL",
              },
              {
                id: "kiosk_dns",
                title: "Kiosko Web / DNS Redirect",
                desc: "Tablet en barra o redirección DNS local sin requerir hardware router específico.",
                icon: Server,
                badge: "PLUG & PLAY",
              },
            ].map((hw) => {
              const Icon = hw.icon;
              const isSelected = hardwareType === hw.id;
              return (
                <div
                  key={hw.id}
                  onClick={() => setHardwareType(hw.id as any)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 select-none ${
                    isSelected
                      ? "bg-[#252429] border-[var(--gold)] shadow-[0_4px_20px_rgba(242,190,113,0.15)]"
                      : "bg-[#1c1b1f] border-[#363439] opacity-75 hover:opacity-100 hover:border-[#4a4455]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/15 border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#141317] border border-[#363439] text-[var(--gold)] font-bold">
                      {hw.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#e6e1e7] font-['Epilogue']">{hw.title}</h4>
                  <p className="text-xs text-[#ccc3d8] leading-relaxed">{hw.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Configuración Detallada de MikroTik */}
          {hardwareType === "mikrotik" && (
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#363439] pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4285F4]/15 border border-[#4285F4]/40 flex items-center justify-center text-[#4285F4]">
                    <Router className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">Configuración MikroTik Hotspot</h3>
                    <span className="text-xs text-[#958da1]">Compatible con RouterOS v6 y v7 (hEX, RB4011, RB750, etc.)</span>
                  </div>
                </div>

                <a
                  href="/api/portal/scripts/mikrotik"
                  download="mikrotik-hotspot-config.rsc"
                  className="px-4 py-2.5 bg-[var(--gold)] text-[#121115] hover:brightness-105 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Script RouterOS (.rsc)</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                    IP Gateway de MikroTik
                  </label>
                  <input
                    type="text"
                    value={mikrotikGateway}
                    onChange={(e) => setMikrotikGateway(e.target.value)}
                    placeholder="192.168.88.1"
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                    Nombre del Servidor Hotspot
                  </label>
                  <input
                    type="text"
                    value={mikrotikServer}
                    onChange={(e) => setMikrotikServer(e.target.value)}
                    placeholder="hotspot1"
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                    DNS Name Interno
                  </label>
                  <input
                    type="text"
                    value={mikrotikDns}
                    onChange={(e) => setMikrotikDns(e.target.value)}
                    placeholder="wifi.local"
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Guía Técnica para el Técnico de Red */}
              <div className="bg-[#141317] border border-[#363439] rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-[var(--gold)] flex items-center gap-1.5 uppercase tracking-wider">
                  <TerminalIcon className="w-4 h-4" />
                  <span>Comandos de Instalación Rápida en MikroTik Terminal:</span>
                </span>
                <pre className="text-[11px] font-mono text-[#ccc3d8] bg-[#0f0e12] p-3 rounded-lg border border-[#2b292e] overflow-x-auto leading-relaxed">
{`/ip hotspot profile set [ find default=yes ] html-directory=flash/hotspot login-by=http-chap,mac-cookie
/ip hotspot walled-garden add dst-host=*.whatsapp.com comment="WhatsApp Validation"
/ip hotspot walled-garden add dst-host=*.googleapis.com comment="Fuentes de marca"
/ip hotspot user profile set [ find default=yes ] mac-cookie-timeout=3d`}
                </pre>
                <p className="text-[11px] text-[#958da1]">
                  Solo copia y pega las 4 líneas anteriores en la consola <strong>New Terminal</strong> de WinBox. El router redirigirá automáticamente a los clientes hacia esta plataforma.
                </p>
              </div>
            </div>
          )}

          {/* Configuración Detallada de UniFi */}
          {hardwareType === "unifi" && (
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-[#363439] pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3ECF8E]/15 border border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E]">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">Configuración Ubiquiti UniFi Controller</h3>
                  <span className="text-xs text-[#958da1]">Integración con UniFi OS / UDM-Pro / Cloud Key / U6 Access Points</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                    URL de UniFi Controller
                  </label>
                  <input
                    type="text"
                    value={unifiUrl}
                    onChange={(e) => setUnifiUrl(e.target.value)}
                    placeholder="https://192.168.1.10:8443"
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                    Site ID de UniFi
                  </label>
                  <input
                    type="text"
                    value={unifiSite}
                    onChange={(e) => setUnifiSite(e.target.value)}
                    placeholder="default"
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                    API Key de Administrador
                  </label>
                  <input
                    type="password"
                    value={unifiApiKey}
                    onChange={(e) => setUnifiApiKey(e.target.value)}
                    placeholder="unifi_token_..."
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-mono focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#141317] border border-[#363439] rounded-xl p-4 text-xs text-[#ccc3d8] space-y-2">
                <span className="text-[var(--gold)] font-bold block">Paso en UniFi Network Application:</span>
                <p>
                  1. Ve a <strong>Settings → Hotspot & Guest Portal</strong>.<br />
                  2. Activa <strong>External Portal Server</strong> e ingresa la IP local de este computador con el puerto <code>3001</code>.<br />
                  3. En <strong>Pre-Authorization Access</strong> agrega: <code>api.whatsapp.com</code> y <code>maps.google.com</code>.
                </p>
              </div>
            </div>
          )}

          {/* Configuración Kiosko / Standalone */}
          {hardwareType === "kiosk_dns" && (
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 border-b border-[#363439] pb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/15 border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold)]">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">Modo Kiosko Web Standalone</h3>
                  <span className="text-xs text-[#958da1]">Ideal para tablets en mostrador de caja o acceso por código QR en mesa</span>
                </div>
              </div>
              <p className="text-xs text-[#ccc3d8] leading-relaxed">
                Este modo no requiere routers especializados ni cambios en la red física. Puedes colocar una tablet en la barra o mostrador con la URL:
                <br />
                <code className="text-[var(--gold)] bg-[#141317] px-2 py-1 rounded mt-2 inline-block font-mono">
                  http://{window.location.host}/?kiosk=true
                </code>
              </p>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: DISPOSITIVOS CONECTADOS EN VIVO */}
      {activeTab === "devices" && (
        <div className="space-y-6">
          {/* Métricas rápidas de red */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-1">
              <span className="text-xs text-[#958da1] uppercase font-bold">Dispositivos Autorizados</span>
              <div className="text-2xl font-bold text-[#10b981] font-mono">{activeDevices.length} Activos</div>
              <span className="text-[11px] text-[#ccc3d8]">Navegando con sesión válida</span>
            </div>

            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-1">
              <span className="text-xs text-[#958da1] uppercase font-bold">Tráfico Acumulado</span>
              <div className="text-2xl font-bold text-[var(--gold)] font-mono">411.4 MB</div>
              <span className="text-[11px] text-[#ccc3d8]">Descarga y subida en sala</span>
            </div>

            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-1">
              <span className="text-xs text-[#958da1] uppercase font-bold">Sellos de Fidelización</span>
              <div className="text-2xl font-bold text-[#d1bcff] font-mono">+{activeDevices.length} Sellos</div>
              <span className="text-[11px] text-[#ccc3d8]">Acreditados por conexión Wi-Fi</span>
            </div>
          </div>

          {/* Tabla de Dispositivos Conectados */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#363439] pb-4">
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--gold)]" />
                <span>Sesiones Wi-Fi en Sala (En Directo)</span>
              </h3>

              <button
                type="button"
                onClick={fetchData}
                className="text-xs bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-[var(--gold)] px-3 py-1.5 rounded-xl border border-[#363439] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualizar Lista</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#201f23]/60 text-[#ccc3d8] text-xs uppercase tracking-wider font-bold">
                    <th className="px-4 py-3 rounded-l-xl">Dispositivo / Hostname</th>
                    <th className="px-4 py-3">Dirección MAC</th>
                    <th className="px-4 py-3">Cliente / WhatsApp</th>
                    <th className="px-4 py-3">Hardware</th>
                    <th className="px-4 py-3">Tiempo Restante</th>
                    <th className="px-4 py-3 text-right rounded-r-xl">Acciones de Sala</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#363439]/50 text-xs">
                  {devices.map((dev) => {
                    const isExp = new Date(dev.expiresAt).getTime() <= Date.now() || dev.status === "disconnected";
                    const minsLeft = Math.max(0, Math.round((new Date(dev.expiresAt).getTime() - Date.now()) / 60000));

                    return (
                      <tr key={dev.id} className="hover:bg-[#201f23]/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-[#e6e1e7] flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-[var(--gold)]" />
                            <span>{dev.hostname || "Dispositivo Móvil"}</span>
                          </div>
                          <span className="text-[10px] text-[#958da1] font-mono">{dev.ip}</span>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-[#ccc3d8] text-[11px] font-bold">
                          {dev.mac}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-white block">{dev.fullName}</span>
                          <span className="text-[11px] text-[var(--gold)] font-mono">+{dev.whatsapp}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#141317] border border-[#363439] text-[#ccc3d8]">
                            {dev.hardware}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          {isExp ? (
                            <span className="text-red-400 font-bold text-[11px]">Expirado / Desconectado</span>
                          ) : (
                            <div className="flex items-center gap-1.5 font-mono text-[#10b981] font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{minsLeft} min restantes</span>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right space-x-2">
                          {!isExp && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleExtendSession(dev.mac)}
                                className="px-2.5 py-1 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[var(--gold)] border border-[var(--gold)]/40 text-[11px] font-semibold cursor-pointer transition-colors"
                              >
                                +60 Min
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDisconnect(dev.mac)}
                                className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-[11px] font-semibold cursor-pointer transition-colors"
                              >
                                Desconectar
                              </button>
                            </>
                          )}
                          {isExp && (
                            <button
                              type="button"
                              onClick={() => handleExtendSession(dev.mac)}
                              className="px-2.5 py-1 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[#10b981] border border-[#10b981]/40 text-[11px] font-semibold cursor-pointer"
                            >
                              Reconectar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {devices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-[#958da1]">
                        No hay dispositivos conectados en este momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: SIMULADOR DE POPUP EN CELULAR (CNA IPHONE / ANDROID) */}
      {activeTab === "preview" && (
        <div className="flex flex-col items-center justify-center p-6 bg-[#1c1b1f] border border-[#363439] rounded-2xl shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider">
              Simulador Captive Network Assistant (CNA)
            </span>
            <h3 className="text-lg font-bold text-white font-['Epilogue']">
              Así se ve la pantalla emergente al tocar el Wi-Fi en iPhone y Android
            </h3>
            <p className="text-xs text-[#ccc3d8] max-w-lg">
              Esta ventana se abre de forma nativa en el celular del comensal tan pronto se asocia a la red <strong>{ssid}</strong>.
            </p>
          </div>

          {/* Maqueta de Teléfono Inteligente */}
          <div className="w-full max-w-[360px] bg-[#000] border-4 border-[#363439] rounded-[40px] p-3 shadow-2xl relative overflow-hidden">
            {/* Notch / Dynamic Island */}
            <div className="w-28 h-5 bg-[#141317] rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#201f23]"></div>
            </div>

            {/* Barra de Ventana CNA de Apple/Android */}
            <div className="bg-[#201f23] rounded-t-2xl px-4 py-2 flex items-center justify-between text-[11px] text-[#ccc3d8] border-b border-[#363439]">
              <span className="font-semibold text-white">Cancelar</span>
              <span className="font-mono text-[10px] text-[#958da1]">{ssid}</span>
              <span className="font-semibold text-[var(--gold)]">Listo</span>
            </div>

            {/* Contenido del Portal Cautivo */}
            <div className="bg-[#141317] p-5 rounded-b-2xl space-y-4 text-center">
              {portalLogoUrl ? (
                <img src={portalLogoUrl} alt="Logo" className="h-12 mx-auto object-contain" />
              ) : (
                <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--gold)]/20 border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold)]">
                  <Wifi className="w-6 h-6" />
                </div>
              )}

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-['Epilogue']">{welcomeTitle}</h4>
                <p className="text-[11px] text-[#ccc3d8] leading-relaxed">{welcomeDescription}</p>
              </div>

              {grantStampOnConnect && (
                <div className="p-2.5 rounded-xl bg-[#201f23] border border-[var(--gold)]/30 flex items-center justify-center gap-2 text-xs text-[var(--gold)] font-bold">
                  <Award className="w-4 h-4" />
                  <span>¡Ganarás +1 Sello VIP al conectar!</span>
                </div>
              )}

              <div className="space-y-2 text-left pt-1">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#958da1] block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    readOnly
                    value="Laura Gómez"
                    className="w-full bg-[#201f23] border border-[#363439] rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#958da1] block mb-1">WhatsApp</label>
                  <input
                    type="text"
                    readOnly
                    value="+57 300 123 4567"
                    className="w-full bg-[#201f23] border border-[#363439] rounded-lg px-3 py-2 text-xs text-[var(--gold)] font-mono font-bold"
                  />
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-[var(--gold)] text-[#121115] font-bold text-xs shadow-md mt-2"
              >
                Conectar al Wi-Fi & Jugar
              </button>

              <span className="text-[9px] text-[#958da1] block">
                Sesión de {sessionMinutes} minutos • Navegación de alta velocidad
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TerminalIcon(props: any) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

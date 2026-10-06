import { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Radio,
  Wifi,
  QrCode,
  Smartphone,
  Compass,
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Sliders,
  Send,
  Loader2,
  ExternalLink,
  ChevronRight,
  Info,
  Copy,
  Check,
  Target,
  Zap,
  Bell,
} from "lucide-react";
import { getAuthToken } from "../../lib/apiClient";

/** Distancia en metros entre dos coordenadas (fórmula de Haversine). */
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // radio terrestre en metros
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export interface GeofencingConfig {
  enabled: boolean;
  venue: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  option1_web_radius: {
    enabled: boolean;
    radiusMeters: number;
    requestLocationOnPlay: boolean;
    promptTitle: string;
    promptBody: string;
  };
  option2_background_realtime: {
    enabled: boolean;
    geofenceRadiusMeters: number;
    cooldownHours: number;
    scheduleStart: string;
    scheduleEnd: string;
    messageTitle: string;
    messageBody: string;
    actionUrl: string;
    capacitorPackage: string;
  };
  option3_venue_physical: {
    enabled: boolean;
    triggerType: string;
    welcomeDelaySeconds: number;
    messageTitle: string;
    messageBody: string;
    actionUrl: string;
  };
}

const DEFAULT_GEOFENCING_CONFIG: GeofencingConfig = {
  enabled: true,
  venue: {
    name: "Tu Restaurante & Café",
    address: "Zona Gourmet / Principal",
    latitude: 4.6756,
    longitude: -74.0538,
  },
  option1_web_radius: {
    enabled: true,
    radiusMeters: 2000,
    requestLocationOnPlay: true,
    promptTitle: "¡Recibe regalos cuando estés cerca!",
    promptBody: "Activa tu ubicación para enterarte de sorpresas y postres gratis al pasar cerca de nuestro restaurante.",
  },
  option2_background_realtime: {
    enabled: true,
    geofenceRadiusMeters: 400,
    cooldownHours: 48,
    scheduleStart: "11:30",
    scheduleEnd: "22:00",
    messageTitle: "🍰 ¡Estás a 2 cuadras de {restaurante}!",
    messageBody: "Ven hoy y disfruta un café de cortesía mostrando esta notificación al sentarte.",
    actionUrl: "http://localhost:5173/?promo=geofence",
    capacitorPackage: "@capacitor-community/onesignal-location",
  },
  option3_venue_physical: {
    enabled: true,
    triggerType: "wifi_or_nfc",
    welcomeDelaySeconds: 60,
    messageTitle: "✨ ¡Qué alegría verte de nuevo en {restaurante}!",
    messageBody: "Hoy tu mesa tiene 10% de descuento en platos fuertes o doble sello en tu pasaporte VIP.",
    actionUrl: "http://localhost:5173/?mesa=1",
  },
};

export function GeofencingPanel() {
  const [config, setConfig] = useState<GeofencingConfig>(DEFAULT_GEOFENCING_CONFIG);
  const [activeSubOption, setActiveSubOption] = useState<"option1" | "option2" | "option3">("option1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingTrigger, setTestingTrigger] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [geoChecking, setGeoChecking] = useState(false);
  const [geoResult, setGeoResult] = useState<any | null>(null);

  // Cargar configuración desde el backend
  useEffect(() => {
    fetch("/api/push/geofencing")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setConfig(data.config);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/push/geofencing", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Error al guardar la configuración de geofencing");
      setSuccess("¡Configuración de Geofencing guardada y sincronizada correctamente!");
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const handleTestTrigger = async (optionId: "option1" | "option2" | "option3") => {
    setTestingTrigger(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/push/geofencing/test-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
        body: JSON.stringify({ optionId }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(data);
        setTimeout(() => setTestResult(null), 8000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestingTrigger(false);
    }
  };

  // Geolocalización REAL del navegador: calcula la distancia (haversine) a la
  // sede configurada y determina si el usuario está dentro del radio web.
  const handleCheckMyLocation = () => {
    setGeoChecking(true);
    setGeoResult(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoResult({ error: "Este navegador no soporta geolocalización." });
      setGeoChecking(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const distance = haversineMeters(
          latitude,
          longitude,
          config.venue.latitude,
          config.venue.longitude
        );
        const radius = config.option1_web_radius.radiusMeters;
        setGeoResult({
          distance,
          radius,
          inside: distance <= radius,
          lat: latitude,
          lng: longitude,
        });
        setGeoChecking(false);
      },
      (err) => {
        setGeoResult({ error: `No se pudo obtener la ubicación: ${err.message}` });
        setGeoChecking(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Estimador de audiencia simulado según radio seleccionado
  const estimatedAudience = Math.round(
    ((config.option1_web_radius.radiusMeters / 1000) * 18.5) + 12
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado y Explicación General */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-['Epilogue'] text-[#e6e1e7]">
                Módulo Integral de Geofencing & Notificaciones por Proximidad
              </h3>
            </div>
            <p className="text-xs text-[#ccc3d8] mt-1">
              Atrae comensales cercanos creando vallas virtuales y disparadores automáticos mediante OneSignal y presencia física en sala.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--gold)] text-[#121115] font-bold rounded-xl px-5 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-xs shadow-lg shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Guardar Configuración Geográfica</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/50 text-red-300 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] text-xs px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tabla Comparativa de las 3 Opciones */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#363439] text-[#958da1]">
                <th className="py-2.5 px-3">Estrategia</th>
                <th className="py-2.5 px-3">Plataforma</th>
                <th className="py-2.5 px-3">¿Funciona en segundo plano?</th>
                <th className="py-2.5 px-3">Requisito para el Cliente</th>
                <th className="py-2.5 px-3">Caso de Uso Principal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363439]/50 text-[#ccc3d8]">
              <tr className={activeSubOption === "option1" ? "bg-[#252429]" : ""}>
                <td className="py-2.5 px-3 font-bold text-[#e6e1e7] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[var(--gold)]" />
                  <span>Opción 1: Radio Geográfico Web</span>
                </td>
                <td className="py-2.5 px-3">100% Web (Safari/Chrome)</td>
                <td className="py-2.5 px-3 text-amber-300">Última ubicación registrada</td>
                <td className="py-2.5 px-3">Permitir ubicación en el navegador</td>
                <td className="py-2.5 px-3">Campañas por radio (1 a 5 km)</td>
              </tr>
              <tr className={activeSubOption === "option2" ? "bg-[#252429]" : ""}>
                <td className="py-2.5 px-3 font-bold text-[#e6e1e7] flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#60a5fa]" />
                  <span>Opción 2: Geofencing en Tiempo Real</span>
                </td>
                <td className="py-2.5 px-3">App Instalada (PWA/Capacitor)</td>
                <td className="py-2.5 px-3 text-[#10b981] font-bold">Sí (Pantalla apagada)</td>
                <td className="py-2.5 px-3">Tener la app instalada en el móvil</td>
                <td className="py-2.5 px-3">Alerta al cruzar la calle (300m)</td>
              </tr>
              <tr className={activeSubOption === "option3" ? "bg-[#252429]" : ""}>
                <td className="py-2.5 px-3 font-bold text-[#e6e1e7] flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[#10b981]" />
                  <span>Opción 3: Micro-Geofencing en Sala</span>
                </td>
                <td className="py-2.5 px-3">Red WiFi / NFC de Mesa</td>
                <td className="py-2.5 px-3 text-[#10b981] font-bold">100% Certero en local</td>
                <td className="py-2.5 px-3">Conectarse al WiFi o tocar mesa</td>
                <td className="py-2.5 px-3">Bienvenida inmediata y beneficio</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Selectores de Sub-Opciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            id: "option1",
            title: "1. Radio Geográfico Web",
            badge: "100% Web • Sin Descargas",
            badgeColor: "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30",
            icon: Compass,
            desc: "Segmenta y envía a comensales cuya última posición conocida está a cierta distancia.",
          },
          {
            id: "option2",
            title: "2. Geocerca Tiempo Real",
            badge: "App Instalada • Background",
            badgeColor: "bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/30",
            icon: Radio,
            desc: "Disparo automático por sensor GPS al cruzar la valla virtual aunque el teléfono esté en el bolsillo.",
          },
          {
            id: "option3",
            title: "3. Presencia en Sala",
            badge: "WiFi Local • 100% Físico",
            badgeColor: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30",
            icon: Wifi,
            desc: "Detección exacta cuando el cliente entra al restaurante y se sienta en su mesa.",
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubOption === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubOption(tab.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                isSelected
                  ? "bg-[#201f23] border-[var(--gold)] shadow-lg shadow-[var(--gold)]/10"
                  : "bg-[#1c1b1f] border-[#363439] hover:bg-[#252429] text-[#ccc3d8]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
                <Icon className={`w-4 h-4 ${isSelected ? "text-[var(--gold)]" : "text-[#958da1]"}`} />
              </div>
              <h4 className="text-sm font-bold text-[#e6e1e7] font-['Epilogue']">{tab.title}</h4>
              <p className="text-xs text-[#958da1] leading-relaxed">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {/* ÁREA DE CONFIGURACIÓN SEGÚN LA OPCIÓN SELECCIONADA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA (7 COLS): CONTROLES Y PARÁMETROS */}
        <div className="lg:col-span-7 space-y-6">
          {/* OPCIÓN 1: RADIO GEOGRÁFICO WEB */}
          {activeSubOption === "option1" && (
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#363439] pb-3">
                <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 font-['Epilogue']">
                  <Compass className="w-4 h-4 text-[var(--gold)]" />
                  <span>Configuración de Radio Geográfico (Web Push)</span>
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.option1_web_radius.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        option1_web_radius: { ...config.option1_web_radius, enabled: e.target.checked },
                      })
                    }
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${config.option1_web_radius.enabled ? "bg-[var(--gold)]" : "bg-[#2b292e]"}`}>
                    <div className={`w-4 h-4 rounded-full bg-[#121115] absolute top-0.5 transition-transform ${config.option1_web_radius.enabled ? "left-5" : "left-0.5"}`} />
                  </div>
                  <span className="text-xs text-[#ccc3d8] font-bold">Activo</span>
                </label>
              </div>

              {/* Centro del Restaurante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">Nombre de la Sede</label>
                  <input
                    type="text"
                    value={config.venue.name}
                    onChange={(e) => setConfig({ ...config, venue: { ...config.venue, name: e.target.value } })}
                    className="bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">Dirección Física</label>
                  <input
                    type="text"
                    value={config.venue.address}
                    onChange={(e) => setConfig({ ...config, venue: { ...config.venue, address: e.target.value } })}
                    className="bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">Latitud GPS</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={config.venue.latitude}
                    onChange={(e) => setConfig({ ...config, venue: { ...config.venue, latitude: parseFloat(e.target.value) || 0 } })}
                    className="bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] w-full font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">Longitud GPS</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={config.venue.longitude}
                    onChange={(e) => setConfig({ ...config, venue: { ...config.venue, longitude: parseFloat(e.target.value) || 0 } })}
                    className="bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] w-full font-mono"
                  />
                </div>
              </div>

              {/* Selector de Radio */}
              <div className="space-y-2 pt-2 border-t border-[#363439]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#ccc3d8]">Radio de Alcance Geográfico:</label>
                  <span className="text-xs font-bold text-[var(--gold)] font-mono">
                    {config.option1_web_radius.radiusMeters >= 1000
                      ? `${(config.option1_web_radius.radiusMeters / 1000).toFixed(1)} km`
                      : `${config.option1_web_radius.radiusMeters} metros`}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={config.option1_web_radius.radiusMeters}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      option1_web_radius: { ...config.option1_web_radius, radiusMeters: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-[var(--gold)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#958da1] font-mono">
                  <span>500 m (A pie)</span>
                  <span>2 km (Barrio/Comuna)</span>
                  <span>5 km (Sector urbano)</span>
                  <span>10 km (Ciudad)</span>
                </div>
              </div>

              {/* Solicitud de Ubicación Amigable */}
              <div className="p-4 rounded-xl bg-[#201f23] border border-[#363439] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#e6e1e7] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span>Aviso Amigable de Permiso de Ubicación en Mesa</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={config.option1_web_radius.requestLocationOnPlay}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        option1_web_radius: { ...config.option1_web_radius, requestLocationOnPlay: e.target.checked },
                      })
                    }
                    className="accent-[var(--gold)]"
                  />
                </div>
                <p className="text-[11px] text-[#958da1]">
                  Muestra un diálogo con beneficios antes de que el navegador pida la ubicación.
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={config.option1_web_radius.promptTitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        option1_web_radius: { ...config.option1_web_radius, promptTitle: e.target.value },
                      })
                    }
                    placeholder="Título del aviso"
                    className="bg-[#141317] border border-[#363439] rounded-lg px-3 py-1.5 text-xs text-[#e6e1e7] w-full"
                  />
                  <textarea
                    rows={2}
                    value={config.option1_web_radius.promptBody}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        option1_web_radius: { ...config.option1_web_radius, promptBody: e.target.value },
                      })
                    }
                    placeholder="Mensaje explicativo del beneficio"
                    className="bg-[#141317] border border-[#363439] rounded-lg px-3 py-1.5 text-xs text-[#ccc3d8] w-full"
                  />
                </div>
              </div>

              {/* Botón de prueba simulada */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-[#958da1]">
                  Audiencia estimada: <strong className="text-[var(--gold)]">{estimatedAudience} comensales</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestTrigger("option1")}
                  disabled={testingTrigger}
                  className="bg-[#2b292e] text-[var(--gold)] hover:bg-[#363439] border border-[var(--gold)]/40 font-bold rounded-xl px-4 py-2 text-xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Probar Disparo en Radio</span>
                </button>
              </div>

              {/* Comprobación REAL de geolocalización del navegador (haversine) */}
              <div className="p-4 rounded-xl bg-[#141317] border border-[#363439] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#e6e1e7] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span>Comprobar mi ubicación real vs. el radio</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCheckMyLocation}
                    disabled={geoChecking}
                    className="bg-[#201f23] text-[#ccc3d8] hover:text-white border border-[#363439] rounded-lg px-3 py-1.5 text-[11px] cursor-pointer flex items-center gap-1.5"
                  >
                    {geoChecking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Compass className="w-3 h-3" />}
                    <span>{geoChecking ? "Localizando..." : "Usar mi ubicación"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#958da1]">
                  Usa el GPS/ubicación real de este dispositivo y calcula la distancia exacta a la sede configurada.
                </p>
                {geoResult && (
                  geoResult.error ? (
                    <div className="text-[11px] text-red-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{geoResult.error}</span>
                    </div>
                  ) : (
                    <div className={`text-xs rounded-lg px-3 py-2 border ${geoResult.inside ? "bg-[#0d2e1f] border-[#10b981]/50 text-[#10b981]" : "bg-[#2b1f1f] border-amber-500/40 text-amber-300"}`}>
                      <div className="font-bold flex items-center gap-1.5">
                        {geoResult.inside ? <CheckCircle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                        {geoResult.inside ? "Dentro del radio de influencia" : "Fuera del radio de influencia"}
                      </div>
                      <div className="text-[11px] mt-1 text-[#ccc3d8]">
                        Distancia a la sede: <strong>{geoResult.distance >= 1000 ? `${(geoResult.distance / 1000).toFixed(2)} km` : `${geoResult.distance} m`}</strong>
                        {" · "}Radio configurado: <strong>{geoResult.radius >= 1000 ? `${(geoResult.radius / 1000).toFixed(1)} km` : `${geoResult.radius} m`}</strong>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* OPCIÓN 2: GEOFENCING EN TIEMPO REAL (APP INSTALADA / CAPACITOR) */}
          {activeSubOption === "option2" && (
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#363439] pb-3">
                <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 font-['Epilogue']">
                  <Radio className="w-4 h-4 text-[#60a5fa]" />
                  <span>Geofencing Automático de Entrada (App Móvil / PWA)</span>
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.option2_background_realtime.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        option2_background_realtime: {
                          ...config.option2_background_realtime,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${config.option2_background_realtime.enabled ? "bg-[#60a5fa]" : "bg-[#2b292e]"}`}>
                    <div className={`w-4 h-4 rounded-full bg-[#121115] absolute top-0.5 transition-transform ${config.option2_background_realtime.enabled ? "left-5" : "left-0.5"}`} />
                  </div>
                  <span className="text-xs text-[#ccc3d8] font-bold">Activo</span>
                </label>
              </div>

              {/* Aviso: esta estrategia requiere app nativa (Etapa 2) */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-[11px]">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Requiere app nativa (Etapa 2).</strong> El geofencing en segundo plano
                  (pantalla apagada) necesita empaquetar la app con Capacitor + OneSignal Location y
                  publicarla en las tiendas. Aquí puedes configurar el mensaje; la prueba muestra solo
                  una vista previa, no envía nada todavía.
                </span>
              </div>

              {/* Mensaje de Activación por Proximidad */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#ccc3d8] block">
                  Mensaje que se enviará automáticamente al cruzar el perímetro:
                </label>
                <input
                  type="text"
                  value={config.option2_background_realtime.messageTitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      option2_background_realtime: {
                        ...config.option2_background_realtime,
                        messageTitle: e.target.value,
                      },
                    })
                  }
                  placeholder="Título de la alerta al pasar"
                  className="bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] w-full"
                />
                <textarea
                  rows={2}
                  value={config.option2_background_realtime.messageBody}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      option2_background_realtime: {
                        ...config.option2_background_realtime,
                        messageBody: e.target.value,
                      },
                    })
                  }
                  placeholder="Cuerpo del mensaje"
                  className="bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#ccc3d8] w-full"
                />
              </div>

              {/* Parámetros de Seguridad y Anti-Spam */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#363439]">
                <div>
                  <label className="text-[11px] font-semibold text-[#958da1] uppercase block mb-1">
                    Radio de Geovalla
                  </label>
                  <select
                    value={config.option2_background_realtime.geofenceRadiusMeters}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        option2_background_realtime: {
                          ...config.option2_background_realtime,
                          geofenceRadiusMeters: parseInt(e.target.value),
                        },
                      })
                    }
                    className="bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] w-full"
                  >
                    <option value="200">200 metros (Misma cuadra)</option>
                    <option value="300">300 metros (A 2 cuadras)</option>
                    <option value="400">400 metros (Ideal Restaurante)</option>
                    <option value="600">600 metros (Barrio)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#958da1] uppercase block mb-1">
                    Enfriamiento (Anti-Spam)
                  </label>
                  <select
                    value={config.option2_background_realtime.cooldownHours}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        option2_background_realtime: {
                          ...config.option2_background_realtime,
                          cooldownHours: parseInt(e.target.value),
                        },
                      })
                    }
                    className="bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] w-full"
                  >
                    <option value="24">Máximo 1 vez cada 24 horas</option>
                    <option value="48">Máximo 1 vez cada 48 horas</option>
                    <option value="72">Máximo 1 vez cada 3 días</option>
                    <option value="168">Máximo 1 vez por semana</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#958da1] uppercase block mb-1">
                    Horario Permitido
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={config.option2_background_realtime.scheduleStart}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          option2_background_realtime: {
                            ...config.option2_background_realtime,
                            scheduleStart: e.target.value,
                          },
                        })
                      }
                      className="bg-[#201f23] border border-[#363439] rounded-lg px-2 py-1.5 text-xs text-[#e6e1e7] w-1/2 font-mono"
                    />
                    <span className="text-xs text-[#958da1]">-</span>
                    <input
                      type="time"
                      value={config.option2_background_realtime.scheduleEnd}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          option2_background_realtime: {
                            ...config.option2_background_realtime,
                            scheduleEnd: e.target.value,
                          },
                        })
                      }
                      className="bg-[#201f23] border border-[#363439] rounded-lg px-2 py-1.5 text-xs text-[#e6e1e7] w-1/2 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Guía Técnica para Empaquetar con Capacitor */}
              <div className="p-4 rounded-xl bg-[#141317] border border-[#363439] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#60a5fa] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Requisito Técnico para Segundo Plano Permanente</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("bun add @capacitor/core @capacitor-community/onesignal-location");
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="text-[10px] text-[#ccc3d8] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? "Copiado" : "Copiar comando"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#958da1] leading-relaxed">
                  Para que Android e iOS permitan rastrear la ubicación con la pantalla bloqueada, OneSignal requiere su paquete de geolocalización nativa mediante <strong>Capacitor</strong>:
                </p>
                <code className="block bg-[#0f0e12] p-2 rounded-lg text-[11px] font-mono text-[#60a5fa] border border-[#363439]">
                  bun add @capacitor/core @capacitor-community/onesignal-location
                </code>
              </div>

              {/* Botón de prueba simulada */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleTestTrigger("option2")}
                  disabled={testingTrigger}
                  className="bg-[#2b292e] text-[#60a5fa] hover:bg-[#363439] border border-[#60a5fa]/40 font-bold rounded-xl px-4 py-2 text-xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simular Cruce de Geovalla (300m)</span>
                </button>
              </div>
            </div>
          )}

          {/* OPCIÓN 3: MICRO-GEOFENCING EN SALA (WIFI / NFC) */}
          {activeSubOption === "option3" && (
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#363439] pb-3">
                <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 font-['Epilogue']">
                  <Wifi className="w-4 h-4 text-[#10b981]" />
                  <span>Detección de Llegada por WiFi o NFC en Mesa</span>
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.option3_venue_physical.enabled}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        option3_venue_physical: {
                          ...config.option3_venue_physical,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${config.option3_venue_physical.enabled ? "bg-[#10b981]" : "bg-[#2b292e]"}`}>
                    <div className={`w-4 h-4 rounded-full bg-[#121115] absolute top-0.5 transition-transform ${config.option3_venue_physical.enabled ? "left-5" : "left-0.5"}`} />
                  </div>
                  <span className="text-xs text-[#ccc3d8] font-bold">Activo</span>
                </label>
              </div>

              {/* Aviso: la detección WiFi/NFC es real; el push depende de suscripción */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/40 text-[#10b981] text-[11px]">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  La detección de llegada por <strong>WiFi (portal cautivo)</strong> y <strong>NFC</strong> ya
                  funciona en este sistema. El envío automático de la notificación de bienvenida requiere que
                  el comensal esté suscrito a Web Push (o, para 100% en segundo plano, la app nativa de la Etapa 2).
                </span>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#ccc3d8] block">
                  Mensaje de Bienvenida Inmediata en Mesa:
                </label>
                <input
                  type="text"
                  value={config.option3_venue_physical.messageTitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      option3_venue_physical: {
                        ...config.option3_venue_physical,
                        messageTitle: e.target.value,
                      },
                    })
                  }
                  placeholder="Título del mensaje al sentarse"
                  className="bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] w-full"
                />
                <textarea
                  rows={2}
                  value={config.option3_venue_physical.messageBody}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      option3_venue_physical: {
                        ...config.option3_venue_physical,
                        messageBody: e.target.value,
                      },
                    })
                  }
                  placeholder="Beneficio especial del comensal sentado"
                  className="bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#ccc3d8] w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#363439]">
                <div>
                  <label className="text-[11px] font-semibold text-[#958da1] uppercase block mb-1">
                    Tiempo de Espera tras Conexión
                  </label>
                  <select
                    value={config.option3_venue_physical.welcomeDelaySeconds}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        option3_venue_physical: {
                          ...config.option3_venue_physical,
                          welcomeDelaySeconds: parseInt(e.target.value),
                        },
                      })
                    }
                    className="bg-[#201f23] border border-[#363439] rounded-xl px-3 py-2 text-xs text-[#e6e1e7] w-full"
                  >
                    <option value="0">Inmediato (0 segundos)</option>
                    <option value="30">A los 30 segundos de sentarse</option>
                    <option value="60">A 1 minuto (Recomendado)</option>
                    <option value="180">A los 3 minutos</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#958da1] uppercase block mb-1">
                    Módulos Vinculados en el Sistema
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href="#/wifi"
                      className="px-3 py-1.5 rounded-lg bg-[#201f23] border border-[#363439] text-[#10b981] hover:border-[#10b981] text-xs flex items-center gap-1 font-bold"
                    >
                      <Wifi className="w-3.5 h-3.5" />
                      <span>Portal WiFi</span>
                    </a>
                    <a
                      href="#/nfc"
                      className="px-3 py-1.5 rounded-lg bg-[#201f23] border border-[#363439] text-[var(--gold)] hover:border-[var(--gold)] text-xs flex items-center gap-1 font-bold"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Mesas NFC</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Botón de prueba simulada */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleTestTrigger("option3")}
                  disabled={testingTrigger}
                  className="bg-[#2b292e] text-[#10b981] hover:bg-[#363439] border border-[#10b981]/40 font-bold rounded-xl px-4 py-2 text-xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simular Conexión a Mesa 04</span>
                </button>
              </div>
            </div>
          )}

          {/* Toast / Alerta de Notificación Simulada */}
          {testResult && (
            <div className="bg-[#201f23] border-2 border-[var(--gold)] rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top duration-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--gold)] text-[#121115] flex items-center justify-center font-bold shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--gold)]">{testResult.title}</span>
                    <span className="text-[10px] text-[#958da1] font-mono">{testResult.triggeredAt}</span>
                  </div>
                  <p className="text-xs text-[#e6e1e7]">{testResult.body}</p>
                  <span className="text-[10px] text-[#10b981] font-bold block pt-1">
                    ✓ Notificación disparada con éxito hacia el dispositivo
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA (5 COLS): RADAR / MAPA VISUAL INTERACTIVO */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h4 className="text-xs font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <Target className="w-4 h-4 text-[var(--gold)]" />
                <span>Radar de Alcance & Geovalla en Vivo</span>
              </h4>
              <span className="text-[10px] font-mono text-[#958da1]">Simulación 2D</span>
            </div>

            {/* Gráfico de Radar Circular */}
            <div className="relative w-full aspect-square max-w-[340px] mx-auto bg-[#121115] rounded-full border-2 border-[#363439] flex items-center justify-center overflow-hidden shadow-inner">
              {/* Anillos concéntricos */}
              <div className="absolute w-[85%] h-[85%] rounded-full border border-[#363439]/40 border-dashed" />
              <div className="absolute w-[60%] h-[60%] rounded-full border border-[#363439]/60" />
              <div className="absolute w-[35%] h-[35%] rounded-full border border-[#363439]/80" />

              {/* Geovalla activa coloreada */}
              <div
                className={`absolute rounded-full transition-all duration-500 pointer-events-none ${
                  activeSubOption === "option1"
                    ? "w-[75%] h-[75%] bg-[var(--gold)]/10 border-2 border-[var(--gold)] shadow-[0_0_25px_rgba(242,190,113,0.3)]"
                    : activeSubOption === "option2"
                    ? "w-[40%] h-[40%] bg-[#60a5fa]/15 border-2 border-[#60a5fa] animate-pulse shadow-[0_0_25px_rgba(96,165,250,0.4)]"
                    : "w-[20%] h-[20%] bg-[#10b981]/25 border-2 border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                }`}
              />

              {/* Centro: Restaurante */}
              <div className="relative z-10 w-9 h-9 rounded-full bg-[var(--gold)] text-[#121115] flex items-center justify-center font-bold shadow-lg border-2 border-white">
                <MapPin className="w-5 h-5" />
              </div>

              {/* Puntos de Comensales Simulados */}
              <div className="absolute top-[28%] left-[34%] w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
              <div className="absolute top-[28%] left-[34%] w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-sm" />

              <div className="absolute bottom-[35%] right-[28%] w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <div className="absolute top-[65%] left-[25%] w-2 h-2 rounded-full bg-[#60a5fa]" />
              <div className="absolute top-[18%] right-[30%] w-2 h-2 rounded-full bg-[#958da1]" />
              <div className="absolute bottom-[15%] left-[45%] w-2 h-2 rounded-full bg-[#958da1]" />

              {/* Barrido de radar */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--gold)]/5 to-transparent animate-spin origin-center pointer-events-none" style={{ animationDuration: "8s" }} />
            </div>

            {/* Leyenda del Radar */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-center pt-2 border-t border-[#363439]">
              <div className="p-2 rounded-xl bg-[#201f23]">
                <span className="text-[10px] text-[#958da1] block">Centro</span>
                <strong className="text-[var(--gold)]">{config.venue.name}</strong>
              </div>
              <div className="p-2 rounded-xl bg-[#201f23]">
                <span className="text-[10px] text-[#958da1] block">Radio Activo</span>
                <strong className="text-[#e6e1e7]">
                  {activeSubOption === "option1"
                    ? `${(config.option1_web_radius.radiusMeters / 1000).toFixed(1)} km`
                    : activeSubOption === "option2"
                    ? `${config.option2_background_realtime.geofenceRadiusMeters} m`
                    : "En Salón"}
                </strong>
              </div>
              <div className="p-2 rounded-xl bg-[#201f23]">
                <span className="text-[10px] text-[#958da1] block">Estatus</span>
                <strong className="text-[#10b981]">Sincronizado</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

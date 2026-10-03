import { useEffect, useState } from "react";
import {
  Loader2,
  Send,
  Bell,
  BellOff,
  Sparkles,
  Calendar,
  ExternalLink,
  Layers,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  Plus,
  Play,
  Key,
  Users,
  Zap,
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Sliders,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  Navigation,
  MapPin,
} from "lucide-react";
import { ImageUploader } from "../components/ImageUploader";
import { GeofencingPanel } from "../components/GeofencingPanel";

interface ActionButton {
  id: string;
  text: string;
  icon?: string;
  url?: string;
}

interface PushCampaign {
  id: string;
  title: string;
  body: string;
  url?: string;
  image?: string;
  segment?: string;
  scheduleType?: "immediate" | "scheduled";
  scheduledDate?: string;
  scheduledTime?: string;
  sentAt?: string;
  status: "ENVIADO" | "PROGRAMADO" | "CANCELADO";
  sentCount: number;
  deliveredCount?: number;
  openedCount: number;
  openRate: number;
  clickedCount?: number;
  lastOpenedAt?: string;
  channels?: { push?: boolean; webhook?: boolean };
}

interface PushFlow {
  id: string;
  name: string;
  trigger: string;
  active: boolean;
  title: string;
  body: string;
  image?: string;
  url?: string;
}

interface PushDraft {
  id: string;
  name?: string;
  title: string;
  body: string;
  url?: string;
  image?: string;
  segment?: string;
  scheduleType?: string;
  scheduledTime?: string;
  actionButtons?: ActionButton[];
  createdAt?: string;
}

interface PushSubscriber {
  id: string;
  endpoint: string;
  customerName?: string;
  customerWhatsapp?: string;
  status: "ACTIVE" | "UNSUBSCRIBED";
  subscribedAt?: string;
  subscribedAtFormatted?: string;
  unsubscribedAt?: string;
  unsubscribedAtFormatted?: string;
  unsubscribeReason?: string;
  deviceInfo?: string;
}

interface ScheduleConfig {
  allowedStart: string;
  allowedEnd: string;
  defaultLunchTime: string;
  defaultAfternoonTime: string;
  defaultDinnerTime: string;
  weekendStart?: string;
  weekendEnd?: string;
}

const DEFAULT_FLOWS: PushFlow[] = [
  {
    id: "flow_welcome",
    name: "Bienvenida en Mesa",
    trigger: "Al conectarse al WiFi o escanear el código QR",
    active: true,
    title: "✨ ¡Bienvenido a {restaurante}!",
    body: "Gira la ruleta de mesa y gana un beneficio gastronómico exclusivo para tu cuenta de hoy.",
    image: "/src/assets/tarta-vasca.jpg",
    url: "http://localhost:5173/?paso=3",
  },
  {
    id: "flow_retention_7d",
    name: "Recordatorio de Sellos (7 Días)",
    trigger: "Disparar tras 7 días sin registrar visitas",
    active: true,
    title: "🍰 ¡Te extrañamos en {restaurante}!",
    body: "¡Hola {nombre}! Tus sellos siguen esperándote. Ven esta semana y desbloquea tu próximo premio.",
    image: "",
    url: "http://localhost:5173/?paso=7",
  },
  {
    id: "flow_happy_hour",
    name: "Hora Feliz Automática (3:00 PM)",
    trigger: "Lunes a Viernes a las 3:00 PM",
    active: true,
    title: "⚡ ¡Comenzó la Hora Feliz!",
    body: "De 3 a 6 PM cada visita en mesa suma DOBLE SELLO (x2) en tu pasaporte de fidelización.",
    image: "/src/assets/cafe-latte.jpg",
    url: "http://localhost:5173/?paso=7",
  },
  {
    id: "flow_expiry_reminder",
    name: "Voucher por Vencer (24 Horas)",
    trigger: "24h antes de que expire un premio no canjeado",
    active: false,
    title: "⏳ ¡Tu cortesía vence pronto!",
    body: "Tienes un voucher disponible en mesa. Muestra tu código único en caja para redimirlo.",
    image: "",
    url: "http://localhost:5173/?paso=4",
  },
];

export function Push() {
  const [activeTab, setActiveTab] = useState<
    "history" | "broadcast" | "calendar" | "subscribers" | "flows" | "drafts" | "credentials" | "geofencing"
  >("history");

  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [subscribersList, setSubscribersList] = useState<PushSubscriber[]>([]);
  const [activeSubscribersCount, setActiveSubscribersCount] = useState<number>(0);
  const [unsubscribedCount, setUnsubscribedCount] = useState<number>(0);
  const [summary, setSummary] = useState({
    totalSent: 0,
    totalScheduled: 0,
    totalDelivered: 0,
    totalOpened: 0,
    avgOpenRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulario Broadcast / Rich Push
  const [formData, setFormData] = useState({
    title: "⚡ ¡Oferta Exclusiva de Hoy!",
    body: "Disfruta un 2x1 en cafés especiales y acumula doble sello en tu pasaporte de la casa.",
    url: "http://localhost:5173/",
    image: "/src/assets/cafe-latte.jpg",
    segment: "all",
    scheduleType: "immediate" as "immediate" | "scheduled",
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "12:30",
  });

  // Botones de acción interactivos
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([
    { id: "btn_claim", text: "Reclamar 🎁", url: "http://localhost:5173/?paso=3" },
    { id: "btn_menu", text: "Ver Menú 📜", url: "http://localhost:5173/" },
  ]);

  // Horarios de programación y calendario
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    allowedStart: "08:30",
    allowedEnd: "21:30",
    defaultLunchTime: "12:15",
    defaultAfternoonTime: "16:30",
    defaultDinnerTime: "19:45",
  });

  // Flujos automáticos
  const [flows, setFlows] = useState<PushFlow[]>(DEFAULT_FLOWS);

  // Borradores / Plantillas
  const [drafts, setDrafts] = useState<PushDraft[]>([]);

  // Credenciales OneSignal
  const [oneSignalConfig, setOneSignalConfig] = useState({
    appId: "8b945112-92a1-4320-9cb4-8d9487b320da",
    apiKey: "os_live_key_9824_sec_9934",
    safariWebId: "web.onesignal.auto.restaurante",
    enabled: true,
  });

  // Cargar datos del historial, suscriptores y borradores
  const loadData = () => {
    Promise.all([
      fetch("/api/push/history").then((r) => r.json()).catch(() => ({})),
      fetch("/api/push/subscribers").then((r) => r.json()).catch(() => ({})),
      fetch("/api/push/drafts").then((r) => r.json()).catch(() => ({})),
      fetch("/api/config").then((r) => r.json()).catch(() => ({})),
    ])
      .then(([historyData, subsData, draftsData, configData]) => {
        if (historyData && historyData.success) {
          if (Array.isArray(historyData.campaigns)) {
            setCampaigns(historyData.campaigns);
          }
          if (historyData.summary) {
            setSummary(historyData.summary);
          }
          if (historyData.scheduleConfig) {
            setScheduleConfig(historyData.scheduleConfig);
          }
        }

        if (subsData && subsData.success) {
          setActiveSubscribersCount(subsData.subscribersCount || 0);
          setUnsubscribedCount(subsData.unsubscribedCount || 0);
          if (Array.isArray(subsData.subscribers)) {
            setSubscribersList(subsData.subscribers);
          }
        }

        if (draftsData && Array.isArray(draftsData.drafts)) {
          setDrafts(draftsData.drafts);
        }

        if (configData && configData.settings) {
          if (Array.isArray(configData.settings.pushFlows) && configData.settings.pushFlows.length > 0) {
            setFlows(configData.settings.pushFlows);
          }
          if (configData.settings.pushConfig) {
            setOneSignalConfig((prev) => ({ ...prev, ...configData.settings.pushConfig }));
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Agregar tag a los campos
  const insertTag = (field: "title" | "body", tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] + " " + tag,
    }));
  };

  // Simular o registrar apertura de push en vivo
  const handleTrackOpen = async (campaignId: string) => {
    try {
      const res = await fetch("/api/push/track-open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`¡Apertura registrada para "${data.campaign.title}"! Tasa actual: ${data.campaign.openRate}%`);
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError("No se pudo registrar la apertura de prueba.");
    }
  };

  // Darse de baja manual de un suscriptor desde el panel
  const handleUnsubscribeUser = async (sub: PushSubscriber) => {
    try {
      const res = await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          customerWhatsapp: sub.customerWhatsapp,
          customerName: sub.customerName,
          reason: "Baja manual gestionada por administración",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Baja procesada para ${sub.customerName || sub.customerWhatsapp}`);
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError("Error al procesar la baja.");
    }
  };

  // Reactivar suscriptor desde el panel
  const handleResubscribeUser = async (sub: PushSubscriber) => {
    try {
      const res = await fetch("/api/push/resubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sub.id, endpoint: sub.endpoint }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Suscripción reactivada para ${sub.customerName}`);
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError("Error al reactivar suscriptor.");
    }
  };

  // Guardar configuración de horarios y calendario
  const handleSaveScheduleConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/push/schedule-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleConfig),
      });
      if (!res.ok) throw new Error("Error al guardar horarios");
      setSuccess("¡Horarios y calendario de envíos guardados exitosamente!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Error al guardar horarios");
    }
  };

  // Cancelar o eliminar campaña
  const handleCancelCampaign = async (id: string, action: "cancel" | "delete") => {
    try {
      const res = await fetch("/api/push/campaigns/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(action === "cancel" ? "Campaña programada cancelada" : "Campaña eliminada del registro");
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError("Error al modificar campaña");
    }
  };

  // Enviar / Programar Broadcast
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        title: formData.title,
        body: formData.body,
        url: formData.url,
        image: formData.image,
        segment: formData.segment,
        scheduleType: formData.scheduleType,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        actionButtons,
        channels: { push: true, webhook: true },
      };

      const res = await fetch("/api/push/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al procesar la notificación push");
      const data = await res.json();

      setSuccess(
        formData.scheduleType === "scheduled"
          ? `¡Campaña programada exitosamente para ${formData.scheduledDate} a las ${formData.scheduledTime}!`
          : `¡Rich Push enviado con éxito a los dispositivos suscritos!`
      );
      loadData();
      setActiveTab("history");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSending(false);
    }
  };

  // Guardar como Borrador / Plantilla
  const handleSaveDraft = async () => {
    try {
      const draftItem: PushDraft = {
        id: `draft_${Date.now()}`,
        name: formData.title.slice(0, 30) || "Borrador de Campaña",
        title: formData.title,
        body: formData.body,
        url: formData.url,
        image: formData.image,
        segment: formData.segment,
        scheduleType: formData.scheduleType,
        scheduledTime: formData.scheduledTime,
        actionButtons,
        createdAt: new Date().toLocaleDateString("es-CO"),
      };

      const res = await fetch("/api/push/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftItem),
      });

      if (!res.ok) throw new Error("Error al guardar borrador");
      const data = await res.json();
      if (Array.isArray(data.drafts)) setDrafts(data.drafts);

      setSuccess("¡Campaña guardada en la lista de borradores!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  // Cargar borrador en el editor
  const handleLoadDraft = (d: PushDraft) => {
    setFormData({
      title: d.title || "",
      body: d.body || "",
      url: d.url || "",
      image: d.image || "",
      segment: d.segment || "all",
      scheduleType: (d.scheduleType as "immediate" | "scheduled") || "immediate",
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: d.scheduledTime || "12:30",
    });
    if (Array.isArray(d.actionButtons)) {
      setActionButtons(d.actionButtons);
    }
    setActiveTab("broadcast");
    setSuccess(`Borrador "${d.name || d.title}" cargado en el editor`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Guardar flujos automáticos
  const handleSaveFlows = async () => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pushFlows: flows }),
      });
      if (!res.ok) throw new Error("Error al guardar flujos");
      setSuccess("¡Flujos automáticos guardados exitosamente!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  // Guardar credenciales de OneSignal
  const handleSaveOneSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pushConfig: oneSignalConfig }),
      });
      if (!res.ok) throw new Error("Error al guardar credenciales");
      setSuccess("¡Credenciales de OneSignal vinculadas con éxito!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Encabezado y Métricas Clave */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Epilogue'] text-[#e6e1e7] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#f2be71]" />
            <span>Módulo de Notificaciones Push & Gestión de Bajas</span>
          </h2>
          <p className="text-sm text-[#ccc3d8] mt-1">
            Supervisa el historial de envíos, personaliza horarios y calendario, mide cuántos abrieron tus alertas y gestiona solicitudes de baja.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 rounded-xl bg-[#201f23] border border-[#363439] text-[#ccc3d8] hover:text-[#f2be71] transition-colors cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("broadcast")}
            className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-4 py-2.5 text-xs hover:brightness-105 active:scale-98 transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>Nueva Campaña</span>
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}
      {success && (
        <div className="bg-[#10b981]/20 border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 4 TARJETAS KPI DE RENDIMIENTO GLOBAL DE PUSH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Enviadas */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#ccc3d8] uppercase">Campañas Enviadas</span>
            <div className="w-8 h-8 rounded-xl bg-[#f2be71]/10 border border-[#f2be71]/30 flex items-center justify-center text-[#f2be71]">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-['Epilogue'] text-[#e6e1e7]">{summary.totalSent}</span>
            <span className="text-xs text-[#958da1]">({summary.totalScheduled} programadas)</span>
          </div>
          <p className="text-[11px] text-[#ccc3d8] mt-1">{summary.totalDelivered} avisos entregados</p>
        </div>

        {/* KPI 2: Cuántos lo Abrieron (Aperturas Totales) */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#ccc3d8] uppercase">Aperturas Reales</span>
            <div className="w-8 h-8 rounded-xl bg-[#60a5fa]/10 border border-[#60a5fa]/30 flex items-center justify-center text-[#60a5fa]">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-['Epilogue'] text-[#60a5fa]">{summary.totalOpened}</span>
            <span className="text-xs text-[#10b981] font-bold">Leídos</span>
          </div>
          <p className="text-[11px] text-[#ccc3d8] mt-1">Comensales que abrieron el push</p>
        </div>

        {/* KPI 3: Tasa de Apertura Promedio (Open Rate) */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#ccc3d8] uppercase">Tasa de Apertura (CTR)</span>
            <div className="w-8 h-8 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-['Epilogue'] text-[#10b981]">{summary.avgOpenRate}%</span>
            <span className="text-xs text-[#10b981] font-semibold">Excelente</span>
          </div>
          <p className="text-[11px] text-[#ccc3d8] mt-1">Efectividad promedio de lectura</p>
        </div>

        {/* KPI 4: Suscriptores Activos vs Bajas */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#ccc3d8] uppercase">Audiencia & Bajas</span>
            <div className="w-8 h-8 rounded-xl bg-[#f2be71]/10 border border-[#f2be71]/30 flex items-center justify-center text-[#f2be71]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-['Epilogue'] text-[#f2be71]">{activeSubscribersCount}</span>
            <span className="text-xs text-[#10b981] font-bold">Activos</span>
            <span className="text-xs text-red-400 font-semibold">({unsubscribedCount} bajas)</span>
          </div>
          <p className="text-[11px] text-[#ccc3d8] mt-1">Base sincronizada con base de datos</p>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#363439] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-[#2b292e] text-[#f2be71] border-b-2 border-[#f2be71]"
              : "text-[#ccc3d8] hover:text-[#f2be71] hover:bg-[#1c1b1f]"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Historial & Aperturas ({campaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("broadcast")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "broadcast"
              ? "bg-[#2b292e] text-[#f2be71] border-b-2 border-[#f2be71]"
              : "text-[#ccc3d8] hover:text-[#f2be71] hover:bg-[#1c1b1f]"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Nueva Campaña / Redactar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("calendar")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "calendar"
              ? "bg-[#2b292e] text-[#f2be71] border-b-2 border-[#f2be71]"
              : "text-[#ccc3d8] hover:text-[#f2be71] hover:bg-[#1c1b1f]"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Horarios & Calendario</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("subscribers")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "subscribers"
              ? "bg-[#2b292e] text-[#f2be71] border-b-2 border-[#f2be71]"
              : "text-[#ccc3d8] hover:text-[#f2be71] hover:bg-[#1c1b1f]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Suscriptores & Bajas ({activeSubscribersCount}/{unsubscribedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("flows")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "flows"
              ? "bg-[#2b292e] text-[#f2be71] border-b-2 border-[#f2be71]"
              : "text-[#ccc3d8] hover:text-[#f2be71] hover:bg-[#1c1b1f]"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Flujos Automáticos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("drafts")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "drafts"
              ? "bg-[#2b292e] text-[#f2be71] border-b-2 border-[#f2be71]"
              : "text-[#ccc3d8] hover:text-[#f2be71] hover:bg-[#1c1b1f]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Plantillas ({drafts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("credentials")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "credentials"
              ? "bg-[#2b292e] text-[#f2be71] border-b-2 border-[#f2be71]"
              : "text-[#ccc3d8] hover:text-[#f2be71] hover:bg-[#1c1b1f]"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>OneSignal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("geofencing")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "geofencing"
              ? "bg-[#2b292e] text-[#f2be71] border-b-2 border-[#f2be71]"
              : "text-[#ccc3d8] hover:text-[#f2be71] hover:bg-[#1c1b1f]"
          }`}
        >
          <Navigation className="w-4 h-4 text-[#f2be71]" />
          <span>📍 Geofencing & Geolocalización</span>
        </button>
      </div>

      {/* 1. PESTAÑA PRINCIPAL: HISTORIAL DETALLADO DE ENVÍOS & APERTURAS */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#f2be71]" />
                <span>Historial de Envíos Push, Horarios y Tasa de Apertura</span>
              </h3>
              <p className="text-xs text-[#ccc3d8] mt-1">
                Visualiza el momento exacto en que fue enviada o programada cada notificación y mide cuántos clientes la abrieron.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#10b981] font-semibold bg-[#10b981]/10 px-3 py-1.5 rounded-full border border-[#10b981]/30">
                Sincronización en Tiempo Real
              </span>
            </div>
          </div>

          {/* Tabla de Campañas Enviadas */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0f0e12] border-b border-[#363439] text-[#ccc3d8] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Campaña / Contenido</th>
                    <th className="p-4">Horario & Fecha</th>
                    <th className="p-4">Audiencia</th>
                    <th className="p-4 text-center">Enviados</th>
                    <th className="p-4">Aperturas & Tasa de Apertura</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#363439]/60">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#ccc3d8]">
                        No hay campañas registradas todavía. Envía una desde "Nueva Campaña".
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => {
                      const isProgramado = c.status === "PROGRAMADO";
                      const isCancelado = c.status === "CANCELADO";

                      return (
                        <tr key={c.id} className="hover:bg-[#201f23]/60 transition-colors">
                          {/* Campaña */}
                          <td className="p-4 max-w-xs">
                            <div className="flex items-start gap-3">
                              {c.image ? (
                                <img
                                  src={c.image}
                                  alt="Banner"
                                  className="w-12 h-12 rounded-xl object-cover border border-[#363439] shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-[#252429] border border-[#363439] flex items-center justify-center text-[#f2be71] shrink-0">
                                  🔔
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="font-bold text-[#e6e1e7] text-xs line-clamp-1">{c.title}</h4>
                                <p className="text-[11px] text-[#ccc3d8] line-clamp-1 mt-0.5">{c.body}</p>
                                {c.lastOpenedAt && (
                                  <span className="text-[10px] text-[#958da1] block mt-1">
                                    Última apertura: {c.lastOpenedAt}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Horario & Fecha */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-[#ffddb1] font-mono font-semibold">
                              <Clock className="w-3.5 h-3.5 text-[#f2be71]" />
                              <span>{c.scheduledTime || "Horario Auto"}</span>
                            </div>
                            <span className="text-[10px] text-[#958da1] block mt-0.5">
                              {c.sentAt || c.scheduledDate || "Fecha actual"}
                            </span>
                          </td>

                          {/* Audiencia */}
                          <td className="p-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full bg-[#201f23] border border-[#363439] text-[#ccc3d8] text-[10px] font-semibold">
                              {c.segment || "Todos"}
                            </span>
                          </td>

                          {/* Enviados */}
                          <td className="p-4 text-center font-mono font-bold text-[#e6e1e7]">
                            {c.sentCount || 0}
                          </td>

                          {/* Aperturas & Barra de Tasa */}
                          <td className="p-4 min-w-[180px]">
                            {isProgramado ? (
                              <span className="text-[11px] text-[#958da1] italic">Pendiente de envío</span>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-[#60a5fa] font-bold font-mono">
                                    {c.openedCount} abiertas
                                  </span>
                                  <span className="text-[#10b981] font-bold font-mono">
                                    {c.openRate || 0}%
                                  </span>
                                </div>
                                <div className="w-full bg-[#141317] rounded-full h-2 border border-[#363439] overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-[#60a5fa] to-[#10b981] h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(4, c.openRate || 0))}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-[#958da1]">
                                  {c.clickedCount ? `${c.clickedCount} clics en botones` : "Sin clics registrados"}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Estado */}
                          <td className="p-4 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                isCancelado
                                  ? "bg-red-950/40 text-red-300 border border-red-500/40"
                                  : isProgramado
                                  ? "bg-amber-950/40 text-amber-300 border border-amber-500/40 animate-pulse"
                                  : "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="p-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isProgramado && (
                                <button
                                  type="button"
                                  onClick={() => handleTrackOpen(c.id)}
                                  className="px-2.5 py-1 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[#60a5fa] border border-[#363439] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                  title="Simular que un comensal abrió la notificación"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>+1 Apertura</span>
                                </button>
                              )}

                              {isProgramado && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelCampaign(c.id, "cancel")}
                                  className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleCancelCampaign(c.id, "delete")}
                                className="p-1.5 rounded-lg bg-[#201f23] hover:bg-red-950/50 text-[#ccc3d8] hover:text-red-300 transition-colors cursor-pointer"
                                title="Eliminar del historial"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PESTAÑA: PERSONALIZACIÓN DE HORARIOS & CALENDARIO GASTRONÓMICO */}
      {activeTab === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Configuración de Horarios & Ventanas de Envío */}
          <div className="lg:col-span-6 bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-[#363439] pb-4">
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#f2be71]" />
                <span>Personalizar Horarios Recomendados & Ventana Segura</span>
              </h3>
              <p className="text-xs text-[#ccc3d8] mt-1">
                Ajusta las franjas horarias ideales según los momentos de mayor consumo de tu restaurante (desayuno, almuerzo, merienda, cena).
              </p>
            </div>

            <form onSubmit={handleSaveScheduleConfig} className="space-y-5">
              {/* Presets de Turnos */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-[#f2be71] tracking-wider">
                  Horarios Predeterminados por Turno:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 bg-[#201f23] p-3 rounded-xl border border-[#363439]">
                    <label className="text-xs text-[#e6e1e7] font-semibold flex items-center gap-1.5">
                      <span>🍽️ Turno Almuerzo</span>
                    </label>
                    <input
                      type="time"
                      value={scheduleConfig.defaultLunchTime}
                      onChange={(e) => setScheduleConfig({ ...scheduleConfig, defaultLunchTime: e.target.value })}
                      className="bg-[#141317] border border-[#363439] text-[#f2be71] rounded-lg px-3 py-1.5 w-full text-xs font-mono font-bold focus:border-[#f2be71] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#958da1]">Ideal para promociones ejecutivas</span>
                  </div>

                  <div className="space-y-1.5 bg-[#201f23] p-3 rounded-xl border border-[#363439]">
                    <label className="text-xs text-[#e6e1e7] font-semibold flex items-center gap-1.5">
                      <span>☕ Tarde de Café & Repostería</span>
                    </label>
                    <input
                      type="time"
                      value={scheduleConfig.defaultAfternoonTime}
                      onChange={(e) => setScheduleConfig({ ...scheduleConfig, defaultAfternoonTime: e.target.value })}
                      className="bg-[#141317] border border-[#363439] text-[#f2be71] rounded-lg px-3 py-1.5 w-full text-xs font-mono font-bold focus:border-[#f2be71] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#958da1]">Hora pico de tartas y bebidas de autor</span>
                  </div>

                  <div className="space-y-1.5 bg-[#201f23] p-3 rounded-xl border border-[#363439]">
                    <label className="text-xs text-[#e6e1e7] font-semibold flex items-center gap-1.5">
                      <span>🍷 Turno Cena & Cócteles</span>
                    </label>
                    <input
                      type="time"
                      value={scheduleConfig.defaultDinnerTime}
                      onChange={(e) => setScheduleConfig({ ...scheduleConfig, defaultDinnerTime: e.target.value })}
                      className="bg-[#141317] border border-[#363439] text-[#f2be71] rounded-lg px-3 py-1.5 w-full text-xs font-mono font-bold focus:border-[#f2be71] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#958da1]">Reserva de mesas y ambiente nocturno</span>
                  </div>

                  <div className="space-y-1.5 bg-[#201f23] p-3 rounded-xl border border-[#363439]">
                    <label className="text-xs text-[#e6e1e7] font-semibold flex items-center gap-1.5">
                      <span>🥐 Desayuno & Apertura</span>
                    </label>
                    <input
                      type="time"
                      value={scheduleConfig.allowedStart}
                      onChange={(e) => setScheduleConfig({ ...scheduleConfig, allowedStart: e.target.value })}
                      className="bg-[#141317] border border-[#363439] text-[#f2be71] rounded-lg px-3 py-1.5 w-full text-xs font-mono font-bold focus:border-[#f2be71] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#958da1]">Café matutino y combos de panadería</span>
                  </div>
                </div>
              </div>

              {/* Ventana de Protección Anti-Spam */}
              <div className="space-y-3 border-t border-[#363439] pt-4">
                <h4 className="text-xs uppercase font-bold text-[#e6e1e7] tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                  <span>Ventana Segura de Envío (Cuidado al Cliente)</span>
                </h4>
                <p className="text-[11px] text-[#ccc3d8]">
                  Las notificaciones solo se enviarán entre la hora de apertura y cierre para garantizar que ningún cliente reciba alertas a deshoras.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#958da1] block mb-1">Hora Inicio Permitida</label>
                    <input
                      type="time"
                      value={scheduleConfig.allowedStart}
                      onChange={(e) => setScheduleConfig({ ...scheduleConfig, allowedStart: e.target.value })}
                      className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#958da1] block mb-1">Hora Límite Nocturna</label>
                    <input
                      type="time"
                      value={scheduleConfig.allowedEnd}
                      onChange={(e) => setScheduleConfig({ ...scheduleConfig, allowedEnd: e.target.value })}
                      className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-5 py-2.5 text-xs hover:brightness-105 active:scale-98 cursor-pointer transition-all shadow-md"
                >
                  Guardar Configuración de Horarios
                </button>
              </div>
            </form>
          </div>

          {/* Columna Derecha: Vista de Calendario de Notificaciones */}
          <div className="lg:col-span-6 bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="border-b border-[#363439] pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#f2be71]" />
                  <span>Calendario de Campañas Programadas</span>
                </h3>
                <p className="text-xs text-[#ccc3d8] mt-1">
                  Revisa los días y horas exactas en que saldrán tus próximos avisos push.
                </p>
              </div>
            </div>

            {/* Lista Cronológica de Próximos Envíos */}
            <div className="space-y-3">
              {campaigns.filter((c) => c.status === "PROGRAMADO").length === 0 ? (
                <div className="p-8 text-center bg-[#141317] rounded-xl border border-[#363439] text-[#ccc3d8] space-y-2">
                  <Calendar className="w-8 h-8 text-[#f2be71] mx-auto opacity-50" />
                  <p className="font-semibold text-xs">No hay envíos programados en el calendario</p>
                  <p className="text-[11px] text-[#958da1]">
                    Puedes programar una campaña seleccionando "Programar Fecha y Hora" en la pestaña Nueva Campaña.
                  </p>
                </div>
              ) : (
                campaigns
                  .filter((c) => c.status === "PROGRAMADO")
                  .map((camp) => (
                    <div
                      key={camp.id}
                      className="bg-[#201f23] border border-[#f2be71]/40 rounded-xl p-4 flex items-start justify-between gap-3 shadow-md"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/50 text-[#f2be71] border border-[#f2be71]/40 text-[10px] font-bold font-mono">
                            📅 {camp.scheduledDate || "Próximamente"} • {camp.scheduledTime || "12:00"}
                          </span>
                          <span className="text-[10px] text-[#958da1]">({camp.segment || "Todos"})</span>
                        </div>
                        <h4 className="font-bold text-xs text-[#e6e1e7]">{camp.title}</h4>
                        <p className="text-[11px] text-[#ccc3d8] line-clamp-1">{camp.body}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCancelCampaign(camp.id, "cancel")}
                          className="px-2 py-1 rounded bg-red-950/40 text-red-300 border border-red-500/30 text-[10px] font-semibold hover:bg-red-900/50 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Accesos rápidos de programación */}
            <div className="bg-[#141317] rounded-xl p-4 border border-[#363439] space-y-2">
              <span className="text-xs font-bold text-[#ffddb1] block">
                ⚡ Sugerencia de Contenido para Hoy:
              </span>
              <p className="text-xs text-[#ccc3d8] leading-relaxed">
                Los días de mayor apertura son los <strong>Viernes y Sábados</strong> entre las <strong>4:00 PM y 7:00 PM</strong> con ofertas relacionadas a postres y cafés especiales.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. PESTAÑA: SUSCRIPTORES & REGISTRO DE BAJAS (BASE DE DATOS) */}
      {activeTab === "subscribers" && (
        <div className="space-y-6">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#f2be71]" />
                <span>Base de Datos de Suscriptores & Solicitudes de Baja</span>
              </h3>
              <p className="text-xs text-[#ccc3d8] mt-1">
                Registro transparente conectado a la base de datos: cada vez que un comensal pulsa "Darse de baja", queda registrado con fecha y motivo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-bold">
                {activeSubscribersCount} Activos
              </span>
              <span className="text-xs px-3 py-1.5 rounded-full bg-red-950/40 text-red-300 border border-red-500/40 font-bold">
                {unsubscribedCount} Dados de Baja
              </span>
            </div>
          </div>

          {/* Tabla de Suscriptores y Bajas */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0f0e12] border-b border-[#363439] text-[#ccc3d8] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Cliente / Dispositivo</th>
                    <th className="p-4">WhatsApp / ID</th>
                    <th className="p-4">Fecha Suscripción</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4">Fecha y Motivo de Baja</th>
                    <th className="p-4 text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#363439]/60">
                  {subscribersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#ccc3d8]">
                        No hay suscriptores registrados aún. Se agregarán automáticamente cuando los clientes escaneen la mesa.
                      </td>
                    </tr>
                  ) : (
                    subscribersList.map((sub) => {
                      const isUnsub = sub.status === "UNSUBSCRIBED";

                      return (
                        <tr key={sub.id} className="hover:bg-[#201f23]/60 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-[#e6e1e7]">{sub.customerName || "Invitado Web"}</div>
                            <span className="text-[10px] text-[#958da1] line-clamp-1">
                              {sub.deviceInfo || sub.endpoint?.slice(0, 35) + "..."}
                            </span>
                          </td>

                          <td className="p-4 font-mono text-[#ccc3d8]">
                            {sub.customerWhatsapp || "Sin WhatsApp"}
                          </td>

                          <td className="p-4 text-[#ccc3d8] whitespace-nowrap">
                            {sub.subscribedAtFormatted || (sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString("es-CO") : "Reciente")}
                          </td>

                          <td className="p-4 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                isUnsub
                                  ? "bg-red-950/40 text-red-300 border border-red-500/40"
                                  : "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40"
                              }`}
                            >
                              {isUnsub ? "DADO DE BAJA" : "ACTIVO"}
                            </span>
                          </td>

                          <td className="p-4 max-w-xs">
                            {isUnsub ? (
                              <div className="space-y-0.5">
                                <span className="text-red-300 font-mono text-[11px] block">
                                  {sub.unsubscribedAtFormatted || (sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toLocaleString("es-CO") : "Baja")}
                                </span>
                                <span className="text-[10px] text-[#958da1] italic block line-clamp-1">
                                  {sub.unsubscribeReason || "Solicitud directa del usuario"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#10b981] font-semibold">
                                Recibiendo avisos normalmente
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right whitespace-nowrap">
                            {isUnsub ? (
                              <button
                                type="button"
                                onClick={() => handleResubscribeUser(sub)}
                                className="px-3 py-1.5 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[#10b981] border border-[#10b981]/30 text-xs font-semibold cursor-pointer transition-colors"
                              >
                                Reactivar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUnsubscribeUser(sub)}
                                className="px-3 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-semibold cursor-pointer transition-colors"
                              >
                                Dar de Baja
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. PESTAÑA: NUEVA CAMPAÑA / RICH PUSH */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulario Editor */}
          <form onSubmit={handleBroadcast} className="lg:col-span-7 bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-[#363439] pb-4 flex items-center justify-between">
              <h3 className="text-[#e6e1e7] font-bold text-base font-['Epilogue']">
                Redactar Notificación Rich Push
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-3 py-1.5 rounded-lg bg-[#201f23] border border-[#363439] text-[#ccc3d8] hover:text-[#f2be71] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Guardar Borrador</span>
                </button>
              </div>
            </div>

            {/* Título con Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#ccc3d8] font-semibold">Título de la Notificación *</label>
                <div className="flex items-center gap-1 text-[10px] text-[#ccc3d8]">
                  <span>Insertar:</span>
                  <button type="button" onClick={() => insertTag("title", "{nombre}")} className="px-1.5 py-0.5 rounded bg-[#201f23] text-[#f2be71] hover:bg-[#2b292e]">{`{nombre}`}</button>
                  <button type="button" onClick={() => insertTag("title", "{restaurante}")} className="px-1.5 py-0.5 rounded bg-[#201f23] text-[#f2be71] hover:bg-[#2b292e]">{`{restaurante}`}</button>
                </div>
              </div>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: ⚡ ¡Hora Feliz hoy 2x1 en tu mesa!"
                className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
              />
            </div>

            {/* Mensaje con Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#ccc3d8] font-semibold">Mensaje Principal (Cuerpo) *</label>
                <div className="flex items-center gap-1 text-[10px] text-[#ccc3d8]">
                  <span>Insertar:</span>
                  <button type="button" onClick={() => insertTag("body", "{nombre}")} className="px-1.5 py-0.5 rounded bg-[#201f23] text-[#f2be71] hover:bg-[#2b292e]">{`{nombre}`}</button>
                  <button type="button" onClick={() => insertTag("body", "{mesa}")} className="px-1.5 py-0.5 rounded bg-[#201f23] text-[#f2be71] hover:bg-[#2b292e]">{`{mesa}`}</button>
                  <button type="button" onClick={() => insertTag("body", "{premio}")} className="px-1.5 py-0.5 rounded bg-[#201f23] text-[#f2be71] hover:bg-[#2b292e]">{`{premio}`}</button>
                </div>
              </div>
              <textarea
                required
                rows={3}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Escribe el mensaje persuasivo para tus comensales..."
                className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm resize-none"
              />
            </div>

            {/* Rich Push: Imagen Destacada */}
            <ImageUploader
              label="Banner Destacado de Notificación (OneSignal Big Picture)"
              value={formData.image}
              onChange={(val) => setFormData({ ...formData, image: val })}
              recommendedDimensions="1024 x 512 px (Horizontal)"
              aspectRatio="2:1 panorámica"
              maxWeight="Menor a 350 KB"
              formats="JPG o PNG optimizado"
              description="Aparece desplegado en tamaño grande en la bandeja de notificaciones al llegar el aviso."
              placeholder="Pega URL o sube el banner desde tu equipo"
              previewHeight="h-20"
            />

            {/* URL Destino */}
            <div className="space-y-2">
              <label className="text-xs text-[#ccc3d8] font-semibold flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-[#f2be71]" />
                <span>URL de Destino al Tocar la Notificación</span>
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="http://localhost:5173/..."
                className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-sm"
              />
            </div>

            {/* Botones de Acción Interactivos */}
            <div className="space-y-3 border-t border-[#363439] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#e6e1e7]">Botones de Acción Rápida (Action Buttons)</h4>
                  <p className="text-[11px] text-[#ccc3d8]/80">Permite al comensal reclamar o interactuar directamente.</p>
                </div>
                {actionButtons.length < 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (actionButtons.length < 3) {
                        setActionButtons([
                          ...actionButtons,
                          { id: `btn_${Date.now()}`, text: "Nuevo Botón", url: "http://localhost:5173/" },
                        ]);
                      }
                    }}
                    className="text-xs text-[#f2be71] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Agregar Botón
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {actionButtons.map((btn, idx) => (
                  <div key={btn.id} className="flex items-center gap-2 bg-[#201f23] p-2.5 rounded-xl border border-[#363439]">
                    <span className="text-xs font-bold text-[#f2be71] w-5">#{idx + 1}</span>
                    <input
                      type="text"
                      value={btn.text}
                      onChange={(e) => {
                        const updated = [...actionButtons];
                        updated[idx].text = e.target.value;
                        setActionButtons(updated);
                      }}
                      placeholder="Texto del botón (ej: Reclamar)"
                      className="bg-[#1c1b1f] border border-[#363439] text-[#e6e1e7] px-3 py-1.5 rounded-lg text-xs flex-1"
                    />
                    <input
                      type="text"
                      value={btn.url || ""}
                      onChange={(e) => {
                        const updated = [...actionButtons];
                        updated[idx].url = e.target.value;
                        setActionButtons(updated);
                      }}
                      placeholder="URL de acción"
                      className="bg-[#1c1b1f] border border-[#363439] text-[#e6e1e7] px-3 py-1.5 rounded-lg text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setActionButtons(actionButtons.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      title="Eliminar botón"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Segmentación y Momento del Envío */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#363439] pt-4">
              <div>
                <label className="text-xs text-[#ccc3d8] font-semibold block mb-2">Segmento de Audiencia</label>
                <select
                  value={formData.segment}
                  onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2.5 w-full text-xs"
                >
                  <option value="all">👥 Todos los Suscriptores ({activeSubscribersCount})</option>
                  <option value="geofence_near">📍 Comensales en Radio Cercano (Geofence &lt; 2 km)</option>
                  <option value="venue_wifi">📶 Clientes Conectados al WiFi en Sala Hoy</option>
                  <option value="table_active">🪑 Comensales en Mesa Hoy</option>
                  <option value="inactive_7d">⏳ Inactivos (+7 Días sin Visitar)</option>
                  <option value="vip">🌟 Clientes VIP (+5 Sellos Acumulados)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#ccc3d8] font-semibold block mb-2">Momento del Envío</label>
                <select
                  value={formData.scheduleType}
                  onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value as "immediate" | "scheduled" })}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2.5 w-full text-xs"
                >
                  <option value="immediate">⚡ Envío Inmediato</option>
                  <option value="scheduled">📅 Programar Fecha y Horario Personalizado</option>
                </select>
              </div>
            </div>

            {/* Selección de Fecha y Horario Personalizado */}
            {formData.scheduleType === "scheduled" && (
              <div className="space-y-3 p-4 rounded-xl bg-[#201f23] border border-[#f2be71]/40 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#ffddb1] font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#f2be71]" />
                    <span>Personalizar Fecha y Horario de Lanzamiento:</span>
                  </label>
                  <span className="text-[10px] text-[#10b981] font-mono">Ventana: {scheduleConfig.allowedStart} a {scheduleConfig.allowedEnd}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#ccc3d8] block mb-1">Fecha en Calendario</label>
                    <input
                      type="date"
                      required
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="bg-[#1c1b1f] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs focus:border-[#f2be71]/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#ccc3d8] block mb-1">Horario Exacto</label>
                    <input
                      type="time"
                      required
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="bg-[#1c1b1f] border border-[#363439] text-[#f2be71] font-bold rounded-xl px-3 py-2 w-full text-xs focus:border-[#f2be71]/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Presets de 1 Clic */}
                <div className="pt-2 border-t border-[#363439]">
                  <span className="text-[10px] uppercase font-bold text-[#958da1] block mb-1.5">
                    Horarios de Alto Impacto Gastronómico:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, scheduledTime: scheduleConfig.defaultLunchTime })}
                      className="px-2.5 py-1 rounded-lg bg-[#141317] hover:bg-[#2b292e] text-[#ffddb1] border border-[#363439] text-[11px] cursor-pointer"
                    >
                      🍽️ Almuerzo ({scheduleConfig.defaultLunchTime})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, scheduledTime: scheduleConfig.defaultAfternoonTime })}
                      className="px-2.5 py-1 rounded-lg bg-[#141317] hover:bg-[#2b292e] text-[#ffddb1] border border-[#363439] text-[11px] cursor-pointer"
                    >
                      ☕ Tarde Café ({scheduleConfig.defaultAfternoonTime})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, scheduledTime: scheduleConfig.defaultDinnerTime })}
                      className="px-2.5 py-1 rounded-lg bg-[#141317] hover:bg-[#2b292e] text-[#ffddb1] border border-[#363439] text-[11px] cursor-pointer"
                    >
                      🍷 Cena ({scheduleConfig.defaultDinnerTime})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Envío */}
            <div className="pt-4 flex items-center justify-between border-t border-[#363439]">
              <span className="text-xs text-[#ccc3d8]/80">
                Se enviará a través de Web Push & OneSignal Engine.
              </span>
              <button
                type="submit"
                disabled={sending}
                className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm shadow-lg disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {formData.scheduleType === "scheduled" ? "Programar en Calendario" : "Enviar Broadcast Ahora"}
              </button>
            </div>
          </form>

          {/* Vista Previa Móvil */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[340px] bg-[#000000] rounded-[42px] p-3.5 border-4 border-[#363439] shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative">
              <div className="w-24 h-4 bg-[#141317] rounded-full mx-auto mb-4" />

              <div className="text-center mb-3">
                <span className="text-[10px] text-[#ccc3d8] font-mono tracking-widest uppercase">
                  Vista Previa en Vivo (Móvil)
                </span>
              </div>

              <div className="rounded-2xl bg-[#1c1b1f]/95 border border-white/10 p-3.5 shadow-2xl backdrop-blur-md flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[11px] text-[#ccc3d8]">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <div className="w-5 h-5 rounded-full bg-[#f2be71] flex items-center justify-center text-[#121115] text-[10px] font-black">
                      🔔
                    </div>
                    <span>Tu Negocio</span>
                  </div>
                  <span className="text-[10px] text-[#ccc3d8]/70">Ahora</span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#ffddb1]">
                    {formData.title || "Título de la notificación"}
                  </h4>
                  <p className="text-[11px] text-[#e6e1e7]/90 leading-tight mt-0.5">
                    {formData.body || "Cuerpo de la notificación..."}
                  </p>
                </div>

                {formData.image && (
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-black/40 border border-white/5 relative">
                    <img
                      src={formData.image}
                      alt="Banner"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                {actionButtons.length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/10">
                    {actionButtons.map((btn) => (
                      <div
                        key={btn.id}
                        className="py-1.5 px-2 rounded-lg bg-white/10 text-white font-semibold text-[11px] text-center truncate"
                      >
                        {btn.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 text-center text-[10px] text-[#ccc3d8]/60">
                Así verán tus clientes la alerta en su pantalla de bloqueo.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PESTAÑA: FLUJOS AUTOMÁTICOS */}
      {activeTab === "flows" && (
        <div className="space-y-6">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">
                Flujos de Notificaciones Automatizadas (Drip Campaigns)
              </h3>
              <p className="text-xs text-[#ccc3d8] mt-1">
                Disparadores automáticos basados en eventos reales del comensal (Check-in, inactividad, horario feliz).
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveFlows}
              className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-5 py-2.5 text-xs hover:brightness-105 active:scale-98 transition-all cursor-pointer shadow-md"
            >
              Guardar Todos los Flujos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {flows.map((flow, idx) => (
              <div
                key={flow.id}
                className={`rounded-2xl border p-5 transition-all flex flex-col justify-between gap-4 ${
                  flow.active
                    ? "bg-[#1c1b1f] border-[#f2be71]/40 shadow-lg"
                    : "bg-[#18171a] border-[#2b292e] opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-3 border-b border-[#363439] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#ffddb1] font-['Epilogue']">
                        {flow.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          flow.active
                            ? "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30"
                            : "bg-[#201f23] text-[#ccc3d8]"
                        }`}
                      >
                        {flow.active ? "ACTIVO" : "PAUSADO"}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#f2be71] mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{flow.trigger}</span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={flow.active}
                      onChange={(e) => {
                        const updated = [...flows];
                        updated[idx].active = e.target.checked;
                        setFlows(updated);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#2b292e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f2be71]" />
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-[#ccc3d8] font-semibold block mb-1">Título</label>
                    <input
                      type="text"
                      value={flow.title}
                      onChange={(e) => {
                        const updated = [...flows];
                        updated[idx].title = e.target.value;
                        setFlows(updated);
                      }}
                      className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs focus:border-[#f2be71]/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#ccc3d8] font-semibold block mb-1">Mensaje</label>
                    <textarea
                      rows={2}
                      value={flow.body}
                      onChange={(e) => {
                        const updated = [...flows];
                        updated[idx].body = e.target.value;
                        setFlows(updated);
                      }}
                      className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs focus:border-[#f2be71]/60 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PESTAÑA: BORRADORES */}
      {activeTab === "drafts" && (
        <div className="space-y-4">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">
                Plantillas & Campañas Guardadas
              </h3>
              <p className="text-xs text-[#ccc3d8] mt-1">
                Reutiliza mensajes exitosos, duplícalos o cárgalos en el editor para enviar inmediatamente.
              </p>
            </div>
          </div>

          {drafts.length === 0 ? (
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-12 text-center text-[#ccc3d8]">
              <Layers className="w-10 h-10 text-[#f2be71] mx-auto mb-3 opacity-60" />
              <p className="font-semibold text-sm">No tienes plantillas guardadas aún</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[#f2be71]/40 transition-all shadow-md"
                >
                  <div>
                    <h4 className="font-bold text-sm text-[#e6e1e7] mb-1">{d.name || d.title}</h4>
                    <p className="text-xs text-[#ccc3d8] line-clamp-2 leading-relaxed">{d.body}</p>
                  </div>

                  <div className="border-t border-[#363439] pt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadDraft(d)}
                      className="px-3 py-1.5 rounded-lg bg-[#f2be71] text-[#121115] font-bold text-xs hover:brightness-105 cursor-pointer"
                    >
                      Usar Campaña
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. PESTAÑA: CREDENCIALES ONESIGNAL */}
      {activeTab === "credentials" && (
        <form onSubmit={handleSaveOneSignal} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 max-w-2xl shadow-xl">
          <div className="border-b border-[#363439] pb-4">
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Key className="w-5 h-5 text-[#f2be71]" />
              <span>Credenciales OneSignal</span>
            </h3>
            <p className="text-xs text-[#ccc3d8] mt-1">
              Ingresa tus llaves de OneSignal para habilitar la entrega de notificaciones en Chrome, Safari, Android e iOS.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#ccc3d8] font-semibold block mb-2">OneSignal App ID *</label>
              <input
                type="text"
                required
                value={oneSignalConfig.appId}
                onChange={(e) => setOneSignalConfig({ ...oneSignalConfig, appId: e.target.value })}
                placeholder="Ej: 8b945112-92a1-4320-9cb4-8d9487b320da"
                className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-[#ccc3d8] font-semibold block mb-2">OneSignal REST API Key *</label>
              <input
                type="password"
                required
                value={oneSignalConfig.apiKey}
                onChange={(e) => setOneSignalConfig({ ...oneSignalConfig, apiKey: e.target.value })}
                placeholder="os_live_key_..."
                className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-xs font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 transition-all cursor-pointer text-sm shadow-md"
              >
                Guardar Credenciales OneSignal
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 8. PESTAÑA: GEOFENCING & NOTIFICACIONES POR PROXIMIDAD */}
      {activeTab === "geofencing" && <GeofencingPanel />}
    </div>
  );
}

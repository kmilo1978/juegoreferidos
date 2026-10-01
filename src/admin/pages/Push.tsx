import { useEffect, useState } from "react";
import {
  Loader2,
  Send,
  Bell,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  Smartphone,
  Plus,
  Play,
  Key,
  Users,
  MessageSquare,
  Zap,
} from "lucide-react";
import { ImageUploader } from "../components/ImageUploader";

interface ActionButton {
  id: string;
  text: string;
  icon?: string;
  url?: string;
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
  const [activeTab, setActiveTab] = useState<"broadcast" | "flows" | "drafts" | "credentials">("broadcast");
  const [subscribers, setSubscribers] = useState(1);
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
    segment: "all", // "all" | "table_active" | "inactive_7d" | "vip"
    scheduleType: "immediate", // "immediate" | "scheduled"
    scheduledTime: "",
  });

  // Botones de acción interactivos
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([
    { id: "btn_claim", text: "Reclamar 🎁", url: "http://localhost:5173/?paso=3" },
    { id: "btn_menu", text: "Ver Menú 📜", url: "http://localhost:5173/" },
  ]);

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

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      fetch("/api/push/subscribers").then((r) => r.json()).catch(() => ({})),
      fetch("/api/push/drafts").then((r) => r.json()).catch(() => ({})),
      fetch("/api/config").then((r) => r.json()).catch(() => ({})),
    ])
      .then(([subsData, draftsData, configData]) => {
        if (subsData && typeof subsData.subscribersCount === "number") {
          setSubscribers(Math.max(subsData.subscribersCount, 1));
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
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Agregar tag a los campos
  const insertTag = (field: "title" | "body", tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] + " " + tag,
    }));
  };

  // Agregar botón de acción
  const handleAddActionButton = () => {
    if (actionButtons.length >= 3) return;
    setActionButtons((prev) => [
      ...prev,
      { id: `btn_${Date.now()}`, text: "Nuevo Botón", url: "http://localhost:5173/" },
    ]);
  };

  // Eliminar botón de acción
  const handleRemoveActionButton = (idx: number) => {
    setActionButtons((prev) => prev.filter((_, i) => i !== idx));
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
        scheduledTime: formData.scheduledTime,
        actionButtons,
        channels: { push: true, webhook: true },
      };

      const res = await fetch("/api/push/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al enviar notificación push");
      const data = await res.json();

      setSuccess(
        formData.scheduleType === "scheduled"
          ? `¡Campaña programada exitosamente para ${formData.scheduledTime}!`
          : `¡Rich Push enviado con éxito a todos los dispositivos suscritos!`
      );
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
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
    } catch (err) {
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
      scheduleType: d.scheduleType || "immediate",
      scheduledTime: d.scheduledTime || "",
    });
    if (Array.isArray(d.actionButtons)) {
      setActionButtons(d.actionButtons);
    }
    setActiveTab("broadcast");
    setSuccess(`Borrador "${d.name || d.title}" cargado en el editor`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Duplicar / Copiar campaña
  const handleCopyDraft = async (d: PushDraft) => {
    try {
      const copyItem: PushDraft = {
        ...d,
        id: `draft_${Date.now()}`,
        name: `${d.name || d.title} (Copia)`,
        createdAt: new Date().toLocaleDateString("es-CO"),
      };

      const res = await fetch("/api/push/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copyItem),
      });

      if (!res.ok) throw new Error("Error al duplicar plantilla");
      const data = await res.json();
      if (Array.isArray(data.drafts)) setDrafts(data.drafts);

      setSuccess(`Campaña duplicada como "${copyItem.name}"`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al duplicar");
    }
  };

  // Eliminar borrador
  const handleDeleteDraft = async (id: string) => {
    try {
      const res = await fetch("/api/push/drafts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Error al eliminar borrador");
      const data = await res.json();
      if (Array.isArray(data.drafts)) setDrafts(data.drafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
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
    } catch (err) {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  // Probar flujo individual
  const handleTestFlow = async (flow: PushFlow) => {
    try {
      await fetch("/api/push/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: flow.title.replace("{restaurante}", "El Restaurante").replace("{nombre}", "Comensal"),
          body: flow.body.replace("{restaurante}", "El Restaurante").replace("{nombre}", "Comensal"),
          url: flow.url || "http://localhost:5173/",
          image: flow.image || "",
          scheduleType: "immediate",
        }),
      });
      setSuccess(`Notificación de prueba enviada para: "${flow.name}"`);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Error al enviar prueba del flujo");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Encabezado y Métricas Rápidas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Epilogue'] text-[#e6e1e7] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#f2be71]" />
            Notificaciones Push & OneSignal Pro
          </h2>
          <p className="text-sm text-[#ccc3d8] mt-1">
            Difusión masiva con Rich Media, botones de acción interactivos, programación de envíos y flujos automáticos.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#1c1b1f] border border-[#363439] px-4 py-2.5 rounded-2xl">
          <div className="w-3 h-3 rounded-full bg-[#10b981] animate-pulse" />
          <div>
            <div className="text-[10px] uppercase font-bold text-[#ccc3d8]">Suscriptores Web Activos</div>
            <div className="text-lg font-bold font-['Epilogue'] text-[#f2be71]">{subscribers} Móviles</div>
          </div>
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

      {/* Pestañas de Navegación estilo Stitch */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#363439] pb-2">
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
          <span>Nueva Campaña / Rich Push</span>
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
          <span>Flujos Automáticos (Drip)</span>
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
          <span>Borradores & Campañas ({drafts.length})</span>
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
          <span>Configuración OneSignal</span>
        </button>
      </div>

      {/* 1. PESTAÑA: NUEVA CAMPAÑA / RICH PUSH */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulario Editor */}
          <form onSubmit={handleBroadcast} className="lg:col-span-7 bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
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

            {/* Rich Push: Imagen Destacada (Big Picture) con Especificaciones Sugeridas */}
            <ImageUploader
              label="Banner Destacado de Notificación (OneSignal Big Picture)"
              value={formData.image}
              onChange={(val) => setFormData({ ...formData, image: val })}
              recommendedDimensions="1024 x 512 px (Horizontal)"
              aspectRatio="2:1 panorámica"
              maxWeight="Menor a 350 KB"
              formats="JPG o PNG optimizado"
              description="Aparece desplegado en tamaño grande en la bandeja de notificaciones de Android, Windows y macOS al llegar el aviso."
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

            {/* Botones de Acción Interactivos (OneSignal Action Buttons) */}
            <div className="space-y-3 border-t border-[#363439] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#e6e1e7]">Botones de Acción Rápida (Action Buttons)</h4>
                  <p className="text-[11px] text-[#ccc3d8]/80">Permite al usuario interactuar sin abrir el navegador.</p>
                </div>
                {actionButtons.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddActionButton}
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
                      onClick={() => handleRemoveActionButton(idx)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      title="Eliminar botón"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Segmentación y Programación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#363439] pt-4">
              <div>
                <label className="text-xs text-[#ccc3d8] font-semibold block mb-2">Segmento de Audiencia</label>
                <select
                  value={formData.segment}
                  onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2.5 w-full text-xs"
                >
                  <option value="all">👥 Todos los Suscriptores ({subscribers})</option>
                  <option value="table_active">🪑 Comensales en Mesa Hoy</option>
                  <option value="inactive_7d">⏳ Inactivos (+7 Días sin Visitar)</option>
                  <option value="vip">🌟 Clientes VIP (+5 Sellos Acumulados)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#ccc3d8] font-semibold block mb-2">Momento del Envío</label>
                <select
                  value={formData.scheduleType}
                  onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2.5 w-full text-xs"
                >
                  <option value="immediate">⚡ Envío Inmediato</option>
                  <option value="scheduled">📅 Programar Fecha y Hora</option>
                </select>
              </div>
            </div>

            {formData.scheduleType === "scheduled" && (
              <div className="space-y-2 p-3 rounded-xl bg-[#201f23] border border-[#f2be71]/30 animate-in fade-in">
                <label className="text-xs text-[#ffddb1] font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#f2be71]" />
                  <span>Seleccionar Fecha y Hora del Envío Programado</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="bg-[#1c1b1f] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs focus:border-[#f2be71]/60 focus:outline-none"
                />
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
                {formData.scheduleType === "scheduled" ? "Programar Notificación" : "Enviar Broadcast Ahora"}
              </button>
            </div>
          </form>

          {/* Vista Previa Móvil en Vivo */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[340px] bg-[#000000] rounded-[42px] p-3.5 border-4 border-[#363439] shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative">
              {/* Dynamic Island / Notch */}
              <div className="w-24 h-4 bg-[#141317] rounded-full mx-auto mb-4" />

              <div className="text-center mb-3">
                <span className="text-[10px] text-[#ccc3d8] font-mono tracking-widest uppercase">
                  Vista Previa en Vivo (Móvil)
                </span>
              </div>

              {/* Notificación Estilo iOS / Android Rich Push */}
              <div className="rounded-2xl bg-[#1c1b1f]/95 border border-white/10 p-3.5 shadow-2xl backdrop-blur-md flex flex-col gap-2.5">
                {/* Header de la Notificación */}
                <div className="flex items-center justify-between text-[11px] text-[#ccc3d8]">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <div className="w-5 h-5 rounded-full bg-[#f2be71] flex items-center justify-center text-[#121115] text-[10px] font-black">
                      🔔
                    </div>
                    <span>Tu Negocio</span>
                  </div>
                  <span className="text-[10px] text-[#ccc3d8]/70">Ahora</span>
                </div>

                {/* Título y Mensaje */}
                <div>
                  <h4 className="font-bold text-xs text-[#ffddb1]">
                    {formData.title || "Título de la notificación"}
                  </h4>
                  <p className="text-[11px] text-[#e6e1e7]/90 leading-tight mt-0.5">
                    {formData.body || "Cuerpo de la notificación..."}
                  </p>
                </div>

                {/* Imagen Grande si existe */}
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

                {/* Botones de Acción Interactivos */}
                {actionButtons.length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/10">
                    {actionButtons.map((btn) => (
                      <div
                        key={btn.id}
                        className="py-1.5 px-2 rounded-lg bg-white/10 text-white font-semibold text-[11px] text-center truncate hover:bg-white/20 transition-colors"
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

      {/* 2. PESTAÑA: FLUJOS AUTOMÁTICOS (DRIP CAMPAIGNS) */}
      {activeTab === "flows" && (
        <div className="space-y-6">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">
                Flujos de Notificaciones Automatizadas
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
                {/* Header del Flujo con Switch */}
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

                {/* Contenido Editable */}
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

                {/* Acciones del Flujo */}
                <div className="flex items-center justify-between border-t border-[#363439] pt-3">
                  <span className="text-[10px] text-[#ccc3d8]/70">
                    Variables: {`{restaurante}`}, {`{nombre}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTestFlow(flow)}
                    className="px-3 py-1.5 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[#f2be71] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Probar Flujo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PESTAÑA: BORRADORES Y PLANTILLAS GUARDADAS */}
      {activeTab === "drafts" && (
        <div className="space-y-4">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">
                Plantillas & Campañas Guardadas
              </h3>
              <p className="text-xs text-[#ccc3d8] mt-1">
                Reutiliza mensajes exitosos, duplícalos con un clic o cárgalos en el editor para enviar inmediatamente.
              </p>
            </div>
          </div>

          {drafts.length === 0 ? (
            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-12 text-center text-[#ccc3d8]">
              <Layers className="w-10 h-10 text-[#f2be71] mx-auto mb-3 opacity-60" />
              <p className="font-semibold text-sm">No tienes borradores guardados aún</p>
              <p className="text-xs text-[#ccc3d8]/70 mt-1">
                Diseña una campaña en la pestaña "Nueva Campaña" y presiona "Guardar Borrador".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[#f2be71]/40 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#f2be71] mb-2 font-mono">
                      <span>{d.createdAt || "Plantilla"}</span>
                      <span className="text-[#ccc3d8]/60 text-[10px] uppercase">{d.segment || "Todos"}</span>
                    </div>

                    <h4 className="font-bold text-sm text-[#e6e1e7] mb-1 line-clamp-1">
                      {d.name || d.title}
                    </h4>
                    <p className="text-xs text-[#ccc3d8] line-clamp-2 leading-relaxed">
                      {d.body}
                    </p>
                  </div>

                  <div className="border-t border-[#363439] pt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadDraft(d)}
                      className="px-3 py-1.5 rounded-lg bg-[#f2be71] text-[#121115] font-bold text-xs hover:brightness-105 transition-all cursor-pointer"
                    >
                      Usar Campaña
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyDraft(d)}
                        className="p-1.5 rounded-lg bg-[#201f23] text-[#ccc3d8] hover:text-[#f2be71] transition-colors cursor-pointer"
                        title="Duplicar campaña"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDraft(d.id)}
                        className="p-1.5 rounded-lg bg-[#201f23] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Eliminar borrador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. PESTAÑA: CONFIGURACIÓN ONESIGNAL */}
      {activeTab === "credentials" && (
        <form onSubmit={handleSaveOneSignal} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 max-w-2xl">
          <div className="border-b border-[#363439] pb-4">
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Key className="w-5 h-5 text-[#f2be71]" />
              Credenciales de la API de OneSignal
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

            <div>
              <label className="text-xs text-[#ccc3d8] font-semibold block mb-2">Safari Web ID (Opcional)</label>
              <input
                type="text"
                value={oneSignalConfig.safariWebId}
                onChange={(e) => setOneSignalConfig({ ...oneSignalConfig, safariWebId: e.target.value })}
                placeholder="web.onesignal.auto.12345"
                className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-3 w-full text-xs font-mono"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#201f23] border border-[#363439] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#e6e1e7] block">Motor Web Push Activo</span>
                <span className="text-[11px] text-[#ccc3d8]">Habilita el banner de suscripción automática al ingresar a la mesa.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={oneSignalConfig.enabled}
                  onChange={(e) => setOneSignalConfig({ ...oneSignalConfig, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#2b292e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f2be71]" />
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 transition-all cursor-pointer text-sm shadow-md"
            >
              Guardar Credenciales OneSignal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

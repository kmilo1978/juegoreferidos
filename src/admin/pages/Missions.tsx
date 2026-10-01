import { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  ExternalLink,
  Target,
  Sparkles,
  Layers,
  X,
} from "lucide-react";

interface Mission {
  id: string;
  category?: string;
  title: string;
  rewardStamps?: number;
  rewardText?: string;
  icon?: string;
  badge?: string;
  description?: string;
  rules?: string;
  actionUrl?: string;
  evidencePlaceholder?: string;
  active: boolean;
}

interface Submission {
  id: string;
  missionId?: string;
  missionTitle?: string;
  customerName?: string;
  customerWhatsapp?: string;
  evidenceUrl?: string;
  status: string;
  submittedAt?: string;
  dateFormatted?: string;
}

export function Missions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal de Crear / Editar Misión
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  // Formulario de Misión
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Redes Sociales");
  const [formRewardStamps, setFormRewardStamps] = useState(2);
  const [formIcon, setFormIcon] = useState("📸");
  const [formRules, setFormRules] = useState("");
  const [formActionUrl, setFormActionUrl] = useState("");
  const [formActive, setFormActive] = useState(true);

  const fetchMissions = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/missions");
      if (!res.ok) throw new Error("Error al obtener catálogo de misiones");
      const data = await res.json();
      setMissions(data.missions || []);
      setSubmissions(data.submissions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const saveMissionsToBackend = async (updatedMissions: Mission[]) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3001/api/missions/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missions: updatedMissions }),
      });
      if (!res.ok) throw new Error("Error al guardar misiones en el servidor");
      setSuccess("Catálogo de misiones actualizado correctamente");
      setTimeout(() => setSuccess(null), 3000);
      setMissions(updatedMissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  // Toggle de activación rápida (Checklist)
  const handleToggleActive = (id: string) => {
    const updated = missions.map((m) => (m.id === id ? { ...m, active: !m.active } : m));
    saveMissionsToBackend(updated);
  };

  // Eliminar misión
  const handleDeleteMission = (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la misión "${title}"?`)) return;
    const updated = missions.filter((m) => m.id !== id);
    saveMissionsToBackend(updated);
  };

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingMission(null);
    setFormTitle("");
    setFormCategory("Redes Sociales");
    setFormRewardStamps(2);
    setFormIcon("📸");
    setFormRules("Comparte tu experiencia y etiqueta a nuestro perfil oficial.");
    setFormActionUrl("");
    setFormActive(true);
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const openEditModal = (mission: Mission) => {
    setEditingMission(mission);
    setFormTitle(mission.title);
    setFormCategory(mission.category || "Redes Sociales");
    setFormRewardStamps(mission.rewardStamps || 2);
    setFormIcon(mission.icon || "🎯");
    setFormRules(mission.rules || mission.description || "");
    setFormActionUrl(mission.actionUrl || "");
    setFormActive(mission.active);
    setIsModalOpen(true);
  };

  // Guardar misión desde modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingMission) {
      // Editar existente
      const updated = missions.map((m) =>
        m.id === editingMission.id
          ? {
              ...m,
              title: formTitle,
              category: formCategory,
              rewardStamps: formRewardStamps,
              rewardText: `+${formRewardStamps} Sellos de Visita`,
              icon: formIcon,
              rules: formRules,
              description: formRules,
              actionUrl: formActionUrl,
              active: formActive,
            }
          : m
      );
      saveMissionsToBackend(updated);
    } else {
      // Crear nueva
      const newMission: Mission = {
        id: `m_${Date.now()}`,
        title: formTitle,
        category: formCategory,
        rewardStamps: formRewardStamps,
        rewardText: `+${formRewardStamps} Sellos de Visita`,
        icon: formIcon,
        badge: formCategory.toUpperCase().slice(0, 12),
        rules: formRules,
        description: formRules,
        actionUrl: formActionUrl,
        active: formActive,
      };
      saveMissionsToBackend([...missions, newMission]);
    }

    setIsModalOpen(false);
  };

  // Revisión de envíos
  const handleReview = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("http://localhost:3001/api/missions/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id, action }),
      });
      if (!res.ok) throw new Error("Error al revisar misión");
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setSuccess(action === "approve" ? "Misión aprobada y sellos acreditados" : "Misión rechazada");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  const activeCount = missions.filter((m) => m.active).length;

  return (
    <div className="space-y-6">
      {/* Header con botón para crear nueva misión */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">Misiones & Embajadores</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#684400]/30 border border-[#f2be71]/40 text-[#f2be71] text-xs font-mono font-bold">
              {activeCount} Activas en Mesa
            </span>
          </div>
          <p className="text-sm text-[#ccc3d8] mt-0.5">
            Configura y personaliza las misiones digitales. Activa o desactiva con el checklist para definir qué ve el cliente en el Paso 8.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-5 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm shrink-0 shadow-lg"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Crear Nueva Misión</span>
        </button>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA (2 COLS): CATÁLOGO MODULAR CON CHECKLIST */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#f2be71]" />
              <span>Catálogo Modular de Misiones (Checklist On/Off)</span>
            </h3>
            <span className="text-xs text-[#958da1]">Toca el interruptor para mostrar u ocultar en mesa</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {missions.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                  m.active
                    ? "bg-[#1c1b1f] border-[#f2be71]/40 shadow-sm"
                    : "bg-[#17161a] border-[#2b292e] opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl w-9 h-9 rounded-xl bg-[#201f23] border border-[#363439] flex items-center justify-center shrink-0">
                        {m.icon || "🎯"}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#958da1] block truncate">
                          {m.category || "Redes Sociales"}
                        </span>
                        <h4 className="text-sm font-bold text-[#e6e1e7] truncate">{m.title}</h4>
                      </div>
                    </div>

                    {/* Switch Checklist ON / OFF */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={m.active}
                        onChange={() => handleToggleActive(m.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#2b292e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f2be71]"></div>
                    </label>
                  </div>

                  <p className="text-xs text-[#ccc3d8] mt-2 line-clamp-2 leading-relaxed">
                    {m.rules || m.description || "Sin descripción de reglas."}
                  </p>
                </div>

                {/* Pie de tarjeta con sellos y botones de acción */}
                <div className="flex items-center justify-between pt-2 border-t border-[#363439]/60">
                  <span className="text-xs font-mono font-bold text-[#f2be71] bg-[#684400]/30 px-2 py-0.5 rounded-full border border-[#f2be71]/30">
                    +{m.rewardStamps || 2} Sellos VIP
                  </span>

                  <div className="flex items-center gap-1.5">
                    {m.actionUrl && (
                      <a
                        href={m.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-white transition-colors"
                        title="Abrir enlace de la misión"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditModal(m)}
                      className="p-1.5 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-[#f2be71] transition-colors cursor-pointer"
                      title="Personalizar misión"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMission(m.id, m.title)}
                      className="p-1.5 rounded-lg bg-[#201f23] hover:bg-red-950/60 text-[#ccc3d8] hover:text-red-400 transition-colors cursor-pointer"
                      title="Eliminar misión"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA (1 COL): COLA DE REVISIÓN DE EVIDENCIAS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#10b981]" />
              <span>Cola de Revisión de Evidencias</span>
            </h3>
            <span className="text-xs text-[#f2be71] font-mono font-bold">
              {submissions.filter((s) => s.status?.toUpperCase() === "PENDING" || s.status?.toUpperCase() === "PENDIENTE").length} pendientes
            </span>
          </div>

          <div className="space-y-3">
            {submissions
              .filter((s) => s.status?.toUpperCase() === "PENDING" || s.status?.toUpperCase() === "PENDIENTE")
              .map((sub) => (
                <div key={sub.id} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-4 space-y-3 shadow-md">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#e6e1e7]">
                        {sub.customerName || sub.customerWhatsapp || "Comensal en Mesa"}
                      </span>
                      <span className="text-[10px] text-[#958da1] font-mono">
                        {sub.dateFormatted || sub.submittedAt || "Reciente"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#f2be71] block mt-0.5">
                      {sub.missionTitle || "Misión Digital"}
                    </span>
                  </div>

                  {sub.evidenceUrl && (
                    <div className="bg-[#201f23] p-2.5 rounded-xl text-xs text-[#60a5fa] truncate border border-[#363439]">
                      <a href={sub.evidenceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:underline">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{sub.evidenceUrl}</span>
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleReview(sub.id, "reject")}
                      className="flex-1 bg-[#1c1b1f] border border-red-500/40 text-red-400 rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-red-500/10 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rechazar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview(sub.id, "approve")}
                      className="flex-1 bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-[#10b981]/30 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Aprobar (+Sellos)</span>
                    </button>
                  </div>
                </div>
              ))}

            {submissions.filter((s) => s.status?.toUpperCase() === "PENDING" || s.status?.toUpperCase() === "PENDIENTE").length === 0 && (
              <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 text-center text-[#958da1] text-xs">
                ✨ No hay evidencias pendientes por revisar en este momento.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE CREAR / EDITAR MISIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c1b1f] border border-[#f2be71]/40 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <span>{editingMission ? "✏️ Personalizar Misión" : "➕ Crear Nueva Misión"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#958da1] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                  Título de la Misión
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej: Foto en Instagram Stories con tu plato favorito"
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                    Categoría / Red
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Google Maps">Google Maps</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="TripAdvisor">TripAdvisor</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Personalizada">Personalizada</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                    Sellos de Recompensa
                  </label>
                  <select
                    value={formRewardStamps}
                    onChange={(e) => setFormRewardStamps(Number(e.target.value))}
                    className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-mono"
                  >
                    <option value={1}>+1 Sello VIP</option>
                    <option value={2}>+2 Sellos VIP</option>
                    <option value={3}>+3 Sellos VIP</option>
                    <option value={4}>+4 Sellos VIP</option>
                    <option value={5}>+5 Sellos VIP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                    Emoji / Icono
                  </label>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    placeholder="📸"
                    className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-center text-lg text-[#e6e1e7] rounded-xl px-3 py-2 w-full"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                    Enlace de Acción (URL)
                  </label>
                  <input
                    type="url"
                    value={formActionUrl}
                    onChange={(e) => setFormActionUrl(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
                  Reglas / Instrucciones para el Comensal
                </label>
                <textarea
                  rows={2}
                  value={formRules}
                  onChange={(e) => setFormRules(e.target.value)}
                  placeholder="Menciona nuestro perfil y muestra tu plato favorito..."
                  className="bg-[#201f23] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modalFormActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 accent-[#f2be71]"
                />
                <label htmlFor="modalFormActive" className="text-xs text-[#e6e1e7] cursor-pointer font-semibold">
                  Activar misión de inmediato en mesa (Checklist ON)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#363439]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f2be71] hover:brightness-105 text-[#121115] text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  {editingMission ? "Guardar Cambios" : "Crear Misión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

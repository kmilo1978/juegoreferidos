import { useEffect, useState } from "react";
import {
  Loader2,
  Ticket,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Save,
  KeyRound,
  Wallet,
  Clock,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";
import { apiUrl, getAuthToken } from "../../lib/apiClient";

interface Prize {
  id: string;
  name: string;
  value: string;
  probability: number;
  color: string;
  stock?: number;
  terms?: string;
  active: boolean;
}

export function Prizes() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal de Validación con PIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [pin, setPin] = useState("");
  const [validating, setValidating] = useState(false);

  // Modal de Crear / Editar Premio
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [formName, setFormName] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formProbability, setFormProbability] = useState(15);
  const [formColor, setFormColor] = useState("#f2be71");
  const [formTerms, setFormTerms] = useState("Válido hoy en caja.");
  const [formActive, setFormActive] = useState(true);

  // Cola de validación activa simulada o real de las mesas
  const [pendingVouchers, setPendingVouchers] = useState([
    {
      id: "VOUCH-4819",
      client: "Carlos Andrés",
      mesa: "Mesa 03",
      premio: "Postre Artesanal de Autor Gratis",
      whatsapp: "573009876543",
      esperando: "Hace 4 min",
    },
    {
      id: "VOUCH-9182",
      client: "Lucía Torres",
      mesa: "Mesa 12",
      premio: "Café de Especialidad Gratis",
      whatsapp: "573012345678",
      esperando: "Hace 8 min",
    },
    {
      id: "VOUCH-3321",
      client: "Mateo Díaz",
      mesa: "Barra 02",
      premio: "10% de Descuento en Cuenta",
      whatsapp: "573005558899",
      esperando: "Hace 12 min",
    },
  ]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(apiUrl("/config"));
      if (!res.ok) throw new Error("Error al cargar premios");
      const data = await res.json();
      setPrizes(data.settings?.prizes || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const savePrizesToBackend = async (updatedPrizes: Prize[]) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/config"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
        body: JSON.stringify({ prizes: updatedPrizes }),
      });
      if (!res.ok) throw new Error("Error al guardar catálogo de premios");
      setPrizes(updatedPrizes);
      setSuccessMsg("Catálogo de premios actualizado correctamente");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  // Abrir modal de crear
  const openCreateModal = () => {
    setEditingPrize(null);
    setFormName("");
    setFormValue("Postre Gratis");
    setFormProbability(15);
    setFormColor("#f2be71");
    setFormTerms("Válido hoy en caja.");
    setFormActive(true);
    setIsEditModalOpen(true);
  };

  // Abrir modal de editar
  const openEditModal = (p: Prize) => {
    setEditingPrize(p);
    setFormName(p.name);
    setFormValue(p.value || p.name);
    setFormProbability(p.probability || 10);
    setFormColor(p.color || "#f2be71");
    setFormTerms(p.terms || "Válido hoy en caja.");
    setFormActive(p.active ?? true);
    setIsEditModalOpen(true);
  };

  // Guardar premio
  const handleSavePrize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingPrize) {
      const updated = prizes.map((p) =>
        p.id === editingPrize.id
          ? {
              ...p,
              name: formName,
              value: formValue,
              probability: Number(formProbability),
              color: formColor,
              terms: formTerms,
              active: formActive,
            }
          : p
      );
      savePrizesToBackend(updated);
    } else {
      const newP: Prize = {
        id: `p_${Date.now()}`,
        name: formName,
        value: formValue,
        probability: Number(formProbability),
        color: formColor,
        terms: formTerms,
        active: formActive,
      };
      savePrizesToBackend([...prizes, newP]);
    }

    setIsEditModalOpen(false);
  };

  // Eliminar premio
  const handleDeletePrize = (id: string, name: string) => {
    if (!window.confirm(`¿Deseas eliminar el premio "${name}"?`)) return;
    savePrizesToBackend(prizes.filter((p) => p.id !== id));
  };

  // Toggle activo
  const handleToggleActive = (id: string) => {
    savePrizesToBackend(
      prizes.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  // Abrir modal de PIN para un voucher
  const handleOpenPinModal = (v: any) => {
    setSelectedVoucher(v);
    setPin("");
    setShowPinModal(true);
  };

  // Validar PIN de cajero
  const handleValidatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    setValidating(true);
    setError(null);

    try {
      const res = await fetch(apiUrl("/validate-pin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, prizeId: selectedVoucher?.id || "manual" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "PIN inválido");

      setSuccessMsg(`✓ Voucher ${selectedVoucher?.id} validado y entregado con éxito`);
      setPendingVouchers((prev) => prev.filter((v) => v.id !== selectedVoucher?.id));
      setShowPinModal(false);
      setPin("");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al validar PIN");
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">
            Premios, Vouchers & Cola de Canje en Caja
          </h2>
          <p className="text-sm text-[#ccc3d8]">
            Crea y personaliza los premios que ganan los comensales, y valida con PIN los vouchers en mesa.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="bg-[var(--gold)] text-[#121115] font-bold rounded-xl px-5 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm shrink-0 shadow-lg"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Crear Nuevo Premio</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}

      {/* 1. COLA DE VALIDACIÓN PENDIENTE EN CAJA */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#363439] pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#f59e0b]" />
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">
              Cola de Validación Pendiente en Caja
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#2a1f00] text-[#f59e0b] border border-[#f59e0b]/40">
            {pendingVouchers.length} Vouchers por Confirmar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#201f23]/60 text-[#ccc3d8] uppercase tracking-wider font-bold">
                <th className="px-4 py-3 rounded-l-xl">Código</th>
                <th className="px-4 py-3">Mesa</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Premio a Entregar</th>
                <th className="px-4 py-3">Espera</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Acciones de Caja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363439]/50">
              {pendingVouchers.map((v) => (
                <tr key={v.id} className="hover:bg-[#201f23]/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[var(--gold)]">{v.id}</td>
                  <td className="px-4 py-3 font-bold text-white">{v.mesa}</td>
                  <td className="px-4 py-3 font-medium text-[#ccc3d8]">{v.client}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--gold-light)]">{v.premio}</td>
                  <td className="px-4 py-3 text-[#958da1] font-mono">{v.esperando}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenPinModal(v)}
                      className="bg-[var(--gold)] text-[#121115] hover:brightness-105 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 ml-auto cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Validar con PIN</span>
                    </button>
                  </td>
                </tr>
              ))}

              {pendingVouchers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-[#958da1]">
                    ✨ No hay vouchers pendientes de validación en este momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. CATÁLOGO MODULAR DE PREMIOS (CREAR, EDITAR, CHECKLIST) */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#363439] pb-3">
          <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[var(--gold)]" />
            <span>Catálogo de Premios y Vouchers Activos</span>
          </h3>
          <span className="text-xs text-[#958da1]">Usa el interruptor para habilitar o pausar premios</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prizes.map((p) => (
            <div
              key={p.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                p.active ? "bg-[#201f23] border-[var(--gold)]/40 shadow-md" : "bg-[#17161a] border-[#2b292e] opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: p.color || "#f2be71" }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#e6e1e7] leading-tight">{p.name}</h4>
                      <span className="text-[10px] text-[#958da1] font-mono">Valor: {p.value || p.name}</span>
                    </div>
                  </div>

                  {/* Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={p.active}
                      onChange={() => handleToggleActive(p.id)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-[#2b292e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--gold)]"></div>
                  </label>
                </div>

                <p className="text-[11px] text-[#ccc3d8] mt-2">
                  {p.terms || "Válido hoy en caja presentando el código único."}
                </p>
              </div>

              <div className="pt-2 border-t border-[#363439]/50 flex items-center justify-between text-xs">
                <span className="font-mono text-[var(--gold)] font-bold">
                  {p.probability || 15}% en Ruleta
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    className="p-1.5 rounded-lg bg-[#141317] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-[var(--gold)] transition-colors cursor-pointer"
                    title="Editar premio"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePrize(p.id, p.name)}
                    className="p-1.5 rounded-lg bg-[#141317] hover:bg-red-950/60 text-[#ccc3d8] hover:text-red-400 transition-colors cursor-pointer"
                    title="Eliminar premio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE VALIDACIÓN CON PIN EN CAJA */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c1b1f] border border-[var(--gold)]/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[var(--gold)]" />
                <span>Confirmar Entrega en Caja</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="text-[#958da1] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#201f23] rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#958da1]">Mesa:</span>
                <span className="font-bold text-white">{selectedVoucher?.mesa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#958da1]">Cliente:</span>
                <span className="font-bold text-white">{selectedVoucher?.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#958da1]">Premio:</span>
                <span className="font-bold text-[var(--gold)]">{selectedVoucher?.premio}</span>
              </div>
            </div>

            <form onSubmit={handleValidatePin} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase tracking-wider block text-center mb-2">
                  Ingresa el PIN de Cajero (4 dígitos):
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="bg-[#141317] border border-[#363439] text-[var(--gold)] font-mono text-center tracking-[12px] text-2xl font-bold rounded-2xl px-4 py-3 w-full focus:border-[var(--gold)]/60 focus:outline-none"
                />
                <span className="text-[10px] text-[#958da1] block text-center mt-1">PIN por defecto: <strong>4321</strong></span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#201f23] text-[#ccc3d8] text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={validating || pin.length !== 4}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--gold)] hover:brightness-105 text-[#121115] text-xs font-bold flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Confirmar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR PREMIO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c1b1f] border border-[var(--gold)]/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue']">
                {editingPrize ? "✏️ Personalizar Premio" : "➕ Crear Nuevo Premio"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#958da1] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrize} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                  Nombre del Premio / Voucher
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Croissant de Almendras Gratis"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-semibold focus:border-[var(--gold)]/60 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                    Valor o Categoría
                  </label>
                  <input
                    type="text"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="Ej: $15.000 COP"
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                    Probabilidad en Ruleta (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formProbability}
                    onChange={(e) => setFormProbability(Number(e.target.value))}
                    className="bg-[#201f23] border border-[#363439] text-[var(--gold)] font-mono text-center rounded-xl px-3 py-2 w-full text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                  Color de la Rebanada de Ruleta
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-[var(--gold)] font-bold">{formColor}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                  Términos y Condiciones del Canje
                </label>
                <textarea
                  rows={2}
                  value={formTerms}
                  onChange={(e) => setFormTerms(e.target.value)}
                  placeholder="Válido únicamente en mesa durante la visita actual..."
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs resize-none focus:border-[var(--gold)]/60 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formActiveCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 accent-[var(--gold)]"
                />
                <label htmlFor="formActiveCheck" className="text-xs text-[#e6e1e7] font-semibold cursor-pointer">
                  Habilitar este premio de inmediato en la ruleta
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#363439]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#201f23] text-[#ccc3d8] text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--gold)] text-[#121115] text-xs font-bold shadow-md"
                >
                  Guardar Premio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

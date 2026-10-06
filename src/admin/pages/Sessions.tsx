import { useEffect, useState, useMemo } from "react";
import { StatusBadge } from "../components/StatusBadge";
import {
  Loader2,
  QrCode,
  Download,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  X,
  Printer,
  Sparkles,
  ExternalLink,
  MapPin,
  Users,
  CheckCircle,
  Layers,
  Settings2,
} from "lucide-react";

interface Table {
  id: string;
  number: number;
  name: string;
  zone: string;
  capacity?: number;
  status: string;
  currentCustomer?: string;
  currentWhatsapp?: string;
  activeSessionId?: string;
  prizeWon?: string;
  uniqueCode?: string;
  startedAt?: string;
  lastActivityAt?: string;
  qrUrl?: string;
}

const DEFAULT_ZONES = [
  "Salón Principal",
  "Terraza Jardín",
  "Zona VIP",
  "Barra de Café / Bar",
  "Piso 2",
];

export function Sessions() {
  const [tables, setTables] = useState<Table[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Zonas / Ubicaciones
  const [zones, setZones] = useState<string[]>(DEFAULT_ZONES);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>("all");
  const [isZonesModalOpen, setIsZonesModalOpen] = useState(false);
  const [newZoneInput, setNewZoneInput] = useState("");

  // Modal de Diseñador de QR
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [qrColor, setQrColor] = useState("#f2be71");
  const [qrBgColor, setQrBgColor] = useState("#141317");
  const [qrCallToAction, setQrCallToAction] = useState("¡Escanea aquí para jugar y ganar en mesa!");

  // Modal para agregar nueva mesa
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTableNum, setNewTableNum] = useState(11);
  const [newTableName, setNewTableName] = useState("Mesa 11");
  const [newTableZone, setNewTableZone] = useState("Salón Principal");
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [customZoneMode, setCustomZoneMode] = useState(false);
  const [customZoneText, setCustomZoneText] = useState("");

  // Modal para editar mesa existente
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editTableName, setEditTableName] = useState("");
  const [editTableZone, setEditTableZone] = useState("");
  const [editTableCapacity, setEditTableCapacity] = useState(4);
  const [editCustomZoneMode, setEditCustomZoneMode] = useState(false);
  const [editCustomZoneText, setEditCustomZoneText] = useState("");

  const fetchTablesAndConfig = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        fetch("/api/tables"),
        fetch("/api/config"),
      ]);

      if (!tRes.ok) throw new Error("Error al cargar mesas");

      const tData = await tRes.json();
      const cData = cRes.ok ? await cRes.json() : null;

      const list: Table[] = Array.isArray(tData) ? tData : tData.tables || [];
      setTables(list);
      setNewTableNum(list.length + 1);
      setNewTableName(`Mesa ${list.length + 1}`);

      // Consolidar zonas desde config o mesas
      const storedZones: string[] = cData?.settings?.zones || [];
      const tablesZones = list.map((t) => t.zone).filter(Boolean);
      const unique = Array.from(new Set([...DEFAULT_ZONES, ...storedZones, ...tablesZones]));
      setZones(unique);

      if (cData?.settings) {
        setConfig(cData.settings);
        if (cData.settings.brand?.primaryColor) {
          setQrColor(cData.settings.brand.primaryColor);
        }
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTablesAndConfig();
    const interval = setInterval(fetchTablesAndConfig, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mesas filtradas por zona
  const filteredTables = useMemo(() => {
    if (selectedZoneFilter === "all") return tables;
    return tables.filter((t) => t.zone === selectedZoneFilter);
  }, [tables, selectedZoneFilter]);

  // Reset / Liberar mesa
  const handleResetTable = async (tableId: string, tableName: string) => {
    if (!window.confirm(`¿Deseas liberar y reiniciar la ${tableName}? El cliente actual finalizará su sesión.`)) return;

    try {
      const res = await fetch(`/api/tables/${tableId}/reset`, { method: "POST" });
      if (!res.ok) throw new Error("Error al reiniciar mesa");
      setSuccess(`${tableName} liberada y disponible para nuevos clientes`);
      setTimeout(() => setSuccess(null), 3000);
      fetchTablesAndConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  // Agregar nueva mesa
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalZone = customZoneMode && customZoneText.trim()
        ? customZoneText.trim()
        : newTableZone;

      // Si es una zona nueva, guardarla en la lista de zonas
      if (!zones.includes(finalZone)) {
        const updatedZones = [...zones, finalZone];
        setZones(updatedZones);
        fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zones: updatedZones }),
        }).catch(() => {});
      }

      const newTableObj: Table = {
        id: `mesa-${newTableNum}`,
        number: Number(newTableNum),
        name: newTableName,
        zone: finalZone,
        capacity: Number(newTableCapacity) || 4,
        status: "DISPONIBLE",
        qrUrl: `http://localhost:5173/?mesa=${newTableNum}`,
      };

      const updated = [...tables, newTableObj];
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables: updated }),
      });

      if (!res.ok) throw new Error("Error al agregar mesa");
      setSuccess(`${newTableName} agregada con éxito en "${finalZone}"`);
      setTimeout(() => setSuccess(null), 3000);
      setIsAddTableOpen(false);
      setCustomZoneMode(false);
      setCustomZoneText("");
      fetchTablesAndConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  // Abrir modal de editar mesa
  const handleOpenEdit = (t: Table) => {
    setEditingTable(t);
    setEditTableName(t.name);
    setEditTableZone(t.zone || "Salón Principal");
    setEditTableCapacity(t.capacity || 4);
    setEditCustomZoneMode(false);
    setEditCustomZoneText("");
  };

  // Guardar edición de mesa
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;

    try {
      const finalZone = editCustomZoneMode && editCustomZoneText.trim()
        ? editCustomZoneText.trim()
        : editTableZone;

      if (!zones.includes(finalZone)) {
        const updatedZones = [...zones, finalZone];
        setZones(updatedZones);
        fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zones: updatedZones }),
        }).catch(() => {});
      }

      const updated = tables.map((t) =>
        t.id === editingTable.id
          ? {
              ...t,
              name: editTableName,
              zone: finalZone,
              capacity: Number(editTableCapacity) || 4,
            }
          : t
      );

      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables: updated }),
      });

      if (!res.ok) throw new Error("Error al actualizar mesa");
      setSuccess(`Mesa "${editTableName}" actualizada correctamente`);
      setTimeout(() => setSuccess(null), 3000);
      setEditingTable(null);
      fetchTablesAndConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar mesa");
    }
  };

  // Eliminar mesa
  const handleDeleteTable = async (t: Table) => {
    if (!window.confirm(`¿Estás seguro de eliminar la "${t.name}"? Esta acción retirará su código QR del sistema.`)) {
      return;
    }

    try {
      const updated = tables.filter((item) => item.id !== t.id);
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables: updated }),
      });

      if (!res.ok) throw new Error("Error al eliminar mesa");
      setSuccess(`${t.name} eliminada`);
      setTimeout(() => setSuccess(null), 3000);
      fetchTablesAndConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  // Agregar zona a la lista general
  const handleAddNewZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneInput.trim()) return;
    const name = newZoneInput.trim();
    if (zones.includes(name)) {
      setError(`La ubicación "${name}" ya existe.`);
      return;
    }

    const updated = [...zones, name];
    setZones(updated);
    setNewZoneInput("");
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zones: updated }),
      });
      setSuccess(`Nueva ubicación "${name}" agregada`);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Error al guardar la ubicación");
    }
  };

  // Eliminar zona
  const handleDeleteZone = async (z: string) => {
    const tablesInZone = tables.filter((t) => t.zone === z).length;
    if (tablesInZone > 0) {
      alert(`No puedes eliminar la ubicación "${z}" porque tiene ${tablesInZone} mesa(s) asignadas. Reasigna las mesas primero.`);
      return;
    }

    const updated = zones.filter((item) => item !== z);
    setZones(updated);
    if (selectedZoneFilter === z) setSelectedZoneFilter("all");

    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zones: updated }),
      });
      setSuccess(`Ubicación "${z}" eliminada`);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Error al actualizar ubicaciones");
    }
  };

  const getQrImageUrl = (mesaNum: number, colorHex: string, bgHex: string) => {
    const rawTarget = `http://localhost:5173/?mesa=${mesaNum}`;
    const encoded = encodeURIComponent(rawTarget);
    const cleanColor = colorHex.replace("#", "");
    const cleanBg = bgHex.replace("#", "");
    return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encoded}&color=${cleanColor}&bgcolor=${cleanBg}&margin=1`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  const brandName = config?.brand?.name || "Tu Negocio";
  const brandLogo = config?.brand?.logoUrl || "";

  return (
    <div className="space-y-6">
      {/* Encabezado y Botones de Acción */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue'] flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[var(--gold)]" />
            Gestión de Mesas, Zonas & Códigos QR
          </h2>
          <p className="text-sm text-[#ccc3d8] mt-0.5">
            Configura las ubicaciones del establecimiento, agrega o edita mesas y descarga códigos QR para imprimir habladores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsZonesModalOpen(true)}
            className="bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-[var(--gold)] border border-[#363439] px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Settings2 className="w-4 h-4 text-[var(--gold)]" />
            <span>Configurar Ubicaciones ({zones.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewTableNum(tables.length + 1);
              setNewTableName(`Mesa ${tables.length + 1}`);
              setCustomZoneMode(false);
              setCustomZoneText("");
              setIsAddTableOpen(true);
            }}
            className="bg-[var(--gold)] hover:brightness-105 text-[#121115] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Mesa</span>
          </button>
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

      {/* Pestañas de Filtro por Ubicación / Zona */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#363439] text-xs">
        <button
          type="button"
          onClick={() => setSelectedZoneFilter("all")}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedZoneFilter === "all"
              ? "bg-[#2b292e] text-[var(--gold)] border border-[var(--gold)]/40"
              : "text-[#ccc3d8] hover:text-[var(--gold)] hover:bg-[#201f23]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Todas las Zonas</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#141317] text-[10px] text-[#ccc3d8]">
            {tables.length}
          </span>
        </button>

        {zones.map((z) => {
          const count = tables.filter((t) => t.zone === z).length;
          return (
            <button
              key={z}
              type="button"
              onClick={() => setSelectedZoneFilter(z)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedZoneFilter === z
                  ? "bg-[#2b292e] text-[var(--gold)] border border-[var(--gold)]/40"
                  : "text-[#ccc3d8] hover:text-[var(--gold)] hover:bg-[#201f23]"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{z}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#141317] text-[10px] text-[#ccc3d8]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TABLA DE MESAS */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#201f23]/70 text-[#ccc3d8] text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Mesa</th>
                <th className="px-6 py-4">Ubicación / Zona</th>
                <th className="px-6 py-4">Capacidad</th>
                <th className="px-6 py-4">Cliente / Comensal</th>
                <th className="px-6 py-4">Estado en Sala</th>
                <th className="px-6 py-4">Premio Ganado</th>
                <th className="px-6 py-4 text-right">Acciones & QR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363439]/60 text-xs">
              {filteredTables.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#ccc3d8]">
                    No hay mesas registradas en esta ubicación.
                  </td>
                </tr>
              ) : (
                filteredTables.map((t) => (
                  <tr key={t.id} className="hover:bg-[#201f23]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--gold)] font-mono text-sm">{t.name}</div>
                      <span className="text-[10px] text-[#958da1]">Número #{t.number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#201f23] text-[#e6e1e7] font-semibold border border-[#363439]">
                        <MapPin className="w-3 h-3 text-[var(--gold)]" />
                        {t.zone || "Sin asignar"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#ccc3d8]">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#ccc3d8]/70" />
                        {t.capacity || 4} Personas
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#ccc3d8]">
                      {t.currentCustomer ? (
                        <div>
                          <span className="font-semibold text-white block">{t.currentCustomer}</span>
                          {t.currentWhatsapp && (
                            <span className="text-[10px] text-[#958da1] font-mono">{t.currentWhatsapp}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#958da1]">Disponible</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4 text-[var(--gold-light)] font-medium">{t.prizeWon || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botón Ver QR */}
                        <button
                          type="button"
                          onClick={() => setSelectedTable(t)}
                          className="bg-[#201f23] hover:bg-[#2b292e] text-[var(--gold)] border border-[var(--gold)]/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Ver y personalizar código QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR</span>
                        </button>

                        {/* Botón Editar Mesa y Ubicación */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-[var(--gold)] transition-colors cursor-pointer border border-[#363439]"
                          title="Editar nombre y ubicación de la mesa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Botón Reset / Liberar */}
                        <button
                          type="button"
                          onClick={() => handleResetTable(t.id, t.name)}
                          className="p-1.5 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-white transition-colors cursor-pointer border border-[#363439]"
                          title="Liberar y reiniciar sesión"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {/* Botón Eliminar Mesa */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTable(t)}
                          className="p-1.5 rounded-lg bg-[#201f23] hover:bg-red-950/60 text-[#ccc3d8] hover:text-red-400 transition-colors cursor-pointer border border-[#363439]"
                          title="Eliminar mesa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: GESTIONAR UBICACIONES / ZONAS */}
      {isZonesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c1b1f] border border-[var(--gold)]/40 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--gold)]" />
                <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">
                  Configurar Ubicaciones y Zonas del Local
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsZonesModalOpen(false)}
                className="text-[#958da1] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario Agregar Nueva Zona */}
            <form onSubmit={handleAddNewZone} className="flex gap-2">
              <input
                type="text"
                required
                value={newZoneInput}
                onChange={(e) => setNewZoneInput(e.target.value)}
                placeholder="Ej: Rooftop 360°, Terraza VIP, Barra 2..."
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 text-xs flex-1 focus:border-[var(--gold)]/60 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[var(--gold)] text-[#121115] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer hover:brightness-105 active:scale-98 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Ubicación</span>
              </button>
            </form>

            {/* Lista de Zonas Existentes */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="text-[11px] text-[#ccc3d8] uppercase font-bold tracking-wider block mb-1">
                Ubicaciones Registradas ({zones.length})
              </span>
              {zones.map((z) => {
                const count = tables.filter((t) => t.zone === z).length;
                return (
                  <div
                    key={z}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#201f23] border border-[#363439]"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-[var(--gold)]" />
                      <div>
                        <span className="text-xs font-bold text-[#e6e1e7]">{z}</span>
                        <span className="text-[11px] text-[#ccc3d8] block">
                          {count} mesa{count === 1 ? "" : "s"} asignada{count === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteZone(z)}
                      className="p-1.5 rounded-lg bg-[#1c1b1f] hover:bg-red-950/60 text-[#ccc3d8] hover:text-red-400 transition-colors cursor-pointer"
                      title="Eliminar zona"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#363439] flex justify-end">
              <button
                type="button"
                onClick={() => setIsZonesModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#201f23] text-[var(--gold)] font-bold text-xs cursor-pointer hover:bg-[#2b292e]"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR MESA Y UBICACIÓN */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c1b1f] border border-[var(--gold)]/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[var(--gold)]" />
                Editar Mesa & Ubicación
              </h3>
              <button
                type="button"
                onClick={() => setEditingTable(null)}
                className="text-[#958da1] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                  Nombre Visual de la Mesa
                </label>
                <input
                  type="text"
                  required
                  value={editTableName}
                  onChange={(e) => setEditTableName(e.target.value)}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-semibold focus:border-[var(--gold)]/60 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase">
                    Ubicación / Zona
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditCustomZoneMode(!editCustomZoneMode)}
                    className="text-[10px] text-[var(--gold)] hover:underline cursor-pointer"
                  >
                    {editCustomZoneMode ? "Elegir de la lista" : "+ Escribir nueva zona"}
                  </button>
                </div>

                {editCustomZoneMode ? (
                  <input
                    type="text"
                    required
                    value={editCustomZoneText}
                    onChange={(e) => setEditCustomZoneText(e.target.value)}
                    placeholder="Escribe el nombre de la nueva zona..."
                    className="bg-[#201f23] border border-[var(--gold)]/60 text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs focus:outline-none"
                  />
                ) : (
                  <select
                    value={editTableZone}
                    onChange={(e) => setEditTableZone(e.target.value)}
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs focus:border-[var(--gold)]/60 focus:outline-none"
                  >
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                  Capacidad de Personas
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={editTableCapacity}
                  onChange={(e) => setEditTableCapacity(Number(e.target.value))}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs focus:border-[var(--gold)]/60 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#363439]">
                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
                  className="px-4 py-2 rounded-xl bg-[#201f23] text-[#ccc3d8] font-bold cursor-pointer hover:bg-[#2b292e]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--gold)] text-[#121115] font-bold shadow-md cursor-pointer hover:brightness-105"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AGREGAR NUEVA MESA */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c1b1f] border border-[var(--gold)]/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[var(--gold)]" />
                Agregar Nueva Mesa al Salón
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTableOpen(false)}
                className="text-[#958da1] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                  Número de Mesa
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTableNum}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    setNewTableNum(num);
                    setNewTableName(`Mesa ${num}`);
                  }}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full font-mono text-sm font-bold focus:border-[var(--gold)]/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                  Nombre Visual de la Mesa
                </label>
                <input
                  type="text"
                  required
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Ej: Mesa 11, Barra 1, Terraza 2"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-semibold focus:border-[var(--gold)]/60 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase">
                    Ubicación / Zona
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomZoneMode(!customZoneMode)}
                    className="text-[10px] text-[var(--gold)] hover:underline cursor-pointer"
                  >
                    {customZoneMode ? "Elegir de la lista" : "+ Escribir nueva zona"}
                  </button>
                </div>

                {customZoneMode ? (
                  <input
                    type="text"
                    required
                    value={customZoneText}
                    onChange={(e) => setCustomZoneText(e.target.value)}
                    placeholder="Escribe el nombre de la nueva zona..."
                    className="bg-[#201f23] border border-[var(--gold)]/60 text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs focus:outline-none"
                  />
                ) : (
                  <select
                    value={newTableZone}
                    onChange={(e) => setNewTableZone(e.target.value)}
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs focus:border-[var(--gold)]/60 focus:outline-none"
                  >
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                  Capacidad (Personas)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs focus:border-[var(--gold)]/60 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#363439]">
                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#201f23] text-[#ccc3d8] font-bold cursor-pointer hover:bg-[#2b292e]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--gold)] text-[#121115] font-bold shadow-md cursor-pointer hover:brightness-105"
                >
                  Guardar Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DISEÑADOR & PERSONALIZADOR DE CÓDIGO QR */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c1b1f] border border-[var(--gold)]/40 rounded-3xl p-6 max-w-xl w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#363439] pb-4">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-6 h-6 text-[var(--gold)]" />
                <div>
                  <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue']">
                    Hablador QR: {selectedTable.name}
                  </h3>
                  <p className="text-xs text-[#ccc3d8]">Personaliza los colores del código QR y descárgalo para impresión en mesa.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTable(null)}
                className="text-[#958da1] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* VISTA PREVIA DEL HABLADOR DE MESA */}
              <div
                id="print-qr-card"
                className="rounded-2xl p-5 text-center space-y-3 border-2 shadow-2xl transition-all"
                style={{ backgroundColor: qrBgColor, borderColor: qrColor }}
              >
                <div className="flex items-center justify-center gap-2">
                  {brandLogo && (
                    <img src={brandLogo} alt="Logo" className="w-6 h-6 object-contain rounded" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {brandName}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl inline-block shadow-inner mx-auto">
                  <img
                    src={getQrImageUrl(selectedTable.number, qrColor, "#ffffff")}
                    alt={`QR ${selectedTable.name}`}
                    className="w-44 h-44 object-contain mx-auto"
                  />
                </div>

                <div className="space-y-1">
                  <span
                    className="text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block"
                    style={{ backgroundColor: qrColor, color: "#121115" }}
                  >
                    {selectedTable.name} • {selectedTable.zone}
                  </span>
                  <p className="text-[11px] text-[#ccc3d8] pt-1">{qrCallToAction}</p>
                </div>
              </div>

              {/* CONTROLES DE PERSONALIZACIÓN */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1.5">
                    Color del Código QR
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-[var(--gold)] font-bold">{qrColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1.5">
                    Color de Fondo del Hablador
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-[#ccc3d8]">{qrBgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1.5">
                    Frase de Llamado a la Acción (CTA)
                  </label>
                  <input
                    type="text"
                    value={qrCallToAction}
                    onChange={(e) => setQrCallToAction(e.target.value)}
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs focus:border-[var(--gold)]/60 focus:outline-none"
                  />
                </div>

                {/* Enlace directo */}
                <div className="pt-2">
                  <a
                    href={`http://localhost:5173/?mesa=${selectedTable.number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#60a5fa] hover:underline flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Probar enlace de comensal en esta mesa ↗</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#363439]">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Hablador</span>
              </button>

              <a
                href={getQrImageUrl(selectedTable.number, qrColor, "#ffffff")}
                download={`QR-${selectedTable.name}.png`}
                target="_blank"
                rel="noreferrer"
                className="bg-[var(--gold)] hover:brightness-105 text-[#121115] px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Código QR (PNG)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

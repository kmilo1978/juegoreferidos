import { useEffect, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import {
  Loader2,
  QrCode,
  Download,
  RotateCcw,
  Plus,
  Eye,
  X,
  Palette,
  Printer,
  Sparkles,
  ExternalLink,
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

export function Sessions() {
  const [tables, setTables] = useState<Table[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const fetchTablesAndConfig = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        fetch("http://localhost:3001/api/tables"),
        fetch("http://localhost:3001/api/config"),
      ]);

      if (!tRes.ok) throw new Error("Error al cargar mesas");

      const tData = await tRes.json();
      const cData = cRes.ok ? await cRes.json() : null;

      const list = Array.isArray(tData) ? tData : tData.tables || [];
      setTables(list);
      setNewTableNum(list.length + 1);
      setNewTableName(`Mesa ${list.length + 1}`);

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

  // Reset / Liberar mesa
  const handleResetTable = async (tableId: string, tableName: string) => {
    if (!window.confirm(`¿Deseas liberar y reiniciar la ${tableName}? El cliente actual finalizará su sesión.`)) return;

    try {
      const res = await fetch(`http://localhost:3001/api/tables/${tableId}/reset`, { method: "POST" });
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
      const newTableObj: Table = {
        id: `mesa-${newTableNum}`,
        number: Number(newTableNum),
        name: newTableName,
        zone: newTableZone,
        capacity: 4,
        status: "DISPONIBLE",
        qrUrl: `http://localhost:5173/?mesa=${newTableNum}`,
      };

      const updated = [...tables, newTableObj];
      const res = await fetch("http://localhost:3001/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables: updated }),
      });

      if (!res.ok) throw new Error("Error al agregar mesa");
      setSuccess(`${newTableName} agregada con éxito`);
      setTimeout(() => setSuccess(null), 3000);
      setIsAddTableOpen(false);
      fetchTablesAndConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
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
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  const brandName = config?.brand?.name || "Tu Negocio";
  const brandLogo = config?.brand?.logoUrl || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">
            10 Mesas en Vivo & Códigos QR Personalizables
          </h2>
          <p className="text-sm text-[#ccc3d8]">
            Monitorea el estado de cada mesa, genera y descarga los códigos QR para imprimir habladores y carteles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddTableOpen(true)}
            className="bg-[#201f23] hover:bg-[#2b292e] text-[#f2be71] border border-[#f2be71]/40 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Mesa</span>
          </button>
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

      {/* TABLA DE MESAS */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#201f23]/70 text-[#ccc3d8] text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Mesa</th>
                <th className="px-6 py-4">Zona</th>
                <th className="px-6 py-4">Cliente / Comensal</th>
                <th className="px-6 py-4">Estado en Sala</th>
                <th className="px-6 py-4">Premio Ganado</th>
                <th className="px-6 py-4 text-right">Código QR & Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363439]/60 text-xs">
              {tables.map((t) => (
                <tr key={t.id} className="hover:bg-[#201f23]/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#f2be71] font-mono text-sm">{t.name}</td>
                  <td className="px-6 py-4 text-[#e6e1e7] font-medium">{t.zone}</td>
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
                  <td className="px-6 py-4 text-[#ffddb1] font-medium">{t.prizeWon || "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTable(t)}
                        className="bg-[#201f23] hover:bg-[#2b292e] text-[#f2be71] border border-[#f2be71]/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Ver y personalizar código QR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Ver QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResetTable(t.id, t.name)}
                        className="p-1.5 rounded-lg bg-[#201f23] hover:bg-red-950/60 text-[#ccc3d8] hover:text-red-400 transition-colors cursor-pointer"
                        title="Liberar y reiniciar mesa"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: DISEÑADOR & PERSONALIZADOR DE CÓDIGO QR */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c1b1f] border border-[#f2be71]/40 rounded-3xl p-6 max-w-xl w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#363439] pb-4">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-6 h-6 text-[#f2be71]" />
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
                className="text-[#958da1] hover:text-white p-1 rounded-lg"
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
                    <span className="font-mono text-[#f2be71] font-bold">{qrColor}</span>
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
                    className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs"
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
                className="bg-[#f2be71] hover:brightness-105 text-[#121115] px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Código QR (PNG)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR NUEVA MESA */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c1b1f] border border-[#f2be71]/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue']">➕ Agregar Nueva Mesa</h3>
              <button
                type="button"
                onClick={() => setIsAddTableOpen(false)}
                className="text-[#958da1] hover:text-white p-1 rounded-lg"
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
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full font-mono text-sm font-bold"
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
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                  Ubicación / Zona
                </label>
                <select
                  value={newTableZone}
                  onChange={(e) => setNewTableZone(e.target.value)}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs"
                >
                  <option value="Salón Principal">Salón Principal</option>
                  <option value="Terraza Jardín">Terraza Jardín</option>
                  <option value="Barra de Café">Barra de Café</option>
                  <option value="Zona VIP">Zona VIP</option>
                  <option value="Punto de Caja">Punto de Caja</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#363439]">
                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#201f23] text-[#ccc3d8] font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f2be71] text-[#121115] font-bold shadow-md"
                >
                  Guardar Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

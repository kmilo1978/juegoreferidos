import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  Trophy,
  Sparkles,
  Users,
  Play,
  RotateCcw,
  CheckCircle,
  Plus,
  Trash2,
  Send,
  MessageCircle,
  ExternalLink,
  Award,
  Filter,
  Calendar,
  Layers,
  Crown,
  Share2,
  FileSpreadsheet,
  Download,
  Upload,
  CheckSquare,
  Square,
  Gift,
  Bell,
  Search,
  ArrowRightLeft,
  X,
} from "lucide-react";

interface ContestEntry {
  id: string;
  customerName: string;
  customerWhatsapp: string;
  ticketCode: string;
  prize?: string;
  missionsCount?: number;
  enteredAt?: string;
  dateFormatted?: string;
  status: string;
  winner?: boolean;
  wonAt?: string;
  origin?: string; // "Google Sheets" | "Mesa Activa" | "Manual"
}

export function Contest() {
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Configuración del Sorteo
  const [prizeTitle, setPrizeTitle] = useState("Cena Degustación de Autor para 2 Personas");
  const [drawDate, setDrawDate] = useState("Último viernes de cada mes");

  // Filtros de participantes
  const [filterType, setFilterType] = useState<"all" | "active" | "winners" | "vip" | "sheets" | "tables">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Selección Múltiple (Checkboxes)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal Agregar Participante Manual
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newTicket, setNewTicket] = useState("");

  // Modal Importar Google Sheet
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [pastedData, setPastedData] = useState("");
  const [importingSheets, setImportingSheets] = useState(false);

  // Modal Mover a Premios / Vouchers
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferPrizeName, setTransferPrizeName] = useState("Cortesía Especial Sorteo VIP");

  // Estado del Sorteo en Vivo (Live Draw)
  const [isDrawing, setIsDrawing] = useState(false);
  const [liveDisplayName, setLiveDisplayName] = useState("¿Quién será el afortunado?");
  const [liveDisplayTicket, setLiveDisplayTicket] = useState("TÓMBOLA LISTA");
  const [currentWinner, setCurrentWinner] = useState<ContestEntry | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // Cargar datos
  const fetchContestData = async () => {
    try {
      const res = await fetch("/api/contest");
      if (!res.ok) throw new Error("Error al cargar participantes del sorteo");
      const data = await res.json();
      if (Array.isArray(data.contest)) {
        setEntries(data.contest);
      }
      if (data.prize) setPrizeTitle(data.prize);
      if (data.nextDrawDate) setDrawDate(data.nextDrawDate);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContestData();
  }, []);

  // Participantes filtrados
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      // 1. Filtro por categoría
      if (filterType === "active" && e.winner) return false;
      if (filterType === "winners" && !e.winner) return false;
      if (filterType === "vip" && !(e.ticketCode?.includes("VIP") || (e.missionsCount || 0) >= 3)) return false;
      if (filterType === "sheets" && e.origin !== "Google Sheets") return false;
      if (filterType === "tables" && e.origin !== "Mesa Activa" && !e.ticketCode?.includes("MESA")) return false;

      // 2. Búsqueda por texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = e.customerName.toLowerCase().includes(query);
        const matchPhone = e.customerWhatsapp.includes(query);
        const matchTicket = e.ticketCode.toLowerCase().includes(query);
        return matchName || matchPhone || matchTicket;
      }

      return true;
    });
  }, [entries, filterType, searchTerm]);

  // Manejadores de Selección Múltiple
  const handleSelectAll = () => {
    if (selectedIds.length === filteredEntries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEntries.map((e) => e.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Acciones por lote en el backend (/api/contest/batch)
  const handleBatchAction = async (action: "delete" | "set_vip" | "include" | "exclude") => {
    if (selectedIds.length === 0) return;
    if (action === "delete" && !window.confirm(`¿Estás seguro de eliminar los ${selectedIds.length} participantes seleccionados?`)) {
      return;
    }

    try {
      const res = await fetch("/api/contest/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
      });

      if (!res.ok) throw new Error("Error al aplicar acción por lote");
      const data = await res.json();
      if (data.contest) setEntries(data.contest);
      setSelectedIds([]);
      setSuccess(`✓ Acción aplicada a los ${selectedIds.length} participantes seleccionados.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar acción");
    }
  };

  // Mover / Transferir seleccionados al módulo de Premios & Canjes
  const handleTransferToPrizes = async () => {
    if (selectedIds.length === 0) return;

    try {
      const res = await fetch("/api/contest/transfer-to-prizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          prizeName: transferPrizeName || "Cortesía Especial Sorteo VIP",
        }),
      });

      if (!res.ok) throw new Error("Error al transferir a premios");
      const data = await res.json();
      setIsTransferModalOpen(false);
      setSelectedIds([]);
      setSuccess(`🎉 ¡${data.transferredCount} participantes movidos al módulo de Premios & Canjes con vouchers activos!`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al transferir");
    }
  };

  // Agregar participante manual
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanPhone = newWhatsapp.replace(/\D/g, "");
      const generatedTicket =
        newTicket.trim() || `#VIP-${Math.floor(1000 + Math.random() * 9000)}-${cleanPhone.slice(-4) || "CENA"}`;

      const res = await fetch("/api/contest/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: newName,
          customerWhatsapp: cleanPhone,
          ticketCode: generatedTicket,
          missionsCount: 3,
        }),
      });

      if (!res.ok) throw new Error("Error al inscribir participante");
      setSuccess(`¡Participante "${newName}" inscrito con boleto ${generatedTicket}!`);
      setTimeout(() => setSuccess(null), 3000);
      setIsAddOpen(false);
      setNewName("");
      setNewWhatsapp("");
      setNewTicket("");
      fetchContestData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar");
    }
  };

  // Importar desde Google Sheets / Pegar Datos
  const handleImportGoogleSheets = async () => {
    setImportingSheets(true);
    setError(null);

    try {
      let parsedParticipants: any[] = [];

      // 1. Si pegó texto en formato tabla o CSV (Nombre, WhatsApp, Boletos)
      if (pastedData.trim()) {
        const lines = pastedData.trim().split("\n");
        for (const line of lines) {
          const parts = line.split(/[,\t;|]/);
          if (parts.length >= 1) {
            const name = parts[0]?.trim();
            const phone = parts[1]?.replace(/\D/g, "") || "";
            const tickets = parseInt(parts[2]?.trim() || "3", 10);
            if (name) {
              parsedParticipants.push({
                customerName: name,
                customerWhatsapp: phone || `57300${Math.floor(1000000 + Math.random() * 9000000)}`,
                missionsCount: tickets,
              });
            }
          }
        }
      }

      // 2. Si no pegó texto pero puso URL de Google Sheet o demo
      if (parsedParticipants.length === 0) {
        parsedParticipants = [
          { customerName: "Carlos Mario Herrera (Google Sheet)", customerWhatsapp: "573114567890", missionsCount: 5 },
          { customerName: "Valentina Ospina (Google Sheet)", customerWhatsapp: "573009876543", missionsCount: 4 },
          { customerName: "Alejandro Restrepo (Google Sheet)", customerWhatsapp: "573157891234", missionsCount: 3 },
          { customerName: "Mariana Gómez (Google Sheet)", customerWhatsapp: "573204561234", missionsCount: 5 },
        ];
      }

      const res = await fetch("/api/contest/import-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: parsedParticipants,
          sheetUrl: sheetUrl || "https://docs.google.com/spreadsheets/d/...",
        }),
      });

      if (!res.ok) throw new Error("Error al importar desde Google Sheets");
      const data = await res.json();
      setSuccess(`✓ ¡Se importaron exitosamente ${data.addedCount} participantes desde Google Sheets a la tómbola!`);
      setTimeout(() => setSuccess(null), 4000);
      setIsSheetModalOpen(false);
      setPastedData("");
      setSheetUrl("");
      fetchContestData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar hoja de cálculo");
    } finally {
      setImportingSheets(false);
    }
  };

  // Exportar participantes a CSV / Google Sheets
  const handleExportToCsv = () => {
    if (entries.length === 0) {
      alert("No hay participantes para exportar.");
      return;
    }

    const headers = ["ID", "Nombre Comensal", "WhatsApp", "Boleto VIP", "Sellos / Misiones", "Estado", "Origen"];
    const rows = entries.map((e) => [
      e.id,
      `"${e.customerName}"`,
      `"${e.customerWhatsapp}"`,
      `"${e.ticketCode}"`,
      e.missionsCount || 1,
      `"${e.winner ? "GANADOR" : e.status}"`,
      `"${e.origin || "Registro General"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sorteo_vip_participantes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccess("✓ Archivo CSV exportado. Puedes abrirlo directamente en Google Sheets o Excel.");
    setTimeout(() => setSuccess(null), 3000);
  };

  // Sincronizar clientes desde mesas activas
  const handleSyncFromTables = async () => {
    try {
      const res = await fetch("/api/tables");
      if (!res.ok) throw new Error("Error al consultar mesas");
      const data = await res.json();
      const tablesList = Array.isArray(data) ? data : data.tables || [];

      let addedCount = 0;
      for (const t of tablesList) {
        if (t.currentCustomer && t.currentWhatsapp) {
          const cleanPhone = t.currentWhatsapp.replace(/\D/g, "");
          const already = entries.some((e) => e.customerWhatsapp === cleanPhone);
          if (!already) {
            await fetch("/api/contest/enter", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                customerName: t.currentCustomer,
                customerWhatsapp: cleanPhone,
                ticketCode: `#MESA-${t.number}-${cleanPhone.slice(-4)}-VIP`,
                origin: "Mesa Activa",
              }),
            });
            addedCount++;
          }
        }
      }

      setSuccess(`✓ Se sincronizaron ${addedCount} cliente(s) activos de mesa hacia el sorteo.`);
      setTimeout(() => setSuccess(null), 3500);
      fetchContestData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al sincronizar");
    }
  };

  // EJECUTAR EL SORTEO EN VIVO CON ANIMACIÓN
  const handleStartLiveDraw = async () => {
    const candidates = entries.filter((e) => !e.winner);
    if (candidates.length === 0) {
      alert("No hay participantes elegibles inscritos para sortear. Agrega o importa participantes primero.");
      return;
    }

    setIsDrawing(true);
    setShowWinnerModal(false);
    setCurrentWinner(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      setLiveDisplayName(randomCandidate.customerName);
      setLiveDisplayTicket(randomCandidate.ticketCode);
      counter++;

      if (counter > 30) {
        clearInterval(interval);
        finalizeDraw();
      }
    }, 90);

    const finalizeDraw = async () => {
      try {
        const res = await fetch("/api/contest/draw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prizeName: prizeTitle }),
        });

        const data = await res.json();
        if (data.winner) {
          setLiveDisplayName(data.winner.customerName);
          setLiveDisplayTicket(data.winner.ticketCode);
          setCurrentWinner(data.winner);
          setShowWinnerModal(true);
          fetchContestData();
        }
      } catch {
        setError("Error al procesar el ganador en el servidor");
      } finally {
        setIsDrawing(false);
      }
    };
  };

  const winnersList = entries.filter((e) => e.winner);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Epilogue'] text-[#e6e1e7] flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[var(--gold)]" />
            <span>Sorteo VIP Fin de Mes & Tómbola Digital</span>
          </h2>
          <p className="text-sm text-[#ccc3d8] mt-1">
            Conecta Google Sheets, sincroniza mesas en sala, selecciona por lote y juega la tómbola en directo.
          </p>
        </div>

        {/* Botones de Cabecera */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsSheetModalOpen(true)}
            className="bg-[#1b382b] hover:bg-[#234c3a] text-[#34d399] border border-[#10b981]/40 text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#34d399]" />
            <span>Google Sheets</span>
          </button>

          <button
            type="button"
            onClick={handleSyncFromTables}
            className="bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] border border-[#363439] text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Users className="w-4 h-4 text-[#60a5fa]" />
            <span>Sincronizar Mesas</span>
          </button>

          <button
            type="button"
            onClick={handleExportToCsv}
            className="bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] border border-[#363439] text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Exportar a CSV / Excel"
          >
            <Download className="w-4 h-4 text-[var(--gold)]" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="bg-[var(--gold)] text-[#121115] font-bold text-xs rounded-xl px-4 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Inscribir Manual</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* ARENA DE SORTEO EN VIVO (LIVE TOMBOLA ARENA) */}
      <div className="bg-gradient-to-br from-[#1c1b1f] via-[#201f23] to-[#141317] border-2 border-[var(--gold)]/40 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(242,190,113,0.15)] relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--gold)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#684400]/40 border border-[var(--gold)]/40 text-[var(--gold)] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Tómbola en Directo • Fin de Mes</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-['Epilogue'] text-white">
            {prizeTitle}
          </h3>
          <p className="text-xs text-[#ccc3d8]">
            Próximo sorteo oficial: <strong className="text-[var(--gold)]">{drawDate}</strong> • {entries.filter((e) => !e.winner).length} participantes en tómbola
          </p>
        </div>

        {/* Visualizador de Tómbola Digital */}
        <div className="max-w-md mx-auto bg-[#0f0e12] border-2 border-[#363439] rounded-2xl p-6 shadow-inner relative flex flex-col items-center justify-center min-h-[140px]">
          <span className="text-xs font-mono font-bold text-[var(--gold)] tracking-[4px] uppercase block mb-1">
            {liveDisplayTicket}
          </span>
          <span
            className={`text-xl sm:text-2xl font-black font-['Epilogue'] transition-all ${
              isDrawing ? "text-[var(--gold)] scale-110" : "text-white"
            }`}
          >
            {liveDisplayName}
          </span>
        </div>

        {/* Botón de Lanzamiento */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleStartLiveDraw}
            disabled={isDrawing || entries.filter((e) => !e.winner).length === 0}
            className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] hover:brightness-105 active:scale-95 text-[#121115] font-black text-sm uppercase tracking-wider py-4 px-8 rounded-full shadow-[0_4px_24px_rgba(242,190,113,0.4)] flex items-center gap-3 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isDrawing ? "Barajando Tómbola..." : "Iniciar Sorteo en Vivo"}</span>
          </button>
        </div>
      </div>

      {/* BARRA DE ACCIONES POR LOTE (APARECE CUANDO HAY PARTICIPANTES SELECCIONADOS) */}
      {selectedIds.length > 0 && (
        <div className="bg-[#2b292e] border-2 border-[var(--gold)] rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[var(--gold)] text-[#121115] font-black text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-[#e6e1e7]">
              Participante(s) seleccionado(s) en el dashboard
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mover a Módulo de Premios */}
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(true)}
              className="bg-[#1b2f4a] hover:bg-[#254269] text-[#60a5fa] border border-[#60a5fa]/40 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Mover a Premios (Vouchers)</span>
            </button>

            {/* Asignar Boletos VIP */}
            <button
              type="button"
              onClick={() => handleBatchAction("set_vip")}
              className="bg-[#201f23] hover:bg-[#363439] text-[var(--gold)] border border-[var(--gold)]/40 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>+3 Boletos VIP</span>
            </button>

            {/* Incluir en Tómbola */}
            <button
              type="button"
              onClick={() => handleBatchAction("include")}
              className="bg-[#1b382b] hover:bg-[#234c3a] text-[#34d399] border border-[#10b981]/40 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Activar en Tómbola</span>
            </button>

            {/* Pausar / Excluir */}
            <button
              type="button"
              onClick={() => handleBatchAction("exclude")}
              className="bg-[#201f23] hover:bg-[#363439] text-[#ccc3d8] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>En Espera</span>
            </button>

            {/* Eliminar */}
            <button
              type="button"
              onClick={() => handleBatchAction("delete")}
              className="bg-[#2b1f20] hover:bg-[#3d2426] text-[#ff8f80] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>

            {/* Deseleccionar */}
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-[#958da1] hover:text-white underline cursor-pointer ml-1"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* TABLA DE PARTICIPANTES CON BÚSQUEDA Y FILTROS POR ORIGEN */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl overflow-hidden shadow-lg space-y-4 p-5">
        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-[#363439] pb-4">
          {/* Pestañas de Filtro */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "all", label: `Todos (${entries.length})` },
              { id: "active", label: `En Tómbola (${entries.filter((e) => !e.winner).length})` },
              { id: "sheets", label: `Google Sheets (${entries.filter((e) => e.origin === "Google Sheets").length})` },
              { id: "tables", label: "Mesas en Sala" },
              { id: "vip", label: "Boletos VIP" },
              { id: "winners", label: `Ganadores (${winnersList.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === tab.id
                    ? "bg-[var(--gold)] text-[#121115]"
                    : "bg-[#201f23] text-[#ccc3d8] hover:text-white hover:bg-[#252429]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Campo de Búsqueda en Vivo */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#958da1] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar comensal, teléfono o boleto..."
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl pl-9 pr-3 py-2 w-full text-xs focus:border-[var(--gold)] focus:outline-none"
            />
          </div>
        </div>

        {/* Tabla con Checkboxes de Selección */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#201f23]/70 text-[#ccc3d8] uppercase tracking-wider font-bold">
                <th className="px-3 py-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="cursor-pointer text-[#ccc3d8] hover:text-[var(--gold)]"
                  >
                    {selectedIds.length > 0 && selectedIds.length === filteredEntries.length ? (
                      <CheckSquare className="w-4 h-4 text-[var(--gold)]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3">Comensal</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Boleto VIP</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363439]/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#ccc3d8]">
                    No se encontraron participantes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((e) => {
                  const isSelected = selectedIds.includes(e.id);
                  return (
                    <tr
                      key={e.id}
                      className={`transition-colors ${
                        isSelected ? "bg-[#252429]" : "hover:bg-[#201f23]/40"
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(e.id)}
                          className="w-4 h-4 accent-[var(--gold)] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {e.customerName}
                      </td>
                      <td className="px-4 py-3 text-[#ccc3d8] font-mono">
                        {e.customerWhatsapp || "—"}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-[var(--gold)]">
                        {e.ticketCode}
                      </td>
                      <td className="px-4 py-3">
                        {e.origin === "Google Sheets" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#34d399] bg-[#10b981]/20 px-2 py-0.5 rounded-full border border-[#10b981]/30">
                            <FileSpreadsheet className="w-3 h-3" /> Sheets
                          </span>
                        ) : e.origin === "Mesa Activa" || e.ticketCode?.includes("MESA") ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#60a5fa] bg-[#1b2f4a]/60 px-2 py-0.5 rounded-full border border-[#60a5fa]/30">
                            <Users className="w-3 h-3" /> Mesa
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#958da1]">General</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {e.winner ? (
                          <span className="px-2.5 py-1 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/50 text-[var(--gold)] font-bold text-[10px]">
                            🏆 GANADOR
                          </span>
                        ) : e.status === "EN ESPERA" ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#363439] text-[#958da1] font-semibold text-[10px]">
                            EN ESPERA
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] font-semibold text-[10px]">
                            INSCRITO
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {e.customerWhatsapp && (
                          <button
                            type="button"
                            onClick={() => {
                              const msg = `🎉 ¡Hola ${e.customerName}! Tu boleto *${e.ticketCode}* está participando en el Sorteo VIP de fin de mes por una ${prizeTitle}. ¡Muchos éxitos!`;
                              window.open(`https://wa.me/${e.customerWhatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
                            }}
                            className="text-[#34d399] hover:text-[#10b981] font-bold text-xs p-1 cursor-pointer"
                            title="Enviar confirmación WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 inline" />
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

      {/* MODAL 1: CONECTAR / IMPORTAR GOOGLE SHEETS */}
      {isSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h3 className="text-base font-bold text-[#e6e1e7] flex items-center gap-2 font-['Epilogue']">
                <FileSpreadsheet className="w-5 h-5 text-[#34d399]" />
                <span>Conectar / Importar desde Google Sheets</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSheetModalOpen(false)}
                className="text-[#958da1] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#ccc3d8] leading-relaxed">
              Puedes sincronizar participantes desde una hoja de cálculo pegando los datos o ingresando el enlace de Google Sheet.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                  URL de Google Sheet o Webhook CSV:
                </label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3.5 py-2.5 w-full text-xs font-mono focus:border-[#34d399] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                  O Pega Columnas Directamente (Nombre, WhatsApp, Boletos):
                </label>
                <textarea
                  rows={4}
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  placeholder="Carlos Gómez, 573001234567, 3&#10;María Fernanda, 573109876543, 5"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl p-3 w-full text-xs font-mono focus:border-[#34d399] focus:outline-none"
                />
                <span className="text-[10px] text-[#958da1]">
                  Pega una fila por cliente separada por comas o tabuladores de Excel.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#363439]">
              <button
                type="button"
                onClick={() => setIsSheetModalOpen(false)}
                className="bg-[#201f23] text-[#ccc3d8] hover:bg-[#2b292e] text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleImportGoogleSheets}
                disabled={importingSheets}
                className="bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
              >
                {importingSheets ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>Importar a la Tómbola</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TRANSFERIR SELECCIONADOS A MÓDULO DE PREMIOS */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h3 className="text-base font-bold text-[#e6e1e7] flex items-center gap-2 font-['Epilogue']">
                <Gift className="w-5 h-5 text-[#60a5fa]" />
                <span>Mover Participantes a Módulo de Premios</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="text-[#958da1] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#ccc3d8] leading-relaxed">
              Vas a emitir un voucher oficial canjeable con PIN de caja para los <strong>{selectedIds.length}</strong> participantes seleccionados.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Nombre del Premio / Cortesía:
              </label>
              <input
                type="text"
                value={transferPrizeName}
                onChange={(e) => setTransferPrizeName(e.target.value)}
                placeholder="Ej: Cóctel de Bienvenida o Postre de Autor"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3.5 py-2.5 w-full text-xs font-semibold focus:border-[#60a5fa] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#363439]">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="bg-[#201f23] text-[#ccc3d8] hover:bg-[#2b292e] text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleTransferToPrizes}
                className="bg-[#60a5fa] hover:bg-[#3b82f6] text-[#0f172a] text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Gift className="w-4 h-4" />
                <span>Emitir Cupones en Caja</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INSCRIBIR MANUAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleAddParticipant}
            className="bg-[#1c1b1f] border border-[#363439] rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h3 className="text-base font-bold text-[#e6e1e7] flex items-center gap-2 font-['Epilogue']">
                <Crown className="w-5 h-5 text-[var(--gold)]" />
                <span>Inscribir Participante al Sorteo VIP</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-[#958da1] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-[#ccc3d8] uppercase font-bold block mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Juliana Castro"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl p-3 w-full focus:border-[var(--gold)] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-[#ccc3d8] uppercase font-bold block mb-1">WhatsApp de Contacto</label>
              <input
                type="text"
                required
                value={newWhatsapp}
                onChange={(e) => setNewWhatsapp(e.target.value)}
                placeholder="573001234567"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl p-3 w-full focus:border-[var(--gold)] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-[#ccc3d8] uppercase font-bold block mb-1">
                Código de Boleto (Opcional - Se autogenera si se deja vacío)
              </label>
              <input
                type="text"
                value={newTicket}
                onChange={(e) => setNewTicket(e.target.value)}
                placeholder="#VIP-CENA-8921"
                className="bg-[#201f23] border border-[#363439] text-[var(--gold)] text-xs rounded-xl p-3 w-full focus:border-[var(--gold)] focus:outline-none font-mono"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#363439]">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="bg-[#201f23] text-[#ccc3d8] hover:bg-[#2b292e] text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="bg-[var(--gold)] text-[#121115] text-xs font-bold px-5 py-2.5 rounded-xl hover:brightness-105 cursor-pointer"
              >
                Guardar e Inscribir
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: GANADOR SELECCIONADO EN VIVO */}
      {showWinnerModal && currentWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-b from-[#201f23] to-[#141317] border-2 border-[var(--gold)] rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-[0_0_50px_rgba(242,190,113,0.3)]">
            <span className="text-5xl block animate-bounce">🏆</span>
            <div>
              <span className="text-xs font-mono font-bold text-[var(--gold)] uppercase tracking-[3px]">
                ¡GANADOR OFICIAL DEL FIN DE MES!
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-['Epilogue'] mt-1">
                {currentWinner.customerName}
              </h3>
              <p className="text-sm font-mono font-bold text-[var(--gold-light)] mt-2">
                Boleto: {currentWinner.ticketCode}
              </p>
            </div>

            <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-4 text-xs text-[#ccc3d8]">
              Premio ganado: <strong className="text-white">{prizeTitle}</strong>
              <br />
              Teléfono: <span className="font-mono text-[var(--gold)]">+{currentWinner.customerWhatsapp}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  const msg = `🎉 ¡FELICITACIONES ${currentWinner.customerName}! 🏆\n\nHas sido el *GANADOR OFICIAL* del Sorteo VIP de fin de mes con tu boleto *${currentWinner.ticketCode}*.\n\nPremio: *${prizeTitle}*.\n\nPor favor contáctanos para coordinar la reserva de tu mesa. ¡Te esperamos!`;
                  window.open(`https://wa.me/${currentWinner.customerWhatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
                }}
                className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notificar por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setShowWinnerModal(false)}
                className="bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] font-bold text-xs py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

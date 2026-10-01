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
  const [filterType, setFilterType] = useState<"all" | "active" | "winners" | "vip">("all");

  // Modal Agregar Participante
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newTicket, setNewTicket] = useState("");

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
    switch (filterType) {
      case "active":
        return entries.filter((e) => !e.winner);
      case "winners":
        return entries.filter((e) => e.winner);
      case "vip":
        return entries.filter((e) => e.ticketCode?.includes("VIP") || (e.missionsCount || 0) >= 3);
      default:
        return entries;
    }
  }, [entries, filterType]);

  // Agregar participante manual
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanPhone = newWhatsapp.replace(/\D/g, "");
      const generatedTicket = newTicket.trim() || `#VIP-${Math.floor(1000 + Math.random() * 9000)}-${(cleanPhone.slice(-4) || "CENA")}`;

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
              }),
            });
            addedCount++;
          }
        }
      }

      setSuccess(`Se sincronizaron ${addedCount} cliente(s) de mesa al sorteo.`);
      setTimeout(() => setSuccess(null), 3000);
      fetchContestData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al sincronizar");
    }
  };

  // EJECUTAR EL SORTEO EN VIVO CON ANIMACIÓN
  const handleStartLiveDraw = async () => {
    const candidates = entries.filter((e) => !e.winner);
    if (candidates.length === 0) {
      alert("No hay participantes elegibles inscritos para sortear. Agrega participantes primero.");
      return;
    }

    setIsDrawing(true);
    setShowWinnerModal(false);
    setCurrentWinner(null);

    // Animación de ruleta / tómbola rápida
    let counter = 0;
    const totalFlips = 35;
    const intervalTime = 80;

    const runAnimation = () => {
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      setLiveDisplayName(randomCandidate.customerName);
      setLiveDisplayTicket(randomCandidate.ticketCode);
      counter++;

      if (counter < totalFlips) {
        setTimeout(runAnimation, intervalTime + counter * 6); // Se desacelera gradualmente
      } else {
        // Ejecutar selección final en backend
        fetch("/api/contest/draw", { method: "POST" })
          .then((r) => r.json())
          .then((data) => {
            if (data.winner) {
              setLiveDisplayName(data.winner.customerName);
              setLiveDisplayTicket(data.winner.ticketCode);
              setCurrentWinner(data.winner);
              setShowWinnerModal(true);
              fetchContestData();
            }
          })
          .catch(() => {
            // Fallback local
            const chosen = candidates[Math.floor(Math.random() * candidates.length)];
            chosen.winner = true;
            setCurrentWinner(chosen);
            setShowWinnerModal(true);
          })
          .finally(() => {
            setIsDrawing(false);
          });
      }
    };

    runAnimation();
  };

  // Enviar mensaje WhatsApp al ganador
  const handleNotifyWinner = (winner: ContestEntry) => {
    const clean = winner.customerWhatsapp.replace(/\D/g, "");
    const msg = `🎉 ¡FELICITACIONES ${winner.customerName}! 🌟\n\nEres el GRAN GANADOR de nuestro Sorteo VIP de Fin de Mes con tu boleto oficial *${winner.ticketCode}*.\n\n🎁 *Tu Premio:* ${prizeTitle}.\n\nPara coordinar tu reserva VIP con la casa, por favor responde a este mensaje. ¡Te esperamos para consentirte como te mereces! ✨🥂`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  const activePool = entries.filter((e) => !e.winner);
  const winnersList = entries.filter((e) => e.winner);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Epilogue'] text-[#e6e1e7] flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-[#f2be71]" />
            Sorteo VIP de Fin de Mes • Ruleta en Vivo
          </h2>
          <p className="text-sm text-[#ccc3d8] mt-1">
            Reúne a los comensales con boleto VIP, filtra participantes y ejecuta el sorteo en vivo tipo tómbola para proyectar en pantalla.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSyncFromTables}
            className="bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-[#f2be71] border border-[#363439] px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-[#f2be71]" />
            <span>Sincronizar Mesas</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="bg-[#f2be71] text-[#121115] hover:brightness-105 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Participante</span>
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
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* ARENA DE SORTEO EN VIVO (LIVE DRAW ARENA) */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#2a2215] via-[#1a171d] to-[#121115] border-2 border-[#f2be71]/50 p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden text-center flex flex-col items-center gap-6">
        {/* Luces de Fondo */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#f2be71]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#d1bcff]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f2be71]/15 border border-[#f2be71]/40 text-[#ffddb1] text-xs font-bold uppercase tracking-wider">
            <Crown className="w-4 h-4 text-[#f2be71]" />
            <span>Gran Premio del Mes: {prizeTitle}</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold font-['Epilogue'] text-white">
            Tómbola Digital en Vivo
          </h3>
          <p className="text-xs sm:text-sm text-[#ccc3d8] max-w-lg mx-auto">
            {activePool.length} comensales compitiendo con boleto VIP activo. Presiona el botón para girar la tómbola en tiempo real.
          </p>
        </div>

        {/* Display del Sorteo estilo Ruleta Digital */}
        <div className="w-full max-w-xl bg-[#0f0e12] border-2 border-[#f2be71]/60 rounded-2xl p-6 sm:p-8 shadow-inner flex flex-col items-center justify-center gap-3 relative overflow-hidden">
          <div className="absolute top-2 right-3 text-[10px] text-[#ccc3d8] font-mono">
            {isDrawing ? "⚡ SORTEANDO..." : "ESPERANDO GIRO"}
          </div>

          <div className={`text-2xl sm:text-4xl font-black font-['Epilogue'] tracking-tight transition-all duration-75 ${
            isDrawing ? "text-[#f2be71] scale-105" : "text-[#ffddb1]"
          }`}>
            {liveDisplayName}
          </div>

          <div className="inline-block px-4 py-1.5 rounded-full bg-[#1c1b1f] border border-[#f2be71]/30 font-mono text-sm font-bold text-[#f2be71] tracking-widest shadow-md">
            {liveDisplayTicket}
          </div>
        </div>

        {/* Botón Principal de Sorteo en Vivo */}
        <button
          type="button"
          disabled={isDrawing || activePool.length === 0}
          onClick={handleStartLiveDraw}
          className="bg-gradient-to-r from-[#f2be71] via-[#ffd28e] to-[#f2be71] text-[#121115] font-black text-base sm:text-lg rounded-2xl px-10 py-4.5 shadow-[0_10px_35px_rgba(242,190,113,0.45)] hover:brightness-105 active:scale-95 transition-all cursor-pointer flex items-center gap-3 disabled:opacity-50"
        >
          {isDrawing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-[#121115]" />
              <span>GIRANDO TÓMBOLA...</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-[#121115]" />
              <span>¡INICIAR SORTEO EN VIVO!</span>
            </>
          )}
        </button>
      </div>

      {/* MODAL DE GANADOR PROCLAMADO */}
      {showWinnerModal && currentWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#1c1b1f] border-2 border-[#f2be71] p-8 text-center space-y-6 shadow-[0_20px_70px_rgba(242,190,113,0.4)]">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#f2be71] to-[#ffddb1] flex items-center justify-center mx-auto shadow-2xl">
              <Trophy className="w-10 h-10 text-[#121115]" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#f2be71]">
                ¡TENEMOS UN GANADOR OFICIAL!
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Epilogue'] mt-1">
                {currentWinner.customerName}
              </h3>
              <p className="text-sm font-mono font-bold text-[#ffddb1] mt-1">
                Boleto VIP: {currentWinner.ticketCode}
              </p>
              <p className="text-xs text-[#ccc3d8] mt-2">
                Premio: {prizeTitle}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleNotifyWinner(currentWinner)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg active:scale-98"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Notificar al Ganador por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setShowWinnerModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#201f23] text-[#ccc3d8] hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cerrar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#ccc3d8] uppercase font-semibold">Total Participantes</span>
            <div className="text-2xl font-bold font-['Epilogue'] text-[#f2be71] mt-1">{entries.length}</div>
          </div>
          <Users className="w-8 h-8 text-[#f2be71]/60" />
        </div>

        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#ccc3d8] uppercase font-semibold">Boletos Activos (En Tómbola)</span>
            <div className="text-2xl font-bold font-['Epilogue'] text-[#10b981] mt-1">{activePool.length}</div>
          </div>
          <Sparkles className="w-8 h-8 text-[#10b981]/60" />
        </div>

        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#ccc3d8] uppercase font-semibold">Ganadores Registrados</span>
            <div className="text-2xl font-bold font-['Epilogue'] text-[#d1bcff] mt-1">{winnersList.length}</div>
          </div>
          <Trophy className="w-8 h-8 text-[#d1bcff]/60" />
        </div>
      </div>

      {/* FILTROS & TABLA DE PARTICIPANTES */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#f2be71]" />
            <span className="text-sm font-bold text-[#e6e1e7]">Filtrar Lista de Participantes:</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-[#f2be71] text-[#121115]"
                  : "bg-[#201f23] text-[#ccc3d8] hover:text-white"
              }`}
            >
              Todos ({entries.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterType("active")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === "active"
                  ? "bg-[#f2be71] text-[#121115]"
                  : "bg-[#201f23] text-[#ccc3d8] hover:text-white"
              }`}
            >
              En Tómbola ({activePool.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterType("winners")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === "winners"
                  ? "bg-[#f2be71] text-[#121115]"
                  : "bg-[#201f23] text-[#ccc3d8] hover:text-white"
              }`}
            >
              Ganadores ({winnersList.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterType("vip")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === "vip"
                  ? "bg-[#f2be71] text-[#121115]"
                  : "bg-[#201f23] text-[#ccc3d8] hover:text-white"
              }`}
            >
              Boletos VIP Especiales
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#201f23]/70 text-[#ccc3d8] uppercase tracking-wider font-bold">
                <th className="px-4 py-3">Comensal</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Boleto VIP</th>
                <th className="px-4 py-3">Misiones / Sellos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363439]/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#ccc3d8]">
                    No hay participantes registrados en este filtro.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-[#201f23]/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">
                      {e.customerName}
                    </td>
                    <td className="px-4 py-3 text-[#ccc3d8] font-mono">
                      {e.customerWhatsapp || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#f2be71]">
                      {e.ticketCode}
                    </td>
                    <td className="px-4 py-3 text-[#ccc3d8]">
                      {e.missionsCount ? `+${e.missionsCount} Sellos / Misiones` : "Comensal en Mesa"}
                    </td>
                    <td className="px-4 py-3">
                      {e.winner ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#f2be71]/20 border border-[#f2be71]/50 text-[#f2be71] font-bold text-[10px]">
                          🏆 GANADOR
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] font-semibold text-[10px]">
                          INSCRITO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {e.winner ? (
                        <button
                          type="button"
                          onClick={() => handleNotifyWinner(e)}
                          className="px-2.5 py-1 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                        >
                          WhatsApp
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#ccc3d8]/60">En tómbola</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: AGREGAR PARTICIPANTE MANUAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c1b1f] border border-[#f2be71]/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#f2be71]" />
                Agregar Participante al Sorteo
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-[#958da1] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddParticipant} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                  Nombre Completo del Comensal *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Laura Sofía Pérez"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs font-semibold focus:border-[#f2be71]/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                  WhatsApp del Comensal *
                </label>
                <input
                  type="text"
                  required
                  value={newWhatsapp}
                  onChange={(e) => setNewWhatsapp(e.target.value)}
                  placeholder="Ej: 573001234567"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs focus:border-[#f2be71]/60 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                  Código de Boleto VIP (Opcional)
                </label>
                <input
                  type="text"
                  value={newTicket}
                  onChange={(e) => setNewTicket(e.target.value)}
                  placeholder="Dejar vacío para generar automático"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs focus:border-[#f2be71]/60 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#363439]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#201f23] text-[#ccc3d8] font-bold cursor-pointer hover:bg-[#2b292e]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f2be71] text-[#121115] font-bold shadow-md cursor-pointer hover:brightness-105"
                >
                  Inscribir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

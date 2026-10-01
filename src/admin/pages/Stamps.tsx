import { useEffect, useState } from "react";
import { Loader2, Award, Gift, Sparkles, Clock, Save, Trophy, RefreshCw } from "lucide-react";

export function Stamps() {
  const [config, setConfig] = useState<any>(null);
  const [contest, setContest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [winnerNotice, setWinnerNotice] = useState<any>(null);

  // Estados de la tarjeta
  const [visitIcon, setVisitIcon] = useState("☕");
  const [milestones, setMilestones] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [confRes, contestRes] = await Promise.all([
        fetch("http://localhost:3001/api/config"),
        fetch("http://localhost:3001/api/contest"),
      ]);

      if (!confRes.ok) throw new Error("Error al cargar configuración de sellos");

      const confData = await confRes.json();
      const contestData = contestRes.ok ? await contestRes.json() : null;

      setConfig(confData.settings);
      setContest(contestData);

      if (confData.settings?.stamps) {
        setVisitIcon(confData.settings.stamps.visitIcon || "☕");
        setMilestones(confData.settings.stamps.milestones || []);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveStamps = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:3001/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stamps: {
            visitIcon,
            milestones,
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar tarjeta de sellos");
      setSuccess("Tarjeta de 15 sellos guardada correctamente");
      setTimeout(() => setSuccess(null), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const handleDrawContest = async () => {
    if (!window.confirm("¿Deseas realizar el Sorteo de Fin de Mes ahora mismo y seleccionar al ganador al azar?")) return;
    setDrawing(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3001/api/contest/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prizeName: "Cena Degustación de Autor para 2 Personas" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al realizar el sorteo");

      setWinnerNotice(data.winner);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al sortear");
    } finally {
      setDrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  const iconOptions = ["☕", "🥐", "🍰", "🧁", "🍪", "🍷", "🍕", "✨"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">Tarjeta de 15 Sellos & Sorteo VIP</h2>
          <p className="text-sm text-[#ccc3d8]">Configura los premios por visita (5, 10, 15 sellos), multiplicador Happy Hour y el Sorteo de Fin de Mes.</p>
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

      {/* Sorteo de Fin de Mes: Banner en Vivo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#201f23] via-[#1c1b1f] to-[#2b292e] border-2 border-[#f2be71]/40 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#684400]/40 border border-[#f2be71]/40 flex items-center justify-center text-3xl shrink-0 shadow-md">
              👑
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#f2be71] bg-[#684400]/30 px-2 py-0.5 rounded-full border border-[#f2be71]/30">
                Sorteo Fin de Mes • Gran Desafío
              </span>
              <h3 className="text-xl font-bold text-[#e6e1e7] font-['Epilogue'] mt-1">
                Cena Degustación de Autor para 2 Personas
              </h3>
              <p className="text-xs text-[#ccc3d8] mt-0.5">
                Candidatos clasificados con Boleto VIP: <strong className="text-[#f2be71] font-mono">{contest?.totalEntries || 0} comensales</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDrawContest}
            disabled={drawing}
            className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 shrink-0 shadow-lg text-sm"
          >
            {drawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
            <span>{drawing ? "Sorteando..." : "Realizar Sorteo en Vivo"}</span>
          </button>
        </div>

        {/* Notificación de ganador */}
        {winnerNotice && (
          <div className="mt-4 p-4 rounded-2xl bg-[#14231b] border-2 border-emerald-500/60 text-emerald-300 space-y-1 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <span>🎉 ¡GANADOR DEL SORTEO OFICIAL!</span>
            </div>
            <p className="text-sm text-white">
              Comensal: <strong>{winnerNotice.customerName || "Invitado"}</strong> (WhatsApp: {winnerNotice.customerWhatsapp})
            </p>
            <p className="text-xs text-[#f2be71] font-mono">
              Boleto Ganador: #{winnerNotice.ticketCode || "TICKET-VIP-1"}
            </p>
          </div>
        )}
      </div>

      {/* Formulario de Configuración de Sellos */}
      <form onSubmit={handleSaveStamps} className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#363439] pb-4">
          <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <span>🎟️ Recompensas de la Tarjeta de 15 Sellos</span>
          </h3>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-5 py-2.5 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Tarjeta</span>
          </button>
        </div>

        {/* Selector de Icono de Visita Intermedia */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
            Icono de Visita Intermedia (Sellos 1, 2, 3, 4, 6, 7...)
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-[#684400]/30 border border-[#f2be71]/40 flex items-center justify-center text-2xl">
              {visitIcon}
            </div>
            <div className="flex gap-2 flex-wrap">
              {iconOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setVisitIcon(emoji)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                    visitIcon === emoji
                      ? "bg-[#f2be71] text-[#121115] scale-110 shadow-md font-bold"
                      : "bg-[#201f23] border border-[#363439] hover:bg-[#2b292e]"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hitos de Premios (5, 10, 15) */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider">Premios Clave de Fidelización</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {milestones.map((m, idx) => (
              <div key={idx} className="bg-[#201f23] border border-[#363439] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f2be71] bg-[#684400]/30 px-2 py-0.5 rounded-full border border-[#f2be71]/30">
                    Sello #{m.stamp}
                  </span>
                  <span className="text-xl">{m.icon || "🎁"}</span>
                </div>
                <div>
                  <label className="text-[11px] text-[#ccc3d8] block">Título del Premio:</label>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => {
                      const updated = [...milestones];
                      updated[idx].title = e.target.value;
                      setMilestones(updated);
                    }}
                    className="bg-[#141317] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#e6e1e7] rounded-lg px-3 py-1.5 w-full text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#ccc3d8] block">Descripción del Premio:</label>
                  <textarea
                    rows={2}
                    value={m.description}
                    onChange={(e) => {
                      const updated = [...milestones];
                      updated[idx].description = e.target.value;
                      setMilestones(updated);
                    }}
                    className="bg-[#141317] border border-[#363439] focus:border-[#f2be71]/60 focus:outline-none text-[#ccc3d8] rounded-lg px-3 py-1.5 w-full text-xs mt-1 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Horas Muertas Happy Hour x2 */}
        <div className="bg-[#201f23] border border-[#363439] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#f2be71] shrink-0" />
            <div>
              <span className="text-sm font-bold text-[#e6e1e7] block">Multiplicador Happy Hour (Tardes 3:00 PM a 6:00 PM)</span>
              <span className="text-xs text-[#ccc3d8]">Otorga automáticamente x2 sellos por consumo para llenar mesas en horas bajas.</span>
            </div>
          </div>
          <span className="bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] px-3 py-1 rounded-full text-xs font-bold shrink-0">
            ✓ ACTIVO (Automático)
          </span>
        </div>
      </form>
    </div>
  );
}

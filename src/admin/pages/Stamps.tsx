import { useEffect, useState } from "react";
import {
  Loader2,
  Award,
  Gift,
  Sparkles,
  Clock,
  Save,
  Trophy,
  Plus,
  Trash2,
  Wallet,
  Smartphone,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { ImageUploader } from "../components/ImageUploader";

interface Milestone {
  stamp: number;
  title: string;
  description: string;
  icon: string;
  category?: string;
}

export function Stamps() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [contest, setContest] = useState<any>(null);
  const [winnerNotice, setWinnerNotice] = useState<any>(null);

  // Cantidad total de sellos de la tarjeta
  const [totalStamps, setTotalStamps] = useState(15);
  const [visitIcon, setVisitIcon] = useState("☕");
  const [customIconUrl, setCustomIconUrl] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Configuración de Happy Hour
  const [hhEnabled, setHhEnabled] = useState(true);
  const [hhStart, setHhStart] = useState("15:00");
  const [hhEnd, setHhEnd] = useState("18:00");
  const [hhMultiplier, setHhMultiplier] = useState(2);

  // Apple & Google Wallet
  const [walletEnabled, setWalletEnabled] = useState(true);
  const [walletColor, setWalletColor] = useState("#1c1b1f");
  const [walletLabel, setWalletLabel] = useState("Pase VIP de Fidelización");

  const fetchData = async () => {
    try {
      const [confRes, contestRes] = await Promise.all([
        fetch("http://localhost:3001/api/config"),
        fetch("http://localhost:3001/api/contest"),
      ]);

      if (!confRes.ok) throw new Error("Error al cargar sellos");

      const confData = await confRes.json();
      const contestData = contestRes.ok ? await contestRes.json() : null;
      setContest(contestData);

      const st = confData.settings?.stamps;
      if (st) {
        setTotalStamps(st.totalStamps || 15);
        setVisitIcon(st.visitIcon || "☕");
        setCustomIconUrl(st.customIconUrl || "");
        setMilestones(st.milestones || []);
        if (st.happyHour) {
          setHhEnabled(st.happyHour.enabled ?? true);
          setHhStart(st.happyHour.start || "15:00");
          setHhEnd(st.happyHour.end || "18:00");
          setHhMultiplier(st.happyHour.multiplier || 2);
        }
        if (st.wallet) {
          setWalletEnabled(st.wallet.enabled ?? true);
          setWalletColor(st.wallet.color || "#1c1b1f");
          setWalletLabel(st.wallet.label || "Pase VIP de Fidelización");
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
    fetchData();
  }, []);

  // Agregar nuevo hito de premio
  const handleAddMilestone = () => {
    const nextStamp = milestones.length > 0 ? Math.min(milestones[milestones.length - 1].stamp + 5, totalStamps) : 5;
    const newM: Milestone = {
      stamp: nextStamp,
      title: "Nuevo Premio de Fidelidad",
      description: "Por acumular tus visitas en mesa.",
      icon: "🎁",
      category: "premio",
    };
    setMilestones([...milestones, newM].sort((a, b) => a.stamp - b.stamp));
  };

  // Eliminar hito
  const handleDeleteMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  // Guardar en Backend
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
            totalStamps: Number(totalStamps),
            visitIcon,
            customIconUrl,
            milestones,
            happyHour: {
              enabled: hhEnabled,
              start: hhStart,
              end: hhEnd,
              multiplier: Number(hhMultiplier),
            },
            wallet: {
              enabled: walletEnabled,
              color: walletColor,
              label: walletLabel,
            },
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar tarjeta de sellos");
      setSuccess("Tarjeta modular de sellos y pases guardados correctamente");
      setTimeout(() => setSuccess(null), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  // Sorteo de fin de mes
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  const iconPresets = ["☕", "🥐", "🍰", "🧁", "🍪", "🍷", "🍕", "🍔", "🍣", "✨"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">
            Tarjeta Modular de Sellos & Pases Digitales
          </h2>
          <p className="text-sm text-[#ccc3d8]">
            Personaliza cuántos sellos tiene la tarjeta, qué premios se desbloquean, el icono del local y la compatibilidad con Apple & Google Wallet.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveStamps}
          disabled={saving}
          className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm shrink-0 shadow-lg"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Configuración de Sellos</span>
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

      {/* 1. ESTRUCTURA BASE DE LA TARJETA (CANTIDAD TOTAL E ICONO) */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-5 shadow-lg">
        <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2 border-b border-[#363439] pb-3">
          <Award className="w-4 h-4 text-[#f2be71]" />
          <span>Estructura de la Tarjeta Digital</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cantidad Total de Sellos */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Cantidad Total de Sellos de la Tarjeta
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="3"
                max="30"
                value={totalStamps}
                onChange={(e) => setTotalStamps(Number(e.target.value))}
                className="bg-[#201f23] border border-[#363439] text-[#f2be71] font-mono text-center text-lg font-bold rounded-xl px-4 py-2.5 w-24 focus:border-[#f2be71]/60 focus:outline-none"
              />
              <span className="text-xs text-[#ccc3d8]">sellos para completar la tarjeta completa</span>
            </div>
            <div className="flex gap-2 flex-wrap pt-1">
              {[6, 8, 10, 12, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTotalStamps(num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    totalStamps === num
                      ? "bg-[#f2be71] text-[#121115]"
                      : "bg-[#201f23] text-[#ccc3d8] hover:bg-[#2b292e]"
                  }`}
                >
                  {num} Sellos
                </button>
              ))}
            </div>
          </div>

          {/* Icono de Sello Intermedio */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
              Icono de Visita (Sellos de Consumo en Mesa)
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                value={visitIcon}
                onChange={(e) => setVisitIcon(e.target.value)}
                className="w-12 h-12 text-2xl text-center bg-[#201f23] border border-[#f2be71]/40 rounded-xl focus:outline-none shrink-0"
              />
              <div className="flex gap-1.5 flex-wrap">
                {iconPresets.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setVisitIcon(emoji)}
                    className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${
                      visitIcon === emoji
                        ? "bg-[#f2be71] text-[#121115] font-bold shadow-md scale-105"
                        : "bg-[#201f23] border border-[#363439] text-[#e6e1e7] hover:bg-[#2b292e]"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <ImageUploader
                label="Icono Gráfico de Sello Personalizado"
                value={customIconUrl}
                onChange={setCustomIconUrl}
                recommendedDimensions="128 x 128 px"
                aspectRatio="1:1 cuadrado"
                maxWeight="Menor a 80 KB"
                formats="PNG con fondo transparente o SVG"
                description="Icono gráfico que se estampará en los círculos de visita de la tarjeta digital del cliente. Si está vacío, se usará el emoji seleccionado arriba."
                placeholder="Pega URL o sube tu icono PNG"
                previewHeight="h-14"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. HITOS DE PREMIOS MODULARES (AGREGAR, QUITAR, PERSONALIZAR) */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#363439] pb-3 gap-2">
          <div>
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#f2be71]" />
              <span>Hitos de Premios por Visita (Recompensas Progresivas)</span>
            </h3>
            <p className="text-xs text-[#ccc3d8]">Define en qué sellos se entregan premios intermedios al comensal.</p>
          </div>

          <button
            type="button"
            onClick={handleAddMilestone}
            className="bg-[#201f23] hover:bg-[#2b292e] text-[#f2be71] border border-[#f2be71]/40 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Hito de Premio</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((m, idx) => (
            <div key={idx} className="bg-[#201f23] border border-[#363439] rounded-2xl p-4 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#f2be71] bg-[#684400]/30 px-2.5 py-1 rounded-full border border-[#f2be71]/30">
                    Sello #{m.stamp}
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={totalStamps}
                    value={m.stamp}
                    onChange={(e) => {
                      const updated = [...milestones];
                      updated[idx].stamp = Number(e.target.value);
                      setMilestones(updated);
                    }}
                    className="w-16 bg-[#141317] border border-[#363439] text-xs font-mono text-center rounded-lg py-0.5 text-white"
                    title="Modificar número de sello"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={m.icon}
                    onChange={(e) => {
                      const updated = [...milestones];
                      updated[idx].icon = e.target.value;
                      setMilestones(updated);
                    }}
                    className="w-8 h-8 text-center text-lg bg-[#141317] border border-[#363439] rounded-lg"
                    title="Emoji del premio"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteMilestone(idx)}
                    className="p-1.5 rounded-lg bg-[#141317] hover:bg-red-950/60 text-[#ccc3d8] hover:text-red-400 transition-colors cursor-pointer"
                    title="Eliminar este hito"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#ccc3d8] block mb-1">Premio a Entregar:</label>
                <input
                  type="text"
                  value={m.title}
                  onChange={(e) => {
                    const updated = [...milestones];
                    updated[idx].title = e.target.value;
                    setMilestones(updated);
                  }}
                  className="bg-[#141317] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-1.5 w-full text-xs font-semibold focus:outline-none focus:border-[#f2be71]/60"
                  placeholder="Ej: Café de Especialidad Gratis"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#ccc3d8] block mb-1">Descripción / Condiciones:</label>
                <textarea
                  rows={2}
                  value={m.description}
                  onChange={(e) => {
                    const updated = [...milestones];
                    updated[idx].description = e.target.value;
                    setMilestones(updated);
                  }}
                  className="bg-[#141317] border border-[#363439] text-[#ccc3d8] rounded-xl px-3 py-1.5 w-full text-xs focus:outline-none focus:border-[#f2be71]/60 resize-none"
                  placeholder="Válido en cualquier visita..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. APPLE WALLET & GOOGLE WALLET PASS */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#363439] pb-3">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-[#f2be71]" />
            <div>
              <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue']">
                Pase Digital para Apple Wallet (iPhone) & Google Wallet (Android)
              </h3>
              <p className="text-xs text-[#ccc3d8]">Permite al cliente guardar su tarjeta de fidelidad en la app Wallet nativa de su teléfono.</p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={walletEnabled}
              onChange={(e) => setWalletEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#f2be71]"
            />
            <span className="text-xs font-bold text-[#e6e1e7]">Habilitar Pases Móviles</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
              Nombre en la Carátula del Pase
            </label>
            <input
              type="text"
              value={walletLabel}
              onChange={(e) => setWalletLabel(e.target.value)}
              className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block mb-1">
              Color de Fondo de la Tarjeta Wallet
            </label>
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={walletColor}
                onChange={(e) => setWalletColor(e.target.value)}
                className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-[#ccc3d8]">{walletColor}</span>
            </div>
          </div>

          <div className="flex items-end">
            <div className="p-3 bg-[#201f23] border border-[#363439] rounded-xl text-xs text-[#10b981] flex items-center gap-2 w-full">
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>✓ El cliente verá el botón "Guardar en Apple/Google Wallet" al recibir sellos o premios.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MULTIPLICADOR HAPPY HOUR & SORTEO MENSUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Happy Hour */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#363439] pb-3">
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f2be71]" />
              <span>Multiplicador de Horas Muertas (Happy Hour)</span>
            </h3>
            <input
              type="checkbox"
              checked={hhEnabled}
              onChange={(e) => setHhEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#f2be71]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">Hora Inicio</label>
              <input
                type="time"
                value={hhStart}
                onChange={(e) => setHhStart(e.target.value)}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">Hora Fin</label>
              <input
                type="time"
                value={hhEnd}
                onChange={(e) => setHhEnd(e.target.value)}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">Multiplicador</label>
              <select
                value={hhMultiplier}
                onChange={(e) => setHhMultiplier(Number(e.target.value))}
                className="bg-[#201f23] border border-[#363439] text-[#f2be71] rounded-xl px-3 py-2 w-full text-xs font-mono font-bold"
              >
                <option value={2}>x2 Sellos</option>
                <option value={3}>x3 Sellos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sorteo Fin de Mes */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#363439] pb-3">
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#f2be71]" />
              <span>Sorteo de Fin de Mes (Boleto VIP)</span>
            </h3>
            <span className="text-xs text-[#f2be71] font-mono font-bold">{contest?.totalEntries || 0} inscritos</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[#ccc3d8]">
              Cena de Autor para 2 personas sorteada entre todos los clientes que completaron misiones VIP.
            </p>
            <button
              type="button"
              onClick={handleDrawContest}
              disabled={drawing}
              className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-4 py-2.5 text-xs hover:brightness-105 shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {drawing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trophy className="w-3.5 h-3.5" />}
              <span>Sortear Ahora</span>
            </button>
          </div>

          {winnerNotice && (
            <div className="p-3 rounded-xl bg-[#0d2e1f] border border-[#10b981]/50 text-xs text-emerald-300">
              🎉 Ganador Oficial: <strong>{winnerNotice.customerName}</strong> (Boleto: #{winnerNotice.ticketCode})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

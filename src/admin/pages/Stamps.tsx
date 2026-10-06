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
  Eye,
  RotateCcw,
  Zap,
} from "lucide-react";
import { ImageUploader } from "../components/ImageUploader";
import { apiUrl, getAuthToken } from "../../lib/apiClient";

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
  const [simulatedStamps, setSimulatedStamps] = useState(3);

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
        fetch(apiUrl("/config")),
        fetch(apiUrl("/contest")),
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
      const res = await fetch(apiUrl("/config"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
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
      const res = await fetch(apiUrl("/contest/draw"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
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
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  const iconPresets = [
    "☕", "🥐", "🍰", "🧁", "🍪", "🍷", "🍕", "🍔", "🍣", "✨",
    "🌟", "👑", "🎖️", "🍩", "🍦", "🥂", "🥖", "🎯"
  ];

  // Cuadrícula dinámica según totalStamps
  const previewGridCols =
    totalStamps <= 6
      ? "grid-cols-3 sm:grid-cols-6"
      : totalStamps <= 8
        ? "grid-cols-4 sm:grid-cols-8"
        : totalStamps <= 10
          ? "grid-cols-5 sm:grid-cols-10"
          : totalStamps <= 12
            ? "grid-cols-4 sm:grid-cols-6"
            : totalStamps <= 15
              ? "grid-cols-5"
              : totalStamps <= 20
                ? "grid-cols-5 sm:grid-cols-10"
                : "grid-cols-6";

  const getMilestoneForStamp = (num: number) => {
    return milestones.find((m) => Number(m.stamp) === num);
  };

  const safeSimulatedStamps = Math.min(simulatedStamps, totalStamps);
  const progressPercent = Math.min(100, Math.round((safeSimulatedStamps / totalStamps) * 100));

  const handleToggleStamp = (num: number) => {
    if (safeSimulatedStamps === num) {
      setSimulatedStamps(num - 1);
    } else {
      setSimulatedStamps(num);
    }
  };

  const activeMilestone = milestones
    .filter((m) => Number(m.stamp) <= safeSimulatedStamps)
    .sort((a, b) => b.stamp - a.stamp)[0];

  const nextPendingMilestone = milestones
    .filter((m) => Number(m.stamp) > safeSimulatedStamps)
    .sort((a, b) => a.stamp - b.stamp)[0];

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
          className="bg-[var(--gold)] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm shrink-0 shadow-lg"
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

      {/* 1. ESTRUCTURA BASE DE LA TARJETA (CANTIDAD TOTAL E ICONO) + VISUALIZADOR EN TIEMPO REAL */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#363439] pb-3 gap-2">
          <div>
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Award className="w-4 h-4 text-[var(--gold)]" />
              <span>Estructura de la Tarjeta Digital & Personalización</span>
            </h3>
            <p className="text-xs text-[#ccc3d8]">
              Configura cuántos sellos completan la tarjeta, el icono de visita de tu local y visualiza en tiempo real cómo la verán los comensales.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--gold)] bg-[#201f23] px-3 py-1.5 rounded-xl border border-[#363439]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{totalStamps} Sellos Totales</span>
          </div>
        </div>

        {/* Fila de controles de configuración + Visualizador */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Cantidad e Iconos (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
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
                  onChange={(e) => {
                    const val = Math.max(3, Math.min(30, Number(e.target.value) || 3));
                    setTotalStamps(val);
                  }}
                  className="bg-[#201f23] border border-[#363439] text-[var(--gold)] font-mono text-center text-lg font-bold rounded-xl px-4 py-2.5 w-24 focus:border-[var(--gold)]/60 focus:outline-none"
                />
                <span className="text-xs text-[#ccc3d8]">sellos para completar la tarjeta completa</span>
              </div>
              <div className="flex gap-1.5 flex-wrap pt-1">
                {[6, 8, 10, 12, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTotalStamps(num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      totalStamps === num
                        ? "bg-[var(--gold)] text-[#121115] shadow-md scale-105"
                        : "bg-[#201f23] text-[#ccc3d8] hover:bg-[#2b292e] border border-[#363439]"
                    }`}
                  >
                    {num} Sellos
                  </button>
                ))}
              </div>
            </div>

            {/* Icono de Sello de Visita */}
            <div className="space-y-2 pt-2 border-t border-[#363439]/60">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block flex items-center justify-between">
                <span>Icono de Sello (Visitas en Mesa)</span>
                <span className="text-[11px] text-[var(--gold)] font-mono">Activo: {visitIcon}</span>
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                <input
                  type="text"
                  value={visitIcon}
                  onChange={(e) => setVisitIcon(e.target.value)}
                  className="w-11 h-11 text-2xl text-center bg-[#201f23] border border-[var(--gold)]/40 rounded-xl focus:outline-none shrink-0"
                  title="Emoji o carácter personalizado"
                />
                <div className="flex gap-1.5 flex-wrap flex-1">
                  {iconPresets.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setVisitIcon(emoji)}
                      className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${
                        visitIcon === emoji
                          ? "bg-[var(--gold)] text-[#121115] font-bold shadow-md scale-105"
                          : "bg-[#201f23] border border-[#363439] text-[#e6e1e7] hover:bg-[#2b292e]"
                      }`}
                      title={`Seleccionar ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <ImageUploader
                  label="O sube un Icono Gráfico Personalizado (Opcional)"
                  value={customIconUrl}
                  onChange={setCustomIconUrl}
                  recommendedDimensions="128 x 128 px"
                  aspectRatio="1:1 cuadrado"
                  maxWeight="Menor a 80 KB"
                  formats="PNG con fondo transparente o SVG"
                  description="Si subes un logo o gráfico PNG, se estampará en lugar del emoji en las casillas."
                  placeholder="URL o sube tu logo"
                  previewHeight="h-12"
                />
              </div>
            </div>
          </div>

          {/* Columna Derecha: VISUALIZADOR EN TIEMPO REAL (7 cols) */}
          <div className="lg:col-span-7 bg-[#141317] border-2 border-[#363439] rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden flex flex-col justify-between">
            {/* Halo de luz decorativo */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[var(--gold)]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header del visualizador */}
            <div className="flex items-center justify-between border-b border-[#363439]/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#201f23] text-[var(--gold)] flex items-center justify-center font-bold text-xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#e6e1e7] flex items-center gap-1.5">
                    <span>Visualizador en Vivo • Tarjeta del Comensal</span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#201f23] text-[#10b981] font-bold">
                      En Tiempo Real
                    </span>
                  </h4>
                  <p className="text-[10px] text-[#ccc3d8]">
                    Haz clic en cualquier casilla para simular cómo se estampa en el móvil.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[var(--gold)] bg-[#201f23] px-2.5 py-1 rounded-lg border border-[#363439]">
                  {safeSimulatedStamps} / {totalStamps} Sellos
                </span>
              </div>
            </div>

            {/* Cuadrícula interactiva de sellos */}
            <div className="space-y-2">
              <div className={`grid ${previewGridCols} gap-2`}>
                {Array.from({ length: totalStamps }, (_, i) => i + 1).map((selloNum) => {
                  const isEarned = selloNum <= safeSimulatedStamps;
                  const milestone = getMilestoneForStamp(selloNum);
                  const isLast = selloNum === totalStamps;

                  return (
                    <div
                      key={selloNum}
                      onClick={() => handleToggleStamp(selloNum)}
                      title={`Sello #${selloNum}${milestone ? ` • Premio: ${milestone.title}` : ""}`}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer select-none ${
                        isEarned
                          ? "bg-gradient-to-tr from-[#684400] via-[var(--gold)] to-[var(--gold-light)] text-[#121115] shadow-[0_0_12px_rgba(242,190,113,0.5)] scale-102 font-black"
                          : isLast
                            ? "bg-gradient-to-tr from-[#684400]/40 to-[#2b292e] border-2 border-[var(--gold)] text-[var(--gold)] hover:border-[var(--gold-light)]"
                            : milestone
                              ? "bg-[#201f23] border border-[var(--gold)]/60 text-[var(--gold)] hover:border-[var(--gold)]"
                              : "bg-[#201f23] border border-[#363439] text-[#958da1] hover:border-[#ccc3d8]/40"
                      }`}
                    >
                      {isEarned ? (
                        customIconUrl ? (
                          <img
                            src={customIconUrl}
                            alt="Sello"
                            className="w-5 h-5 object-contain"
                          />
                        ) : (
                          <span className="text-base leading-none drop-shadow-sm">
                            {visitIcon || "✓"}
                          </span>
                        )
                      ) : isLast ? (
                        <>
                          <Trophy className="w-3.5 h-3.5" />
                          <span className="text-[7px] font-bold mt-0.5">VIP</span>
                        </>
                      ) : milestone ? (
                        <>
                          <span className="text-xs leading-none">{milestone.icon || "🎁"}</span>
                          <span className="text-[8px] font-bold mt-0.5">{selloNum}</span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold">{selloNum}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Barra de progreso de la tarjeta simulada */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[11px] text-[#ccc3d8]">
                <span>Progreso de Fidelización del Cliente</span>
                <span className="text-[var(--gold)] font-mono font-bold">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-[#0f0e12] h-2 rounded-full overflow-hidden border border-[#363439] p-0.5">
                <div
                  className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Controles del simulador (Slider y Botones rápidos) */}
            <div className="p-3 rounded-2xl bg-[#1c1b1f] border border-[#363439] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#ccc3d8] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
                  <span>Probar Avance de Sellos:</span>
                </span>
                <span className="font-mono text-[var(--gold)] font-bold">
                  {safeSimulatedStamps} sellos marcados
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={totalStamps}
                value={safeSimulatedStamps}
                onChange={(e) => setSimulatedStamps(Number(e.target.value))}
                className="w-full accent-[var(--gold)] cursor-pointer"
              />

              <div className="flex items-center gap-1.5 justify-between flex-wrap pt-1">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSimulatedStamps(0)}
                    className="px-2 py-1 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[10px] text-[#ccc3d8] cursor-pointer"
                  >
                    Vacía (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedStamps(Math.round(totalStamps / 2))}
                    className="px-2 py-1 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[10px] text-[#ccc3d8] cursor-pointer"
                  >
                    Mitad ({Math.round(totalStamps / 2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedStamps(totalStamps)}
                    className="px-2 py-1 rounded-lg bg-[#201f23] hover:bg-[#2b292e] text-[10px] text-[var(--gold)] font-bold cursor-pointer"
                  >
                    Completada ({totalStamps})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSimulatedStamps((prev) => Math.min(totalStamps, prev + 1))}
                  className="px-3 py-1 rounded-lg bg-[var(--gold)] hover:brightness-105 text-[#121115] text-[10px] font-bold transition-all cursor-pointer"
                >
                  +1 Sello de Visita
                </button>
              </div>
            </div>

            {/* Aviso del estado del hito según sellos simulados */}
            <div className="p-3 rounded-xl bg-[#201f23] border border-[#363439] text-xs flex items-center gap-2.5">
              <Gift className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <div className="text-[11px] leading-tight">
                {safeSimulatedStamps >= totalStamps ? (
                  <span className="text-[#10b981] font-bold">
                    🎉 ¡Tarjeta 100% Completada! El comensal gana el Gran Premio y entra al Sorteo VIP de fin de mes.
                  </span>
                ) : activeMilestone ? (
                  <span className="text-[#e6e1e7]">
                    Último premio desbloqueado: <strong className="text-[var(--gold)]">{activeMilestone.title}</strong> (Sello #{activeMilestone.stamp}).
                  </span>
                ) : (
                  <span className="text-[#ccc3d8]">
                    Próximo premio a desbloquear:{" "}
                    {nextPendingMilestone ? (
                      <strong className="text-[var(--gold)]">
                        {nextPendingMilestone.title} en el sello #{nextPendingMilestone.stamp}
                      </strong>
                    ) : (
                      "Gran Premio final al completar la tarjeta."
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HITOS DE PREMIOS MODULARES (AGREGAR, QUITAR, PERSONALIZAR) */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#363439] pb-3 gap-2">
          <div>
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Gift className="w-4 h-4 text-[var(--gold)]" />
              <span>Hitos de Premios por Visita (Recompensas Progresivas)</span>
            </h3>
            <p className="text-xs text-[#ccc3d8]">Define en qué sellos se entregan premios intermedios al comensal.</p>
          </div>

          <button
            type="button"
            onClick={handleAddMilestone}
            className="bg-[#201f23] hover:bg-[#2b292e] text-[var(--gold)] border border-[var(--gold)]/40 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
                  <span className="text-xs font-mono font-bold text-[var(--gold)] bg-[#684400]/30 px-2.5 py-1 rounded-full border border-[var(--gold)]/30">
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
                  className="bg-[#141317] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-1.5 w-full text-xs font-semibold focus:outline-none focus:border-[var(--gold)]/60"
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
                  className="bg-[#141317] border border-[#363439] text-[#ccc3d8] rounded-xl px-3 py-1.5 w-full text-xs focus:outline-none focus:border-[var(--gold)]/60 resize-none"
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
            <Wallet className="w-5 h-5 text-[var(--gold)]" />
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
              className="w-4 h-4 accent-[var(--gold)]"
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
              <Clock className="w-4 h-4 text-[var(--gold)]" />
              <span>Multiplicador de Horas Muertas (Happy Hour)</span>
            </h3>
            <input
              type="checkbox"
              checked={hhEnabled}
              onChange={(e) => setHhEnabled(e.target.checked)}
              className="w-4 h-4 accent-[var(--gold)]"
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
                className="bg-[#201f23] border border-[#363439] text-[var(--gold)] rounded-xl px-3 py-2 w-full text-xs font-mono font-bold"
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
              <Trophy className="w-4 h-4 text-[var(--gold)]" />
              <span>Sorteo de Fin de Mes (Boleto VIP)</span>
            </h3>
            <span className="text-xs text-[var(--gold)] font-mono font-bold">{contest?.totalEntries || 0} inscritos</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[#ccc3d8]">
              Cena de Autor para 2 personas sorteada entre todos los clientes que completaron misiones VIP.
            </p>
            <button
              type="button"
              onClick={handleDrawContest}
              disabled={drawing}
              className="bg-[var(--gold)] text-[#121115] font-bold rounded-xl px-4 py-2.5 text-xs hover:brightness-105 shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
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

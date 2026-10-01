import { useEffect, useState } from "react";
import { Loader2, Gamepad2, Save, Sparkles, Timer, CheckCircle, Shield } from "lucide-react";

export function GameMode() {
  const [config, setConfig] = useState<any>(null);
  const [secondChance, setSecondChance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados locales editables
  const [gameMode, setGameMode] = useState("hybrid");
  const [precisionTarget, setPrecisionTarget] = useState(10.0);
  const [toleranceMs, setToleranceMs] = useState(40);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [precisionDifficulty, setPrecisionDifficulty] = useState("medio");

  // Segunda Oportunidad
  const [scEnabled, setScEnabled] = useState(true);
  const [scPrizeName, setScPrizeName] = useState("");
  const [scPrizeValue, setScPrizeValue] = useState("");
  const [scPrizeDescription, setScPrizeDescription] = useState("");
  const [scTerms, setScTerms] = useState("");
  const [scWhatsappStatus, setScWhatsappStatus] = useState("");

  const fetchData = async () => {
    try {
      const [gameRes, scRes] = await Promise.all([
        fetch("http://localhost:3001/api/game-config"),
        fetch("http://localhost:3001/api/second-chance-config"),
      ]);

      if (!gameRes.ok || !scRes.ok) throw new Error("Error al cargar configuración de juegos");

      const gameData = await gameRes.json();
      const scData = await scRes.json();

      setConfig(gameData.gameConfig);
      setSecondChance(scData.secondChance);

      if (gameData.gameConfig) {
        setGameMode(gameData.gameConfig.gameMode || "hybrid");
        setPrecisionTarget(gameData.gameConfig.precisionTarget || 10.0);
        setToleranceMs(gameData.gameConfig.toleranceMs || 40);
        setMaxAttempts(gameData.gameConfig.maxAttempts || 3);
        setPrecisionDifficulty(gameData.gameConfig.precisionDifficulty || "medio");
      }

      if (scData.secondChance) {
        setScEnabled(scData.secondChance.enabled ?? true);
        setScPrizeName(scData.secondChance.prizeName || "");
        setScPrizeValue(scData.secondChance.prizeValue || "");
        setScPrizeDescription(scData.secondChance.prizeDescription || "");
        setScTerms(scData.secondChance.claimTerms || "");
        setScWhatsappStatus(scData.secondChance.whatsappStatusText || "");
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

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const [resGame, resSc] = await Promise.all([
        fetch("http://localhost:3001/api/game-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameMode,
            precisionTarget: Number(precisionTarget),
            toleranceMs: Number(toleranceMs),
            maxAttempts: Number(maxAttempts),
            precisionDifficulty,
          }),
        }),
        fetch("http://localhost:3001/api/second-chance-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enabled: scEnabled,
            prizeName: scPrizeName,
            prizeValue: scPrizeValue,
            prizeDescription: scPrizeDescription,
            claimTerms: scTerms,
            whatsappStatusText: scWhatsappStatus,
          }),
        }),
      ]);

      if (!resGame.ok || !resSc.ok) throw new Error("Error al guardar configuración de juegos");

      setSuccess("Configuración de juegos y 2ª Oportunidad guardada con éxito");
      setTimeout(() => setSuccess(null), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">Mecánicas de Juego & 2ª Oportunidad</h2>
          <p className="text-sm text-[#ccc3d8]">Elige cómo juegan los comensales en mesa (Ruleta, Cronómetro 10s de Precisión o Modo Híbrido).</p>
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

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Selector de Modo de Juego */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#f2be71]" />
            <span>Selección de Mecánica Principal en Mesa</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: "hybrid", title: "Modo Híbrido (Recomendado)", desc: "Ruleta en Paso 3 + Reto de Precisión en Paso 6 para revancha", icon: "✨" },
              { id: "roulette", title: "Solo Ruleta Clásica", desc: "El cliente gira y gana de inmediato con animación clásica", icon: "🎰" },
              { id: "precision", title: "Solo Reto Cronómetro 10s", desc: "Puro juego de destreza: detener exactamente en 10.00s", icon: "⏱️" },
              { id: "stamps", title: "Modo Solo Fidelización", desc: "Enfocado en acumular sellos de visita sin minijuegos", icon: "🎟️" },
            ].map((mode) => (
              <div
                key={mode.id}
                onClick={() => setGameMode(mode.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  gameMode === mode.id
                    ? "bg-[#2b292e] border-[#f2be71] shadow-lg shadow-[#f2be71]/10"
                    : "bg-[#201f23] border-[#363439] hover:bg-[#252429]"
                }`}
              >
                <div className="text-2xl mb-2">{mode.icon}</div>
                <h4 className={`text-sm font-bold ${gameMode === mode.id ? "text-[#f2be71]" : "text-[#e6e1e7]"}`}>
                  {mode.title}
                </h4>
                <p className="text-xs text-[#ccc3d8] mt-1 leading-relaxed">{mode.desc}</p>
              </div>
            ))}
          </div>

          {/* Calibración del Reto 10 Segundos */}
          {(gameMode === "hybrid" || gameMode === "precision") && (
            <div className="mt-6 pt-6 border-t border-[#363439] grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                  Tiempo Objetivo
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={precisionTarget}
                  onChange={(e) => setPrecisionTarget(Number(e.target.value))}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm mt-1.5"
                />
                <span className="text-[11px] text-[#958da1]">Segundos exactos a clavar (ej: 10.0s).</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                  Tolerancia de Victoria (Milivoltios / ms)
                </label>
                <input
                  type="number"
                  value={toleranceMs}
                  onChange={(e) => setToleranceMs(Number(e.target.value))}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm mt-1.5"
                />
                <span className="text-[11px] text-[#958da1]">±40ms es nivel gourmet justo.</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                  Intentos Permitidos
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm mt-1.5"
                />
                <span className="text-[11px] text-[#958da1]">3 intentos mantienen la emoción alta.</span>
              </div>
            </div>
          )}
        </div>

        {/* Configuración de Segunda Oportunidad (Revancha) */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#f2be71]" />
              <span>Segunda Oportunidad (Revancha de Mesa)</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scEnabled}
                onChange={(e) => setScEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#f2be71]"
              />
              <span className="text-xs font-bold text-[#e6e1e7]">Habilitar 2ª Oportunidad</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Nombre del Premio de Revancha
              </label>
              <input
                type="text"
                value={scPrizeName}
                onChange={(e) => setScPrizeName(e.target.value)}
                placeholder="Postre Artesanal de Autor Gratis"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Valor Referencial del Premio
              </label>
              <input
                type="text"
                value={scPrizeValue}
                onChange={(e) => setScPrizeValue(e.target.value)}
                placeholder="$18.000 COP"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Descripción para el Comensal
              </label>
              <input
                type="text"
                value={scPrizeDescription}
                onChange={(e) => setScPrizeDescription(e.target.value)}
                placeholder="Una porción de nuestra Tarta Vasca artesanal del día"
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Texto para Estados de WhatsApp (Viralidad Boca a Boca)
              </label>
              <textarea
                rows={2}
                value={scWhatsappStatus}
                onChange={(e) => setScWhatsappStatus(e.target.value)}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-sm mt-1 resize-none"
              />
              <span className="text-[11px] text-[#958da1]">El cliente publica esta frase en sus Estados de WhatsApp para desbloquear su intento.</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm shadow-lg"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Mecánicas & 2ª Oportunidad</span>
          </button>
        </div>
      </form>
    </div>
  );
}

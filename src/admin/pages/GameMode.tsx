import { useEffect, useState } from "react";
import {
  Loader2,
  Save,
  Sparkles,
  Timer,
  Layers,
} from "lucide-react";
import { apiUrl, getAuthToken } from "../../lib/apiClient";
import { FUNNEL_STEPS, normalizeActiveStepIds } from "../../lib/funnelSteps";

interface GameStepModule {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  active: boolean;
  required?: boolean;
}

/**
 * Checklist derivado de la FUENTE ÚNICA DE VERDAD (FUNNEL_STEPS).
 * Los ids coinciden exactamente con los que evalúa App.tsx (isStepActive),
 * por lo que activar/desactivar aquí sí se refleja en la app del comensal.
 */
const BASE_GAME_MODULES: GameStepModule[] = FUNNEL_STEPS.map((s, idx) => ({
  id: s.id,
  name: `${idx + 1}. ${s.name}`,
  category: s.category,
  icon: s.emoji,
  description: s.description,
  active: true,
  required: !s.canDisable,
}));

export function GameMode() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Calibración de Precisión
  const [precisionTarget, setPrecisionTarget] = useState(10.0);
  const [toleranceMs, setToleranceMs] = useState(40);
  const [maxAttempts, setMaxAttempts] = useState(3);

  // Segunda Oportunidad
  const [scEnabled, setScEnabled] = useState(true);
  const [scPrizeName, setScPrizeName] = useState("Postre Artesanal de Cortesía");
  const [scPrizeValue, setScPrizeValue] = useState("$18.000 COP");
  const [scPrizeDescription, setScPrizeDescription] = useState("Una porción de repostería artesanal de la casa");
  const [scTerms, setScTerms] = useState("Válido hoy en caja.");
  const [scWhatsappStatus, setScWhatsappStatus] = useState("¡Disfrutando de una experiencia increíble en {restaurante}! ☕🍰 10/10 ✨");

  // CHECKLIST MAESTRO DE PASOS Y MINIJUEGOS EN MESA (desde fuente única de verdad)
  const [gameModules, setGameModules] = useState<GameStepModule[]>(
    () => BASE_GAME_MODULES.map((m) => ({ ...m }))
  );

  const fetchData = async () => {
    try {
      const [gameRes, scRes] = await Promise.all([
        fetch(apiUrl("/game-config")),
        fetch(apiUrl("/second-chance-config")),
      ]);

      if (!gameRes.ok || !scRes.ok) throw new Error("Error al cargar configuración");

      const gameData = await gameRes.json();
      const scData = await scRes.json();

      if (gameData.gameConfig) {
        setPrecisionTarget(gameData.gameConfig.precisionTarget || 10.0);
        setToleranceMs(gameData.gameConfig.toleranceMs || 40);
        setMaxAttempts(gameData.gameConfig.maxAttempts || 3);

        if (Array.isArray(gameData.gameConfig.activeSteps)) {
          // Normalizar ids (soporta configs antiguas con ids viejos/fantasma)
          const activeIds = normalizeActiveStepIds(gameData.gameConfig.activeSteps);
          setGameModules((prev) =>
            prev.map((mod) => ({
              ...mod,
              active: mod.required ? true : activeIds.includes(mod.id as never),
            }))
          );
        }
      }

      if (scData.secondChance) {
        setScEnabled(scData.secondChance.enabled ?? true);
        setScPrizeName(scData.secondChance.prizeName || "Postre Artesanal de Cortesía");
        setScPrizeValue(scData.secondChance.prizeValue || "$18.000 COP");
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

  // Toggle de un módulo en el checklist
  const handleToggleModule = (id: string) => {
    setGameModules((prev) =>
      prev.map((mod) => (mod.id === id && !mod.required ? { ...mod, active: !mod.active } : mod))
    );
  };

  // Guardar en Backend
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const activeSteps = gameModules.filter((m) => m.active).map((m) => m.id);

    try {
      const [resGame, resSc] = await Promise.all([
        fetch(apiUrl("/game-config"), {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
          body: JSON.stringify({
            activeSteps,
            precisionTarget: Number(precisionTarget),
            toleranceMs: Number(toleranceMs),
            maxAttempts: Number(maxAttempts),
          }),
        }),
        fetch(apiUrl("/second-chance-config"), {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
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

      if (!resGame.ok || !resSc.ok) throw new Error("Error al guardar configuración");

      setSuccess("Checklist de juegos guardado: el juego en mesa se adaptó automáticamente");
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#f2be71] animate-spin" />
      </div>
    );
  }

  const activeStepsCount = gameModules.filter((m) => m.active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue']">
              Módulos de Juego & Checklist en Mesa
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#684400]/30 border border-[#f2be71]/40 text-[#f2be71] text-xs font-mono font-bold">
              {activeStepsCount} Pasos Activos
            </span>
          </div>
          <p className="text-sm text-[#ccc3d8] mt-0.5">
            Enciende o apaga con el checklist los juegos que quieras en el frontend. La barra de pasos de la mesa se adapta sola.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-6 py-3 hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 text-sm shrink-0 shadow-lg"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Configuración en Mesa</span>
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

      {/* CHECKLIST MAESTRO DE JUEGOS Y PASOS */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#363439] pb-3">
          <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#f2be71]" />
            <span>Checklist de Pasos Habilitados en el Teléfono del Cliente</span>
          </h3>
          <span className="text-xs text-[#958da1]">Los comensales solo verán los pasos marcados en [ON]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {gameModules.map((mod) => (
            <div
              key={mod.id}
              onClick={() => handleToggleModule(mod.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                mod.active
                  ? "bg-[#201f23] border-[#f2be71]/60 shadow-md"
                  : "bg-[#17161a] border-[#2b292e] opacity-50 hover:opacity-75"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl w-9 h-9 rounded-lg bg-[#141317] border border-[#363439] flex items-center justify-center shrink-0">
                      {mod.icon}
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#958da1] tracking-wider block">
                        {mod.category}
                      </span>
                      <h4 className="text-xs font-bold text-[#e6e1e7] leading-tight">{mod.name}</h4>
                    </div>
                  </div>

                  {/* Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      disabled={mod.required}
                      checked={mod.active}
                      onChange={() => handleToggleModule(mod.id)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-[#2b292e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#f2be71]"></div>
                  </label>
                </div>

                <p className="text-[11px] text-[#ccc3d8] mt-2 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#363439]/40 flex items-center justify-between text-[10px]">
                <span className={mod.active ? "text-[#f2be71] font-bold" : "text-[#958da1]"}>
                  {mod.active ? "✓ ACTIVO EN MESA" : "— INACTIVO"}
                </span>
                {mod.required && <span className="text-[#958da1]">(Paso Base)</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CALIBRACIÓN DEL RETO 10 SEGUNDOS Y SEGUNDA OPORTUNIDAD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calibración Cronómetro */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2 border-b border-[#363439] pb-3">
            <Timer className="w-4 h-4 text-[#f2be71]" />
            <span>Calibración del Reto 10s de Precisión</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                Tiempo Meta
              </label>
              <input
                type="number"
                step="0.1"
                value={precisionTarget}
                onChange={(e) => setPrecisionTarget(Number(e.target.value))}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-mono font-bold"
              />
              <span className="text-[10px] text-[#958da1]">Segundos (10.0s)</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                Tolerancia (ms)
              </label>
              <input
                type="number"
                value={toleranceMs}
                onChange={(e) => setToleranceMs(Number(e.target.value))}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-mono font-bold"
              />
              <span className="text-[10px] text-[#958da1]">±40ms es justo</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                Intentos Máx.
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-mono font-bold"
              />
              <span className="text-[10px] text-[#958da1]">3 intentos</span>
            </div>
          </div>
        </div>

        {/* Premio de Segunda Oportunidad */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#363439] pb-3">
            <h3 className="text-base font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f2be71]" />
              <span>Premio de Revancha (2ª Oportunidad)</span>
            </h3>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={scEnabled}
                onChange={(e) => setScEnabled(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#f2be71]"
              />
              <span className="text-xs text-[#ccc3d8] font-bold">Activo</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                Nombre del Premio
              </label>
              <input
                type="text"
                value={scPrizeName}
                onChange={(e) => setScPrizeName(e.target.value)}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#ccc3d8] uppercase block mb-1">
                Valor Referencial
              </label>
              <input
                type="text"
                value={scPrizeValue}
                onChange={(e) => setScPrizeValue(e.target.value)}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-3 py-2 w-full text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

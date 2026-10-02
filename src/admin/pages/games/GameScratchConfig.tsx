import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Gift,
  RotateCcw,
  Eye,
  Sliders,
} from "lucide-react";

export function GameScratchConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Configuración de Raspa y Gana
  const [scratchPercentThreshold, setScratchPercentThreshold] = useState<number>(60);
  const [foilColor, setFoilColor] = useState<string>("#d4af37"); // Dorado clásico
  const [brushSize, setBrushSize] = useState<number>(30);
  const [hiddenRewardText, setHiddenRewardText] = useState<string>("¡Ganaste 2x1 en Bebidas Especiales!");
  const [secretCode, setSecretCode] = useState<string>("RASPA-VIP-77");

  // Canvas interactivo de prueba
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Inicializar o resetear el canvas de lámina dorada
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pintar lámina con degradado
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, foilColor);
    grad.addColorStop(0.5, "#fff2b2");
    grad.addColorStop(1, foilColor);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texto sobre la lámina
    ctx.fillStyle = "#121115";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ RASPA CON TU DEDO O RATÓN ✨", canvas.width / 2, canvas.height / 2 + 5);

    setScratchedPercent(0);
    setIsRevealed(false);
  };

  useEffect(() => {
    initCanvas();
  }, [foilColor]);

  // Manejo de raspado interactivo en el canvas
  const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching && e.type !== "mousedown" && e.type !== "touchstart") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Calcular aproximado de área raspada
    setScratchedPercent((prev) => {
      const next = Math.min(100, prev + 2.5);
      if (next >= scratchPercentThreshold) {
        setIsRevealed(true);
      }
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/game-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scratchConfig: {
            scratchPercentThreshold,
            foilColor,
            brushSize,
            hiddenRewardText,
            secretCode,
          },
        }),
      });
      if (!res.ok) throw new Error("Error al guardar configuración de Raspa y Gana");
      setSuccess("✓ Módulo de Raspa y Gana guardado correctamente.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. NAVEGACIÓN Y ENCABEZADO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#363439] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/games"
            className="w-8 h-8 rounded-xl bg-[#201f23] hover:bg-[#2b292e] border border-[#363439] flex items-center justify-center text-[#ccc3d8] hover:text-[#f2be71] transition-all cursor-pointer"
            title="Volver al Catálogo de Juegos"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#e6e1e7] font-['Epilogue'] flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#ec4899]" />
              <span>Módulo: Raspa y Gana Digital (Scratch & Win)</span>
            </h2>
            <p className="text-xs text-[#ccc3d8]">
              Configura tarjetas digitales rascables con física táctil en pantalla para premiar a tus comensales con misterio.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#f2be71] text-[#121115] font-bold px-5 py-2.5 rounded-xl text-xs hover:brightness-105 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Guardando..." : "Guardar Raspa y Gana"}</span>
        </button>
      </div>

      {success && (
        <div className="bg-[#0d2e1f] border border-[#10b981]/50 text-[#10b981] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. PARÁMETROS DE LA TARJETA */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#2b292e] pb-3">
            <Sliders className="w-4 h-4 text-[#ec4899]" />
            <span>Física de Raspado & Lámina</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#ccc3d8]">
                  Porcentaje Raspado para Revelar Automáticamente
                </label>
                <span className="font-mono text-xs font-bold text-[#f2be71]">{scratchPercentThreshold}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="85"
                step="5"
                value={scratchPercentThreshold}
                onChange={(e) => setScratchPercentThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-[#f2be71] cursor-pointer"
              />
              <span className="text-[10px] text-[#ccc3d8] mt-1 block">
                Cuando el cliente raspa más de este porcentaje, el premio se descubre con una animación festiva.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                Color de la Lámina Rascable
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={foilColor}
                  onChange={(e) => setFoilColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <div className="flex gap-2">
                  {[
                    { name: "Oro Lujo", hex: "#d4af37" },
                    { name: "Plata Satinada", hex: "#c0c0c0" },
                    { name: "Cobre Rosa", hex: "#b76e79" },
                    { name: "Esmeralda", hex: "#10b981" },
                  ].map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => setFoilColor(p.hex)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer"
                      style={{
                        backgroundColor: foilColor === p.hex ? p.hex : "#201f23",
                        color: foilColor === p.hex ? "#121115" : "#e6e1e7",
                        borderColor: foilColor === p.hex ? p.hex : "#363439",
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#ccc3d8] block mb-1">
                Premio o Mensaje Oculto Bajo la Lámina
              </label>
              <input
                type="text"
                value={hiddenRewardText}
                onChange={(e) => setHiddenRewardText(e.target.value)}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] text-xs rounded-xl px-4 py-2.5 w-full focus:border-[#ec4899]/60 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. SIMULADOR INTERACTIVO DE RASPADO EN VIVO */}
        <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#2b292e] pb-3">
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#ec4899]" />
              <span>Simulador Táctil en Vivo</span>
            </h3>
            <button
              type="button"
              onClick={initCanvas}
              className="text-[11px] text-[#f2be71] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar Tarjeta</span>
            </button>
          </div>

          <div className="relative w-full max-w-[340px] mx-auto h-[200px] rounded-2xl overflow-hidden border border-[#f2be71]/40 shadow-2xl bg-gradient-to-b from-[#2a2215] to-[#141317]">
            {/* Capa de fondo con el premio */}
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center space-y-2 z-0">
              <Sparkles className="w-8 h-8 text-[#f2be71] animate-bounce" />
              <h4 className="text-sm font-black text-[#ffddb1] uppercase font-['Epilogue']">
                {hiddenRewardText}
              </h4>
              <span className="font-mono text-xs text-[#f2be71] bg-[#f2be71]/15 px-3 py-1 rounded-full border border-[#f2be71]/30 font-bold">
                {secretCode}
              </span>
              <p className="text-[10px] text-[#ccc3d8]">Válido hoy en caja con tu mesa</p>
            </div>

            {/* Capa rascable (Canvas HTML5) */}
            <canvas
              ref={canvasRef}
              width={340}
              height={200}
              onMouseDown={(e) => {
                setIsScratching(true);
                handleScratch(e);
              }}
              onMouseUp={() => setIsScratching(false)}
              onMouseLeave={() => setIsScratching(false)}
              onMouseMove={handleScratch}
              onTouchStart={(e) => {
                setIsScratching(true);
                handleScratch(e);
              }}
              onTouchEnd={() => setIsScratching(false)}
              onTouchMove={handleScratch}
              className={`absolute inset-0 w-full h-full z-10 cursor-crosshair transition-opacity duration-500 ${
                isRevealed ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#ccc3d8] pt-2">
            <span>Progreso de raspado: <strong className="text-[#f2be71]">{Math.round(scratchedPercent)}%</strong></span>
            {isRevealed && <span className="text-[#10b981] font-bold">✓ ¡Premio Revelado!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

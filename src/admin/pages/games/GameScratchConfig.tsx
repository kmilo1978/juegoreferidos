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
  Smartphone,
  Trophy,
} from "lucide-react";
import confetti from "canvas-confetti";

export function GameScratchConfig() {
  const [activeTab, setActiveTab] = useState<"settings" | "simulator">("settings");
  const [simulatorKey, setSimulatorKey] = useState(1);
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

  // Canvas interactivo de prueba (en configuración)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Canvas para el simulador móvil
  const mobileCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mobileIsScratching, setMobileIsScratching] = useState(false);
  const [mobileScratchedPercent, setMobileScratchedPercent] = useState(0);
  const [mobileIsRevealed, setMobileIsRevealed] = useState(false);

  // Inicializar o resetear el canvas de lámina dorada (configuración)
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

  // Inicializar canvas móvil
  const initMobileCanvas = () => {
    const canvas = mobileCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, foilColor);
    grad.addColorStop(0.3, "#fff2b2");
    grad.addColorStop(0.7, foilColor);
    grad.addColorStop(1, "#c59d28");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Textos decorativos sobre la lámina
    ctx.fillStyle = "#121115";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ RASPA AQUÍ CON TU DEDO ✨", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "11px sans-serif";
    ctx.fillText("Descubre tu premio sorpresa en mesa", canvas.width / 2, canvas.height / 2 + 15);

    setMobileScratchedPercent(0);
    setMobileIsRevealed(false);
  };

  useEffect(() => {
    initCanvas();
    if (activeTab === "simulator") {
      setTimeout(initMobileCanvas, 50);
    }
  }, [foilColor, activeTab, simulatorKey]);

  // Manejo de raspado interactivo en el canvas de config
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

    setScratchedPercent((prev) => {
      const next = Math.min(100, prev + 2.5);
      if (next >= scratchPercentThreshold) {
        setIsRevealed(true);
      }
      return next;
    });
  };

  // Manejo de raspado en canvas móvil
  const handleMobileScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!mobileIsScratching && e.type !== "mousedown" && e.type !== "touchstart") return;
    const canvas = mobileCanvasRef.current;
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
    ctx.arc(x, y, (brushSize * 1.2) / 2, 0, Math.PI * 2);
    ctx.fill();

    setMobileScratchedPercent((prev) => {
      const next = Math.min(100, prev + 3);
      if (next >= scratchPercentThreshold && !mobileIsRevealed) {
        setMobileIsRevealed(true);
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
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
      setSimulatorKey((k) => k + 1);
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

        <div className="flex items-center gap-3">
          <div className="flex bg-[#201f23] p-1 rounded-xl border border-[#363439]">
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "settings"
                  ? "bg-[#ec4899] text-white font-bold"
                  : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configuración</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("simulator")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "simulator"
                  ? "bg-[#ec4899] text-white font-bold"
                  : "text-[#ccc3d8] hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Probar Simulador</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#ec4899] text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:brightness-105 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar Raspa y Gana"}</span>
          </button>
        </div>
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

      {/* 2. PESTAÑA 1: CONFIGURACIÓN */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PARÁMETROS DE LA TARJETA */}
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

          {/* SIMULADOR RÁPIDO EN CONFIGURACIÓN */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#2b292e] pb-3">
              <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#ec4899]" />
                <span>Vista Previa de la Lámina</span>
              </h3>
              <button
                type="button"
                onClick={initCanvas}
                className="text-[11px] text-[#f2be71] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reiniciar</span>
              </button>
            </div>

            <div className="relative w-full max-w-[340px] mx-auto h-[200px] rounded-2xl overflow-hidden border border-[#f2be71]/40 shadow-2xl bg-gradient-to-b from-[#2a2215] to-[#141317]">
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
              <span>Progreso: <strong className="text-[#f2be71]">{Math.round(scratchedPercent)}%</strong></span>
              {isRevealed && <span className="text-[#10b981] font-bold">✓ ¡Premio Revelado!</span>}
            </div>
          </div>
        </div>
      )}

      {/* 3. PESTAÑA 2: SIMULADOR MÓVIL EN VIVO DE RASPA Y GANA */}
      {activeTab === "simulator" && (
        <div className="flex flex-col items-center justify-center p-4 bg-[#141317] rounded-3xl border border-[#363439]">
          <div className="flex items-center gap-2 mb-4 text-xs text-[#ccc3d8]">
            <Smartphone className="w-4 h-4 text-[#ec4899]" />
            <span>Simulador de Raspa y Gana Móvil (Smartphone 390 × 844 px)</span>
          </div>

          <div
            key={simulatorKey}
            className="w-[390px] h-[780px] bg-[#000000] rounded-[48px] p-3.5 border-[6px] border-[#2b292e] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative"
          >
            {/* Dynamic Island superior */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 shrink-0 border border-white/10" />

            <div className="flex-1 overflow-y-auto no-scrollbar rounded-2xl flex flex-col justify-between p-4 bg-gradient-to-b from-[#18151c] via-[#0f0e12] to-[#18151c]">
              {/* Header móvil */}
              <div className="text-center space-y-1.5 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ec4899]/15 border border-[#ec4899]/30 text-[#ec4899] text-[11px] font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>JUEGO EXCLUSIVO EN MESA</span>
                </div>
                <h3 className="text-lg font-black text-[#e6e1e7] font-['Epilogue'] tracking-tight">
                  Raspa & Descubre
                </h3>
                <p className="text-xs text-[#ccc3d8] leading-tight max-w-[280px] mx-auto">
                  Desliza tu dedo sobre la lámina dorada para revelar tu regalo especial de hoy.
                </p>
              </div>

              {/* Tarjeta móvil rascable */}
              <div className="relative w-full max-w-[320px] mx-auto h-[260px] rounded-3xl overflow-hidden border-2 border-[#f2be71]/50 shadow-[0_0_30px_rgba(242,190,113,0.2)] bg-gradient-to-br from-[#2a1e12] via-[#1c1815] to-[#121115]">
                {/* Capa de premio */}
                <div className="absolute inset-0 p-5 flex flex-col items-center justify-center text-center space-y-3 z-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#f2be71]/20 border border-[#f2be71]/50 flex items-center justify-center text-3xl shadow-inner">
                    🎁
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#f2be71] font-bold">
                      ¡Premio Desbloqueado!
                    </span>
                    <h4 className="text-base font-black text-[#ffddb1] leading-snug font-['Epilogue']">
                      {hiddenRewardText}
                    </h4>
                  </div>

                  <div className="bg-[#121115]/90 border border-[#f2be71]/40 rounded-xl px-4 py-1.5">
                    <span className="font-mono text-xs font-bold text-[#f2be71] tracking-wider">
                      CÓDIGO: {secretCode}
                    </span>
                  </div>
                </div>

                {/* Capa rascable Canvas */}
                <canvas
                  ref={mobileCanvasRef}
                  width={320}
                  height={260}
                  onMouseDown={(e) => {
                    setMobileIsScratching(true);
                    handleMobileScratch(e);
                  }}
                  onMouseUp={() => setMobileIsScratching(false)}
                  onMouseLeave={() => setMobileIsScratching(false)}
                  onMouseMove={handleMobileScratch}
                  onTouchStart={(e) => {
                    setMobileIsScratching(true);
                    handleMobileScratch(e);
                  }}
                  onTouchEnd={() => setMobileIsScratching(false)}
                  onTouchMove={handleMobileScratch}
                  className={`absolute inset-0 w-full h-full z-10 cursor-pointer transition-opacity duration-700 ${
                    mobileIsRevealed ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                />
              </div>

              {/* Indicador de progreso móvil y acciones */}
              <div className="space-y-3 pb-2">
                <div className="bg-[#201f23] p-3 rounded-2xl border border-[#363439] space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#ccc3d8]">Progreso del raspado:</span>
                    <span className="font-mono font-bold text-[#f2be71]">{Math.round(mobileScratchedPercent)}%</span>
                  </div>
                  <div className="w-full bg-[#141317] h-2 rounded-full overflow-hidden border border-[#363439]">
                    <div
                      className="bg-gradient-to-r from-[#ec4899] to-[#f2be71] h-full transition-all duration-150"
                      style={{ width: `${Math.min(100, (mobileScratchedPercent / scratchPercentThreshold) * 100)}%` }}
                    />
                  </div>
                </div>

                {mobileIsRevealed ? (
                  <button
                    type="button"
                    onClick={() => {
                      alert(`¡Voucher generado!\nPremio: ${hiddenRewardText}\nCódigo: ${secretCode}`);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Canjear Voucher en Mesa</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={initMobileCanvas}
                    className="w-full py-2.5 rounded-xl bg-[#201f23] hover:bg-[#2b292e] text-[#ccc3d8] hover:text-[#f2be71] text-xs font-semibold border border-[#363439] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar Tarjeta Rascable</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  ExternalLink,
  QrCode,
  Sparkles,
  Copy,
  Check,
  Wifi,
  Gift,
  Trophy,
  Star,
  Timer,
  Users,
  Play,
  Layers,
  Info,
  Maximize2,
  Target,
  RotateCw,
  Sliders,
  ChevronDown,
  Award,
  Flame,
  Brain,
  Coins,
  CircleDot,
} from "lucide-react";
import { FunnelSequenceService } from "../../lib/funnelSequenceService";

interface DeviceProfile {
  id: string;
  name: string;
  brand: "Apple" | "Samsung" | "Google" | "Xiaomi" | "Tablet" | "Desktop";
  width: number;
  height: number;
  notchType: "dynamic-island" | "notch" | "punch-hole" | "tablet" | "none";
  os: "iOS" | "Android" | "iPadOS" | "Responsive";
}

const DEVICE_PROFILES: DeviceProfile[] = [
  {
    id: "iphone-15-pro",
    name: "iPhone 15 / 16 Pro",
    brand: "Apple",
    width: 393,
    height: 780,
    notchType: "dynamic-island",
    os: "iOS",
  },
  {
    id: "iphone-se",
    name: "iPhone SE / Mini (Compacto)",
    brand: "Apple",
    width: 375,
    height: 667,
    notchType: "notch",
    os: "iOS",
  },
  {
    id: "galaxy-s24",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    width: 412,
    height: 800,
    notchType: "punch-hole",
    os: "Android",
  },
  {
    id: "pixel-8",
    name: "Google Pixel 8 / 9",
    brand: "Google",
    width: 412,
    height: 780,
    notchType: "punch-hole",
    os: "Android",
  },
  {
    id: "redmi-note",
    name: "Xiaomi Redmi Note 13",
    brand: "Xiaomi",
    width: 393,
    height: 780,
    notchType: "punch-hole",
    os: "Android",
  },
  {
    id: "ipad-mini",
    name: "iPad Mini / Tablet 8\"",
    brand: "Tablet",
    width: 600,
    height: 800,
    notchType: "tablet",
    os: "iPadOS",
  },
  {
    id: "fullscreen",
    name: "Pantalla Completa Fluida",
    brand: "Desktop",
    width: 0,
    height: 800,
    notchType: "none",
    os: "Responsive",
  },
];

export function Demo() {
  // Configuración de visualización del simulador
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("iphone-15-pro");
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [selectedTable, setSelectedTable] = useState<string>("1");
  const [selectedGame, setSelectedGame] = useState<"ruleta" | "precision" | "scratch" | "memory" | "pick-win" | "jackpot" | "plinko">("ruleta");
  const [funnelSteps, setFunnelSteps] = useState(() => FunnelSequenceService.getSequence());
  const [customHost, setCustomHost] = useState<string>(
    typeof window !== "undefined" ? window.location.hostname : "localhost"
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [keyReset, setKeyReset] = useState(0);

  useEffect(() => {
    const unsub = FunnelSequenceService.subscribe((seq) => {
      setFunnelSteps(seq);
    });
    return unsub;
  }, []);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentDevice = DEVICE_PROFILES.find((d) => d.id === selectedDeviceId) || DEVICE_PROFILES[0];

  // Construir la URL del frontend para el iframe y navegación
  const buildFrontendUrl = (step = selectedStep, table = selectedTable, game = selectedGame) => {
    const params = new URLSearchParams();
    params.set("demo", "true");
    if (table.startsWith("caja")) {
      params.set("modo", "caja");
    } else if (table.startsWith("domicilio")) {
      params.set("modo", "domicilio");
    } else {
      params.set("mesa", table);
    }

    if (step > 1) {
      params.set("paso", step.toString());
    }

    if (game === "precision") {
      params.set("juego", "precision");
    } else if (game === "scratch") {
      params.set("juego", "scratch");
    } else if (game === "memory") {
      params.set("juego", "memory");
    } else if (game === "pick-win") {
      params.set("juego", "pick-win");
    } else if (game === "jackpot") {
      params.set("juego", "jackpot");
    } else if (game === "plinko") {
      params.set("juego", "plinko");
    }

    return `/?${params.toString()}`;
  };

  const currentUrl = buildFrontendUrl();

  // URL para el código QR (permite usar IP local de red para escanear desde celular real)
  const qrTargetUrl = (() => {
    const port = typeof window !== "undefined" && window.location.port ? `:${window.location.port}` : ":5173";
    const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
    return `${protocol}//${customHost}${port}/?mesa=${selectedTable}&demo=true&juego=${selectedGame}`;
  })();

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    qrTargetUrl
  )}&color=f2be71&bgcolor=1c1b1f&margin=10`;

  // Reiniciar la simulación en el iframe
  const handleReset = () => {
    setSelectedStep(1);
    setKeyReset((prev) => prev + 1);
  };

  // Copiar link al portapapeles
  const handleCopyLink = () => {
    const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${currentUrl}` : currentUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getStepIcon = (id: string) => {
    switch (id) {
      case "step_user_data": return Users;
      case "step_instagram": return Sparkles;
      case "step_game": return Trophy;
      case "step_voucher": return Gift;
      case "step_feedback": return Star;
      case "step_second_chance": return Timer;
      case "step_stamps": return Award;
      case "step_missions": return Target;
      default: return Play;
    }
  };

  // Pasos calculados desde la secuencia modular configurada
  // Pasos calculados desde la secuencia modular configurada
  const stepsList = funnelSteps.map((step, idx) => ({
    num: (step as any).defaultStepNumber || (idx + 1),
    pos: idx + 1,
    id: step.id || `step_${idx + 1}`,
    name: (step as any).name || (step as any).label || (step as any).shortLabel || `Paso ${idx + 1}`,
    icon: getStepIcon(step.id),
    desc: step.description,
    enabled: step.enabled,
  }));

  // Cálculo de dimensiones activas
  const activeWidth = currentDevice.width === 0 ? "100%" : isLandscape ? `${currentDevice.height}px` : `${currentDevice.width}px`;
  const activeHeight = isLandscape && currentDevice.width !== 0 ? Math.min(currentDevice.width, 600) : currentDevice.height;

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[#e6e1e7] font-bold text-2xl font-['Epilogue'] flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-[#f2be71]" />
            <span>Módulo de Demostración & Simulador Multidispositivo</span>
          </h2>
          <p className="text-sm text-[#ccc3d8]">
            Prueba e interactúa en vivo con la experiencia del comensal simulando diferentes modelos de teléfonos (iPhone, Samsung, Xiaomi, Pixel y Tablet).
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="bg-[#201f23] border border-[#363439] hover:bg-[#2b292e] text-[#ccc3d8] text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center gap-2 cursor-pointer transition-colors"
            title="Reiniciar simulador"
          >
            <RotateCcw className="w-4 h-4 text-[#f2be71]" />
            <span>Reiniciar Demo</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="bg-[#201f23] border border-[#363439] hover:bg-[#2b292e] text-[#ccc3d8] text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center gap-2 cursor-pointer transition-colors"
            title="Copiar enlace directo"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4 text-[#f2be71]" />}
            <span>{copiedLink ? "Copiado" : "Copiar Enlace"}</span>
          </button>

          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#f2be71] text-[#121115] font-bold rounded-xl px-4 py-2.5 text-xs hover:brightness-105 active:scale-98 cursor-pointer transition-all flex items-center gap-2 shadow-md"
          >
            <span>Abrir en Pestaña Nueva</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Barra de Control de Fases / Pasos Rápidos */}
      <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-[#f2be71] flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>Saltar Directamente a una Fase del Frontend:</span>
          </span>
          <span className="text-xs text-[#958da1]">Haz clic en cualquier fase para probarla al instante</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {stepsList.map((step) => {
            const Icon = step.icon;
            const isSelected = selectedStep === step.num;
            return (
              <button
                key={step.id || `step-btn-${step.num}`}
                type="button"
                onClick={() => setSelectedStep(step.num)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? "bg-[#2b292e] border-[#f2be71] text-[#f2be71] shadow-[0_0_12px_rgba(242,190,113,0.25)]"
                    : "bg-[#201f23] border-[#363439] text-[#ccc3d8] hover:border-[#4a4455] hover:bg-[#252429]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase opacity-80">Paso {step.num}</span>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold leading-tight line-clamp-1">{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ÁREA PRINCIPAL: SIMULADOR INTERACTIVO + HERRAMIENTAS LATERALES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA 1 (CENTRAL): DISPOSITIVO MÓVIL SIMULADO */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* BARRA SUPERIOR DE SELECTOR DE DISPOSITIVOS MÓVILES */}
          <div className="w-full bg-[#1c1b1f] border border-[#363439] rounded-2xl p-3 mb-4 space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#f2be71]" />
                <span className="text-xs font-bold text-[#e6e1e7] font-['Epilogue']">
                  Dispositivo Móvil Seleccionado:
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#141317] border border-[#363439] text-[#f2be71] font-bold">
                  {currentDevice.os} • {currentDevice.width === 0 ? "Fluido" : `${currentDevice.width} x ${currentDevice.height} px`}
                </span>
              </div>

              {/* Botón de Giro de Orientación */}
              {currentDevice.width !== 0 && (
                <button
                  type="button"
                  onClick={() => setIsLandscape(!isLandscape)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    isLandscape
                      ? "bg-[#f2be71] text-[#121115] border-[#f2be71] font-bold"
                      : "bg-[#201f23] text-[#ccc3d8] border-[#363439] hover:text-white"
                  }`}
                  title="Rotar pantalla vertical / horizontal"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isLandscape ? "Horizontal (Apaisado)" : "Vertical (Retrato)"}</span>
                </button>
              )}
            </div>

            {/* Selector de Modelos Móviles en Cuadrícula */}
            <div className="flex flex-wrap gap-1.5">
              {DEVICE_PROFILES.map((dev) => {
                const isSelected = selectedDeviceId === dev.id;
                return (
                  <button
                    key={dev.id}
                    type="button"
                    onClick={() => {
                      setSelectedDeviceId(dev.id);
                      if (dev.id === "fullscreen") setIsLandscape(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#2b292e] text-[#f2be71] border border-[#f2be71]/50 shadow-sm font-bold"
                        : "bg-[#201f23] text-[#ccc3d8] border border-[#363439] hover:bg-[#252429] hover:text-white"
                    }`}
                  >
                    {dev.brand === "Tablet" ? (
                      <Tablet className="w-3.5 h-3.5" />
                    ) : dev.brand === "Desktop" ? (
                      <Monitor className="w-3.5 h-3.5" />
                    ) : (
                      <Smartphone className="w-3.5 h-3.5" />
                    )}
                    <span>{dev.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Marco del Dispositivo (Mockup Adaptativo por Modelo) */}
          <div
            className={`transition-all duration-300 relative bg-gradient-to-b from-[#2b292e] via-[#1c1b1f] to-[#121115] shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-4 border-[#363439] flex flex-col items-center max-w-full ${
              currentDevice.notchType === "tablet"
                ? "rounded-[28px] p-4"
                : currentDevice.notchType === "none"
                ? "rounded-2xl p-2 w-full"
                : "rounded-[46px] p-3.5"
            }`}
            style={{ width: activeWidth }}
          >
            {/* Cabecera / Notch / Dynamic Island según el Modelo */}
            {currentDevice.notchType === "dynamic-island" && !isLandscape && (
              <div className="w-28 h-6 bg-[#000] rounded-full mb-2.5 flex items-center justify-between px-3 border border-[#2b292e] shrink-0 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1c1b1f]" />
                <div className="w-2 h-2 rounded-full bg-[#10b981]/80 animate-pulse" />
              </div>
            )}

            {currentDevice.notchType === "punch-hole" && !isLandscape && (
              <div className="w-3.5 h-3.5 bg-[#000] rounded-full mb-2 flex items-center justify-center border border-[#363439] shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1c1b1f]" />
              </div>
            )}

            {currentDevice.notchType === "notch" && !isLandscape && (
              <div className="w-36 h-4 bg-[#0f0e12] rounded-b-xl mb-2 flex items-center justify-center border-b border-x border-[#363439] shrink-0">
                <div className="w-10 h-1 rounded-full bg-[#201f23]" />
              </div>
            )}

            {/* Pantalla Interactiva (iframe del Frontend) */}
            <div
              className="w-full bg-[#141317] overflow-hidden border border-[#2b292e] relative shadow-inner"
              style={{
                borderRadius: currentDevice.notchType === "tablet" ? "18px" : currentDevice.notchType === "none" ? "12px" : "32px",
              }}
            >
              <iframe
                key={`${selectedStep}-${selectedTable}-${selectedGame}-${selectedDeviceId}-${isLandscape}-${keyReset}`}
                ref={iframeRef}
                src={buildFrontendUrl()}
                title="Frontend Demo"
                className="w-full border-0"
                style={{ height: `${activeHeight}px` }}
                allow="clipboard-write; camera; microphone; geolocation"
              />
            </div>

            {/* Barra de inicio inferior (Home Indicator) para teléfonos */}
            {currentDevice.notchType !== "none" && !isLandscape && (
              <div className="w-32 h-1 bg-[#4a4455] rounded-full mt-3 opacity-60" />
            )}
          </div>
        </div>

        {/* COLUMNA 2 (LATERAL): PANEL DE CONTROL & PRUEBA EN CELULAR FÍSICO */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tarjeta 1: Parámetros del Entorno */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 border-b border-[#363439] pb-3 font-['Epilogue']">
              <Play className="w-4 h-4 text-[#f2be71]" />
              <span>Configuración del Entorno de Prueba</span>
            </h3>

            {/* Selección de Mesa */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Mesa / Ubicación Simulada
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] rounded-xl px-4 py-2.5 w-full text-xs focus:border-[#f2be71] focus:outline-none cursor-pointer"
              >
                <option value="1">Mesa 1 (QR Sala Principal)</option>
                <option value="2">Mesa 2 (QR Sala Principal)</option>
                <option value="5">Mesa 5 (Zona Terraza Jardín)</option>
                <option value="8">Mesa 8 (Zona VIP Rooftop)</option>
                <option value="10">Mesa 10 (QR Barra)</option>
                <option value="caja">Punto de Pago / Caja Registradora</option>
                <option value="domicilio">🛵 Pedido a Domicilio / Takeout</option>
              </select>
            </div>

            {/* Mecánica de Juego Activa */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#ccc3d8] uppercase tracking-wider block">
                Mecánica de Juego a Evaluar
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGame("ruleta")}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedGame === "ruleta"
                      ? "bg-[#2b292e] border-[#f2be71] text-[#f2be71]"
                      : "bg-[#201f23] border-[#363439] text-[#ccc3d8] hover:bg-[#252429]"
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Ruleta Fortuna</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGame("precision")}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedGame === "precision"
                      ? "bg-[#2b292e] border-[#f2be71] text-[#f2be71]"
                      : "bg-[#201f23] border-[#363439] text-[#ccc3d8] hover:bg-[#252429]"
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Cronómetro 10s</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGame("scratch")}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedGame === "scratch"
                      ? "bg-[#2b292e] border-[#f2be71] text-[#f2be71]"
                      : "bg-[#201f23] border-[#363439] text-[#ccc3d8] hover:bg-[#252429]"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Raspa y Gana</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGame("memory")}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedGame === "memory"
                      ? "bg-[#2b292e] border-[#f2be71] text-[#f2be71]"
                      : "bg-[#201f23] border-[#363439] text-[#ccc3d8] hover:bg-[#252429]"
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-pink-400" />
                  <span>Memoria</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGame("pick-win")}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedGame === "pick-win"
                      ? "bg-[#2b292e] border-[#f2be71] text-[#f2be71]"
                      : "bg-[#201f23] border-[#363439] text-[#ccc3d8] hover:bg-[#252429]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Descubre y Gana</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGame("jackpot")}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedGame === "jackpot"
                      ? "bg-[#2b292e] border-[#f2be71] text-[#f2be71]"
                      : "bg-[#201f23] border-[#363439] text-[#ccc3d8] hover:bg-[#252429]"
                  }`}
                >
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Jackpot Slots</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGame("plinko")}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedGame === "plinko"
                      ? "bg-[#2b292e] border-[#f2be71] text-[#f2be71]"
                      : "bg-[#201f23] border-[#363439] text-[#ccc3d8] hover:bg-[#252429]"
                  }`}
                >
                  <CircleDot className="w-3.5 h-3.5 text-red-400" />
                  <span>Suelta y Gana</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Código QR para Probar en tu Celular Físico */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#363439] pb-3">
              <h3 className="text-sm font-bold text-[#e6e1e7] flex items-center gap-2 font-['Epilogue']">
                <QrCode className="w-4 h-4 text-[#f2be71]" />
                <span>Escanear en Celular Físico</span>
              </h3>
              <span className="text-[10px] text-[#10b981] font-mono font-bold bg-[#10b981]/10 px-2 py-0.5 rounded-full border border-[#10b981]/30">
                Wi-Fi Local
              </span>
            </div>

            <p className="text-xs text-[#ccc3d8] leading-relaxed">
              Apunta la cámara de tu smartphone a este código para probar la app exactamente como la verá un comensal sentado en tu restaurante:
            </p>

            <div className="flex flex-col items-center justify-center p-4 bg-[#141317] rounded-xl border border-[#363439]">
              <img
                src={qrImageUrl}
                alt="Código QR de Prueba en Mesa"
                className="w-44 h-44 rounded-lg shadow-md border border-[#f2be71]/30 p-1 bg-[#1c1b1f]"
              />
              <span className="text-[11px] text-[#f2be71] font-mono mt-2 font-bold break-all text-center">
                Mesa: {selectedTable} • {selectedGame === "ruleta" ? "Ruleta" : "Cronómetro"}
              </span>
            </div>

            {/* Input de Host / IP para red Wi-Fi local */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-[#958da1] uppercase block">
                IP Local o Dominio para escanear en red Wi-Fi:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customHost}
                  onChange={(e) => setCustomHost(e.target.value)}
                  placeholder="ej: 192.168.68.59 o tudominio.com"
                  className="bg-[#201f23] border border-[#363439] text-[#e6e1e7] font-mono text-xs rounded-xl px-3 py-2 w-full focus:border-[#f2be71] focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-[#958da1]">
                Si tu celular está conectado al mismo Wi-Fi que este computador, coloca la IP local (ej: 192.168.68.59).
              </span>
            </div>
          </div>

          {/* Tarjeta 3: Consejos para Demostraciones a Clientes o Inversores */}
          <div className="bg-[#1c1b1f] border border-[#363439] rounded-2xl p-5 space-y-3 shadow-xl">
            <h4 className="text-xs font-bold text-[#e6e1e7] flex items-center gap-2 font-['Epilogue']">
              <Info className="w-4 h-4 text-[#60a5fa]" />
              <span>Guía para Demostraciones Exitosas</span>
            </h4>
            <ul className="text-xs text-[#ccc3d8] space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#f2be71] font-bold">•</span>
                <span>
                  <strong>Giro de Ruleta:</strong> En el Paso 3 puedes tocar directamente en *"Girar Ruleta"* dentro de la pantalla para simular la victoria.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f2be71] font-bold">•</span>
                <span>
                  <strong>Quema de Cupón:</strong> En el Paso 4 puedes usar el PIN de cajero por defecto (<code>4321</code> o <code>9395</code>) para probar la validación en mesa.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f2be71] font-bold">•</span>
                <span>
                  <strong>Desvío de Calificación:</strong> En el Paso 5, prueba poner 1 a 3 estrellas para ver cómo se desvía a WhatsApp confidencial de gerencia.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f2be71] font-bold">•</span>
                <span>
                  <strong>Misiones & Embajador (Paso 8):</strong> Prueba las tareas sociales (TripAdvisor, TikTok) y el reto viral de invitar 3 amigos con enlace y código VIP de WhatsApp.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  PickAndWinSettings,
  DEFAULT_PICK_AND_WIN_SETTINGS,
  PICK_AND_WIN_THEMES,
  PickItem,
  pickAudio,
} from "@/lib/pickAndWinData";
import { Trophy, Volume2, VolumeX, ThumbsUp, ThumbsDown } from "lucide-react";
import confetti from "canvas-confetti";
import { brandConfettiColors } from "@/lib/brandService";

interface TileState {
  index: number;
  isRevealed: boolean;
  item: PickItem;
}

interface StepPickAndWinProps {
  participantName?: string;
  tableNumber?: string;
  onWinPrize: (prizeName: string, prizeValue: string) => void;
  customSettings?: Partial<PickAndWinSettings>;
  isStandAlone?: boolean;
  initialFace?: "face1" | "face2";
}

export function StepPickAndWin({
  participantName = "Invitado VIP",
  tableNumber = "Mesa 1",
  onWinPrize,
  customSettings,
  initialFace = "face1",
}: StepPickAndWinProps) {
  const [settings] = useState<PickAndWinSettings>(() => ({
    ...DEFAULT_PICK_AND_WIN_SETTINGS,
    ...customSettings,
  }));

  const theme = PICK_AND_WIN_THEMES[settings.themeId] || PICK_AND_WIN_THEMES.dia_de_muertos;

  // Cara activa: "face1" (Portada Perfume Día de Muertos) o "face2" (Tablero 3x3 con Papel Picado)
  const [activeFace, setActiveFace] = useState<"face1" | "face2">(initialFace);

  const [tiles, setTiles] = useState<TileState[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(settings.maxAttempts);
  // Historial real de intentos: true = acierto, false = fallo. Empieza vacío y
  // crece conforme el jugador destapa casillas (antes mostraba datos falsos).
  const [attemptHistory, setAttemptHistory] = useState<boolean[]>([]);
  const [revealedItemsCount, setRevealedItemsCount] = useState<Record<string, number>>({});
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState(false);
  // setTimeout de victoria/reset, para cancelarlos al desmontar
  const tileTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Inicializar tablero 3x3 (9 casillas) con 3 premios garantizados en la baraja
  const setupBoard = () => {
    const prizeItem = theme.items.find((i) => i.isPrize) || theme.items[0];
    const otherItems = theme.items.filter((i) => !i.isPrize);

    // 9 casillas: 3 perfumes garantizados, 4 calaveras y 2 huesos
    const deckItems: PickItem[] = [
      prizeItem,
      prizeItem,
      prizeItem,
    ];

    while (deckItems.length < 9) {
      const randomOther = otherItems[Math.floor(Math.random() * otherItems.length)] || theme.items[1];
      deckItems.push(randomOther);
    }

    // Barajar
    for (let i = deckItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deckItems[i], deckItems[j]] = [deckItems[j], deckItems[i]];
    }

    const initialTiles: TileState[] = deckItems.map((item, index) => ({
      index,
      isRevealed: false,
      item,
    }));

    setTiles(initialTiles);
    setAttemptsLeft(settings.maxAttempts);
    setRevealedItemsCount({});
    setAttemptHistory([]);
    setIsProcessing(false);
    setHasWon(false);
  };

  useEffect(() => {
    setupBoard();
  }, [settings]);

  // Limpieza de los setTimeout de victoria/reset al desmontar
  useEffect(() => {
    return () => {
      tileTimeoutsRef.current.forEach(clearTimeout);
      tileTimeoutsRef.current = [];
    };
  }, []);

  const handleStart = () => {
    setupBoard();
    setActiveFace("face2");
  };

  // Manejo de clic en casilla
  const handleTileClick = (tile: TileState) => {
    if (tile.isRevealed || isProcessing || attemptsLeft <= 0 || hasWon) return;

    setIsProcessing(true);
    if (soundEnabled) pickAudio.playOpenTile();

    // Revelar casilla
    const newTiles = tiles.map((t) => (t.index === tile.index ? { ...t, isRevealed: true } : t));
    setTiles(newTiles);

    const isMatch = Boolean(tile.item.isPrize);
    // Acumula el resultado real del intento (hasta maxAttempts entradas)
    setAttemptHistory((prev) => [...prev, isMatch].slice(-settings.maxAttempts));

    if (isMatch) {
      if (soundEnabled) pickAudio.playFoundTarget();
    } else {
      if (soundEnabled) pickAudio.playMiss();
    }

    const newCount = {
      ...revealedItemsCount,
      [tile.item.id]: (revealedItemsCount[tile.item.id] || 0) + 1,
    };
    setRevealedItemsCount(newCount);

    const currentMatches = newCount[tile.item.id] || 0;

    if (currentMatches >= theme.targetCount) {
      tileTimeoutsRef.current.push(setTimeout(() => {
        setHasWon(true);
        if (soundEnabled) pickAudio.playVictory();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: brandConfettiColors(["#e6007e", "#ea580c", "#ffffff"]),
        });
        setIsProcessing(false);
      }, 600));
      return;
    }

    const newAttempts = attemptsLeft - 1;
    setAttemptsLeft(newAttempts);

    tileTimeoutsRef.current.push(setTimeout(() => {
      setIsProcessing(false);
    }, 300));
  };

  return (
    <div className="w-full max-w-[390px] mx-auto select-none">
      {/* SELECTOR DISCRETO DE LAS DOS CARAS (Cara 1: Portada Perfume / Cara 2: Tablero 3x3) */}
      <div className="flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-1 mb-2">
        <button
          type="button"
          onClick={() => setActiveFace("face1")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeFace === "face1"
              ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md"
              : "text-white/70 hover:text-white"
          }`}
        >
          <span>🌸 Cara 1: Portada</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFace("face2")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeFace === "face2"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md"
              : "text-white/70 hover:text-white"
          }`}
        >
          <span>💀 Cara 2: Tablero 3x3</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* CARA 1: PORTADA FRASCO DE PERFUME Y CEMPASÚCHIL (FOTO IZQUIERDA) */}
      {/* ============================================================== */}
      {activeFace === "face1" && (
        <div className="relative rounded-[32px] overflow-hidden border-4 border-[#2b292e] shadow-2xl bg-gradient-to-b from-[#0e0413] via-[#1a0822] to-[#0a020c] text-white p-5 flex flex-col justify-between min-h-[640px] text-center">
          {/* Banderines festivos de papel picado calado multicolor en el borde superior */}
          <div className="absolute top-0 left-0 right-0 h-10 flex justify-between px-2 overflow-hidden pointer-events-none opacity-90 z-10">
            {["#ea580c", "#e6007e", "#fbbf24", "#9333ea", "#10b981", "#ea580c"].map((color, idx) => (
              <div
                key={idx}
                className="w-12 h-8 rounded-b-xl border-b-2 border-x shadow-md flex items-center justify-center text-[11px]"
                style={{ backgroundColor: color, borderColor: `${color}cc` }}
              >
                🏵️
              </div>
            ))}
          </div>

          {/* Menú hamburguesa superior derecho sutil */}
          <div className="relative z-20 w-full pt-9 flex items-center justify-between px-1">
            <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
              {tableNumber}
            </span>
            <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center text-amber-300">
              <span className="text-xs font-bold">☰</span>
            </div>
          </div>

          {/* ILUSTRACIÓN CENTRAL: FRASCO DE PERFUME DORADO CON CALAVERA MEXICANA Y VELAS */}
          <div className="relative z-10 my-auto py-2 flex items-center justify-center">
            {/* Vela izquierda encendida con llama cálida */}
            <div className="absolute -left-2 text-3xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse">
              🕯️
            </div>

            {/* Frasco de perfume facetado de cristal con calavera decorada */}
            <div className="relative w-40 h-52 rounded-3xl bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] p-1.5 shadow-[0_0_40px_rgba(245,158,11,0.6)] border-2 border-amber-200 flex flex-col items-center justify-center">
              {/* Tapón dorado del perfume */}
              <div className="w-10 h-7 rounded-t-lg bg-gradient-to-b from-[#fffbeb] via-[#fbbf24] to-[#d97706] -mt-4 border border-amber-100 shadow-md" />

              {/* Botella de cristal con líquido dorado y calavera mexicana decorada */}
              <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#fffbeb]/20 via-[#fef08a]/30 to-[#f59e0b]/40 backdrop-blur-xs flex flex-col items-center justify-center p-3 relative overflow-hidden border border-amber-100/50">
                <span className="text-6xl filter drop-shadow-[0_8px_16px_rgba(230,0,126,0.7)] animate-bounce">
                  💀
                </span>
                <span className="text-[10px] font-mono font-black uppercase text-amber-300 tracking-widest mt-1">
                  CALAVERA GOLD
                </span>
              </div>
            </div>

            {/* Vela derecha encendida */}
            <div className="absolute -right-2 text-3xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse">
              🕯️
            </div>
          </div>

          {/* TÍTULO Y DESCRIPCIÓN IDÉNTICA A LA IMAGEN */}
          <div className="relative z-10 space-y-1.5 my-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-white leading-tight">
              ¡Juega y gana<br />
              <span className="text-[#fbbf24] drop-shadow-[0_2px_8px_rgba(251,191,36,0.9)] font-['Epilogue']">
                perfume!
              </span>
            </h2>

            <p className="text-xs text-amber-200/90 font-medium max-w-[280px] mx-auto leading-relaxed pt-1">
              Descubre y gana para celebrar el Día de Muertos
            </p>

            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300/80 pt-0.5">
              <span>🏵️</span>
              <span className="text-[11px] text-white/90">Pon a prueba tu intuición y encuentra las figuras iguales</span>
              <span>🏵️</span>
            </div>
          </div>

          {/* BOTÓN FUCSIA MAGENTA: 🌸 PARTICIPA 🌸 */}
          <div className="relative z-10 pt-2 pb-1">
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-[#d91b7d] via-[#f43f5e] to-[#d91b7d] hover:brightness-110 active:scale-95 text-white font-extrabold text-sm tracking-wider uppercase border-2 border-pink-300 shadow-[0_4px_25px_rgba(217,27,125,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🌸</span>
              <span className="font-['Epilogue'] tracking-widest font-black">PARTICIPA</span>
              <span>🌸</span>
            </button>
          </div>

          {/* JARDÍN DE FLORES DE CEMPASÚCHIL EN LA BASE */}
          <div className="relative z-10 flex items-center justify-center gap-2 text-2xl pt-2 text-amber-400">
            <span>🏵️</span>
            <span>🌼</span>
            <span>🏵️</span>
            <span>🌼</span>
            <span>🏵️</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CARA 2: TABLERO 3x3 FESTIVO DÍA DE MUERTOS (FOTO DERECHA)       */}
      {/* ============================================================== */}
      {activeFace === "face2" && (
        <div className="relative rounded-[32px] overflow-hidden border-4 border-[#2b292e] shadow-2xl bg-black text-white p-4 flex flex-col justify-between min-h-[640px]">
          {/* Cenefa superior floral mexicana con menú hamburguesa */}
          <div className="relative z-10 w-full flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5 text-sm text-amber-400">
              <span>🏵️</span>
              <span className="text-purple-400">💜</span>
              <span>🏵️</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-7 h-7 rounded-full bg-neutral-900 border border-amber-400/30 text-amber-300 flex items-center justify-center transition-all cursor-pointer"
                title={soundEnabled ? "Silenciar sonido" : "Activar sonido"}
                aria-label={soundEnabled ? "Silenciar sonido" : "Activar sonido"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
              </button>

              <div
                className="w-8 h-8 rounded-xl bg-orange-600/80 border border-amber-300/40 flex items-center justify-center text-white shadow-md"
                aria-hidden="true"
              >
                <span className="text-sm font-bold">☰</span>
              </div>
            </div>
          </div>

          {/* Instrucción del reto: Encuentra 3 iguales. Tienes 2 intentos. */}
          <div className="relative z-10 text-center py-1">
            <p className="text-xs sm:text-sm font-serif font-bold text-amber-100">
              Encuentra 3 iguales. Tienes {attemptsLeft} intentos.
            </p>
          </div>

          {/* BARRA DE 3 PÍLDORAS DE FEEDBACK: [ 👍 Verde ] [ 👎 Rojo ] [ 👍 Verde ] */}
          <div className="relative z-10 flex items-center justify-center gap-2 py-1">
            {attemptHistory.map((isOk, idx) => (
              <div
                key={idx}
                className={`w-12 h-8 rounded-xl flex items-center justify-center shadow-md border ${
                  isOk
                    ? "bg-[#16a34a] border-emerald-400 text-white"
                    : "bg-[#dc2626] border-red-400 text-white"
                }`}
              >
                {isOk ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
              </div>
            ))}
          </div>

          {/* TABLERO 3x3 CON MARCO FESTIVO MEXICANO AMARILLO Y FONDO NARANJA VIVO */}
          <div className="relative z-10 my-2 rounded-3xl p-3 border-4 border-amber-400 bg-[#ea580c] shadow-[0_0_35px_rgba(234,88,12,0.5)]">
            {/* Flores decorativas en las 4 esquinas */}
            <div className="absolute top-1 left-1 text-sm">🏵️</div>
            <div className="absolute top-1 right-1 text-sm">🏵️</div>
            <div className="absolute bottom-1 left-1 text-sm">🏵️</div>
            <div className="absolute bottom-1 right-1 text-sm">🏵️</div>

            {/* Cuadrícula 3x3 */}
            <div className="grid grid-cols-3 gap-2 p-1">
              {tiles.map((tile) => (
                <button
                  key={tile.index}
                  type="button"
                  onClick={() => handleTileClick(tile)}
                  disabled={tile.isRevealed || isProcessing || hasWon}
                  className={`aspect-square rounded-2xl select-none transition-all duration-300 transform perspective-500 cursor-pointer ${
                    tile.isRevealed
                      ? "scale-100 shadow-lg"
                      : "hover:scale-104 active:scale-95 shadow-md bg-white/10 border-2 border-amber-300/40"
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-2xl flex items-center justify-center border-2 transition-all ${
                      tile.isRevealed
                        ? "bg-white text-neutral-900 border-white shadow-xl"
                        : "bg-[#7c2d12] border-amber-300/60"
                    }`}
                  >
                    {tile.isRevealed ? (
                      <span className="text-3xl sm:text-4xl animate-scale-up filter drop-shadow">
                        {tile.item.emoji}
                      </span>
                    ) : (
                      <span className="text-2xl filter drop-shadow animate-pulse">
                        🏵️
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* MENSAJE DE VICTORIA O CONTROL */}
          {hasWon ? (
            <div className="relative z-10 pt-1 space-y-2">
              <button
                type="button"
                onClick={() => onWinPrize(settings.rewardPrizeName, settings.rewardPrizeValue)}
                className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:brightness-110 active:scale-98 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-white" />
                <span>¡3 IGUALES! RECLAMAR PERFUME</span>
              </button>
            </div>
          ) : (
            <div className="relative z-10 text-center text-[11px] text-amber-200/90 font-medium">
              <span>Toca una casilla para descubrir la figura oculta</span>
            </div>
          )}

          {/* CENEFA INFERIOR DECORATIVA MEXICANA CON FLOR CENTRAL */}
          <div className="relative z-10 flex items-center justify-center gap-2 pt-2 text-xl text-amber-400">
            <span>🌿</span>
            <span className="text-purple-400">🏵️</span>
            <span className="text-2xl text-amber-400">🏵️</span>
            <span className="text-purple-400">🏵️</span>
            <span>🌿</span>
          </div>
        </div>
      )}
    </div>
  );
}

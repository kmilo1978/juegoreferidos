import { useState, useEffect, useMemo, useRef } from "react";
import {
  MEMORY_THEMES,
  MemoryThemePreset,
  MemoryGameSettings,
  DEFAULT_MEMORY_SETTINGS,
  memoryAudio,
} from "@/lib/memoryGameData";
import {
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Gift,
  CheckCircle2,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";

interface CardState {
  instanceId: string;
  itemId: string;
  name: string;
  emoji: string;
  color?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface StepMemoryGameProps {
  onWinPrize: (prizeName: string, prizeValue: string) => void;
  onSecondChance?: () => void;
  initialSettings?: Partial<MemoryGameSettings>;
  tableNumber?: string;
  participantName?: string;
  initialFace?: "face1" | "face2";
}

export function StepMemoryGame({
  onWinPrize,
  onSecondChance,
  initialSettings,
  tableNumber = "Mesa 1",
  participantName = "Comensal VIP",
  initialFace = "face1",
}: StepMemoryGameProps) {
  const settings: MemoryGameSettings = {
    ...DEFAULT_MEMORY_SETTINGS,
    ...initialSettings,
  };

  const theme: MemoryThemePreset =
    MEMORY_THEMES[settings.activeThemeId] || MEMORY_THEMES.halloween;

  // Cara activa: "face1" (Portada de Bienvenida Halloween) o "face2" (Tablero 4x4 de Cartas)
  const [activeFace, setActiveFace] = useState<"face1" | "face2">(initialFace);
  const [gameState, setGameState] = useState<"welcome" | "playing" | "won" | "timeout">("welcome");
  const [cards, setCards] = useState<CardState[]>([]);
  const [selectedCards, setSelectedCards] = useState<CardState[]>([]);
  const [isProcessingMatch, setIsProcessingMatch] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(settings.timeLimitSeconds);
  const [score, setScore] = useState<number>(0);
  const [matchesFound, setMatchesFound] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [streak, setStreak] = useState(0);

  const timerRef = useRef<any>(null);
  const hasWon = gameState === "won";

  // Generar y barajar la baraja de parejas
  const setupDeck = () => {
    const pairsCount = Math.min(settings.pairsCount || 8, theme.items.length);
    const chosenItems = theme.items.slice(0, pairsCount);

    const deck: CardState[] = [];
    chosenItems.forEach((item) => {
      // 2 cartas por cada item para formar la pareja
      deck.push({
        instanceId: `${item.id}-a-${Math.random()}`,
        itemId: item.id,
        name: item.name,
        emoji: item.emoji,
        color: item.color,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        instanceId: `${item.id}-b-${Math.random()}`,
        itemId: item.id,
        name: item.name,
        emoji: item.emoji,
        color: item.color,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Barajar aleatoriamente (Fisher-Yates)
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setSelectedCards([]);
    setIsProcessingMatch(false);
    setMatchesFound(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(settings.timeLimitSeconds);
  };

  // Iniciar partida
  const handleStartGame = () => {
    setupDeck();
    setGameState("playing");
    setActiveFace("face2");
  };

  useEffect(() => {
    setupDeck();
  }, []);

  // Control del cronómetro
  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current);
            setGameState("timeout");
            if (soundEnabled) memoryAudio.playError();
            return 0;
          }
          return parseFloat((prev - 0.1).toFixed(1));
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, soundEnabled]);

  // Manejo de clic en carta
  const handleCardClick = (card: CardState) => {
    if (
      gameState !== "playing" ||
      isProcessingMatch ||
      card.isFlipped ||
      card.isMatched ||
      selectedCards.length >= 2
    ) {
      return;
    }

    if (soundEnabled) memoryAudio.playFlip();

    // Voltear carta
    const updatedCards = cards.map((c) =>
      c.instanceId === card.instanceId ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    // Si ya hay dos cartas seleccionadas, verificar si hacen pareja
    if (newSelected.length === 2) {
      setIsProcessingMatch(true);
      const [first, second] = newSelected;

      if (first.itemId === second.itemId) {
        // ¡PAREJA ENCONTRADA!
        setTimeout(() => {
          if (soundEnabled) memoryAudio.playMatch();
          const totalPairs = (settings.pairsCount || 8);

          setCards((prev) =>
            prev.map((c) =>
              c.itemId === first.itemId ? { ...c, isMatched: true } : c
            )
          );
          setSelectedCards([]);
          setIsProcessingMatch(false);
          setMatchesFound((m) => {
            const nextM = m + 1;
            if (nextM >= totalPairs) {
              // ¡VICTORIA!
              handleVictory();
            }
            return nextM;
          });

          // Puntuación: 100 pts + bonus por racha + bonus de velocidad
          const bonus = (streak + 1) * 25;
          setScore((s) => s + 100 + bonus);
          setStreak((st) => st + 1);
        }, 450);
      } else {
        // FALLO: Voltear de nuevo
        setTimeout(() => {
          if (soundEnabled) memoryAudio.playError();
          setCards((prev) =>
            prev.map((c) =>
              c.instanceId === first.instanceId || c.instanceId === second.instanceId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setSelectedCards([]);
          setIsProcessingMatch(false);
          setStreak(0);
        }, 850);
      }
    }
  };

  const handleVictory = () => {
    setGameState("won");
    if (soundEnabled) memoryAudio.playVictory();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: [theme.accentColor, "#f2be71", "#ffddb1", "#ffffff"],
    });
  };

  const handleClaimReward = () => {
    onWinPrize(settings.rewardPrizeName, settings.rewardPrizeValue);
  };

  return (
    <div className="w-full max-w-[390px] mx-auto select-none">
      {/* SELECTOR DISCRETO DE LAS DOS CARAS (Cara 1: Portada Halloween / Cara 2: Tablero 4x4) */}
      <div className="flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-1 mb-2">
        <button
          type="button"
          onClick={() => setActiveFace("face1")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeFace === "face1"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
              : "text-white/70 hover:text-white"
          }`}
        >
          <span>🎃 Cara 1: Portada</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveFace("face2");
            if (gameState === "welcome") setGameState("playing");
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeFace === "face2"
              ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md"
              : "text-white/70 hover:text-white"
          }`}
        >
          <span>🃏 Cara 2: Tablero 4x4</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* CARA 1: PORTADA FANTASMITA Y CALABAZA (FOTO IZQUIERDA)          */}
      {/* ============================================================== */}
      {activeFace === "face1" && (
        <div className="relative rounded-[32px] overflow-hidden border-4 border-[#2b292e] shadow-2xl bg-gradient-to-b from-[#2b0c3f] via-[#1a0729] to-[#0c0314] text-white p-5 flex flex-col justify-between min-h-[640px] text-center">
          {/* Luna llena amarilla en la esquina superior derecha con destello */}
          <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-gradient-to-br from-[#fff7b2] via-[#fef08a] to-[#f59e0b] shadow-[0_0_35px_rgba(254,240,138,0.8)] pointer-events-none" />

          {/* Siluetas de ramas retorcidas, castillo embrujado y murciélagos */}
          <div className="absolute top-10 left-5 text-xl opacity-70 animate-pulse">🦇</div>
          <div className="absolute top-16 right-24 text-sm opacity-50">🦇</div>
          <div className="absolute top-28 left-8 text-xs opacity-60">🦇</div>

          {/* Fantasmita blanco flotante sonriente saludando */}
          <div className="relative z-10 pt-6 flex flex-col items-center">
            <span className="text-7xl filter drop-shadow-[0_8px_20px_rgba(255,255,255,0.4)] animate-bounce inline-block">
              👻
            </span>
          </div>

          {/* TÍTULO ESTILIZADO DE CUENTO IDÉNTICO A LA FOTO */}
          <div className="relative z-10 space-y-2 my-auto py-2">
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white leading-tight">
              ¡Juega al<br />
              Memory de<br />
              <span className="text-[#fbbf24] drop-shadow-[0_4px_12px_rgba(251,191,36,0.9)] font-['Epilogue'] tracking-wide">
                Halloween!
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-pink-200 font-semibold px-4 pt-1">
              Encuentra las parejas y gana premios espeluznantes.
            </p>

            <p className="text-[11px] text-purple-200/80">
              Pon a prueba tu memoria y diviértete.
            </p>
          </div>

          {/* BOTÓN CÁPSULA MAGENTA BRILLANTE: ¡JUGAR! */}
          <div className="relative z-10 pt-2 pb-1 max-w-[280px] mx-auto w-full">
            <button
              type="button"
              onClick={handleStartGame}
              className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-[#d91b7d] via-[#f43f5e] to-[#d91b7d] hover:brightness-110 active:scale-95 text-white font-black text-sm tracking-wider uppercase border-2 border-pink-300 shadow-[0_4px_25px_rgba(217,27,125,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="font-['Epilogue'] tracking-widest text-base">¡JUGAR!</span>
            </button>
          </div>

          {/* GRAN CALABAZA ILUMINADA EN LA BASE ENTRE HIERBA NOCTURNA Y ESTRELLAS */}
          <div className="relative z-10 flex items-end justify-center pt-2">
            <div className="relative">
              <span className="text-6xl filter drop-shadow-[0_0_20px_rgba(245,158,11,0.9)] inline-block">
                🎃
              </span>
              <span className="absolute -top-2 -left-4 text-amber-300 text-sm animate-pulse">✦</span>
              <span className="absolute -top-1 -right-4 text-amber-300 text-sm animate-pulse">✦</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CARA 2: TABLERO 4x4 CON REVERSO CALABAZA (FOTO DERECHA)        */}
      {/* ============================================================== */}
      {activeFace === "face2" && (
        <div className="relative rounded-[32px] overflow-hidden border-4 border-[#2b292e] shadow-2xl bg-gradient-to-b from-[#180924] via-[#10051a] to-[#08020e] text-white p-3.5 flex flex-col justify-between min-h-[640px]">
          {/* BARRA SUPERIOR FUCSIA CON ICONO DE CUADRÍCULA BLANCA 3x3 */}
          <div className="w-full bg-gradient-to-r from-[#d91b7d] via-[#e11d48] to-[#d91b7d] rounded-2xl py-2 px-3 flex items-center justify-between shadow-md mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🎃</span>
              <span className="text-xs font-mono font-bold tracking-wider text-white">
                {tableNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-6 h-6 rounded-full bg-black/20 text-white flex items-center justify-center cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3 opacity-50" />}
              </button>

              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                ⊞
              </div>
            </div>
          </div>

          {/* INDICADORES FLOTANTES: TIEMPO Y PUNTUACIÓN CON ESTRELLITAS (IDÉNTICO A LA FOTO) */}
          <div className="flex items-center justify-around px-2 py-1">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-300 text-xs">✦</span>
              <div className="text-center">
                <span className="text-[10px] text-purple-200 uppercase font-bold block">⏱️ Tiempo</span>
                <span className="font-mono text-lg font-black text-white">{timeLeft.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="text-center">
                <span className="text-[10px] text-purple-200 uppercase font-bold block">🏆 Puntuación</span>
                <span className="font-mono text-lg font-black text-white">{score}</span>
              </div>
              <span className="text-amber-300 text-xs">✦</span>
            </div>
          </div>

          {/* CUADRÍCULA 4x4 (16 CARTAS CON REVERSO NARANJA CALABAZA Y TELARAÑA) */}
          <div className="grid grid-cols-4 gap-2 my-auto p-1">
            {cards.map((card) => {
              const isRevealed = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.instanceId}
                  type="button"
                  onClick={() => handleCardClick(card)}
                  disabled={card.isMatched || isProcessingMatch || hasWon}
                  className={`aspect-square rounded-2xl select-none transition-all duration-300 transform perspective-500 cursor-pointer ${
                    card.isMatched
                      ? "ring-2 ring-emerald-400 scale-98 shadow-md"
                      : "hover:scale-104 active:scale-95"
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-2xl flex items-center justify-center border-2 transition-all ${
                      isRevealed
                        ? "bg-white text-slate-900 border-white shadow-lg"
                        : "bg-gradient-to-b from-[#ea580c] via-[#c2410c] to-[#9a3412] border-amber-300/80 shadow-md"
                    }`}
                  >
                    {isRevealed ? (
                      <span className="text-3xl animate-scale-up filter drop-shadow">
                        {card.emoji}
                      </span>
                    ) : (
                      <div className="flex flex-col items-center justify-center opacity-90">
                        <span className="text-xl filter drop-shadow">🎃</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Puntos paginadores inferiores o botón de victoria */}
          {hasWon ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleClaimReward}
                className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:brightness-110 active:scale-98 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-white" />
                <span>¡TODAS LAS PAREJAS! RECLAMAR PREMIO</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-1 text-xs text-purple-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="w-2 h-2 rounded-full bg-purple-700" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
}

export function StepMemoryGame({
  onWinPrize,
  onSecondChance,
  initialSettings,
  tableNumber = "Mesa 1",
  participantName = "Comensal VIP",
}: StepMemoryGameProps) {
  const settings: MemoryGameSettings = {
    ...DEFAULT_MEMORY_SETTINGS,
    ...initialSettings,
  };

  const theme: MemoryThemePreset =
    MEMORY_THEMES[settings.activeThemeId] || MEMORY_THEMES.halloween;

  // Estados del juego
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
  };

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
    <div className="w-full max-w-md mx-auto">
      {/* ============================================================ */}
      {/* 1. PANTALLA DE BIENVENIDA (ESTILO EXACTO TELÉFONO IZQUIERDO) */}
      {/* ============================================================ */}
      {gameState === "welcome" && (
        <div className="relative rounded-3xl overflow-hidden border border-[#363439] shadow-2xl bg-gradient-to-b from-[#21092e] via-[#1a0826] to-[#0d0414] text-center p-6 sm:p-8 flex flex-col items-center justify-between min-h-[560px]">
          {/* Ilustración de fondo con luna y castillo de Halloween */}
          <div className="absolute top-4 right-6 w-20 h-20 rounded-full bg-gradient-to-br from-[#fff7b2] to-[#f59e0b] opacity-85 blur-xs shadow-[0_0_40px_rgba(245,158,11,0.6)] pointer-events-none" />
          <div className="absolute top-10 left-6 text-xl opacity-60 animate-pulse">🦇</div>
          <div className="absolute top-16 right-20 text-sm opacity-50">🦇</div>

          {/* Fantasmita Flotante */}
          <div className="relative z-10 pt-4 flex flex-col items-center">
            <div className="text-7xl mb-2 filter drop-shadow-[0_8px_16px_rgba(255,255,255,0.3)] animate-bounce">
              👻
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#ffddb1] bg-[#ffddb1]/15 px-3 py-1 rounded-full border border-[#ffddb1]/30">
              Especial de Temporada
            </span>
          </div>

          {/* Título & Mensaje */}
          <div className="relative z-10 space-y-3 my-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white font-['Epilogue'] tracking-tight drop-shadow-md leading-tight">
              {theme.bannerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#ffddb1]/90 max-w-xs mx-auto leading-relaxed font-medium">
              {theme.bannerSubtitle}
            </p>
          </div>

          {/* Botón Grande ¡JUGAR! (Fucsia Magenta llamativo de la imagen) */}
          <div className="relative z-10 w-full space-y-4">
            <button
              type="button"
              onClick={handleStartGame}
              className="w-full py-4 px-6 rounded-full text-white font-black text-base uppercase tracking-wider transition-all duration-200 transform hover:scale-102 active:scale-98 shadow-[0_8px_25px_rgba(255,0,127,0.5)] cursor-pointer flex items-center justify-center gap-2"
              style={{
                backgroundColor: theme.accentColor,
              }}
            >
              <Sparkles className="w-5 h-5 text-white animate-spin" />
              <span>{theme.buttonText}</span>
            </button>

            {/* Calabaza iluminada al pie */}
            <div className="flex items-center justify-center gap-2 text-3xl">
              <span>🎃</span>
              <span className="text-xs text-[#ccc3d8] font-semibold">Premio asegurado para ganadores</span>
              <span>🎃</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. PANTALLA DE JUEGO (ESTILO EXACTO TELÉFONO DERECHO) */}
      {/* ============================================================ */}
      {gameState === "playing" && (
        <div className="rounded-3xl border border-[#363439] bg-[#140b1c] p-4 sm:p-5 shadow-2xl space-y-4">
          {/* BARRA SUPERIOR DE TIEMPO Y PUNTUACIÓN */}
          <div className="bg-[#24112e] border border-[#3f1f4f] rounded-2xl p-3 flex items-center justify-between shadow-inner">
            {/* Tiempo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ff7518]/20 border border-[#ff7518]/40 flex items-center justify-center text-[#ff7518]">
                <Timer className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-[#ccc3d8] block">Tiempo</span>
                <span className={`font-mono text-lg font-black ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-white"}`}>
                  {timeLeft.toFixed(1)}s
                </span>
              </div>
            </div>

            {/* Puntuación */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#f2be71]/20 border border-[#f2be71]/40 flex items-center justify-center text-[#f2be71]">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-[#ccc3d8] block">Puntuación</span>
                <span className="font-mono text-lg font-black text-[#f2be71]">
                  {score}
                </span>
              </div>
            </div>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-8 h-8 rounded-lg bg-[#140b1c] border border-[#3f1f4f] flex items-center justify-center text-[#ccc3d8] hover:text-white cursor-pointer"
              title={soundEnabled ? "Silenciar" : "Activar sonido"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#ff007f]" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>
          </div>

          {/* CUADRÍCULA 4x4 DE 16 CARTAS CON EFECTO 3D */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 py-1">
            {cards.map((card) => {
              const isRevealed = card.isFlipped || card.isMatched;

              return (
                <div
                  key={card.instanceId}
                  onClick={() => handleCardClick(card)}
                  className={`aspect-square rounded-2xl cursor-pointer select-none transition-all duration-300 transform perspective-500 ${
                    card.isMatched
                      ? "ring-2 ring-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      : "hover:scale-103 active:scale-95"
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                      isRevealed
                        ? "bg-white text-neutral-900 border-2 border-white"
                        : "border-2"
                    }`}
                    style={{
                      backgroundColor: isRevealed ? (card.color || "#ffffff") : theme.cardBackBg,
                      borderColor: isRevealed ? (card.color || "#ffffff") : theme.cardBackBorder,
                    }}
                  >
                    {isRevealed ? (
                      <span className="text-3xl sm:text-4xl animate-scale-up filter drop-shadow">
                        {card.emoji}
                      </span>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl filter drop-shadow opacity-95">
                          {theme.cardBackIcon}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* BARRA DE PROGRESO DE PAREJAS */}
          <div className="flex items-center justify-between text-xs text-[#ccc3d8] px-1 pt-1">
            <span>
              Parejas: <strong className="text-[#ffddb1]">{matchesFound}</strong> / {settings.pairsCount || 8}
            </span>
            {streak > 1 && (
              <span className="text-[#ff007f] font-bold flex items-center gap-1 animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                <span>¡Racha x{streak}!</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. PANTALLA DE VICTORIA */}
      {/* ============================================================ */}
      {gameState === "won" && (
        <div className="rounded-3xl border border-[#f2be71]/40 bg-gradient-to-b from-[#2a1738] via-[#1c0f26] to-[#0f0714] p-6 sm:p-8 text-center shadow-2xl space-y-5 animate-scale-up">
          <div className="text-6xl animate-bounce">🎉</div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#f2be71] bg-[#f2be71]/15 px-3 py-1 rounded-full border border-[#f2be71]/30">
              ¡Misión Cumplida!
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-['Epilogue']">
              ¡Memoria Espeluznante!
            </h3>
            <p className="text-xs text-[#ccc3d8] max-w-xs mx-auto">
              Encontraste todas las parejas en récord de tiempo y desbloqueaste tu premio en mesa.
            </p>
          </div>

          {/* Tarjeta de Resumen */}
          <div className="bg-[#24112e] border border-[#3f1f4f] rounded-2xl p-4 grid grid-cols-2 gap-3 text-left">
            <div>
              <span className="text-[10px] uppercase text-[#ccc3d8] block">Puntuación Final</span>
              <span className="font-mono text-xl font-bold text-[#f2be71]">{score} pts</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#ccc3d8] block">Tiempo Sobrante</span>
              <span className="font-mono text-xl font-bold text-[#10b981]">{timeLeft.toFixed(1)}s</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-[#3f1f4f]">
              <span className="text-[10px] uppercase text-[#ccc3d8] block">Premio Ganado</span>
              <span className="text-sm font-bold text-[#ffddb1] flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#f2be71]" />
                <span>{settings.rewardPrizeName}</span>
              </span>
            </div>
          </div>

          {/* Botón Reclamar */}
          <button
            type="button"
            onClick={handleClaimReward}
            className="w-full py-4 px-6 rounded-full text-white font-black text-sm uppercase tracking-wider transition-all shadow-[0_8px_25px_rgba(255,0,127,0.4)] cursor-pointer flex items-center justify-center gap-2 hover:brightness-105 active:scale-98"
            style={{ backgroundColor: theme.accentColor }}
          >
            <span>Ver Mi Voucher de Premio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. PANTALLA DE TIEMPO AGOTADO (TIMEOUT) */}
      {/* ============================================================ */}
      {gameState === "timeout" && (
        <div className="rounded-3xl border border-red-500/40 bg-[#1f0b12] p-6 sm:p-8 text-center shadow-2xl space-y-4 animate-scale-up">
          <div className="text-6xl animate-pulse">⏰</div>
          <h3 className="text-2xl font-black text-white font-['Epilogue']">
            ¡Se acabó el tiempo!
          </h3>
          <p className="text-xs text-[#ccc3d8]">
            Estuviste muy cerca. Lograste encontrar {matchesFound} de {settings.pairsCount || 8} parejas.
          </p>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleStartGame}
              className="w-full py-3.5 px-5 rounded-full bg-[#f2be71] text-[#121115] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:brightness-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Intentar de Nuevo</span>
            </button>

            {onSecondChance && (
              <button
                type="button"
                onClick={onSecondChance}
                className="w-full py-3 px-4 rounded-full bg-[#201f23] border border-[#363439] text-[#ccc3d8] hover:text-white text-xs font-semibold cursor-pointer"
              >
                Desbloquear 2ª Oportunidad en WhatsApp
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  PickAndWinSettings,
  DEFAULT_PICK_AND_WIN_SETTINGS,
  PICK_AND_WIN_THEMES,
  PickItem,
  pickAudio,
} from "@/lib/pickAndWinData";
import { Sparkles, Trophy, RotateCcw, Volume2, VolumeX, CheckCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import confetti from "canvas-confetti";

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
}

export function StepPickAndWin({
  participantName = "Invitado",
  tableNumber = "Mesa 1",
  onWinPrize,
  customSettings,
  isStandAlone = false,
}: StepPickAndWinProps) {
  const [settings] = useState<PickAndWinSettings>(() => ({
    ...DEFAULT_PICK_AND_WIN_SETTINGS,
    ...customSettings,
  }));

  const theme = PICK_AND_WIN_THEMES[settings.themeId] || PICK_AND_WIN_THEMES.dia_de_muertos;

  // Estados del juego: "welcome" | "playing" | "won" | "gameover"
  const [gameState, setGameState] = useState<"welcome" | "playing" | "won" | "gameover">("welcome");
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(settings.maxAttempts);
  const [attemptHistory, setAttemptHistory] = useState<boolean[]>([]); // true = acierto, false = fallo
  const [revealedItemsCount, setRevealedItemsCount] = useState<Record<string, number>>({});
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Inicializar tablero 3x3 (9 casillas) con 3 premios garantizados en la baraja
  const setupBoard = () => {
    const prizeItem = theme.items.find((i) => i.isPrize) || theme.items[0];
    const otherItems = theme.items.filter((i) => !i.isPrize);

    // Creamos 9 casillas: exactamente 3 premios para que sea posible ganar
    const deckItems: PickItem[] = [
      prizeItem,
      prizeItem,
      prizeItem,
    ];

    // Llenamos las 6 restantes con distractores (calaveras, huesos, velas)
    while (deckItems.length < 9) {
      const randomOther = otherItems[Math.floor(Math.random() * otherItems.length)] || theme.items[1];
      deckItems.push(randomOther);
    }

    // Barajar aleatoriamente
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
    setAttemptHistory([]);
    setRevealedItemsCount({});
    setIsProcessing(false);
  };

  const handleStart = () => {
    setupBoard();
    setGameState("playing");
  };

  // Manejo de clic en casilla
  const handleTileClick = (tile: TileState) => {
    if (gameState !== "playing" || tile.isRevealed || isProcessing || attemptsLeft <= 0) return;

    setIsProcessing(true);
    if (soundEnabled) pickAudio.playOpenTile();

    // Revelar casilla
    const newTiles = tiles.map((t) => (t.index === tile.index ? { ...t, isRevealed: true } : t));
    setTiles(newTiles);

    const isMatch = tile.item.isPrize;
    const newHistory = [...attemptHistory, isMatch];
    setAttemptHistory(newHistory);

    if (isMatch) {
      if (soundEnabled) pickAudio.playFoundTarget();
    } else {
      if (soundEnabled) pickAudio.playMiss();
    }

    // Actualizar conteo de elementos descubiertos
    const newCount = {
      ...revealedItemsCount,
      [tile.item.id]: (revealedItemsCount[tile.item.id] || 0) + 1,
    };
    setRevealedItemsCount(newCount);

    const currentMatches = newCount[tile.item.id] || 0;

    // Verificar si ya completó los 3 iguales
    if (currentMatches >= theme.targetCount) {
      setTimeout(() => {
        setGameState("won");
        if (soundEnabled) pickAudio.playVictory();
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: [theme.accentColor, "#fbbf24", "#ea580c", "#ffffff"],
        });
        setIsProcessing(false);
      }, 700);
      return;
    }

    // Restar un intento
    const newAttempts = attemptsLeft - 1;
    setAttemptsLeft(newAttempts);

    if (newAttempts <= 0) {
      setTimeout(() => {
        setGameState("gameover");
        setIsProcessing(false);
      }, 800);
    } else {
      setTimeout(() => {
        setIsProcessing(false);
      }, 350);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ============================================================ */}
      {/* 1. PANTALLA DE BIENVENIDA (PORTADA DÍA DE MUERTOS)           */}
      {/* ============================================================ */}
      {gameState === "welcome" && (
        <div className="relative rounded-3xl overflow-hidden border border-[#363439] shadow-2xl bg-gradient-to-b from-[#120617] via-[#1a0820] to-[#0a030c] text-center p-6 sm:p-7 flex flex-col items-center justify-between min-h-[580px]">
          {/* Banderines de Papel Picado Mexicano Superior */}
          <div className="absolute top-0 left-0 right-0 h-10 flex justify-between px-2 overflow-hidden pointer-events-none opacity-90">
            {["#ea580c", "#e6007e", "#fbbf24", "#a855f7", "#10b981", "#ea580c"].map((color, idx) => (
              <div
                key={idx}
                className="w-12 h-8 rounded-b-lg border-b border-x shadow-md flex items-center justify-center text-[10px]"
                style={{ backgroundColor: color, borderColor: `${color}99` }}
              >
                🏵️
              </div>
            ))}
          </div>

          {/* Guirnalda floral superior */}
          <div className="relative z-10 pt-8 flex items-center justify-center gap-2 text-sm text-[#fbbf24]">
            <span>🏵️</span>
            <span>✨</span>
            <span className="text-[11px] uppercase tracking-widest font-black text-[#ffddb1]">
              Celebración Especial
            </span>
            <span>✨</span>
            <span>🏵️</span>
          </div>

          {/* Ilustración Central: Frasco / Premio con Calavera de Azúcar y Velas */}
          <div className="relative z-10 my-4 flex items-center justify-center">
            {/* Velas encendidas a los lados */}
            <div className="absolute -left-10 text-3xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-pulse">
              🕯️
            </div>

            {/* Frasco / Trofeo Dorado con Calavera Mexicana */}
            <div className="relative w-36 h-44 rounded-3xl bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] p-1 shadow-[0_0_40px_rgba(245,158,11,0.6)] flex items-center justify-center border-2 border-[#fef08a]">
              <div className="w-full h-full rounded-[22px] bg-[#220d2a] flex flex-col items-center justify-center p-3 relative overflow-hidden">
                <span className="text-6xl filter drop-shadow-[0_8px_16px_rgba(230,0,126,0.6)] mb-1">
                  💀
                </span>
                <span className="text-xs font-black text-[#fbbf24] uppercase tracking-wider">
                  Día de Muertos
                </span>
              </div>
            </div>

            <div className="absolute -right-10 text-3xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-pulse">
              🕯️
            </div>
          </div>

          {/* Título y Mensaje de Bienvenida */}
          <div className="relative z-10 space-y-2 mb-4">
            <h2 className="text-3xl font-black text-white font-['Epilogue'] tracking-tight drop-shadow-md">
              {theme.bannerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#ffddb1] leading-relaxed max-w-xs mx-auto font-medium">
              {theme.bannerSubtitle}
            </p>
          </div>

          {/* Botón Magenta Llamativo con Flores: 🌸 PARTICIPA 🌸 */}
          <div className="relative z-10 w-full space-y-3">
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-4 px-6 rounded-full text-white font-black text-sm uppercase tracking-wider transition-all duration-200 transform hover:scale-102 active:scale-98 shadow-[0_8px_25px_rgba(230,0,126,0.6)] cursor-pointer flex items-center justify-center gap-2 border-2 border-white/20"
              style={{ backgroundColor: theme.accentColor }}
            >
              <span>{theme.buttonText}</span>
            </button>

            {/* Cenefa floral al pie */}
            <div className="flex items-center justify-center gap-2 text-xl pt-1">
              <span>🏵️</span>
              <span className="text-[11px] text-[#ccc3d8] font-semibold">Descubre 3 figuras iguales y gana</span>
              <span>🏵️</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. PANTALLA DE JUEGO EN VIVO (TABLERO 3x3 CON CENEFAS)       */}
      {/* ============================================================ */}
      {gameState === "playing" && (
        <div className="rounded-3xl border border-[#363439] bg-[#120716] p-4 sm:p-5 shadow-2xl space-y-4">
          {/* GUIRNALDA Y CABECERA DEL RETO */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#fbbf24]">
              <span>🏵️</span>
              <span className="font-bold uppercase tracking-widest text-[11px] text-[#ffddb1]">
                {theme.instructionText}
              </span>
              <span>🏵️</span>
            </div>

            {/* BARRA DE INTENTOS CON INDICADORES (👍 / 👎) */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {Array.from({ length: settings.maxAttempts }).map((_, idx) => {
                const hasPlayed = idx < attemptHistory.length;
                const wasSuccess = hasPlayed ? attemptHistory[idx] : null;

                return (
                  <div
                    key={idx}
                    className={`w-12 h-9 rounded-xl flex items-center justify-center border font-bold text-sm shadow-md transition-all ${
                      hasPlayed
                        ? wasSuccess
                          ? "bg-[#10b981] border-[#10b981] text-white"
                          : "bg-[#ef4444] border-[#ef4444] text-white"
                        : "bg-[#25152a] border-[#3f1f4f] text-[#ccc3d8]"
                    }`}
                  >
                    {hasPlayed ? (
                      wasSuccess ? (
                        <ThumbsUp className="w-4 h-4 text-white" />
                      ) : (
                        <ThumbsDown className="w-4 h-4 text-white" />
                      )
                    ) : (
                      <span className="text-xs font-mono font-bold text-[#ffddb1]">#{idx + 1}</span>
                    )}
                  </div>
                );
              })}

              {/* Botón de Sonido */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-9 h-9 rounded-xl bg-[#25152a] border border-[#3f1f4f] flex items-center justify-center text-[#ccc3d8] hover:text-white cursor-pointer ml-1"
                title={soundEnabled ? "Silenciar" : "Activar sonido"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#e6007e]" />
                ) : (
                  <VolumeX className="w-4 h-4 opacity-50" />
                )}
              </button>
            </div>
          </div>

          {/* TABLERO 3x3 CON MARCO FESTIVO MEXICANO (NARANJA & AMARILLO) */}
          <div
            className="rounded-3xl p-3 sm:p-4 border-4 shadow-2xl relative overflow-hidden"
            style={{
              backgroundColor: theme.boardBg,
              borderColor: theme.boardBorder,
            }}
          >
            {/* Esquinas decoradas estilo papel picado */}
            <div className="absolute top-1 left-1 text-xs opacity-75">🏵️</div>
            <div className="absolute top-1 right-1 text-xs opacity-75">🏵️</div>
            <div className="absolute bottom-1 left-1 text-xs opacity-75">🏵️</div>
            <div className="absolute bottom-1 right-1 text-xs opacity-75">🏵️</div>

            {/* CUADRÍCULA 3x3 DE 9 CASILLAS */}
            <div className="grid grid-cols-3 gap-3 p-1">
              {tiles.map((tile) => (
                <button
                  key={tile.index}
                  type="button"
                  onClick={() => handleTileClick(tile)}
                  disabled={tile.isRevealed || isProcessing}
                  className={`aspect-square rounded-2xl select-none transition-all duration-300 transform perspective-500 cursor-pointer ${
                    tile.isRevealed
                      ? "rotate-y-180 scale-100 shadow-lg"
                      : "hover:scale-104 active:scale-95 shadow-md hover:brightness-110"
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-2xl flex items-center justify-center border-2 transition-all ${
                      tile.isRevealed
                        ? "bg-white text-neutral-900 border-white shadow-xl"
                        : "bg-[#25112e] border-[#fbbf24]/50 shadow-inner"
                    }`}
                    style={{
                      backgroundColor: tile.isRevealed ? (tile.item.color || "#ffffff") : "#2b1036",
                    }}
                  >
                    {tile.isRevealed ? (
                      <span className="text-4xl animate-scale-up filter drop-shadow">
                        {tile.item.emoji}
                      </span>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)] animate-pulse">
                          {theme.coverPattern}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resumen de aciertos */}
          <div className="flex items-center justify-between text-xs text-[#ccc3d8] px-2 pt-1 font-medium">
            <span>
              Intentos restantes: <strong className="text-[#fbbf24]">{attemptsLeft}</strong> de {settings.maxAttempts}
            </span>
            <span className="text-[#ffddb1] flex items-center gap-1 font-bold">
              <span>🎯 Objetivo: 3 iguales</span>
            </span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. PANTALLA DE VICTORIA (¡3 IGUALES ENCONTRADOS!)           */}
      {/* ============================================================ */}
      {gameState === "won" && (
        <div className="rounded-3xl border border-[#fbbf24]/60 bg-gradient-to-b from-[#2e1038] via-[#1f0b26] to-[#0f0514] p-6 sm:p-7 text-center shadow-2xl space-y-5 animate-scale-up">
          <div className="text-6xl animate-bounce">🏵️✨🎉</div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#fbbf24] bg-[#fbbf24]/20 px-3 py-1 rounded-full border border-[#fbbf24]/40">
              ¡Premio Desbloqueado!
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-['Epilogue']">
              ¡Felicidades, {participantName}!
            </h3>
            <p className="text-xs text-[#ffddb1]">
              Tu intuición no falló. Has encontrado las 3 figuras ganadoras.
            </p>
          </div>

          {/* Tarjeta de Premio */}
          <div className="bg-[#1b0a21] border border-[#fbbf24]/40 rounded-2xl p-4 space-y-1 shadow-inner">
            <span className="text-[10px] uppercase text-[#ccc3d8] font-bold block">Premio Especial Ganado</span>
            <span className="text-base font-black text-[#fbbf24] block">
              {settings.rewardPrizeName}
            </span>
            <span className="text-xs font-mono font-bold text-[#e6007e]">
              Valor: {settings.rewardPrizeValue}
            </span>
          </div>

          {/* Botón Reclamar Voucher */}
          <button
            type="button"
            onClick={() => onWinPrize(settings.rewardPrizeName, settings.rewardPrizeValue)}
            className="w-full py-4 px-6 rounded-full text-white font-black text-sm uppercase tracking-wider transition-all duration-200 transform hover:scale-102 active:scale-98 shadow-[0_8px_25px_rgba(230,0,126,0.6)] cursor-pointer flex items-center justify-center gap-2 border border-white/20"
            style={{ backgroundColor: theme.accentColor }}
          >
            <Trophy className="w-5 h-5 text-white" />
            <span>Reclamar mi Voucher en Caja</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. PANTALLA DE INTENTOS AGOTADOS                             */}
      {/* ============================================================ */}
      {gameState === "gameover" && (
        <div className="rounded-3xl border border-[#363439] bg-[#1a0c20] p-6 text-center shadow-2xl space-y-5 animate-scale-up">
          <div className="text-5xl">🥀</div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white font-['Epilogue']">
              ¡Estuviste muy cerca!
            </h3>
            <p className="text-xs text-[#ccc3d8] max-w-xs mx-auto">
              Se han agotado los {settings.maxAttempts} intentos de esta partida. ¡No te preocupes, puedes volver a intentarlo!
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3.5 px-6 rounded-full text-[#121115] bg-[#fbbf24] font-black text-xs uppercase tracking-wider hover:brightness-105 active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar Otra Partida</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import {
  TableSession,
  ParticipantData,
  FeedbackData,
  InstagramEvidence,
  GamePrize,
  WonPrize,
  DEFAULT_PRIZES,
} from "./components/qr-game/gameTypes";
import { GameHeader } from "./components/qr-game/GameHeader";
import { StepFeedback } from "./components/qr-game/StepFeedback";
import { StepUserData } from "./components/qr-game/StepUserData";
import { StepInstagramStory } from "./components/qr-game/StepInstagramStory";
import { StepRouletteWheel } from "./components/qr-game/StepRouletteWheel";
import { StepPrecisionTimer } from "./components/qr-game/StepPrecisionTimer";
import { StepPrizeClaim } from "./components/qr-game/StepPrizeClaim";
import { AdminPanelModal } from "./components/qr-game/AdminPanelModal";
import { PinAuthModal } from "./components/qr-game/PinAuthModal";
import { TableStandModal } from "./components/qr-game/TableStandModal";
import { recordPageView, getStoredHistory, saveStoredHistory } from "./lib/analyticsService";
import { ComposioService } from "./lib/composioService";
import { OneSignalService } from "./lib/oneSignalService";
import { SupabaseService } from "./lib/supabaseService";
import { TableManagerService } from "./lib/tableManagerService";
import { GameConfigService } from "./lib/gameConfigService";
import { GameConfig } from "./components/qr-game/gameTypes";
import { MessageCircle, Sparkles, Timer, RotateCcw } from "lucide-react";
import { site } from "./data/site";
import { clientConfig } from "./config/clientConfig";

function getInitialTable(): string {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const modo = params.get("modo");
    if (modo === "caja") return "Punto de Pago / Caja";
    const mesa = params.get("mesa");
    const token = params.get("token");
    if (mesa) {
      const cleanMesa = mesa.replace(/[^0-9a-zA-Z]/g, "");
      return token ? `Mesa ${cleanMesa} (Seguridad #${token})` : `Mesa ${cleanMesa}`;
    }
  }
  return "Mesa 1 (QR Presencial)";
}

function createInitialSession(tableNum = getInitialTable()): TableSession {
  return {
    id: `SES-${Date.now().toString(36).toUpperCase()}`,
    tableNumber: tableNum,
    createdAt: Date.now(),
    expiresAt: Date.now() + 20 * 60 * 1000, // 20 minutos de vigencia
    status: "active",
  };
}

function JuegoQrPage() {
  const { t } = useLanguage();

  // Modo activo: 'game' (jugar primero) o 'feedback' (solo calificar)
  const [activeMode, setActiveMode] = useState<"game" | "feedback">("game");

  // Estados del juego
  const [session, setSession] = useState<TableSession>(() => createInitialSession());
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [feedback, setFeedback] = useState<FeedbackData | undefined>();
  const [participant, setParticipant] = useState<ParticipantData | undefined>();
  const [instagramEvidence, setInstagramEvidence] = useState<InstagramEvidence | undefined>();
  const [prizes, setPrizes] = useState<GamePrize[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("juegoreferidos_custom_prizes");
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return DEFAULT_PRIZES;
  });
  const [wonPrize, setWonPrize] = useState<WonPrize | null>(null);
  const [history, setHistory] = useState<WonPrize[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isTableStandOpen, setIsTableStandOpen] = useState<boolean>(false);

  // Configuración de modalidad de juego activa (Ruleta vs Precisión 10s vs Híbrido)
  const [gameConfig, setGameConfig] = useState<GameConfig>(() => GameConfigService.getGameConfig());
  const [chosenGameMode, setChosenGameMode] = useState<"roulette" | "precision" | null>(null);

  // Registrar visita, cargar historial persistente y sincronizar configuración de juego
  useEffect(() => {
    recordPageView();
    OneSignalService.init();

    const stored = getStoredHistory();
    if (stored && stored.length > 0) {
      setHistory(stored);
    }

    // Sincronizar configuración en vivo con el backend
    GameConfigService.syncFromBackend().then((cfg) => {
      if (cfg) setGameConfig(cfg);
    });

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      // Atajos para probar directamente el nuevo juego
      if (params.get("juego") === "precision" || params.get("test") === "precision" || params.get("paso") === "3") {
        sessionStorage.removeItem("juego_won_prize");
        setChosenGameMode("precision");
        setCurrentStep(3);
        return;
      }
      if (params.get("reset") === "1") {
        sessionStorage.removeItem("juego_won_prize");
        setCurrentStep(1);
        return;
      }
    }

    try {
      const savedPrize = sessionStorage.getItem("juego_won_prize");
      if (savedPrize) {
        const parsed = JSON.parse(savedPrize) as WonPrize;
        setWonPrize(parsed);
        setCurrentStep(4);
      }
    } catch {
      // Ignorar errores de parseo
    }

    // Escuchar cambios reactivos en la configuración de juego desde el backend o modal
    const handleConfigChange = (e: Event) => {
      const customEvent = e as CustomEvent<GameConfig>;
      if (customEvent.detail) {
        setGameConfig(customEvent.detail);
      }
    };
    window.addEventListener("game-config-changed", handleConfigChange);
    return () => window.removeEventListener("game-config-changed", handleConfigChange);
  }, []);

  // Helper para identificar número de mesa (1 a 10)
  const getTableNum = (tableStr: string): number => {
    const match = tableStr.match(/\d+/);
    const n = match ? parseInt(match[0], 10) : 1;
    return n >= 1 && n <= 10 ? n : 1;
  };

  // Generar nueva sesión para simular otra mesa o nuevo comensal
  const handleResetSession = () => {
    const tNum = getTableNum(session.tableNumber);
    TableManagerService.resetTable(tNum);
    setSession(createInitialSession());
    setCurrentStep(1);
    setChosenGameMode(null);
    setFeedback(undefined);
    setParticipant(undefined);
    setInstagramEvidence(undefined);
    setWonPrize(null);
    try {
      sessionStorage.removeItem("juego_won_prize");
    } catch {
      // ignore
    }
  };

  // Guardar configuración de premios de forma permanente
  const handleUpdatePrizes = (newPrizes: GamePrize[]) => {
    setPrizes(newPrizes);
    try {
      localStorage.setItem("juegoreferidos_custom_prizes", JSON.stringify(newPrizes));
    } catch {
      // ignore
    }
  };

  // PASO 1 -> PASO 2 (Tus Datos -> Instagram)
  const handleUserDataComplete = (data: ParticipantData) => {
    // 🛡️ CONTROL ANTI-FRAUDE: 1 SOLO GIRO POR PERSONA / POR DÍA
    const now = Date.now();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const cleanWhatsapp = data.whatsapp.replace(/\D/g, "");

    const existingActivePrize = history.find(
      (h) =>
        h.participantWhatsapp === cleanWhatsapp &&
        h.createdAt &&
        now - h.createdAt < twentyFourHoursMs
    );

    if (existingActivePrize) {
      const wantReplay = confirm(
        `¡Hola, ${data.fullName}! Tienes un premio registrado hoy: "${existingActivePrize.prizeName}".\n\n¿Deseas probar y jugar el nuevo juego de todos modos en esta prueba? Presiona "Aceptar" para probar o "Cancelar" para ver tu cupón.`
      );
      if (wantReplay) {
        setParticipant(data);
        setCurrentStep(3);
        setChosenGameMode(gameConfig.gameMode === "roulette" ? "roulette" : "precision");
        return;
      }
      setWonPrize(existingActivePrize);
      setCurrentStep(4);
      return;
    }

    setParticipant(data);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Actualizar variable de la mesa en tiempo real
    const tNum = getTableNum(session.tableNumber);
    TableManagerService.updateTableStatus(tNum, "JUGANDO", {
      currentCustomer: data.fullName,
      currentWhatsapp: cleanWhatsapp,
      activeSessionId: session.id,
      startedAt: "Ahora",
    });
  };

  // PASO 2 -> PASO 3 (Instagram -> Ruleta)
  const handleInstagramComplete = (data: InstagramEvidence) => {
    setInstagramEvidence(data);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // PASO 3 -> PASO 4 (Ruleta -> Premio ganado)
  const handlePrizeWon = (prize: GamePrize) => {
    const brandPrefix = clientConfig.brand.name.replace(/[^a-zA-Z]/g, "").substring(0, 4).toUpperCase() || "PREMIO";
    const randomCode = `${brandPrefix}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const dateStr = new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newWon: WonPrize = {
      uniqueCode: randomCode,
      prizeId: prize.id,
      prizeName: prize.name,
      prizeNameEn: prize.nameEn,
      value: prize.value,
      tableNumber: session.tableNumber,
      participantName: participant?.fullName || "Cliente de la Casa",
      participantWhatsapp: participant?.whatsapp || "573000000000",
      participantEmail: participant?.email || "",
      birthDate: participant?.birthDate || "",
      wonAt: dateStr,
      createdAt: Date.now(),
      status: "DISPONIBLE",
    };

    setWonPrize(newWon);
    setHistory((prev) => {
      const updated = [newWon, ...prev];
      saveStoredHistory(updated);
      return updated;
    });
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Actualizar variable de la mesa a PREMIO PENDIENTE
    const tNum = getTableNum(session.tableNumber);
    TableManagerService.updateTableStatus(tNum, "PREMIO_PENDIENTE", {
      currentCustomer: newWon.participantName,
      currentWhatsapp: newWon.participantWhatsapp,
      prizeWon: newWon.prizeName,
      uniqueCode: newWon.uniqueCode,
      activeSessionId: session.id,
    });

    // Guardar en sessionStorage para protegerlo de F5
    try {
      sessionStorage.setItem("juego_won_prize", JSON.stringify(newWon));
    } catch {
      // ignore
    }

    // Sincronizar premio ganado a través de Composio & Google Sheets
    ComposioService.recordWonPrize({
      fullName: newWon.participantName,
      whatsapp: newWon.participantWhatsapp,
      email: participant?.email || "N/A",
      instagramHandle: instagramEvidence?.instagramHandle || "N/A",
      prizeName: newWon.prizeName,
      uniqueCode: newWon.uniqueCode,
      wonAt: newWon.wonAt,
    }).catch(() => {});

    // Sincronizar también con Supabase (Opción 2)
    SupabaseService.recordWonPrize(newWon, 1).catch(() => {});
  };

  // Abrir modal de PIN al pulsar "Validar en caja"
  const handleOpenValidatePin = () => {
    setIsPinModalOpen(true);
  };

  // Validación de cobro en caja tras ingresar PIN correcto
  const handlePinSuccess = () => {
    if (!wonPrize) return;
    const dateStr = new Date().toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const updated: WonPrize = {
      ...wonPrize,
      status: "UTILIZADO",
      usedAt: dateStr,
    };

    setWonPrize(updated);
    setHistory((prev) => {
      const next = prev.map((h) => (h.uniqueCode === wonPrize.uniqueCode ? updated : h));
      saveStoredHistory(next);
      return next;
    });

    // Actualizar variable de la mesa a CANJEADO
    const tNum = getTableNum(session.tableNumber);
    TableManagerService.updateTableStatus(tNum, "CANJEADO", {
      status: "CANJEADO",
    });

    try {
      sessionStorage.setItem("juego_won_prize", JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Actualizar estado 'SÍ' en Google Sheets y Composio
    ComposioService.validateCashierPin(wonPrize.uniqueCode, "1978").catch(() => {});

    // Actualizar estado en Supabase
    SupabaseService.validateCashierPin(wonPrize.uniqueCode, (wonPrize.stamps || 1) + 1).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-neutral-900 flex flex-col selection:bg-amber-600/20 selection:text-amber-800">
      {/* Cabecera dinámica de la experiencia */}
      <GameHeader
        session={session}
        currentStep={currentStep}
        activeMode={activeMode}
        onChangeMode={setActiveMode}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onResetSession={handleResetSession}
        onOpenTableStand={() => setIsTableStandOpen(true)}
        onSelectStep={(step) => {
          setCurrentStep(step);
          if (step === 3 && !chosenGameMode) {
            setChosenGameMode(gameConfig.gameMode === "roulette" ? "roulette" : "precision");
          }
        }}
      />

      {/* Contenido principal según el modo seleccionado */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12">
        {activeMode === "feedback" ? (
          /* MODO DIRECTO: Solo calificar visita (Feedback inteligente) */
          <div>
            <StepFeedback
              initialFeedback={feedback}
              customerName={participant?.fullName}
              isStandAlone={true}
              onComplete={(fb) => setFeedback(fb)}
              onSwitchToGame={() => setActiveMode("game")}
            />
          </div>
        ) : (
          /* MODO JUEGO: Jugar la ruleta primero, ganar y luego dejar reseña como broche de oro */
          <div>
            {currentStep === 1 && (
              <div>
                <StepUserData
                  initialData={participant}
                  onBack={() => setActiveMode("feedback")}
                  onComplete={handleUserDataComplete}
                />

                {/* Alternativa rápida hacia solo calificar */}
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveMode("feedback")}
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-amber-700 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>
                      {t(
                        "¿Prefieres solo calificar tu visita sin jugar la ruleta? Toca aquí",
                        "Prefer to just rate your visit without playing? Click here"
                      )}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <StepInstagramStory
                participantName={participant?.fullName || "Cliente"}
                tableNumber={session.tableNumber}
                initialEvidence={instagramEvidence}
                onBack={() => setCurrentStep(1)}
                onComplete={handleInstagramComplete}
              />
            )}

            {currentStep === 3 && (
              <div>
                {/* 1. MODO DIRECTO: SOLO RULETA */}
                {gameConfig.gameMode === "roulette" && (
                  <StepRouletteWheel
                    prizes={prizes}
                    participantName={participant?.fullName || "Invitado"}
                    onPrizeWon={handlePrizeWon}
                  />
                )}

                {/* 2. MODO DIRECTO: SOLO RETO DE PRECISIÓN 10S */}
                {gameConfig.gameMode === "precision" && (
                  <StepPrecisionTimer
                    prizes={prizes}
                    participantName={participant?.fullName || "Invitado"}
                    onPrizeWon={handlePrizeWon}
                  />
                )}

                {/* 3. MODO HÍBRIDO / LIBRE ELECCIÓN POR EL COMENSAL */}
                {(gameConfig.gameMode === "hybrid" || gameConfig.gameMode === "stamps") && (
                  <div>
                    {chosenGameMode === "precision" ? (
                      <StepPrecisionTimer
                        prizes={prizes}
                        participantName={participant?.fullName || "Invitado"}
                        onPrizeWon={handlePrizeWon}
                        onSwitchToRoulette={() => setChosenGameMode("roulette")}
                      />
                    ) : chosenGameMode === "roulette" ? (
                      <div>
                        <div className="mb-4 text-center">
                          <button
                            type="button"
                            onClick={() => setChosenGameMode("precision")}
                            className="text-xs text-neutral-500 hover:text-amber-700 transition-colors inline-flex items-center gap-1.5"
                          >
                            <Timer className="h-3.5 w-3.5 text-amber-600" />
                            <span>
                              {t(
                                "¿Prefieres el Reto de Precisión 10s en vez de la ruleta? Toca aquí",
                                "Prefer the 10s Precision Challenge instead? Click here"
                              )}
                            </span>
                          </button>
                        </div>
                        <StepRouletteWheel
                          prizes={prizes}
                          participantName={participant?.fullName || "Invitado"}
                          onPrizeWon={handlePrizeWon}
                        />
                      </div>
                    ) : (
                      /* PANTALLA DE SELECCIÓN DE EXPERIENCIA EN MESA */
                      <div className="max-w-xl mx-auto py-4">
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-semibold mb-2">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{t("Experiencia Interactiva en Mesa", "Interactive Table Experience")}</span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
                            {t("¡Elige tu Desafío!", "Choose Your Challenge!")}
                          </h2>
                          <p className="text-sm text-neutral-600 mt-2 max-w-md mx-auto">
                            {t(
                              "¡Hola " + (participant?.fullName || "Invitado") + "! Selecciona cómo deseas obtener tu beneficio de la casa hoy:",
                              "Hello " + (participant?.fullName || "Guest") + "! Select how you'd like to get your house reward today:"
                            )}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Opción 1: Ruleta de la Fortuna */}
                          <button
                            type="button"
                            onClick={() => setChosenGameMode("roulette")}
                            className="group relative p-6 rounded-3xl bg-white border-2 border-neutral-200 hover:border-amber-500 hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between"
                          >
                            <div>
                              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                🎡
                              </div>
                              <h3 className="text-lg font-serif font-bold text-neutral-900 mb-1">
                                {t("Ruleta de la Fortuna", "Roulette of Fortune")}
                              </h3>
                              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                                {t(
                                  "Gira el disco dorado con sonido y animación realista. Emoción instantánea y beneficios directos.",
                                  "Spin the golden wheel with realistic sound effects. Instant excitement and rewards."
                                )}
                              </p>
                            </div>
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
                              <span>{t("Girar Ruleta", "Spin Wheel")}</span>
                              <span>→</span>
                            </div>
                          </button>

                          {/* Opción 2: Reto de Precisión 10s */}
                          <button
                            type="button"
                            onClick={() => setChosenGameMode("precision")}
                            className="group relative p-6 rounded-3xl bg-white border-2 border-neutral-200 hover:border-amber-500 hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between"
                          >
                            <div>
                              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                ⏱️
                              </div>
                              <h3 className="text-lg font-serif font-bold text-neutral-900 mb-1">
                                {t("Reto Precisión 10s", "10s Precision Challenge")}
                              </h3>
                              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                                {t(
                                  "Pon a prueba tus reflejos en la mesa. Detén el cronómetro exactamente en 10.000s para ganar.",
                                  "Test your reflexes at the table. Stop the timer at exactly 10.000s to win."
                                )}
                              </p>
                            </div>
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
                              <span>{t("Retar Cronómetro", "Challenge Timer")}</span>
                              <span>→</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && wonPrize && (
              <div className="space-y-6">
                <StepPrizeClaim
                  prize={wonPrize}
                  onValidateAtCashier={handleOpenValidatePin}
                />

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResetSession}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 border border-amber-500/40 text-amber-400 hover:bg-neutral-800 text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{t("🔄 Reiniciar y Probar Nuevo Juego en Mesa", "🔄 Reset and Try Another Table Game")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal del Teclado PIN para el Cajero o Mesero */}
      <PinAuthModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        correctPin="1978"
      />

      {/* Modal del Panel Administrativo */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        prizes={prizes}
        onUpdatePrizes={handleUpdatePrizes}
        history={history}
        onGenerateNewTable={handleResetSession}
      />

      {/* Modal de Arte y Ficha para Mesa / Caja */}
      <TableStandModal
        isOpen={isTableStandOpen}
        onClose={() => setIsTableStandOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <JuegoQrPage />
    </LanguageProvider>
  );
}

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
  GameConfig,
  SecondChanceConfig,
  DEFAULT_SECOND_CHANCE_CONFIG,
} from "./components/qr-game/gameTypes";
import { GameHeader } from "./components/qr-game/GameHeader";
import { StepFeedback } from "./components/qr-game/StepFeedback";
import { StepUserData } from "./components/qr-game/StepUserData";
import { StepInstagramStory } from "./components/qr-game/StepInstagramStory";
import { StepRouletteWheel } from "./components/qr-game/StepRouletteWheel";
import { StepPrecisionTimer } from "./components/qr-game/StepPrecisionTimer";
import { StepPrizeClaim } from "./components/qr-game/StepPrizeClaim";
import { StepSecondChanceShare } from "./components/qr-game/StepSecondChanceShare";
import { StepSecondChanceVerify } from "./components/qr-game/StepSecondChanceVerify";
import { StepSecondChancePrecision } from "./components/qr-game/StepSecondChancePrecision";
import { AdminPanelModal } from "./components/qr-game/AdminPanelModal";
import { PinAuthModal } from "./components/qr-game/PinAuthModal";
import { TableStandModal } from "./components/qr-game/TableStandModal";
import { MissionsModal } from "./components/qr-game/MissionsModal";
import { StepMissions } from "./components/qr-game/StepMissions";
import { PushNotificationPrompt } from "./components/qr-game/PushNotificationPrompt";
import { KioskCaptivePortalModal } from "./components/qr-game/KioskCaptivePortalModal";
import { recordPageView, getStoredHistory, saveStoredHistory } from "./lib/analyticsService";
import { ComposioService } from "./lib/composioService";
import { OneSignalService } from "./lib/oneSignalService";
import { SupabaseService } from "./lib/supabaseService";
import { TableManagerService } from "./lib/tableManagerService";
import { GameConfigService } from "./lib/gameConfigService";
import { SecondChanceService } from "./lib/secondChanceService";
import { MessageCircle, Sparkles, Timer, RotateCcw } from "lucide-react";
import { site } from "./data/site";
import { clientConfig } from "./config/clientConfig";

function getInitialTable(): string {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const modo = params.get("modo");
    if (modo === "caja") return "Punto de Pago / Caja";
    if (modo === "domicilio" || modo === "delivery" || params.get("mesa") === "domicilio") {
      return "🛵 Pedido a Domicilio / Takeout";
    }
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
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const requestedStep = params.get("paso");
      if (requestedStep && ["1", "2", "3", "4", "5", "6", "7"].includes(requestedStep)) {
        return parseInt(requestedStep, 10);
      }
      if (params.get("juego") === "precision" || params.get("test") === "precision") {
        return 3;
      }
      if (params.get("juego") === "ruleta" || params.get("test") === "ruleta") {
        return 3;
      }
      if (params.get("reset") === "1") {
        return 1;
      }
      try {
        const savedStep = sessionStorage.getItem("juego_current_step");
        if (savedStep) {
          const stepNum = parseInt(savedStep, 10);
          if (stepNum >= 1 && stepNum <= 7) return stepNum;
        }
      } catch {
        // ignore
      }
    }
    return 1;
  });
  const [feedback, setFeedback] = useState<FeedbackData | undefined>();
  const [participant, setParticipant] = useState<ParticipantData | undefined>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("juego_participant");
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return undefined;
  });
  const [instagramEvidence, setInstagramEvidence] = useState<InstagramEvidence | undefined>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("juego_instagram");
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return undefined;
  });
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
  const [wonPrize, setWonPrize] = useState<WonPrize | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPrize = sessionStorage.getItem("juego_won_prize");
        if (savedPrize) return JSON.parse(savedPrize) as WonPrize;
      } catch {
        // ignore
      }
    }
    return null;
  });
  const [history, setHistory] = useState<WonPrize[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isPushModalOpen, setIsPushModalOpen] = useState<boolean>(false);
  const [isKioskModalOpen, setIsKioskModalOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const path = window.location.pathname.toLowerCase();
      return (
        p.get("modo") === "wifi" ||
        p.get("modo") === "kiosko" ||
        p.get("modo") === "kiosk" ||
        p.get("kiosko") === "1" ||
        p.get("kiosk") === "1" ||
        p.has("kiosko") ||
        p.has("kiosk") ||
        p.get("portal") === "1" ||
        p.get("wifi") === "1" ||
        path.includes("kiosko") ||
        path.includes("kiosk")
      );
    }
    return false;
  });
  const [isTableStandOpen, setIsTableStandOpen] = useState<boolean>(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);

  // Sincronizar estados críticos con sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("juego_current_step", String(currentStep));
    } catch {}
  }, [currentStep]);

  useEffect(() => {
    try {
      if (participant) {
        sessionStorage.setItem("juego_participant", JSON.stringify(participant));
      } else {
        sessionStorage.removeItem("juego_participant");
      }
    } catch {}
  }, [participant]);

  useEffect(() => {
    try {
      if (instagramEvidence) {
        sessionStorage.setItem("juego_instagram", JSON.stringify(instagramEvidence));
      } else {
        sessionStorage.removeItem("juego_instagram");
      }
    } catch {}
  }, [instagramEvidence]);

  // Configuración de modalidad de juego activa (Ruleta vs Precisión 10s vs Híbrido)
  const [gameConfig, setGameConfig] = useState<GameConfig>(() => GameConfigService.getGameConfig());
  const [chosenGameMode, setChosenGameMode] = useState<"roulette" | "precision" | null>(null);

  // Configuración de Segunda Oportunidad (WhatsApp Status + Cronómetro de Precisión)
  const [secondChanceConfig, setSecondChanceConfig] = useState<SecondChanceConfig>(() =>
    SecondChanceService.getSecondChanceConfig()
  );

  // Registrar visita, cargar historial persistente y sincronizar configuración de juego
  useEffect(() => {
    recordPageView();
    OneSignalService.init();

    const stored = getStoredHistory();
    if (stored && stored.length > 0) {
      setHistory(stored);
    }

    // Sincronizar configuraciones en vivo con el backend al inicio y periódicamente
    const syncBackendConfig = () => {
      GameConfigService.syncFromBackend().then((cfg) => {
        if (cfg) setGameConfig(cfg);
      });
      SecondChanceService.syncFromBackend().then((sc) => {
        if (sc) setSecondChanceConfig(sc);
      });
    };
    syncBackendConfig();
    const pollInterval = setInterval(syncBackendConfig, 4000);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      // Atajos para probar directamente cada paso o juego
      const requestedStep = params.get("paso");
      if (requestedStep && ["1", "2", "3", "4", "5", "6", "7"].includes(requestedStep)) {
        setCurrentStep(parseInt(requestedStep, 10));
      } else if (params.get("juego") === "precision" || params.get("test") === "precision") {
        sessionStorage.removeItem("juego_won_prize");
        setChosenGameMode("precision");
        setCurrentStep(3);
      } else if (params.get("juego") === "ruleta" || params.get("test") === "ruleta") {
        sessionStorage.removeItem("juego_won_prize");
        setChosenGameMode("roulette");
        setCurrentStep(3);
      } else if (params.get("reset") === "1") {
        sessionStorage.removeItem("juego_won_prize");
        sessionStorage.removeItem("juego_participant");
        sessionStorage.removeItem("juego_current_step");
        sessionStorage.removeItem("juego_instagram");
        setCurrentStep(1);
      }
    }

    // Escuchar cambios reactivos en la configuración de juego desde el backend o modal
    const handleConfigChange = (e: Event) => {
      const customEvent = e as CustomEvent<GameConfig>;
      if (customEvent.detail) {
        setGameConfig(customEvent.detail);
      }
    };
    const handleSecondChanceChange = (e: Event) => {
      const customEvent = e as CustomEvent<SecondChanceConfig>;
      if (customEvent.detail) {
        setSecondChanceConfig(customEvent.detail);
      }
    };
    window.addEventListener("game-config-changed", handleConfigChange);
    window.addEventListener("second-chance-config-changed", handleSecondChanceChange);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("game-config-changed", handleConfigChange);
      window.removeEventListener("second-chance-config-changed", handleSecondChanceChange);
    };
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
      sessionStorage.removeItem("juego_participant");
      sessionStorage.removeItem("juego_current_step");
      sessionStorage.removeItem("juego_instagram");
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

  // PASO 1 (Tus Datos) -> PASO 2 (¡El Juego Elegido en el Backend!)
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
        `¡Hola, ${data.fullName}! Tienes un cupón registrado hoy: "${existingActivePrize.prizeName}".\n\n¿Deseas volver a jugar en esta prueba? Presiona "Aceptar" para probar o "Cancelar" para ver tu cupón.`
      );
      if (wantReplay) {
        setParticipant(data);
        setCurrentStep(2);
        return;
      }
      setWonPrize(existingActivePrize);
      setCurrentStep(3);
      return;
    }

    setParticipant(data);
    // PASO 2: INSTAGRAM Y REDES SOCIALES
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

  // PASO 2 -> PASO 3 (Instagram -> El Premio / Ruleta)
  const handleInstagramComplete = (data: InstagramEvidence) => {
    setInstagramEvidence(data);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // PASO 3: PREMIO GANADO (Voucher y avance al Paso 4: Calificación)
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
    // Avanza de inmediato al Paso 4 (Calificar en Google My Business)
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
    <div className="min-h-screen bg-[#141317] text-[#e6e1e7] flex flex-col selection:bg-[#f2be71]/30 selection:text-[#f2be71]">
      {/* Cabecera dinámica de la experiencia */}
      <GameHeader
        session={session}
        currentStep={currentStep}
        activeMode={activeMode}
        onChangeMode={setActiveMode}
        onResetSession={handleResetSession}
        onSelectStep={(step) => {
          setCurrentStep(step);
        }}
        onOpenMissions={() => setIsMissionsOpen(true)}
        onOpenPushPrompt={() => setIsPushModalOpen(true)}
        onOpenKioskPortal={() => setIsKioskModalOpen(true)}
      />

      {/* Ambient background glow orbs estilo Stitch */}
      <div className="pointer-events-none fixed -top-10 -right-20 w-80 h-80 rounded-full bg-[#f2be71]/5 blur-3xl" />
      <div className="pointer-events-none fixed top-72 -left-24 w-96 h-96 rounded-full bg-[#8a4fff]/5 blur-3xl" />

      {/* Contenido principal según el modo seleccionado */}
      <main className="flex-1 max-w-lg mx-auto w-full px-3.5 sm:px-6 pt-36 sm:pt-40 pb-safe pb-16 relative z-10">
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
          /* MODO JUEGO: Datos del comensal -> El Desafío Elegido en Backend -> Reclamo de Premio -> Calificación */
          <div>
            {/* PASO 1: DATOS DEL PARTICIPANTE */}
            {currentStep === 1 && (
              <div>
                <StepUserData
                  initialData={participant}
                  onBack={() => setActiveMode("feedback")}
                  onComplete={handleUserDataComplete}
                />
              </div>
            )}

            {/* PASO 2: INSTAGRAM Y REDES SOCIALES */}
            {currentStep === 2 && (
              <div>
                <StepInstagramStory
                  participantName={participant?.fullName || "Cliente de la Casa"}
                  tableNumber={session.tableNumber}
                  initialEvidence={instagramEvidence}
                  onBack={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onComplete={handleInstagramComplete}
                />
              </div>
            )}

            {/* PASO 3: EL CARRUSEL (RULETA DE LA SUERTE) */}
            {currentStep === 3 && (
              <div>
                <StepRouletteWheel
                  prizes={prizes}
                  participantName={participant?.fullName || "Invitado"}
                  onPrizeWon={handlePrizeWon}
                />
              </div>
            )}

            {/* PASO 4: PREMIO + CÓDIGO (VOUCHER Y CÓDIGO ÚNICO) */}
            {currentStep === 4 && (
              <div>
                {wonPrize ? (
                  <div className="space-y-6">
                    <StepPrizeClaim
                      prize={wonPrize}
                      onValidateAtCashier={handleOpenValidatePin}
                      secondChanceConfig={secondChanceConfig}
                      onUnlockSecondChance={() => {
                        setCurrentStep(6);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      onOpenMissions={() => {
                        setCurrentStep(7);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      onProceedToFeedback={() => {
                        setCurrentStep(5);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />

                    {/* Atajo para modo desarrollo / prueba de ruleta */}
                    <div className="text-center pt-2 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setWonPrize(null);
                          sessionStorage.removeItem("juego_won_prize");
                          setCurrentStep(3);
                        }}
                        className="btn-dark inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-[#f2be71]" />
                        <span className="font-semibold">{t("🔄 Girar de Nuevo (Modo Demo)", "🔄 Spin Again (Demo Mode)")}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-[#1c1b1f] rounded-2xl border border-[#f2be71]/30 p-6 sm:p-8 shadow-xl">
                    <h3 className="font-headline-sm text-xl text-[#ffddb1] font-bold mb-2">
                      {t("¡Aún no has descubierto tu premio!", "You haven't unveiled your prize yet!")}
                    </h3>
                    <p className="text-sm text-[#ccc3d8] mb-6 max-w-sm mx-auto">
                      {t("Gira la Ruleta en el Paso 3 para descubrir tu beneficio exclusivo.", "Spin the Roulette in Step 3 to discover your exclusive treat.")}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(3);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs uppercase tracking-wider font-bold shadow-md cursor-pointer active:scale-95"
                    >
                      <span>🎡 {t("Ir a la Ruleta (Paso 3)", "Go to Roulette (Step 3)")}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PASO 5: CALIFICACIÓN & OPINIÓN EN GOOGLE MY BUSINESS */}
            {currentStep === 5 && (
              <div>
                <StepFeedback
                  initialFeedback={feedback}
                  customerName={participant?.fullName || wonPrize?.participantName}
                  wonPrize={wonPrize}
                  isStandAlone={false}
                  secondChanceConfig={secondChanceConfig}
                  onUnlockSecondChance={() => {
                    setCurrentStep(6);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onComplete={(fb) => setFeedback(fb)}
                  onSwitchToGame={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}

            {/* PASO 6: SEGUNDA OPORTUNIDAD (RETO DEL CRONÓMETRO DE PRECISIÓN 10S) */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <StepSecondChancePrecision
                  secondChanceConfig={secondChanceConfig}
                  participantName={participant?.fullName || wonPrize?.participantName}
                  tableNumber={session.tableNumber}
                  participantWhatsapp={participant?.whatsapp || wonPrize?.participantWhatsapp}
                  onPrizeWon={(prize) => {
                    handlePrizeWon(prize);
                  }}
                  onExit={() => {
                    setCurrentStep(7);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />

                {/* Botón para continuar al Centro de Misiones (Paso 7) */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(7);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-gold/30 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-gold/50 text-foreground text-xs uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>🎯 {t("Ver Misiones Gourmet · Paso 7", "View Gourmet Missions · Step 7")}</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            )}

            {/* PASO 7: MISIONES (CENTRO DE MISIONES ESTILO SCREPY) */}
            {currentStep === 7 && (
              <div>
                <StepMissions
                  customerName={participant?.fullName || wonPrize?.participantName}
                  customerWhatsapp={participant?.whatsapp || wonPrize?.participantWhatsapp}
                  onResetToStart={handleResetSession}
                />
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

      {/* Modal del Centro de Misiones & Embajadores (Estilo Screpy) */}
      <MissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        customerName={participant?.fullName || wonPrize?.participantName}
        customerWhatsapp={participant?.whatsapp || wonPrize?.participantWhatsapp}
      />

      {/* Modal de Portal Cautivo WiFi & Kiosko */}
      <KioskCaptivePortalModal
        isOpen={isKioskModalOpen}
        onClose={() => setIsKioskModalOpen(false)}
        onCustomerRegistered={(customerData) => {
          const newPart: ParticipantData = {
            fullName: customerData.name,
            whatsapp: customerData.whatsapp,
            email: customerData.email || "",
            tableNumber: session.tableNumber,
            registeredAt: Date.now(),
          };
          setParticipant(newPart);
          try {
            sessionStorage.setItem("juego_participant", JSON.stringify(newPart));
          } catch {}
          setCurrentStep(3);
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
            setTimeout(() => {
              setIsPushModalOpen(true);
            }, 1200);
          }
        }}
      />

      {/* Modal de Solicitud de Notificaciones Web Push VIP */}
      <PushNotificationPrompt
        isOpen={isPushModalOpen}
        onClose={() => setIsPushModalOpen(false)}
        customerName={participant?.fullName || wonPrize?.participantName}
        customerWhatsapp={participant?.whatsapp || wonPrize?.participantWhatsapp}
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

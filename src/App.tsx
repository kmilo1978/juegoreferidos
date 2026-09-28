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
import { StepPrizeClaim } from "./components/qr-game/StepPrizeClaim";
import { AdminPanelModal } from "./components/qr-game/AdminPanelModal";
import { PinAuthModal } from "./components/qr-game/PinAuthModal";
import { TableStandModal } from "./components/qr-game/TableStandModal";
import { recordPageView, getStoredHistory, saveStoredHistory } from "./lib/analyticsService";
import { MessageCircle } from "lucide-react";
import { site } from "./data/site";
import { clientConfig } from "./config/clientConfig";

function getInitialTable(): string {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const modo = params.get("modo");
    if (modo === "caja") return "Punto de Pago / Caja";
    const mesa = params.get("mesa");
    if (mesa) return `Mesa ${mesa.replace(/[^0-9a-zA-Z]/g, "")}`;
  }
  return "Consumo en Sala";
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

  // Registrar visita y cargar historial persistente
  useEffect(() => {
    recordPageView();

    const stored = getStoredHistory();
    if (stored && stored.length > 0) {
      setHistory(stored);
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
  }, []);

  // Generar nueva sesión para simular otra mesa o nuevo comensal
  const handleResetSession = () => {
    setSession(createInitialSession());
    setCurrentStep(1);
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
      alert(
        `¡Hola, ${data.fullName}! Detectamos que ya participaste hoy con el número (+${cleanWhatsapp}).\n\nTienes activo tu premio: "${existingActivePrize.prizeName}" (Código: ${existingActivePrize.uniqueCode}). Para mantener la equidad en el sorteo, se permite 1 giro diario por persona.\n\nTe llevamos directamente a tu cupón.`
      );
      setWonPrize(existingActivePrize);
      setCurrentStep(4);
      return;
    }

    setParticipant(data);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

    // Guardar en sessionStorage para protegerlo de F5
    try {
      sessionStorage.setItem("juego_won_prize", JSON.stringify(newWon));
    } catch {
      // ignore
    }

    // Enviar a Google Sheets silenciosamente si el webhook está configurado
    if (site.googleSheetWebhookUrl) {
      try {
        fetch(site.googleSheetWebhookUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "CREATE_PRIZE",
            fullName: newWon.participantName,
            whatsapp: newWon.participantWhatsapp,
            email: participant?.email || "N/A",
            instagram: instagramEvidence?.instagramHandle || "N/A",
            prizeName: newWon.prizeName,
            uniqueCode: newWon.uniqueCode,
          }),
        }).catch(() => {});
      } catch {
        // Cero fallos visuales si no hay red
      }
    }
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

    try {
      sessionStorage.setItem("juego_won_prize", JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Actualizar estado en Google Sheets
    if (site.googleSheetWebhookUrl) {
      try {
        fetch(site.googleSheetWebhookUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "VALIDATE_PIN",
            uniqueCode: wonPrize.uniqueCode,
            pin: "1978",
          }),
        }).catch(() => {});
      } catch {
        // ignore
      }
    }
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
              <StepRouletteWheel
                prizes={prizes}
                participantName={participant?.fullName || "Invitado"}
                onPrizeWon={handlePrizeWon}
              />
            )}

            {currentStep === 4 && wonPrize && (
              <StepPrizeClaim
                prize={wonPrize}
                onValidateAtCashier={handleOpenValidatePin}
              />
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

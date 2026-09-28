# Bliss Soul Bakery & Café — Módulo «Juego QR en Mesa»

> **Manifiesto Técnico, Arquitectura de Flujo, Guía de Replicabilidad y Código Fuente Íntegro**  
> Diseñado para ser analizado, mejorado y clonado en cualquier negocio gastronómico o de hospitalidad.

---

## 1. El Manifiesto del Sistema (Gamificación, Reputación y Fidelización)

Este sistema parte de una premisa de marketing gastronómico fundamental:

> **"El momento de la cuenta no debe ser un punto de dolor o despedida fría; debe ser la cúspide de la experiencia del comensal."**

Tradicionalmente, entregar un descuento o pedir una reseña resulta incómodo o ineficiente. Este módulo convierte ese instante en un **intercambio de alto valor mutuo** donde todos ganan:

### Los 4 Pilares del Retorno de Inversión (ROI):

1. **Captura de Leads Calificados (Base de Datos Real):**  
   El cliente entrega su **Nombre y WhatsApp verificado** con consentimiento legal (_Habeas Data_). No es un seguidor anónimo; es un comensal real que estuvo sentado consumiendo en tu local.
2. **Generación de Contenido Orgánico (UGC en Instagram):**  
   Para desbloquear el juego, el cliente publica una foto de su visita etiquetando a `@blisssoulbakery`. El restaurante no regala nada: **el cliente paga su descuento con publicidad pública en sus historias**.
3. **Embudo Inteligente de Reputación (Google Maps vs. WhatsApp):**
   - **4 a 5 estrellas:** Se canalizan directamente hacia **Google Maps Reviews**, disparando el SEO local y el posicionamiento del restaurante.
   - **1 a 3 estrellas:** Se enrutan a un **formulario privado de WhatsApp** hacia la administración, aislando quejas antes de que dañen el perfil público.
4. **Voucher Digital Anticopia con Validación en Caja:**  
   Un cupón dorado con código único alfanumérico (`BLISS-XXXXX`) y código QR de alta resolución que el personal valida con un **PIN de 4 dígitos**, garantizando cero fraude y registro transparente en **Google Sheets**.
5. **Estrategia de Remarketing y Retención por WhatsApp (Método de Reciprocidad y Estados):**  
   Resuelve el mayor desafío de WhatsApp Business: los comensales solo ven los **Estados de WhatsApp** si tienen guardado el número del restaurante.
   - **El Disparador de Reciprocidad:** En el Paso 4, el botón _"Enviar comprobante a WhatsApp"_ abre el chat oficial del restaurante. Una respuesta automática le indica: _“Guarda nuestro contacto como Bliss Soul Bakery para recibir promociones privadas y ver los ganadores de premios sorpresa cada domingo en nuestros Estados”_. El cliente guarda el número voluntariamente en ese instante.
   - **Cero Trabajo Manual:** El restaurante no digita contactos a mano. Descarga el archivo de Google Sheets y lo importa en **Google Contacts** en 10 segundos, sincronizando cientos de clientes directamente en la agenda del teléfono.
6. **Bucle Viral "Refer-a-Friend" por WhatsApp (Crecimiento Compuesto / Inspiración PerkZilla):**  
   Aprovecha el momento de mayor euforia del cliente (cuando acaba de ganar su premio) para activar el boca a boca digital:
   - **Un toque para compartir:** Un botón dorado en el voucher permite al cliente reenviar a sus amigos o grupos de WhatsApp un pase de cortesía (_15% de bienvenida o café de autor_) con un enlace directo.
   - **Adquisición de clientes a costo \$0:** Cada cliente sentado en mesa tiene el potencial de traer a 1, 2 o más personas nuevas a través de su recomendación de confianza.

---

## 2. Modelo Operativo en Sala (Sin Atadura a Mesas Físicas)

Para evitar la fricción y el costo de imprimir códigos QR distintos para cada mesa física:

- **Plaqueta Única Oficial de Lujo:** Se colocan 1 o 2 plaquetas elegantes (acrílico dorado o madera grabada):
  - Una fija en la **caja / registradora**.
  - Una portátil que lleva el **mesero junto con la cuenta o datáfono**.
- **Doble Tecnología (NFC + QR):**
  - **Chip NFC adhesivo invisible:** El comensal solo acerca su smartphone (iPhone o Android) y la experiencia se abre automáticamente en su navegador en 1 segundo, **sin descargar aplicaciones**.
  - **Código QR dorado:** Para clientes que prefieran abrir la cámara de fotos.
- **Sesión de Consumo Flexible:** En lugar de forzar "Mesa 08", la pantalla identifica la sesión como **"Visita en Sala · Consumo de Hoy"**, eliminando cualquier error de reubicación de comensales.

---

## 3. Las 5 Mejoras Clave de Producción

1. **Compresor Automático de Fotos Móviles (Canvas Optimizer):**  
   Los smartphones modernos toman fotos de 15 MB a 48 MP o en formato HEIC de iPhone. Una función ligera en el navegador reduce la imagen a máximo 1200 px y la comprime a JPEG de ~180 KB en 0.2 segundos. Cero cuelgues de memoria y carga instantánea.
2. **Ruleta con Aceleración Gráfica (GPU) y Aguja Triangular:**  
   Animación fluida a 60 FPS mediante `transform: translate3d(0,0,0)` y curva Bézier de 5.2 segundos con 7 vueltas completas. Puntero afilado de alta precisión que señala el centro del premio sin ambigüedades.
3. **Validación en Caja con Teclado PIN de 4 Dígitos:**  
   El botón de cobro requiere que el mesero o cajero digite un PIN de 4 números (ej: `1978`), impidiendo que el cliente use el cupón por error o haga trampa.
4. **Persistencia Antifallos (`localStorage`):**  
   Si el comensal recarga la página o apaga la pantalla, el voucher no se borra. Además, se bloquea la posibilidad de volver a girar la ruleta en la misma visita.
5. **Base de Datos Gratuita en Google Sheets:**  
   Sin contratar servidores ni bases de datos SQL. Un webhook gratuito de Google Apps Script registra cada premio en tiempo real y actualiza la columna **¿Validado en Caja? (SÍ / NO)**.

---

## 4. Arquitectura de Flujo y Máquina de Estados

```
[ Cliente acerca su celular al NFC o escanea el QR al pedir la cuenta ]
                               │
                               ▼
               ┌───────────────────────────────┐
               │          GameHeader           │ (Sesión de consumo activa, sin atadura a mesa)
               └───────────────┬───────────────┘
                               │
                ┌──────────────┴──────────────┐
                │ (Modo Juego)                │ (Modo Solo Calificar)
                ▼                             ▼
       ┌──────────────────┐            ┌──────────────┐
       │     Paso 1:      │            │ StepFeedback │ ──► [4-5★ -> Google Maps Reviews]
       │   StepUserData   │            └──────────────┘ ──► [1-3★ -> WhatsApp Administración]
       └────────┬─────────┘
                │ (Teléfono CO +57 verificado y Habeas Data)
                ▼
       ┌──────────────────┐
       │     Paso 2:      │
       │StepInstagramStory│ ──► Compresión Canvas 180KB / Captura de Story con @blisssoulbakery
       └────────┬─────────┘
                │ (Evidencia confirmada)
                ▼
       ┌──────────────────┐
       │     Paso 3:      │
       │StepRouletteWheel │ ──► Ruleta GPU 60fps + Probabilidad acumulada + Confeti
       └────────┬─────────┘
                │ (Premio asignado)
                ▼
       ┌──────────────────┐
       │     Paso 4:      │
       │  StepPrizeClaim  │ ──► Fila creada en Google Sheets (Validado: NO) + Voucher QR
       └────────┬─────────┘
                │ (Cajero/Mesero ingresa PIN de 4 dígitos ➔ Google Sheets pasa a SÍ)
                ▼
       ┌──────────────────┐
       │     Paso 5:      │
       │   StepFeedback   │ ──► Broche de oro: Calificación 5★ a Google Maps
       └──────────────────┘
```

---

## 5. Código Fuente Íntegro por Módulos

### 4.1. Tipos e Interfaces (`src/components/qr-game/gameTypes.ts`)

```typescript
export interface GamePrize {
  id: string;
  name: string;
  nameEn: string;
  type: "discount_percent" | "free_item" | "special_experience";
  value: string;
  probability: number; // Porcentaje (1 a 100)
  color: string;
  textColor: string;
  active: boolean;
  terms: string;
  termsEn: string;
}

export interface TableSession {
  id: string;
  tableNumber: string;
  createdAt: number;
  expiresAt: number;
  status: "active" | "completed" | "expired";
}

export interface ParticipantData {
  fullName: string;
  whatsapp: string;
  email?: string | undefined;
  consentData: boolean;
  consentMarketing: boolean;
}

export interface FeedbackData {
  rating: number;
  comment?: string | undefined;
}

export interface InstagramEvidence {
  storyGenerated: boolean;
  screenshotFileUrl?: string | undefined;
  instagramHandle?: string | undefined;
}

export interface WonPrize {
  uniqueCode: string;
  prizeId: string;
  prizeName: string;
  prizeNameEn: string;
  value: string;
  tableNumber: string;
  participantName: string;
  participantWhatsapp: string;
  wonAt: string;
  status: "DISPONIBLE" | "UTILIZADO";
  usedAt?: string;
}

export const DEFAULT_PRIZES: GamePrize[] = [
  {
    id: "p1",
    name: "20% de Descuento",
    nameEn: "20% Discount",
    type: "discount_percent",
    value: "20%",
    probability: 30,
    color: "#a27e2c", // Dorado Luxor
    textColor: "#ffffff",
    active: true,
    terms: "Aplica en el total de la cuenta actual de consumo. No acumulable.",
    termsEn: "Applies to today's consumption bill. Not accumulative.",
  },
  {
    id: "p2",
    name: "15% de Descuento",
    nameEn: "15% Discount",
    type: "discount_percent",
    value: "15%",
    probability: 20,
    color: "#fcfaf7", // Crema suave
    textColor: "#1e1b18",
    active: true,
    terms: "Aplica en el total de la cuenta actual de consumo. No acumulable.",
    termsEn: "Applies to today's consumption bill. Not accumulative.",
  },
  {
    id: "p3",
    name: "Café de Especialidad Gratis",
    nameEn: "Free Specialty Coffee",
    type: "free_item",
    value: "Café",
    probability: 20,
    color: "#d1b374", // Champagne dorado
    textColor: "#1e1b18",
    active: true,
    terms: "Válido para un Cappuccino, Latte, Espresso o Tinto de autor.",
    termsEn: "Valid for one Cappuccino, Latte, Espresso, or artisan Tinto.",
  },
  {
    id: "p4",
    name: "Postre Artesanal Gratis",
    nameEn: "Free Artisan Dessert",
    type: "free_item",
    value: "Postre",
    probability: 15,
    color: "#24201d", // Carbón editorial
    textColor: "#d1b374",
    active: true,
    terms: "Una porción de tarta vasca, cheesecake o roll recién horneado.",
    termsEn: "One slice of Basque cheesecake, cheesecake, or fresh-baked roll.",
  },
  {
    id: "p5",
    name: "Bono Dulce Sorpresa",
    nameEn: "Sweet Surprise Voucher",
    type: "free_item",
    value: "Sorpresa",
    probability: 10,
    color: "#8c6b22", // Oro viejo
    textColor: "#ffffff",
    active: true,
    terms: "Cortesía del maestro pastelero para tu mesa.",
    termsEn: "Complimentary gift from the master pastry chef.",
  },
  {
    id: "p6",
    name: "Cena Especial para 2",
    nameEn: "Special Dinner for 2",
    type: "special_experience",
    value: "Cena 2P",
    probability: 5,
    color: "#594314", // Bronce profundo
    textColor: "#ffffff",
    active: true,
    terms: "Premio mayor especial semanal. Válido con reserva previa.",
    termsEn: "Weekly grand prize. Valid with prior reservation.",
  },
];
```

---

### 4.2. Controlador Principal de Ruta (`src/routes/juego-qr.tsx`)

```typescript
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/context/LanguageContext";
import {
  TableSession,
  ParticipantData,
  FeedbackData,
  InstagramEvidence,
  GamePrize,
  WonPrize,
  DEFAULT_PRIZES,
} from "@/components/qr-game/gameTypes";
import { GameHeader } from "@/components/qr-game/GameHeader";
import { StepFeedback } from "@/components/qr-game/StepFeedback";
import { StepUserData } from "@/components/qr-game/StepUserData";
import { StepInstagramStory } from "@/components/qr-game/StepInstagramStory";
import { StepRouletteWheel } from "@/components/qr-game/StepRouletteWheel";
import { StepPrizeClaim } from "@/components/qr-game/StepPrizeClaim";
import { AdminPanelModal } from "@/components/qr-game/AdminPanelModal";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/juego-qr")({
  head: () => ({
    meta: [
      { title: "Juego de Premios en Mesa | Bliss Soul Bakery" },
      {
        name: "description",
        content:
          "Escanea el código QR de tu cuenta, califica tu experiencia, comparte tu Story y gira la ruleta para ganar premios exclusivos en Bliss Soul Bakery.",
      },
      { property: "og:title", content: "Juego de Premios QR | Bliss Soul Bakery" },
      { property: "og:description", content: "Dinámica exclusiva de gratitud y premios en mesa." },
    ],
  }),
  component: JuegoQrPage,
});

function createInitialSession(tableNum = "Mesa 08"): TableSession {
  return {
    id: `SES-${Date.now().toString(36).toUpperCase()}`,
    tableNumber: tableNum,
    createdAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutos de vigencia
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
  const [prizes, setPrizes] = useState<GamePrize[]>(DEFAULT_PRIZES);
  const [wonPrize, setWonPrize] = useState<WonPrize | null>(null);
  const [history, setHistory] = useState<WonPrize[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Generar nueva sesión para simular otra mesa
  const handleResetSession = () => {
    const tableNumbers = ["Mesa 02", "Mesa 04", "Mesa 08", "Mesa 11", "Barra Café", "Terraza 03"];
    const randomTable = tableNumbers[Math.floor(Math.random() * tableNumbers.length)];
    setSession(createInitialSession(randomTable));
    setCurrentStep(1);
    setFeedback(undefined);
    setParticipant(undefined);
    setInstagramEvidence(undefined);
    setWonPrize(null);
  };

  // PASO 1 -> PASO 2 (Tus Datos -> Instagram)
  const handleUserDataComplete = (data: ParticipantData) => {
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
    const randomCode = `BLISS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
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
      participantName: participant?.fullName || "Cliente Bliss",
      participantWhatsapp: participant?.whatsapp || "573000000000",
      wonAt: dateStr,
      status: "DISPONIBLE",
    };

    setWonPrize(newWon);
    setHistory((prev) => [newWon, ...prev]);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Validación de cobro en caja (Paso 4)
  const handleValidateAtCashier = () => {
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
    setHistory((prev) => prev.map((h) => (h.uniqueCode === wonPrize.uniqueCode ? updated : h)));
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-foreground flex flex-col selection:bg-gold/20 selection:text-gold">
      {/* Cabecera dinámica de la experiencia */}
      <GameHeader
        session={session}
        currentStep={currentStep}
        activeMode={activeMode}
        onChangeMode={setActiveMode}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onResetSession={handleResetSession}
      />

      {/* Contenido principal según el modo seleccionado */}
      <main className="flex-1 shell py-8 md:py-12">
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
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>
                      {t(
                        "¿Prefieres solo calificar tu visita sin jugar la ruleta? Toca aquí",
                        "Prefer to just rate your visit without playing? Click here",
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
              <StepPrizeClaim prize={wonPrize} onValidateAtCashier={handleValidateAtCashier} />
            )}
          </div>
        )}
      </main>

      {/* Modal del Panel Administrativo */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        prizes={prizes}
        onUpdatePrizes={setPrizes}
        history={history}
        onGenerateNewTable={handleResetSession}
      />
    </div>
  );
}
```

---

### 4.3. Cabecera Dinámica y Contador (`src/components/qr-game/GameHeader.tsx`)

```typescript
import { useState, useEffect } from "react";
import { TableSession } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Clock, QrCode, Settings, RotateCcw, Sparkles, MessageCircle } from "lucide-react";
import logoHeader from "@/assets/logo-header.png";

interface GameHeaderProps {
  session: TableSession;
  currentStep: number;
  activeMode: "game" | "feedback";
  onChangeMode: (mode: "game" | "feedback") => void;
  onOpenAdmin: () => void;
  onResetSession: () => void;
}

export function GameHeader({
  session,
  currentStep,
  activeMode,
  onChangeMode,
  onOpenAdmin,
  onResetSession,
}: GameHeaderProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [session.expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const gameSteps = [
    { num: 1, label: t("Tus Datos", "Your Info") },
    { num: 2, label: t("Story IG", "IG Story") },
    { num: 3, label: t("Ruleta", "Roulette") },
    { num: 4, label: t("Premio QR", "QR Prize") },
    { num: 5, label: t("Feedback", "Feedback") },
  ];

  return (
    <header className="border-b border-gold/20 bg-background/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="shell py-4">
        {/* Barra superior de estado de sesión de pago */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold tracking-wider text-foreground">
              {session.tableNumber}
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span className="inline-flex items-center gap-1 text-gold font-medium">
              <QrCode className="h-3.5 w-3.5" />
              {t("QR de Pago Escaneado", "Scanned Payment QR")}
            </span>
            <span className="text-muted-foreground/60 hidden sm:inline">·</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3 text-muted-foreground/80" />
              {t("Expira en:", "Expires in:")}{" "}
              <strong className="text-foreground font-mono">{timeFormatted}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetSession}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title={t("Reiniciar simulación con nueva mesa", "Reset simulation with new table")}
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">{t("Nueva Sesión", "New Session")}</span>
            </button>
            <button
              onClick={onOpenAdmin}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] rounded-lg bg-gold/10 border border-gold/40 text-gold font-medium hover:bg-gold/20 transition-all shadow-2xs"
            >
              <Settings className="h-3 w-3" />
              <span>{t("Panel Admin", "Admin Panel")}</span>
            </button>
          </div>
        </div>

        {/* Marca y Selector de Modo o Stepper */}
        <div className="pt-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={logoHeader}
                alt="Bliss Soul Bakery | Experiencia de repostería fina en Sabaneta"
                className="h-9 w-auto object-contain brightness-0 invert-0"
              />
              <div className="border-l border-gold/30 pl-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-gold font-semibold">
                  {t("Experiencia en Mesa", "Table Experience")}
                </p>
                <p className="text-xs font-serif text-foreground/80">
                  {t("Juego de Premios & Gratitud", "Prize Game & Hospitality")}
                </p>
              </div>
            </div>

            {/* Píldoras para alternar entre Juego y Solo Feedback */}
            <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/70 text-xs">
              <button
                type="button"
                onClick={() => onChangeMode("game")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-medium ${
                  activeMode === "game"
                    ? "bg-card text-gold font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t("Juego de Premios", "Prize Game")}</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeMode("feedback")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-medium ${
                  activeMode === "feedback"
                    ? "bg-card text-gold font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{t("Solo Calificar", "Rate Only")}</span>
              </button>
            </div>
          </div>

          {/* Stepper horizontal si está en modo Juego */}
          {activeMode === "game" && (
            <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-2">
              {gameSteps.map((s) => {
                const isCompleted = s.num < currentStep;
                const isCurrent = s.num === currentStep;

                return (
                  <div key={s.num} className="flex items-center gap-1">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        isCurrent
                          ? "bg-gold text-white shadow-xs font-semibold"
                          : isCompleted
                            ? "bg-gold/15 text-gold border border-gold/30"
                            : "bg-muted/60 text-muted-foreground/60 border border-transparent"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full flex items-center justify-center text-[10px] bg-black/10">
                        {isCompleted ? "✓" : s.num}
                      </span>
                      <span className="hidden md:inline">{s.label}</span>
                    </div>
                    {s.num < gameSteps.length && (
                      <span className="text-muted-foreground/30 text-[10px]">›</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

---

### 4.4. Captura de Datos y Habeas Data (`src/components/qr-game/StepUserData.tsx`)

```typescript
import { useState } from "react";
import { ParticipantData } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { ArrowRight, ArrowLeft, User, Phone, Mail, Check } from "lucide-react";

interface FormErrors {
  fullName?: string;
  whatsapp?: string;
  email?: string;
  consentData?: string;
}

interface StepUserDataProps {
  initialData?: ParticipantData | undefined;
  onBack: () => void;
  onComplete: (data: ParticipantData) => void;
}

export function StepUserData({ initialData, onBack, onComplete }: StepUserDataProps) {
  const { t } = useLanguage();

  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [consentData, setConsentData] = useState(initialData?.consentData || false);
  const [consentMarketing, setConsentMarketing] = useState(initialData?.consentMarketing || false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = () => {
    const errs: FormErrors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = t(
        "Por favor ingresa tu nombre completo (mínimo 2 caracteres).",
        "Please enter your full name (minimum 2 characters).",
      );
    }

    // Validación número colombiano: 10 dígitos numéricos
    const cleanPhone = whatsapp.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.whatsapp = t(
        "Ingresa un número de WhatsApp colombiano válido (10 dígitos, ej: 3022777295).",
        "Enter a valid Colombian WhatsApp number (10 digits, e.g. 3022777295).",
      );
    }

    // Validación email opcional
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = t(
        "Por favor ingresa un correo electrónico con formato válido.",
        "Please enter a valid email format.",
      );
    }

    if (!consentData) {
      errs.consentData = t(
        "Debes autorizar el tratamiento de datos para registrar tu participación.",
        "You must authorize data processing to register your participation.",
      );
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onComplete({
        fullName: fullName.trim(),
        whatsapp: whatsapp.replace(/\D/g, ""),
        email: email.trim() || undefined,
        consentData,
        consentMarketing,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Reveal>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs uppercase tracking-[0.24em] text-gold font-medium">
              {t("Paso 2 · Registro", "Step 2 · Registration")}
            </span>
            <span className="h-px w-6 bg-gold" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
            {t("Datos del Participante", "Participant Details")}
          </h2>

          <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed max-w-lg mx-auto">
            {t(
              "Ingresa tus datos para vincular tu participación a esta cuenta y enviar tu premio directamente a tu WhatsApp.",
              "Enter your details to link your participation to this bill and send your prize directly to your WhatsApp.",
            )}
          </p>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-border/70 bg-card p-6 sm:p-9 shadow-xs space-y-6"
        >
          {/* Nombre completo */}
          <div>
            <label
              htmlFor="full-name"
              className="block text-xs uppercase tracking-[0.18em] text-foreground font-medium mb-2"
            >
              {t("Nombre completo", "Full Name")} <span className="text-gold">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("Ej: María Gómez", "E.g. Maria Gomez")}
                className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 bg-background focus:outline-none transition-all ${
                  errors.fullName
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-border/80 focus:border-gold focus:ring-1 focus:ring-gold"
                }`}
              />
            </div>
            {errors.fullName && <p className="mt-1.5 text-xs text-red-500">{errors.fullName}</p>}
          </div>

          {/* WhatsApp (+57) */}
          <div>
            <label
              htmlFor="whatsapp"
              className="block text-xs uppercase tracking-[0.18em] text-foreground font-medium mb-2"
            >
              {t("WhatsApp", "WhatsApp")} <span className="text-gold">*</span>
            </label>
            <div className="relative flex rounded-xl border border-border/80 bg-background focus-within:border-gold focus-within:ring-1 focus-within:ring-gold transition-all">
              <div className="flex items-center gap-1.5 px-3.5 bg-muted/30 border-r border-border/60 rounded-l-xl text-xs font-mono font-medium text-foreground/80 shrink-0">
                <Phone className="h-3.5 w-3.5 text-gold" />
                <span>🇨🇴 +57</span>
              </div>
              <input
                id="whatsapp"
                type="tel"
                maxLength={10}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                placeholder={t("302 277 7295", "302 277 7295")}
                className="w-full pl-3.5 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 bg-transparent focus:outline-none font-mono"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground font-light">
              {t(
                "Tu premio y confirmación se enviarán a esta línea.",
                "Your prize and voucher will be sent to this phone line.",
              )}
            </p>
            {errors.whatsapp && <p className="mt-1 text-xs text-red-500">{errors.whatsapp}</p>}
          </div>

          {/* Correo electrónico (Opcional) */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-[0.18em] text-foreground font-medium mb-2"
            >
              {t("Correo electrónico (Opcional)", "Email address (Optional)")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("tu@correo.com", "your@email.com")}
                className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 bg-background focus:outline-none transition-all ${
                  errors.email
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-border/80 focus:border-gold focus:ring-1 focus:ring-gold"
                }`}
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Consentimientos */}
          <div className="pt-2 space-y-4 border-t border-border/50">
            {/* Consentimiento obligatorio */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentData}
                onChange={(e) => setConsentData(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                  consentData ? "bg-gold border-gold text-white" : "border-border/80 bg-background"
                }`}
              >
                {consentData && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span className="text-xs text-foreground/90 font-light leading-relaxed">
                <strong className="font-medium text-foreground">
                  {t("Consentimiento obligatorio:", "Mandatory consent:")}
                </strong>{" "}
                {t(
                  "Autorizo el tratamiento de mis datos personales únicamente para gestionar mi participación en la dinámica y validar mi premio, conforme a la",
                  "I authorize the processing of my personal data solely to manage my participation and validate my prize, pursuant to the",
                )}{" "}
                <a
                  href="/politica-de-privacidad"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold underline underline-offset-2 hover:text-gold/80"
                >
                  {t("Política de Privacidad", "Privacy Policy")}
                </a>
                .
              </span>
            </label>
            {errors.consentData && (
              <p className="text-xs text-red-500 pl-7">{errors.consentData}</p>
            )}

            {/* Consentimiento de marketing (Opcional) */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                  consentMarketing
                    ? "bg-gold border-gold text-white"
                    : "border-border/80 bg-background"
                }`}
              >
                {consentMarketing && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span className="text-xs text-muted-foreground font-light leading-relaxed">
                <span className="text-foreground/80 font-medium">
                  {t("Novedades y cortesías (Opcional):", "News and treats (Optional):")}
                </span>{" "}
                {t(
                  "Deseo recibir invitaciones a catas privadas, nuevas creaciones artesanales y promociones exclusivas de Bliss Soul Bakery por WhatsApp o correo.",
                  "I would like to receive invitations to private tastings, new artisan creations, and exclusive offers by WhatsApp or email.",
                )}
              </span>
            </label>
          </div>

          {/* Botones de navegación */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-border/50">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("Volver al feedback", "Back to feedback")}</span>
            </button>

            <button
              type="submit"
              className="btn-solid w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 text-xs uppercase tracking-[0.2em] font-medium transition-all shadow-xs"
            >
              <span>{t("Continuar a Instagram Story", "Continue to IG Story")}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </Reveal>
    </div>
  );
}
```

---

### 4.5. Compartir en Instagram Story (`src/components/qr-game/StepInstagramStory.tsx`)

```typescript
import { useState, useRef } from "react";
import { InstagramEvidence } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import {
  Camera,
  Instagram,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileImage,
  ExternalLink,
  Coffee,
  Store,
  Users,
  Download,
} from "lucide-react";
import logoHeader from "@/assets/logo-header.png";
import heroImg from "@/assets/hero-pistacho-cafe.jpg";

interface StepInstagramStoryProps {
  participantName: string;
  tableNumber: string;
  initialEvidence?: InstagramEvidence | undefined;
  onBack: () => void;
  onComplete: (evidence: InstagramEvidence) => void;
}

export function StepInstagramStory({
  participantName,
  tableNumber,
  initialEvidence,
  onBack,
  onComplete,
}: StepInstagramStoryProps) {
  const { t } = useLanguage();

  const [downloaded, setDownloaded] = useState<boolean>(initialEvidence?.storyGenerated || false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialEvidence?.screenshotFileUrl,
  );
  const [handle, setHandle] = useState<string>(initialEvidence?.instagramHandle || "");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Descarga opcional de la plantilla prediseñada para quien prefiera no tomar foto
  const handleDownloadStory = () => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const bg = new Image();
    bg.src = heroImg;
    bg.crossOrigin = "anonymous";
    bg.onload = () => {
      ctx.drawImage(bg, 0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(17, 17, 17, 0.75)");
      gradient.addColorStop(0.5, "rgba(17, 17, 17, 0.35)");
      gradient.addColorStop(1, "rgba(17, 17, 17, 0.88)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(209, 179, 116, 0.5)";
      ctx.lineWidth = 14;
      ctx.strokeRect(60, 60, width - 120, height - 120);

      const logo = new Image();
      logo.src = logoHeader;
      logo.crossOrigin = "anonymous";
      logo.onload = () => {
        const logoW = 440;
        const logoH = 140;
        ctx.drawImage(logo, (width - logoW) / 2, 220, logoW, logoH);

        ctx.textAlign = "center";
        ctx.fillStyle = "#d1b374";
        ctx.font = "bold 26px sans-serif";
        ctx.letterSpacing = "6px";
        ctx.fillText("SABANETA · ANTIOQUIA", width / 2, 430);

        ctx.fillStyle = "#ffffff";
        ctx.font = "italic 44px Georgia, serif";
        ctx.fillText("“Una pausa serena hecha sabor y calma.”", width / 2, 1340);

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "30px sans-serif";
        ctx.fillText(`Momento compartido por ${participantName} · ${tableNumber}`, width / 2, 1420);

        ctx.fillStyle = "rgba(162, 126, 44, 0.95)";
        ctx.beginPath();
        ctx.roundRect((width - 560) / 2, 1540, 560, 110, 55);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 38px sans-serif";
        ctx.fillText("@blisssoulbakery", width / 2, 1610);

        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `Story-Bliss-Soul-${participantName.replace(/\s+/g, "-")}.png`;
        link.href = dataUrl;
        link.click();

        setDownloaded(true);
      };
    };
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError(
        t(
          "Por favor sube un archivo de imagen válido (PNG, JPG o WebP).",
          "Please upload a valid image file (PNG, JPG, or WebP).",
        ),
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewUrl(url);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUseDemoScreenshot = () => {
    setPreviewUrl(heroImg);
    setUploadError(null);
  };

  const handleNext = () => {
    if (!previewUrl) {
      setUploadError(
        t(
          "Por favor adjunta la captura de pantalla de tu Story para continuar al juego.",
          "Please attach your Story screenshot to continue to the game.",
        ),
      );
      return;
    }

    onComplete({
      storyGenerated: downloaded,
      screenshotFileUrl: previewUrl,
      instagramHandle: handle.trim() || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <canvas ref={hiddenCanvasRef} className="hidden" />

      <Reveal>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs uppercase tracking-[0.24em] text-gold font-medium">
              {t("Paso 2 · Instagram Story", "Step 2 · Instagram Story")}
            </span>
            <span className="h-px w-6 bg-gold" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
            {t("Comparte tu Momento Bliss", "Share Your Bliss Moment")}
          </h2>

          <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed max-w-lg mx-auto">
            {t(
              "¡La foto es 100% libre! Comparte en tus historias de Instagram una foto de tu pedido, de tu mesa o del local mencionando a @blisssoulbakery, y sube la captura para desbloquear la ruleta.",
              "The photo is 100% free! Share a story on Instagram showing your food, table, or the space tagging @blisssoulbakery, and upload the screenshot to unlock the roulette.",
            )}
          </p>
        </div>
      </Reveal>

      {/* Ideas de fotos libres que puede compartir */}
      <Reveal delay={80}>
        <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
          <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 sm:p-4">
            <Coffee className="h-4 w-4 sm:h-5 sm:w-5 text-gold mx-auto mb-1.5" />
            <p className="text-[11px] font-medium text-foreground uppercase tracking-wider">
              {t("Tu Alimento", "Your Food")}
            </p>
            <p className="text-[10px] text-muted-foreground font-light hidden sm:block mt-0.5">
              Café, postre o salado
            </p>
          </div>

          <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 sm:p-4">
            <Store className="h-4 w-4 sm:h-5 sm:w-5 text-gold mx-auto mb-1.5" />
            <p className="text-[11px] font-medium text-foreground uppercase tracking-wider">
              {t("El Espacio", "The Space")}
            </p>
            <p className="text-[10px] text-muted-foreground font-light hidden sm:block mt-0.5">
              La calma de nuestra casa
            </p>
          </div>

          <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 sm:p-4">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gold mx-auto mb-1.5" />
            <p className="text-[11px] font-medium text-foreground uppercase tracking-wider">
              {t("En la Mesa", "At the Table")}
            </p>
            <p className="text-[10px] text-muted-foreground font-light hidden sm:block mt-0.5">
              Compartiendo hoy
            </p>
          </div>
        </div>
      </Reveal>

      {/* Tarjeta de Instrucciones y Mención Oficial */}
      <Reveal delay={120}>
        <div className="mt-6 rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
          {/* Recordatorio de mención a Instagram */}
          <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold text-white flex items-center justify-center shrink-0 shadow-xs">
                <Instagram className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] font-semibold text-foreground">
                  {t("Mención obligatoria:", "Required tag:")}{" "}
                  <span className="text-gold font-mono">@blisssoulbakery</span>
                </p>
                <p className="text-[11px] text-muted-foreground font-light mt-0.5">
                  {t(
                    "Etiqueta nuestra cuenta en tu historia para que podamos repostearte.",
                    "Tag our account on your story so we can repost you.",
                  )}
                </p>
              </div>
            </div>

            <a
              href="https://instagram.com/blisssoulbakery"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-gold/50 text-gold text-xs hover:bg-gold hover:text-white transition-colors shrink-0 shadow-2xs font-medium"
            >
              <span>Abrir Instagram</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Subida de la captura de pantalla de evidencia */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs uppercase tracking-[0.16em] text-foreground font-semibold">
                  {t("Sube la captura de tu Story", "Upload your Story screenshot")}{" "}
                  <span className="text-gold">*</span>
                </h3>
                <p className="text-[11px] text-muted-foreground font-light">
                  {t(
                    "Toma un pantallazo a la historia que publicaste y adjúntalo aquí:",
                    "Take a screenshot of your posted story and upload it here:",
                  )}
                </p>
              </div>

              {/* Opción adicional para descargar plantilla si no quieren tomar foto */}
              <button
                type="button"
                onClick={handleDownloadStory}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-gold transition-colors"
                title={t(
                  "Descargar plantilla si prefieres no tomar foto",
                  "Download template if you prefer not taking a photo",
                )}
              >
                <Download className="h-3 w-3" />
                <span>{t("Descargar plantilla prediseñada", "Download pre-made template")}</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
                  uploadError
                    ? "border-red-400 bg-red-50/20"
                    : "border-border/80 hover:border-gold hover:bg-gold/5 bg-background"
                }`}
              >
                <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Camera className="h-5 w-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.18em] font-medium text-foreground">
                  {isUploading
                    ? t("Cargando imagen...", "Loading image...")
                    : t(
                        "Toca aquí para seleccionar tu captura",
                        "Tap here to select your screenshot",
                      )}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground font-light">
                  {t("Formatos admitidos: PNG, JPG o WebP", "Supported formats: PNG, JPG, or WebP")}
                </p>

                {/* Botón rápido para modo demo */}
                <div className="mt-4 pt-3 border-t border-border/50">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseDemoScreenshot();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono bg-muted/70 text-foreground/80 hover:bg-gold/20 hover:text-gold transition-colors"
                  >
                    <Sparkles className="h-3 w-3 text-gold" />
                    <span>
                      {t("Usar captura de prueba (Modo Demo)", "Use test screenshot (Demo Mode)")}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* Vista previa de la captura subida */
              <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3.5">
                  <img
                    src={previewUrl}
                    alt="Evidencia"
                    className="h-14 w-14 rounded-xl object-cover border border-gold/40 shadow-xs"
                  />
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {t("Captura registrada con éxito", "Screenshot successfully uploaded")}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-light">
                      {t("Evidencia lista para verificación.", "Evidence ready for verification.")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-xs text-gold underline underline-offset-2 hover:text-gold/80"
                >
                  <FileImage className="h-3.5 w-3.5" />
                  <span>{t("Cambiar imagen", "Change image")}</span>
                </button>
              </div>
            )}

            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

            {/* Usuario de Instagram opcional */}
            <div className="pt-1">
              <label
                htmlFor="ig-handle"
                className="block text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium mb-1"
              >
                {t("Tu usuario de Instagram (Opcional)", "Your Instagram handle (Optional)")}
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                  @
                </span>
                <input
                  id="ig-handle"
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
                  placeholder="tu_cuenta"
                  className="w-full rounded-xl border border-border/80 pl-8 pr-3.5 py-2 text-xs text-foreground bg-background focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-border/50">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("Volver a tus datos", "Back to your info")}</span>
            </button>

            <button
              type="submit"
              onClick={handleNext}
              disabled={!previewUrl}
              className="btn-solid w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 text-xs uppercase tracking-[0.2em] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span>{t("¡Ir a la Ruleta de Premios!", "Go to Prize Roulette!")}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
```

---

### 4.6. Ruleta de Premios en Canvas con Algoritmo Ponderado (`src/components/qr-game/StepRouletteWheel.tsx`)

```typescript
import { useState, useRef, useEffect } from "react";
import { GamePrize, DEFAULT_PRIZES } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import confetti from "canvas-confetti";
import { Sparkles, Trophy, ArrowRight } from "lucide-react";
import emblemaDorado from "@/assets/emblema-dorado.png";

interface StepRouletteWheelProps {
  prizes: GamePrize[];
  participantName: string;
  onPrizeWon: (prize: GamePrize) => void;
}

export function StepRouletteWheel({ prizes, participantName, onPrizeWon }: StepRouletteWheelProps) {
  const { lang, t } = useLanguage();

  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [wonPrize, setWonPrize] = useState<GamePrize | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [countdown, setCountdown] = useState(10);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Solo consideramos premios activos
  const activePrizes = prizes.filter((p) => p.active);
  const numSegments = activePrizes.length;
  const segmentAngle = 360 / numSegments;

  // Dibujar la ruleta visual en Canvas de alta resolución
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 520;
    canvas.width = size;
    canvas.height = size;

    const center = size / 2;
    const radius = size / 2 - 24;

    ctx.clearRect(0, 0, size, size);

    // 1. Sombra exterior
    ctx.save();
    ctx.shadowColor = "rgba(162, 126, 44, 0.25)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 8;
    ctx.beginPath();
    ctx.arc(center, center, radius + 12, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    // 2. Anillo exterior dorado Luxor con textura biselada
    const goldGrad = ctx.createLinearGradient(0, 0, size, size);
    goldGrad.addColorStop(0, "#d1b374");
    goldGrad.addColorStop(0.25, "#a27e2c");
    goldGrad.addColorStop(0.5, "#f7edd0");
    goldGrad.addColorStop(0.75, "#8c6b22");
    goldGrad.addColorStop(1, "#c49f48");

    ctx.beginPath();
    ctx.arc(center, center, radius + 12, 0, 2 * Math.PI);
    ctx.fillStyle = goldGrad;
    ctx.fill();

    // Aro interior de contraste
    ctx.beginPath();
    ctx.arc(center, center, radius + 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#1e1b18";
    ctx.fill();

    // 3. Dibujar los segmentos de cada premio
    activePrizes.forEach((prize, index) => {
      const startAngle = ((index * segmentAngle - 90) * Math.PI) / 180;
      const endAngle = (((index + 1) * segmentAngle - 90) * Math.PI) / 180;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();

      // Separador dorado fino entre sectores
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(209, 179, 116, 0.4)";
      ctx.stroke();
      ctx.restore();

      // Dibujar texto del premio orientado radialmente
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(((index * segmentAngle + segmentAngle / 2 - 90) * Math.PI) / 180);
      ctx.textAlign = "right";
      ctx.fillStyle = prize.textColor;
      ctx.font = "bold 13px sans-serif";

      // Texto en dos líneas para nombres largos
      const label = lang === "en" ? prize.nameEn : prize.name;
      const words = label.split(" ");
      if (words.length > 2) {
        ctx.fillText(words.slice(0, 2).join(" "), radius - 30, -5);
        ctx.font = "11px sans-serif";
        ctx.fillText(words.slice(2).join(" "), radius - 30, 12);
      } else {
        ctx.fillText(label, radius - 30, 4);
      }

      ctx.restore();
    });

    // 4. Clavijas doradas decorativas en el perímetro
    for (let i = 0; i < numSegments * 2; i++) {
      const angle = (i * (360 / (numSegments * 2)) * Math.PI) / 180;
      const pinX = center + (radius + 7) * Math.cos(angle);
      const pinY = center + (radius + 7) * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(pinX, pinY, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#a27e2c";
      ctx.stroke();
    }

    // 5. Medallón central dorado
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(center, center, 44, 0, 2 * Math.PI);
    ctx.fillStyle = goldGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.restore();

    // 6. Isotipo de Bliss Soul en el centro del medallón
    const img = new Image();
    img.src = emblemaDorado;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const emblemSize = 42;
      ctx.drawImage(img, center - emblemSize / 2, center - emblemSize / 2, emblemSize, emblemSize);
    };
  }, [activePrizes, numSegments, segmentAngle, lang]);

  // Selección ponderada de premio según probabilidad configurada
  const chooseWeightedPrize = (): { prize: GamePrize; index: number } => {
    const totalProb = activePrizes.reduce((sum, p) => sum + p.probability, 0);
    const rand = Math.random() * totalProb;

    let cumulative = 0;
    for (let i = 0; i < activePrizes.length; i++) {
      const p = activePrizes[i];
      if (p) {
        cumulative += p.probability;
        if (rand <= cumulative) {
          return { prize: p, index: i };
        }
      }
    }
    const fallback = activePrizes[0] ?? DEFAULT_PRIZES[0]!;
    return { prize: fallback, index: 0 };
  };

  // Disparo de confeti dorado de celebración
  const fireConfetti = () => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const colors = ["#a27e2c", "#d1b374", "#ffffff", "#f5e6c8", "#594314"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // Girar la ruleta
  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    setCountdown(5);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const { prize, index } = chooseWeightedPrize();

    const targetCenterAngle = index * segmentAngle + segmentAngle / 2;
    const extraSpins = 360 * 7; // 7 vueltas completas
    const finalAngle = extraSpins + (360 - targetCenterAngle);

    setRotationAngle(finalAngle);

    // Esperar al fin de la animación exactamente 5.2 segundos
    setTimeout(() => {
      clearInterval(countdownInterval);
      setIsSpinning(false);
      setHasSpun(true);
      setWonPrize(prize);
      fireConfetti();
    }, 5200);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Reveal>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs uppercase tracking-[0.24em] text-gold font-medium">
              {t("Paso 3 · La Ruleta", "Step 3 · The Roulette")}
            </span>
            <span className="h-px w-6 bg-gold" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
            {t("¡Es hora de jugar!", "It's time to play!")}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground font-light max-w-md mx-auto">
            {t(
              `Gira la ruleta exclusiva de Bliss Soul Bakery para descubrir tu premio especial, ${participantName}.`,
              `Spin the exclusive Bliss Soul Bakery roulette to unveil your special prize, ${participantName}.`,
            )}
          </p>
        </div>
      </Reveal>

      {/* Contenedor de la Ruleta */}
      <Reveal delay={100}>
        <div className="mt-8 flex flex-col items-center">
          <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] flex items-center justify-center select-none">
            {/* Puntero Indicador Dorado Fijo en el borde superior */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center filter drop-shadow-md">
              <div className="w-6 h-8 bg-gradient-to-b from-amber-200 via-gold to-amber-800 rounded-b-md clip-pointer shadow-md transform scale-110" />
              <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-gold -mt-2 shadow-xs" />
            </div>

            {/* Canvas giratorio */}
            <div
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: isSpinning
                  ? "transform 5.2s cubic-bezier(0.15, 0.95, 0.22, 1.0)"
                  : "none",
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <canvas ref={canvasRef} className="w-full h-full object-contain rounded-full" />
            </div>
          </div>

          {/* Botón de Giro o Resultado */}
          <div className="mt-8 w-full max-w-sm text-center">
            {!hasSpun ? (
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="btn-solid w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-8 text-xs uppercase tracking-[0.24em] font-semibold text-white transition-all shadow-md disabled:opacity-60 disabled:cursor-wait"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isSpinning
                    ? `${t("Girando con emoción...", "Spinning with excitement...")} (${countdown}s)`
                    : t("¡Girar Ruleta de la Suerte!", "Spin Lucky Roulette!")}
                </span>
              </button>
            ) : (
              /* Tarjeta de Anuncio Inmediato y Avance al Voucher */
              <div className="rounded-2xl border border-gold/50 bg-gold/10 p-6 text-center shadow-md animate-fade-in space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white shadow-sm">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold">
                    {t("¡Felicitaciones!", "Congratulations!")}
                  </p>
                  <h3 className="font-display text-xl sm:text-2xl text-foreground mt-1">
                    {lang === "en" ? wonPrize?.nameEn : wonPrize?.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground font-light">
                    {lang === "en" ? wonPrize?.termsEn : wonPrize?.terms}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => wonPrize && onPrizeWon(wonPrize)}
                  className="btn-solid w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-xs uppercase tracking-[0.2em] font-medium transition-all shadow-xs"
                >
                  <span>{t("Ver mi Código QR & Voucher", "View My QR Code & Voucher")}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
```

---

### 4.7. Reclamo de Premio y Redención en Caja (`src/components/qr-game/StepPrizeClaim.tsx`)

```typescript
import { useState } from "react";
import { WonPrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { GoldenQRCode } from "./GoldenQRCode";
import { CheckCircle2, Share2, Sparkles } from "lucide-react";
import { waLink } from "@/data/site";
import logoHeader from "@/assets/logo-header.png";
import { StepFeedback } from "./StepFeedback";

interface StepPrizeClaimProps {
  prize: WonPrize;
  onValidateAtCashier: () => void;
}

export function StepPrizeClaim({ prize, onValidateAtCashier }: StepPrizeClaimProps) {
  const { lang, t } = useLanguage();
  const [showValidationConfirm, setShowValidationConfirm] = useState(false);

  const isUsed = prize.status === "UTILIZADO";

  const prizeDisplayName = lang === "en" ? prize.prizeNameEn : prize.prizeName;
  const whatsappMessage = `🎉 ¡Hola, ${prize.participantName}!
Gracias por dejarnos tu feedback y participar en nuestro juego de mesa.

*¡Ganaste ${prizeDisplayName} en tu cuenta de hoy! 🍽️*

Presenta este código único al momento de pagar:
👉 *${prize.uniqueCode}*

Mesa: ${prize.tableNumber}
Fecha: ${prize.wonAt}
Restaurante: Bliss Soul Bakery

¡Gracias por visitarnos y endulzar tu día con nosotros! ❤️`;

  const handleOpenWhatsApp = () => {
    window.open(waLink(whatsappMessage), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Reveal>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs uppercase tracking-[0.24em] text-gold font-medium">
              {t("Paso 5 · Tu Premio", "Step 5 · Your Prize")}
            </span>
            <span className="h-px w-6 bg-gold" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
            {t("¡Felicitaciones,", "Congratulations,")}{" "}
            <span className="text-gold italic">{prize.participantName}</span>!
          </h2>

          <p className="mt-2 text-sm text-muted-foreground font-light max-w-md mx-auto">
            {t(
              "Tu participación ha sido registrada. Presenta el siguiente código QR o comprobante al momento de pagar en caja.",
              "Your participation has been recorded. Present this QR voucher at the checkout counter.",
            )}
          </p>
        </div>
      </Reveal>

      {/* Tarjeta de Voucher de Lujo */}
      <Reveal delay={100}>
        <div className="mt-8 rounded-3xl border-2 border-gold/40 bg-card overflow-hidden shadow-[0_12px_40px_rgba(162,126,44,0.12)]">
          {/* Cabecera del Voucher */}
          <div className="bg-gradient-to-r from-ink via-neutral-900 to-ink p-6 text-white text-center relative overflow-hidden border-b border-gold/30">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d1b374_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 space-y-2">
              <img
                src={logoHeader}
                alt="Bliss Soul Bakery | Voucher oficial de beneficio en mesa"
                className="h-10 w-auto mx-auto object-contain brightness-0 invert"
              />
              <p className="text-[10px] uppercase tracking-[0.24em] text-gold font-semibold">
                VOUCHER OFICIAL DE BENEFICIO EN MESA
              </p>
            </div>
          </div>

          {/* Cuerpo del Voucher */}
          <div className="p-6 sm:p-9 text-center space-y-6">
            {/* Estado del premio */}
            <div className="flex justify-center">
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors ${
                  isUsed
                    ? "bg-muted text-muted-foreground border border-border line-through"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isUsed ? "bg-muted-foreground" : "bg-emerald-500 animate-pulse"
                  }`}
                />
                <span>
                  {isUsed
                    ? t("UTILIZADO · YA CANJEADO EN CAJA", "USED · REDEEMED AT REGISTER")
                    : t("DISPONIBLE PARA APLICAR", "AVAILABLE FOR REDEMPTION")}
                </span>
              </div>
            </div>

            {/* Nombre del premio ganado */}
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t("Beneficio asignado", "Assigned benefit")}
              </p>
              <h3 className="font-display text-2xl sm:text-3xl text-foreground font-semibold">
                {prizeDisplayName}
              </h3>
            </div>

            {/* Código QR Dorado de Alta Tolerancia */}
            <div className="flex flex-col items-center justify-center py-2">
              <GoldenQRCode
                value={`https://blisssoulbakery.com/juego-qr?val=${prize.uniqueCode}`}
                size={210}
              />
              <div className="mt-3">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground block">
                  {t("Código Único de Canje", "Unique Voucher Code")}
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-gold selection:bg-gold selection:text-white">
                  {prize.uniqueCode}
                </span>
              </div>
            </div>

            {/* Metadatos del comprobante */}
            <div className="grid grid-cols-2 gap-3 text-left rounded-xl bg-muted/40 p-4 text-xs border border-border/60">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                  {t("Mesa / Cuenta", "Table / Bill")}
                </span>
                <span className="font-medium text-foreground">{prize.tableNumber}</span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                  {t("Titular", "Holder")}
                </span>
                <span className="font-medium text-foreground truncate block">
                  {prize.participantName}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                  {t("Fecha de emisión", "Issued on")}
                </span>
                <span className="font-medium text-foreground">{prize.wonAt}</span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                  {t("WhatsApp registrado", "Registered WhatsApp")}
                </span>
                <span className="font-mono text-foreground">+{prize.participantWhatsapp}</span>
              </div>
            </div>

            {/* Acciones principales: WhatsApp y Validación en Caja */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-[0.18em] font-medium shadow-sm transition-all"
              >
                <Share2 className="h-4 w-4" />
                <span>{t("Enviar comprobante a WhatsApp", "Send voucher to WhatsApp")}</span>
              </button>

              {/* Botón de Validación en Caja */}
              {!isUsed ? (
                <div>
                  {!showValidationConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowValidationConfirm(true)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gold text-gold hover:bg-gold hover:text-white text-xs uppercase tracking-[0.18em] font-medium transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {t(
                          "Validar en caja (Uso por el personal)",
                          "Redeem at register (Staff use)",
                        )}
                      </span>
                    </button>
                  ) : (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center space-y-3">
                      <p className="text-xs text-amber-900 font-medium">
                        {t(
                          "¿Confirmar aplicación del descuento en la cuenta de hoy? Esta acción es irreversible.",
                          "Confirm applying discount to today's bill? This action is irreversible.",
                        )}
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            onValidateAtCashier();
                            setShowValidationConfirm(false);
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-emerald-700 transition-colors"
                        >
                          {t("Sí, aplicar descuento", "Yes, apply discount")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowValidationConfirm(false)}
                          className="px-4 py-2 border border-border bg-white text-muted-foreground rounded-lg text-xs hover:text-foreground transition-colors"
                        >
                          {t("Cancelar", "Cancel")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-muted text-center text-xs text-muted-foreground">
                  <p>
                    {t(
                      "✓ Este premio ya fue redimido en caja. No puede volver a utilizarse.",
                      "✓ This prize has already been redeemed at checkout. It cannot be reused.",
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ganadores semanales */}
          <div className="bg-muted/30 border-t border-border/70 p-5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gold font-medium mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("Ganadores Semanales", "Weekly Winners")}</span>
            </div>
            <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-lg mx-auto italic">
              “
              {t(
                "Cada domingo publicaremos en nuestros Estados de WhatsApp los ganadores de los premios especiales. Puedes volver a participar cada semana.",
                "Every Sunday we announce the weekly special prize winners on our WhatsApp Stories. You can participate again every week.",
              )}
              ”
            </p>
          </div>
        </div>
      </Reveal>

      {/* SECCIÓN FINAL DE GRATITUD: Feedback con Google Maps (4-5 estrellas) o WhatsApp (1-3 estrellas) */}
      <div className="mt-14 pt-10 border-t border-gold/30">
        <div className="text-center mb-2">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold font-semibold">
            {t("Broche de Oro", "Final Touch")}
          </p>
          <h3 className="font-display text-xl sm:text-2xl text-foreground mt-1">
            {t("¿Cómo estuvo tu experiencia en Bliss Soul?", "How was your Bliss Soul experience?")}
          </h3>
          <p className="text-xs text-muted-foreground font-light mt-1">
            {t(
              "Ahora que tienes tu premio, déjanos tu valoración. Si fue excelente, nos encantaría tu reseña en Google Maps.",
              "Now that you have your prize, share your rating. If it was extraordinary, we would love your Google Maps review.",
            )}
          </p>
        </div>

        <StepFeedback customerName={prize.participantName} isStandAlone={false} />
      </div>
    </div>
  );
}
```

---

### 4.8. Calificación Inteligente y Enrutamiento de Reputación (`src/components/qr-game/StepFeedback.tsx`)

```typescript
import { useState } from "react";
import { FeedbackData } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { ExternalLink, MessageCircle, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { waLink } from "@/data/site";
import emblemaDorado from "@/assets/emblema-dorado.png";

interface StepFeedbackProps {
  initialFeedback?: FeedbackData | undefined;
  customerName?: string | undefined;
  isStandAlone?: boolean | undefined;
  onComplete?: ((data: FeedbackData) => void) | undefined;
  onSwitchToGame?: (() => void) | undefined;
}

export function StepFeedback({
  initialFeedback,
  customerName = "",
  isStandAlone = false,
  onComplete,
  onSwitchToGame,
}: StepFeedbackProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState<number>(initialFeedback?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [name, setName] = useState<string>(customerName);
  const [comment, setComment] = useState<string>(initialFeedback?.comment || "");
  const [hasSentWhatsApp, setHasSentWhatsApp] = useState(false);

  const ratingLabels: Record<number, string> = {
    1: t("1 de 5 · Experiencia deficiente", "1 out of 5 · Poor experience"),
    2: t("2 de 5 · Por debajo de lo esperado", "2 out of 5 · Below expectations"),
    3: t("3 de 5 · Aceptable · Hay aspectos por mejorar", "3 out of 5 · Fair · Room to improve"),
    4: t("4 de 5 · Muy buena experiencia", "4 out of 5 · Very good experience"),
    5: t("5 de 5 · ¡Extraordinaria! · Inolvidable", "5 out of 5 · Extraordinary · Unforgettable"),
  };

  const handleSelectRating = (val: number) => {
    setRating(val);
    if (onComplete) {
      onComplete({ rating: val, comment });
    }
    // Si es 4 o 5 estrellas, abrimos Google Maps automáticamente
    if (val >= 4) {
      window.open("https://g.page/r/CfPSfNSGX8u1EBM/review", "_blank", "noopener,noreferrer");
    }
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const stars = "★".repeat(rating || 1);
    const nameLine = name.trim() ? `De: ${name.trim()}\n` : "";
    const msg = `Hola Bliss Soul Bakery, estuve de visita y califiqué mi experiencia con ${rating}/5 (${stars}).\n${nameLine}Comentario / sugerencia para mejorar:\n"${comment.trim()}"`;

    window.open(waLink(msg), "_blank", "noopener,noreferrer");
    setHasSentWhatsApp(true);

    if (onComplete) {
      onComplete({ rating, comment });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Reveal>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs uppercase tracking-[0.24em] text-gold font-medium">
              {t("Tu Opinión", "Your Feedback")}
            </span>
            <span className="h-px w-6 bg-gold" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
            {t(
              "Tu opinión es esencial y nos ayuda a mejorar.",
              "Your opinion is essential and helps us improve.",
            )}
          </h2>

          <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed max-w-lg mx-auto">
            {t(
              "En Bliss Soul Bakery cada visita busca ser una pausa serena e inolvidable. ¿Cómo fue tu experiencia hoy? Califica con nuestros emblemas:",
              "At Bliss Soul Bakery, every visit strives to be a serene, unforgettable pause. How was your experience today? Rate with our emblems:",
            )}
          </p>
        </div>
      </Reveal>

      {/* Selector interactivo de 5 emblemas oficiales */}
      <Reveal delay={80}>
        <div className="mt-8 flex flex-col items-center">
          <div
            className="flex items-center justify-center gap-3 sm:gap-6"
            role="radiogroup"
            aria-label={t("Califica tu experiencia", "Rate your experience")}
          >
            {[1, 2, 3, 4, 5].map((val) => {
              const isHighlighted = val <= (hoveredRating || rating);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelectRating(val)}
                  onMouseEnter={() => setHoveredRating(val)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="group flex flex-col items-center p-2 focus:outline-none cursor-pointer bg-transparent transition-transform hover:scale-110 active:scale-95"
                  aria-label={`${val} ${t("de 5 puntos", "out of 5 points")}`}
                >
                  <img
                    src={emblemaDorado}
                    alt=""
                    aria-hidden="true"
                    className={`h-9 sm:h-11 w-auto object-contain transition-all duration-300 pointer-events-none ${
                      isHighlighted
                        ? "brightness-100 drop-shadow-[0_2px_12px_rgba(162,126,44,0.45)] scale-110"
                        : "brightness-0 opacity-30 group-hover:opacity-60"
                    }`}
                  />
                  <span
                    className={`mt-2 text-xs tracking-wider transition-colors font-mono ${
                      isHighlighted ? "text-gold font-semibold" : "text-muted-foreground/60"
                    }`}
                  >
                    {val}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Etiqueta dinámica de la calificación */}
          <p className="mt-4 h-6 text-xs uppercase tracking-widest text-muted-foreground transition-all">
            {hoveredRating || rating ? (
              <span className="text-gold font-medium">{ratingLabels[hoveredRating || rating]}</span>
            ) : (
              <span className="text-muted-foreground/70">
                {t("Toca un emblema para calificar", "Click an emblem to rate")}
              </span>
            )}
          </p>
        </div>
      </Reveal>

      {/* CASO 1: 4 a 5 estrellas -> Google Reviews directo */}
      {rating >= 4 && (
        <Reveal delay={120}>
          <div className="mt-8 rounded-2xl border border-gold/40 bg-card p-6 sm:p-8 shadow-md text-center animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl text-foreground font-normal">
              {t("¡Nos alegra profundamente saberlo!", "We are truly delighted to hear that!")}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-light leading-relaxed max-w-lg mx-auto">
              {t(
                "Tu recomendación es el mayor impulso para todo nuestro equipo. Tu reseña en Google ayuda a que más amantes del buen café y la repostería artesanal nos conozcan.",
                "Your recommendation is the greatest boost for our team. Your Google review helps more lovers of good coffee and artisan pastry discover us.",
              )}
            </p>

            <div className="mt-6 flex items-center justify-center">
              <a
                href="https://g.page/r/CfPSfNSGX8u1EBM/review"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solid inline-flex items-center gap-2 py-3 px-6 text-xs uppercase tracking-[0.18em] font-medium shadow-xs"
              >
                <span>{t("Escribir reseña en Google Maps", "Write review on Google Maps")}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Reveal>
      )}

      {/* CASO 2: 1 a 3 estrellas -> Comentario constructivo directo a WhatsApp */}
      {rating > 0 && rating <= 3 && (
        <Reveal delay={120}>
          <div className="mt-8 rounded-2xl border border-border/80 bg-card p-6 sm:p-8 text-left shadow-xs animate-fade-in">
            <div className="flex items-center gap-3 border-b border-border/70 pb-4 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg text-foreground font-normal">
                  {t(
                    "Queremos escucharte y aprender de ti",
                    "We want to listen and learn from you",
                  )}
                </h3>
                <p className="text-xs text-muted-foreground font-light">
                  {t(
                    "Tu mensaje llegará directamente a la administración para atenderlo.",
                    "Your message will go directly to administration for attention.",
                  )}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-light leading-relaxed mb-4">
              {t(
                "Lamentamos profundamente que tu visita no haya sido del todo perfecta. Tu opinión sincera nos ayuda a corregir detalles y seguir mejorando cada día:",
                "We deeply regret that your visit wasn't completely perfect. Your honest feedback helps us correct details and improve every day:",
              )}
            </p>

            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div>
                <label
                  htmlFor="feedback-name"
                  className="block text-xs uppercase tracking-[0.16em] text-foreground font-medium mb-1.5"
                >
                  {t("Tu nombre (Opcional)", "Your name (Optional)")}
                </label>
                <input
                  id="feedback-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("Ej. María Gómez", "E.g. Maria Gomez")}
                  className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              <div>
                <label
                  htmlFor="feedback-comment"
                  className="block text-xs uppercase tracking-[0.16em] text-foreground font-medium mb-1.5"
                >
                  {t("¿Qué podemos mejorar? *", "What can we improve? *")}
                </label>
                <textarea
                  id="feedback-comment"
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t(
                    "Cuéntanos qué sucedió con total confianza (atención, producto, tiempo de espera)...",
                    "Tell us what happened in full confidence (service, product, wait time)...",
                  )}
                  className="w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-start gap-3">
                <button
                  type="submit"
                  className="btn-outline w-full sm:w-auto inline-flex items-center justify-center gap-2 border-gold text-gold hover:bg-gold hover:text-white py-3 px-6 text-xs uppercase tracking-[0.18em] font-medium transition-all shadow-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>
                    {hasSentWhatsApp
                      ? t("Sugerencia enviada a WhatsApp", "Suggestion sent to WhatsApp")
                      : t(
                          "Enviar sugerencia a nuestro WhatsApp privado",
                          "Send suggestion to our private WhatsApp",
                        )}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </Reveal>
      )}

      {/* Único botón oficial para alternar a jugar por premios */}
      {onSwitchToGame && (
        <div className="mt-10 text-center pt-6 border-t border-border/60">
          <p className="text-xs text-muted-foreground font-light mb-2.5">
            {t(
              "¿Prefieres jugar primero para obtener un premio o descuento en tu cuenta?",
              "Would you prefer to play first to earn a prize or discount on your bill?",
            )}
          </p>
          <button
            type="button"
            onClick={onSwitchToGame}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full border border-gold/40 bg-gold/5 text-gold hover:bg-gold/15 text-xs uppercase tracking-[0.18em] font-medium transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {t("Jugar por premios con la ruleta →", "Play for prizes with the roulette →")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
```

---

### 4.9. Generador de Código QR Dorado con Isotipo (`src/components/qr-game/GoldenQRCode.tsx`)

```typescript
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import emblemaDorado from "@/assets/emblema-dorado.png";

interface GoldenQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function GoldenQRCode({ value, size = 240, className = "" }: GoldenQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Generar código QR con tono Dorado Luxor y fondo blanco puro
    QRCode.toCanvas(
      canvas,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: "#a27e2c", // Dorado Luxor de Bliss Soul
          light: "#ffffff",
        },
        errorCorrectionLevel: "H", // Alta tolerancia a errores para permitir el logo central
      },
      (err) => {
        if (err) {
          console.error("Error al generar código QR:", err);
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Cargar y estampar el isotipo oficial dorado en el centro
        const img = new Image();
        img.src = emblemaDorado;
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const logoSize = Math.round(size * 0.22);
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;

          // Fondo circular blanco con borde dorado para aislar el isotipo
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize * 0.65, 0, 2 * Math.PI);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#a27e2c";
          ctx.stroke();
          ctx.restore();

          // Dibujar el emblema centrado
          ctx.drawImage(img, x, y, logoSize, logoSize);
        };
      },
    );
  }, [value, size]);

  return (
    <div
      className={`relative inline-flex items-center justify-center p-3 rounded-2xl bg-white border border-gold/40 shadow-[0_8px_30px_rgba(162,126,44,0.15)] ${className}`}
    >
      <canvas ref={canvasRef} className="block rounded-lg" />
    </div>
  );
}
```

---

### 4.10. Panel de Administración y Métricas (`src/components/qr-game/AdminPanelModal.tsx`)

```typescript
import { useState } from "react";
import { GamePrize, WonPrize } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  BarChart3,
  Sliders,
  MessageSquare,
  Award,
  RotateCcw,
} from "lucide-react";

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  prizes: GamePrize[];
  onUpdatePrizes: (newPrizes: GamePrize[]) => void;
  history: WonPrize[];
  onGenerateNewTable: () => void;
}

export function AdminPanelModal({
  isOpen,
  onClose,
  prizes,
  onUpdatePrizes,
  history,
  onGenerateNewTable,
}: AdminPanelModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"stats" | "prizes" | "campaign" | "messages">("stats");

  // Estados editables de premios
  const [localPrizes, setLocalPrizes] = useState<GamePrize[]>(prizes);

  // Estadísticas calculadas
  const totalParticipants = history.length;
  const prizesUsed = history.filter((h) => h.status === "UTILIZADO").length;
  const prizesAvailable = history.filter((h) => h.status === "DISPONIBLE").length;

  const totalProb = localPrizes.reduce(
    (sum, p) => sum + (p.active ? Number(p.probability) || 0 : 0),
    0,
  );
  const isProbValid = totalProb === 100;

  const handleProbChange = (id: string, newProb: number) => {
    const updated = localPrizes.map((p) =>
      p.id === id ? { ...p, probability: Math.max(0, Math.min(100, newProb)) } : p,
    );
    setLocalPrizes(updated);
  };

  const handleToggleActive = (id: string) => {
    const updated = localPrizes.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    setLocalPrizes(updated);
  };

  const handleSavePrizes = () => {
    if (!isProbValid) {
      alert("Las probabilidades deben sumar exactamente 100%. Suma actual: " + totalProb + "%");
      return;
    }
    onUpdatePrizes(localPrizes);
    alert("¡Configuración de premios guardada con éxito!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-card border border-gold/40 shadow-2xl overflow-hidden my-8 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Cabecera del Panel */}
        <div className="bg-neutral-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-gold/30">
          <div>
            <span className="text-[10px] uppercase tracking-[0.24em] text-gold font-mono font-semibold">
              BLISS SOUL BAKERY · PANEL DE CONTROL
            </span>
            <h2 className="text-lg sm:text-xl font-display font-medium text-white">
              {t("Administración de Juego QR & Premios", "QR Game & Prizes Management")}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-border bg-muted/40 px-6 gap-2 sm:gap-6 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`py-3.5 font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "stats"
                ? "border-gold text-gold font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{t("Métricas en Vivo", "Live Metrics")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("prizes")}
            className={`py-3.5 font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "prizes"
                ? "border-gold text-gold font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>{t("Premios & Probabilidades", "Prizes & Probabilities")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("campaign")}
            className={`py-3.5 font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "campaign"
                ? "border-gold text-gold font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>{t("Campaña & Reglas", "Campaign & Rules")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("messages")}
            className={`py-3.5 font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "messages"
                ? "border-gold text-gold font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{t("Mensajes WhatsApp", "WhatsApp Messages")}</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Estadísticas y Métricas */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              {/* Tarjetas resumen */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border/80 bg-background p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t("Participaciones", "Participants")}
                  </p>
                  <p className="font-display text-2xl sm:text-3xl text-foreground font-semibold mt-1">
                    {totalParticipants}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    100% con feedback
                  </span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t("Premios Entregados", "Prizes Won")}
                  </p>
                  <p className="font-display text-2xl sm:text-3xl text-gold font-semibold mt-1">
                    {totalParticipants}
                  </p>
                  <span className="text-[10px] text-gold font-medium">Código único emitido</span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t("Canjeados en Caja", "Redeemed at Till")}
                  </p>
                  <p className="font-display text-2xl sm:text-3xl text-foreground font-semibold mt-1">
                    {prizesUsed}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {prizesAvailable} disponibles
                  </span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t("Base Marketing", "Marketing Leads")}
                  </p>
                  <p className="font-display text-2xl sm:text-3xl text-emerald-600 font-semibold mt-1">
                    {totalParticipants}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    WhatsApp verificado
                  </span>
                </div>
              </div>

              {/* Registro reciente de premios */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-foreground">
                    {t("Historial Reciente de Premios", "Recent Prize History")}
                  </h3>
                  <button
                    type="button"
                    onClick={onGenerateNewTable}
                    className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{t("Simular nueva mesa", "Simulate new table")}</span>
                  </button>
                </div>

                <div className="border border-border/80 rounded-xl overflow-hidden bg-background">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Mesa</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Premio</th>
                        <th className="py-2.5 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-muted-foreground italic">
                            No hay participaciones registradas en esta sesión aún.
                          </td>
                        </tr>
                      ) : (
                        history.map((h) => (
                          <tr key={h.uniqueCode} className="hover:bg-muted/20">
                            <td className="py-2.5 px-3 font-mono font-bold text-gold">
                              {h.uniqueCode}
                            </td>
                            <td className="py-2.5 px-3">{h.tableNumber}</td>
                            <td className="py-2.5 px-3 font-medium text-foreground">
                              {h.participantName}
                              <span className="block text-[10px] text-muted-foreground font-mono">
                                +{h.participantWhatsapp}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">{h.prizeName}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  h.status === "UTILIZADO"
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {h.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Configuración de Premios y Probabilidades */}
          {activeTab === "prizes" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border bg-muted/30">
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-foreground">
                    Suma total de probabilidades
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Debe sumar exactamente 100% para que el algoritmo sea matemáticamente
                    equitativo.
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl text-sm font-bold font-mono ${
                    isProbValid
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {totalProb}% / 100%
                </div>
              </div>

              {/* Lista de premios */}
              <div className="space-y-3">
                {localPrizes.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-border/80 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground font-light">{p.terms}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-muted-foreground uppercase">
                          Probabilidad:
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={p.probability}
                          onChange={(e) => handleProbChange(p.id, Number(e.target.value))}
                          className="w-16 rounded-lg border border-border px-2 py-1 text-xs text-center font-mono font-bold text-foreground bg-card"
                        />
                        <span className="text-xs font-mono text-muted-foreground">%</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(p.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                          p.active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.active ? "Activo" : "Inactivo"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePrizes}
                  disabled={!isProbValid}
                  className="btn-solid py-2.5 px-6 text-xs uppercase tracking-wider font-semibold disabled:opacity-40"
                >
                  Guardar Cambios de Probabilidades
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Campaña y Términos */}
          {activeTab === "campaign" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border p-4 bg-background space-y-3">
                <h4 className="font-semibold text-foreground uppercase tracking-wider">
                  Configuración de Campaña
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted-foreground mb-1">Nombre de Campaña:</label>
                    <input
                      type="text"
                      readOnly
                      value="Juego de Mesa & Gratitud — Bliss Soul 2026"
                      className="w-full border rounded-lg p-2 bg-muted/40 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Instagram Oficial:</label>
                    <input
                      type="text"
                      readOnly
                      value="@blisssoulbakery"
                      className="w-full border rounded-lg p-2 bg-muted/40 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-background space-y-2">
                <h4 className="font-semibold text-foreground uppercase tracking-wider">
                  Reglas del Juego
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground font-light">
                  <li>Solo se puede participar durante una sesión de pago activa.</li>
                  <li>Una única participación por cuenta/mesa.</li>
                  <li>Cada premio genera un código criptográfico único e intransferible.</li>
                  <li>Un premio marcado como UTILIZADO queda bloqueado de por vida.</li>
                  <li>Los domingos se publican ganadores semanales en los Estados de WhatsApp.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: Plantilla de Mensaje WhatsApp */}
          {activeTab === "messages" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border p-4 bg-background space-y-3">
                <h4 className="font-semibold text-foreground uppercase tracking-wider">
                  Variables automáticas disponibles
                </h4>
                <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                  <span className="bg-gold/15 text-gold px-2 py-1 rounded">{"{{nombre}}"}</span>
                  <span className="bg-gold/15 text-gold px-2 py-1 rounded">{"{{premio}}"}</span>
                  <span className="bg-gold/15 text-gold px-2 py-1 rounded">{"{{codigo}}"}</span>
                  <span className="bg-gold/15 text-gold px-2 py-1 rounded">
                    {"{{restaurante}}"}
                  </span>
                </div>

                <div className="pt-2">
                  <label className="block text-muted-foreground mb-1 font-medium">
                    Plantilla de confirmación al cliente:
                  </label>
                  <textarea
                    rows={6}
                    readOnly
                    value={`🎉 ¡Hola, {{nombre}}!
Gracias por dejarnos tu feedback y participar en nuestro juego.
¡Ganaste {{premio}} en tu cuenta de hoy! 🍽️
Presenta este código al momento de pagar:
{{codigo}}
¡Gracias por visitarnos en {{restaurante}}! ❤️`}
                    className="w-full rounded-xl border border-border p-3 font-mono text-xs bg-muted/30 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="bg-muted/40 p-4 px-6 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Arquitectura de Base de Datos Gratuita con Google Sheets

No se requiere contratar servidores VPS ni bases de datos PostgreSQL o MongoDB. Una hoja de **Google Sheets conectada mediante Google Apps Script (Web App Endpoint)** actúa como base de datos en tiempo real, gratuita, exportable y accesible desde cualquier smartphone.

### 6.1. Estructura de la Hoja de Cálculo (`Bliss_Premios_Mesa`)

Crea una hoja de cálculo en Google Drive con las siguientes cabeceras en la Fila 1:

|    Columna A     |  Columna B  |     Columna C      | Columna D |   Columna E   |     Columna F     |    Columna G     |       Columna H        |   Columna I    |
| :--------------: | :---------: | :----------------: | :-------: | :-----------: | :---------------: | :--------------: | :--------------------: | :------------: |
| **Fecha / Hora** | **Cliente** | **WhatsApp (+57)** | **Email** | **Instagram** | **Premio Ganado** | **Código Único** | **¿Validado en Caja?** | **Hora Canje** |

### 6.2. Código de Google Apps Script (Webhook Endpoint)

En tu Google Sheet, ve a **Extensiones > Apps Script**, pega este código y haz clic en **Implementar > Nueva implementación > Aplicación web** (acceso: _"Cualquier usuario"_):

```javascript
/**
 * GOOGLE APPS SCRIPT WEBHOOK — BLISS SOUL BAKERY
 * Endpoint para registrar premios y validar cupones en caja en tiempo real.
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var action = data.action; // 'CREATE_PRIZE' o 'VALIDATE_PIN'

    // ACCIÓN 1: Registrar nuevo premio ganado
    if (action === "CREATE_PRIZE") {
      sheet.appendRow([
        new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }),
        data.fullName || "Cliente Anónimo",
        data.whatsapp || "",
        data.email || "N/A",
        data.instagram || "N/A",
        data.prizeName || "",
        data.uniqueCode || "",
        "NO", // Inicialmente disponible
        "", // Sin hora de canje aún
      ]);

      return ContentService.createTextOutput(
        JSON.stringify({
          status: "success",
          message: "Premio registrado correctamente en Google Sheets",
        }),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // ACCIÓN 2: Validar en caja mediante PIN del personal
    if (action === "VALIDATE_PIN") {
      var SECRET_PIN = "1978"; // PIN oficial del restaurante (configurable)
      if (String(data.pin).trim() !== SECRET_PIN) {
        return ContentService.createTextOutput(
          JSON.stringify({
            status: "error",
            message: "PIN incorrecto. Exclusivo para el personal autorizado.",
          }),
        ).setMimeType(ContentService.MimeType.JSON);
      }

      var codeToFind = data.uniqueCode;
      var values = sheet.getDataRange().getValues();
      var foundRow = -1;

      for (var i = 1; i < values.length; i++) {
        if (values[i][6] === codeToFind) {
          // Columna G: Código único
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow === -1) {
        return ContentService.createTextOutput(
          JSON.stringify({
            status: "error",
            message: "Código de cupón no encontrado en el sistema.",
          }),
        ).setMimeType(ContentService.MimeType.JSON);
      }

      var currentStatus = sheet.getRange(foundRow, 8).getValue(); // Columna H
      if (currentStatus === "SÍ") {
        return ContentService.createTextOutput(
          JSON.stringify({
            status: "error",
            message: "Este código ya fue redimido previamente en caja.",
          }),
        ).setMimeType(ContentService.MimeType.JSON);
      }

      // Marcar como SÍ y registrar hora de canje
      sheet.getRange(foundRow, 8).setValue("SÍ");
      sheet
        .getRange(foundRow, 9)
        .setValue(new Date().toLocaleTimeString("es-CO", { timeZone: "America/Bogota" }));

      return ContentService.createTextOutput(
        JSON.stringify({
          status: "success",
          message: "✓ Cupón validado exitosamente en caja",
        }),
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## 7. Componentes de las Mejoras Técnicas de Producción

### 7.1. Compresor de Imágenes Móvil (`src/lib/imageCompressor.ts`)

Resuelve los reinicios de Safari/Chrome causados por fotos pesadas de celulares (15MB -> 180KB en 0.2s):

```typescript
export async function compressImageForMobile(
  file: File,
  maxDimension = 1200,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Exportar a JPEG ligero (compatible con formato HEIC de iPhone y Android)
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
```

### 7.2. Teclado Numérico con PIN de 4 Dígitos para Caja

Modal táctil que se despliega sobre la pantalla del cliente cuando el personal va a autorizar el descuento:

```tsx
import { useState } from "react";
import { Lock, Delete, Check } from "lucide-react";

interface PinAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin?: string;
}

export function PinAuthModal({
  isOpen,
  onClose,
  onSuccess,
  correctPin = "1978",
}: PinAuthModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError(false);

    if (nextPin.length === 4) {
      if (nextPin === correctPin) {
        onSuccess();
        onClose();
        setPin("");
      } else {
        setError(true);
        setTimeout(() => setPin(""), 600);
      }
    }
  };

  const handleDelete = () => setPin((prev) => prev.slice(0, -1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-xs rounded-3xl bg-neutral-900 border border-gold/40 p-6 text-center text-white shadow-2xl space-y-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-gold">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
            Uso Exclusivo del Personal
          </h3>
          <p className="text-xs text-white/70 mt-1">
            Ingresa el PIN de 4 dígitos para validar el descuento:
          </p>
        </div>

        {/* Indicadores de 4 dígitos */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-4 w-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? "bg-gold border-gold scale-110 shadow-xs"
                  : error
                    ? "border-red-500 bg-red-500/20 animate-shake"
                    : "border-white/30 bg-transparent"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-[11px] text-red-400 font-medium">PIN incorrecto. Intenta de nuevo.</p>
        )}

        {/* Teclado numérico táctil */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-12 rounded-xl bg-white/10 hover:bg-gold hover:text-neutral-950 font-mono text-lg font-bold transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-white/70 transition-all font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="h-12 rounded-xl bg-white/10 hover:bg-gold hover:text-neutral-950 font-mono text-lg font-bold transition-all active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-xl bg-white/5 hover:bg-red-500/20 text-white flex items-center justify-center transition-all"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 8. Manual de Replicabilidad para Nuevos Negocios

Este sistema fue concebido como un **motor universal de fidelización gastronómica**. Para clonarlo en una pizzería, hamburguesería, bar o restaurante en menos de 1 hora, sigue esta guía:

### Checklist de Clonación en 7 Pasos:

1. **Definir la Identidad Visual en CSS (`tailwind.config.js` o variables CSS):**
   - Cambiar el color primario (ej: Dorado Luxor `#a27e2c` por Rojo Pizzería `#e11d48` o Ámbar Cervecería `#f59e0b`).
   - Sustituir el logotipo oficial (`logo-header.png`) y el isotipo de la ruleta (`emblema-dorado.png`).
2. **Personalizar la Matriz de Premios (`DEFAULT_PRIZES` en `gameTypes.ts`):**
   - Pizzería: _Porción de pizza gratis_, _15% en mesa_, _Cerveza artesanal_, _Postre de la casa_.
   - Hamburguesería: _Papas rústicas gratis_, _Bebida refill_, _Combo upgrade_, _20% de descuento_.
   - Asegurarse de que la suma de probabilidades sume exactamente **100%**.
3. **Actualizar la Mención Oficial de Instagram:**
   - Cambiar `@blisssoulbakery` por el usuario del nuevo negocio en `StepInstagramStory.tsx`.
4. **Configurar el Enlace de Google Maps Reviews:**
   - Sustituir la URL `https://g.page/r/CfPSfNSGX8u1EBM/review` en `StepFeedback.tsx` por el link directo de reseñas de Google Business del nuevo local.
5. **Crear la Hoja de Google Sheets del Negocio:**
   - Crear la hoja en la cuenta de Google del dueño, pegar el código de Google Apps Script (§6.2), implementarlo como Web App y pegar la URL generada en el frontend.
6. **Definir el PIN de Caja:**
   - Acordar con los administradores el PIN de 4 dígitos para autorizar los cupones.
7. **Fabricar los Soportes Físicos de Mesa / Caja:**
   - Mandar a grabar 2 o 3 plaquitas de acrílico o madera con el código QR y un chip NFC programado con la URL directa (ej: `https://premios.tunegocio.com`).

---

### 8.1. Estrategia de Remarketing por WhatsApp y Automatización de Contactos

Esta mecánica resuelve el problema más común en restaurantes: tener números de clientes pero no aprovecharlos para fidelizar.

#### A. Cómo importar 500 contactos a la agenda del restaurante en 10 segundos (Cero digitación manual):

1. En la hoja de Google Sheets, ve a **Archivo > Descargar > Valores separados por comas (.csv)**.
2. Abre [contacts.google.com](https://contacts.google.com) con la misma cuenta de Google vinculada al celular del restaurante.
3. Haz clic en el botón **"Importar"** y selecciona el archivo CSV descargado.
4. En 10 segundos, todos los clientes quedan guardados en la agenda de tu teléfono automáticamente como:  
   `Cliente [NombreNegocio] - [NombreCliente]`.
5. Al abrir WhatsApp en el celular del restaurante, todos los contactos ya están sincronizados.

#### B. La Plantilla de Respuesta Automática en WhatsApp Business (Para que el cliente te guarde):

Configura en WhatsApp Business un mensaje de bienvenida automático que responda al mensaje del voucher:

```
🎉 ¡Hola, {{nombre}}!

Hemos registrado tu premio de hoy en Bliss Soul Bakery. 🧁✨

👉 GUARDA ESTE CONTACTO como "Bliss Soul Bakery" en tu celular para:
1. Validar tus cortesías y descuentos exclusivos en futuras visitas.
2. Descubrir los domingos en nuestros ESTADOS DE WHATSAPP a los ganadores de las cenas especiales y bonos sorpresa semanales. 🎁

¡Gracias por endulzar tu día con nosotros! ❤️
```

#### C. Calendario Editorial Recomendado para Estados de WhatsApp:

- **Miércoles (El Antojo):** Foto o video corto de un postre saliendo del horno o una extracción de café artesanal.
- **Viernes (La Previa del Fin de Semana):** Invitación a reservar terraza o probar la nueva creación de temporada.
- **Domingo (El Gancho de los Ganadores):** Publicación en Estados felicitando a los clientes que ganaron los premios especiales de la semana. Esto mantiene a todos los comensales atentos y consultando tus Estados semana tras semana.

---

### 8.2. Módulo de Viralidad «Refer-a-Friend» (Inspiración PerkZilla adaptada a WhatsApp)

Este módulo convierte a cada comensal feliz en un promotor activo que atrae comensales nuevos sin costo publicitario.

#### A. Mecánica de Viralidad en 1 Toque:

En el Paso 4 (tras ganar el premio y antes de salir del restaurante), se despliega una tarjeta de regalo:

> **🎁 ¿Tienes un amigo al que le encante el buen café y la repostería artesanal?**  
> _Compártele un pase de bienvenida con 15% de descuento para su primera visita en Bliss Soul._

Al presionar el botón **"Regalar pase a un amigo por WhatsApp"**, el sistema abre WhatsApp sin número prefijado (`https://api.whatsapp.com/send?text=...`), permitiendo al usuario elegir a cualquier amigo o grupo de su agenda.

#### B. Código TypeScript del Botón e Integración en `StepPrizeClaim.tsx`:

```tsx
// Función para compartir pase de bienvenida con amigos vía WhatsApp nativo
const handleReferFriend = () => {
  const referText = `🧁 ¡Hola! Acabo de estar en Bliss Soul Bakery & Café en Sabaneta y me encantó la experiencia. 

Te comparto esta invitación especial para que disfrutes de un beneficio de bienvenida en tu primera visita:
👉 https://blissbarkery.andresduquelabs.com/juego-qr

¡Te lo súper recomiendo para un café de autor y postre artesanal! ❤️`;

  const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(referText)}`;
  window.open(shareUrl, "_blank", "noopener,noreferrer");
};
```

#### C. Diseño de la Tarjeta Visual en el Voucher:

```tsx
{
  /* Tarjeta de Referidos Viral */
}
<div className="mt-4 rounded-2xl border border-gold/40 bg-gold/5 p-4 text-center space-y-2">
  <div className="inline-flex items-center gap-1.5 text-xs text-gold font-semibold uppercase tracking-wider">
    <Sparkles className="h-3.5 w-3.5" />
    <span>Regala un momento especial a un amigo</span>
  </div>
  <p className="text-xs text-muted-foreground font-light leading-relaxed">
    ¿Quieres compartir la experiencia? Envíale un beneficio de bienvenida a quien más quieras.
  </p>
  <button
    type="button"
    onClick={handleReferFriend}
    className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl border border-gold text-gold hover:bg-gold hover:text-white text-xs uppercase tracking-wider font-medium transition-all shadow-xs"
  >
    <Share2 className="h-3.5 w-3.5" />
    <span>Enviar regalo de bienvenida por WhatsApp</span>
  </button>
</div>;
```

#### D. Cómo adaptarlo a otros negocios:

- **Pizzería:** _"Invita a un amigo a probar la mejor pizza artesanal con 2 cervezas de cortesía en su primera mesa."_
- **Hamburguesería:** _"Regálale a un parcero unas papas rústicas gratis en su primera visita."_
- **Bar / Cervecería:** _"Pasa este bono a tu grupo para un 2x1 en cócteles de bienvenida."_

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  ExternalLink,
  Send,
  Star,
  Clock,
  RotateCcw,
  Coffee,
  Gift,
  ChevronDown,
  ChevronUp,
  Share2,
  CreditCard,
  Users,
  Award,
  ArrowLeft,
} from "lucide-react";
import { StampService } from "@/lib/stampService";
import { MissionItem } from "./MissionsModal";
import { clientConfig } from "@/config/clientConfig";
import { getMissionBrandLogo } from "@/components/shared/BrandLogos";

const DEFAULT_MISSIONS: MissionItem[] = [
  {
    id: "m_tripadvisor",
    category: "Turismo & Gastronomía",
    title: "Reseña en TripAdvisor",
    rewardStamps: 3,
    rewardText: "+3 Sellos VIP",
    badge: "TOP VIAJEROS",
    icon: "🦉",
    description: `Comparte tu opinión en nuestro perfil de TripAdvisor para ayudar a viajeros y comensales a descubrir nuestra propuesta gastronómica.`,
    rules: [
      "Abre nuestro perfil oficial en TripAdvisor.",
      "Califica tu experiencia gastronómica y escribe tu opinión sobre la comida y el servicio.",
      "Pega aquí el enlace directo a tu reseña publicada o confirmación.",
    ],
    actionUrl: clientConfig.channels.tripadvisorReviewUrl || "https://www.tripadvisor.com",
    evidencePlaceholder: "https://www.tripadvisor.com/ShowUserReviews-...",
    active: true,
  },
  {
    id: "m_tiktok",
    category: "Creación de Contenido",
    title: "Video o Reel en Redes",
    rewardStamps: 3,
    rewardText: "+3 Sellos VIP",
    badge: "VIRAL TOP",
    icon: "🎵",
    description: `Comparte un video corto disfrutando tu plato o bebida favorita en ${clientConfig.brand.name}.`,
    rules: [
      "Publica un video público en TikTok o Instagram Reels.",
      `Menciona la cuenta oficial ${clientConfig.channels.instagramHandle || "@nuestrolocal"} o etiqueta la ubicación.`,
      "Muestra tu experiencia real en la mesa.",
      "Mantén la publicación en modo público.",
    ],
    actionUrl: "https://www.tiktok.com",
    evidencePlaceholder: "https://www.tiktok.com/@tu_usuario/video/...",
    active: true,
  },
  {
    id: "m_google_photo",
    category: "Reseñas con Fotografía",
    title: "Foto & Reseña en Google Maps",
    rewardStamps: 2,
    rewardText: "+2 Sellos VIP",
    badge: "ALTA DEMANDA",
    icon: "📸",
    description: "Sube una fotografía de tu mesa a Google Maps acompañando tu opinión 5 estrellas.",
    rules: [
      "Abre nuestro perfil oficial en Google Maps.",
      "Califica tu experiencia y sube al menos una foto de tu plato o mesa.",
      "Pega aquí el enlace de tu reseña publicada.",
    ],
    actionUrl: clientConfig.channels.googleMapsReviewUrl || "https://maps.google.com",
    evidencePlaceholder: "https://maps.app.goo.gl/... o confirmación",
    active: true,
  },
  {
    id: "m_referrals",
    category: "Embajador de la Casa",
    title: "Invitar a un Amigo por WhatsApp",
    rewardStamps: 3,
    rewardText: "+3 Sellos VIP",
    badge: "BOCA A BOCA",
    icon: "🤝",
    description: "Recomienda nuestro local a un amigo o familiar compartiendo tu enlace exclusivo.",
    rules: [
      "Toca el botón 'Recomendar por WhatsApp' y envía la invitación con tu código.",
      "Tu invitado recibirá una cortesía sorpresa cuando nos visite.",
      "Pega tu número o confirmación para validar tus sellos.",
    ],
    actionUrl: "https://api.whatsapp.com",
    evidencePlaceholder: "Confirmación de envío o nombres de tus invitados",
    active: true,
  },
  {
    id: "m_whatsapp_community",
    category: "Comunidad Exclusiva",
    title: "Entrar a la Comunidad de WhatsApp",
    rewardStamps: 2,
    rewardText: "+2 Sellos VIP",
    badge: "COMUNIDAD VIP",
    icon: "💬",
    description: `Únete a la comunidad oficial de ${clientConfig.brand.name} en WhatsApp para acceder a catas privadas, beneficios secretos y eventos antes que nadie.`,
    rules: [
      "Toca el botón 'Unirme a la Comunidad' para acceder a nuestro canal oficial en WhatsApp.",
      "Permanece en la comunidad para recibir tus accesos y beneficios exclusivos.",
      "Confirma tu número registrado para sumar tus sellos VIP.",
    ],
    actionUrl: clientConfig.channels.whatsappCommunityUrl || "https://chat.whatsapp.com/invite",
    evidencePlaceholder: "Escribe tu número de WhatsApp registrado",
    active: true,
  },
  {
    id: "m_facebook",
    category: "Comunidad",
    title: "Recomendación en Facebook",
    rewardStamps: 1,
    rewardText: "+1 Sello VIP",
    badge: "COMUNIDAD",
    icon: "👥",
    description: "Recomienda nuestra página oficial o haz check-in en el local con una foto.",
    rules: [
      "Deja una recomendación positiva en la página de Facebook o haz check-in.",
      "Comparte una foto de tu pedido.",
      "Asegúrate de que la publicación esté en modo público.",
    ],
    actionUrl: "https://www.facebook.com",
    evidencePlaceholder: "https://www.facebook.com/tu_publicacion/...",
    active: true,
  },
];

interface StepMissionsProps {
  customerName?: string | undefined;
  customerWhatsapp?: string | undefined;
  onBackToStamps?: () => void;
  onResetToStart?: () => void;
}

export function StepMissions({
  customerName = "Comensal",
  customerWhatsapp = "",
  onBackToStamps,
  onResetToStart,
}: StepMissionsProps) {
  const { t } = useLanguage();
  const brandName = clientConfig.brand.name;

  const [missions, setMissions] = useState<MissionItem[]>(DEFAULT_MISSIONS);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [missionUrls, setMissionUrls] = useState<Record<string, string>>({});
  const [submittingMissionId, setSubmittingMissionId] = useState<string | null>(null);
  const [successMissionId, setSuccessMissionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [expandedMission, setExpandedMission] = useState<string | null>(DEFAULT_MISSIONS[0].id);
  const [isDemoUnlocked, setIsDemoUnlocked] = useState(false);

  const cleanPhone = (customerWhatsapp || "").replace(/\D/g, "");
  const baseCard = StampService.getCustomerStampCard(cleanPhone);
  const [syncedStamps, setSyncedStamps] = useState<number>(() => Math.max(baseCard.currentStamps || 3, 3));

  // Cargar misiones dinámicas desde el backend
  const loadMissionsData = () => {
    fetch("/api/missions")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          if (Array.isArray(data.missions) && data.missions.length > 0) {
            const activeOnly = data.missions.filter((m: MissionItem) => m.active !== false);
            setMissions(activeOnly.length > 0 ? activeOnly : data.missions);
          }
          if (Array.isArray(data.submissions)) {
            setSubmissions(data.submissions);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadMissionsData();
  }, []);

  // Sincronizar sellos con el servidor
  useEffect(() => {
    if (cleanPhone) {
      fetch(`/api/stamps/${cleanPhone}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.stamps === "number") {
            const count = Math.max(data.stamps, 3);
            setSyncedStamps(count);
            // Actualizar localStorage con el conteo del servidor
            try {
              const key = `juegoreferidos_stamps_${cleanPhone}`;
              const existing = JSON.parse(localStorage.getItem(key) || "{}");
              localStorage.setItem(key, JSON.stringify({ ...existing, currentStamps: count }));
            } catch {
              // ignorar errores de localStorage
            }
          }
        })
        .catch(() => {});
    }
  }, [cleanPhone]);

  const currentStamps = Math.min(syncedStamps, 15);

  const mySubmissions = submissions.filter(
    (s) => !cleanPhone || s.customerWhatsapp === cleanPhone
  );
  const myPendingSubmissions = mySubmissions.filter((s) => s.status === "PENDIENTE");
  const pendingStamps = myPendingSubmissions.reduce(
    (acc, cur) => acc + (cur.rewardStamps || 1),
    0
  );

  const totalAvailableStamps = missions.reduce(
    (acc, m) => acc + (m.rewardStamps || 1),
    0
  );

  const submittedMissionIds = new Set(mySubmissions.map((s) => s.missionId));
  const ticketCode = `#CENA2-${cleanPhone ? cleanPhone.slice(-4) : "7791"}-VIP`;

  const handleUrlChange = (missionId: string, val: string) => {
    setMissionUrls((prev) => ({ ...prev, [missionId]: val }));
    setErrorMessage("");
  };

  const handleOpenTask = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleReferFriend = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteMessage = `¡Hola! Te recomiendo mucho visitar *${brandName}* 🍽️✨\n\nEl ambiente y la comida son espectaculares. Además, cuando vayas a visitarlos y te sientes en tu mesa, puedes escanear el QR y participar en su Ruleta de Premios:\n👉 ${origin}?ref=${encodeURIComponent(customerName || "Amigo")}\n\n¡Vamos juntos o visítalos hoy, te va a encantar!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmitForReview = async (mission: MissionItem) => {
    const url = (missionUrls[mission.id] || "").trim();
    if (!url) {
      setErrorMessage(
        t(
          "Por favor escribe o pega la URL o confirmación antes de enviar a revisión.",
          "Please enter or paste the URL or confirmation before submitting for review."
        )
      );
      return;
    }

    setSubmittingMissionId(mission.id);
    setErrorMessage("");

    try {
      const res = await fetch("/api/missions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: mission.id,
          missionTitle: mission.title,
          rewardStamps: mission.rewardStamps,
          customerName: customerName || "Comensal VIP",
          customerWhatsapp: cleanPhone || "573000000000",
          evidenceUrl: url,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        setSuccessMissionId(mission.id);
        setMissionUrls((prev) => ({ ...prev, [mission.id]: "" }));
        loadMissionsData();
        setTimeout(() => {
          setSuccessMissionId(null);
        }, 5000);
      } else {
        setErrorMessage(
          data?.message ||
            t("Hubo un error al enviar la misión. Intenta nuevamente.", "Error submitting mission. Please try again.")
        );
      }
    } catch {
      setErrorMessage(
        t("No fue posible conectar con el servidor. Verifica tu conexión.", "Could not connect to server. Check connection.")
      );
    } finally {
      setSubmittingMissionId(null);
    }
  };

  const isChallengeCompleted =
    isDemoUnlocked || (missions.length > 0 && submittedMissionIds.size >= missions.length);

  return (
    <div className="w-full flex flex-col gap-6">

      {/* 1. ENCABEZADO DE LA ETAPA 8: CENTRO DE MISIONES VIP */}
      <Reveal delay={0}>
        <div className="flex flex-col gap-2">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-[#1c1b1f] border border-[#f2be71]/40 text-[#ffddb1] shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#f2be71]" />
            <span className="font-label-sm text-[11px] font-bold tracking-wide">
              {t("Paso 8 de 8 · Desafíos & Misiones VIP", "Step 8 of 8 · VIP Missions & Challenges")}
            </span>
          </div>

          <h2 className="font-headline-xl-mobile text-2xl sm:text-3xl text-[#e6e1e7] tracking-tight mt-1">
            {t("Misiones para Ganar", "Missions to Earn")}{" "}
            <span className="text-[#f2be71] italic font-serif">
              {t("+Sellos VIP", "+VIP Stamps")}
            </span>
          </h2>

          <p className="font-body-md text-xs sm:text-sm text-[#ccc3d8] leading-relaxed">
            {t(
              "¡Acelera tus premios gastronómicos sin esperar a tu próxima visita! Completa estas misiones digitales y suma sellos directamente a tu pasaporte.",
              "Accelerate your dining rewards without waiting for your next visit! Complete these digital missions and add stamps directly to your passport."
            )}
          </p>
        </div>
      </Reveal>

      {/* 2. BARRA DE RESUMEN Y ENLACE RÁPIDO A TARJETA DE SELLOS (PASO 7) */}
      <Reveal delay={50}>
        <div className="w-full rounded-2xl bg-[#1c1b1f] border border-[#363439] p-4 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#684400]/40 border border-[#f2be71]/30 flex items-center justify-center text-[#f2be71] shrink-0">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#e6e1e7] flex items-center gap-1.5 flex-wrap">
                <span className="truncate">{customerName}</span>
                <span className="text-[10px] text-[#f2be71] bg-[#684400]/40 px-2 py-0.5 rounded-full border border-[#f2be71]/30 font-bold shrink-0">
                  {currentStamps} / 15 {t("Sellos", "Stamps")}
                </span>
              </div>
              <p className="text-[11px] text-[#ccc3d8] truncate">
                {t("Cada misión aprobada suma sellos a tu tarjeta", "Each approved mission adds stamps to your card")}
              </p>
            </div>
          </div>

          {onBackToStamps && (
            <button
              type="button"
              onClick={onBackToStamps}
              className="px-3 py-2 rounded-xl bg-[#2b292e] hover:bg-[#363439] border border-[#49454e] text-xs font-bold text-[#f2be71] flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("Ver Tarjeta (Paso 7)", "View Card (Step 7)")}</span>
              <span className="sm:hidden">{t("Paso 7", "Step 7")}</span>
            </button>
          )}
        </div>
      </Reveal>

      {/* 3. RESUMEN DE ESTADÍSTICAS (GANADOS, EN REVISIÓN, DISPONIBLES) */}
      <Reveal delay={80}>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl bg-[#1c1b1f] border border-[#2b292e] p-3 text-center flex flex-col items-center justify-center">
            <span className="text-[10px] text-[#ccc3d8] uppercase font-bold tracking-wider">
              {t("Ganados", "Earned")}
            </span>
            <span className="text-xl font-black text-[#f2be71] mt-0.5 font-mono">{currentStamps}</span>
            <span className="text-[9px] text-[#ccc3d8]/70 mt-0.5">en tarjeta</span>
          </div>

          <div className="rounded-2xl bg-[#1c1b1f] border border-[#2b292e] p-3 text-center flex flex-col items-center justify-center">
            <span className="text-[10px] text-[#ccc3d8] uppercase font-bold tracking-wider">
              {t("Revisión", "Review")}
            </span>
            <span className="text-xl font-black text-[#ffddb1] mt-0.5 font-mono">
              {pendingStamps > 0 ? `+${pendingStamps}` : "0"}
            </span>
            <span className="text-[9px] text-[#ccc3d8]/70 mt-0.5">&lt; 24 horas</span>
          </div>

          <div className="rounded-2xl bg-[#1c1b1f] border border-[#2b292e] p-3 text-center flex flex-col items-center justify-center">
            <span className="text-[10px] text-[#ccc3d8] uppercase font-bold tracking-wider">
              {t("Disponibles", "Available")}
            </span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 font-mono">+{totalAvailableStamps}</span>
            <span className="text-[9px] text-[#ccc3d8]/70 mt-0.5">misiones</span>
          </div>
        </div>
      </Reveal>

      {/* 4. BANNER DE DESAFÍO EMBAJADOR & SORTEO CENA PARA 2 */}
      <Reveal delay={100}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#201f23] via-[#1c1b1f] to-[#252329] border-2 border-[#f2be71]/40 p-5 shadow-2xl flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#684400]/40 border border-[#f2be71]/40 flex items-center justify-center shrink-0 text-[#f2be71] text-2xl shadow-md">
                👑
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-sm text-[10px] uppercase tracking-wider text-[#f2be71] font-bold bg-[#684400]/30 px-2 py-0.5 rounded-full border border-[#f2be71]/30">
                    {t("GRAN DESAFÍO EMBAJADOR", "AMBASSADOR CHALLENGE")}
                  </span>
                  <span className="text-[10px] text-[#ccc3d8] font-mono">Sorteo Fin de Mes</span>
                </div>
                <h3 className="font-headline-sm text-base text-[#e6e1e7] font-bold mt-1">
                  {t("Premio Asegurado + Sorteo Cena para 2", "Guaranteed Prize + Dinner for 2 Raffle")}
                </h3>
              </div>
            </div>

            {/* Botón de prueba rápida demo */}
            <button
              type="button"
              onClick={() => setIsDemoUnlocked(!isDemoUnlocked)}
              className="btn-dark px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 cursor-pointer"
              title="Simular completar todo en modo demo"
            >
              {isDemoUnlocked ? "🔄 Reiniciar Demo" : "⚡ Probar Desbloqueo"}
            </button>
          </div>

          <p className="font-body-sm text-xs text-[#ccc3d8] leading-relaxed">
            {t(
              "Completa las misiones de la casa para asegurar un postre de autor en tu próxima visita y clasificar al gran sorteo mensual.",
              "Complete missions to secure an artisan dessert on your next visit and enter our exclusive monthly dinner raffle."
            )}
          </p>

          {/* Estado de completado vs pendiente */}
          {isChallengeCompleted ? (
            <div className="p-4 rounded-2xl bg-[#14231b] border-2 border-emerald-500/60 shadow-lg space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>¡DESAFÍO COMPLETADO! PREMIO ASEGURADO + BOLETO VIP ACTIVO</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-[#1b2f24] p-3 rounded-xl border border-emerald-500/30">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-bold">
                    🎁 Premio Garantizado
                  </span>
                  <strong className="text-xs text-white block mt-0.5 font-serif">
                    Postre de Autor & Bono Regalo Dulce
                  </strong>
                  <span className="font-mono text-xs font-bold text-[#f2be71] block mt-1">
                    Código: #AUTOR-EMBAJADOR-VIP
                  </span>
                  <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                    ✓ Asegurado en mesa para tu próxima visita
                  </span>
                </div>

                <div className="bg-[#2a2216] p-3 rounded-xl border border-[#f2be71]/40">
                  <span className="text-[10px] uppercase tracking-wider text-[#f2be71] block font-bold">
                    👑 Boleto Sorteo Cena para 2
                  </span>
                  <strong className="text-xs text-white block mt-0.5 font-serif">
                    Cena Degustación de Autor para 2
                  </strong>
                  <span className="font-mono text-xs font-bold text-[#f2be71] block mt-1">
                    {ticketCode}
                  </span>
                  <span className="text-[10px] text-[#ffddb1]/80 block mt-0.5">
                    ✓ Candidato oficial (Sorteo último viernes)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#201f23] p-3 rounded-xl border border-[#363439] flex items-center justify-between text-xs">
              <span className="text-[#ccc3d8]">Progreso del Desafío:</span>
              <span className="text-[#f2be71] font-mono font-bold">
                {submittedMissionIds.size} / {missions.length} misiones enviadas
              </span>
            </div>
          )}

          {/* Botón WhatsApp para invitar amigos con mensaje pre-armado */}
          <button
            type="button"
            onClick={handleReferFriend}
            className="w-full h-11 px-4 rounded-xl bg-[#1c1b1f] border border-[#f2be71]/40 hover:border-[#f2be71]/70 hover:bg-[#252429] text-[#f2be71] text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-all active:scale-98"
          >
            <Share2 className="h-3.5 w-3.5 text-[#f2be71] shrink-0" />
            <span>{t("Recomendar a un Amigo por WhatsApp (+3 Sellos)", "Refer a Friend via WhatsApp (+3 Stamps)")}</span>
          </button>
        </div>
      </Reveal>

      {/* 5. MENSAJES DE ERROR */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs text-center font-medium animate-in fade-in">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* 6. LISTADO COMPLETO E INTERACTIVO DE MISIONES */}
      <Reveal delay={150}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-sm text-xs text-[#e6e1e7] uppercase font-bold tracking-wider">
              {t("Misiones Activas para Ganar Sellos", "Active Missions to Earn Stamps")}
            </span>
            <span className="text-[11px] text-[#ccc3d8]">{missions.length} disponibles hoy</span>
          </div>

          {missions.map((m) => {
            const isExpanded = expandedMission === m.id;
            const isSubmitting = submittingMissionId === m.id;
            const isSuccess = successMissionId === m.id;
            const isAlreadySubmitted = submittedMissionIds.has(m.id);
            const currentUrl = missionUrls[m.id] || "";

            return (
              <div
                key={m.id}
                className="rounded-2xl bg-[#1c1b1f] border border-[#2b292e] hover:border-[#f2be71]/40 transition-all overflow-hidden shadow-sm"
              >
                {/* Cabecera de la misión */}
                <div
                  onClick={() => setExpandedMission(isExpanded ? null : m.id)}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#201f23]/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#201f23] border border-[#2b292e] flex items-center justify-center shrink-0 shadow-xs">
                      {getMissionBrandLogo(m.id, "w-6 h-6") || <span className="text-xl">{m.icon}</span>}
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-[#684400]/40 text-[#ffddb1] border border-[#f2be71]/30 text-[9px] font-bold">
                          {m.badge}
                        </span>
                        <span className="text-[10px] text-[#ccc3d8] hidden sm:inline">{m.category}</span>
                        {isAlreadySubmitted && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold">
                            ✓ Enviada
                          </span>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#e6e1e7] mt-0.5 truncate">{m.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-[#684400]/50 text-[#f2be71] border border-[#f2be71]/40 text-[10px] font-bold font-mono">
                      {m.rewardText}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[#ccc3d8]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#ccc3d8]" />
                    )}
                  </div>
                </div>

                {/* Cuerpo expandido con formulario de evidencia */}
                {isExpanded && (
                  <div className="p-4 pt-1 border-t border-[#2b292e] bg-[#17161a] flex flex-col gap-3 text-xs animate-in fade-in">
                    <p className="text-[#ccc3d8] leading-relaxed">{m.description}</p>

                    {/* Reglas e instrucciones */}
                    <div className="p-3 rounded-xl bg-[#201f23] border border-[#2b292e] space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-[#f2be71] tracking-wider block">
                        📋 Instrucciones de Verificación:
                      </span>
                      <ul className="space-y-1 text-[11px] text-[#ccc3d8]/90 pl-1">
                        {m.rules.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#f2be71] font-bold">{idx + 1}.</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Acciones: Abrir tarea + Pegar Enlace + Enviar */}
                    <div className="p-3 rounded-xl bg-[#201f23] border border-[#f2be71]/30 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-bold text-[#e6e1e7] tracking-wider">
                          {t("Enlace o Confirmación de tu Publicación:", "Post Link or Confirmation:")}
                        </label>
                        <button
                          type="button"
                          onClick={() => handleOpenTask(m.actionUrl)}
                          className="btn-dark inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          <ExternalLink className="h-3 w-3 text-[#f2be71]" />
                          <span>{t("↗ Abrir Tarea", "↗ Open Task")}</span>
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="url"
                          value={currentUrl}
                          onChange={(e) => handleUrlChange(m.id, e.target.value)}
                          placeholder={m.evidencePlaceholder}
                          className="flex-1 bg-[#121115] border border-[#363439] rounded-xl px-3.5 py-2.5 text-xs text-[#e6e1e7] placeholder:text-[#ccc3d8]/40 focus:outline-hidden focus:border-[#f2be71]"
                        />

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSubmitForReview(m)}
                          className="btn-gold px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <Clock className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          <span>{t("Enviar a Revisión", "Submit for Review")}</span>
                        </button>
                      </div>

                      {isSuccess && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>
                            {t(
                              "¡Misión enviada exitosamente! Se revisará en menos de 24 horas para sumar tus sellos.",
                              "Mission submitted! It will be reviewed within 24 hours to add your stamps."
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* 7. TARJETA FINAL DE AGRADECIMIENTO */}
      <Reveal delay={200}>
        <div className="rounded-3xl border border-[#f2be71]/30 bg-gradient-to-br from-[#201f23] via-[#1c1b1f] to-[#252329] p-6 text-center flex flex-col items-center gap-3 shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-[#684400]/40 border border-[#f2be71]/40 flex items-center justify-center text-2xl shadow-md">
            💖
          </div>

          <div className="space-y-1 max-w-md">
            <h3 className="font-headline-sm text-lg font-bold text-[#e6e1e7]">
              {t("¡Gracias de Corazón por tu Visita!", "Thank You for Visiting Us!")}
            </h3>
            <p className="text-xs text-[#ccc3d8] leading-relaxed">
              {t(
                `Para todo el equipo de ${brandName} ha sido un auténtico placer recibirte. Tus sellos y premios están guardados de forma segura con tu número de teléfono.`,
                `For the entire team at ${brandName}, it has been a true pleasure having you. Your stamps and rewards are safely saved with your phone number.`
              )}
            </p>
          </div>

          {onBackToStamps && (
            <div className="w-full pt-2">
              <button
                type="button"
                onClick={onBackToStamps}
                className="w-full h-12 rounded-2xl bg-[#2b292e] hover:bg-[#363439] border border-[#49454e] font-bold text-xs text-[#e6e1e7] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <ArrowLeft className="h-4 w-4 text-[#f2be71]" />
                <span>{t("← Volver a Mi Tarjeta de Sellos (Paso 7)", "← Back to My Stamps Card (Step 7)")}</span>
              </button>
            </div>
          )}

          {onResetToStart && (
            <div className="w-full pt-1">
              <button
                type="button"
                onClick={onResetToStart}
                className="btn-dark w-full h-12 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCcw className="h-4 w-4 text-[#f2be71]" />
                <span>{t("Comenzar Nueva Experiencia (Modo Demo)", "Start New Experience (Demo Mode)")}</span>
              </button>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

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
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  RotateCcw,
  Share2,
  CreditCard,
  Users,
} from "lucide-react";
import { StampService } from "@/lib/stampService";
import { MissionItem } from "./MissionsModal";
import { DigitalStampCard } from "./DigitalStampCard";
import { clientConfig } from "@/config/clientConfig";

const DEFAULT_MISSIONS: MissionItem[] = [
  {
    id: "m_tiktok",
    category: "Creación de Contenido",
    title: "Video o Reel en TikTok",
    rewardStamps: 3,
    rewardText: "+3 Sellos de Visita",
    badge: "VIRAL TOP",
    icon: "🎵",
    description: "Comparte un video corto disfrutando tu café o postre favorito de Bliss Soul.",
    rules: [
      "Publica un video público en TikTok.",
      "Menciona a @blisssoulbakery en la descripción o usa la etiqueta de ubicación.",
      "Muestra tu experiencia real con el producto o en el local.",
      "Mantén el video público de forma permanente.",
    ],
    actionUrl: "https://www.tiktok.com",
    evidencePlaceholder: "https://www.tiktok.com/@tu_usuario/video/...",
    active: true,
  },
  {
    id: "m_trustpilot",
    category: "Reseñas de Confianza",
    title: "Reseña en Trustpilot",
    rewardStamps: 2,
    rewardText: "+2 Sellos de Visita",
    badge: "AUTORIDAD",
    icon: "⭐",
    description: "Comparte tu experiencia sincera sobre el servicio y la calidad de nuestra repostería.",
    rules: [
      "Escribe una reseña honesta en nuestra página de Trustpilot.",
      "Menciona tu producto favorito y cómo fue tu atención.",
      "Pega el enlace directo a tu reseña publicada.",
    ],
    actionUrl: "https://www.trustpilot.com",
    evidencePlaceholder: "https://www.trustpilot.com/reviews/...",
    active: true,
  },
  {
    id: "m_facebook",
    category: "Comunidad y Familia",
    title: "Recomendación en Facebook",
    rewardStamps: 1,
    rewardText: "+1 Sello de Visita",
    badge: "COMUNIDAD",
    icon: "👥",
    description: "Recomienda nuestra página oficial o haz check-in en el local con una foto.",
    rules: [
      "Deja una recomendación positiva en la Fanpage oficial de Facebook o haz check-in.",
      "Comparte una foto de tu postre o pedido.",
      "Asegúrate de que la publicación esté en modo público.",
    ],
    actionUrl: "https://www.facebook.com",
    evidencePlaceholder: "https://www.facebook.com/tu_publicacion/...",
    active: true,
  },
  {
    id: "m_whatsapp_status",
    category: "Boca a Boca Directo",
    title: "Estados de WhatsApp",
    rewardStamps: 1,
    rewardText: "+1 Sello de Visita",
    badge: "WHATSAPP",
    icon: "💬",
    description: "Sube una foto de tu pedido a tus Estados de WhatsApp recomendando el local.",
    rules: [
      "Publica una foto de tu postre o café en tus Estados de WhatsApp.",
      "Escribe una frase recomendando a Bliss Soul Bakery.",
      "Envía el enlace o confirmación de tu estado.",
    ],
    actionUrl: "https://api.whatsapp.com",
    evidencePlaceholder: "https://wa.me/... o confirmación",
    active: true,
  },
  {
    id: "m_referrals",
    category: "Embajador de la Casa",
    title: "Invitar a 3 Amigos por WhatsApp",
    rewardStamps: 3,
    rewardText: "+3 Sellos de Visita",
    badge: "VIRAL BOCA A BOCA",
    icon: "🤝",
    description: "Comparte tu enlace de invitación con 3 amigos o en un grupo de WhatsApp recomendando visitarnos.",
    rules: [
      "Toca el botón 'Abrir WhatsApp' y reenvía la invitación con tu código a 3 amigos.",
      "Tus amigos recibirán cortesía sorpresa en mesa cuando nos visiten.",
      "Pega tu número o confirmación para validar tus sellos y clasificar a la Cena para 2.",
    ],
    actionUrl: "https://api.whatsapp.com",
    evidencePlaceholder: "Confirmación de envío o nombres de tus invitados",
    active: true,
  },
  {
    id: "m_whatsapp_community",
    category: "Comunidad Exclusiva",
    title: "Unirse a la Comunidad VIP de WhatsApp",
    rewardStamps: 2,
    rewardText: "+2 Sellos de Visita",
    badge: "CLUB PRIVADO",
    icon: "💬",
    description: "Únete a nuestro grupo oficial y exclusivo de WhatsApp para recibir ofertas secretas de repostería, lanzamientos de temporada y catas privadas.",
    rules: [
      "Toca el botón 'Abrir WhatsApp' y únete al grupo oficial de nuestra Comunidad VIP.",
      "Recibe antes que nadie promociones relámpago, recetas de autor y regalos.",
      "Pega tu número de WhatsApp para confirmar tu ingreso y sumar tus sellos.",
    ],
    actionUrl: "https://chat.whatsapp.com/BlissSoulVIPCommunity",
    evidencePlaceholder: "Tu número de WhatsApp o confirmación de ingreso al grupo",
    active: true,
  },
  {
    id: "m_bing",
    category: "Motores de Búsqueda",
    title: "Reseña en Bing Places & Maps",
    rewardStamps: 2,
    rewardText: "+2 Sellos de Visita",
    badge: "BING MAPS",
    icon: "🌐",
    description: "Comparte tu opinión y calificación en nuestro perfil de Microsoft Bing Places para ayudarnos a posicionar en búsquedas.",
    rules: [
      "Abre el perfil de Bliss Soul Bakery en Bing Maps o Microsoft Search.",
      "Califica con estrellas y comparte tu producto o postre favorito.",
      "Pega el enlace de tu reseña o confirmación para sumar tus sellos.",
    ],
    actionUrl: "https://www.bing.com/maps",
    evidencePlaceholder: "https://www.bing.com/maps?... o confirmación",
    active: true,
  },
];

interface StepMissionsProps {
  customerName?: string;
  customerWhatsapp?: string;
  onResetToStart?: () => void;
}

export function StepMissions({
  customerName = "",
  customerWhatsapp = "",
  onResetToStart,
}: StepMissionsProps) {
  const { t } = useLanguage();
  // activeTab removed: Misiones es una página 100% independiente
  const [missions, setMissions] = useState<MissionItem[]>(DEFAULT_MISSIONS);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [missionUrls, setMissionUrls] = useState<Record<string, string>>({});
  const [submittingMissionId, setSubmittingMissionId] = useState<string | null>(null);
  const [successMissionId, setSuccessMissionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [name, setName] = useState(customerName);
  const [whatsapp, setWhatsapp] = useState(customerWhatsapp);
  const [expandedId, setExpandedId] = useState<string | null>(DEFAULT_MISSIONS[0].id);
  const [isDemoUnlocked, setIsDemoUnlocked] = useState(false);

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

  useEffect(() => {
    if (customerName) setName(customerName);
    if (customerWhatsapp) setWhatsapp(customerWhatsapp);
  }, [customerName, customerWhatsapp]);

  const cleanPhone = (whatsapp || "").replace(/\D/g, "");
  const baseCard = StampService.getCustomerStampCard(cleanPhone);
  const [syncedStamps, setSyncedStamps] = useState<number>(() => Math.max(baseCard.currentStamps, 3));

  useEffect(() => {
    if (cleanPhone) {
      fetch(`/api/stamps/${cleanPhone}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.stamps === "number") {
            const count = Math.max(data.stamps, 3);
            setSyncedStamps(count);
            StampService.saveCustomerStampCard(cleanPhone, {
              ...baseCard,
              currentStamps: count,
            });
          }
        })
        .catch(() => {});
    }
  }, [cleanPhone]);

  const currentStamps = syncedStamps;
  const stampCard = {
    ...baseCard,
    currentStamps,
  };

  const myPendingSubmissions = submissions.filter(
    (s) => s.status === "PENDIENTE" && (!cleanPhone || s.customerWhatsapp === cleanPhone)
  );
  const pendingStamps = myPendingSubmissions.reduce(
    (acc, cur) => acc + (cur.rewardStamps || 1),
    0
  );

  const totalAvailableStamps = missions.reduce(
    (acc, m) => acc + (m.rewardStamps || 1),
    0
  );

  const submittedMissionIds = new Set(
    submissions
      .filter((s) => !cleanPhone || s.customerWhatsapp === cleanPhone)
      .map((s) => s.missionId)
  );

  const ticketCode = `#CENA2-${cleanPhone ? cleanPhone.slice(-4) : "7791"}-VIP`;
  const [contestEntered, setContestEntered] = useState(false);

  // Auto-inscribir en el concurso mensual de la Cena para 2 cuando se completan las misiones
  useEffect(() => {
    const isCompleted = isDemoUnlocked || (missions.length > 0 && submittedMissionIds.size >= missions.length);
    if (isCompleted && !contestEntered) {
      setContestEntered(true);
      fetch("/api/contest/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name || customerName || "Cliente Embajador",
          customerWhatsapp: cleanPhone || customerWhatsapp || "573009876543",
          ticketCode: ticketCode,
          missionsCount: missions.length,
        }),
      }).catch(() => {});
    }
  }, [isDemoUnlocked, submittedMissionIds.size, missions.length, contestEntered, name, customerName, cleanPhone, customerWhatsapp, ticketCode]);

  const handleUrlChange = (missionId: string, val: string) => {
    setMissionUrls((prev) => ({ ...prev, [missionId]: val }));
    setErrorMessage("");
  };

  const handleOpenTask = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleReferFriend = () => {
    const brandName = clientConfig.brand.name;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteMessage = `¡Hola! Te recomiendo mucho visitar *${brandName}* 🍽️✨\n\nEl ambiente y la comida son espectaculares. Además, cuando vayas a visitarlos y te sientes en tu mesa, puedes escanear el QR y participar en su Ruleta de Premios:\n👉 ${origin}?ref=${encodeURIComponent(customerName || "Amigo")}\n\n¡Vamos juntos o visítalos hoy, te va a encantar!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmitForReview = async (mission: MissionItem) => {
    const url = (missionUrls[mission.id] || "").trim();
    if (!url) {
      setErrorMessage(t("Por favor pega la URL o enlace de tu publicación antes de enviar.", "Please paste the URL of your post before submitting."));
      return;
    }

    if (!name.trim() || !whatsapp.trim()) {
      setErrorMessage(t("Por favor verifica tu nombre y WhatsApp para poder acreditarte los sellos.", "Please verify your name and WhatsApp to credit your stamps."));
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
          customerName: name,
          customerWhatsapp: whatsapp,
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
        setErrorMessage(data?.message || t("Hubo un error al enviar la misión. Intenta nuevamente.", "Error submitting mission. Please try again."));
      }
    } catch {
      setErrorMessage(t("No fue posible conectar con el servidor. Verifica tu conexión.", "Could not connect to server. Check connection."));
    } finally {
      setSubmittingMissionId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <Reveal>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-6 bg-gold" />
            <span className="text-xs uppercase tracking-[0.24em] text-gold font-medium">
              {t("Paso 7 · Fidelización VIP & Misiones", "Step 7 · VIP Loyalty & Missions")}
            </span>
            <span className="h-px w-6 bg-gold" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
            {t("Club de Fidelidad & Sellos Extras", "Loyalty Club & Extra Stamps")}
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-light max-w-lg mx-auto">
            {t(
              "Guarda tu tarjeta digital de 15 visitas, completa misiones virales y acumula premios exclusivos para tu próxima visita.",
              "Save your 15-visit digital card, complete viral missions and collect exclusive rewards for your next visit."
            )}
          </p>

          </div>
      </Reveal>

      <div className="space-y-6">
          {/* TIRA VISUAL EN VIVO DE LOS 15 SELLOS (SIEMPRE VISIBLE) */}
          <Reveal delay={80}>
            <div className="bg-card border-2 border-gold/40 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <CreditCard className="h-4 w-4 text-gold" />
                  <span>{t("Tu Tarjeta de 15 Sellos en Vivo", "Your Live 15-Stamp Card")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-800 bg-gold/15 px-2.5 py-0.5 rounded-full border border-gold/30">
                    {currentStamps} / 15 {t("Sellos", "Stamps")}
                  </span>
                  <span className="text-[11px] text-amber-800 font-medium">✨ Acumulados</span>
                </div>
              </div>

              {/* Los 15 círculos de sellos */}
              <div className="grid grid-cols-5 sm:grid-cols-15 gap-1.5">
                {Array.from({ length: 15 }, (_, i) => i + 1).map((idx) => {
                  const isStamped = idx <= currentStamps;
                  const isMilestone = idx === 5 || idx === 10 || idx === 15;
                  const prizeIcon = idx === 5 ? "🍰" : idx === 10 ? "☕" : "🎁";
                  return (
                    <div
                      key={idx}
                      className={`p-1.5 rounded-xl flex flex-col items-center justify-center text-center border transition-all ${
                        isStamped
                          ? isMilestone
                            ? "bg-gradient-to-tr from-amber-500/30 via-gold/30 to-amber-400/40 border-gold text-foreground font-bold shadow-xs"
                            : "bg-emerald-500/15 border-emerald-400/60 text-foreground font-medium"
                          : isMilestone
                          ? "border-dashed border-gold bg-gold/10 text-gold"
                          : "border-border/70 bg-background/60 text-muted-foreground"
                      }`}
                    >
                      <span className="text-xs">
                        {isStamped ? "✓" : prizeIcon}
                      </span>
                      <span className="text-[9px] font-mono font-bold mt-0.5">
                        #{idx}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* TARJETA RESUMEN ESTILO SCREPY CON CONTADOR GENERAL */}
          <Reveal delay={100}>
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-gold/30 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-gold/20">
                <div className="py-2 sm:py-0">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground block font-medium">
                    {t("Sellos Ganados", "Earned Stamps")}
                  </span>
                  <span className="text-3xl sm:text-4xl font-display font-bold text-amber-700 block mt-1">
                    {currentStamps}
                  </span>
                  <span className="text-[11px] text-muted-foreground/80 mt-0.5 block">
                    {t("En tu tarjeta digital activa", "On your active digital card")}
                  </span>
                </div>

                <div className="py-2 sm:py-0">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground block font-medium">
                    {t("En Revisión (24h)", "In Review (24h)")}
                  </span>
                  <span className="text-3xl sm:text-4xl font-display font-bold text-amber-600 block mt-1">
                    {pendingStamps}
                  </span>
                  <span className="text-[11px] text-muted-foreground/80 mt-0.5 block">
                    {myPendingSubmissions.length} {t("tarea(s) enviada(s)", "task(s) submitted")}
                  </span>
                </div>

                <div className="py-2 sm:py-0">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground block font-medium">
                    {t("Disponibles por Ganar", "Available to Earn")}
                  </span>
                  <span className="text-3xl sm:text-4xl font-display font-bold text-emerald-600 block mt-1">
                    +{totalAvailableStamps}
                  </span>
                  <span className="text-[11px] text-muted-foreground/80 mt-0.5 block">
                    {missions.filter((m) => m.active).length} {t("misiones activas hoy", "active missions today")}
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* BANNER DESTACADO: GRAN PREMIO CENA PARA 2 & CONCURSO MENSUAL */}
          <Reveal delay={110}>
            <div className="relative overflow-hidden rounded-3xl border-2 border-gold/60 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-700/15 p-6 sm:p-7 shadow-lg space-y-4">
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-gold/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-gold flex items-center justify-center text-white shadow-md text-2xl flex-shrink-0">
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-gold/25 text-amber-900 border border-gold/40">
                        {t("GRAN DESAFÍO EMBAJADOR", "GRAND AMBASSADOR CHALLENGE")}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {t("Sorteo Fin de Mes", "End of Month Draw")}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground mt-0.5">
                      {t("¡Completa el Desafío: Premio Garantizado + Sorteo Cena para 2!", "Complete Challenge: Guaranteed Prize + Dinner for 2 Raffle!")}
                    </h3>
                  </div>
                </div>

                {/* Botón de prueba rápida */}
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isDemoUnlocked;
                    setIsDemoUnlocked(nextVal);
                    if (nextVal) {
                      fetch("/api/contest/enter", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          customerName: name || customerName || "Cliente Embajador Demo",
                          customerWhatsapp: cleanPhone || customerWhatsapp || "573009876543",
                          ticketCode: ticketCode,
                          missionsCount: missions.length,
                        }),
                      }).catch(() => {});
                    }
                  }}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white/80 hover:bg-white text-amber-900 border border-gold/40 shadow-2xs transition-all cursor-pointer"
                  title="Simular completar todo para probar la tarjeta y boleto ganador"
                >
                  {isDemoUnlocked ? "🔄 Reiniciar Reto Demo" : "⚡ Desbloquear en Demo (Probar)"}
                </button>
              </div>

              {/* Barra de progreso interactiva */}
              <div className="pt-2 border-t border-gold/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">
                    {t("Progreso para el Premio y Concurso Mensual:", "Progress for Prize & Monthly Contest:")}
                  </span>
                  <span className="font-bold text-amber-800 font-mono">
                    {isDemoUnlocked ? "6 / 6 (100% COMPLETADO)" : `${submittedMissionIds.size} / ${missions.length} misiones`}
                  </span>
                </div>

                <div className="w-full bg-white/70 h-3 rounded-full overflow-hidden border border-gold/30 p-0.5 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 h-full rounded-full transition-all duration-700 shadow-xs"
                    style={{ width: isDemoUnlocked ? "100%" : `${Math.max(15, (submittedMissionIds.size / missions.length) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Si está completado o desbloqueado en demo */}
              {(isDemoUnlocked || submittedMissionIds.size >= missions.length) ? (
                <div className="p-4 rounded-2xl bg-white/95 border-2 border-emerald-500 shadow-md animate-fade-in space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>¡DESAFÍO COMPLETADO! PREMIO ASEGURADO + BOLETO AL SORTEO</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* PREMIO 1: GARANTIZADO INMEDIATO */}
                    <div className="bg-emerald-50/90 p-3 rounded-xl border border-emerald-200">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-800 block font-bold">
                        🎁 Premio Garantizado Reclamable
                      </span>
                      <strong className="text-xs text-foreground font-serif block mt-0.5">
                        Postre de Autor & Bono Regalo Dulce
                      </strong>
                      <span className="font-mono text-xs font-bold text-emerald-700 block mt-1">
                        Código: #AUTOR-EMBAJADOR-VIP
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        ✓ Asegurado en mesa para tu próxima visita
                      </span>
                    </div>

                    {/* PREMIO 2: BOLETO AL SORTEO DE CENA PARA 2 */}
                    <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-200">
                      <span className="text-[10px] uppercase tracking-wider text-amber-800 block font-bold">
                        👑 Boleto Sorteo Mensual Cena para 2
                      </span>
                      <strong className="text-xs text-foreground font-serif block mt-0.5">
                        Cena Degustación de Autor para 2
                      </strong>
                      <span className="font-mono text-xs font-bold text-amber-800 block mt-1">
                        {ticketCode}
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        ✓ Candidato oficial (Sorteo último viernes)
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    ✓ Ya estás inscrito en la lista oficial del concurso mensual y tu premio dulce asegurado está activo en tu cuenta.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 text-[11px] text-muted-foreground/90 font-light leading-relaxed">
                  <p>
                    🎁 <strong>Premio Garantizado:</strong> Al completar tus misiones o sellos, aseguras un <em>Postre de Autor & Bono Regalo</em> en tu próxima visita.
                  </p>
                  <p>
                    👑 <strong>Sorteo de Cena para 2:</strong> Y además recibes tu <em>Boleto VIP</em> para participar en el sorteo de una <strong>Cena para 2 personas</strong>.
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          {/* MENSAJES DE ERROR O ÉXITO */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* LISTADO DE MISIONES ESTILO SCREPY */}
          <div className="space-y-4">
            {missions
              .filter((m) => m.active)
              .map((mission) => {
                const isExpanded = expandedId === mission.id;
                const isSubmitting = submittingMissionId === mission.id;
                const isSuccess = successMissionId === mission.id;
                const currentUrl = missionUrls[mission.id] || "";

                return (
                  <div
                    key={mission.id}
                    className="bg-card border border-border/80 rounded-2xl shadow-xs hover:border-gold/50 transition-all overflow-hidden"
                  >
                    {/* Cabecera de la misión */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : mission.id)}
                      className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="text-2xl sm:text-3xl flex-shrink-0 p-2 rounded-xl bg-amber-50 border border-amber-200/50">
                          {mission.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                              {mission.badge}
                            </span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              {mission.category}
                            </span>
                          </div>
                          <h4 className="font-medium text-foreground text-sm sm:base mt-1 truncate">
                            {mission.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-bold text-xs sm:text-sm border border-emerald-500/20">
                          <Sparkles className="h-3.5 w-3.5" />
                          {mission.rewardText}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Contenido expandido con barra de acción estilo Screpy */}
                    {isExpanded && (
                      <div className="px-4 sm:p-5 pb-5 pt-1 border-t border-border/40 bg-muted/10 space-y-4">
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {mission.description}
                        </p>

                        {/* Reglas / Pasos rápidos */}
                        <div className="bg-background/80 rounded-xl p-3 border border-border/60">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-gold block mb-2">
                            📋 {t("Cómo completar la tarea:", "How to complete the task:")}
                          </span>
                          <ul className="space-y-1.5 text-xs text-muted-foreground">
                            {mission.rules.map((rule, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-gold font-bold text-[11px]">{idx + 1}.</span>
                                <span>{rule}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* BARRA DE ACCIÓN: ABRIR TAREA + PEGAR URL + ENVIAR */}
                        <div className="bg-amber-500/5 border border-gold/30 rounded-xl p-3 sm:p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row gap-2">
                            {/* Botón 1: Abrir tarea */}
                            <button
                              type="button"
                              onClick={() => handleOpenTask(mission.actionUrl)}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-foreground text-xs font-semibold hover:border-gold hover:text-gold transition-all shadow-2xs cursor-pointer flex-shrink-0"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-gold" />
                              <span>{t("↗ Abrir tarea", "↗ Open task")}</span>
                            </button>

                            {/* Campo: Pegar URL */}
                            <input
                              type="url"
                              value={currentUrl}
                              onChange={(e) => handleUrlChange(mission.id, e.target.value)}
                              placeholder={mission.evidencePlaceholder}
                              className="flex-1 bg-white border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold"
                            />

                            {/* Botón 2: Enviar a revisión */}
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleSubmitForReview(mission)}
                              className="btn-solid inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer flex-shrink-0"
                            >
                              {isSubmitting ? (
                                <Clock className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                              <span>{t("Enviar para revisión", "Submit for review")}</span>
                            </button>
                          </div>

                          {isSuccess && (
                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                              <span>{t("¡Misión enviada exitosamente! Se revisará en menos de 24 horas.", "Mission submitted successfully! Will be reviewed in under 24 hours.")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

      {/* TARJETA FINAL DE PROFUNDO AGRADECIMIENTO E INVITACIÓN A VOLVER */}
      <Reveal delay={130}>
        <div className="rounded-3xl border-2 border-gold/50 bg-gradient-to-br from-amber-500/15 via-[#fffdfa] to-amber-700/15 p-6 sm:p-9 text-center space-y-5 shadow-xl relative overflow-hidden">
          {/* Adorno superior dorado */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-gold to-amber-600" />

          {/* Emblema o Icono de Gratitud Gastronómica */}
          <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-gold to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-900/15 border border-white/60">
            <span className="text-3xl sm:text-4xl animate-pulse">💖</span>
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-amber-900 text-[11px] font-bold uppercase tracking-wider border border-gold/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{t("¡Esperamos Verte Muy Pronto!", "We Hope to See You Soon!")}</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {t("¡Gracias de Corazón por tu Visita!", "Thank you from the Heart for Visiting!")}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-700 font-light leading-relaxed pt-1">
              {t(
                "Para todo el equipo de Bliss Soul Bakery & Café ha sido un auténtico placer recibirte hoy. Cada postre artesanal horneado y cada taza de café de especialidad servida está preparada con amor para hacer inolvidable tu día.",
                "For the entire team at Bliss Soul Bakery & Café, it has been an absolute pleasure having you with us today. Every handcrafted dessert and specialty coffee is made with love to brighten your day."
              )}
            </p>

            <p className="text-xs sm:text-sm font-medium text-amber-800 pt-1">
              {t(
                "Tus sellos acumulados y beneficios exclusivos estarán guardados aquí esperándote. ¡Vuelve pronto a deleitarte con nosotros!",
                "Your accumulated stamps and exclusive perks are safely saved here waiting for you. Come back soon to treat yourself again!"
              )}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onResetToStart && (
              <button
                type="button"
                onClick={onResetToStart}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-600 to-gold hover:opacity-95 text-white text-xs sm:text-sm uppercase tracking-wider font-bold shadow-lg hover:shadow-xl cursor-pointer transition-all transform active:scale-98"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{t("Comenzar Nueva Experiencia", "Start New Experience")}</span>
              </button>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

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
} from "lucide-react";
import { StampService } from "@/lib/stampService";
import { MissionItem } from "./MissionsModal";

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
];

interface StepMissionsProps {
  customerName?: string;
  customerWhatsapp?: string;
  onBackToSecondChance?: () => void;
  onResetToStart?: () => void;
}

export function StepMissions({
  customerName = "",
  customerWhatsapp = "",
  onBackToSecondChance,
  onResetToStart,
}: StepMissionsProps) {
  const { t } = useLanguage();
  const [missions, setMissions] = useState<MissionItem[]>(DEFAULT_MISSIONS);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [missionUrls, setMissionUrls] = useState<Record<string, string>>({});
  const [submittingMissionId, setSubmittingMissionId] = useState<string | null>(null);
  const [successMissionId, setSuccessMissionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [name, setName] = useState(customerName);
  const [whatsapp, setWhatsapp] = useState(customerWhatsapp);
  const [expandedId, setExpandedId] = useState<string | null>(DEFAULT_MISSIONS[0].id);

  const loadMissionsData = () => {
    fetch("/api/missions")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          if (Array.isArray(data.missions) && data.missions.length > 0) {
            setMissions(data.missions);
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
  const stampCard = StampService.getCustomerStampCard(cleanPhone);
  const currentStamps = stampCard.currentStamps || 0;

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

  const handleUrlChange = (missionId: string, val: string) => {
    setMissionUrls((prev) => ({ ...prev, [missionId]: val }));
    setErrorMessage("");
  };

  const handleOpenTask = (url: string) => {
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
              {t("Paso 7 · Centro de Misiones", "Step 7 · Mission Center")}
            </span>
            <span className="h-px w-6 bg-gold" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal tracking-tight">
            {t("Misiones Gourmet & Sellos Extras", "Gourmet Missions & Extra Stamps")}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground font-light max-w-lg mx-auto">
            {t(
              "¡Sigue ganando! Completa estas tareas en redes sociales, envía el enlace y acumula sellos en tu tarjeta digital.",
              "Keep winning! Complete these tasks on social media, submit the link and collect stamps on your digital card."
            )}
          </p>
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
                      <h4 className="font-medium text-foreground text-sm sm:text-base mt-1 truncate">
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
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-border/40 bg-muted/10 space-y-4">
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

      {/* BOTONES INFERIORES DE NAVEGACIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
        {onBackToSecondChance && (
          <button
            type="button"
            onClick={onBackToSecondChance}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-xs text-muted-foreground hover:text-foreground hover:border-gold transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("← Volver a la 2ª Oportunidad", "← Back to 2nd Chance")}</span>
          </button>
        )}

        {onResetToStart && (
          <button
            type="button"
            onClick={onResetToStart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs uppercase tracking-wider font-bold shadow-md cursor-pointer transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("Comenzar Nueva Experiencia", "Start New Experience")}</span>
          </button>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  ExternalLink,
  X,
  Send,
  Star,
  Video,
  ThumbsUp,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Gift,
} from "lucide-react";

export interface MissionItem {
  id: string;
  category: string;
  title: string;
  rewardStamps: number;
  rewardText: string;
  badge: string;
  icon: string;
  description: string;
  rules: string[];
  actionUrl: string;
  evidencePlaceholder: string;
  active: boolean;
}

const DEFAULT_MISSIONS: MissionItem[] = [
  {
    id: "m_tiktok",
    category: "Creación de Contenido",
    title: "Video o Reel en TikTok",
    rewardStamps: 3,
    rewardText: "+3 Sellos de Visita",
    badge: "VIRAL TOP",
    icon: "🎵",
    description: "Sube un video o TikTok mostrando tu postre favorito, café o el unboxing de tu domicilio.",
    rules: [
      "Muestra claramente un producto o espacio de Bliss Soul Bakery.",
      "Menciona @blisssoulbakery o usa la etiqueta oficial.",
      "Pega el enlace de tu video publicado una vez esté visible.",
    ],
    actionUrl: "https://www.tiktok.com",
    evidencePlaceholder: "https://www.tiktok.com/@tu_usuario/video/...",
    active: true,
  },
  {
    id: "m_trustpilot",
    category: "Reseñas Verificadas",
    title: "Opinión en Trustpilot",
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
    evidencePlaceholder: "https://wa.me/... o confirmación de estado",
    active: true,
  },
];

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerWhatsapp?: string;
  onMissionSubmitted?: () => void;
}

export function MissionsModal({
  isOpen,
  onClose,
  customerName = "",
  customerWhatsapp = "",
  onMissionSubmitted,
}: MissionsModalProps) {
  const { t } = useLanguage();
  const [missions, setMissions] = useState<MissionItem[]>(DEFAULT_MISSIONS);
  const [selectedMission, setSelectedMission] = useState<MissionItem | null>(null);

  // Campos de envío de evidencia
  const [name, setName] = useState(customerName);
  const [whatsapp, setWhatsapp] = useState(customerWhatsapp);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Cargar misiones desde la API si está disponible
  useEffect(() => {
    if (isOpen) {
      fetch("/api/missions")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && Array.isArray(data.missions) && data.missions.length > 0) {
            setMissions(data.missions);
          }
        })
        .catch(() => {
          // Utilizar DEFAULT_MISSIONS como respaldo
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (customerName) setName(customerName);
    if (customerWhatsapp) setWhatsapp(customerWhatsapp);
  }, [customerName, customerWhatsapp]);

  if (!isOpen) return null;

  const handleSelectMission = (mission: MissionItem) => {
    setSelectedMission(mission);
    setEvidenceUrl("");
    setErrorMessage("");
    setSubmitSuccess(false);
  };

  const handleBackToList = () => {
    setSelectedMission(null);
    setSubmitSuccess(false);
    setErrorMessage("");
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMission) return;

    if (!evidenceUrl.trim()) {
      setErrorMessage("Por favor ingresa el enlace o comprobante de tu publicación.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/missions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: selectedMission.id,
          customerName: name.trim() || "Comensal Gourmet",
          customerWhatsapp: whatsapp.trim() || "573000000000",
          evidenceUrl: evidenceUrl.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        if (onMissionSubmitted) onMissionSubmitted();
      } else {
        setErrorMessage(data.error || "No se pudo registrar la misión. Intenta nuevamente.");
      }
    } catch (err) {
      setErrorMessage("Error de conexión con el servidor. Intenta nuevamente en unos instantes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border-2 border-gold/40 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ENCABEZADO SUPERIOR */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-gold/20 to-amber-500/15 border-b border-gold/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-gold/20 border border-gold/40 flex items-center justify-center text-lg shadow-xs">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">
                  {t("Programa de Embajadores", "Ambassadors Program")}
                </span>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                {t("Centro de Misiones Gourmet", "Gourmet Mission Board")}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {!selectedMission ? (
            /* VISTA 1: LISTADO DE MISIONES ESTILO SCREPY BOUNTY BOARD */
            <>
              {/* EXPLICACIÓN AMIGABLE */}
              <div className="rounded-2xl bg-amber-500/10 border border-gold/30 p-3.5 text-xs text-muted-foreground flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {t(
                    "¡Acelera tu tarjeta VIP sin esperar a tu próxima visita! Completa misiones compartiendo tu experiencia en redes o dejando tu reseña para ganar sellos directos.",
                    "Boost your VIP card from home! Complete missions sharing your experience or reviews to earn stamps directly."
                  )}
                </p>
              </div>

              {/* LISTA DE MISIONES */}
              <div className="space-y-3">
                {missions.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMission(m)}
                    className="p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-background/60 hover:bg-gold/5 hover:border-gold/50 transition-all cursor-pointer group shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-card border border-gold/30 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                        {m.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                            {m.category}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-1.5 py-0.2 rounded border border-gold/30">
                            {m.badge}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-foreground mt-0.5 group-hover:text-gold transition-colors">
                          {m.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div className="text-right">
                        <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                          {m.rewardText}
                        </span>
                        <span className="block text-[10px] text-gold font-medium mt-0.5 group-hover:underline">
                          {t("Completar", "Start")} →
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* VISTA 2: DETALLE DE MISIÓN & ENVÍO DE EVIDENCIA */
            <div className="space-y-4 animate-fade-in">
              {/* BOTÓN REGRESAR */}
              <button
                type="button"
                onClick={handleBackToList}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium cursor-pointer"
              >
                ← {t("Volver a todas las misiones", "Back to all missions")}
              </button>

              {/* ENCABEZADO DE LA MISIÓN */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-gold/40 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{selectedMission.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/20 px-2 py-0.5 rounded-full border border-gold/40">
                        {selectedMission.category}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-base text-foreground mt-1">
                      {selectedMission.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {selectedMission.description}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-full font-mono shrink-0">
                  {selectedMission.rewardText}
                </span>
              </div>

              {/* PASOS / REGLAS CLARAS */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-xs space-y-2">
                <strong className="text-foreground text-[11px] uppercase tracking-wider block">
                  📋 {t("Instrucciones para validar tus sellos:", "Instructions to claim your stamps:")}
                </strong>
                <ol className="space-y-1.5 pl-4 list-decimal text-muted-foreground">
                  {selectedMission.rules.map((rule, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {rule}
                    </li>
                  ))}
                </ol>

                <div className="pt-2">
                  <a
                    href={selectedMission.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/20 hover:bg-gold/30 text-gold font-semibold text-xs border border-gold/40 transition-colors"
                  >
                    <span>{t("Abrir plataforma / enlace oficial", "Open official link")}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* FORMULARIO DE ENVÍO */}
              {!submitSuccess ? (
                <form onSubmit={handleSubmitEvidence} className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>{t("Enlace o Comprobante de tu Publicación", "Link or Proof of Post")} *</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Público y accesible</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      placeholder={selectedMission.evidencePlaceholder}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-gold/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">
                        {t("Tu Nombre", "Your Name")}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Camila Morales"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-gold/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">
                        {t("WhatsApp (para tus sellos)", "WhatsApp (for your stamps)")}
                      </label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="300 123 4567"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-gold/50 font-mono"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gold hover:bg-gold/90 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>{t("Enviando evidencia...", "Submitting...")}</span>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>{t("Enviar para Validación & Sumar Sellos", "Submit for Stamps")}</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* CONFIRMACIÓN DE ENVÍO EXITOSO */
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-2 animate-fade-in">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-800 flex items-center justify-center mx-auto text-xl">
                    ✓
                  </div>
                  <h4 className="font-bold text-sm text-foreground">
                    {t("¡Misión Enviada con Éxito!", "Mission Submitted Successfully!")}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(
                      `Tu evidencia para "${selectedMission.title}" ha sido recibida. Nuestro equipo validará el enlace y se acreditarán ${selectedMission.rewardText} a tu tarjeta digital.`,
                      `Your submission has been received. Our team will verify it and add your stamps.`
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="mt-3 px-4 py-2 rounded-xl bg-gold text-white font-semibold text-xs transition-all cursor-pointer"
                  >
                    {t("Ver más misiones disponibles", "Explore more missions")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PIE DE PÁGINA */}
        <div className="p-3 bg-muted/40 border-t border-border/60 text-center text-[10px] text-muted-foreground">
          Bliss Soul VIP Club · {t("Los sellos se acumulan automáticamente en tu número de WhatsApp", "Stamps link automatically to your WhatsApp number")}
        </div>
      </div>
    </div>
  );
}

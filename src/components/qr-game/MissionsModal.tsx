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
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StampService } from "@/lib/stampService";

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
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Estado de inputs para cada misión: { [missionId]: url }
  const [missionUrls, setMissionUrls] = useState<Record<string, string>>({});
  const [submittingMissionId, setSubmittingMissionId] = useState<string | null>(null);
  const [successMissionId, setSuccessMissionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Datos del cliente
  const [name, setName] = useState(customerName);
  const [whatsapp, setWhatsapp] = useState(customerWhatsapp);

  // Misiones expandidas para ver detalles
  const [expandedId, setExpandedId] = useState<string | null>(DEFAULT_MISSIONS[0].id);

  // Sincronizar datos de misiones y envíos desde la API
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
    if (isOpen) {
      loadMissionsData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (customerName) setName(customerName);
    if (customerWhatsapp) setWhatsapp(customerWhatsapp);
  }, [customerName, customerWhatsapp]);

  if (!isOpen) return null;

  // Calcular sellos actuales de la tarjeta
  const cleanPhone = (whatsapp || "").replace(/\D/g, "");
  const stampCard = StampService.getCustomerStampCard(cleanPhone);
  const currentStamps = stampCard.currentStamps || 0;

  // Calcular misiones pendientes del cliente
  const myPendingSubmissions = submissions.filter(
    (s) => s.status === "PENDIENTE" && (!cleanPhone || s.customerWhatsapp === cleanPhone)
  );
  const pendingStamps = myPendingSubmissions.reduce(
    (acc, cur) => acc + (cur.rewardStamps || 1),
    0
  );

  // Total de sellos disponibles por ganar en misiones
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
      setErrorMessage(
        t(
          "Por favor escribe o pega la URL de tu publicación antes de enviar a revisión.",
          "Please enter or paste your post URL before submitting for review."
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
          customerName: name.trim() || "Comensal Gourmet",
          customerWhatsapp: cleanPhone || "573000000000",
          evidenceUrl: url,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMissionId(mission.id);
        setMissionUrls((prev) => ({ ...prev, [mission.id]: "" }));
        loadMissionsData();
        if (onMissionSubmitted) onMissionSubmitted();
      } else {
        setErrorMessage(data.error || "No se pudo registrar la misión.");
      }
    } catch (err) {
      setErrorMessage("Error de conexión al enviar misión para revisión.");
    } finally {
      setSubmittingMissionId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121620] text-slate-100 border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* ENCABEZADO SUPERIOR */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#161c28] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg shadow-xs">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {t("Gana Sellos VIP", "Earn VIP Stamps")}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {missions.length} misiones activas
                </span>
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-white mt-0.5">
                {t("Centro de Misiones & Embajadores", "Mission & Ambassador Center")}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* ============================================================== */}
          {/* WIDGET RESUMEN ESTILO SCREPY (EXACTO A IMAGEN 2 DEL USUARIO)    */}
          {/* ============================================================== */}
          <div className="rounded-2xl border border-slate-700/90 bg-[#181f2e] p-5 shadow-lg space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {t("Resumen de Recompensas", "Reward Summary")}
                </h4>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  Programa Activo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t("Acumula sellos en tu tarjeta digital de 15 visitas", "Collect stamps for your 15-visit digital card")}
              </p>
            </div>

            {/* CONTADOR GIGANTE */}
            <div className="pt-1 pb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  {currentStamps} sellos
                </span>
              </div>
              <span className="text-xs text-slate-400 block mt-1">
                {t("Sellos activos acumulados en tu tarjeta", "Active stamps collected on your card")}
              </span>
            </div>

            {/* LÍNEA DIVISORIA */}
            <div className="border-b border-slate-700/80" />

            {/* DESGLOSE: GANADO / PENDIENTE / DISPONIBLE */}
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t("Ganado", "Earned")}</span>
                <span className="font-bold font-mono text-white">{currentStamps} sellos</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t("Pendiente de revisión", "Pending review")}</span>
                <span className="font-bold font-mono text-amber-400">
                  {pendingStamps > 0 ? `+${pendingStamps} sellos` : "0 sellos"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t("Disponible por ganar", "Available to earn")}</span>
                <span className="font-bold font-mono text-emerald-400">
                  +{totalAvailableStamps} sellos
                </span>
              </div>
            </div>

            {/* NOTA DE TIEMPO DE REVISIÓN */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/70 text-xs text-slate-300 flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                {t(
                  "Normalmente revisamos los envíos y acreditamos tus sellos en menos de 24 horas.",
                  "We typically review submissions and credit stamps within 24 hours."
                )}
              </span>
            </div>
          </div>

          {/* GRAN DESAFÍO EMBAJADOR: CENA PARA 2 & CONCURSO MENSUAL */}
          <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-slate-900 to-amber-900/20 p-5 shadow-lg space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xl">
                👑
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Gran Desafío Mensual
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  ¡Completa todas las misiones y GANA una Cena para 2!
                </h4>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Al completar las {missions.length} misiones (incluyendo invitar amigos), recibes tu pase VIP y entras automáticamente con tu número de boleto al <strong>Sorteo Mensual de la Casa</strong>.
            </p>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Premio del Sorteo:</span>
              <strong className="text-amber-400 font-serif">Cena Degustación de Autor para 2</strong>
            </div>
          </div>

          {/* MENSAJE DE ERROR GLOBAL SI APLICA */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* ============================================================== */}
          {/* LISTA DE MISIONES CON INTERACCIÓN (IMAGEN 3 DEL USUARIO)        */}
          {/* ============================================================== */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              {t("Misiones Disponibles:", "Available Missions:")}
            </span>

            {missions.map((m) => {
              const isExpanded = expandedId === m.id;
              const isSubmitting = submittingMissionId === m.id;
              const isSuccess = successMissionId === m.id;
              const currentUrl = missionUrls[m.id] || "";

              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? "border-amber-500/50 bg-[#192132] shadow-md"
                      : "border-slate-800 bg-[#151b27] hover:border-slate-700"
                  }`}
                >
                  {/* CABECERA DE LA MISIÓN */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : m.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                        {m.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                            {m.category}
                          </span>
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {m.rewardText}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm sm:text-base text-white mt-0.5">
                          {m.title}
                        </h4>
                      </div>
                    </div>

                    <div className="shrink-0 text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-amber-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 hover:text-white" />
                      )}
                    </div>
                  </div>

                  {/* CUERPO EXPANDIDO CON ACCIÓN EXACTA DE IMAGEN 3 */}
                  {isExpanded && (
                    <div className="px-4 pb-5 pt-1 border-t border-slate-800/80 space-y-4 animate-fade-in text-xs">
                      <p className="text-slate-300 leading-relaxed">
                        {m.description}
                      </p>

                      {/* REGLAS CLARAS */}
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 space-y-1">
                        <strong className="text-white block text-[11px] uppercase tracking-wider mb-1">
                          Instrucciones:
                        </strong>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-400 text-[11px]">
                          {m.rules.map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>

                      {/* ======================================================= */}
                      {/* BOTÓN "ABRIR TAREA" + INPUT "URL" + BOTÓN "ENVIAR REVISIÓN" */}
                      {/* (EXACTO A IMAGEN 3 DEL USUARIO)                         */}
                      {/* ======================================================= */}
                      <div className="pt-2 space-y-3">
                        {/* 1. Botón Abrir Tarea */}
                        <div>
                          <button
                            type="button"
                            onClick={() => handleOpenTask(m.actionUrl)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>{t("Abrir tarea", "Open task")}</span>
                          </button>
                        </div>

                        {/* 2. Formulario: URL de la publicación + Botón Enviar */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-200 block tracking-wide">
                            {t("URL de la publicación", "Post URL")}
                          </label>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="url"
                              value={currentUrl}
                              onChange={(e) => handleUrlChange(m.id, e.target.value)}
                              placeholder={m.evidencePlaceholder || "https://"}
                              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
                            />

                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleSubmitForReview(m)}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-fuchsia-500 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0 text-center"
                            >
                              {isSubmitting ? (
                                <span>{t("Enviando...", "Submitting...")}</span>
                              ) : (
                                <span>{t("Enviar para revisión", "Submit for review")}</span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Mensaje de confirmación local */}
                        {isSuccess && (
                          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            <span>
                              {t(
                                "✓ ¡Publicación enviada para revisión! Nuestro equipo verificará tu enlace.",
                                "✓ Submission sent for review! Our team will verify your link."
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
        </div>

        {/* PIE DE PÁGINA */}
        <div className="p-3.5 bg-[#161c28] border-t border-slate-800 text-center text-[11px] text-slate-400">
          Bliss Soul VIP Club · {t("Los sellos se acreditan automáticamente tras la aprobación", "Stamps are credited automatically upon approval")}
        </div>
      </div>
    </div>
  );
}

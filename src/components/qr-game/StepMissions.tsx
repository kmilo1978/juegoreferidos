import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  ExternalLink,
  Send,
  Star,
  RotateCcw,
  Coffee,
  Wine,
  Gift,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StampService } from "@/lib/stampService";
import { MissionItem } from "./MissionsModal";
import { clientConfig } from "@/config/clientConfig";

interface StepMissionsProps {
  customerName?: string | undefined;
  customerWhatsapp?: string | undefined;
  onResetToStart?: () => void;
}

export function StepMissions({
  customerName = "Comensal",
  customerWhatsapp = "",
  onResetToStart,
}: StepMissionsProps) {
  const { t } = useLanguage();
  const brandName = clientConfig.brand.name;

  const [stampCard] = useState(() => StampService.getCustomerStampCard(customerWhatsapp));
  const currentStamps = Math.min(stampCard.currentStamps || 3, 15);

  const missions: MissionItem[] = [
    {
      id: "m_tiktok",
      category: t("Creación de Contenido", "Content Creation"),
      title: t("Video o Reel en Redes", "Video or Reel on Social"),
      rewardStamps: 3,
      rewardText: "+3 Sellos VIP",
      badge: "VIRAL TOP",
      icon: "🎵",
      description: t(
        `Comparte un video corto disfrutando tu plato favorito en ${brandName}.`,
        `Share a short clip enjoying your meal at ${brandName}.`
      ),
      rules: [
        t("Publica un video público en TikTok o Instagram Reels.", "Post a public video on TikTok or Reels."),
        t(`Menciona la cuenta oficial de ${brandName}.`, `Tag ${brandName}'s official handle.`),
      ],
      actionUrl: "https://www.tiktok.com",
      active: true,
    },
    {
      id: "m_google_photo",
      category: t("Reseña con Fotografía", "Photo Review"),
      title: t("Foto en Google Maps", "Photo on Google Maps"),
      rewardStamps: 2,
      rewardText: "+2 Sellos VIP",
      badge: "ALTA DEMANDA",
      icon: "📸",
      description: t(
        "Sube una foto de tu mesa a Google Maps acompañando tu opinión.",
        "Add a photo of your table on Google Maps with your review."
      ),
      rules: [
        t("Adjunta al menos 1 fotografía de tu mesa.", "Attach at least 1 photo of your dining."),
        t("Menciona tu plato o bebida preferida.", "Mention your favorite dish or drink."),
      ],
      actionUrl: "https://maps.google.com",
      active: true,
    },
    {
      id: "m_referrals",
      category: t("Referidos Gastronómicos", "Dining Referrals"),
      title: t("Invita a un Amigo en Mesa", "Invite a Friend to Dine"),
      rewardStamps: 2,
      rewardText: "+2 Sellos VIP",
      badge: "RECOMENDADO",
      icon: "👥",
      description: t(
        "Comparte tu enlace de recomendación con un amigo que nos visite.",
        "Share your referral link with a friend who visits us."
      ),
      rules: [
        t("Envía la invitación a tus contactos gastronómicos.", "Send invitation to food lovers."),
        t("Cuando tu amigo escanee en mesa, ambos suman sellos.", "When your friend scans at table, both earn stamps."),
      ],
      actionUrl: "https://api.whatsapp.com",
      active: true,
    },
  ];

  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Barra de progreso Stitch */}
      <Reveal>
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201f23] text-[#f2be71] border border-[#f2be71]/30">
              <Sparkles className="h-3.5 w-3.5 text-[#f2be71]" />
              <span className="font-label-sm text-[10px] uppercase tracking-wider font-bold">
                {t("PASO 7 DE 7 • FIDELIZACIÓN, 15 SELLOS & MISIONES VIP", "STEP 7 OF 7 • VIP LOYALTY & MISSIONS")}
              </span>
            </div>
            <span className="font-label-sm text-[11px] text-[#ccc3d8] font-medium">100% Completado</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#2b292e] overflow-hidden mt-1">
            <div className="h-full rounded-full bg-gradient-to-r from-[#d1bcff] via-[#f2be71] to-[#ffddb1] shadow-[0_0_10px_rgba(242,190,113,0.7)] w-full transition-all duration-500" />
          </div>
        </section>
      </Reveal>

      {/* Tarjeta de 15 Sellos VIP estilo Stitch */}
      <Reveal delay={50}>
        <div className="w-full rounded-3xl bg-[#1c1b1f] border border-[#2b292e] p-5 sm:p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#f2be71]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Cabecera del Club VIP */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#f2be71]" />
                <span className="font-headline-sm text-sm text-[#e6e1e7] uppercase font-bold tracking-wider">
                  {brandName} VIP Club
                </span>
              </div>
              <span className="font-body-sm text-[11px] text-[#ccc3d8] mt-0.5">
                {customerName} • {customerWhatsapp || "Mesa Activa"}
              </span>
            </div>
            <div className="bg-[#684400]/40 border border-[#f2be71]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f2be71] animate-ping" />
              <span className="font-label-sm text-xs text-[#f2be71] font-bold">
                {currentStamps} / 15 {t("Sellos", "Stamps")}
              </span>
            </div>
          </div>

          {/* Cuadrícula de 15 Sellos (3 filas x 5 columnas) */}
          <div className="grid grid-cols-5 gap-2.5 pt-1">
            {Array.from({ length: 15 }, (_, i) => i + 1).map((selloNum) => {
              const isEarned = selloNum <= currentStamps;
              const isMilestone5 = selloNum === 5;
              const isMilestone10 = selloNum === 10;
              const isMilestone15 = selloNum === 15;

              return (
                <div
                  key={selloNum}
                  className={`aspect-square rounded-full flex flex-col items-center justify-center relative transition-all ${
                    isEarned
                      ? "bg-gradient-to-br from-[#f2be71] to-[#b88330] text-[#141317] shadow-[0_0_12px_rgba(242,190,113,0.5)] scale-105"
                      : isMilestone15
                        ? "bg-gradient-to-tr from-[#684400] to-[#3a383d] border border-[#f2be71]/50 text-[#f2be71]"
                        : isMilestone10
                          ? "bg-[#2b292e] border border-[#d1bcff]/50 text-[#d1bcff]"
                          : isMilestone5
                            ? "bg-[#2b292e] border border-[#f2be71]/50 text-[#f2be71]"
                            : "bg-[#201f23] border border-[#2b292e] text-[#ccc3d8]/40"
                  }`}
                >
                  {isEarned ? (
                    <span className="text-sm font-black">✓</span>
                  ) : isMilestone15 ? (
                    <>
                      <Trophy className="h-4 w-4" />
                      <span className="text-[7px] font-bold mt-0.5">15 VIP</span>
                    </>
                  ) : isMilestone10 ? (
                    <>
                      <Gift className="h-4 w-4" />
                      <span className="text-[8px] font-bold mt-0.5">10</span>
                    </>
                  ) : isMilestone5 ? (
                    <>
                      <Coffee className="h-4 w-4" />
                      <span className="text-[8px] font-bold mt-0.5">5</span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold">{selloNum}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumen del Próximo Hito */}
          <div className="bg-[#201f23] border border-[#363439] rounded-xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#ccc3d8] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f2be71]" />
                <span>
                  {t("Próxima meta:", "Next reward:")}{" "}
                  <strong className="text-[#e6e1e7]">{Math.max(1, 5 - (currentStamps % 5))} sellos restantes</strong>
                </span>
              </span>
              <span className="text-[#f2be71] font-bold text-[11px]">
                {currentStamps < 5 ? "Sello 5: Café Gratis ☕" : currentStamps < 10 ? "Sello 10: Postre Autor 🍰" : "Sello 15: Cena 2P 🏆"}
              </span>
            </div>
            <div className="w-full bg-[#2b292e] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#f2be71] h-full rounded-full transition-all duration-500"
                style={{ width: `${((currentStamps % 5) / 5) * 100 || 20}%` }}
              />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Banner de Desafío Embajador estilo Stitch */}
      <Reveal delay={100}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#201f23] to-[#1c1b1f] border border-[#f2be71]/30 p-4 shadow-xl flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-[#684400]/40 border border-[#f2be71]/40 flex items-center justify-center shrink-0 text-[#f2be71]">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] uppercase tracking-wider text-[#f2be71] font-bold">
                {t("Desafío Embajador", "Ambassador Challenge")}
              </span>
              <span className="bg-[#684400]/50 border border-[#f2be71]/30 text-[#ffddb1] text-[10px] px-2 py-0.5 rounded-full font-bold">
                1 Boleto VIP
              </span>
            </div>
            <h3 className="font-headline-sm text-sm text-[#e6e1e7] font-bold mt-0.5">
              {t("Cena Degustación para 2 Personas", "Chef Tasting Dinner for 2")}
            </h3>
            <p className="font-body-sm text-xs text-[#ccc3d8] mt-1">
              {t(
                "Completa misiones para sumar participaciones al gran sorteo exclusivo de fin de mes.",
                "Complete missions to earn entries into our exclusive monthly grand prize."
              )}
            </p>
          </div>
        </div>
      </Reveal>

      {/* Lista de Misiones VIP */}
      <Reveal delay={150}>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-sm text-xs text-[#e6e1e7] uppercase font-bold tracking-wider">
              {t("Misiones para Ganar Sellos Extra", "Missions to Earn Extra Stamps")}
            </span>
            <span className="text-[10px] text-[#ccc3d8]">Gana sin esperar tu próxima visita</span>
          </div>

          {missions.map((m) => {
            const isExpanded = expandedMission === m.id;
            return (
              <div
                key={m.id}
                className="rounded-2xl bg-[#1c1b1f] border border-[#2b292e] p-3.5 flex flex-col gap-2 transition-all shadow-sm"
              >
                <div
                  onClick={() => setExpandedMission(isExpanded ? null : m.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{m.icon}</span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-[#e6e1e7]">{m.title}</span>
                      <span className="text-[10px] text-[#ccc3d8]">{m.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#684400]/40 text-[#ffddb1] border border-[#f2be71]/30 text-[10px] font-bold">
                      {m.rewardText}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[#ccc3d8]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#ccc3d8]" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-2 border-t border-[#2b292e] flex flex-col gap-2 text-xs animate-in fade-in">
                    <p className="text-[#ccc3d8]">{m.description}</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#ccc3d8]/80">
                      {m.rules.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                    <a
                      href={m.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f2be71] text-[#141317] font-bold text-xs shadow-sm hover:brightness-105"
                    >
                      <span>{t("Realizar Misión", "Complete Mission")}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Botón para reiniciar o volver al inicio */}
      <Reveal delay={200}>
        <div className="pt-2">
          {onResetToStart && (
            <button
              type="button"
              onClick={onResetToStart}
              className="w-full h-12 rounded-full bg-[#201f23] hover:bg-[#2b292e] border border-[#363439] text-[#ccc3d8] hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-[#f2be71]" />
              <span>{t("Volver al Inicio (Modo Demo)", "Return to Start (Demo Mode)")}</span>
            </button>
          )}
        </div>
      </Reveal>
    </div>
  );
}

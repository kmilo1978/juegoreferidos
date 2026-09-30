import { useState } from "react";
import { ParticipantData } from "./gameTypes";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "@/components/shared/Reveal";
import { ArrowRight, User, Phone, Check, Calendar, Sparkles, ShieldCheck, Gift } from "lucide-react";
import { clientConfig } from "@/config/clientConfig";

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

export function StepUserData({ initialData, onComplete }: StepUserDataProps) {
  const { t } = useLanguage();

  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || "");
  const [consentData, setConsentData] = useState(initialData?.consentData ?? true);
  const [consentMarketing, setConsentMarketing] = useState(initialData?.consentMarketing ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = () => {
    const errs: FormErrors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = t(
        "Por favor ingresa tu nombre completo.",
        "Please enter your full name.",
      );
    }

    const cleanPhone = whatsapp.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.whatsapp = t(
        "Ingresa tu número de WhatsApp (10 dígitos, ej: 300 123 4567).",
        "Enter a valid WhatsApp number (10 digits).",
      );
    }

    if (!consentData) {
      errs.consentData = t(
        "Debes autorizar el tratamiento de datos para recibir el código.",
        "You must authorize data processing to receive your voucher code.",
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
        birthDate: birthDate.trim() || undefined,
        consentData,
        consentMarketing,
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Título de bienvenida e incentivo gastronómico */}
      <Reveal delay={50}>
        <section className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-[#1c1b1f] border border-[#f2be71]/40 text-[#ffddb1] shadow-xs">
            <span className="text-[#f2be71]">⚡</span>
            <span className="font-label-sm text-[11px] font-semibold tracking-wide">
              {t("Beneficio de cortesía asegurado para tu mesa", "Complimentary treat guaranteed for your table")}
            </span>
          </div>

          <h1 className="font-headline-xl-mobile text-2xl sm:text-3xl text-[#e6e1e7] tracking-tight mt-1">
            {t("Tus Datos para el", "Your Details for the")}{" "}
            <span className="text-[#f2be71] italic font-serif">
              {t("Desafío Gourmet", "Gourmet Challenge")}
            </span>
          </h1>

          <p className="font-body-md text-sm text-[#ccc3d8] leading-relaxed">
            {t(
              "Ingresa tus datos para registrar tu mesa y activar tu oportunidad de ganar un beneficio de la casa hoy.",
              "Enter your details to register your table and claim a special dining reward today."
            )}
          </p>

          {/* Banner de Ambiente Gastronómico de la Mesa */}
          <div className="relative w-full h-20 rounded-2xl overflow-hidden mt-2 bg-[#0f0e12] border border-[#2b292e] shadow-md flex items-center justify-between p-4">
            <div className="relative z-10 flex flex-col max-w-[240px]">
              <span className="font-label-sm text-[10px] uppercase tracking-wider text-[#f2be71] font-bold">
                {clientConfig.brand.name}
              </span>
              <span className="font-headline-sm text-sm text-[#e6e1e7] leading-tight mt-0.5 font-bold">
                {t("Experiencia en Sala & Fidelización", "Boutique Table Experience")}
              </span>
            </div>
            <div className="relative z-10 w-10 h-10 rounded-full bg-[#2b292e]/90 border border-[#f2be71]/30 flex items-center justify-center text-[#f2be71] shadow-md">
              <Gift className="h-5 w-5" />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Tarjeta de Formulario de Lujo */}
      <Reveal delay={100}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="w-full rounded-2xl bg-[#1c1b1f] border border-[#2b292e] p-5 sm:p-6 flex flex-col gap-4 shadow-xl backdrop-blur-xl relative overflow-hidden">
            {/* Halo de luz ambiental decorativo */}
            <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-[#f2be71]/5 blur-2xl pointer-events-none" />

            {/* Campo 1: Nombre Completo */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="full-name" className="flex items-center gap-1.5 font-label-md text-xs text-[#e6e1e7] font-semibold">
                <User className="h-3.5 w-3.5 text-[#f2be71]" />
                <span>{t("Nombre Completo", "Full Name")}</span>
                <span className="text-[#f2be71]">*</span>
              </label>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("Ej: Valentina Torres", "E.g. Valentina Torres")}
                className={`w-full h-12 px-4 rounded-xl bg-[#0f0e12] text-[#e6e1e7] font-body-md text-sm placeholder:text-[#958da1] border transition-all ${
                  errors.fullName
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-[#2b292e] focus:border-[#f2be71] focus:ring-1 focus:ring-[#f2be71]/40"
                }`}
              />
              {errors.fullName && <p className="text-xs text-red-400 pl-1">{errors.fullName}</p>}
            </div>

            {/* Campo 2: WhatsApp Oficial */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="whatsapp" className="flex items-center gap-1.5 font-label-md text-xs text-[#e6e1e7] font-semibold">
                  <Phone className="h-3.5 w-3.5 text-[#f2be71]" />
                  <span>{t("WhatsApp Oficial", "Official WhatsApp")}</span>
                  <span className="text-[#f2be71]">*</span>
                </label>
                <span className="font-label-sm text-[10px] text-[#ccc3d8]">
                  {t("Solo para enviar tu código", "To receive your voucher")}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="h-12 px-3 rounded-xl bg-[#0f0e12] border border-[#2b292e] flex items-center gap-1.5 shrink-0 text-sm font-semibold text-[#e6e1e7]">
                  <span>🇨🇴</span>
                  <span>+57</span>
                </div>
                <input
                  id="whatsapp"
                  type="tel"
                  maxLength={10}
                  inputMode="numeric"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                  placeholder="300 123 4567"
                  className={`w-full h-12 px-4 rounded-xl bg-[#0f0e12] text-[#e6e1e7] font-body-md text-sm placeholder:text-[#958da1] border tracking-wider transition-all ${
                    errors.whatsapp
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-[#2b292e] focus:border-[#f2be71] focus:ring-1 focus:ring-[#f2be71]/40"
                  }`}
                />
              </div>
              {errors.whatsapp && <p className="text-xs text-red-400 pl-1">{errors.whatsapp}</p>}
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#f2be71]" />
                <p className="font-label-sm text-[11px] text-[#f2be71]">
                  {t("Tu número queda vinculado a tu mesa de forma segura", "Your number is securely linked to your table")}
                </p>
              </div>
            </div>

            {/* Campo 3: Cumpleaños (Opcional) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="birthday" className="flex items-center gap-1.5 font-label-md text-xs text-[#e6e1e7] font-semibold">
                  <Calendar className="h-3.5 w-3.5 text-[#f2be71]" />
                  <span>{t("Fecha de Cumpleaños", "Birthday Date")}</span>
                </label>
                <span className="px-2 py-0.5 rounded-full bg-[#2b292e] text-[#ccc3d8] font-label-sm text-[10px]">
                  {t("Opcional", "Optional")}
                </span>
              </div>
              <input
                id="birthday"
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder={t("DD / MM (Ej. 24 / 08)", "DD / MM (e.g. 24 / 08)")}
                className="w-full h-12 px-4 rounded-xl bg-[#0f0e12] text-[#e6e1e7] font-body-md text-sm placeholder:text-[#958da1] border border-[#2b292e] focus:border-[#f2be71] focus:ring-1 focus:ring-[#f2be71]/40 transition-all"
              />
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#201f23] border border-[#363439] mt-0.5">
                <Gift className="h-4 w-4 text-[#f2be71] shrink-0 mt-0.5" />
                <p className="font-body-sm text-xs text-[#ccc3d8]">
                  {t(
                    "Recibe un postre de autor de cortesía durante tu mes especial.",
                    "Receive a complimentary chef dessert during your special month."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta de Confianza y Consentimientos */}
          <div className="w-full rounded-2xl bg-[#1c1b1f] border border-[#2b292e] p-4 flex flex-col gap-3 shadow-md">
            {/* Consentimiento Legal Obligatorio */}
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={consentData}
                onChange={(e) => setConsentData(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  consentData
                    ? "bg-[#f2be71] text-[#141317]"
                    : "bg-[#0f0e12] border border-[#363439]"
                }`}
              >
                {consentData && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <span className="font-body-sm text-xs text-[#ccc3d8] leading-tight">
                {t(
                  "Autorizo el tratamiento de mis datos personales para validar mi premio conforme a la Ley de Protección de Datos.",
                  "I authorize data processing to validate my reward under data protection laws."
                )}
              </span>
            </label>
            {errors.consentData && <p className="text-xs text-red-400 pl-8">{errors.consentData}</p>}

            {/* Consentimiento VIP Club */}
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  consentMarketing
                    ? "bg-[#f2be71] text-[#141317]"
                    : "bg-[#0f0e12] border border-[#363439]"
                }`}
              >
                {consentMarketing && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <span className="font-body-sm text-xs text-[#e6e1e7] leading-tight">
                {t(
                  "Deseo recibir invitaciones a catas privadas, novedades y beneficios exclusivos por WhatsApp.",
                  "I want to receive invitations to private tastings, novelties and perks by WhatsApp."
                )}
              </span>
            </label>

            {/* Habeas Data Badge */}
            <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-[#2b292e] text-center">
              <ShieldCheck className="h-3.5 w-3.5 text-[#958da1]" />
              <span className="font-label-sm text-[10px] text-[#958da1]">
                {t("Datos 100% protegidos y sin spam • Ley 1581 Habeas Data", "100% protected data • Zero spam guarantee")}
              </span>
            </div>
          </div>

          {/* Botón de Acción Principal */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="submit"
              className="w-full h-13 py-3 px-6 rounded-full btn-gold text-sm flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(242,190,113,0.35)] active:scale-[0.98] transition-all cursor-pointer hover:brightness-105"
            >
              <span>{t("Continuar a Instagram Stories", "Continue to Instagram Stories")}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f2be71]" />
              <p className="font-label-sm text-[11px] text-[#ccc3d8]">
                {t("Paso 2 desbloquea la ruleta de premios gourmet", "Step 2 unlocks the gourmet prize wheel")}
              </p>
            </div>
          </div>
        </form>
      </Reveal>
    </div>
  );
}

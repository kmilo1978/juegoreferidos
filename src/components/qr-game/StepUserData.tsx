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

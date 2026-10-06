import React from "react";

interface BrandIconProps {
  className?: string;
  size?: number;
}

/**
 * 1. TRIPADVISOR OFFICIAL LOGO (Búho característico con ojos de viajero)
 */
export function TripadvisorIcon({ className = "w-6 h-6", size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="23" fill="#00af87" />
      {/* Ojos exteriores */}
      <circle cx="15.5" cy="24.5" r="7.5" fill="#FFFFFF" stroke="#004f38" strokeWidth="1.5" />
      <circle cx="32.5" cy="24.5" r="7.5" fill="#FFFFFF" stroke="#004f38" strokeWidth="1.5" />
      {/* Pupilas */}
      <circle cx="15.5" cy="24.5" r="4" fill="#004f38" />
      <circle cx="32.5" cy="24.5" r="4" fill="#004f38" />
      <circle cx="14" cy="23" r="1.2" fill="#FFFFFF" />
      <circle cx="31" cy="23" r="1.2" fill="#FFFFFF" />
      {/* Cejas y puente */}
      <path
        d="M8.5 17C12 14.5 19 15.5 24 19.5C29 15.5 36 14.5 39.5 17"
        stroke="#004f38"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Pico */}
      <polygon points="24,20.5 21,27.5 27,27.5" fill="#004f38" />
      {/* Orejitas */}
      <path d="M12 14L8 8L16 11" fill="#004f38" />
      <path d="M36 14L40 8L32 11" fill="#004f38" />
    </svg>
  );
}

/**
 * 2. TIKTOK OFFICIAL LOGO (Nota musical con efecto cromático cyan/magenta)
 */
export function TikTokIcon({ className = "w-6 h-6", size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="23" fill="#010101" stroke="#252429" strokeWidth="1.5" />
      {/* Sombra Cyan */}
      <path
        d="M31.5 16.2C30 15.2 29 13.5 28.8 11.5H24.8V31.5C24.8 33.7 23 35.5 20.8 35.5C18.6 35.5 16.8 33.7 16.8 31.5C16.8 29.3 18.6 27.5 20.8 27.5C21.4 27.5 22 27.6 22.5 27.9V23.7C21.9 23.6 21.4 23.5 20.8 23.5C16.4 23.5 12.8 27.1 12.8 31.5C12.8 35.9 16.4 39.5 20.8 39.5C25.2 39.5 28.8 35.9 28.8 31.5V19.8C30.6 21.1 32.8 21.9 35.2 21.9V17.9C33.8 17.9 32.5 17.3 31.5 16.2Z"
        fill="#25F4EE"
        transform="translate(-1, -1)"
      />
      {/* Sombra Magenta */}
      <path
        d="M31.5 16.2C30 15.2 29 13.5 28.8 11.5H24.8V31.5C24.8 33.7 23 35.5 20.8 35.5C18.6 35.5 16.8 33.7 16.8 31.5C16.8 29.3 18.6 27.5 20.8 27.5C21.4 27.5 22 27.6 22.5 27.9V23.7C21.9 23.6 21.4 23.5 20.8 23.5C16.4 23.5 12.8 27.1 12.8 31.5C12.8 35.9 16.4 39.5 20.8 39.5C25.2 39.5 28.8 35.9 28.8 31.5V19.8C30.6 21.1 32.8 21.9 35.2 21.9V17.9C33.8 17.9 32.5 17.3 31.5 16.2Z"
        fill="#FE2C55"
        transform="translate(1, 1)"
      />
      {/* Nota Blanca Principal */}
      <path
        d="M31.5 16.2C30 15.2 29 13.5 28.8 11.5H24.8V31.5C24.8 33.7 23 35.5 20.8 35.5C18.6 35.5 16.8 33.7 16.8 31.5C16.8 29.3 18.6 27.5 20.8 27.5C21.4 27.5 22 27.6 22.5 27.9V23.7C21.9 23.6 21.4 23.5 20.8 23.5C16.4 23.5 12.8 27.1 12.8 31.5C12.8 35.9 16.4 39.5 20.8 39.5C25.2 39.5 28.8 35.9 28.8 31.5V19.8C30.6 21.1 32.8 21.9 35.2 21.9V17.9C33.8 17.9 32.5 17.3 31.5 16.2Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 3. GOOGLE MAPS OFFICIAL PIN (Pin tetracolor de Google)
 */
export function GoogleMapsIcon({ className = "w-6 h-6", size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="23" fill="#FFFFFF" />
      {/* Pin de Google Maps */}
      <path
        d="M24 10C17.37 10 12 15.37 12 22C12 29.8 21.5 38.3 22.8 39.45C23.5 40.1 24.5 40.1 25.2 39.45C26.5 38.3 36 29.8 36 22C36 15.37 30.63 10 24 10Z"
        fill="#EA4335"
      />
      <path
        d="M24 10C20.6 10 17.5 11.4 15.3 13.6L24 22V10Z"
        fill="#4285F4"
      />
      <path
        d="M32.7 13.6C30.5 11.4 27.4 10 24 10V22L32.7 13.6Z"
        fill="#FBBC04"
      />
      <path
        d="M24 22L15.3 30.4C16.8 32.8 19 35.5 21.8 38.4L24 22Z"
        fill="#34A853"
      />
      {/* Círculo central blanco */}
      <circle cx="24" cy="21" r="5" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * 4. INSTAGRAM OFFICIAL GRADIENT LOGO
 */
export function InstagramIcon({ className = "w-6 h-6", size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="igGrad" cx="20%" cy="110%" r="130%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="46" height="46" x="1" y="1" rx="14" fill="url(#igGrad)" />
      <rect
        x="10"
        y="10"
        width="28"
        height="28"
        rx="8"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        fill="none"
      />
      <circle cx="24" cy="24" r="6.8" stroke="#FFFFFF" strokeWidth="3.2" fill="none" />
      <circle cx="31.5" cy="16.5" r="2" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * 5. WHATSAPP OFFICIAL LOGO
 */
export function WhatsAppIcon({ className = "w-6 h-6", size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="23" fill="#25D366" />
      <path
        d="M24 11C16.8 11 11 16.8 11 24C11 26.6 11.8 29 13.1 31L11.5 37L17.7 35.4C19.6 36.4 21.7 37 24 37C31.2 37 37 31.2 37 24C37 16.8 31.2 11 24 11ZM30.4 29.3C30.1 30.1 29 30.7 28.1 30.9C27.5 31 26.7 31.1 23.8 29.9C20.2 28.4 17.8 24.7 17.6 24.5C17.5 24.3 16 22.3 16 20.2C16 18.1 17.1 17 17.5 16.6C17.9 16.2 18.5 16 19 16C19.2 16 19.4 16 19.5 16C20 16 20.2 16.1 20.5 16.8C20.9 17.7 21.8 19.9 21.9 20.1C22 20.3 22.1 20.6 21.9 20.9C21.8 21.2 21.7 21.3 21.5 21.6C21.3 21.8 21.1 22.1 20.9 22.3C20.7 22.5 20.5 22.8 20.7 23.2C21 23.7 21.9 25.1 23.2 26.3C24.9 27.8 26.3 28.3 26.8 28.5C27.2 28.7 27.6 28.6 27.9 28.3C28.3 27.8 28.8 27.1 29.3 26.4C29.7 25.9 30.1 25.9 30.6 26.1C31.1 26.3 33.7 27.6 34.2 27.8C34.7 28.1 35 28.2 35.1 28.4C35.2 28.6 35.2 29.3 34.9 30.1L30.4 29.3Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 6. FACEBOOK OFFICIAL LOGO
 */
export function FacebookIcon({ className = "w-6 h-6", size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="23" fill="#1877F2" />
      <path
        d="M27.2 25.5H31L31.6 20.6H27.2V17.5C27.2 16.2 27.6 15.3 29.5 15.3H31.8V11C31.4 10.9 30 10.8 28.4 10.8C25 10.8 22.7 12.9 22.7 16.7V20.6H18.5V25.5H22.7V37.6C23.6 37.8 24.5 37.9 25.4 37.9C26.3 37.9 27.2 37.8 28.1 37.6V25.5H27.2Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 7. TRUSTPILOT OFFICIAL LOGO (Estrella verde de autoridad)
 */
export function TrustpilotIcon({ className = "w-6 h-6", size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="23" fill="#1c252c" stroke="#00b67a" strokeWidth="1.5" />
      {/* Estrella Trustpilot */}
      <polygon
        points="24,9 28.2,21.8 41.7,21.8 30.8,29.7 35,42.5 24,34.6 13,42.5 17.2,29.7 6.3,21.8 19.8,21.8"
        fill="#00b67a"
      />
      <polygon
        points="24,34.6 28.2,21.8 41.7,21.8 30.8,29.7"
        fill="#005128"
        opacity="0.25"
      />
    </svg>
  );
}

/**
 * 8. BING PLACES & MAPS OFFICIAL LOGO
 */
export function BingIcon({ className = "w-6 h-6", size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="23" fill="#00809d" />
      <path
        d="M16 11V37L22.5 33.5L25.8 26L31 29L34 27.5L23.5 17.5L23.5 11L16 11Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * Helper para resolver el icono SVG real según el ID de misión
 */
export function getMissionBrandLogo(missionId: string, className = "w-7 h-7"): React.ReactNode {
  switch (missionId) {
    case "m_tripadvisor":
      return <TripadvisorIcon className={className} />;
    case "m_tiktok":
      return <TikTokIcon className={className} />;
    case "m_google_photo":
    case "m_google_review":
    case "m_google":
      return <GoogleMapsIcon className={className} />;
    case "m_instagram":
    case "m_instagram_story":
      return <InstagramIcon className={className} />;
    case "m_whatsapp_status":
    case "m_whatsapp_community":
    case "m_whatsapp_community_vip":
    case "m_whatsapp":
      return <WhatsAppIcon className={className} />;
    case "m_referrals":
      return <WhatsAppIcon className={className} />;
    case "m_facebook":
      return <FacebookIcon className={className} />;
    case "m_trustpilot":
      return <TrustpilotIcon className={className} />;
    case "m_bing":
      return <BingIcon className={className} />;
    default:
      return null;
  }
}

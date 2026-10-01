/**
 * MOTOR DE FUENTES DINÁMICAS DE GOOGLE FONTS
 * Permite seleccionar fuentes curadas o ingresar cualquier fuente de Google Fonts
 * aplicándola en tiempo real a títulos (--brand-font-heading) y cuerpo (--brand-font-body).
 */

export interface GoogleFontOption {
  name: string;
  category: "serif" | "sans-serif" | "display" | "handwriting";
  styleType: "Elegante / Bistró" | "Moderna / Nítida" | "Artesanal / Expresiva";
  description: string;
  recommendedFor: string;
}

export const CURATED_GOOGLE_FONTS_HEADING: GoogleFontOption[] = [
  // 1. Elegantes & Gastronómicas (Serif)
  {
    name: "Epilogue",
    category: "sans-serif",
    styleType: "Moderna / Nítida",
    description: "Predeterminada del sistema. Fuerte, limpia y balanceada.",
    recommendedFor: "Todo tipo de restaurantes modernos y gastrobares",
  },
  {
    name: "Playfair Display",
    category: "serif",
    styleType: "Elegante / Bistró",
    description: "Serif clásica de alto impacto. Transmite distinción y alta cocina.",
    recommendedFor: "Pastelerías boutique, repostería fina, alta gastronomía",
  },
  {
    name: "Cormorant Garamond",
    category: "serif",
    styleType: "Elegante / Bistró",
    description: "Líneas aristocráticas y delicadas con tradición europea.",
    recommendedFor: "Bistrós franceses, cavas de vino, restaurantes de autor",
  },
  {
    name: "Cinzel",
    category: "serif",
    styleType: "Elegante / Bistró",
    description: "Inspirada en inscripciones clásicas romanas con lujo atemporal.",
    recommendedFor: "Restaurantes de lujo, hoteles gourmet, steakhouses premium",
  },
  {
    name: "Lora",
    category: "serif",
    styleType: "Elegante / Bistró",
    description: "Cálida y armónica con curvas suaves inspiradas en la caligrafía.",
    recommendedFor: "Cafés de especialidad, brunches, panaderías artesanales",
  },
  {
    name: "Bodoni Moda",
    category: "serif",
    styleType: "Elegante / Bistró",
    description: "Contraste extremo entre trazos gruesos y finos. Máxima sofisticación.",
    recommendedFor: "Restaurantes de autor y cócteles exclusivos",
  },

  // 2. Modernas & Contemporáneas (Sans-Serif)
  {
    name: "Outfit",
    category: "sans-serif",
    styleType: "Moderna / Nítida",
    description: "Geometría refinada, moderna y con excelente lectura en móviles.",
    recommendedFor: "Conceptos fast-casual gourmet, hamburgueserías de autor",
  },
  {
    name: "Montserrat",
    category: "sans-serif",
    styleType: "Moderna / Nítida",
    description: "Inspirada en cartelería tradicional urbana. Muy popular y enérgica.",
    recommendedFor: "Gastrobares, cervecerías artesanales, pizzerías",
  },
  {
    name: "Poppins",
    category: "sans-serif",
    styleType: "Moderna / Nítida",
    description: "Curvas circulares geométricas amigables y de alta legibilidad.",
    recommendedFor: "Cafeterías juveniles, heladerías, smoothies & bowls",
  },
  {
    name: "Plus Jakarta Sans",
    category: "sans-serif",
    styleType: "Moderna / Nítida",
    description: "Tipografía moderna del sudeste asiático con toque premium internacional.",
    recommendedFor: "Cafés contemporáneos y restaurantes vanguardistas",
  },

  // 3. Artesanales, Dulces & Expresivas (Display / Handwriting)
  {
    name: "DM Serif Display",
    category: "serif",
    styleType: "Artesanal / Expresiva",
    description: "Titulares densos con curvas fluidas y personalidad gastronómica.",
    recommendedFor: "Panaderías rústicas, trattorias italianas, asadores",
  },
  {
    name: "Abril Fatface",
    category: "display",
    styleType: "Artesanal / Expresiva",
    description: "Remates gruesos que captan la atención al instante. Muy dulce.",
    recommendedFor: "Postrerías, heladerías artesanales, confiterías",
  },
  {
    name: "Comfortaa",
    category: "display",
    styleType: "Artesanal / Expresiva",
    description: "Líneas totalmente redondeadas y amigables. Dulzura pura.",
    recommendedFor: "Pastelerías infantiles, donas, repostería creativa",
  },
  {
    name: "Caveat",
    category: "handwriting",
    styleType: "Artesanal / Expresiva",
    description: "Estilo manuscrito informal de pizarra de chef.",
    recommendedFor: "Tableros de ofertas, cocina casera de la abuela, cafés bohemios",
  },
];

export const CURATED_GOOGLE_FONTS_BODY: GoogleFontOption[] = [
  {
    name: "Manrope",
    category: "sans-serif",
    styleType: "Moderna / Nítida",
    description: "Predeterminada del sistema. Geometría contemporánea y ultra legible.",
    recommendedFor: "Textos en pantalla de smartphones a cualquier tamaño",
  },
  {
    name: "Inter",
    category: "sans-serif",
    styleType: "Moderna / Nítida",
    description: "La fuente para interfaces más perfeccionada del mundo.",
    recommendedFor: "Máxima claridad en precios, ingredientes y descripciones",
  },
  {
    name: "Poppins",
    category: "sans-serif",
    styleType: "Moderna / Nítida",
    description: "Amigable y redondeada.",
    recommendedFor: "Marcas frescas, cercanas y juveniles",
  },
  {
    name: "Montserrat",
    category: "sans-serif",
    styleType: "Moderna / Nítida",
    description: "Versátil con presencia visual sólida.",
    recommendedFor: "Lectura rápida en cartas y promociones",
  },
  {
    name: "Lora",
    category: "serif",
    styleType: "Elegante / Bistró",
    description: "Serif cálida optimizada para párrafos y descripciones de platos.",
    recommendedFor: "Cartas gourmet con historia y notas de cata",
  },
];

/**
 * Limpia y normaliza un texto que puede ser el nombre de la fuente,
 * una URL completa de Google Fonts o una etiqueta <link>.
 */
export function parseFontInput(rawInput: string): string {
  if (!rawInput) return "";
  let clean = rawInput.trim();

  // Caso: pegaron <link href="...family=Playfair+Display...">
  if (clean.includes("fonts.googleapis.com")) {
    const familyMatch = clean.match(/family=([^:&]+)/i);
    if (familyMatch && familyMatch[1]) {
      clean = decodeURIComponent(familyMatch[1]).replace(/\+/g, " ");
    }
  }

  // Quitar comillas iniciales o finales
  clean = clean.replace(/['"]/g, "").trim();

  return clean;
}

/**
 * Carga una fuente desde Google Fonts e inyecta la hoja de estilos en el <head>
 */
export function loadGoogleFont(fontName: string, isHeading: boolean = true): void {
  if (typeof window === "undefined" || !document?.head) return;

  const cleanName = parseFontInput(fontName);
  if (!cleanName) return;

  const elementId = isHeading ? "google-font-heading-link" : "google-font-body-link";
  const cssVariable = isHeading ? "--brand-font-heading" : "--brand-font-body";

  // Reemplazar espacios por + para la API de Google Fonts
  const fontParam = encodeURIComponent(cleanName).replace(/%20/g, "+");
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontParam}:wght@400;500;600;700;800&display=swap`;

  let existingLink = document.getElementById(elementId) as HTMLLinkElement | null;
  if (!existingLink) {
    existingLink = document.createElement("link");
    existingLink.id = elementId;
    existingLink.rel = "stylesheet";
    document.head.appendChild(existingLink);
  }

  if (existingLink.href !== fontUrl) {
    existingLink.href = fontUrl;
  }

  // Aplicar variable CSS al elemento raíz
  document.documentElement.style.setProperty(
    cssVariable,
    `'${cleanName}', sans-serif`
  );
}

/**
 * Aplica simultáneamente las fuentes de títulos y de cuerpo
 */
export function applyBrandFonts(fontHeading?: string, fontBody?: string): void {
  if (typeof window === "undefined") return;

  if (fontHeading) {
    loadGoogleFont(fontHeading, true);
  } else {
    // Restaurar por defecto
    document.documentElement.style.setProperty("--brand-font-heading", "'Epilogue', sans-serif");
  }

  if (fontBody) {
    loadGoogleFont(fontBody, false);
  } else {
    // Restaurar por defecto
    document.documentElement.style.setProperty("--brand-font-body", "'Manrope', sans-serif");
  }
}

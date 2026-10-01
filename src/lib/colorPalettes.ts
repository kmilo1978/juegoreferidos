/**
 * CATÁLOGO DE COMBINACIONES Y PALETAS DE COLOR ARMONIOSAS
 * Inspirado en bibliotecas cromáticas de diseño gastronómico, cafeterías y restaurantes.
 */

export interface ColorPalette {
  id: string;
  name: string;
  category: "popular" | "cafe" | "gourmet" | "vino" | "vibrante" | "pastel" | "noche";
  categoryLabel: string;
  colors: [string, string, string, string, string]; // [Acento/Primario, Secundario, Neutro/Texto, Tono Medio, Fondo/Oscuro]
  tags: string[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "oro_imperial_noir",
    name: "Oro Imperial & Noir (Lujo & Alta Cocina)",
    category: "popular",
    categoryLabel: "Lujo & Alta Cocina",
    colors: ["#f2be71", "#ffddb1", "#e6e1e7", "#363439", "#141317"],
    tags: ["oro", "dorado", "negro", "lujo", "repostería", "premium", "elegante"],
  },
  {
    id: "cafe_especialidad_caramelo",
    name: "Café Especialidad & Caramelo",
    category: "cafe",
    categoryLabel: "Cafetería & Bakery",
    colors: ["#c49a6c", "#dfb892", "#f7ede2", "#6f4e37", "#2b1810"],
    tags: ["café", "caramelo", "tostado", "latte", "espresso", "panadería"],
  },
  {
    id: "trattoria_tinto_borgona",
    name: "Trattoria & Tinto Borgoña",
    category: "vino",
    categoryLabel: "Restaurantes & Vino",
    colors: ["#7a1828", "#aa2b3d", "#f5f0eb", "#685044", "#1b0b0e"],
    tags: ["vino", "tinto", "rojo", "trattoria", "pasta", "italiano", "romántico"],
  },
  {
    id: "bistro_olivo_canteen",
    name: "Bistró Olivo & Cafeteria Wood",
    category: "gourmet",
    categoryLabel: "Bistró & Gourmet",
    colors: ["#556b2f", "#8fbc8f", "#f4f1ea", "#8c6239", "#3e2723"],
    tags: ["olivo", "verde", "madera", "canteen", "bistró", "saludable", "artesanal"],
  },
  {
    id: "sentinela_triade_pop",
    name: "Sentinela Triade (Vibrante Pop)",
    category: "vibrante",
    categoryLabel: "Moderno & Vibrante",
    colors: ["#ff007f", "#00d4ff", "#ffdd00", "#9b51e0", "#2c3e50"],
    tags: ["neón", "fucsia", "cyan", "amarillo", "pop", "moderno", "casual"],
  },
  {
    id: "sabrina_terracota",
    name: "Sabrina Terra Cotta & Arcilla",
    category: "popular",
    categoryLabel: "Rústico & Terra",
    colors: ["#c44536", "#ed8975", "#f4ece1", "#8d5b4c", "#3d2621"],
    tags: ["terracota", "arcilla", "cálido", "artesanal", "horno", "mediterráneo"],
  },
  {
    id: "patisserie_macaron_rosa",
    name: "Pâtisserie & Macaron Rosa",
    category: "pastel",
    categoryLabel: "Boutique & Dulce",
    colors: ["#c24d74", "#e88d9f", "#fdf0f4", "#7a3e53", "#2c1520"],
    tags: ["rosa", "fresa", "macaron", "postres", "dulce", "boutique", "francés"],
  },
  {
    id: "home_blue_marino",
    name: "Home Blue & Océano Profundo",
    category: "popular",
    categoryLabel: "Gourmet & Moderno",
    colors: ["#1976d2", "#42a5f5", "#f0f4f8", "#0d47a1", "#051e3e"],
    tags: ["azul", "marino", "mariscos", "océano", "fresco", "pescados"],
  },
  {
    id: "matcha_ceremonial_menta",
    name: "Matcha Ceremonial & Menta",
    category: "cafe",
    categoryLabel: "Cafetería & Bakery",
    colors: ["#5e8a5b", "#98d8aa", "#f5f7f2", "#3a5338", "#172216"],
    tags: ["matcha", "verde", "té", "menta", "brunch", "orgánico", "zen"],
  },
  {
    id: "sunset_aperitivo_spritz",
    name: "Sunset Spritz & Melocotón",
    category: "vino",
    categoryLabel: "Restaurantes & Vino",
    colors: ["#e05638", "#f39c6b", "#fdf4ee", "#733324", "#2d120a"],
    tags: ["naranja", "spritz", "aperitivo", "atardecer", "rooftop", "tapas"],
  },
  {
    id: "dark_velvet_ciruela",
    name: "Dark Velvet & Ciruela Real",
    category: "noche",
    categoryLabel: "Cócteles & Noche",
    colors: ["#8e24aa", "#ba68c8", "#f3e5f5", "#4a148c", "#1a0033"],
    tags: ["púrpura", "morado", "velvet", "noche", "lounge", "místico"],
  },
  {
    id: "mostaza_dijon_burger",
    name: "Mostaza Dijon & Smash Burger",
    category: "vibrante",
    categoryLabel: "Moderno & Vibrante",
    colors: ["#f59e0b", "#fbbf24", "#faf5ea", "#78350f", "#1f2937"],
    tags: ["mostaza", "amarillo", "burger", "hamburguesa", "dinámico", "fast"],
  },
  {
    id: "vainilla_francesa_lino",
    name: "Vainilla Francesa & Lino",
    category: "pastel",
    categoryLabel: "Boutique & Dulce",
    colors: ["#d4a373", "#e9c46a", "#fefae0", "#a98467", "#332211"],
    tags: ["vainilla", "lino", "crema", "panadería", "croissant", "suave"],
  },
  {
    id: "sentinela_mono_olivo",
    name: "Sentinela Mono & Oro Nórdico",
    category: "popular",
    categoryLabel: "Lujo & Alta Cocina",
    colors: ["#eab308", "#facc15", "#fef9c3", "#713f12", "#2e2f23"],
    tags: ["oro", "amarillo", "nórdico", "minimalista", "alta cocina"],
  },
  {
    id: "midnight_neon_cocktail",
    name: "Midnight Neon Cocktail",
    category: "noche",
    categoryLabel: "Cócteles & Noche",
    colors: ["#00e5ff", "#ff007f", "#ffe600", "#180033", "#080014"],
    tags: ["neón", "cyan", "magenta", "cóctel", "bar", "fiesta", "nocturno"],
  },
  {
    id: "tierra_toscana_horno",
    name: "Tierra Toscana & Ladrillo Horno",
    category: "vino",
    categoryLabel: "Restaurantes & Vino",
    colors: ["#9a3412", "#c2410c", "#fff7ed", "#431407", "#1c0b05"],
    tags: ["leña", "pizza", "ladrillo", "rústico", "toscana", "tradición"],
  },
  {
    id: "cacao_avellana_chocolat",
    name: "Cacao 85% & Avellana Tostada",
    category: "cafe",
    categoryLabel: "Cafetería & Bakery",
    colors: ["#4a2c11", "#804e25", "#ede0d4", "#2c1808", "#120802"],
    tags: ["cacao", "chocolate", "avellana", "trufas", "profundo", "bombón"],
  },
  {
    id: "pistacho_bronte_gelato",
    name: "Pistacho Bronte & Gelato",
    category: "pastel",
    categoryLabel: "Boutique & Dulce",
    colors: ["#87986a", "#b5c99a", "#f3f5ee", "#5b6b44", "#222a18"],
    tags: ["pistacho", "gelato", "heladería", "tarta vasca", "cremoso"],
  },
];

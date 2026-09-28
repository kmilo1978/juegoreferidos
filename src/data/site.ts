export const site = {
  name: "Bliss Soul Bakery & Café",
  tagline: "Sabores que comienzan en los sentidos y permanecen en el alma.",
  taglineEn: "Flavors that begin in the senses and linger in the soul.",
  whatsapp: "573022777295",
  instagram: "https://www.instagram.com/blisssoulbakery/?hl=es-la",
  mapsReviewUrl: "https://g.page/r/CfPSfNSGX8u1EBM/review",
  googleSheetWebhookUrl: "", // Pega aquí tu URL de Google Apps Script cuando la despliegues
};

export function waLink(message: string, phone: string = site.whatsapp) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function waShareLink(message: string) {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

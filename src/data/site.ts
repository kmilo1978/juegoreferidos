import { clientConfig } from "@/config/clientConfig";

export const site = {
  name: clientConfig.brand.name,
  tagline: clientConfig.brand.tagline,
  taglineEn: clientConfig.brand.taglineEn,
  whatsapp: clientConfig.channels.whatsappNumber,
  instagram: clientConfig.channels.instagramProfileUrl,
  mapsReviewUrl: clientConfig.channels.googleMapsReviewUrl,
  googleSheetWebhookUrl: clientConfig.composio.endpoints?.googleSheetWebhookUrl || "",
};

export function waLink(message: string, phone: string = site.whatsapp) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function waShareLink(message: string) {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

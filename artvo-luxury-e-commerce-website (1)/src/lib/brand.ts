/** Central ARTÉVO brand identity — extracted from official logo SVG */
export const COLORS = {
  primary: "#A85C43",
  primaryDark: "#874632",
  primaryLight: "#C97A5E",
  dark: "#0A0A0A",
  darkMid: "#161616",
  light: "#FAFAFA",
  ivory: "#FAF7F2",
  stone: "#B7AEA2",
  gold: "#B5965A",
  goldLight: "#D4BA82",
} as const;

export const BRAND = {
  name: "ARTÉVO",
  tagline: "Art. Evolved.",
  legalName: "ARTÉVO Nigeria Limited",
  foundedYear: 2026,
  city: "Ibadan",
  state: "Oyo State",
  country: "Nigeria",
  locationLabel: "Ibadan, Nigeria",
  addressLine: "Ibadan, Oyo State, Nigeria",
  studioLabel: "Ibadan Studio",
  studioDetail: "Ibadan Arts District, Oyo State",
  email: "mobolajiolakunle8@gmail.com",
  phoneDisplay: "0903 019 2034",
  phoneTel: "+2349030192034",
  whatsappNumber: "2349030192034",
  whatsappDisplay: "0903 019 2034",
  whatsappDefaultMessage: "Hello ARTÉVO Concierge, I would like to enquire about a piece / commission from Ibadan.",
  currency: "NGN",
  currencySymbol: "₦",
  colors: COLORS,
  siteUrl: "https://artevo-art.com",
} as const;

export function whatsappHref(message?: string) {
  const text = encodeURIComponent(message || BRAND.whatsappDefaultMessage);
  return `https://wa.me/${BRAND.whatsappNumber}?text=${text}`;
}

// WhatsApp deep-link helper (no real API — opens wa.me)
export function whatsappLink(phone: string, message: string): string {
  const p = phone.replace(/[^0-9]/g, "");
  // assume India +91 if 10 digits
  const intl = p.length === 10 ? "91" + p : p;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

export function sendWhatsApp(phone: string, message: string) {
  if (typeof window === "undefined") return;
  window.open(whatsappLink(phone, message), "_blank", "noopener,noreferrer");
}

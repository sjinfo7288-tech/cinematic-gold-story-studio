import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  mobile: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{10,15}$/, "Please enter a valid mobile number"),
  service: z.string().trim().min(1, "Please select a service").max(100),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose the event date"),
  location: z.string().trim().min(2, "Please enter the event location").max(150, "Location is too long"),
  message: z.string().trim().min(2, "Please write a short message").max(1000, "Message is too long"),
});

export type Inquiry = z.infer<typeof inquirySchema>;

/** Indian 10-digit numbers get the 91 country code; anything else keeps its digits. */
export function normalizeWhatsAppNumber(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

function formatEventDate(iso: string) {
  const [y = 1970, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildInquiryMessage(i: Inquiry) {
  return [
    "*New Photoshoot Inquiry — SJ Photography and Cinematic*",
    "",
    `*Customer Name:* ${i.name}`,
    `*Mobile Number:* ${i.mobile}`,
    `*Service:* ${i.service}`,
    `*Event Date:* ${formatEventDate(i.eventDate)}`,
    `*Event Location:* ${i.location}`,
    "",
    `*Message:* ${i.message}`,
  ].join("\n");
}

export function whatsappUrl(number: string, text?: string) {
  const n = normalizeWhatsAppNumber(number);
  return text ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : `https://wa.me/${n}`;
}

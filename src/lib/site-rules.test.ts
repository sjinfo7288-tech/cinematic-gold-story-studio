import { describe, expect, it } from "vitest";
import { buildInquiryMessage, inquirySchema, normalizeWhatsAppNumber, whatsappUrl } from "./inquiry";
import { isOfferActive } from "./site";

const valid = {
  name: "Priya Sharma",
  mobile: "9876543210",
  service: "Maternity Photography",
  eventDate: "2026-12-20",
  location: "Pune",
  message: "Outdoor maternity shoot please",
};

describe("inquiry form rules", () => {
  it("sends inquiries to the owner's WhatsApp 9767793006 with the India code", () => {
    expect(normalizeWhatsAppNumber("9767793006")).toBe("919767793006");
    expect(whatsappUrl("9767793006")).toBe("https://wa.me/919767793006");
  });

  it("requires every field", () => {
    for (const key of Object.keys(valid) as (keyof typeof valid)[]) {
      expect(inquirySchema.safeParse({ ...valid, [key]: "" }).success).toBe(false);
    }
    expect(inquirySchema.safeParse(valid).success).toBe(true);
  });

  it("puts name, mobile, service, date, location and message in the WhatsApp text", () => {
    const msg = buildInquiryMessage(valid);
    expect(msg).toContain("Priya Sharma");
    expect(msg).toContain("9876543210");
    expect(msg).toContain("Maternity Photography");
    expect(msg).toContain("20 December 2026");
    expect(msg).toContain("Pune");
    expect(msg).toContain("Outdoor maternity shoot please");
  });
});

describe("offer visibility", () => {
  it("shows an offer through its validity date and hides it after", () => {
    expect(isOfferActive({ valid_until: "2026-11-08" }, "2026-11-08")).toBe(true);
    expect(isOfferActive({ valid_until: "2026-11-07" }, "2026-11-08")).toBe(false);
    expect(isOfferActive({ valid_until: null }, "2026-11-08")).toBe(true);
  });
});

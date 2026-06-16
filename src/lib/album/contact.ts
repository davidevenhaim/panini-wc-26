import type { ContactMethod } from "@/types/profile.types";

export function contactHref(method: ContactMethod | null, value: string | null): string | null {
  if (!method || !value || method === "none") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  switch (method) {
    case "whatsapp": {
      const digits = trimmed.replace(/\D+/g, "");
      return digits ? `https://wa.me/${digits}` : null;
    }
    case "telegram": {
      const handle = trimmed.replace(/^@/, "");
      return `https://t.me/${handle}`;
    }
    case "email":
      return `mailto:${trimmed}`;
    case "phone": {
      const digits = trimmed.replace(/(?!^\+)\D+/g, "");
      return digits ? `tel:${digits}` : null;
    }
    case "instagram": {
      const handle = trimmed.replace(/^@/, "");
      return `https://instagram.com/${handle}`;
    }
    default:
      return null;
  }
}

export function contactIcon(method: ContactMethod | null): string {
  switch (method) {
    case "whatsapp":
      return "lucide:message-circle";
    case "telegram":
      return "lucide:send";
    case "email":
      return "lucide:mail";
    case "phone":
      return "lucide:phone";
    case "instagram":
      return "lucide:instagram";
    default:
      return "lucide:user";
  }
}

export function contactLabel(method: ContactMethod | null): string {
  switch (method) {
    case "whatsapp":
      return "WhatsApp";
    case "telegram":
      return "Telegram";
    case "email":
      return "Email";
    case "phone":
      return "Phone";
    case "instagram":
      return "Instagram";
    default:
      return "";
  }
}

import type { ContactMethod } from "@/types/profile.types";

/**
 * Returns a tel:/mailto:/https URL with optional prefilled message text.
 * Supported prefill: whatsapp (?text), email (?subject&body), sms (?body).
 * Telegram and Instagram do not support direct-chat prefill — the user must paste.
 */
export function contactHrefWithText(
  method: ContactMethod | null,
  value: string | null,
  text: string,
  subject?: string
): string | null {
  if (!method || !value || method === "none") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const encoded = encodeURIComponent(text);
  switch (method) {
    case "whatsapp": {
      const digits = trimmed.replace(/\D+/g, "");
      return digits ? `https://wa.me/${digits}?text=${encoded}` : null;
    }
    case "telegram": {
      // No direct-DM prefill — open the chat.
      const handle = trimmed.replace(/^@/, "");
      return `https://t.me/${handle}`;
    }
    case "email": {
      const sub = encodeURIComponent(subject ?? "Panini WC 2026 swap");
      return `mailto:${trimmed}?subject=${sub}&body=${encoded}`;
    }
    case "phone": {
      const digits = trimmed.replace(/(?!^\+)\D+/g, "");
      return digits ? `sms:${digits}?body=${encoded}` : null;
    }
    case "instagram": {
      const handle = trimmed.replace(/^@/, "");
      return `https://instagram.com/${handle}`;
    }
    default:
      return null;
  }
}

/** Methods that support prefilling a message via the deep-link URL. */
export function supportsPrefill(method: ContactMethod | null): boolean {
  return method === "whatsapp" || method === "email" || method === "phone";
}

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

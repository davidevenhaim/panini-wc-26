export type ContactMethod = "whatsapp" | "telegram" | "email" | "phone" | "instagram" | "none";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  contact_method: ContactMethod | null;
  contact_value: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileUpsert = {
  username: string;
  display_name?: string | null;
  bio?: string | null;
  contact_method?: ContactMethod | null;
  contact_value?: string | null;
};

export const CONTACT_METHODS: ContactMethod[] = [
  "whatsapp",
  "telegram",
  "email",
  "phone",
  "instagram",
  "none",
];

export const USERNAME_REGEX = /^[a-z0-9_-]{3,20}$/;

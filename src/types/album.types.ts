export type StickerCategory = "TEAM" | "FWC" | "BONUS" | "LOGO";

export type Sticker = {
  /** Unique id — same as code for now */
  id: string;
  /** Display code: MEX1, FWC8, BNS3, LOGO */
  code: string;
  /** Number within its team/section */
  number: number;
  /** Optional player or sticker name */
  name?: string;
  category: StickerCategory;
};

export type Team = {
  code: string;
  name: string;
  flag: string;
  group: string;
  /** Order in the album (1-based) */
  albumOrder: number;
  primaryColor: string;
  accentColor: string;
  stickers: Sticker[];
};

export type SpecialSection = {
  id: string;
  /** Translation key suffix in `album.sections` */
  i18nKey: string;
  stickers: Sticker[];
  /** Whether stickers count toward the 980 main-album total */
  countsTowardAlbum: boolean;
};

/** Persisted state structure */
export type PersistedCollection = {
  version: number;
  updatedAt: string;
  quantities: Record<string, number>;
};

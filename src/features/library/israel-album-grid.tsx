"use client";

import * as React from "react";
import type { Album } from "@/collections/schema";
import { AlbumCard } from "./album-card";

type Props = {
  albums: Album[];
  /** When true, ascending by year. Default is descending (newest first). */
  chronological?: boolean;
};

export function IsraelAlbumGrid({ albums, chronological = false }: Props) {
  const sorted = React.useMemo(() => {
    const list = [...albums];
    list.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
    return chronological ? list : list.reverse();
  }, [albums, chronological]);

  if (sorted.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((a) => (
        <AlbumCard key={a.id} album={a} />
      ))}
    </div>
  );
}

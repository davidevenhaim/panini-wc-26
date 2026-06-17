import type { Album } from "@/collections/schema";
import type { Quantities } from "./collection";
import { albumProgressForQuantities } from "./album-progress";

export type LibraryProgressStats = {
  /** Albums with a verified checklist (trackable). */
  totalTrackable: number;
  /** Albums where the user owns at least one item. */
  started: number;
  /** Started albums that are not yet 100% complete. */
  inProgress: number;
  /** Albums at 100% completion. */
  completed: number;
  /** Share of trackable albums that are fully complete. */
  completedPercent: number;
};

export function computeLibraryProgress(
  albums: Album[],
  getAlbumQuantities: (albumId: string) => Quantities
): LibraryProgressStats {
  const trackable = albums.filter((a) => a.dataStatus !== "metadata-only");

  let started = 0;
  let inProgress = 0;
  let completed = 0;

  for (const album of trackable) {
    const quantities = getAlbumQuantities(album.id);
    const progress = albumProgressForQuantities(album, quantities);
    if (progress.unique === 0) continue;
    started += 1;
    if (progress.total > 0 && progress.unique >= progress.total) {
      completed += 1;
    } else {
      inProgress += 1;
    }
  }

  const totalTrackable = trackable.length;
  const completedPercent =
    totalTrackable === 0 ? 0 : Math.round((completed / totalTrackable) * 100);

  return { totalTrackable, started, inProgress, completed, completedPercent };
}

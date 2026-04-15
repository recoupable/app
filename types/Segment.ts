import { Tables } from "@/types/database.types";

type Social = Tables<"socials">;

/**
 * Aggregated segment shape consumed by segment list UI
 * (`SegmentsWrapper`, `FanGroupNavItem`, `MiniMenu`, `Segments`, `SegmentButton`).
 *
 * `fans` is optional because the dedicated `GET /api/artists/{id}/segments`
 * endpoint does not return a fan roster; components that render avatars
 * fall back to an empty array.
 */
export interface Segment {
  id: string;
  name: string;
  size: number;
  icon?: string;
  fans?: Social[];
}

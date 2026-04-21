import type { Account } from "@/types/Account";

export interface Song {
  isrc: string;
  name: string | null;
  album: string | null;
  notes: string | null;
  updated_at: string;
}

export type SongByIsrc = Song & {
  artists: Array<Pick<Account, "id" | "name" | "timestamp">>;
};

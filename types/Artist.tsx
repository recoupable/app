import { SOCIAL } from "./Agent";
import { FAN_TYPE } from "./fans";
import type { Knowledge } from "./knowledge";

export type Artist = {
  name: string;
  uri: string;
  image: string;
  popularity: number;
};

export type ArtistRecord = {
  account_id: string;
  name: string | null;
  image?: string | null;
  account_socials?: Array<SOCIAL>;
  isWorkspace?: boolean;  // true if workspace, false/undefined if artist
  created_at?: string;
  id?: string;
  instruction?: string | null;
  knowledges?: Knowledge[] | null;
  label?: string | null;
  organization?: string | null;
  pinned?: boolean;
  updated_at?: string;
  isWrapped?: boolean;
};

export type CampaignRecord = {
  id: string;
  timestamp: number;
  artistId: string;
  clientId: string;
  fans: FAN_TYPE[];
};

import type { Tables } from "./database.types";

export type FUNNEL_ANALYSIS = {
  id: string;
  chat_id: string;
  timestamp: string;
  status: number;
  handle: string;
  type: string;
  funnel_analytics_segments: Array<SEGMENT>;
  funnel_analytics_accounts: Array<ANALYTICS_ACCOUNT>;
  funnel_analytics_comments: Array<COMMENT>;
  accounts: {
    id: string;
    name: string;
    account_info: Array<Tables<"account_info">>;
    account_socials: Array<SOCIAL>;
  };
};

export type SEGMENT = {
  id: string;
  icon: string;
  name: string;
  size: number;
  created_at: string;
  analysis_id: string;
};

export type COMMENT = {
  username: string;
  post_url: string;
  type: string;
  comment: string;
};

export type ACCOUNT = {
  id: string;
  name: string;
  timestamp: number | null;
  account_info: Array<Tables<"account_info">>;
  account_socials: Array<SOCIAL>;
};

export type ANALYTICS_ACCOUNT = {
  account_id: string;
  analysis_id: string;
  accounts: ACCOUNT;
};

export type SOCIAL = {
  id: string;
  link: string;
  type: string;
  artistId: string;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  avatar: string | null;
  username: string | null;
  region: string | null;
};

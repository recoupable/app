import supabase from "../serverClient";
import type { Tables } from "@/types/database.types";

export type AccountSocialWithSocial = Tables<"account_socials"> & {
  social: Tables<"socials">;
};

interface Params {
  accountId?: string;
  socialId?: string | string[];
}

const getAccountSocials = async ({
  accountId,
  socialId,
}: Params): Promise<AccountSocialWithSocial[]> => {
  let query = supabase.from("account_socials").select("*, social:socials(*)");

  if (accountId) {
    query = query.eq("account_id", accountId);
  }

  if (Array.isArray(socialId)) {
    if (socialId.length > 0) {
      query = query.in("social_id", socialId);
    }
  } else if (socialId) {
    query = query.eq("social_id", socialId);
  }

  const { data } = await query;
  return (data as AccountSocialWithSocial[]) || [];
};

export default getAccountSocials;

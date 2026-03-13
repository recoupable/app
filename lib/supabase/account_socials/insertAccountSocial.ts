import supabase from "../serverClient";

const insertAccountSocial = async (accountId: string, socialId: string): Promise<void> => {
  await supabase.from("account_socials").insert({
    account_id: accountId,
    social_id: socialId,
  });
};

export default insertAccountSocial;

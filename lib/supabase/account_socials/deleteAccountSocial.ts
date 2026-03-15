import supabase from "../serverClient";

const deleteAccountSocial = async (accountId: string, socialId: string): Promise<void> => {
  await supabase
    .from("account_socials")
    .delete()
    .eq("account_id", accountId)
    .eq("social_id", socialId);
};

export default deleteAccountSocial;

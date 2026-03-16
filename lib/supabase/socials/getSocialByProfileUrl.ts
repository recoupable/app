import supabase from "../serverClient";
import type { Tables } from "@/types/database.types";

const getSocialByProfileUrl = async (profileUrl: string): Promise<Tables<"socials"> | null> => {
  const { data } = await supabase
    .from("socials")
    .select("*")
    .eq("profile_url", profileUrl)
    .neq("profile_url", "")
    .single();
  return data || null;
};

export default getSocialByProfileUrl;

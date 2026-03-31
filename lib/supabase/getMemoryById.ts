import supabase from "./serverClient";
import { Tables } from "../../types/database.types";

export async function getMemoryById({
  id,
}: {
  id: string;
}): Promise<Tables<"memories"> | null> {
  try {
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Failed to get memory by id:", error.message);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to get memory by id from database");
    throw error;
  }
}

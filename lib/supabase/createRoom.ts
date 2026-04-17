import { PostgrestError } from "@supabase/supabase-js";
import supabase from "./serverClient";
import { Database } from "@/types/database.types";

type Room = Database["public"]["Tables"]["rooms"]["Row"];

interface CreateRoomParams {
  account_id: string;
  topic: string;
  artist_id?: string;
  chat_id?: string;
}

export const createRoom = async ({
  account_id,
  topic,
  artist_id,
  chat_id,
}: CreateRoomParams): Promise<{
  new_room: Room & { memories: [] };
  error: PostgrestError | null;
}> => {
  try {
    const roomData = {
      account_id,
      topic,
      artist_id,
      ...(chat_id ? { id: chat_id } : {}),
    };

    const { data: new_room, error } = await supabase
      .from("rooms")
      .insert(roomData)
      .select("*")
      .single();

    if (error) throw error;

    return {
      new_room: {
        ...new_room,
        memories: [],
      },
      error: null,
    };
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

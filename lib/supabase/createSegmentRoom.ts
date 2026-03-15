import supabase from "./serverClient";

interface CreateSegmentRoomParams {
  segment_id: string;
  room_id: string;
}

export const createSegmentRoom = async ({ segment_id, room_id }: CreateSegmentRoomParams) => {
  const { data, error } = await supabase
    .from("segment_rooms")
    .insert({
      segment_id,
      room_id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating segment room:", error);
    throw error;
  }

  return data;
};

import supabase from "./serverClient";

/**
 * Fetches report data for a specific room
 *
 * @param roomId - The ID of the room to fetch reports for
 * @returns The report data if found, null otherwise
 */
export const getRoomReports = async (roomId: string) => {
  try {
    const { data, error } = await supabase
      .from("room_reports")
      .select("report_id")
      .eq("room_id", roomId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching room reports:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching room reports:", error);
    return null;
  }
};

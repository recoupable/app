import { getSegmentRoom } from "@/lib/supabase/getSegmentRoom";
import { getSegmentWithArtist } from "@/lib/supabase/getSegmentWithArtist";
import { createRoomWithReport } from "@/lib/supabase/createRoomWithReport";
import { createSegmentRoom } from "@/lib/supabase/createSegmentRoom";
import createReport from "@/lib/report/createReport";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    segmentId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { segmentId } = await params;
  const segmentRoom = await getSegmentRoom(segmentId);

  if (segmentRoom?.room_id) {
    redirect(`/chat/${segmentRoom.room_id}`);
  }

  let newRoomId: string | null = null;

  try {
    const {
      segment,
      artistAccountId,
      error: segmentError,
    } = await getSegmentWithArtist(segmentId);

    if (segmentError || !segment) {
      throw new Error(segmentError?.message || "Failed to fetch segment");
    }

    if (!artistAccountId) {
      throw new Error("Artist account not found for segment");
    }

    const reportId = await createReport(segment.id);
    if (!reportId) {
      throw new Error("Failed to generate segment report");
    }

    const { new_room, error: roomError } = await createRoomWithReport({
      account_id: artistAccountId,
      topic: `Segment: ${segment.name}`,
      report_id: reportId,
      artist_id: artistAccountId,
    });

    if (roomError || !new_room) {
      throw new Error(roomError?.message || "Failed to create room");
    }

    newRoomId = new_room.id;

    await createSegmentRoom({
      segment_id: segmentId,
      room_id: new_room.id,
    });
  } catch (e) {
    console.error("Error in segment page:", e);
    throw e;
  }

  if (newRoomId) {
    redirect(`/chat/${newRoomId}`);
  }

  throw new Error("Failed to create or find room");
}

import { getRoomReports } from "@/lib/supabase/getRoomReports";
import { Chat } from "@/components/VercelChat/chat";

interface PageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function InstantChatRoom({ params }: PageProps) {
  const { roomId } = await params;
  const reports = await getRoomReports(roomId);

  return (
    <div className="flex flex-col size-full items-center">
      <Chat id={roomId} reportId={reports?.report_id} />
    </div>
  );
}

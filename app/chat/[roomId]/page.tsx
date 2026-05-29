import { Chat } from "@/components/VercelChat/chat";
import { getSessionIdByChatId } from "@/lib/supabase/chats/getSessionIdByChatId";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function InstantChatRoom({ params }: PageProps) {
  const { roomId } = await params;
  const sessionId = await getSessionIdByChatId(roomId);

  return (
    <div className="flex flex-col size-full items-center">
      <Chat id={roomId} sessionId={sessionId ?? undefined} />
    </div>
  );
}

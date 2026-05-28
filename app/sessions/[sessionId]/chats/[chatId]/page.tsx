import { Chat } from "@/components/VercelChat/chat";

interface SessionChatPageProps {
  params: Promise<{ sessionId: string; chatId: string }>;
}

export default async function SessionChatPage({
  params,
}: SessionChatPageProps) {
  const { sessionId, chatId } = await params;

  return (
    <div className="flex flex-col size-full items-center">
      <Chat id={chatId} sessionId={sessionId} />
    </div>
  );
}

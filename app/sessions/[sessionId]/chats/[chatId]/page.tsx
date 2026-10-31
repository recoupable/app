import { Chat } from "@/components/VercelChat/chat";
import { isChatIntelligentUIEnabled } from "@/lib/intelligent-ui/chat/isChatIntelligentUIEnabled";

interface SessionChatPageProps {
  params: Promise<{ sessionId: string; chatId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SessionChatPage({
  params,
  searchParams,
}: SessionChatPageProps) {
  const { sessionId, chatId } = await params;
  const query = isChatIntelligentUIEnabled() ? await searchParams : undefined;

  return (
    <div className="flex flex-col size-full items-center">
      <Chat
        id={chatId}
        sessionId={sessionId}
        catalogId={query?.catalogId}
        catalogQuery={
          query?.catalogId !== undefined
            ? {
                since: query.since,
                days: query.days,
                page: query.page,
                limit: query.limit,
              }
            : undefined
        }
      />
    </div>
  );
}

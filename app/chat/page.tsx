import NewChatBootstrap from "@/components/VercelChat/NewChatBootstrap";
import { getMessages } from "@/lib/messages/getMessages";

export const dynamic = "force-dynamic";

interface ChatPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const initialMessage = (await searchParams)?.q as string;
  const initialMessages = getMessages(initialMessage);

  return (
    <div className="flex flex-col size-full items-center">
      <NewChatBootstrap initialMessages={initialMessages} />
    </div>
  );
}

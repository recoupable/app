import { Chat } from "@/components/VercelChat/chat";
import generateUUID from "@/lib/generateUUID";
import { getMessages } from "@/lib/messages/getMessages";

export const dynamic = "force-dynamic";

interface ChatPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const id = generateUUID();
  const params = await searchParams;
  const initialMessage = params?.q as string;
  const initialMessages = getMessages(initialMessage);
  const email = params?.email as string | undefined;

  return (
    <div className="flex flex-col size-full items-center">
      <Chat id={id} initialMessages={initialMessages} email={email} />
    </div>
  );
}

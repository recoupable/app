import { Chat } from "@/components/VercelChat/chat";

interface PageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function InstantChatRoom({ params }: PageProps) {
  const { roomId } = await params;

  return (
    <div className="flex flex-col size-full items-center">
      <Chat id={roomId} />
    </div>
  );
}

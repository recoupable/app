import HomePage from "@/components/Home/HomePage";
import generateUUID from "@/lib/generateUUID";
import { getMessages } from "@/lib/messages/getMessages";

export const dynamic = "force-dynamic";

interface ChatPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: ChatPageProps) {
  const id = generateUUID();
  const params = await searchParams;
  const initialMessage = Array.isArray(params?.q) ? params.q[0] : params?.q;
  const initialMessages = getMessages(initialMessage);
  return <HomePage id={id} initialMessages={initialMessages} />;
}

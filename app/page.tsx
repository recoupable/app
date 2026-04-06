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
  const initialMessage = params?.q as string;
  const initialMessages = getMessages(initialMessage);
  const email = params?.email as string | undefined;

  return <HomePage id={id} initialMessages={initialMessages} email={email} />;
}

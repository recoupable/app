import HomePage from "@/components/Home/HomePage";
import { getMessages } from "@/lib/messages/getMessages";

export const dynamic = "force-dynamic";

interface ChatPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: ChatPageProps) {
  const initialMessage = (await searchParams)?.q as string;
  const initialMessages = getMessages(initialMessage);

  return <HomePage initialMessages={initialMessages} />;
}

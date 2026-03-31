import { NEW_API_BASE_URL } from "@/lib/consts";

const getChatMessages = async (
  chatId: string,
  accessToken: string,
  baseUrl?: string,
) => {
  try {
    const url = baseUrl || NEW_API_BASE_URL;
    const response = await fetch(
      `${url}/api/chats/${encodeURIComponent(chatId)}/messages`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const data = await response.json();

    const memories = data?.data || [];

    return memories.map(
      (memory: {
        id: string;
        content: { role: string; content: string };
        updated_at: string;
      }) => ({
        id: memory.id,
        ...memory.content,
      }),
    );
  } catch {
    // Error handling - could be logged to proper error tracking service
    return [];
  }
};

export default getChatMessages;

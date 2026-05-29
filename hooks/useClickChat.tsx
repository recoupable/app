import { useRouter } from "next/navigation";
import type { Conversation } from "@/types/Chat";
import useIsMobile from "./useIsMobile";

const useClickChat = () => {
  const { push } = useRouter();
  const isMobile = useIsMobile();

  const handleClick = (conversation: Conversation, toggleModal: () => void) => {
    if (isMobile) toggleModal();
    push(`/sessions/${conversation.sessionId}/chats/${conversation.id}`);
  };

  return {
    handleClick,
  };
};

export default useClickChat;

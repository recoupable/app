import { UIMessage } from "ai";

const filterMessageContentForMemories = (message: UIMessage) => {
  return {
    role: message.role,
    parts: message.parts,
    content: message.parts.filter(part => part.type === "text").join(""),
  };
};

export default filterMessageContentForMemories;

import { FileUIPart } from "ai";

const createMessageFileAttachment = (file: { url: string; type: string }): FileUIPart | null => {
  if (file.type === "application/pdf") {
    return {
      type: "file" as const,
      url: file.url,
      mediaType: file.type,
    };
  }

  if (file.type.startsWith("image")) {
    return {
      type: "file" as const,
      url: file.url,
      mediaType: file.type,
    };
  }

  return null;
};

export default createMessageFileAttachment;

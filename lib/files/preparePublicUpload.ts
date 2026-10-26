import { CHAT_INPUT_SUPPORTED_FILE } from "@/lib/chat/config";
import { getFileExtension } from "./getFileExtension";

export const MAX_PUBLIC_UPLOAD_BYTES = 4 * 1024 * 1024;

const supported = {
  ...CHAT_INPUT_SUPPORTED_FILE,
  "text/plain": [".txt", ".log"],
  "application/json": [".json"],
};

/** Only these existing public-media flows use this limit, not private Files. */
export function preparePublicUpload(file: File): File {
  if (!file.size)
    throw new Error("This file is empty. Choose a non-empty file.");
  if (file.size > MAX_PUBLIC_UPLOAD_BYTES) {
    throw new Error(
      "This file is too large. Choose a file of 4 MiB or smaller.",
    );
  }
  const extension = getFileExtension(file.name).toLowerCase();
  const mime =
    !file.type || file.type === "application/octet-stream"
      ? Object.entries(supported).find(([, extensions]) =>
          extensions.includes(extension),
        )?.[0]
      : file.type;
  if (!mime || !(mime in supported)) {
    throw new Error(
      "This file type is not supported. Choose an image, PDF, text, JSON, or supported audio file.",
    );
  }
  return mime === file.type
    ? file
    : new File([file], file.name, { type: mime });
}

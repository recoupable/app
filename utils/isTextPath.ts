import { TEXT_EXTENSIONS } from "@/lib/consts/fileExtensions";

export const isTextPath = (value: string): boolean => {
  const lower = value.toLowerCase().split("?")[0];
  return TEXT_EXTENSIONS.some(ext => lower.endsWith(ext));
};

export default isTextPath;

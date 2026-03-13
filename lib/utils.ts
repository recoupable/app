import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 *
 * @param {...any} inputs
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

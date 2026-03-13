import TelegramBot from "node-telegram-bot-api";
import telegramClient from "./client";
import { trimMessage } from "./trimMessage";

export const sendMessage = async (
  text: string,
  options?: TelegramBot.SendMessageOptions,
): Promise<TelegramBot.Message> => {
  if (!process.env.TELEGRAM_CHAT_ID) {
    throw new Error("TELEGRAM_CHAT_ID environment variable is required");
  }

  const trimmedText = trimMessage(text);

  return telegramClient.sendMessage(process.env.TELEGRAM_CHAT_ID, trimmedText, options);
};

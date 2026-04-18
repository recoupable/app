import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = ["en", "es"];

export default getRequestConfig(async (params) => {
  const requested = await params.requestLocale;
  const locale = SUPPORTED_LOCALES.includes(requested ?? "") 
    ? requested! 
    : "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
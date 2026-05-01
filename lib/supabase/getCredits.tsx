import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

const getCredits = async (accountId: string) => {
  try {
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/credits/get?accountId=${encodeURIComponent(accountId)}`,
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getCredits;

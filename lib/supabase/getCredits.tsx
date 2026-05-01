import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

const getCredits = async (accessToken: string) => {
  try {
    const response = await fetch(`${getClientApiBaseUrl()}/api/credits`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getCredits;

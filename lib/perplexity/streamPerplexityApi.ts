import { PerplexityMessage } from "./types";
import { getPerplexityApiKey, getPerplexityHeaders, PERPLEXITY_BASE_URL } from "./config";

const streamPerplexityApi = async (
  messages: PerplexityMessage[],
  model: string = "sonar-pro",
): Promise<Response> => {
  const apiKey = getPerplexityApiKey();
  const url = `${PERPLEXITY_BASE_URL}/chat/completions`;

  const body = {
    model,
    messages,
    stream: true,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getPerplexityHeaders(apiKey),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Perplexity API error: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    return response;
  } catch (error) {
    throw new Error(`Network error while calling Perplexity API: ${error}`);
  }
};

export default streamPerplexityApi;

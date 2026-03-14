// See: https://docs.perplexity.ai/api-reference/chat-completions
import { getPerplexityApiKey, getPerplexityHeaders, PERPLEXITY_BASE_URL } from "./config";

const fetchPerplexityApi = async (
  messages: Array<{ role: string; content: string }>,
  model: string = "sonar-pro",
): Promise<Response> => {
  const apiKey = getPerplexityApiKey();
  const url = `${PERPLEXITY_BASE_URL}/chat/completions`;

  const body = {
    model,
    messages,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getPerplexityHeaders(apiKey),
      body: JSON.stringify(body),
    });
    return response;
  } catch (error) {
    throw new Error(`Network error while calling Perplexity API: ${error}`);
  }
};

export default fetchPerplexityApi;

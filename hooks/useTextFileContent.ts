import { useEffect, useState } from "react";

export type TextFileState = {
  content: string;
  loading: boolean;
  error: string | null;
};

export const useTextFileContent = (url: string | null | undefined): TextFileState => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setContent("");
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch file");
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setContent(text);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Error loading file");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { content, loading, error };
};

export default useTextFileContent;



"use client";

import { useState } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SocialFixFormProps {
  placeholder: string;
  isSubmitting: boolean;
  onSubmit: (url: string) => Promise<boolean>;
}

/** Paste-a-link form used to replace a wrong social or add a missing one. */
const SocialFixForm = ({
  placeholder,
  isSubmitting,
  onSubmit,
}: SocialFixFormProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await onSubmit(url);
    if (saved) setUrl("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={placeholder}
        disabled={isSubmitting}
        aria-label="Profile link"
      />
      <Button type="submit" size="sm" disabled={isSubmitting || !url.trim()}>
        {isSubmitting ? <Loader className="size-4 animate-spin" /> : "Save"}
      </Button>
    </form>
  );
};

export default SocialFixForm;

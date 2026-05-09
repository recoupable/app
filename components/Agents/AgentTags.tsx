import type React from "react";

interface AgentTagsProps {
  tags: string[];
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  showAllTags: boolean;
  setShowAllTags: (show: boolean) => void;
}

const AgentTags: React.FC<AgentTagsProps> = ({
  tags,
  selectedTag,
  setSelectedTag,
}) => (
  <div className="flex flex-wrap gap-2 items-center justify-start">
    {tags.map((tag) => (
      <button
        key={tag}
        type="button"
        className={`px-3 py-1 rounded-full border text-sm transition-colors ${
          selectedTag === tag
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card text-foreground border-border hover:bg-muted"
        }`}
        onClick={() => setSelectedTag(tag)}
      >
        {tag}
      </button>
    ))}
  </div>
);

export default AgentTags;

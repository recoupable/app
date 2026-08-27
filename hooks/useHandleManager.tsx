import { useState } from "react";

type Handles = Record<string, string>;

interface UseHandleManagerProps {
  handles: Handles;
  onHandlesChange: (handles: Handles) => void;
}

export const useHandleManager = ({
  handles,
  onHandlesChange,
}: UseHandleManagerProps) => {
  const [removingPlatform, setRemovingPlatform] = useState<string | null>(null);

  const handleRemove = (platform: string) => {
    setRemovingPlatform(platform);
    setTimeout(() => {
      const newHandles = { ...handles };
      delete newHandles[platform];
      onHandlesChange(newHandles);
      setRemovingPlatform(null);
    }, 300);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    platform: string
  ) => {
    onHandlesChange({
      ...handles,
      [platform]: e.target.value,
    });
  };

  return {
    removingPlatform,
    handleRemove,
    handleChange,
  };
};

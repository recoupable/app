"use client";

import { useState } from "react";
import { Loader, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddRosterArtist } from "@/hooks/onboarding/useAddRosterArtist";

/** Inline "add another artist" form for multi-artist managers. */
const AddArtistForm = () => {
  const { addArtist, isAdding } = useAddRosterArtist();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const added = await addArtist(name);
    if (added) {
      setName("");
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="size-4 mr-2" />
        Add another artist
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Artist name"
        disabled={isAdding}
        aria-label="Artist name"
      />
      <Button type="submit" disabled={isAdding || !name.trim()}>
        {isAdding ? <Loader className="size-4 animate-spin" /> : "Add"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={isAdding}
        onClick={() => setIsOpen(false)}
      >
        Cancel
      </Button>
    </form>
  );
};

export default AddArtistForm;

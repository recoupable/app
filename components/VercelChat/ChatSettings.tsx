"use client";

import { SlidersHorizontal } from "lucide-react";
import ModelSelect from "@/components/ModelSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ChatSettings() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Chat settings"
          title="Chat settings"
          className="size-8 text-muted-foreground"
        >
          <SlidersHorizontal aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chat settings</DialogTitle>
          <DialogDescription>
            Choose the model for this conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Model</span>
          <ModelSelect />
        </div>
      </DialogContent>
    </Dialog>
  );
}

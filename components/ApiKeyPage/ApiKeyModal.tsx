"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import CopyButton from "@/components/CopyButton";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export function ApiKeyModal({ isOpen, onClose, apiKey }: ApiKeyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Key Created Successfully</DialogTitle>
          <DialogDescription>
            {`Your API key has been generated. Please copy it now as you won't be able to see it
            again.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Your API Key</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                value={apiKey}
                readOnly
                className="font-mono text-sm"
              />
              <CopyButton text={apiKey} label="API key" className="px-3" size="sm" />
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Important Security Notice
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  {`We don't store app secrets, so this is the only time you can copy it. If you lose
                    it, you'll need to reset it.`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

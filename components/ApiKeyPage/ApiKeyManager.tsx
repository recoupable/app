"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";
import { ApiKeyForm } from "./ApiKeyForm";
import { ApiKeyList } from "./ApiKeyList";
import { DOCS_BASE_URL } from "@/lib/consts";

interface ApiKeyManagerProps {
  className?: string;
}

export default function ApiKeyManager({ className }: ApiKeyManagerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Manager
        </CardTitle>
        <CardDescription>
          Create an API key to access Recoup programmatically.{" "}
          <a
            href={DOCS_BASE_URL}
            className="text-blue-600 underline hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            View docs here.
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ApiKeyForm />
        <div className="border-t pt-6">
          <h3 className="mb-4 font-semibold">API Keys</h3>
          <ApiKeyList />
        </div>
      </CardContent>
    </Card>
  );
}


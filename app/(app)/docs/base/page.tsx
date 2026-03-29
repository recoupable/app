"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { LanguageSelector } from "@/components/docs/LanguageSelector";
import { ResponseTable } from "@/components/docs/ResponseTable";
import { AuthSection } from "@/components/docs/AuthSection";
import { ViewAgentSection } from "@/components/docs/ViewAgentSection";
import { codeExamples, exampleResponse, responseProperties } from "./constants";
import { Language, languages } from "@/types/Docs";

export default function AgentKitDocs() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages[0]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-screen overflow-y-auto">
      <h1 className="text-4xl font-bold mb-8">AgentKit Documentation</h1>

      <AuthSection />

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Making Requests</h2>
        <div className="mb-4">
          <LanguageSelector
            languages={languages}
            selectedLanguage={selectedLanguage}
            onLanguageSelect={(language) => setSelectedLanguage(language)}
          />
          <CodeBlock
            code={
              codeExamples[selectedLanguage.value as keyof typeof codeExamples]
            }
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Response Format</h2>
        <p className="mb-4">
          The API returns JSON responses. Here&apos;s an example response:
        </p>
        <CodeBlock code={JSON.stringify(exampleResponse, null, 2)} />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Available Properties</h2>
        <ResponseTable properties={responseProperties} />
      </section>

      <ViewAgentSection />
    </div>
  );
}

"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { LanguageSelector } from "@/components/docs/LanguageSelector";
import { ResponseTable } from "@/components/docs/ResponseTable";
import { codeExamples, exampleResponse, responseProperties } from "./constants";
import { Language, languages } from "@/types/Docs";

export default function AccountDocs() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages[0]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-screen overflow-y-auto">
      <h1 className="text-4xl font-bold mb-8">Account API Documentation</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Get Account Socials</h2>
        <p className="mb-4">
          Retrieve social media accounts associated with a given account ID.
        </p>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Parameters</h3>
          <ul className="list-disc pl-6">
            <li>
              <code>accountId</code> (required) - The unique identifier of the
              account
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Request Example</h3>
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
        <h2 className="text-2xl font-semibold mb-4">Response Properties</h2>
        <ResponseTable properties={responseProperties} />
      </section>
    </div>
  );
}

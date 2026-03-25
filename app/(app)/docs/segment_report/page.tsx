"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { LanguageSelector } from "@/components/docs/LanguageSelector";
import { ResponseTable } from "@/components/docs/ResponseTable";
import { codeExamples, exampleResponse, responseProperties } from "./constants";
import { Language } from "@/types/Docs";
import { languages } from "@/types/Docs";

export default function SegmentReportDocs() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages[0]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-screen overflow-y-auto">
      <h1 className="text-4xl font-bold mb-8">
        Segment Report API Documentation
      </h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Create Segment Report</h2>
        <p className="mb-4">
          Generate a detailed report for a specific segment by its ID.
        </p>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Endpoint</h3>
          <code className="block bg-gray-100 p-4 rounded">
            POST https://api.recoupable.com/api/create_report
          </code>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Parameters</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-4 border">Name</th>
                <th className="text-left p-4 border">Type</th>
                <th className="text-left p-4 border">Required</th>
                <th className="text-left p-4 border">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 border">segmentId</td>
                <td className="p-4 border">string</td>
                <td className="p-4 border">Yes</td>
                <td className="p-4 border">
                  The unique identifier of the segment to generate a report for
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Request Example</h3>
          <LanguageSelector
            languages={languages}
            selectedLanguage={selectedLanguage}
            onLanguageSelect={setSelectedLanguage}
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
          The API returns JSON responses. Here&apos;s an example success
          response:
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

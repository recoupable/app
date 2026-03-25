"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { LanguageSelector } from "@/components/docs/LanguageSelector";
import { ResponseTable } from "@/components/docs/ResponseTable";
import { codeExamples, exampleResponse, responseProperties } from "./constants";
import { languages, type Language } from "@/types/Docs";

export default function PostsDocs() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages[0]
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-4xl font-bold mb-8">
        Posts API Documentation
      </h1>

      <section className="mb-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Get Artist Posts
        </h2>
        <p className="mb-4">
          Retrieve all social media posts from an artist across all platforms.
        </p>

        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-semibold mb-2">Endpoint</h3>
          <code className="block bg-gray-100 p-2 md:p-4 rounded text-sm md:text-base break-all">
            GET https://api.recoupable.com/api/posts
          </code>
        </div>

        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-semibold mb-2">Parameters</h3>
          <div className="-mx-4 md:mx-0">
            <div className="block md:hidden">
              {/* Mobile view - Card style */}
              <div className="bg-gray-100 p-4 rounded">
                <div className="font-semibold mb-1">artist_account_id</div>
                <div className="text-sm text-gray-600 mb-1">Type: string</div>
                <div className="text-sm text-gray-600 mb-2">Required: Yes</div>
                <div className="text-sm">
                  The unique identifier of the artist account to fetch posts for
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded mt-4">
                <div className="font-semibold mb-1">page</div>
                <div className="text-sm text-gray-600 mb-1">Type: number</div>
                <div className="text-sm text-gray-600 mb-2">Required: No</div>
                <div className="text-sm">
                  The page number to retrieve (default: 1)
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded mt-4">
                <div className="font-semibold mb-1">limit</div>
                <div className="text-sm text-gray-600 mb-1">Type: number</div>
                <div className="text-sm text-gray-600 mb-2">Required: No</div>
                <div className="text-sm">
                  The number of records per page (default: 20, max: 100)
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              {/* Desktop view - Table style */}
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
                    <td className="p-4 border">artist_account_id</td>
                    <td className="p-4 border">string</td>
                    <td className="p-4 border">Yes</td>
                    <td className="p-4 border">
                      The unique identifier of the artist account to fetch posts
                      for
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 border">page</td>
                    <td className="p-4 border">number</td>
                    <td className="p-4 border">No</td>
                    <td className="p-4 border">
                      The page number to retrieve (default: 1)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 border">limit</td>
                    <td className="p-4 border">number</td>
                    <td className="p-4 border">No</td>
                    <td className="p-4 border">
                      The number of records per page (default: 20, max: 100)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            Request Example
          </h3>
          <div className="mb-4 -mx-4 md:mx-0 overflow-x-auto whitespace-nowrap md:whitespace-normal">
            <div className="px-4 md:px-0">
              <LanguageSelector
                languages={languages}
                selectedLanguage={selectedLanguage}
                onLanguageSelect={(language: Language) =>
                  setSelectedLanguage(language)
                }
              />
            </div>
          </div>
          <div className="w-full">
            <CodeBlock
              code={
                codeExamples[
                  selectedLanguage.value as keyof typeof codeExamples
                ]
              }
            />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Response Format
        </h2>
        <p className="mb-4">
          The API returns JSON responses. Here&apos;s an example success
          response:
        </p>
        <div className="w-full">
          <CodeBlock code={JSON.stringify(exampleResponse, null, 2)} />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Response Properties
        </h2>
        <div className="w-full">
          <ResponseTable properties={responseProperties} />
        </div>
      </section>
    </div>
  );
}

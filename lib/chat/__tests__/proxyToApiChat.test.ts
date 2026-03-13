import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { proxyToApiChat } from "../proxyToApiChat";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("proxyToApiChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("streaming endpoint (/api/chat)", () => {
    it("should forward Authorization header to recoup-api", async () => {
      const mockStreamResponse = new Response("data: test\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
      mockFetch.mockResolvedValueOnce(mockStreamResponse);

      const request = new NextRequest("https://chat.recoupable.com/api/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      });

      await proxyToApiChat(request, { streaming: true });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/api/chat");
      expect(options.headers.get("authorization")).toBe("Bearer test-token");
    });

    it("should forward x-api-key header to recoup-api", async () => {
      const mockStreamResponse = new Response("data: test\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
      mockFetch.mockResolvedValueOnce(mockStreamResponse);

      const request = new NextRequest("https://chat.recoupable.com/api/chat", {
        method: "POST",
        headers: {
          "x-api-key": "test-api-key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      });

      await proxyToApiChat(request, { streaming: true });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.get("x-api-key")).toBe("test-api-key");
    });

    it("should forward request body to recoup-api", async () => {
      const mockStreamResponse = new Response("data: test\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
      mockFetch.mockResolvedValueOnce(mockStreamResponse);

      const requestBody = {
        messages: [{ role: "user", content: "hello" }],
        roomId: "test-room-id",
        artistId: "test-artist-id",
      };

      const request = new NextRequest("https://chat.recoupable.com/api/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      await proxyToApiChat(request, { streaming: true });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.body).toBe(JSON.stringify(requestBody));
    });

    it("should return the proxied response", async () => {
      const mockStreamResponse = new Response("data: test\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
      mockFetch.mockResolvedValueOnce(mockStreamResponse);

      const request = new NextRequest("https://chat.recoupable.com/api/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      });

      const response = await proxyToApiChat(request, { streaming: true });

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it("should handle error responses from recoup-api", async () => {
      const mockErrorResponse = new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
      mockFetch.mockResolvedValueOnce(mockErrorResponse);

      const request = new NextRequest("https://chat.recoupable.com/api/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer invalid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      });

      const response = await proxyToApiChat(request, { streaming: true });

      expect(response.status).toBe(401);
    });

    it("should handle fetch errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const request = new NextRequest("https://chat.recoupable.com/api/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      });

      const response = await proxyToApiChat(request, { streaming: true });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBeDefined();
      expect(body.name).toBeDefined();
    });
  });

  describe("non-streaming endpoint (/api/chat/generate)", () => {
    it("should call /api/chat/generate endpoint", async () => {
      const mockResponse = new Response(
        JSON.stringify({
          text: "Hello!",
          finishReason: "stop",
          usage: { promptTokens: 10, completionTokens: 5 },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
      mockFetch.mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("https://chat.recoupable.com/api/chat/generate", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: "Say hello" }),
      });

      await proxyToApiChat(request, { streaming: false });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain("/api/chat/generate");
    });

    it("should forward all headers for non-streaming requests", async () => {
      const mockResponse = new Response(
        JSON.stringify({
          text: "Hello!",
          finishReason: "stop",
          usage: { promptTokens: 10, completionTokens: 5 },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
      mockFetch.mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("https://chat.recoupable.com/api/chat/generate", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "x-api-key": "test-key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: "Say hello" }),
      });

      await proxyToApiChat(request, { streaming: false });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.get("authorization")).toBe("Bearer test-token");
      expect(options.headers.get("x-api-key")).toBe("test-key");
    });

    it("should return JSON response for non-streaming", async () => {
      const responseBody = {
        text: "Hello!",
        finishReason: "stop",
        usage: { promptTokens: 10, completionTokens: 5 },
      };
      const mockResponse = new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("https://chat.recoupable.com/api/chat/generate", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: "Say hello" }),
      });

      const response = await proxyToApiChat(request, { streaming: false });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.text).toBe("Hello!");
    });
  });

  describe("CORS headers", () => {
    it("should include CORS headers in the response", async () => {
      const mockResponse = new Response("data: test\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("https://chat.recoupable.com/api/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      });

      const response = await proxyToApiChat(request, { streaming: true });

      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });
  });

  describe("deprecation headers", () => {
    it("should include Deprecation header in streaming response", async () => {
      const mockResponse = new Response("data: test\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("https://chat.recoupable.com/api/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      });

      const response = await proxyToApiChat(request, { streaming: true });

      expect(response.headers.get("Deprecation")).toBe("true");
    });

    it("should include Deprecation header in non-streaming response", async () => {
      const mockResponse = new Response(JSON.stringify({ text: "Hello!", finishReason: "stop" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("https://chat.recoupable.com/api/chat/generate", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: "Say hello" }),
      });

      const response = await proxyToApiChat(request, { streaming: false });

      expect(response.headers.get("Deprecation")).toBe("true");
    });

    it("should include Sunset header with future date", async () => {
      const mockResponse = new Response("data: test\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("https://chat.recoupable.com/api/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      });

      const response = await proxyToApiChat(request, { streaming: true });

      const sunsetHeader = response.headers.get("Sunset");
      expect(sunsetHeader).toBeDefined();
      // Sunset date should be a valid HTTP date format
      expect(new Date(sunsetHeader!).getTime()).toBeGreaterThan(Date.now());
    });

    it("should include Link header with deprecation rel pointing to new API", async () => {
      const mockResponse = new Response("data: test\n\n", {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const request = new NextRequest("https://chat.recoupable.com/api/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      });

      const response = await proxyToApiChat(request, { streaming: true });

      const linkHeader = response.headers.get("Link");
      expect(linkHeader).toContain('rel="deprecation"');
      expect(linkHeader).toContain("recoup-api");
    });

    it("should include deprecation headers in error responses", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const request = new NextRequest("https://chat.recoupable.com/api/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
      });

      const response = await proxyToApiChat(request, { streaming: true });

      expect(response.status).toBe(500);
      expect(response.headers.get("Deprecation")).toBe("true");
    });
  });
});

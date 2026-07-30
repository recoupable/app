import { describe, it, expect } from "vitest";
import { validateEmailReportBody } from "../validateEmailReportBody";

describe("validateEmailReportBody", () => {
  it("accepts a valid email and trims whitespace", () => {
    const result = validateEmailReportBody({ email: "  fan@example.com " });
    expect(result.data).toEqual({ email: "fan@example.com" });
    expect(result.error).toBeUndefined();
  });

  it("accepts an optional positive headline_value", () => {
    const result = validateEmailReportBody({
      email: "fan@example.com",
      headline_value: 1400000,
    });
    expect(result.data).toEqual({
      email: "fan@example.com",
      headline_value: 1400000,
    });
  });

  it("rejects a missing email", () => {
    const result = validateEmailReportBody({});
    expect(result.data).toBeUndefined();
    expect(result.error).toBeTruthy();
  });

  it("rejects an invalid email", () => {
    const result = validateEmailReportBody({ email: "not-an-email" });
    expect(result.data).toBeUndefined();
    expect(result.error).toBeTruthy();
  });

  it("rejects a non-numeric headline_value", () => {
    const result = validateEmailReportBody({
      email: "fan@example.com",
      headline_value: "1.4M",
    });
    expect(result.data).toBeUndefined();
    expect(result.error).toBeTruthy();
  });

  it("rejects a negative headline_value", () => {
    const result = validateEmailReportBody({
      email: "fan@example.com",
      headline_value: -5,
    });
    expect(result.data).toBeUndefined();
    expect(result.error).toBeTruthy();
  });

  it("rejects a non-object body", () => {
    const result = validateEmailReportBody("hello");
    expect(result.data).toBeUndefined();
    expect(result.error).toBeTruthy();
  });
});

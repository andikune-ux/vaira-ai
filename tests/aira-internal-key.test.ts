import { describe, expect, it } from "vitest";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:3000";

describe("Aira internal API key", () => {
  it("is present in the server environment", () => {
    expect(process.env.AIRA_INTERNAL_API_KEY).toBeTruthy();
    expect(process.env.AIRA_INTERNAL_API_KEY).toMatch(/^[a-f0-9]{64}$/);
  });

  it("can authenticate the lightweight health endpoint when available", async () => {
    const token = process.env.AIRA_INTERNAL_API_KEY;
    expect(token).toBeTruthy();
    const response = await fetch(`${apiBaseUrl}/api/health`, {
      headers: { "x-aira-internal-key": token! },
    });
    expect([200, 404]).toContain(response.status);
  });
});


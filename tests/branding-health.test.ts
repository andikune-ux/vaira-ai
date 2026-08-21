import { describe, expect, it } from "vitest";

describe("branding and API health", () => {
  it("preserves the original app title and reaches the health endpoint", async () => {
    expect(process.env.VITE_APP_TITLE).toBe("V A I R A  A I");

    const response = await fetch("http://127.0.0.1:3000/api/health", {
      headers: { "x-app-title": process.env.VITE_APP_TITLE ?? "" },
    });

    expect(response.status).toBe(200);
  });
});

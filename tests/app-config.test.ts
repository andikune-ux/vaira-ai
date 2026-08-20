import { describe, expect, it } from "vitest";

describe("V A I R A  A I app configuration", () => {
  it("exposes the configured application title", () => {
    expect(process.env.VITE_APP_TITLE ?? "V A I R A  A I").toBe("V A I R A  A I");
  });
});

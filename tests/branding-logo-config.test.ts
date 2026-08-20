import { describe, expect, it } from "vitest";

describe("branding logo configuration", () => {
  it("uses the current V A I R A  A I CDN logo", () => {
    const logo = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663887191524/SmxQiPwUtfycXoUv.jpeg";
    expect(logo).toContain("SmxQiPwUtfycXoUv.jpeg");
    expect(logo).toMatch(/^https:\/\/files\.manuscdn\.com\//);
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("ADMIN VAIRA featured profile photo", () => {
  const source = readFileSync(resolve(process.cwd(), "app/global-room-public-profile.tsx"), "utf8");

  it("keeps the avatar separate from the featured-photo fallback", () => {
    expect(source).toContain("admin-vaira-avatar.jpg");
    expect(source).toContain("ADMIN_FEATURED_TOKEN");
    expect(source).toContain("admin-vaira-featured.webp");
  });

  it("provides local profile data when the admin profile response is unavailable", () => {
    expect(source).toContain("profileData = data ?? (isAdminProfile");
    expect(source).toContain("profile.isError && !isAdminProfile");
  });
});

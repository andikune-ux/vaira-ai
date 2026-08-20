import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const llmSource = readFileSync(resolve(process.cwd(), "server/_core/llm.ts"), "utf8");
const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("Aira usage-limit handling", () => {
  it("does not retry permanent provider quota and auth responses", () => {
    expect(llmSource).toContain("response.status === 412");
    expect(llmSource).toContain("response.status === 401");
    expect(llmSource).toContain("response.status === 403");
  });

  it("continues configured provider failover and exposes a usable local fallback", () => {
    expect(routerSource).toContain("invokeLLM dapat memiliki provider");
    expect(routerSource).not.toContain("throw modelError");
    expect(routerSource).toContain("buildOfflineAiraReply");
    expect(routerSource).toContain("UPSTREAM_LIMIT");
    expect(routerSource).toContain('source: upstreamUnavailable ? "offline"');
  });
});


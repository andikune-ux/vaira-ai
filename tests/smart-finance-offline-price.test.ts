import { describe, expect, it } from "vitest";
import { getOfflinePurchaseComparison } from "../lib/finance/smart-finance";

describe("offline purchase price comparison", () => {
  it("compares rice purchases against the offline reference band", () => {
    const result = getOfflinePurchaseComparison({ id: "1", title: "Beras", category: "Pangan", subcategory: "Beras", amount: 120000, cadence: "monthly", isPaid: false, reminderEnabled: true });
    expect(result.status).toBe("high");
    expect(result.text).toContain("estimasi offline");
  });

  it("does not invent a reference for unknown categories", () => {
    const result = getOfflinePurchaseComparison({ id: "2", title: "Kebutuhan", category: "Pendidikan", amount: 100000, cadence: "monthly", isPaid: false, reminderEnabled: true });
    expect(result.status).toBe("unknown");
  });
});

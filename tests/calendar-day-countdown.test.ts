import { describe, expect, it } from "vitest";
import { getDaysUntilEvent, getUpcomingEvent } from "../lib/calendar-data";

describe("calendar greeting countdown", () => {
  it("recalculates by local calendar date after midnight", () => {
    const beforeMidnight = new Date(2026, 7, 19, 23, 59, 59);
    const afterMidnight = new Date(2026, 7, 20, 0, 0, 1);
    const eventBefore = getUpcomingEvent(beforeMidnight);
    const eventAfter = getUpcomingEvent(afterMidnight);

    expect(eventBefore?.title).toContain("Maulid Nabi");
    expect(eventAfter?.title).toContain("Maulid Nabi");
    expect(getDaysUntilEvent(eventBefore!, beforeMidnight)).toBe(6);
    expect(getDaysUntilEvent(eventAfter!, afterMidnight)).toBe(5);
  });

  it("does not retain an old countdown when the date changes", () => {
    const first = getUpcomingEvent(new Date(2026, 7, 19, 8));
    const second = getUpcomingEvent(new Date(2026, 7, 20, 8));
    expect(getDaysUntilEvent(first!, new Date(2026, 7, 19, 8))).toBe(6);
    expect(getDaysUntilEvent(second!, new Date(2026, 7, 20, 8))).toBe(5);
  });
});

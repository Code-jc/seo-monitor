import { expect, test } from "@playwright/test";
import { getVisibilitySummary } from "../src/visibility/get-visibility-summary";
import { primaryResults } from "./fixtures/visibility-results";

test("Identify baseline and latest measurement by date", () => {
    const summary = getVisibilitySummary(primaryResults);

    expect(summary.totalMeasurements).toBe(2);
    expect(summary.measurableMeasurements).toBe(2);
    expect(summary.baseline?.position).toBe(18);
    expect(summary.latest?.position).toBe(8);
    expect(summary.statusChanged).toBe(false);
});
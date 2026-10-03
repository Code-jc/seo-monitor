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

test("Keep the latest failed attempt separate from valid history", () => {
    const failedAttempt = {
        ...primaryResults[0],
        status: "error" as const,
        found: false,
        position: null,
        resultPage: null,
        matchedUrl: null,
        matchedTitle: null,
        checkedAt: "2026-10-03T12:00:00Z",
        runId: "failed-attempt",
    };

    const summary = getVisibilitySummary([
        failedAttempt,
        ...primaryResults,
    ]);

    expect(summary.latestAttempt?.status).toBe("error");
    expect(summary.latest?.position).toBe(8);
    expect(summary.baseline?.position).toBe(18);
    expect(summary.totalMeasurements).toBe(3);
    expect(summary.measurableMeasurements).toBe(2);
});
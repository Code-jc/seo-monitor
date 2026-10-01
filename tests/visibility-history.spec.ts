import { test, expect } from "@playwright/test";
import { casaMalvaConfig } from "../config/sites/casa-malva";
import { loadVisibilityResults } from "../src/storage/load-visibility-results";
import { getVisibilitySummary } from "../src/visibility/get-visibility-summary";

test("Casa Malva visibility history", async () => {
    const results = loadVisibilityResults(
        casaMalvaConfig.id
    );

    expect(results.length).toBeGreaterThan(0);

    const summary = getVisibilitySummary(results);

    console.log("Visibility summary:", {
        totalMeasurements: summary.totalMeasurements,

        baselineStatus:
            summary.baseline?.status ?? null,

        baselinePosition:
            summary.baseline?.position ?? null,

        latestStatus:
            summary.latest?.status ?? null,

        latestPosition:
            summary.latest?.position ?? null,

        positionChange:
            summary.positionChange,

        statusChanged:
            summary.statusChanged,
    });

    expect(summary.baseline).not.toBeNull();
    expect(summary.latest).not.toBeNull();
});
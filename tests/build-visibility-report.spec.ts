import { expect, test } from "@playwright/test";
import { casaMalvaConfig } from "../config/sites/casa-malva";
import { loadVisibilityResults } from "../src/storage/load-visibility-results";
import { getVisibilitySummary } from "../src/visibility/get-visibility-summary";
import { buildVisibilityReport } from "../src/reporting/build-visibility-report";

test("Build Casa Malva visibility report", async () => {
    const results = loadVisibilityResults(
        casaMalvaConfig.id
    );

    const summary = getVisibilitySummary(results);

    const report = buildVisibilityReport(
        casaMalvaConfig,
        casaMalvaConfig.keywords[0].query,
        summary
    );

    console.log("Visibility report:", report);

    expect(report.siteId).toBe(
        casaMalvaConfig.id
    );

    expect(report.keyword).toBe(
        casaMalvaConfig.keywords[0].query
    );

    expect(report.change.totalMeasurements)
        .toBeGreaterThan(0);
});
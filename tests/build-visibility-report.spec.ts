import { expect, test } from "@playwright/test";
import { casaMalvaConfig } from "../config/sites/casa-malva";
import { getVisibilitySummary } from "../src/visibility/get-visibility-summary";
import { buildVisibilityReport } from "../src/reporting/build-visibility-report";
import { primaryQuery, primaryResults } from "./fixtures/visibility-results";

test("Build visibility report for the primary keyword", () => {
    const summary = getVisibilitySummary(primaryResults);
    const report = buildVisibilityReport(
        casaMalvaConfig,
        primaryQuery,
        summary
    );

    expect(report.siteId).toBe(casaMalvaConfig.id);
    expect(report.keyword).toBe(primaryQuery);
    expect(report.baseline.position).toBe(18);
    expect(report.latest.position).toBe(8);
    expect(report.change.totalMeasurements).toBe(2);
    expect(report.change.measurableMeasurements).toBe(2);
});
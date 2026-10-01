import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { casaMalvaConfig } from "../config/sites/casa-malva";
import { loadVisibilityResults } from "../src/storage/load-visibility-results";
import { getVisibilitySummary } from "../src/visibility/get-visibility-summary";
import { buildVisibilityReport } from "../src/reporting/build-visibility-report";
import { writeVisibilityReport } from "../src/reporting/write-visibility-report";

test("Write Casa Malva visibility report", async () => {
    const results = loadVisibilityResults(
        casaMalvaConfig.id
    );

    const summary = getVisibilitySummary(results);

    const report = buildVisibilityReport(
        casaMalvaConfig,
        casaMalvaConfig.keywords[0].query,
        summary
    );

    const filePath = writeVisibilityReport(report);

    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(
        filePath,
        "utf-8"
    );

    expect(content).toContain(
        "HOTEL CASA MALVA GUANAJUATO"
    );
});
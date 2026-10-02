import { expect, test } from "@playwright/test";
import { casaMalvaConfig } from "../config/sites/casa-malva";
import { loadVisibilityResults } from "../src/storage/load-visibility-results";
import { getVisibilitySummary } from "../src/visibility/get-visibility-summary";
import { buildVisibilityReport } from "../src/reporting/build-visibility-report";
import { renderVisibilityHtml } from "../src/reporting/render-visibility-html";

test("Render Casa Malva visibility HTML", async () => {
    const results = loadVisibilityResults(
        casaMalvaConfig.id
    );

    const summary = getVisibilitySummary(results);

    const report = buildVisibilityReport(
        casaMalvaConfig,
        casaMalvaConfig.keywords[0].query,
        summary
    );

    const html = renderVisibilityHtml(report);

    expect(html).toContain(
        "HOTEL CASA MALVA GUANAJUATO"
    );

    expect(html).toContain(
        "hotel casa malva guanajuato"
    );

    expect(html).toContain(
        "Mediciones válidas"
    );

    expect(html).toContain(
        "totales"
    );
});
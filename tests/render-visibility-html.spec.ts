import { expect, test } from "@playwright/test";
import { casaMalvaConfig } from "../config/sites/casa-malva";
import {
    primaryQuery,
    primaryResults,
    visibilityResults,
} from "./fixtures/visibility-results";

import { getKeywordVisibilitySummaries } from "../src/visibility/get-keyword-visibility-summaries";
import { getVisibilitySummary } from "../src/visibility/get-visibility-summary";
import { buildVisibilityReport } from "../src/reporting/build-visibility-report";
import { renderVisibilityHtml } from "../src/reporting/render-visibility-html";

test("Render Casa Malva visibility HTML", async () => {
    const summary = getVisibilitySummary(primaryResults);

    const report = buildVisibilityReport(
        casaMalvaConfig,
        primaryQuery,
        summary
    );

    report.keywordSummaries =
        getKeywordVisibilitySummaries(visibilityResults);
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

    expect(html).toContain("casa malva guanajuato");
    expect(html).toContain("#18");
    expect(html).toContain("#8");
    expect(html).toContain("#24");

});
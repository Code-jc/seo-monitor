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

test("Render Casa Malva visibility HTML", async ({ page }) => {
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

    await page.setContent(html);

    const searchContext = page.locator(".search-context");
    const latestMeasurement = getVisibilitySummary(primaryResults).latest!;

    await expect(searchContext).toContainText(
        latestMeasurement.device === "mobile"
            ? "Móvil"
            : "Escritorio"
    );

    await expect(searchContext).toContainText(
        `País: ${latestMeasurement.country}`
    );

    await expect(searchContext).toContainText(
        `Idioma: ${latestMeasurement.language}`
    );

    const histories = page.locator("details.keyword-history");
    await expect(histories).toHaveCount(2);

    const primaryHistory = page
        .locator("td.keyword-name")
        .filter({ hasText: primaryQuery })
        .locator("details.keyword-history");

    await expect(primaryHistory.locator("li")).toHaveCount(2);
    await expect(primaryHistory.locator("ol")).toBeHidden();

    await primaryHistory.locator("summary").click();

    await expect(primaryHistory.locator("ol")).toBeVisible();
    await expect(primaryHistory.locator("li").first()).toContainText("#18");
    await expect(primaryHistory.locator("li").last()).toContainText("#8");
    await expect(primaryHistory.locator("time").first()).toContainText("(GMT-6)");

});

test("Show technical audit history", async ({ page }) => {
    const report = buildVisibilityReport(
        casaMalvaConfig,
        primaryQuery,
        getVisibilitySummary(primaryResults)
    );

    report.technicalSeoHistory = [
        {
            siteId: casaMalvaConfig.id,
            checkedAt: "2026-10-01T12:00:00Z",
            passed: 0,
            total: 1,
            checks: [
                {
                    id: "sitemap",
                    label: "Sitemap XML",
                    passed: false,
                },
            ],
        },
        {
            siteId: casaMalvaConfig.id,
            checkedAt: "2026-10-02T12:00:00Z",
            passed: 1,
            total: 1,
            checks: [
                {
                    id: "sitemap",
                    label: "Sitemap XML",
                    passed: true,
                },
            ],
        },
    ];

    await page.setContent(renderVisibilityHtml(report));

    const history = page.locator("details.technical-history");
    const audits = history.locator(":scope > ol > li");

    await expect(history).toHaveCount(1);
    await expect(audits).toHaveCount(2);
    await expect(history.locator(":scope > ol")).toBeHidden();

    await history.locator("summary").click();

    await expect(history.locator(":scope > ol")).toBeVisible();
    await expect(audits.first()).toContainText("0 / 1 checks correctos");
    await expect(audits.first()).toContainText("Sitemap XML: Falló");
    await expect(audits.last()).toContainText("1 / 1 checks correctos");
    await expect(audits.last()).toContainText("Sitemap XML: Correcto");
});
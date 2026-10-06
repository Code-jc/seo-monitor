import fs from "node:fs";
import path from "node:path";

import type {
    VisibilityReport,
} from "./build-visibility-report";

import {
    renderVisibilityHtml,
} from "./render-visibility-html";

import {
    loadTechnicalSeoResult,
} from "../storage/load-technical-seo-result";

import {
    loadVisibilityResults,
} from "../storage/load-visibility-results";

import {
    getKeywordVisibilitySummaries,
} from "../visibility/get-keyword-visibility-summaries";

import {
    loadTechnicalSeoHistory,
} from "../storage/load-technical-seo-history";

export function writeVisibilityReport(
    report: VisibilityReport
): string {
    const reportsDir =
        path.resolve("reports");

    fs.mkdirSync(
        reportsDir,
        {
            recursive: true,
        }
    );

    const filePath =
        path.join(
            reportsDir,
            `${report.siteId}.html`
        );

    const technicalSeo =
        report.technicalSeo ??
        loadTechnicalSeoResult(
            report.siteId
        );

    const visibilityResults =
        loadVisibilityResults(
            report.siteId
        );

    const keywordSummaries =
        getKeywordVisibilitySummaries(
            visibilityResults
        );

    const enrichedReport:
        VisibilityReport = {
        ...report,

        technicalSeo,

        technicalSeoHistory:
            report.technicalSeoHistory ??
            loadTechnicalSeoHistory(report.siteId),

        keywordSummaries,
    };

    const html =
        renderVisibilityHtml(
            enrichedReport
        );

    fs.writeFileSync(
        filePath,
        html,
        "utf-8"
    );

    return filePath;
}
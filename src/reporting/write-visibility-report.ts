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

    const enrichedReport:
        VisibilityReport = {
        ...report,

        technicalSeo,
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
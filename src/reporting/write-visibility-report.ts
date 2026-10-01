import fs from "node:fs";
import path from "node:path";
import type { VisibilityReport } from "./build-visibility-report";
import { renderVisibilityHtml } from "./render-visibility-html";

export function writeVisibilityReport(
    report: VisibilityReport
): string {
    const reportsDir = path.resolve("reports");

    fs.mkdirSync(reportsDir, {
        recursive: true,
    });

    const filePath = path.join(
        reportsDir,
        `${report.siteId}.html`
    );

    const html = renderVisibilityHtml(report);

    fs.writeFileSync(
        filePath,
        html,
        "utf-8"
    );

    return filePath;
}
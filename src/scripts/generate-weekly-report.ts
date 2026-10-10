import fs from "node:fs";
import path from "node:path";

import { casaMalvaConfig } from "../../config/sites/casa-malva";
import { loadVisibilityResults } from "../storage/load-visibility-results";
import { getVisibilitySummary } from "../visibility/get-visibility-summary";
import { buildVisibilityReport } from "../reporting/build-visibility-report";
import { writeVisibilityReport } from "../reporting/write-visibility-report";

function main(): void {
  const site = casaMalvaConfig;

  console.log(`Generating SEO report for ${site.name}`);

  const results = loadVisibilityResults(site.id);

  if (results.length === 0) {
    throw new Error(`No visibility data available for ${site.id}.`);
  }

  const primaryKeyword = site.keywords[0];

  if (!primaryKeyword) {
    throw new Error("No primary keyword configured.");
  }

  const keywordResults = results.filter(
    (result) =>
      result.query === primaryKeyword.query &&
      result.device === primaryKeyword.device &&
      result.country.toUpperCase() === primaryKeyword.country.toUpperCase() &&
      result.language === primaryKeyword.language,
  );

  const summary = getVisibilitySummary(keywordResults);

  const report = buildVisibilityReport(site, primaryKeyword.query, summary);

  const outputPath = writeVisibilityReport(report);

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error("SEO report generation failed.");
  }

  console.log(`Report generated: ${path.resolve(outputPath)}`);

  console.log(`Measurements loaded: ${results.length}`);

  console.log(`Latest measurement: ${summary.latest?.checkedAt ?? "none"}`);

  console.log(`Latest attempt: ${summary.latestAttempt?.status ?? "none"}`);
}

main();

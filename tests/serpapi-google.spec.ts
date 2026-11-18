import { expect, test } from "@playwright/test";

import { casaMalvaConfig } from "../config/sites/casa-malva";

import { getGoogleVisibilityViaSerpApi } from "../src/search/serpapi-google";

import { saveVisibilityResult } from "../src/storage/save-visibility-result";

import { createSerpApiRequestBudget } from '../src/search/serpapi-request-budget';

test.describe("Casa Malva visibility via SerpApi", () => {
  test.describe.configure({ mode: "serial" });
  
  test.skip(
    process.env.RUN_LIVE_SERPAPI !== "true",
    "Live SerpApi measurements are disabled by default.",
  );

  const budget = createSerpApiRequestBudget(20);

  for (const keyword of casaMalvaConfig.keywords) {
    test(keyword.query, async () => {
      test.setTimeout(240_000);

      console.log(`\nChecking keyword: "${keyword.query}"`);

      const result = await getGoogleVisibilityViaSerpApi(
  casaMalvaConfig,
  keyword,
  budget,
);

      console.log("SerpApi visibility:", {
        query: result.query,

        status: result.status,

        position: result.position,

        resultPage: result.resultPage,

        matchedUrl: result.matchedUrl,
      });

      saveVisibilityResult(result);

      expect(["success", "not_found", "unresolved"]).toContain(result.status);
    });
  }
});

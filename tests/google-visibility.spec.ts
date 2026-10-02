import { expect, test } from "@playwright/test";
import { casaMalvaConfig } from "../config/sites/casa-malva";
import { VisibilityResult } from "../src/types/search-visibility";
import { extractGoogleResults } from "../src/search/extract-google-results";
import { matchesTarget } from "../src/search/matches-target";
import { saveVisibilityResult } from "../src/storage/save-visibility-result";

test.describe(`Google Visibility: ${casaMalvaConfig.name}`, () => {
    for (const keyword of casaMalvaConfig.keywords.slice(0, 1)) {
        test(`Search ${keyword.query}`, async ({ page }, testInfo) => {
            const actualDevice = testInfo.project.use.isMobile
                ? "mobile"
                : "desktop";


            testInfo.skip(
                actualDevice !== (keyword.device ?? "desktop"),
                "The browser device does not match the keyword configuration."
            );

            const searchUrl = new URL("https://www.google.com/search");

            searchUrl.searchParams.set("q", keyword.query);
            searchUrl.searchParams.set(
                "hl",
                keyword.language ?? "es"
            );

            await page.goto(searchUrl.toString(), {
                waitUntil: "domcontentloaded",
            });

            const currentUrl = page.url();
            const isBlocked = currentUrl.includes("/sorry/");

            if (isBlocked) {
                const result: VisibilityResult = {
                    siteId: casaMalvaConfig.id,
                    provider: "google",

                    query: keyword.query,
                    country: keyword.country ?? "MX",
                    language: keyword.language ?? "es",
                    device: actualDevice,

                    targetId: "website",
                    targetType: "website",

                    status: "blocked",
                    found: false,

                    position: null,
                    resultPage: null,

                    matchedUrl: null,
                    matchedTitle: null,

                    searchUrl: searchUrl.toString(),

                    checkedAt: new Date().toISOString(),
                    runId: crypto.randomUUID(),
                };

                saveVisibilityResult(result);

                await testInfo.attach("visibility-result", {
                    body: JSON.stringify(result, null, 2),
                    contentType: "application/json",
                });

                console.log("Google blocked:", page.url());

                testInfo.skip(
                    true,
                    "Google blocked the search; visibility was not measured."
                );
            }

            await expect(page).toHaveTitle(
                new RegExp(keyword.query, "i")
            );

            const candidates = await extractGoogleResults(page);

            await testInfo.attach("search-candidates", {
                body: JSON.stringify(candidates, null, 2),
                contentType: "application/json",
            });

            const websiteTarget = {
                id: "website",
                type: "website" as const,
                domain: new URL(
                    casaMalvaConfig.baseUrl
                ).hostname,
            };

            const matchedIndex = candidates.findIndex(
                (candidate) =>
                    matchesTarget(
                        candidate.url,
                        websiteTarget
                    )
            );

            const matchedResult =
                matchedIndex >= 0
                    ? candidates[matchedIndex]
                    : undefined;

            const result: VisibilityResult = {
                siteId: casaMalvaConfig.id,
                provider: "google",

                query: keyword.query,
                country: keyword.country ?? "MX",
                language: keyword.language ?? "es",
                device: actualDevice,

                targetId: websiteTarget.id,
                targetType: websiteTarget.type,

                status: matchedResult
                    ? "success"
                    : "not_found",

                found: Boolean(matchedResult),

                position:
                    matchedIndex >= 0
                        ? matchedIndex + 1
                        : null,

                resultPage:
                    matchedResult
                        ? 1
                        : null,

                matchedUrl:
                    matchedResult?.url ?? null,

                matchedTitle:
                    matchedResult?.title ?? null,

                searchUrl: searchUrl.toString(),

                checkedAt: new Date().toISOString(),
                runId: crypto.randomUUID(),
            };

            saveVisibilityResult(result);

            await testInfo.attach("target-match", {
                body: JSON.stringify(result, null, 2),
                contentType: "application/json",
            });


        });
    }
});
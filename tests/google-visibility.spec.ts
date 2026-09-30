import { expect, test } from "@playwright/test";
import { casaMalvaConfig } from "../config/sites/casa-malva";
import { VisibilityResult } from "../src/types/search-visibility";

test.describe(`Google Visibility: ${casaMalvaConfig.name}`, () => {
    for (const keyword of casaMalvaConfig.keywords.slice(0, 1)) {
        test(`Search ${keyword.query}`, async ({ page }, testInfo) => {
            const actualDevice = testInfo.project.use.isMobile
                ? 'mobile'
                : 'desktop';

            testInfo.skip(
                actualDevice !== (keyword.device ?? 'desktop'),
                'The browser device does not match the keyword configuration.'
            );


            const searchUrl = new URL('https://www.google.com/search');

            searchUrl.searchParams.set('q', keyword.query);
            searchUrl.searchParams.set('hl', keyword.language ?? 'es');

            await page.goto(searchUrl.toString(), {
                waitUntil: 'domcontentloaded'
            });

            const currentUrl = page.url();
            const isBlocked = currentUrl.includes('/sorry/');



            if (isBlocked) {
                const result: VisibilityResult = {
                    siteId: casaMalvaConfig.id,
                    provider: 'google',

                    query: keyword.query,
                    country: keyword.country ?? 'MX',
                    language: keyword.language ?? 'es',
                    device: actualDevice,

                    targetId: 'website',
                    targetType: 'website',

                    status: 'blocked',
                    found: false,
                    position: null,
                    resultPage: null,
                    matchedUrl: null,
                    matchedTitle: null,

                    searchUrl: searchUrl.toString(),

                    checkedAt: new Date().toISOString(),
                    runId: crypto.randomUUID(),

                };

                await testInfo.attach('visibility-result', {
                    body: JSON.stringify(result, null, 2),
                    contentType: 'application/json',
                });

                testInfo.skip(
                    true,
                    'Google blocked the search; visibility was not measured.'
                );
            }

            await expect(page).toHaveTitle(
                new RegExp(keyword.query, 'i')
            );
        });

    }
});
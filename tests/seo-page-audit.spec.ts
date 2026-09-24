import { expect, test } from '@playwright/test';
import { casaMalvaConfig } from '../config/sites/casa-malva';

test.describe(`SEO Audit: ${casaMalvaConfig.name}`, () => {
    for (const monitoredPage of casaMalvaConfig.pages) {
        test(`${monitoredPage.name} matches the SEO configuration`, async ({
            page,
        }) => {
            const url = new URL(
                monitoredPage.path,
                casaMalvaConfig.baseUrl,
            ).toString();

            const response = await page.goto(url, {
                waitUntil: 'domcontentloaded',
            });

            await test.step('Page responds successfully', async () => {
                expect(response, `No response from ${url}`).not.toBeNull();
                expect.soft(response?.status()).toBeLessThan(400);
            });

            await test.step('Page matches expected SEO title ', async () => {
                const actualTitle = await page.title();

                expect.soft(actualTitle, `Unexpected title for ${url}`,).toBe(monitoredPage.expectedTitle);
            });





        });
    }
});
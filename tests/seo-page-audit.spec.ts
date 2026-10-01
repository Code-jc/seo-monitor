import { expect, test } from "@playwright/test";
import { casaMalvaConfig } from "../config/sites/casa-malva";

test.describe(`SEO Audit: ${casaMalvaConfig.name}`, () => {
    for (const monitoredPage of casaMalvaConfig.pages) {
        test(`${monitoredPage.name} matches the SEO configuration`, async ({
            page,
        }) => {
            const url = new URL(
                monitoredPage.path,
                casaMalvaConfig.baseUrl
            ).toString();

            const response = await page.goto(url, {
                waitUntil: "domcontentloaded",
            });

            await test.step("Page responds successfully", async () => {
                expect(
                    response,
                    `No response from ${url}`
                ).not.toBeNull();

                expect.soft(
                    response?.status(),
                    `Unexpected HTTP status for ${url}`
                ).toBeLessThan(400);
            });

            await test.step("Page matches expected SEO title", async () => {
                if (!monitoredPage.expectedTitle) {
                    return;
                }

                const actualTitle = await page.title();

                expect.soft(
                    actualTitle,
                    `Unexpected title for ${url}`
                ).toBe(monitoredPage.expectedTitle);
            });

            await test.step("Page matches expected H1", async () => {
                if (!monitoredPage.expectedH1) {
                    return;
                }

                const h1 = page.locator("h1").first();

                await expect.soft(
                    h1,
                    `H1 was not found for ${url}`
                ).toBeVisible();

                const actualH1 =
                    (await h1.textContent())?.trim() ?? "";

                expect.soft(
                    actualH1,
                    `Unexpected H1 for ${url}`
                ).toBe(monitoredPage.expectedH1);
            });

            await test.step("Page has canonical URL", async () => {
                const canonical = page.locator(
                    'link[rel="canonical"]'
                );

                const canonicalCount =
                    await canonical.count();

                expect.soft(
                    canonicalCount,
                    `Canonical tag missing for ${url}`
                ).toBeGreaterThan(0);

                if (canonicalCount > 0) {
                    const canonicalUrl =
                        await canonical.first().getAttribute("href");

                    console.log(
                        "Canonical:",
                        canonicalUrl
                    );
                }
            });

            await test.step("Page indexability matches configuration", async () => {
                const robotsContent =
                    await page
                        .locator('meta[name="robots"]')
                        .getAttribute("content")
                        .catch(() => null);

                const robots =
                    robotsContent?.toLowerCase() ?? "";

                const hasNoIndex =
                    robots.includes("noindex");

                const shouldBeIndexable: boolean | undefined =
                    monitoredPage.shouldBeIndexable;

                if (shouldBeIndexable) {
                    expect.soft(
                        hasNoIndex,
                        `${url} should be indexable but contains noindex`
                    ).toBe(false);
                }

                if (shouldBeIndexable === false) {
                    expect.soft(
                        hasNoIndex,
                        `${url} should be noindex but appears indexable`
                    ).toBe(true);
                }

                console.log("Robots meta:", {
                    content: robotsContent ?? "not present",
                    indexable: !hasNoIndex,
                });
            });

            console.log("SEO page baseline:", {
                page: monitoredPage.name,
                url,
                httpStatus: response?.status() ?? null,
                title: await page.title(),
                h1:
                    (
                        await page
                            .locator("h1")
                            .first()
                            .textContent()
                            .catch(() => null)
                    )?.trim() ?? null,
            });
        });
    }

    test("robots.txt is accessible", async ({
        request,
    }) => {
        const robotsUrl = new URL(
            "/robots.txt",
            casaMalvaConfig.baseUrl
        ).toString();

        const response =
            await request.get(robotsUrl);

        console.log("robots.txt:", {
            url: robotsUrl,
            status: response.status(),
        });

        expect.soft(
            response.status()
        ).toBeLessThan(400);
    });

    test("sitemap is accessible", async ({
        request,
    }) => {
        const sitemapUrl = new URL(
            "/wp-sitemap.xml",
            casaMalvaConfig.baseUrl
        ).toString();

        const response =
            await request.get(sitemapUrl);

        console.log("Sitemap:", {
            url: sitemapUrl,
            status: response.status(),
        });

        expect.soft(
            response.status()
        ).toBeLessThan(400);
    });
});
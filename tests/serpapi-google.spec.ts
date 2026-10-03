import {
    expect,
    test,
} from "@playwright/test";

import {
    casaMalvaConfig,
} from "../config/sites/casa-malva";

import {
    getGoogleVisibilityViaSerpApi,
} from "../src/search/serpapi-google";

import {
    saveVisibilityResult,
} from "../src/storage/save-visibility-result";

test.describe(
    "Casa Malva visibility via SerpApi",
    () => {
        for (
            const keyword
            of casaMalvaConfig.keywords
        ) {
            test(
                keyword.query,
                async () => {
                    test.setTimeout(
                        240_000
                    );

                    console.log(
                        `\nChecking keyword: "${keyword.query}"`
                    );

                    const result =
                        await getGoogleVisibilityViaSerpApi(
                            casaMalvaConfig,
                            keyword
                        );

                    console.log(
                        "SerpApi visibility:",
                        {
                            query:
                                result.query,

                            status:
                                result.status,

                            position:
                                result.position,

                            resultPage:
                                result.resultPage,

                            matchedUrl:
                                result.matchedUrl,
                        }
                    );

                    saveVisibilityResult(
                        result
                    );

                    expect([
                        "success",
                        "not_found",
                    ]).toContain(
                        result.status
                    );
                }
            );
        }
    }
);
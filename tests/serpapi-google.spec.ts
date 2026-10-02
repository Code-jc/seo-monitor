import {
    expect,
    test,
} from "@playwright/test";

import { casaMalvaConfig } from "../config/sites/casa-malva";

import {
    getGoogleVisibilityViaSerpApi,
} from "../src/search/serpapi-google";

import {
    saveVisibilityResult,
} from "../src/storage/save-visibility-result";

test(
    "Casa Malva visibility via SerpApi",
    async () => {
        const keyword =
            casaMalvaConfig.keywords[0];

        const result =
            await getGoogleVisibilityViaSerpApi(
                casaMalvaConfig,
                keyword
            );

        console.log(
            "SerpApi visibility:",
            result
        );

        saveVisibilityResult(result);

        expect([
            "success",
            "not_found",
        ]).toContain(result.status);
    }
);
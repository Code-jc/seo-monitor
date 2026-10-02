import {
    expect,
    test,
} from "@playwright/test";

import {
    casaMalvaConfig,
} from "../config/sites/casa-malva";

import {
    loadVisibilityResults,
} from "../src/storage/load-visibility-results";

import {
    getKeywordVisibilitySummaries,
} from "../src/visibility/get-keyword-visibility-summaries";

test(
    "Casa Malva keyword visibility summaries",
    () => {
        const results =
            loadVisibilityResults(
                casaMalvaConfig.id
            );

        const summaries =
            getKeywordVisibilitySummaries(
                results
            );

        console.log(
            "Keyword summaries:",
            summaries.map(
                (summary) => ({
                    query:
                        summary.query,

                    baselineStatus:
                        summary.baseline
                            .status,

                    baselinePosition:
                        summary.baseline
                            .position,

                    latestStatus:
                        summary.latest
                            .status,

                    latestPosition:
                        summary.latest
                            .position,

                    positionChange:
                        summary.positionChange,

                    total:
                        summary.totalMeasurements,

                    measurable:
                        summary.measurableMeasurements,
                })
            )
        );

        expect(
            summaries.length
        ).toBeGreaterThanOrEqual(
            5
        );

        for (
            const summary
            of summaries
        ) {
            expect(
                summary.query
            ).toBeTruthy();
        }
    }
);
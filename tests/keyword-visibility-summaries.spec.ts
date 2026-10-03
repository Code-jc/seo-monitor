import { expect, test } from "@playwright/test";
import { getKeywordVisibilitySummaries } from "../src/visibility/get-keyword-visibility-summaries";
import {
    primaryQuery,
    secondaryQuery,
    visibilityResults,
} from "./fixtures/visibility-results";

test("Group keyword histories and order measurements by date", () => {
    const summaries = getKeywordVisibilitySummaries(visibilityResults);

    expect(summaries).toHaveLength(2);

    const primary = summaries.find(
        (summary) => summary.query === primaryQuery
    );

    const secondary = summaries.find(
        (summary) => summary.query === secondaryQuery
    );

    expect(primary?.baseline.position).toBe(18);
    expect(primary?.latest.position).toBe(8);
    expect(primary?.totalMeasurements).toBe(2);

    expect(secondary?.baseline.status).toBe("not_found");
    expect(secondary?.latest.status).toBe("success");
    expect(secondary?.latest.position).toBe(24);
    expect(secondary?.totalMeasurements).toBe(2);
    expect(secondary?.measurableMeasurements).toBe(2);


    expect(primary?.history).toHaveLength(2);
    expect(
        primary?.history?.map((measurement) => measurement.position)
    ).toEqual([18, 8]);

    expect(secondary?.history).toHaveLength(2);
    expect(
        secondary?.history?.map((measurement) => measurement.status)
    ).toEqual(["not_found", "success"]);

    for (const summary of summaries) {
        const dates = (summary.history ?? []).map(
            (measurement) => new Date(measurement.checkedAt).getTime()
        );

        expect(dates).toEqual(
            [...dates].sort((a, b) => a - b)
        );
    }
});

test("Return no keyword summaries for empty history", () => {
    expect(getKeywordVisibilitySummaries([])).toEqual([]);
});
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
});

test("Return no keyword summaries for empty history", () => {
    expect(getKeywordVisibilitySummaries([])).toEqual([]);
});
import type { VisibilityResult } from "../../src/types/search-visibility";

export const primaryQuery = "hotel casa malva guanajuato";
export const secondaryQuery = "casa malva guanajuato";

function measurement(
    query: string,
    position: number | null,
    checkedAt: string
): VisibilityResult {
    return {
        siteId: "casa-malva",
        provider: "google",
        query,
        country: "MX",
        language: "es",
        device: "mobile",
        targetId: "website",
        targetType: "website",
        status: position === null ? "not_found" : "success",
        found: position !== null,
        position,
        resultPage: position === null ? null : Math.ceil(position / 10),
        matchedUrl: position === null
            ? null
            : "https://hotelcasamalvagto.com/",
        matchedTitle: position === null ? null : "Hotel Casa Malva",
        searchUrl: null,
        checkedAt,
        runId: `${query}-${checkedAt}`,
    };
}

//Orden mezclado para comprobar que se ordenan por fecha
export const visibilityResults: VisibilityResult[] = [
    measurement(primaryQuery, 8, "2026-10-02T12:00:00Z"),
    measurement(secondaryQuery, null, "2026-10-01T12:00:00Z"),
    measurement(primaryQuery, 18, "2026-10-01T12:00:00Z"),
    measurement(secondaryQuery, 24, "2026-10-02T12:00:00Z"),
];

export const primaryResults = visibilityResults.filter(
    (result) => result.query === primaryQuery
);
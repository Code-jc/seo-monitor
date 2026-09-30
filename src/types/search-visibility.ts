export type SearchProvider = 'google';

export type VisibilityStatus =
    | 'success'
    | 'not_found'
    | 'blocked'
    | 'error';

export type SearchTargetType =
    | 'website'
    | 'social'
    | 'local'
    | 'other';

export interface SearchTarget {
    id: string;
    type: SearchTargetType;
    domain: string;
    urlContains?: string;
}

export interface VisibilityResult {
    // Identity
    siteId: string;
    provider: SearchProvider;

    // Search conditions
    query: string;
    country: string;
    language: string;
    device: 'mobile' | 'desktop';

    // Target
    targetId: string;
    targetType: SearchTargetType;

    // Result
    status: VisibilityStatus;
    found: boolean;
    position: number | null;
    resultPage: number | null;
    matchedUrl: string | null;
    matchedTitle: string | null;

    // Search context
    searchUrl: string | null;

    // Execution metadata
    checkedAt: string;
    runId: string;
}
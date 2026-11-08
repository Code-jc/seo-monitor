export interface TechnicalSeoCheck {
    id:
    | "http"
    | "title"
    | "h1"
    | "canonical"
    | "indexability"
    | "robots"
    | "sitemap";

    label: string;
    passed: boolean;
    status?: 'passed' | 'failed' | 'blocked';
}

export interface TechnicalSeoResult {
    siteId: string;
    checkedAt: string;

    passed: number;
    total: number;

    checks: TechnicalSeoCheck[];
}
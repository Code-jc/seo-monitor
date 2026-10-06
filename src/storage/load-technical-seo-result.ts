import fs from "node:fs";
import path from "node:path";

import type { TechnicalSeoResult } from "../types/technical-seo";

export function loadTechnicalSeoResult(
    siteId: string
): TechnicalSeoResult | null {
    const dataRoot = process.env.SEO_DATA_DIR ?? path.resolve("data");

    const filePath = path.resolve(dataRoot, "technical-seo", `${siteId}.json`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const content = fs.readFileSync(filePath, "utf-8");

    return JSON.parse(content) as TechnicalSeoResult;
}

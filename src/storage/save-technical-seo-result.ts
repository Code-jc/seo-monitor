import fs from "node:fs";
import path from "node:path";

import type {
    TechnicalSeoResult,
} from "../types/technical-seo";

export function saveTechnicalSeoResult(
    result: TechnicalSeoResult
): string {
    const directory = path.resolve(
        "data",
        "technical-seo"
    );

    fs.mkdirSync(directory, {
        recursive: true,
    });

    const filePath = path.join(
        directory,
        `${result.siteId}.json`
    );

    fs.writeFileSync(
        filePath,
        JSON.stringify(result, null, 2),
        "utf-8"
    );

    return filePath;
}
import fs from "node:fs";
import path from "node:path";
import type { VisibilityResult } from "../types/search-visibility";


export function saveVisibilityResult(result: VisibilityResult): void {
    const resultDir = path.resolve("data", "visibility");

    fs.mkdirSync(resultDir, {
        recursive: true,
    });

    const filePath = path.join(
        resultDir,
        `${result.siteId}.json`
    );

    let results: VisibilityResult[] = [];

    if (fs.existsSync(filePath)) {
        const existingContent = fs.readFileSync(
            filePath,
            "utf-8"
        );

        results = JSON.parse(existingContent);
    }

    results.push(result);

    fs.writeFileSync(
        filePath,
        JSON.stringify(results, null, 2),
        "utf-8"
    );
}


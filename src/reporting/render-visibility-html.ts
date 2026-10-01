import type { VisibilityReport } from "./build-visibility-report";

export function renderVisibilityHtml(
    report: VisibilityReport
): string {
    const positionChange =
        report.change.positionChange === null
            ? "N/A"
            : report.change.positionChange > 0
                ? `+${report.change.positionChange}`
                : String(report.change.positionChange);

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${report.siteName} - Visibility Report</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
            line-height: 1.5;
        }

        .card {
            border: 1px solid #ddd;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .metric {
            font-size: 28px;
            font-weight: bold;
        }

        .label {
            color: #666;
        }
    </style>
</head>

<body>
    <h1>${report.siteName}</h1>

    <p>
        Keyword:
        <strong>${report.keyword}</strong>
    </p>

    <div class="card">
        <div class="label">Baseline</div>

        <div class="metric">
            ${report.baseline.position ?? "Sin medición"}
        </div>

        <div>
            Estado: ${report.baseline.status ?? "N/A"}
        </div>

        <div>
            Fecha: ${report.baseline.checkedAt ?? "N/A"}
        </div>
    </div>

    <div class="card">
        <div class="label">Última medición</div>

        <div class="metric">
            ${report.latest.position ?? "Sin medición"}
        </div>

        <div>
            Estado: ${report.latest.status ?? "N/A"}
        </div>

        <div>
            Fecha: ${report.latest.checkedAt ?? "N/A"}
        </div>
    </div>

    <div class="card">
        <div class="label">Cambio de posición</div>

        <div class="metric">
            ${positionChange}
        </div>

        <div>
            Mediciones totales:
            ${report.change.totalMeasurements}
        </div>
    </div>
</body>
</html>
`;
}
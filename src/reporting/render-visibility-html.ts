import type { VisibilityReport } from "./build-visibility-report";

function formatDate(value: string | null): string {
    if (!value) {
        return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("es-MX", {
        timeZone: "America/Mexico_City",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    }).format(date) + " (GMT-6)";
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };

        return entities[character]!;
    });
}

export function renderVisibilityHtml(
    report: VisibilityReport
): string {
    const positionChange =
        report.change.positionChange === null
            ? "N/A"
            : report.change.positionChange > 0
                ? `+${report.change.positionChange}`
                : String(report.change.positionChange);

    const latestStatus =
        report.latest.status === "success"
            ? "Encontrado"
            : report.latest.status === "not_found"
                ? "No encontrado en resultados consultados"
                : report.latest.status === "blocked"
                    ? "Medición bloqueada"
                    : "Sin dato";

    const latestPosition =
        report.latest.position !== null
            ? `#${report.latest.position}`
            : "Sin ranking";

    const baselinePosition =
        report.baseline.position !== null
            ? `#${report.baseline.position}`
            : report.baseline.status === "not_found"
                ? "Sin ranking"
                : "Sin dato";

    const baselineDescription =
        report.baseline.status === "blocked"
            ? "Primera medición bloqueada"
            : report.baseline.status === "not_found"
                ? "No encontrado en la medición inicial"
                : report.baseline.status === "success"
                    ? "Encontrado en la medición inicial"
                    : "Sin medición inicial";

    const technicalSeo =
        report.technicalSeo;

    const technicalPassed =
        technicalSeo?.passed ?? 0;

    const technicalTotal =
        technicalSeo?.total ?? 0;

    const technicalChecks =
        technicalSeo?.checks ?? [];

    const technicalStatusText =
        technicalSeo === null
            ? "Sin auditoría"
            : technicalPassed === technicalTotal
                ? "Checks correctos"
                : `${technicalTotal -
                technicalPassed
                } problema(s) detectado(s)`;

    const baselineDate =
        formatDate(report.baseline.checkedAt);

    const latestDate =
        formatDate(report.latest.checkedAt);

    const keywordSummaries =
        report.keywordSummaries ?? [];

    const coverageText =
        report.latest.resultsReviewed != null
            ? `${report.latest.resultsReviewed} resultados únicos revisados`
            : "Sin cobertura registrada";

    const pagesText =
        report.latest.pagesReviewed != null
            ? `${report.latest.pagesReviewed} páginas con resultados`
            : "Sin páginas registradas";

    const readingText =
        report.latest.status === "success"
            ? "El sitio oficial fue encontrado en los resultados orgánicos."
            : report.latest.status === "not_found"
                ? "El sitio oficial no apareció en los resultados consultados."
                : "No hay una medición válida disponible.";

    const attemptWarning =
        report.latestAttempt?.status === "error" ||
            report.latestAttempt?.status === "blocked"
            ? `Último intento sin medición válida: ${formatDate(report.latestAttempt.checkedAt)
            }. Se muestra la última medición válida disponible.`
            : "";

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    />

    <title>
        ${report.siteName} - SEO Monitor
    </title>

    <style>
        * {
            box-sizing: border-box;
        }

        :root {
            --text: #292524;
            --muted: #746b66;

            --glass:
                rgba(255, 255, 255, 0.58);

            --border:
                rgba(255, 255, 255, 0.70);

            --success:
                #26734d;

            --warning:
                #a46b18;

            --shadow:
                0 18px 60px
                rgba(61, 42, 31, 0.08);
        }

        html {
            min-height: 100%;
        }

        body {
            margin: 0;

            min-height: 100vh;

            color:
                var(--text);

            font-family:
                Inter,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;

            background:
                radial-gradient(
                    circle at 15% 10%,
                    rgba(
                        205,
                        182,
                        230,
                        0.34
                    ),
                    transparent 33%
                ),
                radial-gradient(
                    circle at 88% 16%,
                    rgba(
                        175,
                        218,
                        224,
                        0.28
                    ),
                    transparent 30%
                ),
                radial-gradient(
                    circle at 65% 85%,
                    rgba(
                        236,
                        199,
                        187,
                        0.32
                    ),
                    transparent 34%
                ),
                linear-gradient(
                    135deg,
                    #f7f3ef,
                    #f3eff3 48%,
                    #eef3f3
                );

            background-attachment:
                fixed;
        }

        body::before {
            content: "";

            position:
                fixed;

            inset: 0;

            pointer-events:
                none;

            background:
                linear-gradient(
                    115deg,
                    transparent 20%,
                    rgba(
                        255,
                        255,
                        255,
                        0.25
                    ) 45%,
                    transparent 70%
                );

            opacity:
                0.75;
        }

        .container {
            position:
                relative;

            z-index: 1;

            max-width:
                1180px;

            margin:
                0 auto;

            padding:
                54px 26px 70px;
        }

        .hero {
            position:
                relative;

            padding:
                28px 30px;

            margin-bottom:
                22px;

            overflow:
                hidden;

            border-radius:
                26px;

            background:
                rgba(
                    255,
                    255,
                    255,
                    0.42
                );

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.75
                );

            backdrop-filter:
                blur(24px)
                saturate(150%);

            -webkit-backdrop-filter:
                blur(24px)
                saturate(150%);

            box-shadow:
                var(--shadow),
                inset 0 1px 0
                rgba(
                    255,
                    255,
                    255,
                    0.85
                );
        }

        .hero > * {
            position:
                relative;

            z-index: 1;
        }

        .hero::after {
            content: "";

            position:
                absolute;

            z-index: 0;

            width:
                260px;

            height:
                260px;

            right:
                8%;

            top:
                -150px;

            border-radius:
                50%;

            background:
                rgba(
                    196,
                    177,
                    230,
                    0.22
                );

            filter:
                blur(35px);

            pointer-events:
                none;
        }

        .eyebrow {
            text-transform:
                uppercase;

            letter-spacing:
                0.18em;

            font-size:
                11px;

            font-weight:
                750;

            color:
                #816f7f;
        }

        h1 {
            margin:
                9px 0 7px;

            font-size:
                clamp(
                    31px,
                    5vw,
                    47px
                );

            line-height:
                1.05;

            letter-spacing:
                -0.035em;
        }

        .subtitle {
            margin:
                0;

            color:
                var(--muted);

            font-size:
                15px;
        }

        .grid {
            display:
                grid;

            grid-template-columns:
                repeat(
                    4,
                    minmax(0, 1fr)
                );

            gap:
                16px;

            margin-bottom:
                28px;
        }

        .summary-grid {
            grid-template-columns:
                repeat(
                    4,
                    minmax(0, 1fr)
                );
        }

        .comparison-grid {
            grid-template-columns:
                repeat(
                    4,
                    minmax(0, 1fr)
                );
        }

        .card {
            position:
                relative;

            overflow:
                hidden;

            padding:
                23px;

            border-radius:
                22px;

            background:
                var(--glass);

            border:
                1px solid
                var(--border);

            backdrop-filter:
                blur(22px)
                saturate(145%);

            -webkit-backdrop-filter:
                blur(22px)
                saturate(145%);

            box-shadow:
                var(--shadow),
                inset 0 1px 0
                rgba(
                    255,
                    255,
                    255,
                    0.8
                );
        }

        .card > * {
            position:
                relative;

            z-index: 2;
        }

        .card::before {
            content: "";

            position:
                absolute;

            z-index: 0;

            inset: 0;

            pointer-events:
                none;

            background:
                linear-gradient(
                    145deg,
                    rgba(
                        255,
                        255,
                        255,
                        0.32
                    ),
                    transparent 42%
                );
        }

        .card::after {
            content: "";

            position:
                absolute;

            z-index: 1;

            inset:
                1px;

            border-radius:
                inherit;

            pointer-events:
                none;

            background:
                linear-gradient(
                    120deg,
                    rgba(
                        255,
                        255,
                        255,
                        0.42
                    ),
                    transparent 32%,
                    transparent 68%,
                    rgba(
                        188,
                        213,
                        235,
                        0.12
                    )
                );

            opacity:
                0.55;
        }

        .label {
            font-size:
                12px;

            font-weight:
                650;

            text-transform:
                uppercase;

            letter-spacing:
                0.06em;

            color:
                #837873;

            margin-bottom:
                10px;
        }

        .metric {
            font-size:
                32px;

            font-weight:
                750;

            line-height:
                1.1;

            letter-spacing:
                -0.035em;

            margin-bottom:
                8px;
        }

        .status-ok {
            color:
                var(--success);
        }

        .status-warning {
            color:
                var(--warning);
        }

        .status-muted {
            color:
                #6d6763;
        }

        .details {
            font-size:
                14px;

            color:
                #655d58;

            line-height:
                1.75;
        }

        .section-title {
            margin:
                34px 3px 14px;

            font-size:
                21px;

            letter-spacing:
                -0.025em;
        }

        .keyword {
            font-size:
                22px;

            font-weight:
                730;

            letter-spacing:
                -0.025em;

            margin-bottom:
                17px;
        }

        .serp-layout {
            display:
                grid;

            grid-template-columns:
                1.4fr 0.8fr;

            gap:
                16px;
        }

        .data-grid {
            display:
                grid;

            grid-template-columns:
                repeat(
                    2,
                    minmax(0, 1fr)
                );

            gap:
                13px 22px;

            margin-top:
                18px;
        }

        .datum {
            padding-top:
                12px;

            border-top:
                1px solid
                rgba(
                    97,
                    82,
                    73,
                    0.10
                );
        }

        .datum-name {
            font-size:
                11px;

            text-transform:
                uppercase;

            letter-spacing:
                0.07em;

            color:
                #8c817b;

            margin-bottom:
                4px;
        }

        .datum-value {
            font-size:
                14px;

            font-weight:
                620;
        }

        .check-list {
            list-style:
                none;

            padding:
                0;

            margin:
                0;

            display:
                grid;

            grid-template-columns:
                repeat(
                    4,
                    minmax(0, 1fr)
                );

            gap:
                12px;
        }

        .check-list li {
            padding:
                15px 16px;

            border-radius:
                16px;

            background:
                rgba(
                    255,
                    255,
                    255,
                    0.50
                );

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.72
                );

            backdrop-filter:
                blur(18px);

            -webkit-backdrop-filter:
                blur(18px);

            box-shadow:
                0 10px 30px
                rgba(
                    65,
                    48,
                    38,
                    0.04
                );

            font-size:
                13px;
        }

        .check {
            display:
                inline-flex;

            align-items:
                center;

            justify-content:
                center;

            width:
                21px;

            height:
                21px;

            margin-right:
                8px;

            border-radius:
                50%;

            background:
                rgba(
                    38,
                    115,
                    77,
                    0.11
                );

            color:
                var(--success);

            font-weight:
                800;
        }

        .badge {
            display:
                inline-flex;

            align-items:
                center;

            gap:
                7px;

            padding:
                6px 10px;

            border-radius:
                999px;

            background:
                rgba(
                    164,
                    107,
                    24,
                    0.09
                );

            color:
                #926119;

            font-size:
                12px;

            font-weight:
                650;

            margin-bottom:
                14px;
        }

        .dot {
            width:
                7px;

            height:
                7px;

            border-radius:
                50%;

            background:
                currentColor;
        }

        .comparison-grid .card {
            display:
                flex;

            flex-direction:
                column;
        }

        .comparison-grid .label {
            min-height:
                18px;
        }

        .comparison-grid .metric {
            min-height:
                42px;

            display:
                flex;

            align-items:
                center;

            margin-bottom:
                8px;
        }

        .comparison-grid .details {
            min-height:
                66px;

            margin-top:
                0;
        }

        .keyword-table {
    width: 100%;
    border-collapse: collapse;
}

.keyword-table th,
.keyword-table td {
    padding:
        15px 14px;

    text-align:
        left;

    border-bottom:
        1px solid
        rgba(
            97,
            82,
            73,
            0.10
        );
}

.keyword-table th {
    font-size:
        11px;

    text-transform:
        uppercase;

    letter-spacing:
        0.07em;

    color:
        #8c817b;

    font-weight:
        650;
}

.keyword-table td {
    font-size:
        14px;

    color:
        #514a46;
}

.keyword-table tr:last-child td {
    border-bottom:
        none;
}

.keyword-name {
    font-weight:
        650;

    color:
        var(--text);
}

.keyword-position {
    font-weight:
        750;

    font-size:
        16px;
}

.keyword-status {
    display:
        inline-flex;

    padding:
        5px 9px;

    border-radius:
        999px;

    background:
        rgba(
            164,
            107,
            24,
            0.09
        );

    color:
        #926119;

    font-size:
        12px;

    font-weight:
        650;
}

.keyword-status.found {
    background:
        rgba(
            38,
            115,
            77,
            0.11
        );

    color:
        var(--success);
}

.table-wrapper {
    overflow-x:
        auto;
}

        .footer {
            margin-top:
                42px;

            padding-top:
                18px;

            border-top:
                1px solid
                rgba(
                    88,
                    73,
                    64,
                    0.12
                );

            font-size:
                11px;

            color:
                #8a817c;

            display:
                flex;

            justify-content:
                space-between;

            gap:
                20px;
        }

        @media (
            max-width: 900px
        ) {
            .summary-grid,
            .comparison-grid {
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
            }

            .check-list {
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
            }

            .serp-layout {
                grid-template-columns:
                    1fr;
            }
        }

        @media (
            max-width: 560px
        ) {
            .container {
                padding:
                    28px 16px 44px;
            }

            .hero {
                padding:
                    23px 20px;
            }

            .summary-grid,
            .comparison-grid,
            .check-list,
            .data-grid {
                grid-template-columns:
                    1fr;
            }

            .metric {
                font-size:
                    31px;
            }

            .footer {
                flex-direction:
                    column;
            }
        }

        .keyword-history {
    margin-top: 10px;
    font-weight: 400;
    font-size: 13px;
}

.keyword-history summary {
    cursor: pointer;
    font-weight: 600;
}

.keyword-history ol {
    margin: 12px 0 0;
    padding-left: 20px;
}

.keyword-history li {
    margin-bottom: 12px;
}

.keyword-history time {
    opacity: 0.75;
}    

    </style>
</head>

<body>
<main class="container">

    <section class="hero">

        <div class="eyebrow">
            SEO Monitor
        </div>

        <h1>
            ${report.siteName}
        </h1>

        <p class="subtitle">
            Seguimiento técnico,
            indexabilidad y visibilidad
            orgánica
        </p>
        
        ${attemptWarning
            ? `<p class="details status-warning">${attemptWarning}</p>`
            : ""}
    </section>

    <section class="grid summary-grid">

        <div class="card">

            <div class="label">
                SEO técnico
            </div>

            <div class="metric ${technicalSeo !== null &&
            technicalPassed === technicalTotal
            ? "status-ok"
            : "status-warning"
        }">
                ${technicalPassed} / ${technicalTotal}
            </div>

            <div class="details">
                ${technicalStatusText}
            </div>

        </div>

        <div class="card">

            <div class="label">
                Posición orgánica
            </div>

            <div class="metric ${report.latest.status === "success"
            ? "status-ok"
            : "status-warning"
        }">
                ${latestPosition}
            </div>

            <div class="details">
                ${latestStatus}
            </div>

        </div>

        <div class="card">

    <div class="label">
        Histórico
    </div>

    <div class="metric">
        ${report.change.measurableMeasurements}
    </div>

    <div class="details">
        Mediciones válidas
        <br />
        ${report.change.totalMeasurements} totales
    </div>

</div>

        <div class="card">

            <div class="label">
                Cambio
            </div>

            <div class="metric status-muted">
                ${positionChange}
            </div>

            <div class="details">
                Baseline vs actual
            </div>

        </div>

    </section>

    <h2 class="section-title">
        Visibilidad en Google
    </h2>

    <section class="serp-layout">

        <div class="card">

            <div class="badge">
                <span class="dot"></span>

                Google Organic · SerpApi
            </div>

            <div class="keyword">
                ${report.keyword}
            </div>

            <div class="data-grid">

                <div class="datum">

                    <div class="datum-name">
                        Estado
                    </div>

                    <div class="datum-value">
                        ${latestStatus}
                    </div>

                </div>

                <div class="datum">

                    <div class="datum-name">
                        Posición
                    </div>

                    <div class="datum-value">
                        ${report.latest.position !== null
            ? `#${report.latest.position}`
            : "No encontrada"
        }
                    </div>

                </div>

                <div class="datum">

                    <div class="datum-name">
                        Cobertura
                    </div>

                    <div class="datum-value">
                        ${coverageText}
                    </div>

                </div>

                <div class="datum">

                    <div class="datum-name">
                        Dispositivo
                    </div>

                    <div class="datum-value">
                        Mobile
                    </div>

                </div>

                <div class="datum">

                    <div class="datum-name">
                        Ubicación
                    </div>

                    <div class="datum-value">
                        Guanajuato, Gto., México
                    </div>

                </div>

                <div class="datum">

                    <div class="datum-name">
                        Última medición
                    </div>

                    <div class="datum-value">
                        ${latestDate}
                    </div>

                </div>

            </div>

        </div>

        <div class="card">

            <div class="label">
                Lectura actual
            </div>

            <div class="metric ${report.latest.status === "success"
            ? "status-ok"
            : "status-warning"
        }">
                ${report.latest.status === "success"
            ? `#${report.latest.position}`
            : "Sin ranking"
        }
            </div>

            <div class="details">
                ${readingText}
            </div>

        </div>

    </section>

    <h2 class="section-title">
    Keywords monitoreadas
</h2>

<div class="card table-wrapper">

    <table class="keyword-table">

        <thead>
            <tr>
                <th>
                    Keyword
                </th>

                <th>
                    Baseline
                </th>

                <th>
                    Actual
                </th>

                <th>
                    Cambio
                </th>

                <th>
                    Estado
                </th>

                <th>
                    Mediciones
                </th>
            </tr>
        </thead>

        <tbody>

            ${keywordSummaries
            .map(
                (summary) => {
                    const baseline =
                        summary.baseline
                            .position !== null
                            ? `#${summary.baseline.position}`
                            : "Sin ranking";

                    const current =
                        summary.latest
                            .position !== null
                            ? `#${summary.latest.position}`
                            : "Sin ranking";

                    const change =
                        summary.positionChange === null
                            ? "—"
                            : summary.positionChange > 0
                                ? `+${summary.positionChange}`
                                : String(
                                    summary.positionChange
                                );

                    const found =
                        summary.latest
                            .status === "success";

                    const status =
                        found
                            ? "Encontrado"
                            : summary.latest
                                .status === "not_found"
                                ? "No encontrado"
                                : "Sin dato";

                    const failedAttempt =
                        summary.latestAttempt?.status === "error" ||
                        summary.latestAttempt?.status === "blocked";

                    const history = summary.history ?? [];

                    const historyHtml = history.length === 0
                        ? ""
                        : `
                            <details class="keyword-history">
                                <summary>
                                    Ver historial (${history.length})
                                </summary>
                                <ol>
                                    ${history.map((measurement) => {
                            const statusText =
                                measurement.status === "success"
                                    ? "Encontrado"
                                    : measurement.status === "not_found"
                                        ? "No encontrado en resultados consultados"
                                        : measurement.status === "blocked"
                                            ? "Medición bloqueada"
                                            : "Error de medición";

                            const positionText =
                                measurement.status === "success" &&
                                    measurement.position !== null
                                    ? ` · #${measurement.position}`
                                    : "";

                            return `
                                            <li>
                                                <time datetime="${escapeHtml(measurement.checkedAt)}">
                                                    ${escapeHtml(formatDate(measurement.checkedAt))}
                                                </time>
                                                <div>
                                                    ${statusText}${positionText}
                                                </div>
                                            </li>
                                        `;
                        }).join("")}
                                </ol>
                            </details>
                        `;

                    return `
                                <tr>

                                    <td class="keyword-name">
    ${escapeHtml(summary.query)}
    ${historyHtml}
</td>

                                    <td>
                                        ${baseline}
                                    </td>

                                    <td class="keyword-position">
                                        ${current}
                                    </td>

                                    <td>
                                        ${change}
                                    </td>

                                    <td>
                                        <span class="keyword-status ${found
                            ? "found"
                            : ""
                        }">
                                            ${status}
                                        </span>
                                        ${failedAttempt
                            ? `<div class="details">
        Último intento sin medición válida<br />
        ${formatDate(summary.latestAttempt!.checkedAt)}
       </div>`
                            : ""}
                                    </td>

                                    <td>
                                        ${summary.measurableMeasurements}
                                        /
                                        ${summary.totalMeasurements}
                                    </td>

                                </tr>
                            `;
                }
            )
            .join("")
        }

        </tbody>

    </table>

</div>


    <h2 class="section-title">
        Estado técnico
    </h2>

    <ul class="check-list">
        ${technicalChecks.length > 0
            ? technicalChecks
                .map(
                    (check) => `
                            <li>

                                <span class="check">
                                    ${check.passed
                            ? "✓"
                            : "!"
                        }
                                </span>

                                ${check.label}

                            </li>
                        `
                )
                .join("")
            : `
                    <li>
                        Sin auditoría técnica disponible
                    </li>
                `
        }
    </ul>

    <h2 class="section-title">
        Baseline vs actual
    </h2>

    <section class="grid comparison-grid">

        <div class="card">

            <div class="label">
                Baseline
            </div>

            <div class="metric">
                ${baselinePosition}
            </div>

            <div class="details">
                ${baselineDescription}
                <br />

                ${baselineDate}
            </div>

        </div>

        <div class="card">

            <div class="label">
                Estado actual
            </div>

            <div class="metric">
                ${latestPosition}
            </div>

            <div class="details">
                ${latestStatus}
                <br />

                ${latestDate}
            </div>

        </div>

        <div class="card">

            <div class="label">
                Resultados revisados
            </div>

            <div class="metric">
                ${report.latest.resultsReviewed ?? "N/A"}
            </div>

            <div class="details">
                ${pagesText}
            </div>

        </div>

        <div class="card">

            <div class="label">
                Mercado
            </div>

            <div class="metric">
                MX
            </div>

            <div class="details">
                Español · Mobile
            </div>

        </div>

    </section>

    <footer class="footer">

        <div>
            SEO Monitor · ${report.siteId}
        </div>

        <div>
            Actualización:
            ${latestDate}
        </div>

    </footer>

</main>
</body>
</html>
`;
}
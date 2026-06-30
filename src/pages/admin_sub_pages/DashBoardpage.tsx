/// --- Core libraries --- ///
import { useEffect, useMemo, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

/// --- Type hints --- ///
import type { AllEmissionsResponse, Emission } from "../../types/DashBoard";

/// --- Internal libraries --- ///
import { getUserEmissions, getAllEmissions } from "../../api/DashBoard";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const MONTH_LABELS: string[] = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const TARGET_YEAR: number = new Date().getFullYear();

/**
 * Groups emissions rows by month (0-11) for TARGET_YEAR, summing
 * `emissions` per month. Months with no data — including any month
 * later than the current real-world month — are returned as `null`
 * so Chart.js renders an empty/no-bar gap instead of a false zero.
 */
function buildMonthlyEmissions(rows: Emission[]): (number | null)[] {
    const monthlyTotals: number[] = new Array(12).fill(0);
    const monthlyHasData: boolean[] = new Array(12).fill(false);

    for (const row of rows) {
        const date = new Date(row.timestamp);

        if (date.getFullYear() !== TARGET_YEAR) {
            continue;
        }

        const monthIndex = date.getMonth(); // 0 = Jan, 6 = Jul, etc.
        monthlyTotals[monthIndex] += row.emissions ?? 0;
        monthlyHasData[monthIndex] = true;
    }

    // NOTE:
    // A month with zero rows becomes `null` (not 0) so the chart visibly
    // shows "no data" rather than implying zero emissions were recorded.
    // This also naturally covers future months (e.g. Aug 2026 onward,
    // and therefore render as null automatically, no extra date check needed.
    return monthlyTotals.map((total, i) => (monthlyHasData[i] ? total : null));
}

export default function DashboardPage() {
    const [userEmissions, setUserEmissions] = useState<AllEmissionsResponse | null>(null);
    const [allEmissions, setAllEmissions] = useState<AllEmissionsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async (): Promise<void> => {
        setLoading(true);

        const [userRes, allRes] = await Promise.all([
            getUserEmissions(),
            getAllEmissions(),
        ]);

        setUserEmissions(userRes);
        setAllEmissions(allRes);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ─────────────────────────────────────────────
    // DATA ARRAYS
    // ─────────────────────────────────────────────
    const userRows = userEmissions?.result ?? [];
    const allRows = allEmissions?.result ?? [];

    // ─────────────────────────────────────────────
    // KPI CALCULATIONS (USER LEVEL)
    // ─────────────────────────────────────────────
    const totalUserEmissions = useMemo(
        () => userRows.reduce((sum, r) => sum + (r.emissions ?? 0), 0),
        [userRows]
    );

    const totalUserCpu = useMemo(
        () => userRows.reduce((sum, r) => sum + (r.cpu_power ?? 0), 0),
        [userRows]
    );

    const totalUserGpu = useMemo(
        () => userRows.reduce((sum, r) => sum + (r.gpu_power ?? 0), 0),
        [userRows]
    );

    // for future usage 
    const totalTokenUsage = 0;

    // ─────────────────────────────────────────────
    // GLOBAL KPI (ALL USERS)
    // ─────────────────────────────────────────────
    const totalEmissionsKg = useMemo(
        () => allRows.reduce((sum, r) => sum + (r.emissions ?? 0), 0),
        [allRows]
    );

    // ─────────────────────────────────────────────
    // MONTH-WISE EMISSIONS (ALL USERS, TARGET_YEAR)
    // ─────────────────────────────────────────────
    const monthlyEmissions = useMemo(
        () => buildMonthlyEmissions(allRows),
        [allRows]
    );

    const chartData = useMemo(
        () => ({
            labels: MONTH_LABELS,
            datasets: [
                {
                    label: `Total Emissions (kg CO₂) — ${TARGET_YEAR}`,
                    data: monthlyEmissions,
                    backgroundColor: "rgba(53, 162, 235, 0.6)",
                    borderRadius: 4,
                },
            ],
        }),
        [monthlyEmissions]
    );

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: `CoSMIC Emissions — ${TARGET_YEAR}`,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const value = context.raw;
                        return value === null
                            ? "No data"
                            : `${value.toFixed(8)} kg CO₂`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "kg CO₂",
                },
            },
        },
    };

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    return (
        <div>
            <h1>Dashboard</h1>

            {/* ── KPI ROW ───────────────────────────────────── */}
            <div className="flex gap-4 mb-6">

                <div className="flex-1 bg-gray-100 p-4 rounded-xl">
                    <p>Total Emissions</p>
                    <h2>{totalUserEmissions.toFixed(8)}</h2>
                </div>

                <div className="flex-1 bg-gray-100 p-4 rounded-xl">
                    <p>CPU Power</p>
                    <h2>{totalUserCpu.toFixed(2)}</h2>
                </div>

                <div className="flex-1 bg-gray-100 p-4 rounded-xl">
                    <p>GPU Power</p>
                    <h2>{totalUserGpu.toFixed(2)}</h2>
                </div>

                <div className="flex-1 bg-gray-100 p-4 rounded-xl">
                    <p>Token Usage</p>
                    <h2>{totalTokenUsage}</h2>
                </div>

            </div>

            {/* ── USER SECTION ───────────────────────────── */}
            <section>
                <h2>Your Emissions</h2>

                {!userEmissions || userEmissions.count === 0 ? (
                    <p>No emissions data for this user yet.</p>
                ) : (
                    <>
                        <p>Total records: {userEmissions.count}</p>

                        <ul>
                            {userRows.map((row) => (
                                <li key={row.id}>
                                    {/* <pre>{JSON.stringify(row, null, 2)}</pre> */}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </section>

            {/* Month-wise chart */}
            <section>

                {/* ── Month-wise chart ──────────────────────── */}
                <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200">
                    <Bar options={chartOptions} data={chartData} />
                </div>
            </section>
        </div>
    );
}
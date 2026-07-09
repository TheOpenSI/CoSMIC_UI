/// --- Core libraries --- ///
import { useEffect, useMemo, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

/// --- Type hints --- ///
import type {
    AllEmissionsResponse,
    Emission,
    MonthlyEmissionsStatsResponse,
} from "../../types/DashBoard";

/// --- Internal libraries --- ///
import { getUserEmissions, getMonthlyEmissionsStats } from "../../api/DashBoard";

//  chart js .
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);
// constants
const MONTH_LABELS: string[] = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type RangeOption = 3 | 6 | 12;
const RANGE_OPTIONS: RangeOption[] = [3, 6, 12];  // options for user to select rolling window for trend chart

// build monthly totals keyed by year-month for the rolling trend line chart with emissions data, e.g. { "2026-3": 12.34, "2026-4": 56.78 }
function buildMonthlyTotalsByYearMonth(rows: Emission[]): Map<string, number> {
    const totals = new Map<string, number>();

    for (const row of rows) {
        const date = new Date(row.timestamp);
        const key = `${date.getFullYear()}-${date.getMonth()}`; // e.g. "2026-3"
        totals.set(key, (totals.get(key) ?? 0) + (row.emissions ?? 0));
    }

    return totals;
}

// build range with respected to user selected options 
function getRollingYearMonths(range: RangeOption): { year: number; month: number }[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return Array.from({ length: range }, (_, i) => {
        const offset = range - 1 - i;
        const d = new Date(currentYear, currentMonth - offset, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
    });
}

//  condiiton to match the data of this year and last year to avoid duplicate data in chart and also matching what buildmonthlytotals and getrollingyearmonths returns in below function
function getRollingSeries(
    totalsByYearMonth: Map<string, number>,
    range: RangeOption
): { labels: string[]; data: (number | null)[] } {
    const yearMonths = getRollingYearMonths(range);
    const spansMultipleYears = new Set(yearMonths.map((ym) => ym.year)).size > 1;

    const labels = yearMonths.map(({ year, month }) =>
        spansMultipleYears
            ? `${MONTH_LABELS[month]} '${String(year).slice(2)}`
            : MONTH_LABELS[month]
    );

    const data = yearMonths.map(({ year, month }) => {
        const key = `${year}-${month}`;
        return totalsByYearMonth.has(key) ? totalsByYearMonth.get(key)! : null;
    });

    return { labels, data };
}

export default function DashboardPage() {
    const [userEmissions, setUserEmissions] = useState<AllEmissionsResponse | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyEmissionsStatsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [range, setRange] = useState<RangeOption>(3);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            setLoading(true);

            const [userRes, statsRes] = await Promise.all([
                getUserEmissions(),
                getMonthlyEmissionsStats(),
            ]);

            setUserEmissions(userRes);
            setMonthlyStats(statsRes);
            setLoading(false);
        };

        fetchData();
    }, []);

    const userRows = userEmissions?.result ?? [];
    const chartYear = monthlyStats?.year ?? new Date().getFullYear();
    const monthlyTotals = monthlyStats?.monthly_totals ?? [];

    // summary calculation for top boxes on dashboard page
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

    const totalTokenUsage = 0; // placeholder for future feature

    // memos for storing data temporary so not calculated on every render, only when userRows or range changes
    const userMonthlyTotals = useMemo(
        () => buildMonthlyTotalsByYearMonth(userRows),
        [userRows]
    );

    const { labels: rollingLabels, data: rollingUserData } = useMemo(
        () => getRollingSeries(userMonthlyTotals, range),
        [userMonthlyTotals, range]
    );
    // line chart and memo declaration

    const userLineChartData = useMemo(
        () => ({
            labels: rollingLabels,
            datasets: [
                {
                    label: "Your Emissions (kg CO₂)",
                    data: rollingUserData,
                    borderColor: "rgb(75, 192, 192)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    tension: 0.1,
                    spanGaps: false,
                },
            ],
        }),
        [rollingLabels, rollingUserData]
    );

    const userLineChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: "top" as const },
            title: { display: true, text: "Your Emissions Trend" },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const value = context.raw;
                        return value === null
                            ? "No data"
                            : `${Number(value).toFixed(8)} kg CO₂`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: "kg CO₂" },
            },
        },
    };

    // bar chart and memo declaration
    const yearlyBarChartData = useMemo(
        () => ({
            labels: MONTH_LABELS,
            datasets: [
                {
                    label: `Total Emissions (kg CO₂) — ${chartYear}`,
                    data: monthlyTotals,
                    backgroundColor: "rgba(53, 162, 235, 0.6)",
                    borderRadius: 4,
                },
            ],
        }),
        [chartYear, monthlyTotals]
    );

    const yearlyBarChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const },
            title: { display: true, text: `CoSMIC Emissions — ${chartYear}` },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const value = context.raw;
                        return value === null ? "No data" : `${value.toFixed(8)} kg CO₂`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: "kg CO₂" },
            },
        },
    };

    // user readable foramat conversion of emissions to mg 

    function formatEmissionsKg(kg: number): string {
    if (kg === 0) return "0 mg";
    const mg = kg * 1_000_000;
    return `${mg.toFixed(3)} mg`;
}

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    return (
        <div>
            <h1>Dashboard</h1>

            {/* {dashboard top stats } */}
            <div className="flex gap-4 mb-6">

                <div className="flex-1 bg-gray-100 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Your Total Emissions</p>
                    <h2 className="text-xl font-bold">{ formatEmissionsKg(totalUserEmissions) }</h2>
                    <p className="text-xs text-gray-400">{ totalUserEmissions > 0  ? `${totalUserEmissions.toExponential(2)} kg CO₂` : "—" }</p>
                </div>

                <div className="flex-1 bg-gray-100 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">CPU Power</p>
                    <h2 className="text-xl font-bold">{  totalUserCpu > 0 ? `${totalUserCpu.toFixed(2)} W` : "—" } </h2>
                    <p className="text-xs text-gray-400">total watts used</p>
                </div>

                <div className="flex-1 bg-gray-100 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">GPU Power</p>
                    <h2 className="text-xl font-bold">
                        {totalUserGpu > 0 ? `${totalUserGpu.toFixed(2)} W` : "—"}
                    </h2>
                    <p className="text-xs text-gray-400">total watts used</p>
                </div>

                <div className="flex-1 bg-gray-100 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Token Usage</p>
                    <h2 className="text-xl font-bold">{totalTokenUsage > 0 ? totalTokenUsage : "—"}</h2>
                    <p className="text-xs text-gray-400">total tokens used</p>
                </div>

            </div>

            {/* user section stats */}
            <section>
                {/* <h2>Your Emissions</h2>

                {!userEmissions || userEmissions.count === 0 ? (
                    <p>No emissions data for this user yet.</p>
                ) : (
                    <p>Total records: {userEmissions.count}</p>
                )} */}

                <div className="flex gap-2 mb-4 mt-2">
                    {RANGE_OPTIONS.map((val) => (
                        <button
                            key={val}
                            onClick={() => setRange(val)}
                            className={`px-3 py-1 rounded ${
                                range === val ? "bg-blue-500 text-white" : "bg-gray-200"
                            }`}
                        >
                            {val === 12 ? "1Y" : `${val}M`}
                        </button>
                    ))}
                </div>

                
                <div className="flex gap-4">
    
                    {/* User emissions line chart */}
                    <div className="w-1/2 h-[330px] bg-white p-4 rounded-xl border relative">
                        {userLineChartData.datasets[0].data.some((val) => val !== null && val !== 0) ? (
                            <Line options={userLineChartOptions} data={userLineChartData} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                                N/A — No data available
                            </div>
                        )}
                    </div>

                    {/* Token usage chart (placeholder) */}
                    <div className="w-1/2 h-[330px] bg-white p-4 rounded-xl border relative">
                       
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                                N/A — No data available
                            </div>
                        

                       
                    </div>

                </div>
            </section>

            {/* bar chart stats global */}
            <section className="mt-8">

                    <div className="w-full bg-white p-4 rounded-xl border h-[340px] overflow-hidden">
                        {yearlyBarChartData.datasets[0].data.some((val) => val !== null) ? (
                        <Bar options={yearlyBarChartOptions} data={yearlyBarChartData} />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                             N/A — No data available
                        </div>
                        )}
                    </div>
            </section>
        </div>
    );
}
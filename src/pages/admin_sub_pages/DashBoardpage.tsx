/// --- Core libraries --- ///
import { useEffect, useMemo, useRef, useState } from "react";
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
    MonthlyEmissionsStatsResponse,
    UserEmissionsSummaryResponse,
    UserEmissionsRollingResponse,
} from "../../types/DashBoard";

/// --- Internal libraries --- ///
import {
    getMonthlyEmissionsStats,
    getUserEmissionsSummary,
    getUserRollingStats,
} from "../../api/DashBoard";
import { useUserStore } from "../../stores/UserStore";

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
const RANGE_OPTIONS: RangeOption[] = [3, 6, 12];

export default function DashboardPage() {
    const selectedUser = useUserStore((state) => state.selectedUser);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyEmissionsStatsResponse | null>(null);
    const [userSummary, setUserSummary] = useState<UserEmissionsSummaryResponse | null>(null);
    const [userRolling, setUserRolling] = useState<UserEmissionsRollingResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [rollingLoading, setRollingLoading] = useState<boolean>(false);
    const [range, setRange] = useState<RangeOption>(3);
    const skipRangeFetch = useRef(true);

    useEffect(() => {
        const fetchDashboard = async (): Promise<void> => {
            setLoading(true);

            const [statsRes, summaryRes, rollingRes] = await Promise.all([
                getMonthlyEmissionsStats(),
                getUserEmissionsSummary(),
                getUserRollingStats(range),
            ]);

            setMonthlyStats(statsRes);
            setUserSummary(summaryRes);
            setUserRolling(rollingRes);
            setLoading(false);
        };

        fetchDashboard();
    }, [selectedUser?.id]);

    useEffect(() => {
        if (skipRangeFetch.current) {
            skipRangeFetch.current = false;
            return;
        }

        const fetchRolling = async (): Promise<void> => {
            setRollingLoading(true);

            try {
                const rollingRes = await getUserRollingStats(range);
                setUserRolling(rollingRes);
            } finally {
                setRollingLoading(false);
            }
        };

        fetchRolling();
    }, [range]);

    const chartYear = monthlyStats?.year ?? new Date().getFullYear();
    const monthlyTotals = monthlyStats?.monthly_totals ?? [];

    const totalUserEmissions = userSummary?.total_emissions ?? 0;
    const totalUserCpu = userSummary?.total_cpu_power ?? 0;
    const totalUserGpu = userSummary?.total_gpu_power ?? 0;
    const totalTokenUsage = 0;

    const rollingLabels = userRolling?.labels ?? [];
    const rollingUserData = userRolling?.totals ?? [];

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
        animation: {
            duration: 400,
        },
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

            <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-gray-100 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Your Total Emissions</p>
                    <h2 className="text-xl font-bold">{formatEmissionsKg(totalUserEmissions)}</h2>
                    <p className="text-xs text-gray-400">
                        {totalUserEmissions > 0
                            ? `${totalUserEmissions.toExponential(2)} kg CO₂`
                            : "—"}
                    </p>
                </div>

                <div className="flex-1 bg-gray-100 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">CPU Power</p>
                    <h2 className="text-xl font-bold">
                        {totalUserCpu > 0 ? `${totalUserCpu.toFixed(2)} W` : "—"}
                    </h2>
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
                    <h2 className="text-xl font-bold">
                        {totalTokenUsage > 0 ? totalTokenUsage : "—"}
                    </h2>
                    <p className="text-xs text-gray-400">total tokens used</p>
                </div>
            </div>

            <section>
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
                    <div
                        className={`w-1/2 h-[330px] bg-white p-4 rounded-xl border relative transition-opacity duration-200 ${
                            rollingLoading ? "opacity-60" : "opacity-100"
                        }`}
                    >
                        {userLineChartData.datasets[0].data.some(
                            (val) => val !== null && val !== 0
                        ) ? (
                            <Line options={userLineChartOptions} data={userLineChartData} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                                N/A — No data available
                            </div>
                        )}
                    </div>

                    <div className="w-1/2 h-[330px] bg-white p-4 rounded-xl border relative">
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                            N/A — No data available
                        </div>
                    </div>
                </div>
            </section>

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

/// --- Core libraries --- ///
import { useEffect, useMemo, useState } from "react";

/// --- Type hints --- ///
import type { AllEmissionsResponse } from "../../types/DashBoard";

/// --- Internal libraries --- ///
import { getUserEmissions, getAllEmissions } from "../../api/DashBoard";

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

    // placeholder (future feature)
    const totalTokenUsage = 0;

    // ─────────────────────────────────────────────
    // GLOBAL KPI (ALL USERS)
    // ─────────────────────────────────────────────
    const totalEmissionsKg = useMemo(
        () => allRows.reduce((sum, r) => sum + (r.emissions ?? 0), 0),
        [allRows]
    );

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

            {/* ── GLOBAL SECTION ───────────────────────────── */}
            <section>
                <h2>Total Emissions (All Users)</h2>
                <p>Total records: {allEmissions?.count ?? 0}</p>
                <p>Total CO₂: {totalEmissionsKg.toFixed(8)} kg</p>
            </section>
        </div>
    );
}
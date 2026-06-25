/// --- Core libraries --- ///
import { useEffect, useState } from "react";


/// --- Type hints --- ///
import type { AllEmissionsResponse } from "../../types/DashBoard";


/// --- Internal libraries --- ///
import { getUserEmissions, getAllEmissions } from "../../api/DashBoard";



export default function DashboardPage() {
    const [userEmissions, setUserEmissions] = useState<AllEmissionsResponse | null>(null);
    const [allEmissions, setAllEmissions] = useState<AllEmissionsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // NOTE:
    // Fetch logic lives directly in the page since this data is only ever
    // used here — no other component needs it, so a separate hook/store
    // file would just be unnecessary indirection for a one-off fetch.
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

        // optional: re-fetch every time selected user changes
    }, []);

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    // ── Total emissions across ALL users ───────────────────────────────────
    const totalEmissionsKg: number =
        allEmissions?.result.reduce((sum, row) => sum + row.emissions, 0) ?? 0;

    return (
        <div>
            <h1>Dashboard</h1>

            {/* ── Section 1: Selected user's emissions ────────────────── */}
            <section>
                <h2>Your Emissions</h2>
                {!userEmissions || userEmissions.count === 0 ? (
                    <p>No emissions data for this user yet.</p>
                ) : (
                    <> 
                    <p>Total records: {userEmissions?.count ?? 0}</p>
                    <ul>
                        {userEmissions.result.map((row) => (
                            <li key={row.id}>
                                {row.emissions.toFixed(8)} kg CO₂ — {row.timestamp}
                            </li>
                        ))}
                    </ul>
                    </>
                )}
            </section>

            {/* ── Section 2: Total emissions (all users) ──────────────── */}
            <section>
                <h2>Total Emissions (All Users)</h2>
                <p>Total records: {allEmissions?.count ?? 0}</p>
                <p>Total CO₂: {totalEmissionsKg.toFixed(8)} kg</p>
            </section>
        </div>
    );
}

/// --- Core libraries --- ///


/// --- Type hints --- ///
import type {
    ConfigPayload,
    ConfigResponse,
    ConfigUpdate
} from "../types/configs";
import type { CosmicUpdate } from "../types/cosmic";


/// --- Internal libraries --- ///
import { fetchWithAuth } from "./fetchWithAuth";



export async function getConfigSettings(): Promise<ConfigResponse> {
    return fetchWithAuth(
        `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/configs/`,
    );
}


export async function updateConfig(
    payload: ConfigPayload,
    id: string
): Promise<ConfigUpdate> {
    // Store modified configs via Configurations API first
    const config_res: ConfigUpdate = await fetchWithAuth(
        `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/configs/${id}`,
        {
            method: "PATCH",
            body: JSON.stringify(payload),
        },
    );


    // Then rebuild CoSMIC stated configs only if above API calls succeed
    if (config_res?.success) {
        const cosmic_res: CosmicUpdate = await fetchWithAuth(
            `${import.meta.env.VITE_API_BASE_URL}/api/v1/cosmic`,
            {
                method: "PATCH",
            },
        )

        console.debug(cosmic_res);
        return config_res;

    } else {
        return config_res;
    }
}

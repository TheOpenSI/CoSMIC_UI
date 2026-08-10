/// --- Core libraries --- ///
import { message } from "antd";


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
    const configRes: ConfigUpdate = await fetchWithAuth(
        `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/configs/${id}`,
        {
            method: "PATCH",
            body: JSON.stringify(payload),
        },
    );



    if (!configRes?.success) {
        // Not likely to happens but configs data not updated with `False` success value
        throw new Error("Update configs data failed");

    } else {
        // Then re-build CoSMIC stated configs only if above API calls succeed
        try {
            message.loading({
                content: "Updated configs data, re-building CoSMIC...",
                key: "configUpdate",
                duration: 0,
            })

            const cosmicRes: CosmicUpdate = await fetchWithAuth(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/cosmic`,
                {
                    method: "PATCH",
                },
            )

            console.debug(`CoSMIC response data: ${cosmicRes.message}`)
            return configRes;

        } catch (error) {
            // Modified configs data saved but CoSMIC re-build failed
            throw new Error("CoSMIC failed to re-build.");
        }
    }
}

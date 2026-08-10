export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // smanile: need to have token for authentication: will implement later on

  // const controller = new AbortController();
  // const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      ...options,
      // signal: controller.signal,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      let detail = `Request failed (HTTP ${response.status})`;
      try {
        const body = await response.json();
        detail = body?.detail || body?.message || detail;
      } catch {
        // response had no JSON body; keep the status-based message
      }
      throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
  //  finally {
  //   // clearTimeout(timeout);
  // }
}

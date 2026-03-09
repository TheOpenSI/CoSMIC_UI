export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // smanile: need to have token for authentication: will implement later on

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        //   Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

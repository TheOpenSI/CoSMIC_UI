export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // smanile: need to have token for authentication: will implement later on

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      //   Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

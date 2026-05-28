export async function uploadFile(
  file: File,
  userId: string,
  chatSessionId: string,
  memoryType: string = "session",
) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/memory/upload?user_id=${userId}&chat_session_id=${chatSessionId}&memory_type=${memoryType}`,
    { method: "POST", body: formData },
  );
  if (!response.ok) throw new Error("Upload failed");
  return await response.json();
}

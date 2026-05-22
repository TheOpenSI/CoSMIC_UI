export async function uploadFile(
  file: File,
  userId: string,
  chatSessionId: string,
) {
  const formData = new FormData();
  formData.append("file", file);
  return fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/upload?user_id=${userId}&chat_session_id=${chatSessionId}`,

    { method: "POST", body: formData },
  );
}

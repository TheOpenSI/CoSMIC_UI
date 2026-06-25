/// --- Internal libraries --- ///


/**
 * Upload a file to CoSMIC memory.
 *
 * The backend stores the file under the given memory tier and embeds it into
 * the vector database tagged with `user_id` / `chat_session_id`, so the chat
 * (which sends the same ids) can retrieve it for this session.
 */
export async function uploadFile(
  file: File,
  userId: string,
  chatSessionId: string,
  memoryType: string = "session",
) {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams({
    user_id: userId,
    chat_session_id: chatSessionId,
    memory_type: memoryType,
  });

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/memory/upload?${params.toString()}`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    let detail = "Upload failed";
    try {
      const error = await response.json();
      detail = error.detail || error.message || detail;
    } catch {
      detail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(detail);
  }

  return await response.json();
}

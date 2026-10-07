/// --- Core libraries --- ///
import { v7 as uuidv7 } from "uuid";


/// --- Type hints --- ///
import type {
	ChatHistory,
	ChatMessage,
} from "../types/chats";


export function mapToMessages(details: ChatHistory[]): ChatMessage[] {
	const messages: ChatMessage[] = [];

	details.forEach((item) => {
		// Render the user half first (extracting any attachment chip)
		if (item.user_query) {
			const match = item.user_query.match(/^<files>(.*?)<\/files>([\s\S]*)$/);
			let content = item.user_query;
			let fileName: string | undefined;

			if (match) {
				const ref = match[1].split(",")[0] ?? "";
				const underscore = ref.indexOf("_");
				fileName = underscore > -1 ? ref.slice(underscore + 1) : ref;
				content = match[2];
			}

			messages.push({
				id: uuidv7(),
				role: "user",
				content,
				fileName,
			});
		}

		// Then, we can render the assistant half for a complete inquiry cycle
		if (item.llm_response) {
			messages.push({
				id: uuidv7(),
				role: "assistant",
				content: item.llm_response,
			});
		}
	});

	return messages;
}

/// --- Core libraries --- ///
import {
	Button,
	Input,
	Spin,
} from "antd";
import {
	CirclePause,
	Orbit,
	Paperclip,
	FileText,
	Send,
	X,
} from "lucide-react";
import { v7 as uuidv7 } from "uuid";
import { BsPersonFill } from "react-icons/bs";
import dayjs from "dayjs";
import {
	useEffect,
	useRef,
	useState,
} from "react";
import ReactMarkdown from "react-markdown";
import {
	useNavigate,
	useParams,
} from "react-router-dom";
import {
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { LoadingOutlined } from "@ant-design/icons";


/// --- Type hints --- ///
import { USER_ROLE } from "../types/chats";
import type {
  	ChatHistoryDraft,
  	ChatMessage,
  	CosmicPayload,
} from "../types/chats";


/// --- Internal libraries --- ///
import {
  	createChatSession,
  	deleteChatSession,
  	getOneChatSession,
  	sendMessage,
} from "../api/chat";
import { uploadFile } from "../api/upload";
import { mapToMessages } from "../lib/mapToMessages";
import { useChatStore } from "../stores/ChatStore";
import { useUserStore } from "../stores/UserStore";


const { TextArea } = Input;

export default function ChatPage() {
  	const [
	  	message,
	  	setMessage,
  	] = useState("");
  	const [
	  	pendingFile,
	  	setPendingFile,
	] = useState<File | null>(null);

  	const fileInputRef			= useRef<HTMLInputElement | null>(null);
  	const abortControllerRef 	= useRef<AbortController | null>(null);

  	const { chatSessionId }	= useParams();
  	const navigate			= useNavigate();

  	const queryClient		= useQueryClient();
  	const chatKey			= chatSessionId ?? "new";
  	const { selectedUser }	= useUserStore();

  	const {
    	messagesByChat,
    	loadingByChat,
    	optimisticTitleByChat,
    	setMessages,
    	setLoading,
    	setOptimisticTitle,
    	resetChat,
  	} = useChatStore();

  	const messages			= messagesByChat[chatKey] ?? [];
  	const isLoading			= loadingByChat[chatKey] ?? false;
  	const optimisticTitle 	= optimisticTitleByChat[chatKey] ?? "";

  	const {
	  	data: currentChat,
	  	isLoading: isChatLoading,
  	} = useQuery({
    	queryKey: [
			"chat",
			chatSessionId,
		],
    	queryFn: () => getOneChatSession(chatSessionId!),
    	enabled: !!chatSessionId
  	});

	useEffect(
		() => {
			if (!currentChat) {setMessages(chatKey, []); return;}
			if (loadingByChat[chatKey]) return;

			const savedMessages = mapToMessages(currentChat.details);
			setOptimisticTitle(
				chatKey,
				"",
			);

			if (savedMessages.length > 0) {
				setMessages(
					chatKey,
					savedMessages,
				);
			}
		},
		[currentChat]
	);

  	const handleSend = async () => {
    	if (!message.trim()) return;

    	const userText 		= message.trim();
    	const attachedFile 	= pendingFile;

    	const controller 			= new AbortController();
    	abortControllerRef.current 	= controller;

    	const updatedHistory: ChatMessage[] = [
      		...messages,
      		{
        		id: uuidv7(),
        		role: "user",
        		content: userText,
        		fileName: attachedFile?.name,
      		},
    	];

		setMessages(
			chatKey,
			updatedHistory,
		);
    	setMessage("");
    	setLoading(
    		chatKey,
    		true,
    	);
    	setOptimisticTitle(
    		chatKey,
    		userText.slice(0, 40)
    	);

    	// Track a session created only to host an attachment, so it can be rolled
    	// back if the send fails.
    	let createdChatSessionId: string | null = null;

    	try {
      		const title =
        		messages.length === 0
          		? userText.slice(0, 40)
          		: currentChat?.name || "New chat";

			// TODO:
			// This's not a good approach at all. We've created a ticket to address this
			// method.

      		let currentChatSessionId 	= chatSessionId;
      		let finalUserText 			= userText;

      		// If a file is attached, upload it to session memory first, then prepend a
      		// <files> reference so the backend embeds/retrieves it for this session.
      		if (attachedFile && selectedUser?.id) {
      			// A session must exist before the file can be uploaded against it, so a
      			// brand-new chat is pre-created with an empty `details` list.
        		if (!currentChatSessionId) {
          			const created = await createChatSession(
          				title,
          				selectedUser.id
          			);
          			currentChatSessionId = created.created.id;
          			createdChatSessionId = currentChatSessionId;
        		}

        		const uploaded = await uploadFile(
          			attachedFile,
          			selectedUser.id,
          			currentChatSessionId,
          			"session",
          			controller.signal,
        		);

        		finalUserText = `<files>${uploaded.file_id}_${uploaded.file_name}</files>${userText}`;
        		setPendingFile(null);
      		}

      		// CoSMIC rebuilds the LLM context from the full history, so send every
      		// persisted block followed by user-only current cycle.
      		const currentChatHistoryBlock: ChatHistoryDraft = {
        		inquiry_cycle_id: 	uuidv7(),
        		user_role: 			USER_ROLE,
        		user_query: 		finalUserText,
        		query_create_on: 	new Date().toISOString(),
      		};
      		const details: CosmicPayload["details"] = [
        		...(currentChat?.details ?? []),
        		currentChatHistoryBlock,
      		];

      		const chat_session_data = await sendMessage(
				currentChatSessionId ?? null,
				title,
        		details,
        		controller.signal,
      		);

      		const assistantMessage: ChatMessage = {
        		id: uuidv7(),
        		role: "assistant",
        		content: chat_session_data.result,
      		};

      		const finalMessages = [
      			...updatedHistory,
      			assistantMessage,
      		];
      		setMessages(
      			chatKey,
      			finalMessages,
      		);
      		queryClient.invalidateQueries({ queryKey: ["allUsersAndChatSessions"] });

      		const finalChatSessionId = chat_session_data.chat_session_id;
      		if (!chatSessionId && finalChatSessionId) {
        		setMessages(
        			finalChatSessionId,
        			finalMessages,
        		);
        		setOptimisticTitle(
        			finalChatSessionId,
        			"",
        		);
        		navigate(
        			`/chat/${finalChatSessionId}`,
        			{ replace: true },
        		);
        		// The conversation now lives under the chat id so the next new chat starts clean
        		resetChat("new");
      		}

      		// Keep the persisted history authoritative for the next turn.
      		queryClient.invalidateQueries({ queryKey: ["chat", finalChatSessionId] });

    	} catch (err) {
      		if (err instanceof DOMException && err.name === "AbortError") {
        		setOptimisticTitle(
        			chatKey,
        			"",
        		);
        		setLoading(
        			chatKey,
        			false,
        		);
        		return;
    		}

      		// Roll back the empty session created for an attachment so it doesn't linger.
      		if (createdChatSessionId) {
        		try {
          			await deleteChatSession(createdChatSessionId);
          			queryClient.invalidateQueries({queryKey: ["allUsersAndChatSessions"]});

        		} catch {
          			// best-effort cleanup
        		}
      		}

      		const errorMessage: ChatMessage = {
        		id: uuidv7(),
        		role: "assistant",
        		content: err instanceof Error && err.message
            		? `Something went wrong: ${err.message}`
            		: "Something went wrong. Retry again.",
      		};

      		setMessages(
      			chatKey,
      			[
      				...updatedHistory,
      				errorMessage,
      			]
      		);

			console.error(err);
      		setOptimisticTitle(
      			chatKey,
      			"",
      		);

    	} finally {
      		setLoading(
      			chatKey,
      			false,
      		);
    	}
  	};

  	const handleStop = () => {
    	abortControllerRef.current?.abort();
    	setLoading(
    		chatKey,
    		false
    	);
    	setOptimisticTitle(
    		chatKey,
    		"",
    	);
  	};

	return (
    	<div className="h-screen w-full flex flex-col overflow-hidden">
    		{messages.length > 0 && (
    			<div className="flex items-center justify-between px-6 py-3">
    				<div className="flex items-center gap-2">
    					<span>{currentChat?.name || optimisticTitle || "New chat"}</span>
    				</div>
    			</div>
    		)}

    		<div className="flex-1 overflow-y-auto">
    			<div className="mx-auto w-full max-w-3xl px-4 py-6">
    				{isChatLoading ? (
    					<div className="min-h-[70vh] flex items-center justify-center">
    						<Spin
    							indicator={
    								<LoadingOutlined spin style={{ color: "#DBDCDF" }} />
    							}
    							size="small"
    						/>
    					</div>

    				) : messages.length === 0 ? (
    					<div className="min-h-[70vh] flex items-center justify-center">
    						<div className="text-5xl">Welcome {selectedUser?.name}</div>
    					</div>

    				) : (
    					<div className="flex gap-6 flex-col">
    						<span className="text-gray-400 text-sm flex justify-center">
    							{currentChat?.create_on
    								? dayjs(currentChat.create_on).format("D MMM YYYY")
    								: dayjs().format("D MMM YYYY")}
    						</span>

    						<div>
    							{messages.map((msg) => {
    								const isUser = msg.role === "user";
    								return (
    									<div key={msg.id} className="flex gap-2 mb-6">
    										{isUser ? (
    											<div className="flex gap-3 items-start">
    												<div className="bg-[#E6E7EB] rounded-full p-2 mt-1">
    													<BsPersonFill color="#6B7281" size={20} />
    												</div>

    												<div className="flex flex-col items-start gap-1">
    													{msg.fileName && (
    														<div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 shadow-sm">
    															<FileText  size={12} />
    															<span className="max-w-60 truncate">
    																{msg.fileName}
    															</span>
    														</div>
    													)}

    													<div className="mt-1 bg-[#0079FF] text-white px-4 py-2 rounded-2xl text-sm max-w-172">
    														{msg.content}
    													</div>
    												</div>
    											</div>

    										) : (
    											<div className="flex gap-3 items-start">
    												<div className="bg-black rounded-full p-1.5 mt-1 text-amber-50">
    													<Orbit size={22} />
    												</div>

    												<div className="mt-1 text-gray-800 px-1 py-2 text-sm max-w-172 prose prose-sm">
    													<ReactMarkdown>{msg.content ?? ""}</ReactMarkdown>
    												</div>
    											</div>
    										)}
    									</div>
    								);
    							})}

    							{isLoading && (
    								<div className="flex gap-3 items-start mb-6">
    									<Spin
    										indicator={
    											<LoadingOutlined spin style={{ color: "#DBDCDF" }} />
    										}
    										size="small"
    									/>
    									<span>Cosmic is thinking...</span>
    								</div>
    							)}
    						</div>
    					</div>
    				)}
    			</div>
    		</div>

    		<div className="mx-auto w-full max-w-3xl px-4 py-4">
    			{pendingFile && (
    				<div className="mb-2 inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm shadow-sm">
    					<span className="max-w-72 truncate">{pendingFile.name}</span>
    					<button
    						type="button"
    						className="cursor-pointer text-gray-400 hover:text-gray-700"
    						onClick={() => setPendingFile(null)}
    						aria-label="Remove file"
    					>
    						<X size={14} />
    					</button>
    				</div>
    			)}

    			<div className="bg-[#F0F5F9] rounded-2xl p-4 w-full max-w-3xl">
    				<TextArea
    					value={message}
    					onChange={(e) => setMessage(e.target.value)}
    					placeholder="How can I help you today..."
    					autoSize={{ minRows: 1, maxRows: 8 }}
    					variant="borderless"
    					styles={{ textarea: { padding: 0 } }}
    					onKeyDown={(e) => {
    						if (e.key === "Enter" && !e.shiftKey) {
    							e.preventDefault();
    							handleSend();
    						}
    					}}
    				/>

    				<div className="relative flex items-center mt-5">
    					<input
    						ref={fileInputRef}
    						type="file"
    						accept="application/pdf,.pdf"
    						className="hidden"
    						onChange={(e) => {
    							const file = e.target.files?.[0];
    							if (file) setPendingFile(file);
    							e.target.value = "";
    						}}
    					/>

    					<button
    						type="button"
    						className="cursor-pointer"
    						onClick={() => fileInputRef.current?.click()}
    						aria-label="Attach a PDF file"
    					>
    						<Paperclip size={18} />
    					</button>

    					<div className="absolute -right-2">
    						{isLoading ? (
    							<Button
    								danger
    								type="primary"
    								onClick={handleStop}
    								className="flex items-center justify-center gap-2"
    							>
    								Stop <CirclePause size={15} />
    							</Button>
    						) : (
    							<Button
    								type="primary"
    								onClick={handleSend}
    								className="flex items-center justify-center gap-2"
    							>
    								Send <Send size={15} />
    							</Button>
    						)}
    					</div>
    				</div>
    			</div>
    		</div>
    	</div>
    );
}

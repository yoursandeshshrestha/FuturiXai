import { Message } from "@/types/chat";
import { formatMessageTime } from "@/utils/chat";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-md px-3 md:px-4 py-2 rounded-2xl ${
          isOwn
            ? "bg-gray-800 text-white"
            : "bg-white text-black border border-gray-200"
        }`}
      >
        <p className="break-words text-sm md:text-base">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isOwn ? "text-gray-300" : "text-gray-400"
          }`}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

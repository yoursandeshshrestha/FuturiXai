import { useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { User, Message } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { MessageInput } from "./MessageInput";

interface ChatAreaProps {
  selectedUser: User;
  messages: Message[];
  currentUserId: string;
  isTyping: boolean;
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onBack: () => void;
}

export function ChatArea({
  selectedUser,
  messages,
  currentUserId,
  isTyping,
  newMessage,
  onMessageChange,
  onSendMessage,
  onBack,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Back to contacts"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-black truncate">
              {selectedUser.name || selectedUser.email}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 truncate">
              {selectedUser.email}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 bg-white">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        value={newMessage}
        onChange={onMessageChange}
        onSend={onSendMessage}
      />
    </>
  );
}

import Image from "next/image";
import { User } from "@/types/chat";
import { getUserInitial } from "@/utils/chat";

interface UserListItemProps {
  user: User;
  isSelected: boolean;
  isTyping: boolean;
  onClick: () => void;
}

export function UserListItem({
  user,
  isSelected,
  isTyping,
  onClick,
}: UserListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
        isSelected ? "bg-gray-50" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        {user.image ? (
          <Image
            width={48}
            height={48}
            src={user.image}
            alt={user.name || user.email}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white font-semibold text-lg">
            {getUserInitial(user)}
          </div>
        )}
        {user.unreadCount && user.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
            {user.unreadCount > 99 ? "99+" : user.unreadCount}
          </div>
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium text-black">{user.name || user.email}</p>
        {isTyping ? (
          <p className="text-sm text-blue-600 italic">typing...</p>
        ) : user.lastMessage ? (
          <p
            className={`text-sm truncate ${
              user.unreadCount && user.unreadCount > 0
                ? "text-black font-medium"
                : "text-gray-500"
            }`}
          >
            {user.lastMessage.isOwn && "You: "}
            {user.lastMessage.content}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">No messages yet</p>
        )}
      </div>
    </button>
  );
}

import { X } from "lucide-react";
import { User } from "@/types/chat";
import { UserListItem } from "./UserListItem";

interface SidebarProps {
  users: User[];
  selectedUser: User | null;
  typingUsers: Set<string>;
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export function Sidebar({
  users,
  selectedUser,
  typingUsers,
  isOpen,
  onClose,
  onSelectUser,
}: SidebarProps) {
  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    onClose();
  };

  return (
    <aside
      className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        top-0 lg:top-0 lg:inset-y-0
      `}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
        <h2 className="font-semibold text-black text-lg">Contacts</h2>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      <div>
        {users.map((user) => (
          <UserListItem
            key={user.id}
            user={user}
            isSelected={selectedUser?.id === user.id}
            isTyping={typingUsers.has(user.id)}
            onClick={() => handleSelectUser(user)}
          />
        ))}
      </div>
    </aside>
  );
}

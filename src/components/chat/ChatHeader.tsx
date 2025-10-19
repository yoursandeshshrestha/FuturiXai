import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { getUserInitial } from "@/utils/chat";

interface ChatHeaderProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ChatHeader({
  user,
  isSidebarOpen,
  onToggleSidebar,
}: ChatHeaderProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: "/auth/signin" });
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>

          {user.image && !imageError ? (
            <Image
              width={40}
              height={40}
              src={user.image}
              alt={user.name || user.email}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
              onError={() => {
                console.error("Failed to load user image:", user.image);
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-semibold text-sm md:text-base">
              {getUserInitial(user)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-black truncate">
              FuturixAI Chat
            </h1>
            <p className="text-xs md:text-sm text-gray-500 truncate hidden sm:block">
              {user.name || user.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="px-3 py-2 md:px-4 text-sm md:text-base bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSigningOut ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing Out...
            </>
          ) : (
            "Sign Out"
          )}
        </button>
      </div>
    </header>
  );
}

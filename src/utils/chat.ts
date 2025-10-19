import { User } from "@/types/chat";

export function sortUsersByLastMessage(users: User[]): User[] {
  return users.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0;
    const bTime = b.lastMessage?.createdAt
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0;
    return bTime - aTime;
  });
}

export function formatMessageTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getWebSocketUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api/ws`;
}

export function getUserInitial(user: {
  name: string | null;
  email: string;
}): string {
  return user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase();
}

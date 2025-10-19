export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  lastMessage?: {
    content: string;
    createdAt: string;
    isOwn: boolean;
  } | null;
  unreadCount?: number;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  read: boolean;
  createdAt: string;
  sender: User;
}

export interface WebSocketMessage {
  type: "auth" | "message" | "typing" | "auth_success";
  userId?: string;
  message?: Message;
  senderId?: string;
  content?: string;
  receiverId?: string;
}

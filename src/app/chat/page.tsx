"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Message } from "@/types/chat";
import { sortUsersByLastMessage } from "@/utils/chat";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useTypingIndicator, useTypingUsers } from "@/hooks/useTypingIndicator";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { EmptyState } from "@/components/chat/EmptyState";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { typingUsers, addTypingUser } = useTypingUsers();

  // WebSocket connection
  const { sendMessage: wsSendMessage, sendTypingIndicator } = useWebSocket({
    userId: session?.user?.id,
    selectedUser,
    onMessage: (message) => {
      // Only add message to current conversation if it belongs to the selected user
      if (
        selectedUser &&
        (message.senderId === selectedUser.id ||
          message.receiverId === selectedUser.id)
      ) {
        setMessages((prev) => {
          // Check if this message is replacing a temp message
          const hasTempMessage = prev.some((m) => m.id.startsWith("temp-"));

          if (hasTempMessage && message.senderId === session?.user?.id) {
            // Replace the last temp message with the real one
            const withoutTemp = prev.filter((m) => !m.id.startsWith("temp-"));
            return [...withoutTemp, message];
          }

          // Check for duplicates by ID
          const isDuplicate = prev.some((m) => m.id === message.id);
          if (isDuplicate) {
            return prev;
          }

          return [...prev, message];
        });
      }

      // Update last message and unread count in users list
      setUsers((prev) => {
        const updatedUsers = prev.map((user) => {
          if (user.id === message.senderId || user.id === message.receiverId) {
            const isReceived = message.senderId !== session?.user?.id;
            return {
              ...user,
              lastMessage: {
                content: message.content,
                createdAt: message.createdAt,
                isOwn: message.senderId === session?.user?.id,
              },
              unreadCount:
                isReceived && (!selectedUser || selectedUser.id !== user.id)
                  ? (user.unreadCount || 0) + 1
                  : user.unreadCount,
            };
          }
          return user;
        });

        return sortUsersByLastMessage(updatedUsers);
      });
    },
    onTyping: (senderId) => {
      addTypingUser(senderId);
    },
  });

  // Typing indicator hook
  const { handleTyping, clearTyping } = useTypingIndicator(() => {
    if (selectedUser) {
      sendTypingIndicator(selectedUser.id);
    }
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch users
  useEffect(() => {
    if (session?.user) {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((err) => console.error("Error fetching users:", err));
    }
  }, [session]);

  // Fetch messages when user is selected
  useEffect(() => {
    if (selectedUser && session?.user) {
      // Fetch messages
      fetch(`/api/messages?otherUserId=${selectedUser.id}`)
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch((err) => console.error("Error fetching messages:", err));

      // Mark all messages as read
      fetch("/api/messages/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otherUserId: selectedUser.id,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log(`Marked ${data.markedAsRead} messages as read`);
          }
        })
        .catch((err) => console.error("Error marking messages as read:", err));

      // Reset unread count in UI
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id
            ? { ...user, unreadCount: undefined }
            : user
        )
      );
    }
  }, [selectedUser, session]);

  const handleMessageChange = (value: string) => {
    setNewMessage(value);
    handleTyping(value);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !session?.user) return;

    clearTyping();
    const messageContent = newMessage;

    // Create a temporary message object for immediate display
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      senderId: session.user.id,
      receiverId: selectedUser.id,
      read: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: session.user.id,
        name: session.user.name || null,
        email: session.user.email,
        image: session.user.image || null,
      },
    };

    // Add message to current conversation immediately
    setMessages((prev) => [...prev, tempMessage]);

    // Send message via WebSocket
    wsSendMessage(messageContent, selectedUser.id);

    // Update last message in users list for sent message and sort
    setUsers((prev) => {
      const updatedUsers = prev.map((user) => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            lastMessage: {
              content: messageContent,
              createdAt: new Date().toISOString(),
              isOwn: true,
            },
          };
        }
        return user;
      });

      return sortUsersByLastMessage(updatedUsers);
    });

    setNewMessage("");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="h-screen flex flex-col bg-white">
      <ChatHeader
        user={{
          name: session.user.name || null,
          email: session.user.email,
          image: session.user.image || null,
        }}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          users={users.map((user) =>
            user.id === selectedUser?.id
              ? { ...user, unreadCount: 0 }
              : user
          )}
          selectedUser={selectedUser}
          typingUsers={
            new Set(
              Array.from(typingUsers).filter(
                (userId) => userId !== selectedUser?.id
              )
            )
          }
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectUser={setSelectedUser}
        />

        <main className="flex-1 flex flex-col w-full lg:w-auto">
          {selectedUser ? (
            <ChatArea
              selectedUser={selectedUser}
              messages={messages}
              currentUserId={session.user.id}
              isTyping={typingUsers.has(selectedUser.id)}
              newMessage={newMessage}
              onMessageChange={handleMessageChange}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedUser(null)}
            />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}

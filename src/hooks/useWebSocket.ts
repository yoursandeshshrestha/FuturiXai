import { useEffect, useState } from "react";
import { User, Message, WebSocketMessage } from "@/types/chat";
import { getWebSocketUrl } from "@/utils/chat";

interface UseWebSocketProps {
  userId: string | undefined;
  selectedUser: User | null;
  onMessage: (message: Message) => void;
  onTyping: (senderId: string) => void;
}

export function useWebSocket({
  userId,
  onMessage,
  onTyping,
}: UseWebSocketProps) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const wsUrl = getWebSocketUrl();
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      websocket.send(
        JSON.stringify({
          type: "auth",
          userId,
        })
      );
    };

    websocket.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);

      if (data.type === "message" && data.message) {
        onMessage(data.message);
      } else if (data.type === "auth_success") {
        console.log("WebSocket authenticated");
      } else if (data.type === "typing" && data.senderId) {
        onTyping(data.senderId);
      }
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const sendMessage = (content: string, receiverId: string) => {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: "message",
        content,
        receiverId,
      })
    );
  };

  const sendTypingIndicator = (receiverId: string) => {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: "typing",
        receiverId,
      })
    );
  };

  return {
    ws,
    isConnected,
    sendMessage,
    sendTypingIndicator,
  };
}

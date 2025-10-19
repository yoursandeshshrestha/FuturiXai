import { useState, useRef, useEffect } from "react";

export function useTypingIndicator(sendTypingIndicator: () => void) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef<boolean>(false);

  const handleTyping = (value: string) => {
    // Send typing indicator immediately on first keystroke
    if (value.length > 0 && !isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingIndicator();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.length > 0) {
      // Send typing indicator every 800ms while typing
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator();
      }, 800);
    } else {
      // Reset typing state when input is cleared
      isTypingRef.current = false;
    }
  };

  const clearTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
  };

  useEffect(() => {
    return () => {
      clearTyping();
    };
  }, []);

  return {
    handleTyping,
    clearTyping,
  };
}

export function useTypingUsers() {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingRemovalTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const addTypingUser = (userId: string) => {
    setTypingUsers((prev) => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });

    // Clear existing timeout for this user
    const existingTimeout = typingRemovalTimeouts.current.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Remove user from typing after 1.5 seconds
    const timeout = setTimeout(() => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      typingRemovalTimeouts.current.delete(userId);
    }, 1500);

    typingRemovalTimeouts.current.set(userId, timeout);
  };

  useEffect(() => {
    const timeouts = typingRemovalTimeouts.current;
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  return {
    typingUsers,
    addTypingUser,
  };
}

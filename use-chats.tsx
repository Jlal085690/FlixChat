import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "./use-websocket";
import { useAuth } from "./use-auth";
import { Message, Chat, User, InsertMessage } from "@shared/schema";
import { useToast } from "./use-toast";

// Extended types with additional info
type ChatWithUnread = {
  chat: Chat;
  unreadCount: number;
};

type MessageWithSender = Message & {
  sender: User;
};

type TypingUser = {
  userId: number;
  chatId: number;
  timestamp: number;
};

type ChatsContextType = {
  chats: ChatWithUnread[] | undefined;
  isLoading: boolean;
  currentChat: Chat | null;
  currentChatMessages: MessageWithSender[] | undefined;
  currentChatMessagesLoading: boolean;
  setCurrentChat: (chat: Chat | null) => void;
  sendMessage: (content: string) => void;
  sendTypingIndicator: () => void;
  typingUsers: Map<number, TypingUser>;
};

const ChatsContext = createContext<ChatsContextType | null>(null);

export function ChatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { lastMessage, sendMessage: wsSendMessage } = useWebSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Maintain typing users state
  const typingUsersMap = new Map<number, TypingUser>();
  
  // Fetch all user chats
  const {
    data: chats,
    isLoading: isChatsLoading
  } = useQuery<ChatWithUnread[]>({
    queryKey: ["/api/chats"],
    enabled: !!user,
  });
  
  // Current selected chat state
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  
  // Fetch messages for current chat
  const {
    data: currentChatMessages,
    isLoading: currentChatMessagesLoading
  } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/chats", currentChat?.id, "messages"],
    enabled: !!currentChat,
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: InsertMessage) => {
      const res = await apiRequest(
        "POST", 
        `/api/chats/${message.chatId}/messages`, 
        { content: message.content }
      );
      return await res.json();
    },
    onSuccess: (newMessage) => {
      // Invalidate chat messages query to refresh
      queryClient.invalidateQueries({
        queryKey: ["/api/chats", newMessage.chatId, "messages"]
      });
    },
    onError: (error) => {
      toast({
        title: "فشل إرسال الرسالة",
        description: "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive",
      });
    }
  });
  
  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage || !user) return;
    
    switch (lastMessage.type) {
      case "new_message":
        // Update messages cache
        queryClient.invalidateQueries({
          queryKey: ["/api/chats", lastMessage.message.chatId, "messages"]
        });
        
        // Also refresh chats list to update unread count
        queryClient.invalidateQueries({
          queryKey: ["/api/chats"]
        });
        break;
        
      case "user_typing":
        // Update typing users if it's for current chat
        if (currentChat && lastMessage.chatId === currentChat.id) {
          const typingUser: TypingUser = {
            userId: lastMessage.userId,
            chatId: lastMessage.chatId,
            timestamp: Date.now()
          };
          
          typingUsersMap.set(lastMessage.userId, typingUser);
          
          // Auto-remove typing indicator after 3 seconds
          setTimeout(() => {
            const existingTyping = typingUsersMap.get(lastMessage.userId);
            if (existingTyping && existingTyping.timestamp === typingUser.timestamp) {
              typingUsersMap.delete(lastMessage.userId);
            }
          }, 3000);
        }
        break;
    }
  }, [lastMessage, user, queryClient, currentChat]);
  
  // Send a new message through WebSocket
  const sendMessage = (content: string) => {
    if (!currentChat || !user || !content.trim()) return;
    
    // Send through WebSocket for real-time display
    wsSendMessage({
      type: "message",
      chatId: currentChat.id,
      content
    });
    
    // Also send through REST API for persistence
    sendMessageMutation.mutate({
      chatId: currentChat.id,
      senderId: user.id,
      content
    });
  };
  
  // Send typing indicator
  const sendTypingIndicator = () => {
    if (!currentChat || !user) return;
    
    wsSendMessage({
      type: "typing",
      chatId: currentChat.id
    });
  };
  
  // Mark messages as read when opening a chat
  useEffect(() => {
    if (currentChat && user) {
      // Mark messages as read
      apiRequest(
        "POST", 
        `/api/chats/${currentChat.id}/read`, 
        {}
      ).then(() => {
        // Refresh chats to update unread count
        queryClient.invalidateQueries({
          queryKey: ["/api/chats"]
        });
      }).catch(console.error);
    }
  }, [currentChat, user, queryClient]);
  
  return (
    <ChatsContext.Provider
      value={{
        chats,
        isLoading: isChatsLoading,
        currentChat,
        currentChatMessages,
        currentChatMessagesLoading,
        setCurrentChat,
        sendMessage,
        sendTypingIndicator,
        typingUsers: typingUsersMap
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
}

export function useChats() {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error("useChats must be used within a ChatsProvider");
  }
  return context;
}

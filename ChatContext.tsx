import React, { createContext, useState, useContext, useEffect } from "react";
import { 
  Chat, Message, Story, Call, 
  WebSocketMessageType, User, UserStatus
} from "@shared/schema";
import { useAuth } from "./AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { addMessageHandler, sendMessage } from "@/lib/socket";
import { useQuery } from "@tanstack/react-query";

interface ChatContextProps {
  selectedChat: Chat | null;
  messages: Message[];
  stories: Story[];
  activeCall: Call | null;
  onlineUsers: Set<number>;
  setSelectedChat: (chat: Chat | null) => void;
  sendChatMessage: (content: string, attachmentUrl?: string) => Promise<void>;
  createNewChat: (type: string, participants: number[], name?: string, avatarUrl?: string) => Promise<Chat | null>;
  postStory: (content: string, mediaUrl?: string) => Promise<Story | null>;
  viewStory: (storyId: number) => Promise<void>;
  initiateCall: (receiverId: number, type: string, chatId?: number) => Promise<Call | null>;
  answerCall: (callId: number) => Promise<void>;
  declineCall: (callId: number) => Promise<void>;
  endCall: (callId: number) => Promise<void>;
}

const ChatContext = createContext<ChatContextProps>({
  selectedChat: null,
  messages: [],
  stories: [],
  activeCall: null,
  onlineUsers: new Set<number>(),
  setSelectedChat: () => {},
  sendChatMessage: async () => {},
  createNewChat: async () => null,
  postStory: async () => null,
  viewStory: async () => {},
  initiateCall: async () => null,
  answerCall: async () => {},
  declineCall: async () => {},
  endCall: async () => {},
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  // Fetch stories
  const { data: fetchedStories } = useQuery({
    queryKey: ['/api/stories'],
    enabled: !!user,
  });

  useEffect(() => {
    if (fetchedStories) {
      setStories(fetchedStories);
    }
  }, [fetchedStories]);

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (selectedChat && user) {
      apiRequest("GET", `/api/chats/${selectedChat.id}/messages`)
        .then(res => res.json())
        .then(data => {
          setMessages(data);
        })
        .catch(error => {
          console.error("Error fetching messages:", error);
        });
    } else {
      setMessages([]);
    }
  }, [selectedChat, user]);

  // Set up WebSocket message handlers
  useEffect(() => {
    if (!user) return;

    // Handle new messages
    const messageHandler = addMessageHandler(
      WebSocketMessageType.NEW_MESSAGE,
      (message: Message) => {
        if (selectedChat && message.chatId === selectedChat.id) {
          setMessages(prev => [...prev, message]);
        }
      }
    );

    // Handle new stories
    const storyHandler = addMessageHandler(
      WebSocketMessageType.NEW_STORY,
      (story: Story) => {
        setStories(prev => [story, ...prev]);
      }
    );

    // Handle user status changes
    const userStatusHandler = addMessageHandler(
      WebSocketMessageType.USER_STATUS,
      (data: { userId: number; status: UserStatus }) => {
        if (data.status === UserStatus.ONLINE) {
          setOnlineUsers(prev => new Set([...prev, data.userId]));
        } else {
          setOnlineUsers(prev => {
            const newSet = new Set([...prev]);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      }
    );

    // Handle call events
    const callInitiatedHandler = addMessageHandler(
      WebSocketMessageType.CALL_INITIATED,
      (call: Call) => {
        if (call.receiverId === user.id || call.callerId === user.id) {
          setActiveCall(call);
        }
      }
    );

    const callAnsweredHandler = addMessageHandler(
      WebSocketMessageType.CALL_ANSWERED,
      (call: Call) => {
        if (activeCall && activeCall.id === call.id) {
          setActiveCall(call);
        }
      }
    );

    const callDeclinedHandler = addMessageHandler(
      WebSocketMessageType.CALL_DECLINED,
      (call: Call) => {
        if (activeCall && activeCall.id === call.id) {
          setActiveCall(null);
        }
      }
    );

    const callEndedHandler = addMessageHandler(
      WebSocketMessageType.CALL_ENDED,
      (call: Call) => {
        if (activeCall && activeCall.id === call.id) {
          setActiveCall(null);
        }
      }
    );

    // Clean up handlers on unmount
    return () => {
      messageHandler();
      storyHandler();
      userStatusHandler();
      callInitiatedHandler();
      callAnsweredHandler();
      callDeclinedHandler();
      callEndedHandler();
    };
  }, [user, selectedChat, activeCall]);

  const sendChatMessage = async (content: string, attachmentUrl?: string) => {
    if (!selectedChat || !user) return;

    try {
      const message = {
        chatId: selectedChat.id,
        senderId: user.id,
        content,
        attachmentUrl
      };

      const response = await apiRequest("POST", `/api/chats/${selectedChat.id}/messages`, message);
      const newMessage = await response.json();
      
      setMessages(prev => [...prev, newMessage]);
      
      // No need to send WebSocket message here, the server will broadcast it
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const createNewChat = async (
    type: string, 
    participants: number[], 
    name?: string, 
    avatarUrl?: string
  ): Promise<Chat | null> => {
    if (!user) return null;

    try {
      const chatData = {
        type,
        name,
        avatarUrl,
        createdBy: user.id,
        participants
      };

      const response = await apiRequest("POST", "/api/chats", chatData);
      const newChat = await response.json();
      
      return newChat;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    }
  };

  const postStory = async (content: string, mediaUrl?: string): Promise<Story | null> => {
    if (!user) return null;

    try {
      const storyData = {
        content,
        mediaUrl
      };

      const response = await apiRequest("POST", "/api/stories", storyData);
      const newStory = await response.json();
      
      setStories(prev => [newStory, ...prev]);
      
      return newStory;
    } catch (error) {
      console.error("Error posting story:", error);
      return null;
    }
  };

  const viewStory = async (storyId: number): Promise<void> => {
    if (!user) return;

    try {
      await apiRequest("POST", `/api/stories/${storyId}/views`, {});
    } catch (error) {
      console.error("Error viewing story:", error);
    }
  };

  const initiateCall = async (receiverId: number, type: string, chatId?: number): Promise<Call | null> => {
    if (!user) return null;

    try {
      const callData = {
        receiverId,
        type,
        chatId
      };

      const response = await apiRequest("POST", "/api/calls", callData);
      const newCall = await response.json();
      
      setActiveCall(newCall);
      
      return newCall;
    } catch (error) {
      console.error("Error initiating call:", error);
      return null;
    }
  };

  const answerCall = async (callId: number): Promise<void> => {
    if (!user || !activeCall) return;

    try {
      const response = await apiRequest("PUT", `/api/calls/${callId}/answer`, {});
      const updatedCall = await response.json();
      
      setActiveCall(updatedCall);
    } catch (error) {
      console.error("Error answering call:", error);
    }
  };

  const declineCall = async (callId: number): Promise<void> => {
    if (!user || !activeCall) return;

    try {
      await apiRequest("PUT", `/api/calls/${callId}/decline`, {});
      setActiveCall(null);
    } catch (error) {
      console.error("Error declining call:", error);
    }
  };

  const endCall = async (callId: number): Promise<void> => {
    if (!user || !activeCall) return;

    try {
      await apiRequest("PUT", `/api/calls/${callId}/end`, {});
      setActiveCall(null);
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        messages,
        stories,
        activeCall,
        onlineUsers,
        setSelectedChat,
        sendChatMessage,
        createNewChat,
        postStory,
        viewStory,
        initiateCall,
        answerCall,
        declineCall,
        endCall,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

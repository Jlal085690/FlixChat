import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "@/contexts/ChatContext";
import ChatList from "@/components/ChatList";
import ChatArea from "@/components/ChatArea";
import { apiRequest } from "@/lib/queryClient";
import { Chat as ChatType } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export default function Chat() {
  const { selectedChat } = useChat();

  // Fetch chats
  const { data: chats, isLoading: isChatsLoading } = useQuery({
    queryKey: ['/api/chats'],
  });

  // This effect helps with first-time load to select a chat if none is selected
  useEffect(() => {
    if (!selectedChat && chats && chats.length > 0 && !isChatsLoading) {
      // Select the first chat
      const chatData = chats[0] as ChatType;
      
      // Prefetch messages for this chat
      queryClient.prefetchQuery({
        queryKey: [`/api/chats/${chatData.id}/messages`],
      });
    }
  }, [chats, selectedChat, isChatsLoading]);

  return (
    <div className="flex flex-grow h-full overflow-hidden">
      {/* Chat List */}
      <ChatList />
      
      {/* Chat Area */}
      <ChatArea />
    </div>
  );
}

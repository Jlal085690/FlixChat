import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "@/contexts/ChatContext";
import { Chat, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import UserAvatar from "./UserAvatar";
import StoriesList from "./StoriesList";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  lastMessage?: { content: string; sender?: string; time: Date };
  hasUnread?: boolean;
  unreadCount?: number;
  onClick: () => void;
}

function ChatItem({
  chat,
  isSelected,
  lastMessage,
  hasUnread = false,
  unreadCount = 0,
  onClick,
}: ChatItemProps) {
  // Get chat participants to show avatar, etc
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const { onlineUsers } = useChat();

  // Fetch participants
  useEffect(() => {
    if (chat.type === "private") {
      apiRequest("GET", `/api/chats/${chat.id}/participants`)
        .then((res) => res.json())
        .then((participants) => {
          // Find the other user (not the current user)
          const participantId = participants[0].userId;
          return apiRequest("GET", `/api/users/${participantId}`);
        })
        .then((res) => res.json())
        .then((user) => {
          setOtherUser(user);
        })
        .catch(console.error);
    }
  }, [chat]);

  return (
    <div
      className={`flex p-3 border-b border-border hover:bg-card cursor-pointer ${
        isSelected ? "bg-primary bg-opacity-50" : ""
      } ${hasUnread ? "bg-opacity-50 bg-primary" : ""}`}
      onClick={onClick}
    >
      <div className="relative ml-3">
        {chat.type === "private" && otherUser ? (
          <UserAvatar 
            user={otherUser} 
            showStatus={onlineUsers.has(otherUser.id)}
          />
        ) : (
          <div className="w-12 h-12 rounded-full overflow-hidden bg-primary flex items-center justify-center text-lg">
            <i className="fas fa-users"></i>
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-foreground">
            {chat.type === "private"
              ? otherUser?.fullName || "جار التحميل..."
              : chat.name || "مجموعة"}
          </h3>
          <div className="flex items-center">
            {lastMessage && (
              <span className="text-xs text-muted-foreground ml-2">
                {formatDistanceToNow(new Date(lastMessage.time), { 
                  locale: arSA,
                  addSuffix: true
                })}
              </span>
            )}
            {hasUnread && unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {lastMessage ? (
            <>
              {lastMessage.sender && <span className="font-medium">{lastMessage.sender}: </span>}
              {lastMessage.content}
            </>
          ) : (
            "لا توجد رسائل"
          )}
        </p>
      </div>
    </div>
  );
}

export default function ChatList() {
  const { selectedChat, setSelectedChat } = useChat();

  // Fetch user chats
  const { data: chats = [] } = useQuery({
    queryKey: ['/api/chats'],
  });

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-background border-l border-border overflow-y-auto">
      {/* Stories Section */}
      <StoriesList />
      
      {/* Chat List */}
      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            لا توجد محادثات. ابدأ محادثة جديدة!
          </div>
        ) : (
          (chats as Chat[]).map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChat?.id === chat.id}
              // Mock data for now - would be fetched in real app
              lastMessage={
                chat.id % 2 === 0
                  ? {
                      content: "مرحباً! كيف حالك اليوم؟",
                      time: new Date(Date.now() - Math.random() * 1000000000)
                    }
                  : {
                      content: "أرسلت لك الملفات المطلوبة",
                      sender: chat.id % 3 === 0 ? "أحمد" : undefined,
                      time: new Date(Date.now() - Math.random() * 1000000000)
                    }
              }
              hasUnread={chat.id % 3 === 0}
              unreadCount={chat.id % 3 === 0 ? Math.floor(Math.random() * 5) + 1 : 0}
              onClick={() => setSelectedChat(chat)}
            />
          ))
        )}
      </div>
    </div>
  );
}

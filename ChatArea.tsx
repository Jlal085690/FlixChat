import { useState, useRef, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Message, Chat, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import UserAvatar from "./UserAvatar";
import { apiRequest } from "@/lib/queryClient";

interface ChatHeaderProps {
  chat: Chat;
  onCallClick: () => void;
  onVideoClick: () => void;
  onInfoClick: () => void;
}

function ChatHeader({ chat, onCallClick, onVideoClick, onInfoClick }: ChatHeaderProps) {
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const { onlineUsers } = useChat();
  
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
    <div className="bg-card p-3 flex items-center justify-between border-b border-border">
      <div className="flex items-center">
        {chat.type === "private" && otherUser ? (
          <>
            <div className="w-10 h-10 rounded-full overflow-hidden ml-3">
              <UserAvatar user={otherUser} size="md" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{otherUser.fullName}</h3>
              <p className="text-xs text-muted-foreground">
                {onlineUsers.has(otherUser.id) ? "متصل الآن" : "غير متصل"}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full overflow-hidden ml-3 bg-primary flex items-center justify-center">
              <i className="fas fa-users text-primary-foreground"></i>
            </div>
            <div>
              <h3 className="font-medium text-foreground">{chat.name || "مجموعة"}</h3>
              <p className="text-xs text-muted-foreground">
                {chat.type === "group" ? "مجموعة" : "محادثة خاصة"}
              </p>
            </div>
          </>
        )}
      </div>
      <div className="flex space-x-reverse space-x-4">
        <Button variant="ghost" size="icon" onClick={onCallClick}>
          <i className="fas fa-phone-alt text-foreground"></i>
        </Button>
        <Button variant="ghost" size="icon" onClick={onVideoClick}>
          <i className="fas fa-video text-foreground"></i>
        </Button>
        <Button variant="ghost" size="icon" onClick={onInfoClick}>
          <i className="fas fa-info-circle text-foreground"></i>
        </Button>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  sender?: User;
}

function MessageBubble({ message, isMine, sender }: MessageBubbleProps) {
  return (
    <div className={`flex mb-4 ${isMine ? "flex-row-reverse" : ""}`}>
      {!isMine && (
        <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
          {sender ? (
            <UserAvatar user={sender} size="sm" />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs">?</span>
            </div>
          )}
        </div>
      )}
      <div>
        <div className={`${isMine ? "chat-message-sent" : "chat-message-received"} p-3 rounded-lg max-w-xs`}>
          {message.attachmentUrl && (
            <div className="mb-2 rounded-lg overflow-hidden">
              <img src={message.attachmentUrl} alt="مرفق" className="w-full h-auto" />
            </div>
          )}
          <p className="text-foreground">{message.content}</p>
        </div>
        <span className={`text-xs text-muted-foreground block mt-1 ${isMine ? "text-left" : "text-right"}`}>
          {format(new Date(message.createdAt), "p", { locale: arSA })}
        </span>
      </div>
    </div>
  );
}

interface DateSeparatorProps {
  date: Date;
}

function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="text-center mb-4">
      <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full">
        {format(date, "dd MMMM yyyy", { locale: arSA })}
      </span>
    </div>
  );
}

export default function ChatArea() {
  const { selectedChat, messages, sendChatMessage, initiateCall } = useChat();
  const { user } = useAuth();
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userMap, setUserMap] = useState<Map<number, User>>(new Map());

  // Ensure we have user objects for message senders for displaying avatars
  useEffect(() => {
    if (!selectedChat) return;

    // Create a Set of user IDs from messages
    const userIds = new Set<number>();
    messages.forEach((message) => {
      if (!userMap.has(message.senderId)) {
        userIds.add(message.senderId);
      }
    });

    // Fetch user details for each sender
    userIds.forEach((userId) => {
      apiRequest("GET", `/api/users/${userId}`)
        .then((res) => res.json())
        .then((userData) => {
          setUserMap((prev) => new Map(prev).set(userId, userData));
        })
        .catch(console.error);
    });
  }, [selectedChat, messages, userMap]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedChat) return;
    
    sendChatMessage(messageContent);
    setMessageContent("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCall = (video: boolean = false) => {
    if (!selectedChat || !user) return;
    
    // Get the other user's ID in a private chat
    apiRequest("GET", `/api/chats/${selectedChat.id}/participants`)
      .then((res) => res.json())
      .then((participants) => {
        const otherParticipant = participants.find((p: any) => p.userId !== user.id);
        if (otherParticipant) {
          initiateCall(otherParticipant.userId, video ? "video" : "audio", selectedChat.id);
        }
      })
      .catch(console.error);
  };

  // Group messages by date for date separators
  const messagesByDate: { [date: string]: Message[] } = {};
  messages.forEach((message) => {
    const date = format(new Date(message.createdAt), "yyyy-MM-dd");
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(message);
  });

  const sortedDates = Object.keys(messagesByDate).sort();

  // If no chat is selected, show empty state
  if (!selectedChat) {
    return (
      <div className="hidden md:flex md:flex-1 flex-col">
        <div id="empty-chat-state" className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl text-muted-foreground mb-4">
              <i className="far fa-comments"></i>
            </div>
            <h2 className="text-xl text-foreground mb-2">اختر محادثة للبدء</h2>
            <p className="text-muted-foreground">اضغط على إحدى المحادثات من القائمة للبدء في الدردشة</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader 
        chat={selectedChat} 
        onCallClick={() => handleCall(false)}
        onVideoClick={() => handleCall(true)}
        onInfoClick={() => {/* TODO: Show chat info */}}
      />

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-background">
        {sortedDates.map((date) => (
          <div key={date}>
            <DateSeparator date={new Date(date)} />
            {messagesByDate[date].map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMine={message.senderId === user?.id}
                sender={userMap.get(message.senderId)}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-card p-3 border-t border-border">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <i className="far fa-smile"></i>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <i className="fas fa-paperclip"></i>
          </Button>
          <Input
            type="text"
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-background text-foreground rounded-lg py-2 px-4 mx-2"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-secondary text-xl"
            onClick={handleSendMessage}
            disabled={!messageContent.trim()}
          >
            <i className="fas fa-paper-plane"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}

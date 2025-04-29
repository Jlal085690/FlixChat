import { useState, useEffect, useRef } from "react";
import { Chat, Message, User } from "@shared/schema";
import { AvatarName } from "@/components/ui/avatar-name";
import { ChatMessage } from "@/components/ui/chat-message";
import { MessageInput } from "./message-input";
import { VideoCall } from "@/components/video/video-call";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ChatAreaProps {
  chat: Chat;
  currentUser: User;
  messages: Message[];
  onSendMessage: (content: string, image?: string) => void;
}

export function ChatArea({ chat, currentUser, messages, onSendMessage }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [dateGroups, setDateGroups] = useState<Record<string, Message[]>>({});
  
  const isGroup = chat.type === "group";
  const partner = isGroup 
    ? null 
    : chat.participants.find(p => p.id !== currentUser.id);
  
  const chatName = isGroup ? chat.name : partner?.displayName || partner?.username;
  const status = isGroup ? `${chat.participants.length} عضو` : (partner?.status === "online" ? "متصل الآن" : "غير متصل");
  
  // Group messages by date
  useEffect(() => {
    const groups: Record<string, Message[]> = {};
    
    messages.forEach(message => {
      const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    setDateGroups(groups);
  }, [messages]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Format date header
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "اليوم";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "الأمس";
    } else {
      return format(date, 'EEEE d MMMM', { locale: ar });
    }
  };
  
  return (
    <div className="hidden md:flex md:flex-1 flex-col">
      {/* Chat Header */}
      <div className="bg-sidebar p-3 flex items-center justify-between border-b border-muted">
        <AvatarName
          src={partner?.avatar}
          name={chatName || ""}
          subtitle={status}
          status={partner?.status || undefined}
        />
        
        <div className="flex space-x-reverse space-x-4">
          <button className="text-sidebar-foreground" onClick={() => setIsCallActive(true)}>
            <i className="fas fa-phone-alt"></i>
          </button>
          <button className="text-sidebar-foreground" onClick={() => setIsCallActive(true)}>
            <i className="fas fa-video"></i>
          </button>
          <button className="text-sidebar-foreground">
            <i className="fas fa-info-circle"></i>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-background">
        {Object.keys(dateGroups).map(dateStr => (
          <div key={dateStr}>
            {/* Date Separator */}
            <div className="text-center mb-4">
              <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full">
                {formatDateHeader(dateStr)}
              </span>
            </div>
            
            {/* Messages for this date */}
            {dateGroups[dateStr].map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                isCurrentUser={message.sender.id === currentUser.id}
              />
            ))}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} />
      
      {/* Video Call Modal */}
      {isCallActive && (
        <VideoCall 
          user={partner || { 
            id: chat.id, 
            username: chat.name || "", 
            avatar: ""
          }} 
          onEnd={() => setIsCallActive(false)} 
        />
      )}
    </div>
  );
}

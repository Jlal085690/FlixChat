import { useEffect, useRef } from "react";
import { useChats } from "@/hooks/use-chats";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/chat/chat-message";
import ChatInput from "@/components/chat/chat-input";
import { ArrowRight, MoreVertical, Phone, Video } from "lucide-react";
import { useLocation } from "wouter";
import { useMediaQuery } from "@/hooks/use-mobile";

export default function ChatPage() {
  const { currentChat, currentChatMessages, currentChatMessagesLoading, setCurrentChat } = useChats();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChatMessages]);
  
  if (!currentChat) {
    // On mobile, redirect to home if no chat is selected
    if (isMobile) {
      setLocation("/");
    }
    
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">اختر محادثة لبدء الدردشة</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header */}
      <header className="bg-card p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setCurrentChat(null)}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-3">
            <div className="relative">
              {currentChat.isGroup ? (
                <div className="w-10 h-10 bg-primary/30 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 14C9.79086 14 8 12.2091 8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10C16 12.2091 14.2091 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              ) : (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={currentChat.avatar || ""} alt={currentChat.name || ""} />
                  <AvatarFallback className="bg-primary/30">
                    {currentChat.name ? currentChat.name.charAt(0) : ""}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card"></div>
            </div>
            <div>
              <h3 className="font-medium">{currentChat.name}</h3>
              <p className="text-xs text-muted-foreground">متصل الآن</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {currentChatMessagesLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentChatMessages && currentChatMessages.length > 0 ? (
          <>
            {/* Date Divider */}
            <div className="flex justify-center">
              <span className="text-xs bg-card text-muted-foreground px-3 py-1 rounded-full">اليوم</span>
            </div>
            
            {/* Messages */}
            {currentChatMessages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isCurrentUser={message.sender.id === user?.id}
              />
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p>لا توجد رسائل بعد</p>
              <p className="text-sm mt-2">ابدأ المحادثة بإرسال رسالة</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <ChatInput />
    </div>
  );
}

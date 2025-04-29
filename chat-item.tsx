import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chat } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { Users, CheckCheck, Check, Image, FileText, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatItemProps {
  chat: Chat;
  unreadCount: number;
  lastMessage?: string;
  lastMessageSender?: string;
  lastMessageType?: "text" | "image" | "file" | "audio" | "video";
  isDelivered?: boolean;
  isRead?: boolean;
  isTyping?: boolean;
  lastMessageTime?: Date;
  onClick: () => void;
  isActive?: boolean;
  isOnline?: boolean;
}

export default function ChatItem({
  chat,
  unreadCount,
  lastMessage = "",
  lastMessageSender,
  lastMessageType = "text",
  isDelivered = true,
  isRead = false,
  isTyping = false,
  lastMessageTime,
  onClick,
  isActive = false,
  isOnline = Math.random() > 0.5 // تحديد عشوائي للتجربة
}: ChatItemProps) {
  // Format the time in Arabic
  const formattedTime = lastMessageTime
    ? formatDistanceToNow(lastMessageTime, { addSuffix: true, locale: arSA })
    : "";
  
  // احصل على رمز نوع الرسالة
  const getMessageTypeIcon = () => {
    if (isTyping) return null;
    
    switch (lastMessageType) {
      case "image":
        return <Image className="h-4 w-4 ml-1 text-muted-foreground" />;
      case "file":
        return <FileText className="h-4 w-4 ml-1 text-muted-foreground" />;
      case "audio":
        return <Headphones className="h-4 w-4 ml-1 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-colors rounded-md",
        isActive && "bg-muted"
      )}
      onClick={onClick}
    >
      <div className="relative">
        {chat.type === "group" ? (
          <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center text-lg">
            <Users className="h-6 w-6" />
          </div>
        ) : (
          <Avatar className="w-12 h-12 border-2 border-background">
            <AvatarImage src={chat.avatarUrl || ""} alt={chat.name || ""} />
            <AvatarFallback className="bg-primary/30">
              {chat.name ? chat.name.charAt(0) : ""}
            </AvatarFallback>
          </Avatar>
        )}
        
        {/* نقطة الاتصال */}
        {isOnline && (
          <span className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className={cn(
            "font-medium truncate",
            unreadCount > 0 && "font-bold text-foreground"
          )}>
            {chat.name}
          </h3>
          {lastMessageTime && (
            <span className={cn(
              "text-xs shrink-0 mr-1",
              unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground"
            )}>
              {formattedTime}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center text-sm text-muted-foreground truncate flex-1">
            {isTyping ? (
              <span className="text-primary italic">يكتب الآن...</span>
            ) : (
              <>
                {/* أيقونة حالة الرسالة */}
                {isRead ? (
                  <CheckCheck className="h-3.5 w-3.5 ml-1 text-primary" />
                ) : isDelivered ? (
                  <Check className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                ) : null}
                
                {/* أيقونة نوع الرسالة */}
                {getMessageTypeIcon()}
                
                {/* اسم المرسل في المجموعات */}
                {chat.type === "group" && lastMessageSender && !isTyping && (
                  <span className="font-medium text-primary ml-1 truncate">
                    {lastMessageSender}:
                  </span>
                )}
                
                {/* محتوى الرسالة */}
                <span className="truncate">
                  {lastMessage || "لا توجد رسائل بعد"}
                </span>
              </>
            )}
          </div>
          
          {/* عدد الرسائل غير المقروءة */}
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs min-w-[1.5rem] h-6 flex items-center justify-center rounded-full shrink-0 mr-1">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

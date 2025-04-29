import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message & { sender: User };
  isCurrentUser: boolean;
}

export default function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const formattedTime = formatDistanceToNow(new Date(message.sentAt), {
    addSuffix: false,
    locale: arSA,
  });
  
  if (isCurrentUser) {
    return (
      <div className="flex items-end justify-end gap-2 max-w-[80%] mr-auto">
        <div>
          <div className="message-bubble-sent p-3 break-words">
            <p>{message.content}</p>
          </div>
          <div className="flex justify-end gap-1 items-center mt-1">
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
            {message.isRead ? (
              <CheckCheck className="h-3 w-3 text-accent" />
            ) : (
              <Check className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-end gap-2 max-w-[80%]">
      <Avatar className="w-8 h-8">
        <AvatarImage src={message.sender.avatar || ""} alt={message.sender.displayName} />
        <AvatarFallback className="bg-primary/30 text-xs">
          {message.sender.displayName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="message-bubble-received p-3 break-words">
          <p>{message.content}</p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
}

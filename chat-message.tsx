import { cn } from "@/lib/utils";
import { Message } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const formattedTime = format(new Date(message.createdAt), "h:mm a", { locale: ar });
  
  return (
    <div className={cn("flex mb-4", isCurrentUser ? "flex-row-reverse" : "")}>
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
          <img src={message.sender.avatar} alt={message.sender.username} className="w-full h-full object-cover" />
        </div>
      )}
      <div>
        <div
          className={cn(
            "p-3 rounded-lg max-w-xs",
            isCurrentUser ? "chat-message-sent" : "chat-message-received"
          )}
        >
          {message.image && (
            <div className="mb-2 rounded-lg overflow-hidden">
              <img src={message.image} alt="صورة" className="w-full h-auto" />
            </div>
          )}
          <p className="text-current">{message.content}</p>
        </div>
        <span className={cn("text-xs text-muted-foreground block mt-1", isCurrentUser ? "ml-2 text-left" : "text-right")}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
}

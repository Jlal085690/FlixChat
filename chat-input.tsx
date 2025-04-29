import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";
import { useChats } from "@/hooks/use-chats";

export default function ChatInput() {
  const { sendMessage, sendTypingIndicator } = useChats();
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Send typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    sendTypingIndicator();
    
    // Set timeout to clear typing state
    const timeout = setTimeout(() => {
      setTypingTimeout(null);
    }, 3000);
    
    setTypingTimeout(timeout);
  };
  
  return (
    <div className="bg-card p-3 flex items-center gap-2 border-t border-border">
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Paperclip className="h-5 w-5" />
      </Button>
      
      <div className="flex-1 bg-background rounded-full px-4 py-2 flex items-center">
        <Input
          ref={inputRef}
          type="text"
          placeholder="اكتب رسالة..."
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      
      <Button 
        size="icon" 
        className="rounded-full"
        onClick={handleSend}
        disabled={!message.trim()}
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}

import { useState, useRef } from "react";

interface MessageInputProps {
  onSendMessage: (content: string, image?: string) => void;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSend = () => {
    if (message.trim() || attachmentPreview) {
      onSendMessage(message, attachmentPreview || undefined);
      setMessage("");
      setAttachmentPreview(null);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleAttachment = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Only handle images for now
    if (!file.type.startsWith("image/")) {
      alert("فقط ملفات الصور مدعومة حاليًا");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachmentPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="bg-sidebar p-3 border-t border-muted">
      {attachmentPreview && (
        <div className="mb-2 relative">
          <img 
            src={attachmentPreview} 
            alt="المرفق" 
            className="h-20 rounded-lg object-contain"
          />
          <button 
            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
            onClick={() => setAttachmentPreview(null)}
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      )}
      
      <div className="flex items-center">
        <button className="text-muted-foreground ml-3">
          <i className="far fa-smile"></i>
        </button>
        <button className="text-muted-foreground ml-3" onClick={handleAttachment}>
          <i className="fas fa-paperclip"></i>
        </button>
        <input 
          type="text" 
          placeholder="اكتب رسالتك هنا..." 
          className="flex-1 bg-background text-foreground rounded-lg py-2 px-4 outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="text-primary mr-3 text-xl"
          onClick={handleSend}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
        
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
    </div>
  );
}

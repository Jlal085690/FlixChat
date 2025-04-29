import { useState } from "react";
import { useChats } from "@/hooks/use-chats";
import ChatItem from "./chat-item";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function ChatList() {
  const { chats, isLoading, setCurrentChat, currentChat } = useChats();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupAvatarUrl, setGroupAvatarUrl] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  
  // Create new chat handler
  const handleCreateChat = async () => {
    if (!newChatName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم للمحادثة",
        variant: "destructive",
      });
      return;
    }
    
    // التحقق من وجود وصف وصورة للمجموعة
    if (isGroup) {
      if (!groupDescription.trim()) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال وصف للمجموعة",
          variant: "destructive",
        });
        return;
      }
      
      if (!groupAvatarUrl.trim()) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال رابط صورة للمجموعة",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      setIsCreatingChat(true);
      
      const res = await apiRequest("POST", "/api/chats", {
        name: newChatName,
        isGroup,
        ownerId: user?.id,
        description: isGroup ? groupDescription : null,
        avatarUrl: isGroup ? groupAvatarUrl : null,
      });
      
      const newChat = await res.json();
      
      toast({
        title: "تم إنشاء المحادثة",
        description: `تم إنشاء ${isGroup ? "المجموعة" : "المحادثة"} بنجاح`,
      });
      
      // Reset form and close dialog
      setNewChatName("");
      setGroupDescription("");
      setGroupAvatarUrl("");
      setIsGroup(false);
      
      // Select the new chat
      setCurrentChat(newChat);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إنشاء المحادثة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChat(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="py-4 px-6 text-center text-muted-foreground">
        جاري تحميل المحادثات...
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 bg-background sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center">
          <div></div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>محادثة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Label htmlFor="isGroup" className="flex-1">محادثة جماعية</Label>
                  <Switch
                    id="isGroup"
                    checked={isGroup}
                    onCheckedChange={setIsGroup}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">{isGroup ? "اسم المجموعة" : "اسم المستخدم أو المحادثة"}</Label>
                  <Input
                    id="name"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    placeholder={isGroup ? "مجموعة العائلة، زملاء العمل..." : "اسم المستخدم..."}
                  />
                </div>

                {isGroup && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="groupDescription">وصف المجموعة</Label>
                      <Input
                        id="groupDescription"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        placeholder="وصف قصير عن هذه المجموعة..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="groupAvatar">صورة المجموعة</Label>
                      <Input
                        id="groupAvatar"
                        value={groupAvatarUrl}
                        onChange={(e) => setGroupAvatarUrl(e.target.value)}
                        placeholder="رابط صورة المجموعة..."
                      />
                    </div>
                  </>
                )}
                
                <Button 
                  className="w-full" 
                  onClick={handleCreateChat}
                  disabled={isCreatingChat || (isGroup && (!newChatName.trim() || !groupDescription.trim() || !groupAvatarUrl.trim()))}
                >
                  {isCreatingChat ? "جاري الإنشاء..." : "إنشاء محادثة"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats && chats.length > 0 ? (
          <div className="space-y-1 py-2 px-2">
            {chats.map((chatItem) => {
              // تحديد بعض البيانات العشوائية للتجربة
              const isTyping = Math.random() < 0.2;
              const messageTypes = ["text", "image", "file", "audio"];
              const lastMessageType = messageTypes[Math.floor(Math.random() * messageTypes.length)] as "text" | "image" | "file" | "audio";
              const senders = ["أحمد", "سارة", "محمد", "فاطمة"];
              const lastMessageSender = senders[Math.floor(Math.random() * senders.length)];
              const isRead = Math.random() > 0.5;
              const isDelivered = true;
              const messages = [
                "مرحباً، كيف حالك؟",
                "هل يمكننا مقابلتك غداً؟",
                "شكراً على المساعدة",
                "أرسلت لك الملف المطلوب",
                "متى موعد الاجتماع القادم؟"
              ];
              const lastMessage = isTyping ? "" : messages[Math.floor(Math.random() * messages.length)];
              
              return (
                <ChatItem
                  key={chatItem.chat.id}
                  chat={chatItem.chat}
                  unreadCount={chatItem.unreadCount}
                  lastMessage={lastMessage}
                  lastMessageSender={lastMessageSender}
                  lastMessageType={lastMessageType}
                  isTyping={isTyping}
                  isRead={isRead}
                  isDelivered={isDelivered}
                  lastMessageTime={new Date(Date.now() - Math.floor(Math.random() * 86400000))}
                  onClick={() => setCurrentChat(chatItem.chat)}
                  isActive={chatItem.chat.id === currentChat?.id}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>لا توجد محادثات بعد</p>
            <p className="text-sm mt-2">ابدأ محادثة جديدة باستخدام زر +</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Search, User, MessageSquare, CalendarDays, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useChats } from "@/hooks/use-chats";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// يستخدم هذا المكون للبحث المتقدم عن المستخدمين والمحادثات والرسائل
export function AdvancedSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [searchResults, setSearchResults] = useState<{
    users: any[];
    chats: any[];
    messages: any[];
  }>({ users: [], chats: [], messages: [] });
  const { setCurrentChat } = useChats();

  // استرجاع المستخدمين
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    enabled: isOpen && activeTab === "users",
  });

  // استرجاع المحادثات
  const { data: chats = [] } = useQuery({
    queryKey: ["/api/chats"],
    enabled: isOpen && activeTab === "chats",
  });

  // استرجاع الرسائل الأخيرة
  const { data: recentMessages = [] } = useQuery({
    queryKey: ["/api/messages/recent"],
    enabled: isOpen && activeTab === "messages",
  });

  // البحث عن المستخدمين
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      (user.fullName && user.fullName.toLowerCase().includes(query)) ||
      (user.bio && user.bio.toLowerCase().includes(query))
    );
  }).slice(0, 20); // عرض أول 20 نتيجة فقط

  // البحث عن المحادثات
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      chat.name?.toLowerCase().includes(query) ||
      (chat.lastMessage && chat.lastMessage.content.toLowerCase().includes(query))
    );
  }).slice(0, 20);

  // البحث عن الرسائل
  const filteredMessages = recentMessages.filter((message) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return message.content.toLowerCase().includes(query);
  }).slice(0, 20);

  // إغلاق البحث وتنظيف
  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  // فتح محادثة
  const openChat = (chatId) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
      handleClose();
    }
  };

  // نافذة البحث المتقدم
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Search className="h-5 w-5" />
          <span className="sr-only">بحث</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>بحث متقدم</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="البحث عن مستخدمين أو محادثات أو رسائل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-1 top-1.5 h-7 w-7 rounded-full"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="users">
              <User className="h-4 w-4 ml-2" />
              المستخدمين
            </TabsTrigger>
            <TabsTrigger value="chats">
              <MessageSquare className="h-4 w-4 ml-2" />
              المحادثات
            </TabsTrigger>
            <TabsTrigger value="messages">
              <CalendarDays className="h-4 w-4 ml-2" />
              الرسائل الأخيرة
            </TabsTrigger>
          </TabsList>
          
          {/* نتائج المستخدمين */}
          <TabsContent value="users" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px]">
              {filteredUsers.length > 0 ? (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => {
                        // إنشاء محادثة جديدة مع هذا المستخدم
                      }}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="mr-3 flex-1">
                        <div className="font-medium text-foreground">
                          {user.fullName || user.username}
                        </div>
                        {user.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                      {user.isOnline && (
                        <Badge variant="secondary" className="text-xs">متصل</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery ? "لا توجد نتائج" : "ابدأ البحث عن مستخدمين"}
                </p>
              )}
            </ScrollArea>
          </TabsContent>
          
          {/* نتائج المحادثات */}
          <TabsContent value="chats" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px]">
              {filteredChats.length > 0 ? (
                <div className="space-y-2">
                  {filteredChats.map((chat) => (
                    <div 
                      key={chat.id} 
                      className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => openChat(chat.id)}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="mr-3 flex-1">
                        <div className="font-medium text-foreground">
                          {chat.name || "محادثة مباشرة"}
                        </div>
                        {chat.lastMessage && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {chat.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">{chat.unreadCount}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery ? "لا توجد نتائج" : "ابدأ البحث عن محادثات"}
                </p>
              )}
            </ScrollArea>
          </TabsContent>
          
          {/* نتائج الرسائل */}
          <TabsContent value="messages" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px]">
              {filteredMessages.length > 0 ? (
                <div className="space-y-2">
                  {filteredMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className="p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => openChat(message.chatId)}
                    >
                      <div className="flex items-center mb-1">
                        <span className="text-xs text-muted-foreground">
                          {message.createdAt && format(new Date(message.createdAt), "dd MMM yyyy • HH:mm", { locale: ar })}
                        </span>
                        <Badge variant="outline" className="mr-auto text-xs">
                          {message.chatName || "محادثة"}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery ? "لا توجد نتائج" : "ابدأ البحث عن رسائل"}
                </p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
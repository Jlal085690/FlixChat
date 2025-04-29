import { useState, useEffect } from "react";
import { Bell, X, MessageSquare, User, Heart, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useChats } from "@/hooks/use-chats";

// أنواع الإشعارات المختلفة
type NotificationType = "message" | "friend" | "story" | "call" | "system";

// واجهة الإشعار
interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

// مكون الإشعارات
export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { setCurrentChat } = useChats();

  // محاكاة جلب الإشعارات من الخادم
  useEffect(() => {
    // في التطبيق الفعلي، هذه البيانات ستأتي من الخادم
    const mockNotifications: Notification[] = [
      {
        id: 1,
        type: "message",
        title: "رسالة جديدة",
        content: "أرسل لك أحمد: مرحبا، كيف حالك اليوم؟",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // منذ 5 دقائق
        read: false,
        sender: {
          id: 2,
          name: "أحمد محمد",
          avatar: "",
        },
      },
      {
        id: 2,
        type: "friend",
        title: "طلب صداقة",
        content: "أرسل لك سارة طلب صداقة",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // منذ 30 دقيقة
        read: false,
        sender: {
          id: 3,
          name: "سارة أحمد",
          avatar: "",
        },
      },
      {
        id: 3,
        type: "story",
        title: "قصة جديدة",
        content: "شارك محمد قصة جديدة",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // منذ ساعتين
        read: true,
        sender: {
          id: 4,
          name: "محمد علي",
          avatar: "",
        },
      },
      {
        id: 4,
        type: "call",
        title: "مكالمة فائتة",
        content: "لديك مكالمة فائتة من فاطمة",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // منذ 5 ساعات
        read: true,
        sender: {
          id: 5,
          name: "فاطمة محمد",
          avatar: "",
        },
      },
      {
        id: 5,
        type: "system",
        title: "تحديث النظام",
        content: "تم تحديث FlixChat إلى الإصدار الجديد، استمتع بالميزات الجديدة!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // منذ يوم
        read: false,
      },
    ];

    setNotifications(mockNotifications);
    
    // حساب عدد الإشعارات غير المقروءة
    const unread = mockNotifications.filter(notification => !notification.read).length;
    setUnreadCount(unread);
  }, []);

  // تحديد الإشعارات حسب التصفية النشطة
  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : notifications.filter(notification => !notification.read);

  // تحديد إشعار كمقروء
  const markAsRead = (id: number) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // تحديث عداد الإشعارات غير المقروءة
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // تحديد كل الإشعارات كمقروءة
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // معالجة النقر على إشعار
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // معالجة الإجراء حسب نوع الإشعار
    if (notification.type === "message" && notification.sender) {
      // افتح المحادثة مع المرسل
      // تحتاج إلى استبدال هذا بمنطق فعلي
      console.log(`فتح محادثة مع ${notification.sender.name}`);
    } else if (notification.type === "friend" && notification.sender) {
      // اعرض ملف تعريف المستخدم أو معالجة طلب الصداقة
      console.log(`عرض ملف تعريف ${notification.sender.name}`);
    } else if (notification.type === "story" && notification.sender) {
      // اعرض القصة
      console.log(`عرض قصة ${notification.sender.name}`);
    } else if (notification.type === "call" && notification.sender) {
      // عرض تفاصيل المكالمة أو معاودة الاتصال
      console.log(`الاتصال بـ ${notification.sender.name}`);
    } else if (notification.type === "system") {
      // معالجة إشعارات النظام
      console.log("عرض تفاصيل تحديث النظام");
    }
    
    // اختياري: إغلاق مركز الإشعارات بعد النقر
    // setIsOpen(false);
  };

  // أيقونة حسب نوع الإشعار
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "friend":
        return <User className="h-4 w-4 text-green-500" />;
      case "story":
        return <Eye className="h-4 w-4 text-purple-500" />;
      case "call":
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      case "system":
        return <Bell className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">إشعارات</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium text-foreground">الإشعارات</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={markAllAsRead}
            >
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "unread")}>
          <div className="border-b">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                جميع الإشعارات
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                غير مقروءة
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="mr-2 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="p-0">
            <ScrollArea className="h-[300px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">لا توجد إشعارات</p>
                </div>
              ) : (
                <div>
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b last:border-0 cursor-pointer hover:bg-muted flex items-start ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="mr-3 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-foreground">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {format(notification.timestamp, "dd MMM", { locale: ar })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notification.content}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="ml-2 h-2 w-2 rounded-full bg-primary"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="unread" className="p-0">
            <ScrollArea className="h-[300px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">لا توجد إشعارات غير مقروءة</p>
                </div>
              ) : (
                <div>
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 border-b last:border-0 cursor-pointer hover:bg-muted flex items-start bg-primary/5"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="mr-3 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-foreground">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {format(notification.timestamp, "dd MMM", { locale: ar })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notification.content}
                        </p>
                      </div>
                      <div className="ml-2 h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
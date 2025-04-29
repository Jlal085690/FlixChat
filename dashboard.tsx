import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { AlertTriangle, Bot, CheckCircle, MessageSquare, Phone, Server, UserPlus, Users, UsersRound } from "lucide-react";
import UserManagement from "./user-management";
import GroupManagement from "./group-management";
import BotStatistics from "./bot-stats";

type SystemStats = {
  userCount: number;
  chatCount: number;
  messageCount: number;
  storyCount: number;
  onlineUsers: number;
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState("statistics");
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/stats", undefined);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل تحميل الإحصائيات",
          variant: "destructive",
        });
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    const fetchUsers = async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/users", undefined);
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل تحميل قائمة المستخدمين",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchStats();
    fetchUsers();
  }, [toast]);
  
  const handleDeleteUser = async (userId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }
    
    try {
      await apiRequest("DELETE", `/api/admin/users/${userId}`, undefined);
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "تم الحذف",
        description: "تم حذف المستخدم بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف المستخدم",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary p-4 flex items-center justify-between shadow-md">
        <h2 className="text-xl font-bold text-primary-foreground">لوحة التحكم للمطور</h2>
        <div>
          <span className="bg-card px-3 py-1 rounded-full text-sm">المطور: جلال</span>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="bg-card flex justify-between p-1 overflow-x-auto border-b border-border">
          <TabsList className="bg-transparent w-full justify-start">
            <TabsTrigger value="statistics" className="flex-1">الإحصائيات</TabsTrigger>
            <TabsTrigger value="users" className="flex-1">المستخدمين</TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">المجموعات</TabsTrigger>
            <TabsTrigger value="bot" className="flex-1">بوت النظام</TabsTrigger>
            <TabsTrigger value="reports" className="flex-1">التقارير</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">الإعدادات</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="statistics" className="mt-0">
            {isLoadingStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse bg-card">
                    <CardContent className="p-6 h-24"></CardContent>
                  </Card>
                ))}
              </div>
            ) : stats ? (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg">المستخدمين</h3>
                        <Users className="text-accent h-6 w-6" />
                      </div>
                      <p className="text-3xl font-bold">{stats.userCount.toLocaleString('ar-SA')}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.onlineUsers.toLocaleString('ar-SA')} مستخدم متصل حالياً
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg">المجموعات</h3>
                        <UsersRound className="text-accent h-6 w-6" />
                      </div>
                      <p className="text-3xl font-bold">{stats.chatCount.toLocaleString('ar-SA')}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        المجموعات النشطة على النظام
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg">الرسائل</h3>
                        <MessageSquare className="text-accent h-6 w-6" />
                      </div>
                      <p className="text-3xl font-bold">
                        {(stats.messageCount / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        إجمالي الرسائل المتبادلة
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg">القصص</h3>
                        <Phone className="text-accent h-6 w-6" />
                      </div>
                      <p className="text-3xl font-bold">{stats.storyCount.toLocaleString('ar-SA')}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        القصص النشطة حالياً
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* System Status */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>حالة النظام</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">وحدة المعالجة المركزية</span>
                        <span className="text-sm text-accent">32%</span>
                      </div>
                      <Progress value={32} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">الذاكرة</span>
                        <span className="text-sm text-accent">58%</span>
                      </div>
                      <Progress value={58} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">مساحة التخزين</span>
                        <span className="text-sm text-accent">74%</span>
                      </div>
                      <Progress value={74} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">النطاق الترددي</span>
                        <span className="text-sm text-accent">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle>آخر النشاطات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center text-sm">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p>تم تسجيل <span className="text-accent">{Math.floor(stats.userCount * 0.01)}</span> مستخدم جديد في الساعة الماضية</p>
                        <p className="text-xs text-muted-foreground">منذ 45 دقيقة</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-destructive/30 rounded-full flex items-center justify-center text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p>تم الإبلاغ عن <span className="text-destructive">3</span> حسابات مشبوهة</p>
                        <p className="text-xs text-muted-foreground">منذ ساعتين</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center text-sm text-green-500">
                        <Server className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p>تم تحديث الخادم بنجاح</p>
                        <p className="text-xs text-muted-foreground">منذ 3 ساعات</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center text-sm">
                        <UsersRound className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p>تم إنشاء <span className="text-accent">{Math.floor(stats.chatCount * 0.05)}</span> مجموعة جديدة</p>
                        <p className="text-xs text-muted-foreground">منذ 5 ساعات</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                لا يمكن تحميل الإحصائيات. يرجى المحاولة مرة أخرى.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="users" className="mt-0">
            <div className="py-2">
              <UserManagement />
            </div>
          </TabsContent>
          
          <TabsContent value="groups" className="mt-0">
            <div className="py-2">
              <GroupManagement />
            </div>
          </TabsContent>
          
          <TabsContent value="bot" className="mt-0">
            <div className="py-2">
              <BotStatistics />
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-0">
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              سيتم إضافة نظام التقارير قريباً
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              سيتم إضافة إعدادات النظام قريباً
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

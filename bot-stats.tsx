import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Brain, Activity, Cpu, Users, Settings, MessageSquare, Clock, Check, X } from "lucide-react";

// نوع لإحصائيات البوت
type BotStats = {
  isActive: boolean;
  uptime: string;
  lastRestart: string;
  requestsProcessed: number;
  responsesGenerated: number;
  activeUsers: number;
  averageResponseTime: number;
  successRate: number;
  commandsCount: Record<string, number>;
  recentResponses: Array<{
    id: number;
    userId: number;
    username: string;
    request: string;
    response: string;
    timestamp: string;
    processingTime: number;
  }>;
};

// المكون الرئيسي لإحصائيات البوت
export default function BotStatistics() {
  const { toast } = useToast();
  const [botStats, setBotStats] = useState<BotStats | null>(null);
  const [botSettings, setBotSettings] = useState({
    isActive: true,
    autoRespond: true,
    learningMode: false,
    responseTemplate: "مرحباً {username}، أنا البوت المساعد للدردشة. {response}",
    maxResponseTime: 5,
    commandPrefix: "/",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customCommand, setCustomCommand] = useState({ command: "", response: "" });

  // جلب إحصائيات البوت
  useEffect(() => {
    const fetchBotStats = async () => {
      setIsLoading(true);
      try {
        // في الإصدار النهائي، هذا سيقوم بجلب البيانات من الخادم
        // const res = await apiRequest("GET", "/api/admin/bot/stats", undefined);
        // const data = await res.json();
        
        // بيانات تجريبية للعرض
        const demoData: BotStats = {
          isActive: true,
          uptime: "3 أيام 7 ساعات 22 دقيقة",
          lastRestart: "2025-04-26T10:15:00",
          requestsProcessed: 12578,
          responsesGenerated: 11942,
          activeUsers: 185,
          averageResponseTime: 1.2,
          successRate: 95,
          commandsCount: {
            "/help": 423,
            "/start": 852,
            "/info": 271,
            "/search": 573,
            "/settings": 189,
          },
          recentResponses: [
            {
              id: 1,
              userId: 3,
              username: "سارة أحمد",
              request: "كيف يمكنني إضافة مستخدمين جدد إلى المجموعة؟",
              response: "يمكنك إضافة مستخدمين جدد بالنقر على أيقونة + في زاوية المجموعة اليمنى العليا ثم اختيار 'إضافة عضو'.",
              timestamp: "2025-04-29T01:25:00",
              processingTime: 0.9,
            },
            {
              id: 2,
              userId: 2,
              username: "أحمد محمد",
              request: "/help",
              response: "مرحبًا بك في بوت المساعدة! إليك قائمة الأوامر المتاحة: /start, /help, /info, /search, /settings.",
              timestamp: "2025-04-29T01:15:22",
              processingTime: 0.7,
            },
            {
              id: 3,
              userId: 4,
              username: "محمد علي",
              request: "هل يمكنني إرسال ملفات كبيرة عبر المحادثة؟",
              response: "نعم، يمكنك إرسال ملفات حتى حجم 2 جيجابايت عبر المحادثة. فقط اضغط على زر المرفقات واختر الملف.",
              timestamp: "2025-04-29T01:05:30",
              processingTime: 1.1,
            },
          ],
        };
        
        setBotStats(demoData);
        setBotSettings({
          ...botSettings,
          isActive: demoData.isActive,
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل تحميل إحصائيات البوت",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBotStats();
  }, [toast]);

  // حفظ إعدادات البوت
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // في الإصدار النهائي، هذا سيقوم بإرسال البيانات إلى الخادم
      // await apiRequest("POST", "/api/admin/bot/settings", botSettings);
      
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات البوت بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حفظ إعدادات البوت",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // إعادة تشغيل البوت
  const handleRestartBot = async () => {
    try {
      // في الإصدار النهائي، هذا سيقوم بإرسال طلب إعادة تشغيل إلى الخادم
      // await apiRequest("POST", "/api/admin/bot/restart", undefined);
      
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "تمت إعادة التشغيل",
        description: "تمت إعادة تشغيل البوت بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إعادة تشغيل البوت",
        variant: "destructive",
      });
    }
  };

  // إضافة أمر مخصص
  const handleAddCommand = () => {
    if (!customCommand.command || !customCommand.response) {
      toast({
        title: "خطأ",
        description: "يرجى تعبئة الأمر والاستجابة",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "تمت الإضافة",
      description: `تمت إضافة الأمر ${customCommand.command} بنجاح`,
    });
    
    setCustomCommand({ command: "", response: "" });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-24"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">بوت النظام</h2>
            <p className="text-muted-foreground">إدارة بوت المساعدة والإحصائيات</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${botStats?.isActive ? "bg-green-500" : "bg-red-500"}`}></div>
            <span>{botStats?.isActive ? "نشط" : "غير نشط"}</span>
          </div>
          <Button variant="outline" onClick={handleRestartBot}>
            إعادة تشغيل البوت
          </Button>
        </div>
      </div>

      {/* معلومات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg">وقت التشغيل</h3>
              <Clock className="text-accent h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">{botStats?.uptime}</p>
            <p className="text-xs text-muted-foreground mt-1">
              آخر إعادة تشغيل: {new Date(botStats?.lastRestart || "").toLocaleString("ar-SA")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg">الاستجابات</h3>
              <Activity className="text-accent h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">{botStats?.responsesGenerated.toLocaleString("ar-SA")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              من أصل {botStats?.requestsProcessed.toLocaleString("ar-SA")} طلب
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg">المستخدمين النشطين</h3>
              <Users className="text-accent h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">{botStats?.activeUsers.toLocaleString("ar-SA")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              يتفاعلون مع البوت حالياً
            </p>
          </CardContent>
        </Card>
      </div>

      {/* الأداء والاستخدام */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                <span>مؤشرات الأداء</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>متوسط زمن الاستجابة</span>
              <span className="text-accent font-medium">{botStats?.averageResponseTime} ثانية</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span>معدل النجاح</span>
              <span className="text-accent font-medium">{botStats?.successRate}%</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span>سعة المعالجة اليومية</span>
              <span className="text-accent font-medium">~{Math.round((botStats?.requestsProcessed || 0) / 3)} طلب</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span>أكثر الأوامر استخداماً</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الأمر</TableHead>
                  <TableHead className="text-left">عدد الاستخدامات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {botStats && Object.entries(botStats.commandsCount)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([command, count]) => (
                    <TableRow key={command}>
                      <TableCell className="font-medium">{command}</TableCell>
                      <TableCell>{count.toLocaleString("ar-SA")}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* المحادثات الأخيرة */}
      <Card>
        <CardHeader>
          <CardTitle>آخر المحادثات مع البوت</CardTitle>
          <CardDescription>آخر استجابات البوت للمستخدمين</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>الطلب</TableHead>
                <TableHead>الاستجابة</TableHead>
                <TableHead>الوقت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {botStats?.recentResponses.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.username}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{item.request}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{item.response}</TableCell>
                  <TableCell>{new Date(item.timestamp).toLocaleTimeString("ar-SA")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* إعدادات البوت */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>إعدادات البوت</span>
            </div>
          </CardTitle>
          <CardDescription>تخصيص سلوك البوت وإعداداته</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="botActive">تفعيل البوت</Label>
                <Switch
                  id="botActive"
                  checked={botSettings.isActive}
                  onCheckedChange={(checked) => setBotSettings(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoRespond">الرد التلقائي</Label>
                <Switch
                  id="autoRespond"
                  checked={botSettings.autoRespond}
                  onCheckedChange={(checked) => setBotSettings(prev => ({ ...prev, autoRespond: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="learningMode">وضع التعلم</Label>
                <Switch
                  id="learningMode"
                  checked={botSettings.learningMode}
                  onCheckedChange={(checked) => setBotSettings(prev => ({ ...prev, learningMode: checked }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="responseTemplate">قالب الاستجابة</Label>
              <Textarea
                id="responseTemplate"
                value={botSettings.responseTemplate}
                onChange={(e) => setBotSettings(prev => ({ ...prev, responseTemplate: e.target.value }))}
                className="mt-1"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                استخدم {"{username}"} لاسم المستخدم و {"{response}"} لمحتوى الاستجابة.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="commandPrefix">بادئة الأوامر</Label>
                <Input
                  id="commandPrefix"
                  value={botSettings.commandPrefix}
                  onChange={(e) => setBotSettings(prev => ({ ...prev, commandPrefix: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxResponseTime">أقصى وقت للاستجابة (ثواني)</Label>
                <Input
                  id="maxResponseTime"
                  type="number"
                  min="1"
                  max="30"
                  value={botSettings.maxResponseTime}
                  onChange={(e) => setBotSettings(prev => ({ ...prev, maxResponseTime: parseInt(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <Separator />
            
            {/* إضافة أمر مخصص */}
            <div>
              <h4 className="text-sm font-medium mb-2">إضافة أمر مخصص جديد</h4>
              <div className="grid grid-cols-[1fr_2fr_auto] gap-2">
                <div>
                  <Input
                    placeholder="الأمر مثل: /help"
                    value={customCommand.command}
                    onChange={(e) => setCustomCommand(prev => ({ ...prev, command: e.target.value }))}
                  />
                </div>
                <div>
                  <Input
                    placeholder="الاستجابة للأمر"
                    value={customCommand.response}
                    onChange={(e) => setCustomCommand(prev => ({ ...prev, response: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddCommand}>إضافة</Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
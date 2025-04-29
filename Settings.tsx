import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("ar");
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة وتأكيدها غير متطابقين",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would call an API endpoint to change the password
    toast({
      title: "تم تغيير كلمة المرور",
      description: "تم تغيير كلمة المرور بنجاح",
    });
    
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = () => {
    // In a real app, we would call an API endpoint to delete the account
    toast({
      title: "تم حذف الحساب",
      description: "تم حذف حسابك بنجاح",
    });
    
    setDeleteDialog(false);
    logout();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">الإعدادات</h1>
        
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>المظهر</CardTitle>
            <CardDescription>تخصيص مظهر التطبيق</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">الوضع الداكن</Label>
              <Switch 
                id="dark-mode" 
                checked={darkMode} 
                onCheckedChange={setDarkMode} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">اللغة</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>الإشعارات</CardTitle>
            <CardDescription>التحكم في إشعارات التطبيق</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">تمكين الإشعارات</Label>
              <Switch 
                id="notifications" 
                checked={notifications} 
                onCheckedChange={setNotifications} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound">تمكين صوت الإشعارات</Label>
              <Switch 
                id="sound" 
                checked={soundEnabled} 
                onCheckedChange={setSoundEnabled} 
                disabled={!notifications}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle>الخصوصية والأمان</CardTitle>
            <CardDescription>إدارة إعدادات الخصوصية والأمان</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="password">
                <AccordionTrigger>تغيير كلمة المرور</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                      <Input 
                        id="current-password" 
                        type="password" 
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور الحالية" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                      <Input 
                        id="new-password" 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور الجديدة" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
                      <Input 
                        id="confirm-password" 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="أعد إدخال كلمة المرور الجديدة" 
                      />
                    </div>
                    <Button onClick={handleChangePassword}>تغيير كلمة المرور</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="blocked">
                <AccordionTrigger>المستخدمون المحظورون</AccordionTrigger>
                <AccordionContent>
                  <div className="py-2">
                    <p className="text-muted-foreground mb-4">لا يوجد مستخدمون محظورون حاليًا.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="privacy">
                <AccordionTrigger>إعدادات الخصوصية</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="last-seen">إظهار آخر ظهور</Label>
                      <Switch id="last-seen" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="read-receipts">إظهار إشعار القراءة</Label>
                      <Switch id="read-receipts" defaultChecked />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        {/* Help & About */}
        <Card>
          <CardHeader>
            <CardTitle>المساعدة ومعلومات التطبيق</CardTitle>
            <CardDescription>المساعدة ومعلومات حول التطبيق</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">إصدار التطبيق</h3>
              <p className="text-muted-foreground">1.0.0</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">اسم التطبيق</h3>
              <p className="text-muted-foreground">FlixChat</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">وصف التطبيق</h3>
              <p className="text-muted-foreground">تطبيق محادثات اجتماعية بسيط وسريع</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Logout & Delete Account */}
        <Card>
          <CardHeader>
            <CardTitle>الحساب</CardTitle>
            <CardDescription>إدارة حسابك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => logout()}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              تسجيل الخروج
            </Button>
            
            <Separator />
            
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={() => setDeleteDialog(true)}
            >
              <i className="fas fa-trash-alt mr-2"></i>
              حذف الحساب
            </Button>
          </CardContent>
        </Card>
        
        {/* Delete Account Confirmation Dialog */}
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>حذف الحساب</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من رغبتك في حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع بياناتك نهائيًا.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialog(false)}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
              >
                حذف الحساب
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

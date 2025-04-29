import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const { user, logout, isAdmin } = useAuth();
  const [, navigate] = useNavigate();
  const [activeTab, setActiveTab] = useState<"users" | "groups" | "reports" | "settings">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [userDeleteDialog, setUserDeleteDialog] = useState<{ open: boolean; userId: number | null }>({
    open: false,
    userId: null,
  });
  const [addUserDialog, setAddUserDialog] = useState(false);
  const { toast } = useToast();

  // Check if user is admin or special developer account
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.username !== "جلال")) {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Fetch all users
  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAdmin,
  });

  const filteredUsers = searchQuery
    ? (users as User[]).filter(
        (user) =>
          user.username.includes(searchQuery) ||
          user.fullName.includes(searchQuery) ||
          user.id.toString().includes(searchQuery)
      )
    : (users as User[]);

  const handleDeleteUser = async () => {
    if (!userDeleteDialog.userId) return;

    try {
      await apiRequest("DELETE", `/api/admin/users/${userDeleteDialog.userId}`);
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المستخدم بنجاح",
      });
      refetchUsers();
    } catch (error) {
      toast({
        title: "فشل الحذف",
        description: "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
    } finally {
      setUserDeleteDialog({ open: false, userId: null });
    }
  };

  // Navigate back to app
  const handleBackToApp = () => {
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="bg-card py-3 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-foreground" 
            onClick={handleBackToApp}
          >
            <i className="fas fa-arrow-right"></i>
          </Button>
          <h1 className="text-xl font-bold mr-4">لوحة المسؤول</h1>
        </div>
        <div className="flex items-center">
          <span className="text-muted-foreground text-sm">مرحباً، {user?.fullName}</span>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg">
            <h3 className="text-foreground font-bold mb-1">المستخدمين النشطين</h3>
            <p className="text-3xl text-secondary font-bold">
              {(users as User[]).filter((u) => u.status === "online").length}
            </p>
            <p className="text-muted-foreground text-sm">من إجمالي {users.length} مستخدم</p>
          </div>
          
          <div className="bg-card p-4 rounded-lg">
            <h3 className="text-foreground font-bold mb-1">إجمالي الرسائل</h3>
            <p className="text-3xl text-secondary font-bold">-</p>
            <p className="text-muted-foreground text-sm">منذ إنشاء النظام</p>
          </div>
          
          <div className="bg-card p-4 rounded-lg">
            <h3 className="text-foreground font-bold mb-1">المجموعات النشطة</h3>
            <p className="text-3xl text-secondary font-bold">-</p>
            <p className="text-muted-foreground text-sm">من أصل - مجموعة</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border mb-4">
          <div className="flex space-x-reverse space-x-6">
            <Button
              variant="link"
              className={`py-2 px-1 ${
                activeTab === "users"
                  ? "border-b-2 border-secondary text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("users")}
            >
              المستخدمين
            </Button>
            <Button
              variant="link"
              className={`py-2 px-1 ${
                activeTab === "groups"
                  ? "border-b-2 border-secondary text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("groups")}
            >
              المجموعات
            </Button>
            <Button
              variant="link"
              className={`py-2 px-1 ${
                activeTab === "reports"
                  ? "border-b-2 border-secondary text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("reports")}
            >
              التقارير
            </Button>
            <Button
              variant="link"
              className={`py-2 px-1 ${
                activeTab === "settings"
                  ? "border-b-2 border-secondary text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              الإعدادات
            </Button>
          </div>
        </div>

        {/* Users Table */}
        {activeTab === "users" && (
          <div className="bg-card rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-foreground font-bold">قائمة المستخدمين</h3>
              <div className="flex">
                <Input
                  type="text"
                  placeholder="ابحث..."
                  className="bg-background text-foreground rounded-lg py-1 px-3 text-sm outline-none ml-3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button onClick={() => setAddUserDialog(true)} className="bg-secondary text-foreground py-1 px-3 rounded-lg text-sm">
                  إضافة مستخدم
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="text-right p-3 text-muted-foreground">المعرف</th>
                    <th className="text-right p-3 text-muted-foreground">اسم المستخدم</th>
                    <th className="text-right p-3 text-muted-foreground">الاسم الكامل</th>
                    <th className="text-right p-3 text-muted-foreground">الرتبة</th>
                    <th className="text-right p-3 text-muted-foreground">الحالة</th>
                    <th className="text-right p-3 text-muted-foreground">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: User) => (
                    <tr key={user.id} className="border-b border-border">
                      <td className="p-3 text-foreground">#{user.id}</td>
                      <td className="p-3 text-foreground">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden ml-2 bg-primary flex items-center justify-center">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-foreground text-sm">{user.fullName.charAt(0)}</span>
                            )}
                          </div>
                          <span>{user.username}</span>
                        </div>
                      </td>
                      <td className="p-3 text-foreground">{user.fullName}</td>
                      <td className="p-3">
                        <span className={`
                          ${user.role === "admin" ? "bg-primary" : 
                            user.role === "moderator" ? "bg-secondary" : "bg-background"} 
                          bg-opacity-30 text-secondary text-xs py-1 px-2 rounded-full
                        `}>
                          {user.role === "admin" 
                            ? "مسؤول" 
                            : user.role === "moderator" 
                              ? "مشرف" 
                              : user.role === "owner" 
                                ? "مالك" 
                                : "مستخدم"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`
                          ${user.status === "online" ? "bg-success bg-opacity-20 text-success" : "bg-background text-muted-foreground"}
                          text-xs py-1 px-2 rounded-full
                        `}>
                          {user.status === "online" ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground ml-2">
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setUserDeleteDialog({ open: true, userId: user.id })}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-3 flex justify-between items-center">
              <div className="text-muted-foreground text-sm">عرض {filteredUsers.length} من {users.length} مستخدم</div>
              <div className="flex space-x-reverse space-x-2">
                <Button disabled variant="outline" size="sm" className="text-muted-foreground">السابق</Button>
                <Button variant="secondary" size="sm" className="text-foreground">1</Button>
                <Button variant="outline" size="sm" className="text-muted-foreground">2</Button>
                <Button variant="outline" size="sm" className="text-muted-foreground">3</Button>
                <Button variant="outline" size="sm" className="text-muted-foreground">التالي</Button>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab === "groups" && (
          <div className="bg-card p-8 rounded-lg text-center">
            <h3 className="text-xl text-foreground mb-4">إدارة المجموعات</h3>
            <p className="text-muted-foreground">سيتم إضافة هذه الميزة قريبًا</p>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-card p-8 rounded-lg text-center">
            <h3 className="text-xl text-foreground mb-4">تقارير النظام</h3>
            <p className="text-muted-foreground">سيتم إضافة هذه الميزة قريبًا</p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-card p-8 rounded-lg text-center">
            <h3 className="text-xl text-foreground mb-4">إعدادات النظام</h3>
            <p className="text-muted-foreground">سيتم إضافة هذه الميزة قريبًا</p>
          </div>
        )}
      </div>

      {/* User Delete Confirmation Dialog */}
      <Dialog open={userDeleteDialog.open} onOpenChange={(open) => setUserDeleteDialog({ ...userDeleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المستخدم</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserDeleteDialog({ open: false, userId: null })}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog - To be implemented */}
      <Dialog open={addUserDialog} onOpenChange={setAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات المستخدم الجديد.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">
                الاسم الكامل
              </label>
              <Input placeholder="أدخل الاسم الكامل" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">
                اسم المستخدم
              </label>
              <Input placeholder="أدخل اسم المستخدم" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">
                كلمة المرور
              </label>
              <Input type="password" placeholder="أدخل كلمة المرور" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddUserDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="default"
              onClick={() => {
                toast({
                  title: "سيتم تنفيذ هذه الميزة قريبًا",
                  description: "هذه الميزة غير متاحة حاليًا",
                });
                setAddUserDialog(false);
              }}
            >
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

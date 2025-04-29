import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, UserRole, UserStatus } from "@shared/schema";
import { 
  Ban, 
  CheckCircle, 
  Search, 
  Shield, 
  ShieldAlert, 
  Trash, 
  User as UserIcon, 
  UserPlus 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  
  // حالة المستخدم الجديد
  const [newUser, setNewUser] = useState({
    username: "",
    displayName: "",
    password: "",
    role: "user",
    bio: "",
  });
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(users.filter(user => 
        user.username.toLowerCase().includes(query) || 
        user.displayName.toLowerCase().includes(query)
      ));
    }
  }, [searchQuery, users]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("GET", "/api/admin/users", undefined);
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateUser = async () => {
    // التحقق من صحة البيانات
    if (!newUser.username.trim() || !newUser.displayName.trim() || !newUser.password.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const res = await apiRequest("POST", "/api/admin/users", newUser);
      const createdUser = await res.json();
      
      setUsers([...users, createdUser]);
      setFilteredUsers([...filteredUsers, createdUser]);
      
      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء المستخدم بنجاح",
      });
      
      // إعادة تعيين نموذج المستخدم الجديد
      setNewUser({
        username: "",
        displayName: "",
        password: "",
        role: "user",
        bio: "",
      });
      
      setShowNewUserDialog(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إنشاء المستخدم",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role: newRole });
      
      // تحديث الحالة المحلية
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, role: newRole as UserRole };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole as UserRole });
      }
      
      toast({
        title: "تم التحديث",
        description: "تم تغيير دور المستخدم بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تغيير دور المستخدم",
        variant: "destructive",
      });
    }
  };
  
  const handleBanUser = async (userId: number, banned: boolean) => {
    try {
      await apiRequest("PATCH", `/api/admin/users/${userId}/ban`, { banned });
      
      // تحديث الحالة المحلية
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, banned };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, banned });
      }
      
      toast({
        title: banned ? "تم الحظر" : "تم إلغاء الحظر",
        description: banned ? "تم حظر المستخدم بنجاح" : "تم إلغاء حظر المستخدم بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: banned ? "فشل حظر المستخدم" : "فشل إلغاء حظر المستخدم",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteUser = async (userId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }
    
    try {
      await apiRequest("DELETE", `/api/admin/users/${userId}`, undefined);
      
      setUsers(users.filter(user => user.id !== userId));
      setFilteredUsers(filteredUsers.filter(user => user.id !== userId));
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
      }
      
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
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-destructive">مدير</Badge>;
      case "moderator":
        return <Badge className="bg-orange-500">مشرف</Badge>;
      case "owner":
        return <Badge className="bg-primary">مالك</Badge>;
      default:
        return <Badge variant="outline">عضو</Badge>;
    }
  };
  
  const getStatusIndicator = (status: string) => {
    if (status === "online") {
      return <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>;
    } else if (status === "away") {
      return <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>;
    } else {
      return <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground"></span>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
        <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="ml-2 h-4 w-4" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="اسم المستخدم للتسجيل"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName">الاسم الظاهر</Label>
                <Input
                  id="displayName"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                  placeholder="الاسم الذي سيظهر للآخرين"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="كلمة المرور"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">الدور</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">عضو</SelectItem>
                    <SelectItem value="moderator">مشرف</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">نبذة تعريفية (اختياري)</Label>
                <Input
                  id="bio"
                  value={newUser.bio}
                  onChange={(e) => setNewUser({...newUser, bio: e.target.value})}
                  placeholder="نبذة تعريفية عن المستخدم"
                />
              </div>
              
              <Button className="w-full" onClick={handleCreateUser}>
                إنشاء المستخدم
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة المستخدمين */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>المستخدمين ({filteredUsers.length})</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن مستخدم..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/5"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-2 mt-4 max-h-[550px] overflow-y-auto pl-4">
                {filteredUsers.map(user => (
                  <div 
                    key={user.id} 
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                      selectedUser?.id === user.id ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl || ""} alt={user.displayName} />
                        <AvatarFallback className="bg-primary/30">
                          {user.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 left-0">
                        {getStatusIndicator(user.status)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${user.banned ? "line-through text-muted-foreground" : ""}`}>
                          {user.displayName}
                        </h4>
                        {getRoleBadge(user.role)}
                      </div>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                لا يوجد مستخدمين مطابقين للبحث
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* تفاصيل المستخدم */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedUser ? `تفاصيل: ${selectedUser.displayName}` : "تفاصيل المستخدم"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <Tabs defaultValue="info">
                <TabsList className="mb-4">
                  <TabsTrigger value="info">معلومات الحساب</TabsTrigger>
                  <TabsTrigger value="roles">الصلاحيات</TabsTrigger>
                  <TabsTrigger value="actions">إجراءات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col items-center justify-center">
                      <Avatar className="w-32 h-32 mb-4">
                        <AvatarImage src={selectedUser.avatarUrl || ""} alt={selectedUser.displayName} />
                        <AvatarFallback className="text-4xl bg-primary/30">
                          {selectedUser.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold">{selectedUser.displayName}</h3>
                      <p className="text-muted-foreground mb-2">@{selectedUser.username}</p>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(selectedUser.role)}
                        {selectedUser.banned && (
                          <Badge variant="destructive">محظور</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">المعرف</h4>
                        <p>{selectedUser.id}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">الحالة</h4>
                        <div className="flex items-center gap-2">
                          {getStatusIndicator(selectedUser.status)}
                          <span>
                            {selectedUser.status === "online" ? "متصل" : 
                             selectedUser.status === "away" ? "غائب" : "غير متصل"}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">تاريخ الانضمام</h4>
                        <p>{new Date(selectedUser.createdAt).toLocaleDateString("ar-SA")}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">نبذة تعريفية</h4>
                        <p className="text-sm">
                          {selectedUser.bio || "لا توجد نبذة تعريفية"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="roles">
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-medium">دور المستخدم</h3>
                            <p className="text-sm text-muted-foreground">
                              اختر دور المستخدم وصلاحياته في النظام
                            </p>
                          </div>
                          {getRoleBadge(selectedUser.role)}
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div 
                            className={`border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-muted ${
                              selectedUser.role === "user" ? "border-primary bg-muted" : "border-border"
                            }`}
                            onClick={() => handleUpdateUserRole(selectedUser.id, "user")}
                          >
                            <div className="flex items-center mb-2">
                              <UserIcon className="h-5 w-5 ml-2" />
                              <h4 className="font-medium">عضو</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              مستخدم عادي يمكنه استخدام التطبيق للمحادثات والقصص.
                            </p>
                          </div>
                          
                          <div 
                            className={`border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-muted ${
                              selectedUser.role === "moderator" ? "border-primary bg-muted" : "border-border"
                            }`}
                            onClick={() => handleUpdateUserRole(selectedUser.id, "moderator")}
                          >
                            <div className="flex items-center mb-2">
                              <Shield className="h-5 w-5 ml-2" />
                              <h4 className="font-medium">مشرف</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              يمكنه إدارة المحادثات والمجموعات ومراقبة المحتوى.
                            </p>
                          </div>
                          
                          <div 
                            className={`border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-muted ${
                              selectedUser.role === "admin" ? "border-primary bg-muted" : "border-border"
                            }`}
                            onClick={() => handleUpdateUserRole(selectedUser.id, "admin")}
                          >
                            <div className="flex items-center mb-2">
                              <ShieldAlert className="h-5 w-5 ml-2" />
                              <h4 className="font-medium">مدير</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              يمتلك صلاحيات كاملة في النظام ويمكنه إدارة المستخدمين والمحتوى.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-4">صلاحيات إضافية</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium mb-1">تعديل المجموعات</h4>
                              <p className="text-sm text-muted-foreground">
                                السماح للمستخدم بإنشاء وتعديل المجموعات
                              </p>
                            </div>
                            <Switch checked={["admin", "moderator"].includes(selectedUser.role)} disabled />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium mb-1">حذف الرسائل</h4>
                              <p className="text-sm text-muted-foreground">
                                السماح للمستخدم بحذف رسائل الآخرين
                              </p>
                            </div>
                            <Switch checked={["admin", "moderator"].includes(selectedUser.role)} disabled />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium mb-1">إدارة المستخدمين</h4>
                              <p className="text-sm text-muted-foreground">
                                إمكانية حظر وإلغاء حظر المستخدمين
                              </p>
                            </div>
                            <Switch checked={selectedUser.role === "admin"} disabled />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="actions">
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-2">
                          {selectedUser.banned ? "إلغاء حظر المستخدم" : "حظر المستخدم"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {selectedUser.banned 
                            ? "سيتمكن المستخدم من تسجيل الدخول واستخدام النظام مرة أخرى."
                            : "سيتم منع المستخدم من تسجيل الدخول واستخدام النظام."}
                        </p>
                        {selectedUser.banned ? (
                          <Button className="w-full" onClick={() => handleBanUser(selectedUser.id, false)}>
                            <CheckCircle className="ml-2 h-4 w-4" />
                            إلغاء الحظر
                          </Button>
                        ) : (
                          <Button className="w-full" variant="destructive" onClick={() => handleBanUser(selectedUser.id, true)}>
                            <Ban className="ml-2 h-4 w-4" />
                            حظر المستخدم
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-2 text-destructive">حذف المستخدم</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          سيؤدي هذا الإجراء إلى حذف المستخدم نهائياً وكل البيانات المرتبطة به. لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <Button className="w-full" variant="destructive" 
                          onClick={() => handleDeleteUser(selectedUser.id)}
                          disabled={selectedUser.role === "admin"} // منع حذف المديرين
                        >
                          <Trash className="ml-2 h-4 w-4" />
                          حذف المستخدم نهائياً
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <UserIcon className="h-12 w-12 mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">اختر مستخدم</h3>
                <p className="text-sm max-w-md">
                  يرجى اختيار مستخدم من القائمة على الجانب لعرض تفاصيله وإدارة حسابه.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
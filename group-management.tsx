import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Chat, User } from "@shared/schema";
import { Ban, Check, Edit, Trash, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type GroupWithDetails = Chat & {
  members: User[];
  memberCount: number;
  messageCount: number;
};

export default function GroupManagement() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithDetails | null>(null);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  
  // حالة إضافة عضو جديد
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("user");
  
  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);
  
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("GET", "/api/admin/groups", undefined);
      const data = await res.json();
      setGroups(data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل المجموعات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        description: "فشل تحميل المستخدمين",
        variant: "destructive",
      });
    }
  };
  
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم للمجموعة",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const res = await apiRequest("POST", "/api/admin/groups", {
        name: newGroupName,
        type: "group",
      });
      
      const newGroup = await res.json();
      setGroups([...groups, newGroup]);
      
      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء المجموعة بنجاح",
      });
      
      setNewGroupName("");
      setShowGroupDialog(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إنشاء المجموعة",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه المجموعة؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }
    
    try {
      await apiRequest("DELETE", `/api/admin/groups/${groupId}`, undefined);
      setGroups(groups.filter(group => group.id !== groupId));
      
      toast({
        title: "تم الحذف",
        description: "تم حذف المجموعة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف المجموعة",
        variant: "destructive",
      });
    }
  };
  
  const handleBanGroup = async (groupId: number) => {
    if (!confirm("هل أنت متأكد من حظر هذه المجموعة؟ ستتحول إلى مجموعة مقيدة.")) {
      return;
    }
    
    try {
      await apiRequest("PATCH", `/api/admin/groups/${groupId}/ban`, { banned: true });
      
      // تحديث حالة المجموعة في القائمة المحلية
      setGroups(groups.map(group => {
        if (group.id === groupId) {
          return { ...group, banned: true };
        }
        return group;
      }));
      
      toast({
        title: "تم الحظر",
        description: "تم حظر المجموعة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حظر المجموعة",
        variant: "destructive",
      });
    }
  };
  
  const handleUnbanGroup = async (groupId: number) => {
    try {
      await apiRequest("PATCH", `/api/admin/groups/${groupId}/ban`, { banned: false });
      
      // تحديث حالة المجموعة في القائمة المحلية
      setGroups(groups.map(group => {
        if (group.id === groupId) {
          return { ...group, banned: false };
        }
        return group;
      }));
      
      toast({
        title: "تم إلغاء الحظر",
        description: "تم إلغاء حظر المجموعة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إلغاء حظر المجموعة",
        variant: "destructive",
      });
    }
  };
  
  const handleAddMember = async () => {
    if (!selectedGroup || !selectedUser) return;
    
    try {
      await apiRequest("POST", `/api/admin/groups/${selectedGroup.id}/members`, {
        userId: parseInt(selectedUser),
        role: selectedRole,
      });
      
      toast({
        title: "تم الإضافة",
        description: "تم إضافة العضو بنجاح",
      });
      
      // إعادة تحميل المجموعة لتحديث الأعضاء
      const res = await apiRequest("GET", `/api/admin/groups/${selectedGroup.id}`, undefined);
      const updatedGroup = await res.json();
      
      setGroups(groups.map(g => g.id === selectedGroup.id ? updatedGroup : g));
      setSelectedGroup(updatedGroup);
      
      setSelectedUser("");
      setSelectedRole("user");
      setShowMemberDialog(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إضافة العضو",
        variant: "destructive",
      });
    }
  };
  
  const handleChangeRole = async (groupId: number, userId: number, newRole: string) => {
    try {
      await apiRequest("PATCH", `/api/admin/groups/${groupId}/members/${userId}`, {
        role: newRole,
      });
      
      toast({
        title: "تم التحديث",
        description: "تم تغيير دور العضو بنجاح",
      });
      
      // تحديث الحالة المحلية
      if (selectedGroup && selectedGroup.id === groupId) {
        const updatedMembers = selectedGroup.members.map(member => {
          if (member.id === userId) {
            return { ...member, role: newRole };
          }
          return member;
        });
        
        setSelectedGroup({
          ...selectedGroup,
          members: updatedMembers,
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تغيير دور العضو",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveMember = async (groupId: number, userId: number) => {
    if (!confirm("هل أنت متأكد من إزالة هذا العضو من المجموعة؟")) {
      return;
    }
    
    try {
      await apiRequest("DELETE", `/api/admin/groups/${groupId}/members/${userId}`, undefined);
      
      toast({
        title: "تم الإزالة",
        description: "تم إزالة العضو من المجموعة بنجاح",
      });
      
      // تحديث الحالة المحلية
      if (selectedGroup && selectedGroup.id === groupId) {
        setSelectedGroup({
          ...selectedGroup,
          members: selectedGroup.members.filter(member => member.id !== userId),
          memberCount: selectedGroup.memberCount - 1,
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إزالة العضو",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">إدارة المجموعات</h2>
        <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
          <DialogTrigger asChild>
            <Button>
              <Users className="ml-2 h-4 w-4" />
              إنشاء مجموعة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء مجموعة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">اسم المجموعة</Label>
                <Input
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="أدخل اسم المجموعة"
                />
              </div>
              
              <Button className="w-full" onClick={handleCreateGroup}>
                إنشاء المجموعة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة المجموعات */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>المجموعات ({groups.length})</CardTitle>
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
            ) : groups.length > 0 ? (
              <ScrollArea className="h-[500px] pl-4">
                <div className="space-y-3 ml-4">
                  {groups.map(group => (
                    <div 
                      key={group.id} 
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                        selectedGroup?.id === group.id ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{group.name}</h4>
                          {group.banned && (
                            <Badge variant="destructive" className="text-[10px]">محظورة</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {group.memberCount} عضو | {group.messageCount} رسالة
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                لا توجد مجموعات بعد
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* تفاصيل المجموعة */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedGroup ? `تفاصيل: ${selectedGroup.name}` : "تفاصيل المجموعة"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedGroup ? (
              <Tabs defaultValue="info">
                <TabsList className="mb-4">
                  <TabsTrigger value="info">معلومات عامة</TabsTrigger>
                  <TabsTrigger value="members">الأعضاء ({selectedGroup.members.length})</TabsTrigger>
                  <TabsTrigger value="actions">إجراءات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">المعرف:</span>
                      <span className="text-muted-foreground">{selectedGroup.id}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">الاسم:</span>
                      <span className="text-muted-foreground">{selectedGroup.name}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">النوع:</span>
                      <span className="text-muted-foreground">
                        {selectedGroup.type === "group" ? "مجموعة" : "محادثة خاصة"}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">الحالة:</span>
                      <span className={`${selectedGroup.banned ? "text-destructive" : "text-green-500"}`}>
                        {selectedGroup.banned ? "محظورة" : "نشطة"}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">تاريخ الإنشاء:</span>
                      <span className="text-muted-foreground">
                        {new Date(selectedGroup.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">عدد الأعضاء:</span>
                      <span className="text-muted-foreground">{selectedGroup.memberCount}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">عدد الرسائل:</span>
                      <span className="text-muted-foreground">{selectedGroup.messageCount}</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="members">
                  <div className="flex justify-end mb-4">
                    <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          إضافة عضو
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>إضافة عضو جديد</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>اختر مستخدم</Label>
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر مستخدم" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map(user => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.displayName} (@{user.username})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>الدور</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الدور" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">عضو</SelectItem>
                                <SelectItem value="moderator">مشرف</SelectItem>
                                <SelectItem value="admin">مدير</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button className="w-full" onClick={handleAddMember}>
                            إضافة
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedGroup.members.length > 0 ? (
                      selectedGroup.members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                          <Avatar>
                            <AvatarImage src={member.avatarUrl || ""} alt={member.displayName} />
                            <AvatarFallback className="bg-primary/30">
                              {member.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{member.displayName}</h4>
                                <p className="text-sm text-muted-foreground">@{member.username}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select 
                                  value={member.role} 
                                  onValueChange={(value) => handleChangeRole(selectedGroup.id, member.id, value)}
                                >
                                  <SelectTrigger className="h-8 w-28">
                                    <SelectValue placeholder="الدور" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">عضو</SelectItem>
                                    <SelectItem value="moderator">مشرف</SelectItem>
                                    <SelectItem value="admin">مدير</SelectItem>
                                    <SelectItem value="owner">مالك</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRemoveMember(selectedGroup.id, member.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        لا يوجد أعضاء في هذه المجموعة
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="actions">
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-2">تعديل المجموعة</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          يمكنك تغيير اسم المجموعة وإعداداتها.
                        </p>
                        <Button className="w-full">
                          <Edit className="ml-2 h-4 w-4" />
                          تعديل المجموعة
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-2">
                          {selectedGroup.banned ? "إلغاء حظر المجموعة" : "حظر المجموعة"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {selectedGroup.banned 
                            ? "ستصبح المجموعة نشطة مرة أخرى ويمكن للأعضاء التفاعل فيها."
                            : "سيمنع الأعضاء من إرسال الرسائل والتفاعل في المجموعة."}
                        </p>
                        {selectedGroup.banned ? (
                          <Button className="w-full" onClick={() => handleUnbanGroup(selectedGroup.id)}>
                            <Check className="ml-2 h-4 w-4" />
                            إلغاء الحظر
                          </Button>
                        ) : (
                          <Button className="w-full" variant="destructive" onClick={() => handleBanGroup(selectedGroup.id)}>
                            <Ban className="ml-2 h-4 w-4" />
                            حظر المجموعة
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-2 text-destructive">حذف المجموعة</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          سيؤدي هذا الإجراء إلى حذف المجموعة نهائياً وكل الرسائل والبيانات المرتبطة بها. لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <Button className="w-full" variant="destructive" onClick={() => handleDeleteGroup(selectedGroup.id)}>
                          <Trash className="ml-2 h-4 w-4" />
                          حذف المجموعة نهائياً
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">اختر مجموعة</h3>
                <p className="text-sm max-w-md">
                  يرجى اختيار مجموعة من القائمة على الجانب لعرض تفاصيلها وإدارتها.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
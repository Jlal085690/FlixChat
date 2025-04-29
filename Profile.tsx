import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import UserAvatar from "@/components/UserAvatar";
import { User } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
      setCoverUrl(user.coverUrl || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const updatedData = {
        fullName,
        bio,
        avatarUrl,
        coverUrl,
      };
      
      const response = await apiRequest("PUT", `/api/users/me`, updatedData);
      const updatedUser = await response.json();
      
      // Update the session context
      // In a real app, we would call a method from useAuth to update the user
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث ملفك الشخصي بنجاح",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث ملفك الشخصي",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFullName(user.fullName || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
      setCoverUrl(user.coverUrl || "");
    }
    setIsEditing(false);
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
      <div className="max-w-4xl mx-auto">
        {/* Cover Photo */}
        <div className="relative h-48 rounded-lg overflow-hidden mb-16 bg-card">
          {coverUrl ? (
            <img src={coverUrl} alt="غلاف" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary to-secondary opacity-50"></div>
          )}
          
          {/* Profile Picture */}
          <div className="absolute -bottom-12 right-6 w-24 h-24">
            <div className="relative w-full h-full">
              <UserAvatar user={user} size="lg" />
              
              {isEditing && (
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute bottom-0 left-0 w-6 h-6 rounded-full"
                >
                  <i className="fas fa-camera text-xs"></i>
                </Button>
              )}
            </div>
          </div>
          
          {isEditing && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="absolute top-2 left-2"
            >
              <i className="fas fa-camera mr-2"></i>
              تغيير الغلاف
            </Button>
          )}
        </div>
        
        {/* Profile Info */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.fullName}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <i className="fas fa-edit mr-2"></i>
              تعديل الملف الشخصي
            </Button>
          ) : (
            <div className="space-x-reverse space-x-2">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <div className="animate-spin w-4 h-4 border-2 border-foreground border-t-transparent rounded-full mr-2"></div>
                ) : (
                  <i className="fas fa-save mr-2"></i>
                )}
                حفظ التغييرات
              </Button>
            </div>
          )}
        </div>
        
        {/* Profile Content */}
        {!isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الشخصية</CardTitle>
              <CardDescription>معلومات حول ملفك الشخصي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">الاسم الكامل</h3>
                <p className="text-foreground">{user.fullName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">نبذة عني</h3>
                <p className="text-foreground">{user.bio || "لا توجد نبذة"}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>تعديل المعلومات الشخصية</CardTitle>
              <CardDescription>قم بتعديل معلومات ملفك الشخصي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">الاسم الكامل</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">نبذة عني</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="أدخل نبذة عنك"
                  className="resize-none bg-background"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">رابط الصورة الشخصية</label>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="أدخل رابط الصورة الشخصية"
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">رابط صورة الغلاف</label>
                <Input
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="أدخل رابط صورة الغلاف"
                  className="bg-background"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Menu,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Moon,
  Sun,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AdvancedSearch } from "@/components/search/advanced-search";
import { NotificationCenter } from "@/components/notifications/notification-center";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export default function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  // التنقل لصفحة الملف الشخصي
  const navigateToProfile = () => {
    setLocation("/profile");
  };

  // التنقل لصفحة الإعدادات
  const navigateToSettings = () => {
    setLocation("/settings");
  };

  // التنقل لصفحة الإدارة (للمشرفين فقط)
  const navigateToAdmin = () => {
    setLocation("/admin");
  };

  // تسجيل الخروج
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background px-4 py-2 flex items-center justify-between">
      {/* الجانب الأيمن - زر القائمة والشعار */}
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="h-9 w-9 mr-2" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">القائمة</span>
        </Button>
        <h1 className="text-xl font-bold text-primary ml-2">FlixChat</h1>
      </div>

      {/* الجانب الأيسر - أدوات المستخدم والبحث والإشعارات */}
      <div className="flex items-center space-x-2 mr-2">
        {/* البحث */}
        <AdvancedSearch />
        
        {/* الإشعارات */}
        <NotificationCenter />
        
        {/* تغيير المظهر */}
        <ThemeToggle />
        
        {/* قائمة المستخدم */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.username}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={navigateToProfile}>
              <User className="ml-2 h-4 w-4" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={navigateToSettings}>
              <Settings className="ml-2 h-4 w-4" />
              <span>الإعدادات</span>
            </DropdownMenuItem>
            {user?.role === "admin" && (
              <DropdownMenuItem onClick={navigateToAdmin}>
                <Shield className="ml-2 h-4 w-4" />
                <span>لوحة الإدارة</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="ml-2 h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
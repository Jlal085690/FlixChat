import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "wouter";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import UserAvatar from "./UserAvatar";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const [, navigate] = useNavigate();
  const [logoutDialog, setLogoutDialog] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLogoutDialog(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const goToAdmin = () => {
    navigate("/admin");
    onClose();
  };

  return (
    <>
      {/* Sidebar Navigation Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-72 bg-card z-40 transform drawer-transition ${
          isOpen ? "" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-reverse space-x-3">
            <UserAvatar user={user!} size="lg" />
            <div className="flex-1">
              <h2 className="text-foreground font-bold">{user?.fullName}</h2>
              <p className="text-muted-foreground text-sm">@{user?.username}</p>
            </div>
          </div>
        </div>

        <nav className="p-2">
          <ul>
            <li>
              <button
                onClick={() => handleNavigation("/")}
                className="w-full flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-foreground text-right"
              >
                <i className="fas fa-user-friends w-6 text-center"></i>
                <span>جهات الاتصال</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/")}
                className="w-full flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-foreground text-right"
              >
                <i className="fas fa-users w-6 text-center"></i>
                <span>المجموعات</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/")}
                className="w-full flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-foreground text-right"
              >
                <i className="fas fa-phone-alt w-6 text-center"></i>
                <span>المكالمات</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/")}
                className="w-full flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-foreground text-right"
              >
                <i className="fas fa-bookmark w-6 text-center"></i>
                <span>المحفوظات</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/settings")}
                className="w-full flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-foreground text-right"
              >
                <i className="fas fa-cog w-6 text-center"></i>
                <span>الإعدادات</span>
              </button>
            </li>
            {isAdmin && (
              <li className="mt-4">
                <button
                  onClick={goToAdmin}
                  className="w-full flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-secondary text-right"
                >
                  <i className="fas fa-shield-alt w-6 text-center"></i>
                  <span>لوحة المسؤول</span>
                </button>
              </li>
            )}
            <li className="mt-4">
              <button
                onClick={() => setLogoutDialog(true)}
                className="w-full flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-destructive text-right"
              >
                <i className="fas fa-sign-out-alt w-6 text-center"></i>
                <span>تسجيل الخروج</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay for Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 animate-fade-in"
          onClick={onClose}
        ></div>
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تسجيل الخروج</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLogoutDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              تسجيل الخروج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

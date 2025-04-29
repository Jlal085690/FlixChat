import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { AvatarName } from "./avatar-name";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  // Close sidebar when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (isOpen && !target.closest("#nav-drawer") && !target.closest("#menu-toggle")) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);
  
  const goToAdmin = () => {
    onClose();
    setLocation("/admin");
  };
  
  const handleLogout = () => {
    logout();
    onClose();
  };
  
  return (
    <>
      <div
        id="nav-drawer"
        className={cn(
          "fixed inset-y-0 right-0 w-72 bg-sidebar z-40 transform drawer-transition",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b border-sidebar-border">
          {user && (
            <AvatarName
              src={user.avatar}
              name={user.displayName || user.username}
              subtitle={`@${user.username}`}
              size="lg"
            />
          )}
        </div>

        <nav className="p-2">
          <ul>
            <li>
              <a
                href="#"
                className="flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-sidebar-foreground"
              >
                <i className="fas fa-user-friends w-6 text-center"></i>
                <span>جهات الاتصال</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-sidebar-foreground"
              >
                <i className="fas fa-users w-6 text-center"></i>
                <span>المجموعات</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-sidebar-foreground"
              >
                <i className="fas fa-phone-alt w-6 text-center"></i>
                <span>المكالمات</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-sidebar-foreground"
              >
                <i className="fas fa-bookmark w-6 text-center"></i>
                <span>المحفوظات</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-sidebar-foreground"
              >
                <i className="fas fa-cog w-6 text-center"></i>
                <span>الإعدادات</span>
              </a>
            </li>
            {user?.role === "admin" && (
              <li className="mt-4">
                <button
                  onClick={goToAdmin}
                  className="w-full flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-primary"
                >
                  <i className="fas fa-shield-alt w-6 text-center"></i>
                  <span>لوحة المسؤول</span>
                </button>
              </li>
            )}
            <li className="mt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-background text-destructive"
              >
                <i className="fas fa-sign-out-alt w-6 text-center"></i>
                <span>تسجيل الخروج</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Overlay */}
      <div
        id="drawer-overlay"
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-30",
          isOpen ? "block" : "hidden"
        )}
        onClick={onClose}
      ></div>
    </>
  );
}

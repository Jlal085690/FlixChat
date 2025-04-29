import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { ChevronLeft, Users, Phone, BookmarkIcon, Cog, LogOut, ShieldAlert, UserCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  // Close sidebar on location change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      onClose();
    }
  }, [location, onClose]);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (sidebar && !sidebar.contains(e.target as Node) && open && window.innerWidth < 768) {
        onClose();
      }
    };
    
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [open, onClose]);

  if (!user) return null;
  
  const navItems = [
    {
      name: "المحادثات",
      icon: <MessageSquare size={20} />,
      path: "/",
      active: location === "/" || location.startsWith('/chat/')
    },
    {
      name: "الحساب",
      icon: <UserCircle size={20} />,
      path: "/profile",
      active: location === "/profile"
    },
    {
      name: "المجموعات",
      icon: <Users size={20} />,
      path: "/groups",
      active: location === "/groups"
    },
    {
      name: "الأشخاص",
      icon: <User size={20} />,
      path: "/people",
      active: location === "/people"
    }
  ];
  
  // Only show admin panel for admin users with username جلال
  if (user?.role === "admin" || user?.username === "جلال") {
    navItems.push({
      name: "لوحة المطور",
      icon: <ShieldAlert size={20} />,
      path: "/admin",
      active: location === "/admin"
    });
  }

  return (
    <div 
      id="sidebar"
      className={cn(
        "fixed inset-y-0 right-0 w-64 bg-card z-50 shadow-lg transition-transform duration-300 transform",
        open ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Mobile close button */}
        <div className="md:hidden absolute top-4 left-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-muted-foreground"
          >
            <ChevronLeft />
          </Button>
        </div>
        
        {/* User info */}
        <div className="p-6 bg-primary/20">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-primary">
              <AvatarImage src={user?.avatarUrl || ""} alt={user?.fullName || user?.username || "المستخدم"} />
              <AvatarFallback className="bg-primary/30">
                {(user?.fullName || user?.username || "م").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">{user?.fullName || user?.username || "المستخدم"}</h3>
              <p className="text-muted-foreground text-sm">@{user?.username || "مستخدم"}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 hover:bg-primary/10 transition-colors",
                    item.active && "bg-primary/20 text-primary"
                  )}
                >
                  <span className={cn(
                    "w-6 text-center",
                    item.active ? "text-primary" : "text-accent"
                  )}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

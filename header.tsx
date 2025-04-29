import { Button } from "@/components/ui/button";
import { Menu, Search, ChevronDown, MessageSquare, UserCircle, Settings, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-mobile";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Header({ title = "تيليجرام عربي", onMenuClick }: { title?: string; onMenuClick: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState("المراسلات");

  // Update section title based on location
  useEffect(() => {
    if (location === "/" || location.startsWith("/chat/")) {
      setCurrentSection("المراسلات");
    } else if (location === "/profile") {
      setCurrentSection("الحساب");
    } else if (location === "/admin") {
      setCurrentSection("لوحة المطور");
    }
  }, [location]);

  // Navigation options
  const navigationItems = [
    {
      name: "المراسلات",
      icon: <MessageSquare size={18} />,
      path: "/",
    },
    {
      name: "الحساب",
      icon: <UserCircle size={18} />,
      path: "/profile",
    }
  ];

  // Add admin panel for admin users or username جلال
  if (user?.role === "admin" || user?.username === "جلال") {
    navigationItems.push({
      name: "لوحة المطور",
      icon: <ShieldAlert size={18} />,
      path: "/admin",
    });
  }
  
  return (
    <header className="bg-primary text-white z-30 sticky top-0">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          {/* قائمة التنقل (ثلاث نقاط) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
                <Menu size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>القائمة الرئيسية</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navigationItems.map((item) => (
                <DropdownMenuItem 
                  key={item.path}
                  onClick={() => {
                    setLocation(item.path);
                    setCurrentSection(item.name);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search button */}
          {isMobile ? (
            <Drawer open={searchOpen} onOpenChange={setSearchOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
                  <Search size={20} />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="p-4 pt-0">
                <div className="mt-4">
                  <Input
                    placeholder="ابحث عن مستخدمين أو محادثات..."
                    className="w-full"
                    autoFocus
                  />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
                  <Search size={20} />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>البحث</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="ابحث عن مستخدمين أو محادثات..."
                  className="w-full"
                  autoFocus
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import StoriesList from "@/components/stories/stories-list";
import ChatList from "@/components/chat/chat-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useChats } from "@/hooks/use-chats";
import ChatPage from "./chat-page";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { currentChat } = useChats();
  
  useEffect(() => {
    // Auto-open sidebar on desktop
    if (!isMobile) {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  // Toggle sidebar handler
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  if (!user) {
    // This shouldn't happen thanks to ProtectedRoute, but just in case
    setLocation("/auth");
    return null;
  }
  
  // Show active chat if one is selected (on mobile)
  if (isMobile && currentChat) {
    return <ChatPage />;
  }
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen && !isMobile ? 'md:mr-64' : ''}`}>
        <Header onMenuClick={toggleSidebar} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stories Section */}
          <StoriesList />
          
          {/* Chats Section */}
          <div className="flex-1 overflow-y-auto">
            <ChatList />
          </div>
          
          {/* FAB for mobile */}
          <div className="md:hidden fixed bottom-20 left-6 z-20">
            <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>
      
      {/* Chat Panel (desktop only) */}
      {!isMobile && currentChat && (
        <div className="w-2/3 border-r border-border">
          <ChatPage />
        </div>
      )}
    </div>
  );
}

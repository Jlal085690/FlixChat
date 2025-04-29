import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "wouter";
import Sidebar from "./Sidebar";
import VideoCall from "./VideoCall";
import StoryViewer from "./StoryViewer";
import { useChat } from "@/contexts/ChatContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import UserAvatar from "./UserAvatar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const { activeCall } = useChat();
  const [, navigate] = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Main App Header */}
      <header className="bg-card py-3 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground text-xl p-2"
            onClick={toggleSidebar}
          >
            <i className="fas fa-bars"></i>
          </Button>
          <h1 className="text-xl font-bold mr-4">FlixChat</h1>
        </div>
        <div className="flex items-center space-x-reverse space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground text-lg p-2"
            onClick={toggleSearchBar}
          >
            <i className="fas fa-search"></i>
          </Button>
          <Button
            variant="ghost"
            className="w-9 h-9 rounded-full bg-primary overflow-hidden p-0"
            onClick={handleProfileClick}
          >
            <UserAvatar 
              user={user!} 
              size="sm" 
            />
          </Button>
        </div>
      </header>

      {/* Search Bar */}
      {showSearchBar && (
        <div className="bg-card py-2 px-4 animate-slide-in">
          <div className="relative">
            <Input
              type="text"
              placeholder="ابحث عن مستخدمين أو محادثات..."
              className="w-full bg-background text-foreground rounded-lg py-2 pr-4 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-3 text-muted-foreground"></i>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Render Sidebar */}
        <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

        {/* Main Content */}
        {children}
      </div>

      {/* Active Call Modal */}
      {activeCall && (
        <VideoCall call={activeCall} />
      )}

      {/* Story Viewer */}
      {showStoryViewer && (
        <StoryViewer onClose={() => setShowStoryViewer(false)} />
      )}
    </div>
  );
}

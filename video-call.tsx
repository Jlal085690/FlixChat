import { User } from "@shared/schema";
import { useState, useEffect } from "react";
import { AvatarName } from "@/components/ui/avatar-name";

interface VideoCallProps {
  user: User;
  onEnd: () => void;
  isIncoming?: boolean;
}

export function VideoCall({ user, onEnd, isIncoming = false }: VideoCallProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  
  // Timer for call duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format duration as mm:ss
  const formatDuration = () => {
    const minutes = Math.floor(callDuration / 60).toString().padStart(2, "0");
    const seconds = (callDuration % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="h-screen flex flex-col">
        <div className="flex-1 relative">
          {/* Main Video Feed */}
          <div className="w-full h-full bg-black flex items-center justify-center">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={`فيديو ${user.username}`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center text-6xl">
                {user.username.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Self Video Feed */}
          <div className="absolute bottom-4 right-4 w-40 h-60 bg-muted rounded-lg overflow-hidden border-2 border-background">
            {/* Placeholder for self video */}
            <div className="w-full h-full flex items-center justify-center text-2xl">
              <i className="fas fa-user"></i>
            </div>
          </div>
          
          {/* Call Info */}
          <div className="absolute top-4 left-4 bg-background bg-opacity-50 p-2 rounded-lg">
            <AvatarName
              src={user.avatar}
              name={user.displayName || user.username}
              subtitle={formatDuration()}
              size="sm"
            />
          </div>
        </div>
        
        {/* Call Controls */}
        <div className="p-6 bg-sidebar flex items-center justify-center space-x-reverse space-x-8">
          <button 
            className={`w-12 h-12 rounded-full ${isMuted ? 'bg-destructive' : 'bg-background'} flex items-center justify-center text-foreground`}
            onClick={() => setIsMuted(!isMuted)}
          >
            <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          </button>
          <button 
            className={`w-12 h-12 rounded-full ${isVideoEnabled ? 'bg-background' : 'bg-destructive'} flex items-center justify-center text-foreground`}
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
          >
            <i className="fas fa-video"></i>
          </button>
          <button 
            className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground"
            onClick={onEnd}
          >
            <i className="fas fa-phone-slash"></i>
          </button>
          <button className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-foreground">
            <i className="fas fa-volume-up"></i>
          </button>
          <button className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-foreground">
            <i className="fas fa-arrows-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

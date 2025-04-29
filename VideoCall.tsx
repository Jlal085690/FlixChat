import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { Call, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

interface VideoCallProps {
  call: Call;
}

export default function VideoCall({ call }: VideoCallProps) {
  const { user } = useAuth();
  const { answerCall, declineCall, endCall } = useChat();
  const [callDuration, setCallDuration] = useState(0);
  const [durationInterval, setDurationInterval] = useState<NodeJS.Timeout | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const isIncoming = user?.id === call.receiverId;
  const isOutgoing = user?.id === call.callerId;
  const isOngoing = call.status === "answered";

  // Get other user info
  useEffect(() => {
    if (!user) return;
    
    const otherUserId = isIncoming ? call.callerId : call.receiverId;
    
    apiRequest("GET", `/api/users/${otherUserId}`)
      .then((res) => res.json())
      .then((userData) => {
        setOtherUser(userData);
      })
      .catch(console.error);
  }, [call, isIncoming, user]);

  // Set up call duration timer
  useEffect(() => {
    if (isOngoing && !durationInterval) {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      
      setDurationInterval(interval);
    }
    
    return () => {
      if (durationInterval) {
        clearInterval(durationInterval);
      }
    };
  }, [isOngoing, durationInterval]);

  const handleAnswer = () => {
    answerCall(call.id);
  };

  const handleDecline = () => {
    declineCall(call.id);
  };

  const handleEnd = () => {
    endCall(call.id);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="h-screen flex flex-col">
        <div className="flex-1 relative">
          {/* Main Video Feed */}
          <div className="w-full h-full bg-black">
            {call.type === "video" && !isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center bg-card">
                {otherUser?.avatarUrl ? (
                  <img 
                    src={otherUser.avatarUrl} 
                    alt={`فيديو ${otherUser.fullName}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl text-muted-foreground">
                    <i className="fas fa-video-slash"></i>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-card">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-primary mb-4">
                  {otherUser?.avatarUrl ? (
                    <img 
                      src={otherUser.avatarUrl} 
                      alt={otherUser.fullName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl text-primary-foreground">
                        {otherUser?.fullName?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {otherUser?.fullName || "جار الاتصال..."}
                </h2>
                {isOngoing ? (
                  <p className="text-muted-foreground">{formatDuration(callDuration)}</p>
                ) : isIncoming ? (
                  <p className="text-secondary">يتصل بك...</p>
                ) : (
                  <p className="text-muted-foreground">جار الاتصال...</p>
                )}
              </div>
            )}
          </div>
          
          {/* Self Video Feed */}
          {call.type === "video" && isOngoing && !isVideoOff && (
            <div className="absolute bottom-4 right-4 w-40 h-60 bg-card rounded-lg overflow-hidden border-2 border-border">
              <div className="w-full h-full flex items-center justify-center bg-primary">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="فيديو المستخدم" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary-foreground">
                    {user?.fullName?.charAt(0) || "أنت"}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Call Info */}
          <div className="absolute top-4 left-4 bg-background bg-opacity-50 p-2 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden ml-3 bg-primary">
                {otherUser?.avatarUrl ? (
                  <img 
                    src={otherUser.avatarUrl} 
                    alt={otherUser.fullName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-primary-foreground">
                      {otherUser?.fullName?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  {otherUser?.fullName || "جار الاتصال..."}
                </h3>
                {isOngoing ? (
                  <p className="text-xs text-muted-foreground">{formatDuration(callDuration)}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {isIncoming ? "يتصل بك..." : "جار الاتصال..."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Call Controls */}
        <div className="p-6 bg-card flex items-center justify-center space-x-reverse space-x-8">
          {isOngoing ? (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                className={`w-12 h-12 rounded-full ${isMuted ? "bg-primary" : "bg-background"}`}
                onClick={() => setIsMuted(!isMuted)}
              >
                <i className={`fas ${isMuted ? "fa-microphone-slash" : "fa-microphone"}`}></i>
              </Button>
              
              {call.type === "video" && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`w-12 h-12 rounded-full ${isVideoOff ? "bg-primary" : "bg-background"}`}
                  onClick={() => setIsVideoOff(!isVideoOff)}
                >
                  <i className={`fas ${isVideoOff ? "fa-video-slash" : "fa-video"}`}></i>
                </Button>
              )}
              
              <Button 
                variant="destructive" 
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={handleEnd}
              >
                <i className="fas fa-phone-slash"></i>
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                className="w-12 h-12 rounded-full bg-background"
                onClick={() => setIsFullScreen(!isFullScreen)}
              >
                <i className={`fas ${isFullScreen ? "fa-compress" : "fa-expand"}`}></i>
              </Button>
            </>
          ) : isIncoming ? (
            <>
              <Button 
                variant="destructive" 
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={handleDecline}
              >
                <i className="fas fa-phone-slash"></i>
              </Button>
              
              <Button 
                variant="default" 
                size="icon"
                className="w-12 h-12 rounded-full bg-success text-white"
                onClick={handleAnswer}
              >
                <i className="fas fa-phone"></i>
              </Button>
            </>
          ) : (
            <Button 
              variant="destructive" 
              size="icon"
              className="w-12 h-12 rounded-full"
              onClick={handleEnd}
            >
              <i className="fas fa-phone-slash"></i>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

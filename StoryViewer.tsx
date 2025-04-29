import { useState, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { Story, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import UserAvatar from "./UserAvatar";

interface StoryViewerProps {
  onClose: () => void;
}

export default function StoryViewer({ onClose }: StoryViewerProps) {
  const { stories, viewStory } = useChat();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyUser, setStoryUser] = useState<User | null>(null);
  const [replyText, setReplyText] = useState("");
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);
  const [storyTimeout, setStoryTimeout] = useState<NodeJS.Timeout | null>(null);

  const currentStory = stories[currentStoryIndex];

  // Reset progress when story changes
  useEffect(() => {
    if (!currentStory) return;
    
    // Get story user info
    apiRequest("GET", `/api/users/${currentStory.userId}`)
      .then((res) => res.json())
      .then((user) => {
        setStoryUser(user);
      })
      .catch(console.error);

    // Mark story as viewed
    viewStory(currentStory.id);

    // Reset progress
    setProgress(0);
    
    // Clear previous intervals
    if (progressInterval) clearInterval(progressInterval);
    if (storyTimeout) clearTimeout(storyTimeout);
    
    // Start new progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total (50ms * 100)
    
    setProgressInterval(interval);
    
    // Auto-advance to next story after 5 seconds
    const timeout = setTimeout(() => {
      handleNextStory();
    }, 5000);
    
    setStoryTimeout(timeout);
    
    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [currentStory, currentStoryIndex, viewStory]);

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      onClose();
    }
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      onClose();
    }
  };

  const handleReply = () => {
    if (!replyText.trim() || !currentStory) return;
    
    // In a real app, we would send a direct message to the story owner
    // For now, just clear the input
    setReplyText("");
  };

  // If there are no stories, close the viewer
  if (!currentStory || !stories.length) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90">
      <div className="h-screen flex flex-col">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden ml-3">
              {storyUser ? (
                <UserAvatar user={storyUser} size="md" />
              ) : (
                <div className="w-full h-full bg-primary"></div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                {storyUser?.fullName || "جار التحميل..."}
              </h3>
              <p className="text-xs text-muted-foreground">
                {currentStory.createdAt
                  ? formatDistanceToNow(new Date(currentStory.createdAt), {
                      locale: arSA,
                      addSuffix: true,
                    })
                  : ""}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-foreground text-xl" onClick={onClose}>
            <i className="fas fa-times"></i>
          </Button>
        </div>
        
        <div className="flex space-x-reverse space-x-1 mb-2 px-4">
          {stories.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded ${
                index === currentStoryIndex
                  ? "bg-secondary"
                  : index < currentStoryIndex
                  ? "bg-foreground"
                  : "bg-muted-foreground bg-opacity-30"
              }`}
              style={
                index === currentStoryIndex
                  ? { width: `${progress}%` }
                  : {}
              }
            ></div>
          ))}
        </div>
        
        <div 
          className="flex-1 flex items-center justify-center p-4 relative"
          onClick={handleNextStory}
        >
          {/* Left area for previous story */}
          <div 
            className="absolute left-0 top-0 w-1/4 h-full z-10"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStory();
            }}
          ></div>
          
          {/* Right area for next story */}
          <div 
            className="absolute right-0 top-0 w-1/4 h-full z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleNextStory();
            }}
          ></div>
          
          <div className="relative w-full max-w-lg">
            {currentStory.mediaUrl ? (
              <img 
                src={currentStory.mediaUrl} 
                alt="قصة" 
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="bg-card p-8 rounded-lg">
                <p className="text-foreground text-xl text-center">{currentStory.content}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="الرد على القصة..."
              className="flex-1 bg-card text-foreground rounded-full py-2 px-4"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-secondary mr-3 text-xl"
              onClick={(e) => {
                e.stopPropagation();
                handleReply();
              }}
              disabled={!replyText.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

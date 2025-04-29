
import { useEffect, useState } from "react";
import { Story, User } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AvatarName } from "@/components/ui/avatar-name";
import { X } from "lucide-react";

interface StoryViewerProps {
  story: Story;
  user: User;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  totalStories?: number;
  currentIndex?: number;
}

export function StoryViewer({
  story,
  user,
  onClose,
  onNext,
  onPrev,
  totalStories = 1,
  currentIndex = 0,
}: StoryViewerProps) {
  const [timeAgo, setTimeAgo] = useState("");
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const storyDate = new Date(story.createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - storyDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      setTimeAgo(`منذ ${diffInMinutes} دقيقة`);
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      setTimeAgo(`منذ ${hours} ساعة`);
    } else {
      setTimeAgo(format(storyDate, "dd MMM", { locale: ar }));
    }
    
    // شريط التقدم والانتقال التلقائي
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onNext?.();
          return 0;
        }
        return prev + 2;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [story, onNext]);
  
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <AvatarName 
          src={user.avatarUrl} 
          name={user.fullName} 
          subtitle={timeAgo}
          size="sm"
        />
        <button 
          onClick={onClose} 
          className="text-white hover:text-gray-300 transition"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg">
          {/* شريط التقدم */}
          <div className="flex space-x-reverse space-x-1 mb-2">
            {Array.from({ length: totalStories }).map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded overflow-hidden bg-white/20">
                <div 
                  className="h-full bg-white transition-all duration-100"
                  style={{ 
                    width: i < currentIndex ? "100%" : 
                           i === currentIndex ? `${progress}%` : "0%" 
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* محتوى القصة */}
          <div className="relative rounded-lg overflow-hidden">
            {/* منطقة النقر للقصة السابقة */}
            {currentIndex > 0 && (
              <div 
                className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev?.();
                }}
              />
            )}
            
            {/* منطقة النقر للقصة التالية */}
            {currentIndex < (totalStories - 1) && (
              <div 
                className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  onNext?.();
                }}
              />
            )}
            
            {story.media && (
              <img 
                src={story.media} 
                alt="قصة" 
                className="w-full h-auto rounded-lg"
                loading="eager"
              />
            )}
            
            {story.content && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                <p className="text-white text-lg">{story.content}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

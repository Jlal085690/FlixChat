import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { Story, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import UserAvatar from "./UserAvatar";

interface StoryItemProps {
  user: User;
  viewed?: boolean;
  onClick: () => void;
}

function StoryItem({ user, viewed = false, onClick }: StoryItemProps) {
  return (
    <div className="flex flex-col items-center" onClick={onClick}>
      <div className={`${viewed ? "story-circle viewed" : "story-circle"} w-16 h-16 rounded-full overflow-hidden mb-1`}>
        <UserAvatar user={user} size="lg" />
      </div>
      <span className="text-xs text-muted-foreground">{user.fullName.split(" ")[0]}</span>
    </div>
  );
}

interface AddStoryProps {
  onClick: () => void;
}

function AddStory({ onClick }: AddStoryProps) {
  return (
    <div className="flex flex-col items-center" onClick={onClick}>
      <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-1">
        <i className="fas fa-plus text-secondary"></i>
      </div>
      <span className="text-xs text-muted-foreground">إضافة قصة</span>
    </div>
  );
}

export default function StoriesList() {
  const { user } = useAuth();
  const { stories, postStory } = useChat();
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [storyContent, setStoryContent] = useState("");
  const [storyMedia, setStoryMedia] = useState("");
  const [storyUsers, setStoryUsers] = useState<Map<number, User>>(new Map());
  const { toast } = useToast();

  // Group stories by user
  const storiesByUser = new Map<number, Story[]>();
  stories.forEach((story) => {
    if (!storiesByUser.has(story.userId)) {
      storiesByUser.set(story.userId, []);
      
      // If we don't have this user's info yet, fetch it
      if (!storyUsers.has(story.userId)) {
        apiRequest("GET", `/api/users/${story.userId}`)
          .then((res) => res.json())
          .then((userData) => {
            setStoryUsers((prev) => new Map(prev).set(story.userId, userData));
          })
          .catch(console.error);
      }
    }
    storiesByUser.get(story.userId)!.push(story);
  });

  const handleAddStory = async () => {
    if (!storyContent.trim() && !storyMedia.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال نص أو إضافة صورة",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await postStory(storyContent, storyMedia || undefined);
      
      setShowStoryDialog(false);
      setStoryContent("");
      setStoryMedia("");
      
      toast({
        title: "تم إضافة القصة",
        description: "تمت إضافة قصتك بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة القصة",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-3 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-foreground">القصص</h2>
        <Button variant="link" className="text-secondary text-sm p-0">عرض الكل</Button>
      </div>
      <div className="flex space-x-reverse space-x-4 overflow-x-auto hide-scrollbar pb-2">
        {/* Add Story Button */}
        <AddStory onClick={() => setShowStoryDialog(true)} />
        
        {/* Story Items */}
        {Array.from(storiesByUser.entries()).map(([userId, userStories]) => {
          const storyUser = storyUsers.get(userId);
          if (!storyUser) return null; // Skip if user info not loaded yet
          
          // Check if any story is viewed
          const allViewed = userStories.every((story) => {
            // Mock viewed state for now - in real app we'd check storyViews
            return Math.random() > 0.5; // Random for demo
          });
          
          return (
            <StoryItem
              key={userId}
              user={storyUser}
              viewed={allViewed}
              onClick={() => {
                // Would open the StoryViewer component
                toast({
                  title: "عرض القصص",
                  description: `عرض قصص ${storyUser.fullName}`,
                });
              }}
            />
          );
        })}
      </div>

      {/* Add Story Dialog */}
      <Dialog open={showStoryDialog} onOpenChange={setShowStoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة قصة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">
                محتوى القصة
              </label>
              <Textarea
                placeholder="أدخل نص القصة..."
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">
                رابط الصورة (اختياري)
              </label>
              <Input
                placeholder="أدخل رابط الصورة"
                value={storyMedia}
                onChange={(e) => setStoryMedia(e.target.value)}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              ستظل القصة متاحة لمدة 24 ساعة من وقت النشر
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStoryDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="default"
              onClick={handleAddStory}
            >
              نشر
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

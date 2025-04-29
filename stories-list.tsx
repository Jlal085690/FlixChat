import { useStories } from "@/hooks/use-stories";
import StoryItem from "./story-item";
import { StoryViewer } from "./story-viewer";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function StoriesList() {
  const { stories, isLoading, addStory, addingStory } = useStories();
  const { user } = useAuth();
  const { toast } = useToast();
  const [storyContent, setStoryContent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentViewingStory, setCurrentViewingStory] = useState(null);

  // تجميع القصص حسب المستخدم
  const userStories = stories && stories.length > 0 ? 
    Array.from(new Set(stories.map(story => story.user?.id)))
      .filter(userId => userId !== undefined)
      .map(userId => {
        const userStoriesArray = stories.filter(story => story.user?.id === userId);
        if (userStoriesArray.length > 0 && userStoriesArray[0].user) {
          return {
            user: userStoriesArray[0].user,
            stories: userStoriesArray
          };
        }
        return null;
      })
      .filter(Boolean) : [];

  const handleAddStory = () => {
    if (!storyContent.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال محتوى للقصة",
        variant: "destructive",
      });
      return;
    }

    addStory(storyContent);
    setStoryContent("");
    setDialogOpen(false);
  };

  const handleViewStory = (userId: number, index: number) => {
    const userStoryGroup = userStories.find(group => group.user.id === userId);
    if (userStoryGroup) {
      setCurrentViewingStory({
        stories: userStoryGroup.stories,
        currentIndex: index,
        user: userStoryGroup.user
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-3 pb-2">
          <div className="w-14 h-14 rounded-full bg-muted animate-pulse"></div>
          <div className="w-14 h-14 rounded-full bg-muted animate-pulse"></div>
          <div className="w-14 h-14 rounded-full bg-muted animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="p-4 overflow-x-auto border-b border-border">
        <div className="flex gap-3 pb-2">
          {/* زر إضافة قصة */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <div className="flex flex-col items-center cursor-pointer">
                <div className="w-14 h-14 bg-card rounded-full flex items-center justify-center border-2 border-primary text-primary">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <span className="text-xs mt-1 text-muted-foreground">إضافة قصة</span>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة قصة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="content">محتوى القصة</Label>
                  <Textarea
                    id="content"
                    placeholder="اكتب شيئاً ليراه أصدقاؤك..."
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleAddStory}
                  disabled={addingStory}
                >
                  {addingStory ? "جاري النشر..." : "نشر القصة"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* قصص المستخدمين */}
          {userStories.map((item) => (
            <StoryItem
              key={item.user.id}
              user={item.user}
              storiesCount={item.stories.length}
              isViewed={false}
              onClick={() => handleViewStory(item.user.id, 0)}
              isCurrentUser={user?.id === item.user.id}
            />
          ))}

          {userStories.length === 0 && (
            <div className="flex items-center justify-center w-full py-2 text-muted-foreground">
              <p className="text-sm">لا توجد قصص متاحة حالياً</p>
            </div>
          )}
        </div>
      </section>

      {/* عارض القصص */}
      {currentViewingStory && (
        <StoryViewer
          story={currentViewingStory.stories[currentViewingStory.currentIndex]}
          user={currentViewingStory.user}
          onClose={() => setCurrentViewingStory(null)}
          onNext={() => {
            if (currentViewingStory.currentIndex < currentViewingStory.stories.length - 1) {
              setCurrentViewingStory({
                ...currentViewingStory,
                currentIndex: currentViewingStory.currentIndex + 1
              });
            } else {
              setCurrentViewingStory(null);
            }
          }}
          onPrev={() => {
            if (currentViewingStory.currentIndex > 0) {
              setCurrentViewingStory({
                ...currentViewingStory,
                currentIndex: currentViewingStory.currentIndex - 1
              });
            }
          }}
          totalStories={currentViewingStory.stories.length}
          currentIndex={currentViewingStory.currentIndex}
        />
      )}
    </>
  );
}
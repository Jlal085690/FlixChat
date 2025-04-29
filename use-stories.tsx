import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./use-auth";
import { Story, User, InsertStory } from "@shared/schema";
import { useToast } from "./use-toast";

type StoryWithUser = Story & { user: User };

type StoriesContextType = {
  stories: StoryWithUser[] | undefined;
  isLoading: boolean;
  currentStoryIndex: number | null;
  currentStoryUserId: number | null;
  viewStory: (userId: number, index: number) => void;
  closeStory: () => void;
  nextStory: () => void;
  prevStory: () => void;
  addStory: (content: string, mediaUrl?: string | null, mediaType?: string) => void;
  addingStory: boolean;
  getUserStories: (userId: number) => StoryWithUser[] | undefined;
};

const StoriesContext = createContext<StoriesContextType | null>(null);

export function StoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStoryUserId, setCurrentStoryUserId] = useState<number | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(null);
  
  // Fetch all active stories
  const {
    data: stories,
    isLoading
  } = useQuery<StoryWithUser[]>({
    queryKey: ["/api/stories"],
    enabled: !!user,
  });
  
  // Add story mutation
  const addStoryMutation = useMutation({
    mutationFn: async (story: InsertStory) => {
      const res = await apiRequest("POST", "/api/stories", story);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate stories query to refresh
      queryClient.invalidateQueries({
        queryKey: ["/api/stories"]
      });
      
      toast({
        title: "تم إضافة القصة",
        description: "تمت إضافة قصتك بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "فشل إضافة القصة",
        description: "حدث خطأ أثناء إضافة القصة",
        variant: "destructive",
      });
    }
  });
  
  // View story mutation
  const viewStoryMutation = useMutation({
    mutationFn: async (storyId: number) => {
      const res = await apiRequest("POST", `/api/stories/${storyId}/view`, {});
      return await res.json();
    }
  });
  
  // View a specific user's story
  const viewStory = (userId: number, index: number = 0) => {
    setCurrentStoryUserId(userId);
    setCurrentStoryIndex(index);
    
    // Mark story as viewed
    const userStories = getUserStories(userId);
    if (userStories && userStories[index]) {
      viewStoryMutation.mutate(userStories[index].id);
    }
  };
  
  // Close the story viewer
  const closeStory = () => {
    setCurrentStoryUserId(null);
    setCurrentStoryIndex(null);
  };
  
  // Get all stories for a specific user
  const getUserStories = (userId: number): StoryWithUser[] | undefined => {
    if (!stories) return undefined;
    return stories.filter(story => story.user.id === userId);
  };
  
  // Navigate to next story
  const nextStory = () => {
    if (currentStoryUserId === null || currentStoryIndex === null) return;
    
    const userStories = getUserStories(currentStoryUserId);
    if (!userStories) return;
    
    // If there are more stories from this user
    if (currentStoryIndex < userStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      viewStoryMutation.mutate(userStories[currentStoryIndex + 1].id);
    } else {
      // Find the next user with stories
      if (!stories) return;
      
      const userIds = [...new Set(stories.map(story => story.user.id))];
      const currentUserIndex = userIds.indexOf(currentStoryUserId);
      
      if (currentUserIndex < userIds.length - 1) {
        // Move to the next user's first story
        const nextUserId = userIds[currentUserIndex + 1];
        setCurrentStoryUserId(nextUserId);
        setCurrentStoryIndex(0);
        
        const nextUserStories = getUserStories(nextUserId);
        if (nextUserStories && nextUserStories[0]) {
          viewStoryMutation.mutate(nextUserStories[0].id);
        }
      } else {
        // We've reached the end, close the viewer
        closeStory();
      }
    }
  };
  
  // Navigate to previous story
  const prevStory = () => {
    if (currentStoryUserId === null || currentStoryIndex === null) return;
    
    // If there are previous stories from this user
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      
      const userStories = getUserStories(currentStoryUserId);
      if (userStories) {
        viewStoryMutation.mutate(userStories[currentStoryIndex - 1].id);
      }
    } else {
      // Find the previous user with stories
      if (!stories) return;
      
      const userIds = [...new Set(stories.map(story => story.user.id))];
      const currentUserIndex = userIds.indexOf(currentStoryUserId);
      
      if (currentUserIndex > 0) {
        // Move to the previous user's last story
        const prevUserId = userIds[currentUserIndex - 1];
        const prevUserStories = getUserStories(prevUserId);
        
        if (prevUserStories) {
          setCurrentStoryUserId(prevUserId);
          setCurrentStoryIndex(prevUserStories.length - 1);
          viewStoryMutation.mutate(prevUserStories[prevUserStories.length - 1].id);
        }
      }
    }
  };
  
  // Add a new story
  const addStory = (content: string, mediaUrl: string | null = null, mediaType: string = "text") => {
    if (!user) return;
    
    // Create expiration date (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    addStoryMutation.mutate({
      userId: user.id,
      content,
      media: mediaUrl || "",
      mediaType: mediaType,
      expiresAt
    });
  };
  
  return (
    <StoriesContext.Provider
      value={{
        stories,
        isLoading,
        currentStoryIndex,
        currentStoryUserId,
        viewStory,
        closeStory,
        nextStory,
        prevStory,
        addStory,
        addingStory: addStoryMutation.isPending,
        getUserStories
      }}
    >
      {children}
    </StoriesContext.Provider>
  );
}

export function useStories() {
  const context = useContext(StoriesContext);
  if (!context) {
    throw new Error("useStories must be used within a StoriesProvider");
  }
  return context;
}

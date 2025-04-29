import { User } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StoryItemProps {
  user: User;
  storiesCount: number;
  isViewed: boolean;
  onClick: () => void;
  isCurrentUser?: boolean;
}

export default function StoryItem({
  user,
  storiesCount,
  isViewed,
  onClick,
  isCurrentUser = false
}: StoryItemProps) {
  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
      <div className={cn(
        "story-circle",
        isViewed && "opacity-70"
      )}>
        <div className="story-inner">
          <Avatar className="w-full h-full">
            <AvatarImage src={user.avatarUrl || ""} alt={user.fullName} />
            <AvatarFallback className="bg-primary/30">
              {user.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <span className={cn(
        "text-xs mt-1",
        isViewed ? "text-muted-foreground" : "text-foreground"
      )}>
        {isCurrentUser ? "قصتك" : user.fullName}
      </span>
    </div>
  );
}

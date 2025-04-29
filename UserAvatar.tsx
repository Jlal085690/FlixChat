import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, UserStatus } from "@shared/schema";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
}

export default function UserAvatar({ user, size = "md", showStatus = false }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-9 h-9",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const statusSizeClasses = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="relative">
      <Avatar className={`${sizeClasses[size]} bg-primary`}>
        <AvatarImage src={user.avatarUrl} alt={user.fullName} />
        <AvatarFallback className="bg-primary text-primary-foreground">{user.fullName.charAt(0)}</AvatarFallback>
      </Avatar>
      
      {showStatus && user.status === UserStatus.ONLINE && (
        <span 
          className={`absolute bottom-0 left-0 ${statusSizeClasses[size]} rounded-full bg-success border-2 border-background`}
        ></span>
      )}
    </div>
  );
}

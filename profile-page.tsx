import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuth();
if (!user) return null;

  if (!user) {
    return <div>جاري التحميل...</div>;
  }

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-card rounded-lg p-6 shadow-md">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.fullName || user.username}</h1>
            {user.bio && <p className="text-muted-foreground mt-1">{user.bio}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
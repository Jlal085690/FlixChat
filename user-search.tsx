
import { useState } from "react";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="البحث عن مستخدم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <User className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {searchResults.map((user) => (
            <div key={user.id} className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer">
              <Avatar>
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
              <div className="mr-3">
                <div className="font-medium">{user.fullName}</div>
                <div className="text-sm text-muted-foreground">@{user.username}</div>
              </div>
              {user.isOnline && (
                <Badge variant="success" className="mr-auto">متصل</Badge>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

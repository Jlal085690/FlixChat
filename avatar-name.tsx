import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarNameProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "offline" | "away" | null;
  subtitle?: string;
  className?: string;
}

export function AvatarName({
  src,
  name,
  size = "md",
  status,
  subtitle,
  className,
}: AvatarNameProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-14 w-14",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative ml-3">
        <Avatar className={cn(sizeClasses[size])}>
          <AvatarImage src={src} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        {status && (
          <span
            className={cn(
              "absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-background",
              {
                "bg-success": status === "online",
                "bg-muted-foreground": status === "offline",
                "bg-yellow-500": status === "away",
              }
            )}
          />
        )}
      </div>
      {(name || subtitle) && (
        <div>
          {name && <div className="font-medium text-foreground">{name}</div>}
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      )}
    </div>
  );
}

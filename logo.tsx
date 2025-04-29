import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white";
  withText?: boolean;
  className?: string;
}

export function Logo({ size = "md", color = "primary", withText = true, className }: LogoProps) {
  const sizeClass = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  }[size];

  const textSizeClass = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  }[size];

  const colorClass = {
    primary: "text-primary",
    white: "text-white",
  }[color];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative", sizeClass)}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("h-full w-full", colorClass)}
        >
          <path
            d="M20 3C10.6 3 3 10.6 3 20C3 29.4 10.6 37 20 37C29.4 37 37 29.4 37 20C37 10.6 29.4 3 20 3Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M20 33.4C22.6569 33.4 24.8 31.2569 24.8 28.6C24.8 25.9431 22.6569 23.8 20 23.8C17.3431 23.8 15.2 25.9431 15.2 28.6C15.2 31.2569 17.3431 33.4 20 33.4Z"
            fill="currentColor"
          />
          <path
            d="M30 18.8C31.7 18.8 33.1 17.4 33.1 15.7C33.1 14 31.7 12.6 30 12.6C28.3 12.6 26.9 14 26.9 15.7C26.9 17.4 28.3 18.8 30 18.8Z"
            fill="currentColor"
          />
          <path
            d="M10 18.8C11.7 18.8 13.1 17.4 13.1 15.7C13.1 14 11.7 12.6 10 12.6C8.3 12.6 6.9 14 6.9 15.7C6.9 17.4 8.3 18.8 10 18.8Z"
            fill="currentColor"
          />
          <path
            d="M25 7.8C26.7 7.8 28.1 6.4 28.1 4.7C28.1 3 26.7 1.6 25 1.6C23.3 1.6 21.9 3 21.9 4.7C21.9 6.4 23.3 7.8 25 7.8Z"
            fill="currentColor"
          />
          <path
            d="M15 7.8C16.7 7.8 18.1 6.4 18.1 4.7C18.1 3 16.7 1.6 15 1.6C13.3 1.6 11.9 3 11.9 4.7C11.9 6.4 13.3 7.8 15 7.8Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {withText && (
        <h1 className={cn("font-bold", textSizeClass, colorClass)}>
          فليكس شات
        </h1>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";

// الألوان المتاحة للتخصيص
const themeColors = [
  { name: "أزرق", value: "blue", bgClass: "bg-blue-500" },
  { name: "أخضر", value: "green", bgClass: "bg-green-500" },
  { name: "أحمر", value: "red", bgClass: "bg-red-500" },
  { name: "بنفسجي", value: "purple", bgClass: "bg-purple-500" },
  { name: "برتقالي", value: "orange", bgClass: "bg-orange-500" },
  { name: "سماوي", value: "cyan", bgClass: "bg-cyan-500" },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [accentColor, setAccentColor] = useState<string>("blue");

  // استعادة إعدادات السمة من التخزين المحلي عند التحميل
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    const savedColor = localStorage.getItem("accentColor");
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // الوضع الافتراضي هو الوضع المظلم
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
    
    if (savedColor) {
      setAccentColor(savedColor);
      document.documentElement.setAttribute("data-accent", savedColor);
    } else {
      // اللون الافتراضي هو الأزرق
      setAccentColor("blue");
      document.documentElement.setAttribute("data-accent", "blue");
    }
  }, []);

  // تبديل بين الأوضاع الفاتح والمظلم
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  // تغيير لون التركيز
  const changeAccentColor = (color: string) => {
    setAccentColor(color);
    document.documentElement.setAttribute("data-accent", color);
    localStorage.setItem("accentColor", color);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          {theme === "light" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">تغيير السمة</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>المظهر</DropdownMenuLabel>
        <DropdownMenuItem onClick={toggleTheme}>
          {theme === "light" ? (
            <>
              <Moon className="ml-2 h-4 w-4" />
              الوضع المظلم
            </>
          ) : (
            <>
              <Sun className="ml-2 h-4 w-4" />
              الوضع الفاتح
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <Palette className="inline-block ml-1 h-4 w-4" />
          لون التركيز
        </DropdownMenuLabel>
        <div className="grid grid-cols-3 gap-1 p-2">
          {themeColors.map((color) => (
            <Toggle
              key={color.value}
              className={`h-8 w-full ${
                accentColor === color.value ? "border-2 border-primary" : ""
              }`}
              pressed={accentColor === color.value}
              onPressedChange={() => changeAccentColor(color.value)}
            >
              <div className={`h-4 w-4 rounded-full ${color.bgClass}`} />
              <span className="mr-1 text-xs">{color.name}</span>
            </Toggle>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
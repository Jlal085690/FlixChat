import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import AuthForms from "@/components/auth/auth-forms";
import { MessageSquare, Users, ClockIcon, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <MessageSquare className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col md:flex-row">
      {/* Auth form section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-6">
        <AuthForms />
      </div>

      {/* Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-primary flex-col justify-center items-center p-8 text-primary-foreground">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">
            <MessageSquare className="h-24 w-24 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-4">FlixChat</h1>
          <p className="text-xl mb-8">تطبيق محادثات اجتماعية بسيط وسريع</p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary-foreground/20 rounded-full p-3">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="text-right flex-1">محادثات خاصة ومجموعات</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-primary-foreground/20 rounded-full p-3">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-right flex-1">قصص مؤقتة تختفي بعد 24 ساعة</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-primary-foreground/20 rounded-full p-3">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 11C20 15.4183 16.4183 19 12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3C16.4183 3 20 6.58172 20 11Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7V11L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-right flex-1">سريع وسهل الاستخدام</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

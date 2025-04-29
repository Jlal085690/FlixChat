import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, registerSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, loginAsGuest } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    },
  });

  const onLoginSubmit = async (data: { username: string; password: string }) => {
    const user = await login(data.username, data.password);
    
    if (user) {
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحبًا بك، ${user.fullName}`,
      });
    }
  };

  const onRegisterSubmit = async (data: { username: string; password: string; fullName: string }) => {
    const user = await register(data.username, data.password, data.fullName);
    
    if (user) {
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `مرحبًا بك، ${user.fullName}`,
      });
    }
  };

  const handleGuestLogin = async () => {
    const user = await loginAsGuest();
    
    if (user) {
      toast({
        title: "تم تسجيل الدخول كضيف",
        description: "يمكنك الاستمتاع بالتطبيق بصلاحيات محدودة",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center px-4">
      {isLogin ? (
        <Card className="w-full max-w-md bg-card">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">FlixChat</h1>
              <p className="text-muted-foreground">تطبيق محادثات اجتماعية بسيط وسريع</p>
            </div>
            
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="أدخل اسم المستخدم" 
                          className="bg-background text-foreground"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">كلمة المرور</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="أدخل كلمة المرور" 
                          className="bg-background text-foreground"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-secondary hover:bg-opacity-90">
                  تسجيل الدخول
                </Button>
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 text-secondary hover:underline"
                    onClick={() => setIsLogin(false)}
                  >
                    إنشاء حساب جديد
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 text-secondary hover:underline"
                    onClick={handleGuestLogin}
                  >
                    الدخول كضيف
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md bg-card">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">FlixChat</h1>
              <p className="text-muted-foreground">إنشاء حساب جديد</p>
            </div>
            
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="أدخل اسمك الكامل" 
                          className="bg-background text-foreground"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="أدخل اسم المستخدم" 
                          className="bg-background text-foreground"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">كلمة المرور</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="أدخل كلمة المرور" 
                          className="bg-background text-foreground"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">تأكيد كلمة المرور</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="أعد كتابة كلمة المرور" 
                          className="bg-background text-foreground"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-secondary hover:bg-opacity-90">
                  إنشاء حساب
                </Button>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 text-secondary hover:underline"
                    onClick={() => setIsLogin(true)}
                  >
                    العودة إلى تسجيل الدخول
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

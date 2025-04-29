import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mail, Lock, User, Image } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form schemas
const loginSchema = z.object({
  username: z.string().min(2, { message: "يجب أن يحتوي اسم المستخدم على حرفين على الأقل" }),
  password: z.string().min(6, { message: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل" })
});

const registerSchema = z.object({
  username: z.string().min(2, { message: "يجب أن يحتوي اسم المستخدم على حرفين على الأقل" }),
  password: z.string().min(6, { message: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل" }),
  confirmPassword: z.string(),
  fullName: z.string().min(2, { message: "يجب أن يحتوي الاسم على حرفين على الأقل" }),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthForms() {
  const { loginMutation, registerMutation, guestLoginMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      bio: "",
      avatarUrl: ""
    }
  });
  
  // Form submission handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };
  
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };
  
  const onGuestLogin = () => {
    guestLoginMutation.mutate();
  };
  
  // Add admin login convenience function
  // تعبئة بيانات حساب المطور تلقائياً
  const onAdminLogin = () => {
    loginForm.setValue("username", "جلال");
    loginForm.setValue("password", "vbnm085690vbnm");
    // تقديم النموذج تلقائياً
    setTimeout(() => {
      loginForm.handleSubmit(onLoginSubmit)();
    }, 500);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">مرحباً بك في تيليجرام عربي</CardTitle>
        <CardDescription>
          تطبيق محادثات عربي بسيط وسريع مشابه لتيليجرام
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستخدم</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="أدخل اسم المستخدم"
                            className="pr-3 pl-10"
                            {...field}
                          />
                        </div>
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
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="أدخل كلمة المرور"
                            className="pr-3 pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : null}
                  تسجيل الدخول
                </Button>

                {/* زر تسجيل دخول المطور */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2 text-primary border-primary"
                  onClick={onAdminLogin}
                  disabled={loginMutation.isPending}
                >
                  تسجيل دخول المطور
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          {/* Register Tab */}
          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستخدم</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="اختر اسم مستخدم"
                            className="pr-3 pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الظاهر</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="الاسم الذي سيظهر للآخرين"
                            className="pr-3 pl-10"
                            {...field}
                          />
                        </div>
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
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="اختر كلمة مرور"
                            className="pr-3 pl-10"
                            {...field}
                          />
                        </div>
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
                      <FormLabel>تأكيد كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="أعد كتابة كلمة المرور"
                            className="pr-3 pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نبذة تعريفية (اختياري)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="نبذة قصيرة عنك"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : null}
                  إنشاء حساب
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onGuestLogin}
          disabled={guestLoginMutation.isPending}
        >
          {guestLoginMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : null}
          الدخول كضيف
        </Button>
      </CardFooter>
    </Card>
  );
}

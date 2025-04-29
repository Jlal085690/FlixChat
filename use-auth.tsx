import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  guestLoginMutation: UseMutationResult<SelectUser, Error, void>;
};

type LoginData = {
  username: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  // نظام المصادقة المحسن - يستخدم خادم الجلسات مع خيار احتياطي للتخزين المحلي
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      try {
        console.log("جاري التحقق من حالة تسجيل الدخول...");
        
        // أولا: محاولة استرداد البيانات من الخادم باستخدام الجلسة
        const res = await fetch("/api/users/me", {
          credentials: "include",
        });
        
        // إذا نجح الطلب، نستخدم بيانات الخادم
        if (res.ok) {
          const userData = await res.json();
          console.log("تم استرداد بيانات المستخدم من الخادم:", userData.username);
          
          // تحديث التخزين المحلي أيضاً بأحدث البيانات
          import("@/lib/auth").then(({ storeUserLocally }) => {
            storeUserLocally(userData);
          });
          
          return userData;
        }
        
        // إذا كان الخطأ 401 (غير مصرح)، نحاول استخدام التخزين المحلي
        if (res.status === 401) {
          console.log("فشل استرداد البيانات من الخادم، محاولة استخدام التخزين المحلي...");
          
          // محاولة استرداد البيانات من التخزين المحلي
          const { getStoredUser, isLoggedInLocally } = await import("@/lib/auth");
          
          if (isLoggedInLocally()) {
            const localUser = getStoredUser();
            if (localUser) {
              console.log("تم استرداد بيانات المستخدم من التخزين المحلي:", localUser.username);
              return localUser as SelectUser;
            }
          }
          
          console.log("المستخدم غير مسجل الدخول");
          return null;
        }
        
        // أي خطأ آخر
        throw new Error(`خطأ في الاستعلام: ${res.status}`);
      } catch (error) {
        console.error("خطأ في استعلام بيانات المستخدم:", error);
        
        // محاولة استرداد البيانات من التخزين المحلي كخيار أخير
        try {
          const { getStoredUser, isLoggedInLocally } = await import("@/lib/auth");
          
          if (isLoggedInLocally()) {
            const localUser = getStoredUser();
            if (localUser) {
              console.log("تم استرداد بيانات المستخدم من التخزين المحلي كخطة بديلة:", localUser.username);
              return localUser as SelectUser;
            }
          }
        } catch (localError) {
          console.error("فشل أيضاً في استرداد البيانات من التخزين المحلي:", localError);
        }
        
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // تحديث كل 5 دقائق
    retry: 1, // محاولة إعادة الاستعلام مرة واحدة فقط في حالة الفشل
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/users/me"], user);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${user.fullName || user.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تسجيل الدخول",
        description: "اسم المستخدم أو كلمة المرور غير صحيحة",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/auth/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/users/me"], user);
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `مرحباً ${user.fullName || user.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل إنشاء الحساب",
        description: "قد يكون اسم المستخدم مستخدماً بالفعل",
        variant: "destructive",
      });
    },
  });

  const guestLoginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/guest", {});
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/users/me"], user);
      toast({
        title: "تم الدخول كضيف",
        description: "يمكنك تصفح التطبيق، ولكن بعض الوظائف قد تكون محدودة",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل الدخول كضيف",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/users/me"], null);
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تسجيل الخروج",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        guestLoginMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import React, { createContext, useState, useEffect, useContext } from "react";
import { User } from "@shared/schema";
import { getCurrentUser, login, logout, register, loginAsGuest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { connectWebSocket, disconnectWebSocket } from "@/lib/socket";

interface AuthContextProps {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User | null>;
  register: (username: string, password: string, fullName: string) => Promise<User | null>;
  loginAsGuest: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAdmin: false,
  isLoading: true,
  login: async () => null,
  register: async () => null,
  loginAsGuest: async () => null,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      // Connect WebSocket after authentication
      connectWebSocket(currentUser.id);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    
    return () => {
      // Disconnect WebSocket on unmount
      disconnectWebSocket();
    };
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const user = await login({ username, password });
      setUser(user);
      connectWebSocket(user.id);
      return user;
    } catch (error) {
      toast({
        title: "فشل تسجيل الدخول",
        description: "اسم المستخدم أو كلمة المرور غير صحيحة",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleRegister = async (username: string, password: string, fullName: string) => {
    try {
      const user = await register({ 
        username, 
        password, 
        confirmPassword: password, 
        fullName 
      });
      setUser(user);
      connectWebSocket(user.id);
      return user;
    } catch (error) {
      toast({
        title: "فشل إنشاء الحساب",
        description: "ربما يكون اسم المستخدم مستخدمًا بالفعل",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleGuestLogin = async () => {
    try {
      const user = await loginAsGuest();
      setUser(user);
      connectWebSocket(user.id);
      return user;
    } catch (error) {
      toast({
        title: "فشل تسجيل الدخول كضيف",
        description: "حدث خطأ أثناء تسجيل الدخول كضيف",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      disconnectWebSocket();
      setUser(null);
    } catch (error) {
      toast({
        title: "فشل تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        isLoading,
        login: handleLogin,
        register: handleRegister,
        loginAsGuest: handleGuestLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

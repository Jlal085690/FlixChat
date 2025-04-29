import { useAuth } from "@/hooks/use-auth";

// تم إزالة شريط التنقل السفلي بناءً على طلب المستخدم
export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;
  return null; // لا يعرض أي شيء
}

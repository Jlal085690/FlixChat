import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import AdminPanel from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation } from 'wouter';


export default function AdminPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation(); //This is not a direct replacement and will require more changes for navigation

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.username !== "جلال")) {
      setLocation("/"); //Attempting to use setLocation here. Requires more significant changes to the app to properly work with wouter.
    }
  }, [user, setLocation]);

  if (!user || (user.role !== "admin" && user.username !== "جلال")) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:mr-64">
        <div className="md:hidden bg-primary p-3 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")} //Attempting to use setLocation here.  Requires more significant changes to the app.
            className="text-primary-foreground"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold mr-4 text-primary-foreground">لوحة المطور</h2>
        </div>

        <div className="flex-1 overflow-hidden">
          <AdminPanel />
        </div>
      </div>
    </div>
  );
}
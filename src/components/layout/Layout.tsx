
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const Layout = () => {
  const { toggleSidebar } = useSidebar();
  
  // Add smooth scrolling to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <SidebarProvider defaultOpen={!window.matchMedia('(max-width: 768px)').matches}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header onMenuClick={toggleSidebar} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;

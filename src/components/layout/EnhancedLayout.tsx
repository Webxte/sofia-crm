
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { PageTransition } from "@/utils/enhanced-transitions";
import { cn } from "@/lib/utils";

export default function EnhancedLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className={cn(
            "flex-1 overflow-auto",
            "p-4 md:p-6 lg:p-8",
            "transition-all duration-300 ease-in-out"
          )}>
            <PageTransition>
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

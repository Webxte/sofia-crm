
import { Home, Users, Calendar, MessagesSquare, ShoppingCart, ClipboardList, Menu, X } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: Home,
  },
  {
    title: "Contacts",
    path: "/contacts",
    icon: Users,
  },
  {
    title: "Meetings",
    path: "/meetings",
    icon: MessagesSquare,
  },
  {
    title: "Tasks",
    path: "/tasks",
    icon: ClipboardList,
  },
  {
    title: "Orders",
    path: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Calendar",
    path: "/calendar",
    icon: Calendar,
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [location, isMobile]);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Mobile sidebar component
  const MobileSidebar = () => (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu size={24} />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary p-1">
                <div className="h-6 w-6 text-white flex items-center justify-center font-semibold">
                  CRM
                </div>
              </div>
              <span className="font-semibold text-lg">CRM System</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X size={18} />
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <div className="px-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 my-1 rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-sidebar-accent text-primary font-medium"
                      : "hover:bg-sidebar-accent/50"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon size={20} className="shrink-0" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="p-4 border-t mt-auto">
            <div className="text-sm text-muted-foreground">
              Logged in as: <span className="font-medium">{isAdmin ? "Admin" : "Agent"}</span>
            </div>
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
              >
                Profile
              </Button>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start mt-2"
                  onClick={() => {
                    setOpen(false);
                    navigate("/reports");
                  }}
                >
                  Reports
                </Button>
              )}
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full justify-start mt-2"
                onClick={() => {
                  const { logout } = useAuth();
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop sidebar component
  return (
    <>
      {isMobile ? (
        <MobileSidebar />
      ) : (
        <SidebarComponent className="border-r border-border">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 px-2">
              <div className="rounded-md bg-primary p-1">
                <div className="h-6 w-6 text-white flex items-center justify-center font-semibold">
                  CRM
                </div>
              </div>
              <span className="font-semibold text-lg">CRM System</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <Link 
                          to={item.path}
                          className={`group transition-all duration-300 ${
                            isActive(item.path) 
                              ? "bg-sidebar-accent text-primary font-medium" 
                              : "hover:bg-sidebar-accent/50"
                          }`}
                        >
                          <item.icon size={20} className="shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto p-4 border-t border-border">
            <div className="mb-2 text-sm text-muted-foreground">
              Logged in as: <span className="font-medium">{isAdmin ? "Admin" : "Agent"}</span>
            </div>
            <SidebarTrigger className="w-full justify-between">
              <span>Collapse sidebar</span>
            </SidebarTrigger>
          </div>
        </SidebarComponent>
      )}
    </>
  );
};

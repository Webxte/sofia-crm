
import { Home, Users, Calendar, MessagesSquare, ShoppingCart, ClipboardList } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
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

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
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
        <SidebarTrigger className="w-full justify-between">
          <span>Collapse sidebar</span>
        </SidebarTrigger>
      </div>
    </SidebarComponent>
  );
};

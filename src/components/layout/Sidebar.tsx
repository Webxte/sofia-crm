
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar";
import {
  BarChart3,
  BookUser,
  Calendar,
  ClipboardList,
  Home,
  MessagesSquare,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const navLinks = [
  { name: "Dashboard", href: "/", icon: <Home className="h-5 w-5" /> },
  {
    name: "Contacts",
    href: "/contacts",
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: "Meetings",
    href: "/meetings",
    icon: <MessagesSquare className="h-5 w-5" />,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
    adminOnly: true,
  }
];

export function Sidebar({ className }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

  // Filter links based on user role - remove adminOnly restriction for Reports
  const filteredLinks = navLinks.filter(link => 
    !link.adminOnly || isAdmin || link.name === "Reports"
  );

  return (
    <SidebarComponent collapsible="offcanvas">
      <SidebarHeader className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <BookUser className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">SimpleCRM</h1>
        </div>
        {isMobile && (
          <SidebarTrigger />
        )}
      </SidebarHeader>
      <SidebarContent>
        <TooltipProvider delayDuration={0}>
          <SidebarMenu>
            {filteredLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton 
                      isActive={location.pathname === link.href}
                      onClick={() => {
                        navigate(link.href);
                        if (isMobile) {
                          toggleSidebar();
                        }
                      }}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">{link.name}</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </TooltipProvider>
      </SidebarContent>
    </SidebarComponent>
  );
}


import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SidebarTrigger,
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
  TimerReset,
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

  // Filter links based on user role
  const filteredLinks = navLinks.filter(link => !link.adminOnly || isAdmin);

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("pb-12", className)}>
        <div className="space-y-4 py-4">
          <div className="px-4 py-2">
            {isMobile && (
              <SidebarTrigger />
            )}

            <div className="flex items-center justify-center mb-4 lg:justify-start">
              <div className="flex items-center gap-2">
                <BookUser className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">SimpleCRM</h1>
              </div>
            </div>
            <div className="space-y-1">
              {filteredLinks.map((link) => (
                <Tooltip key={link.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={location.pathname === link.href ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start",
                        location.pathname === link.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                      onClick={() => navigate(link.href)}
                    >
                      {link.icon}
                      <span className="ms-3">{link.name}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{link.name}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default Sidebar;

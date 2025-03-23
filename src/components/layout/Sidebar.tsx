import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Home, 
  Users, 
  Calendar as CalendarIcon, 
  ListTodo, 
  ShoppingCart, 
  BarChart, 
  Settings,
  Menu,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      title: "Contacts",
      href: "/contacts",
      icon: Users,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: CalendarIcon,
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: ListTodo,
    },
    {
      title: "Orders",
      href: "/orders",
      icon: ShoppingCart,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart,
    },
    ...(isAdmin ? [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      }
    ] : []),
  ];

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 md:hidden"
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-64">
          <SheetHeader className="text-left">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Navigate through your CRM.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 rounded-md p-2 hover:bg-secondary",
                  pathname === item.href
                    ? "bg-secondary font-medium"
                    : "text-muted-foreground",
                  "w-full"
                )}
                onClick={() => setIsSheetOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <div className={cn("hidden md:flex flex-col w-64 border-r px-2 py-4", className)}>
        <div className="mb-4 font-bold">CRM</div>
        <div className="flex flex-col space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-2 rounded-md p-2 hover:bg-secondary",
                pathname === item.href
                  ? "bg-secondary font-medium"
                  : "text-muted-foreground",
                "w-full"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

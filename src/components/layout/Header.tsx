
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BellIcon, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getPageTitle = (pathname: string): string => {
  const path = pathname.split("/")[1];
  
  switch (path) {
    case "":
      return "Dashboard";
    case "contacts":
      return "Contacts";
    case "meetings":
      return "Meetings";
    case "tasks":
      return "Tasks";
    case "orders":
      return "Orders";
    case "calendar":
      return "Calendar";
    default:
      return "Dashboard";
  }
};

export const Header = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState(getPageTitle(location.pathname));
  
  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location.pathname]);

  return (
    <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-white">
      <h1 className="text-xl font-semibold">{pageTitle}</h1>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <BellIcon size={20} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2">
              <UserCircle className="h-6 w-6" />
              <span className="hidden sm:inline-block">franco</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

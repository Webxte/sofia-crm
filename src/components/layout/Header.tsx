
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BellIcon, UserCircle, FileText, UserCog, LogOut, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "./Sidebar";
import ProductImporter from "@/components/orders/ProductImporter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    case "profile":
      return "Profile";
    case "reports":
      return "Reports";
    default:
      return "Dashboard";
  }
};

export const Header = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState(getPageTitle(location.pathname));
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showImporter, setShowImporter] = useState(false);
  
  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-white">
      <div className="flex items-center gap-2">
        <Sidebar />
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <BellIcon size={20} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2">
              <UserCircle className="h-6 w-6" />
              <span className="hidden sm:inline-block">{user?.name || "User"}</span>
              {isAdmin && (
                <span className="hidden sm:inline-flex text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Admin</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <UserCog className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuItem onClick={() => setShowImporter(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Products
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/reports")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Reports
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showImporter} onOpenChange={setShowImporter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
            <DialogDescription>
              Import your products from a CSV file. The file should contain code, description, price, and cost columns.
            </DialogDescription>
          </DialogHeader>
          <ProductImporter onClose={() => setShowImporter(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
};

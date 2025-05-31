
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  CheckSquare,
  ShoppingCart,
  BarChart3,
  Settings,
  Building2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Meetings", url: "/meetings", icon: Calendar },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const adminItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Organization", url: "/organizations/settings", icon: Building2 },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { currentOrganization } = useOrganizations();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isExpanded = navigationItems.some((i) => isActive(i.url)) || (isAdmin && adminItems.some((i) => isActive(i.url)));

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible>
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* Organization Info */}
        <div className="p-4 border-b">
          {!collapsed && (
            <div className="text-sm">
              <p className="font-medium truncate">{currentOrganization?.name}</p>
              <p className="text-muted-foreground text-xs">CRM System</p>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup open={isExpanded}>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

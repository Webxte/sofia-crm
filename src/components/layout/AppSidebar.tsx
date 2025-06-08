
import { useState } from "react"
import { Circle, Square, Triangle, Star, Hexagon } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

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
} from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", url: "/", icon: Circle },
  { title: "Contacts", url: "/contacts", icon: Square },
  { title: "Meetings", url: "/meetings", icon: Triangle },
  { title: "Orders", url: "/orders", icon: Star },
  { title: "Tasks", url: "/tasks", icon: Hexagon },
]

export function AppSidebar() {
  const { collapsed, setOpen } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/"
    return currentPath.startsWith(path)
  }
  
  const isExpanded = items.some((i) => isActive(i.url))
  
  const getNavCls = (isActiveRoute: boolean) =>
    isActiveRoute ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"

  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    if (window.innerWidth < 768) {
      setOpen(false)
    }
  }

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup
          open={isExpanded}
          onOpenChange={() => {}}
        >
          <SidebarGroupLabel>Main</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"} 
                      className={getNavCls(isActive(item.url))}
                      onClick={handleNavClick}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

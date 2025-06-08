
import { useState } from "react"
import { 
  Home, 
  Users, 
  Video, 
  Calendar, 
  ShoppingBag, 
  CheckSquare, 
  Settings 
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

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
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Meetings", url: "/meetings", icon: Video },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Orders", url: "/orders", icon: ShoppingBag },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state, setOpen } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const { isAdmin } = useAuth()

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/"
    return currentPath.startsWith(path)
  }
  
  const getNavCls = (isActiveRoute: boolean) =>
    isActiveRoute ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"

  const handleNavClick = () => {
    // Close sidebar on mobile when any navigation item is clicked
    if (window.innerWidth < 768) {
      setOpen(false)
    }
  }

  // Filter items - Settings only for admins, but show all others
  const filteredItems = items.filter(item => 
    item.title !== "Settings" || isAdmin
  )

  return (
    <Sidebar className="border-r">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">CRM</h2>
        <SidebarTrigger />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"} 
                      className={getNavCls(isActive(item.url))}
                      onClick={handleNavClick}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="text-sm font-medium">{item.title}</span>
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

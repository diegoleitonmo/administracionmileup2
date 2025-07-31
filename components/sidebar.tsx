"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getMenuByRole, getRoleName } from "@/config/menu-config"
import type { MenuItem } from "@/config/menu-config"

interface SidebarProps {
  user: any
  pathname: string
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Sidebar({ user, pathname, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  // Obtener menú filtrado por rol
  const menuItems = user?.role ? getMenuByRole(user.role, pathname) : []

  const toggleSubmenu = (href: string) => {
    setExpandedMenus((prev) => (prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]))
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedMenus.includes(item.href)
    const hasActiveSubmenu = item.submenu?.some((subItem) => subItem.href === pathname)
  const normalizedRole = user?.role && typeof user.role === "object" && "name" in user.role
    ? (user.role as { name: string }).name
    : user?.role
  const menuItems = normalizedRole ? getMenuByRole(normalizedRole, pathname) : []
    return (
      <div key={item.href}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10",
            level > 0 && "ml-4 h-8",
            item.active || hasActiveSubmenu
              ? "bg-purple-50 text-purple-600 hover:bg-purple-50"
              : "text-gray-600 hover:bg-gray-50",
          )}
          onClick={() => (item.hasSubmenu ? toggleSubmenu(item.href) : undefined)}
        >
          <item.icon className={cn("w-4 h-4", item.active ? "text-purple-600" : "")} />
          <span className="flex-1 text-left text-sm">{item.label}</span>
          {item.hasSubmenu &&
            (isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            ))}
        </Button>

        {/* Submenu */}
        {item.hasSubmenu && isExpanded && item.submenu && (
          <div className="ml-4 mt-1 space-y-1">
            {item.submenu.map((subItem) => (
              <Button
                key={subItem.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-8 text-sm",
                  subItem.href === pathname
                    ? "bg-purple-50 text-purple-600 hover:bg-purple-50"
                    : "text-gray-500 hover:bg-gray-50",
                )}
              >
                <subItem.icon className="w-3 h-3" />
                <span className="flex-1 text-left">{subItem.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto transition-transform duration-300 z-40",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      {/* User Profile */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40"} />
            <AvatarFallback>
              {user?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") || "DG"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{user?.name || "David Grey. H"}</h3>
            <div className="flex items-center gap-2">
              {(() => {
                const roleValue =
                  user?.role && typeof user.role === "object" && "name" in user.role
                    ? (user.role as { name: string }).name
                    : user?.role;
                return (
                  <Badge
                    variant={
                      roleValue === "administrador"
                        ? "default"
                        : roleValue === "comercio"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs px-2 py-1 rounded-full"
                  >
                    {getRoleName(roleValue || "asistente")}
                  </Badge>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menú Principal</p>
        </div>

        {menuItems.map((item) => renderMenuItem(item))}

        {/* Role Info */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500">{menuItems.length} opciones disponibles</p>
          </div>
        </div>
      </nav>
    </aside>
  )
}

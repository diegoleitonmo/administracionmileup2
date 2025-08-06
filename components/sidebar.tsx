"use client"

import React, { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getMenuByRole, getRoleName, type MenuItem, type UserRole } from "@/config/menu-config"

interface UserRoleObject {
  name: string
}

interface User {
  name: string
  avatar?: string
  email?: string
  role?: string | UserRoleObject
}

interface SidebarProps {
  user: User | null
  pathname: string
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Sidebar({ user, pathname, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const normalizedRole: UserRole =
    user?.role && typeof user.role === "object" && "name" in user.role
      ? (user.role.name as UserRole)
      : ((user?.role as UserRole) || "asistente")

  const menuItems: MenuItem[] = getMenuByRole(normalizedRole)

  const toggleSubmenu = (href: string) => {
    setExpandedMenus((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    )
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedMenus.includes(item.href)
    const hasActiveSubmenu = item.children?.some((subItem) => subItem.href === pathname)
    const isActive = item.href === pathname

    return (
      <div key={`${item.id}-${item.href}`}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-11 mb-1 rounded-lg transition-all duration-200",
            level > 0 && "ml-4 h-9",
            isActive || hasActiveSubmenu 
              ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-md" 
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
          onClick={() => {
            if (item.children && item.children.length > 0) {
              toggleSubmenu(item.href)
            } else {
              window.location.assign(item.href)
            }
          }}
        >
          <item.icon className={cn(
            "w-5 h-5", 
            isActive || hasActiveSubmenu ? "text-white" : "text-gray-500"
          )} />
          <span className="flex-1 text-left text-sm font-medium">{item.title}</span>
          {item.children && item.children.length > 0 &&
            (isExpanded ? 
              <ChevronDown className={cn("w-4 h-4", isActive || hasActiveSubmenu ? "text-white" : "text-gray-400")} /> : 
              <ChevronRight className={cn("w-4 h-4", isActive || hasActiveSubmenu ? "text-white" : "text-gray-400")} />
            )}
        </Button>

        {item.children && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map((subItem) => (
              <Button
                key={`${subItem.id}-${subItem.href}`}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-9 text-sm rounded-lg transition-all duration-200",
                  subItem.href === pathname 
                    ? "bg-purple-100 text-purple-700 hover:bg-purple-100 font-medium" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                )}
                onClick={() => window.location.assign(subItem.href)}
              >
                <subItem.icon className={cn(
                  "w-4 h-4",
                  subItem.href === pathname ? "text-purple-600" : "text-gray-400"
                )} />
                <span className="flex-1 text-left">{subItem.title}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <React.Fragment>
      {/* Overlay para móvil */}
      <div
        className={cn(
          "fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 lg:hidden",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
        onClick={() => setSidebarOpen && setSidebarOpen(false)}
      ></div>
      <aside
        className={cn(
          // Mobile-first: ancho reducido, padding menor, shadow, top más pequeño
          "w-60 sm:w-64 bg-white border-r border-gray-200 fixed left-0 top-12 sm:top-16 bottom-0 overflow-y-auto transition-transform duration-300 z-50 shadow-lg lg:shadow-none flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        role="navigation"
        aria-label="Menú principal"
      >
        {/* User Profile - Mobile-first paddings, compact */}
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-white shadow-sm">
              <AvatarImage src={user?.avatar || "/placeholder.svg?height=48&width=48"} />
              <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                {user?.name?.split(" ").map((n) => n[0]).join("") || "DG"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{user?.name || "Usuario"}</h3>
              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                <Badge
                  variant={
                    normalizedRole === "administrador"
                      ? "default"
                      : normalizedRole === "comercio"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                  {getRoleName(normalizedRole)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Menu - Mobile-first spacing */}
        <nav className="px-2 sm:px-3 py-3 sm:py-4 space-y-2 flex-1">
          <div className="mb-4 sm:mb-6">
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 px-1 sm:px-2">
              Menú Principal
            </p>
          </div>

          {menuItems.map((item) => renderMenuItem(item))}
        </nav>

        {/* Footer del sidebar - Mobile-first paddings */}
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50">
          <div className="bg-white rounded-xl p-2 sm:p-3 shadow-sm border">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] sm:text-xs font-medium text-gray-700">Sistema Activo</span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500">{menuItems.length} opciones disponibles</p>
          </div>
        </div>
      </aside>
    </React.Fragment>
  )
}

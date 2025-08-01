"use client"

import { useState } from "react"
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

export function Sidebar({ user, pathname, sidebarOpen }: SidebarProps) {
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

    return (
      <div key={`${item.id}-${item.href}`}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10",
            level > 0 && "ml-4 h-8",
            hasActiveSubmenu ? "bg-purple-50 text-purple-600 hover:bg-purple-50" : "text-gray-600 hover:bg-gray-50"
          )}
          onClick={() => {
            if (item.children && item.children.length > 0) {
              toggleSubmenu(item.href)
            } else {
              window.location.assign(item.href)
            }
          }}
        >
          <item.icon className={cn("w-4 h-4")} />
          <span className="flex-1 text-left text-sm">{item.title}</span>
          {item.children && item.children.length > 0 &&
            (isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />)}
        </Button>

        {item.children && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map((subItem) => (
              <Button
                key={`${subItem.id}-${subItem.href}`}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-8 text-sm",
                  subItem.href === pathname ? "bg-purple-50 text-purple-600 hover:bg-purple-50" : "text-gray-500 hover:bg-gray-50"
                )}
                onClick={() => window.location.assign(subItem.href)}
              >
                <subItem.icon className="w-3 h-3" />
                <span className="flex-1 text-left">{subItem.title}</span>
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
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* User Profile */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40"} />
            <AvatarFallback>
              {user?.name?.split(" ").map((n) => n[0]).join("") || "DG"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{user?.name || "Usuario"}</h3>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  normalizedRole === "administrador"
                    ? "default"
                    : normalizedRole === "comercio"
                    ? "secondary"
                    : "outline"
                }
                className="text-xs px-2 py-1 rounded-full"
              >
                {getRoleName(normalizedRole)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-1">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Menú Principal
          </p>
        </div>

        {menuItems.map((item) => renderMenuItem(item))}

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

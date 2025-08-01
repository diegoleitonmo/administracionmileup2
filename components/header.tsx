"use client"

import {
  Search,
  Menu,
  Maximize2,
  Mail,
  Bell,
  Power,
  MoreHorizontal,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import type { UserRole } from "@/config/menu-config"


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RoleSwitcher } from "@/components/role-switcher"
import { getRoleName } from "@/config/menu-config"

interface HeaderProps {
  user: any
  userMenuOpen: boolean
  setUserMenuOpen: (open: boolean) => void
  handleLogout: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Header({
  user,
  userMenuOpen,
  setUserMenuOpen,
  handleLogout,
  sidebarOpen,
  setSidebarOpen,
}: HeaderProps) {
  // Depuración: mostrar el usuario recibido
  // Normalizar el rol: si user.role es string válida, úsala; si es objeto con name, usa name; si no, usa null
const normalizedRole: UserRole =
  user?.role && typeof user.role === "object" && "name" in user.role
    ? (user.role.name as UserRole)
    : ((user?.role as UserRole) || "asistente")
 
  // Si no hay rol válido, usar "asistente" como fallback
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      {/* Left Section */}
  <div className="flex items-center gap-2">
      <Image
        src="/mileupLogo.png"
        alt="MileUp Logo"
        width={90}   // Ajusta el tamaño según necesites
        height={90}
        className="rounded-md"
        priority
      />
    </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search projects" className="pl-10 bg-gray-50 border-gray-200" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Role Switcher - Solo para demo */}
        <RoleSwitcher />

        {/* User Menu */}
        <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar || "/placeholder.svg?height=32&width=32"} />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "DG"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <span className="text-sm font-medium text-gray-700 block">{
                  typeof user?.name === "string"
                    ? user.name
                    : Array.isArray(user?.name)
                    ? user.name.join(" ")
                    : "Sin usuario"
                }</span>
                
              <span className="text-xs text-gray-500">
                {normalizedRole === "administrador" ? normalizedRole : "Prueba"}
              </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{
                  typeof user?.name === "string"
                    ? user.name
                    : Array.isArray(user?.name)
                    ? user.name.join(" ")
                    : "David Greymaax"
                }</p>
                <p className="text-xs text-gray-500">{user?.email || "david.grey@company.com"}</p>
                <p className="text-xs text-purple-600 font-medium">{normalizedRole === "administrador" ? normalizedRole : "Prueba"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1 ml-4">
         
         
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4 text-gray-500" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
          </Button>
        
        
        </div>
      </div>
    </header>
  )
}

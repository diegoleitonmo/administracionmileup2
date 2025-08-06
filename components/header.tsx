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
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 px-2 sm:px-4 lg:px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Botón hamburguesa para móviles con diseño más moderno */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </Button>
        
        {/* Logo responsive - más pequeño en móvil */}
        <div className="flex items-center">
          <Image
            src="/mileupLogo.png"
            alt="MileUp Logo"
            width={75}
            height={75}
            className="rounded-md hidden sm:block"
            priority
          />
          <Image
            src="/mileupLogo.png"
            alt="MileUp"
            width={50}
            height={50}
            className="rounded-md sm:hidden"
            priority
          />
        </div>
      </div>

      {/* Center Section - Search responsive */}
      <div className="flex-1 max-w-sm mx-2 sm:mx-4 lg:mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Buscar..." 
            className="pl-10 h-9 bg-gray-50 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
          />
        </div>
      </div>

      {/* Right Section - Más compacto en móvil */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
        {/* Role Switcher - Solo desktop */}
        <div className="hidden xl:block">
          <RoleSwitcher />
        </div>

        {/* Búsqueda para móviles - Botón más moderno */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Search className="w-5 h-5 text-gray-600" />
        </Button>

        {/* Notificaciones - Solo en tablets+ */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg"
        >
          <Bell className="w-5 h-5 text-gray-600" />
        </Button>

        {/* User Menu - Más compacto en móvil */}
        <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
              <Avatar className="w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-gray-200">
                <AvatarImage src={user?.avatar || "/placeholder.svg?height=32&width=32"} />
                <AvatarFallback className="text-xs sm:text-sm font-medium bg-purple-100 text-purple-700">
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "DG"}
                </AvatarFallback>
              </Avatar>
              {/* Info del usuario - Solo visible en tablets+ */}
              <div className="text-left hidden sm:block">
                <span className="text-sm font-medium text-gray-700 block truncate max-w-24 lg:max-w-none">{
                  typeof user?.name === "string"
                    ? user.name
                    : Array.isArray(user?.name)
                    ? user.name.join(" ")
                    : "Sin usuario"
                }</span>
                <span className="text-xs text-gray-500 hidden lg:block">
                  {normalizedRole === "administrador" ? normalizedRole : "Prueba"}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hidden sm:block" />
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

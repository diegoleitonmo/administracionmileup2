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
  let normalizedRole = null;
 
  // Si no hay rol válido, usar "asistente" como fallback
  const roleToShow = normalizedRole || "asistente";
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h18v4H3V3zm0 6h18v4H3V9zm0 6h18v4H3v-4z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-purple-600">Purple</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="w-4 h-4" />
        </Button>
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
                <span className="text-xs text-gray-500">{getRoleName(roleToShow)}</span>
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
                <p className="text-xs text-purple-600 font-medium">{getRoleName(roleToShow)}</p>
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
          <Button variant="ghost" size="sm">
            <Maximize2 className="w-4 h-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="sm">
            <Mail className="w-4 h-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4 text-gray-500" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
          </Button>
          <Button variant="ghost" size="sm">
            <Power className="w-4 h-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </div>
    </header>
  )
}

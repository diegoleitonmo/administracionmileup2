"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { getRoleName } from "@/config/menu-config"
import { ChevronDown, Shield, ShoppingCart, Users } from "lucide-react"

export function RoleSwitcher() {
  const { user, switchRole } = useAuth()

  const roles = [
    { value: "administrador", label: "Administrador", icon: Shield, color: "default" },
    { value: "comercio", label: "Comercio", icon: ShoppingCart, color: "secondary" },
    { value: "asistente", label: "Asistente", icon: Users, color: "outline" },
  ] as const

  // user.role puede ser string o objeto, extraer el nombre si es necesario
  const userRoleValue =
    user?.role && typeof user.role === "object" && "name" in user.role
      ? (user.role as { name: string }).name
      : user?.role
  // Si userRoleValue es un objeto, extraer el nombre
  const normalizedRole = typeof userRoleValue === "object" && userRoleValue !== null && "name" in userRoleValue
    ? (userRoleValue as { name: string }).name
    : userRoleValue
  const currentRole = roles.find((role) => role.value === normalizedRole)

  return (
    <DropdownMenu>
   
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Cambiar Rol (Demo)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onClick={() => switchRole(role.value)}
            className={user?.role === role.value ? "bg-purple-50" : ""}
          >
            <role.icon className="mr-2 h-4 w-4" />
            <span>{role.label}</span>
            {user?.role === role.value && (
              <Badge variant="secondary" className="ml-auto text-xs">
                Actual
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

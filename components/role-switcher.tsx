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

  const currentRole = roles.find((role) => role.value === user?.role)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          {currentRole && <currentRole.icon className="w-4 h-4" />}
          <Badge variant={currentRole?.color as any} className="text-xs">
            {getRoleName(user?.role || "asistente")}
          </Badge>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
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

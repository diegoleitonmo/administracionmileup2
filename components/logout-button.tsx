"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
  showIcon?: boolean
  className?: string
}

export function LogoutButton({ variant = "ghost", size = "sm", showIcon = true, className = "" }: LogoutButtonProps) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    if (typeof window !== "undefined") {
      localStorage.removeItem("strapi_jwt")
      localStorage.removeItem("strapi_user")
      document.cookie = "strapi-token=; Max-Age=0; path=/;"
    }
    router.push("/login")
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      <span>Cerrar Sesión</span>
    </Button>
  )
}

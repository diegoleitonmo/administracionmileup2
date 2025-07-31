"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { strapiAuth } from "@/lib/strapi-auth"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const [strapiUser, setStrapiUser] = useState<any>(null)
  // Normalizar user para evitar errores de React child
  const normalizedUser = (() => {
    const baseUser = strapiUser || user
    if (!baseUser) return null
    return {
      ...baseUser,
      name:
        typeof baseUser.name === "string"
          ? baseUser.name
          : Array.isArray(baseUser.name)
          ? baseUser.name.join(" ")
          : baseUser.username || baseUser.email || "Usuario",
      role:
        baseUser.role && typeof baseUser.role === "object" && "name" in baseUser.role
          ? baseUser.role.name
          : baseUser.role || "asistente",
    }
  })()

  useEffect(() => {
    const fetchStrapiUser = async () => {
      const token = strapiAuth.getStoredToken()
      if (token) {
        try {
          const userData = await strapiAuth.getCurrentUser(token)
          setStrapiUser(userData)
        } catch (err) {
          setStrapiUser(null)
        }
      }
    }
    fetchStrapiUser()
  }, [])

  const handleLogout = () => {
    logout()
    if (typeof window !== "undefined") {
      localStorage.removeItem("mileup_jwt")
      localStorage.removeItem("mileup_user")
      document.cookie = "auth-token=; Max-Age=0; path=/;"
    }
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={normalizedUser}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
        handleLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex">
        <Sidebar user={normalizedUser} pathname={pathname} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-64"}`}>{children}</main>
      </div>
    </div>
  )
}

// Mantener compatibilidad con el nombre anterior
export const DashboardLayout = AdminLayout

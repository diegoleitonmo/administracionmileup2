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

  // LOGS DE DIAGNÓSTICO DETALLADOS
  console.log("=== DASHBOARD LAYOUT DEBUG ===")
  console.log("useAuth user:", user)
  console.log("strapiUser:", strapiUser)

  // Normalizar user para evitar errores de React child
  const normalizedUser = (() => {
    const baseUser = strapiUser || user
    console.log("baseUser (strapiUser || user):", baseUser)

    if (!baseUser) {
      console.log("No base user found, returning null")
      return null
    }

    const normalized = {
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

    console.log("Normalized user:", normalized)
    console.log("Normalized user role:", normalized.role)
    console.log("=== END DASHBOARD LAYOUT DEBUG ===")

    return normalized
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
      <div className="flex pt-14 sm:pt-16">
        {/* Sidebar hamburguesa: oculto en móvil, visible en desktop */}
        <Sidebar user={normalizedUser} pathname={pathname} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 min-w-0">
          <div className="w-full mx-auto py-4 px-2 sm:px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Mantener compatibilidad con el nombre anterior
export const DashboardLayout = AdminLayout

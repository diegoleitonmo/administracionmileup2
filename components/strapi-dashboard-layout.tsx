"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { useStrapiAuth } from "@/hooks/use-strapi-auth"

interface StrapiDashboardLayoutProps {
  children: React.ReactNode
}

export function StrapiDashboardLayout({ children }: StrapiDashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useStrapiAuth()

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  // Mapear usuario de Strapi al formato esperado por los componentes
  const mappedUser = user
    ? {
        id: user.id.toString(),
        name: user.username,
        email: user.email,
        role: user.role?.type === "authenticated" ? "asistente" : "administrador", // Mapear según tu lógica
        avatar: null,
        department: user.role?.name || "Usuario",
      }
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={mappedUser}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
        handleLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex">
        <Sidebar user={mappedUser} pathname={pathname} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-64"}`}>{children}</main>
      </div>
    </div>
  )
}

// Mantener compatibilidad
export const AdminLayout = StrapiDashboardLayout

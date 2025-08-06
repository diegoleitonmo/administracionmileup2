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
        name: user.username,
        email: user.email,
        avatar: undefined,
        role: user.role?.type === "authenticated" ? "asistente" : "administrador", // Mapear según tu lógica
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
        {/* Main content con padding adaptativo tipo app móvil */}
        <main className={`flex-1 transition-all duration-300 pt-16 min-h-screen ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-64"
        } ml-0`}>
          {/* Container responsive con márgenes tipo app móvil */}
          <div className="w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8 max-w-full lg:max-w-7xl lg:mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Overlay para móviles cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

// Mantener compatibilidad
export const AdminLayout = StrapiDashboardLayout

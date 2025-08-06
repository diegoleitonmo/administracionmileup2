"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useStrapiAuth } from "@/hooks/use-strapi-auth"
import { Loader2 } from "lucide-react"

interface StrapiAuthGuardProps {
  children: React.ReactNode
}

export function StrapiAuthGuard({ children }: StrapiAuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useStrapiAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Esperar a que termine de cargar antes de redirigir
    if (isLoading) return

    // No autenticado y no está en login → enviar a login
    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login")
    }

    // Autenticado pero está en login → enviar al dashboard
    if (isAuthenticated && pathname === "/login") {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Loading state mientras valida el hook
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // No autenticado y no está en login → no mostrar nada hasta que redirija
  if (!isAuthenticated && pathname !== "/login") return null

  // Debug solo en desarrollo
  if (isAuthenticated && user && process.env.NODE_ENV === "development") {
    console.log("Usuario autenticado:", {
      id: user.id,
      email: user.email,
      role: user.role?.name,
      confirmed: user.confirmed,
      blocked: user.blocked,
    })
  }

  return <>{children}</>
}

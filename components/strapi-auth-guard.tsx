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
    // Si no está cargando y no está autenticado, redirigir a login
    if (!isLoading && !isAuthenticated && pathname !== "/login") {
      router.push("/login")
    }
    // Si está autenticado y está en login, redirigir al dashboard
    else if (!isLoading && isAuthenticated && pathname === "/login") {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router, pathname])

  // Mostrar loading mientras se verifica la autenticación
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

  // Si no está autenticado y no está en login, no mostrar nada (se redirigirá)
  if (!isAuthenticated && pathname !== "/login") {
    return null
  }

  // Mostrar información del usuario autenticado en desarrollo
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

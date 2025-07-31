"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
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
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado y no está en login, no mostrar nada (se redirigirá)
  if (!isAuthenticated && pathname !== "/login") {
    return null
  }

  return <>{children}</>
}

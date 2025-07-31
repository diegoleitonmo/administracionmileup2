"use client"

import { useState, useEffect, useCallback } from "react"
import { strapiAuth, type StrapiUser, type LoginCredentials } from "@/lib/strapi-auth"

interface AuthState {
  user: StrapiUser | null
  jwt: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export function useStrapiAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    jwt: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  // Cargar datos de autenticación al inicializar
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        console.log("🔄 Cargando datos de autenticación...")

        const storedToken = strapiAuth.getStoredToken()
        const storedUser = strapiAuth.getStoredUser()

        console.log("📦 Datos almacenados:", {
          hasToken: !!storedToken,
          hasUser: !!storedUser,
          userEmail: storedUser?.email,
          userRole: storedUser?.role?.name,
        })

        if (storedToken && storedUser) {
          console.log("🔍 Validando token almacenado...")

          // Validar que el token siga siendo válido
          const isValid = await strapiAuth.validateToken(storedToken)

          if (isValid) {
            console.log("✅ Token válido, usuario autenticado")
            setAuthState({
              user: storedUser,
              jwt: storedToken,
              isLoading: false,
              isAuthenticated: true,
              error: null,
            })
          } else {
            console.log("❌ Token inválido, limpiando datos")
            strapiAuth.logout()
            setAuthState({
              user: null,
              jwt: null,
              isLoading: false,
              isAuthenticated: false,
              error: null,
            })
          }
        } else {
          console.log("📭 No hay datos de autenticación almacenados")
          setAuthState({
            user: null,
            jwt: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          })
        }
      } catch (error) {
        console.error("❌ Error cargando datos de autenticación:", error)
        strapiAuth.logout()
        setAuthState({
          user: null,
          jwt: null,
          isLoading: false,
          isAuthenticated: false,
          error: error instanceof Error ? error.message : "Error de autenticación",
        })
      }
    }

    loadAuthData()
  }, [])

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      console.log("🚀 Iniciando login...")
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      const authData = await strapiAuth.login(credentials)

      console.log("✅ Login exitoso:", {
        userId: authData.user.id,
        email: authData.user.email,
        roleName: authData.user.role?.name,
      })

      // Guardar datos de autenticación
      strapiAuth.saveAuthData(authData)

      setAuthState({
        user: authData.user,
        jwt: authData.jwt,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      })

      return authData
    } catch (error) {
      console.error("❌ Error en login:", error)
      const errorMessage = error instanceof Error ? error.message : "Error de login"
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }, [])

  // Logout
  const logout = useCallback(() => {
    console.log("🚪 Cerrando sesión...")
    strapiAuth.logout()
    setAuthState({
      user: null,
      jwt: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    })
  }, [])

  // Refrescar datos del usuario
  const refreshUser = useCallback(async () => {
    if (!authState.jwt) {
      console.log("⚠️ No hay JWT para refrescar usuario")
      return
    }

    try {
      console.log("🔄 Refrescando datos del usuario...")
      const currentUser = await strapiAuth.getCurrentUser(authState.jwt)

      console.log("✅ Usuario refrescado:", {
        id: currentUser.id,
        email: currentUser.email,
        roleName: currentUser.role?.name,
      })

      setAuthState((prev) => ({
        ...prev,
        user: currentUser,
      }))

      // Actualizar usuario en localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("strapi_user", JSON.stringify(currentUser))
      }
    } catch (error) {
      console.error("❌ Error refrescando usuario:", error)
      // Si hay error, probablemente el token expiró
      logout()
    }
  }, [authState.jwt, logout])

  return {
    ...authState,
    login,
    logout,
    refreshUser,
  }
}

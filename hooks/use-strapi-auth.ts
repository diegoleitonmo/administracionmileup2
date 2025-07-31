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
        const storedToken = strapiAuth.getStoredToken()
        const storedUser = strapiAuth.getStoredUser()

        if (storedToken && storedUser) {
          // Validar que el token siga siendo válido
          const isValid = await strapiAuth.validateToken(storedToken)

          if (isValid) {
            // Obtener datos actualizados del usuario
            const currentUser = await strapiAuth.getCurrentUser(storedToken)

            setAuthState({
              user: currentUser,
              jwt: storedToken,
              isLoading: false,
              isAuthenticated: true,
              error: null,
            })
          } else {
            // Token inválido, limpiar datos
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
          setAuthState({
            user: null,
            jwt: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          })
        }
      } catch (error) {
        console.error("Error loading auth data:", error)
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
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      const authData = await strapiAuth.login(credentials)

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
    if (!authState.jwt) return

    try {
      const currentUser = await strapiAuth.getCurrentUser(authState.jwt)
      setAuthState((prev) => ({
        ...prev,
        user: currentUser,
      }))

      // Actualizar usuario en localStorage
      localStorage.setItem("strapi_user", JSON.stringify(currentUser))
    } catch (error) {
      console.error("Error refreshing user:", error)
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

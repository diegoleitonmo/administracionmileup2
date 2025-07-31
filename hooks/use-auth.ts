"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "administrador" | "comercio" | "asistente"
  avatar?: string
  department?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Simular carga de datos del usuario desde localStorage
    const loadUser = () => {
      try {
        // Buscar usuario y token de Strapi
        const storedUser = localStorage.getItem("strapi_user") || localStorage.getItem("mileup_user")
        const token = localStorage.getItem("strapi_jwt") || localStorage.getItem("mileup_jwt")

        if (storedUser && token) {
          const user = JSON.parse(storedUser)
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        console.error("Error loading user:", error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    loadUser()
  }, [])

  const logout = () => {
    // Limpiar ambos tipos de datos
    localStorage.removeItem("strapi_jwt")
    localStorage.removeItem("strapi_user")
    localStorage.removeItem("mileup_jwt")
    localStorage.removeItem("mileup_user")
    document.cookie = "strapi-token=; Max-Age=0; path=/;"
    document.cookie = "auth-token=; Max-Age=0; path=/;"
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  const login = (user: User, token: string) => {
    localStorage.setItem("mileup_user", JSON.stringify(user))
    localStorage.setItem("mileup_jwt", token)
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: true,
    })
  }

  // Función para cambiar rol (solo para demo)
  const switchRole = (newRole: "administrador" | "comercio" | "asistente") => {
    if (authState.user) {
      const updatedUser = { ...authState.user, role: newRole }
      setAuthState({
        ...authState,
        user: updatedUser,
      })
      localStorage.setItem("mileup_user", JSON.stringify(updatedUser))
    }
  }

  return {
    ...authState,
    logout,
    login,
    switchRole, // Solo para demo
  }
}

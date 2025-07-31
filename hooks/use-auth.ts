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
        const storedUser = localStorage.getItem("mileup_user")
        const token = localStorage.getItem("mileup_jwt")

        if (storedUser && token) {
          const user = JSON.parse(storedUser)
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          // No hay usuario almacenado, iniciar sin autenticar
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

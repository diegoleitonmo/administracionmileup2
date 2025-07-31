"use client"

// Configuración base de Strapi
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"

export interface StrapiUser {
  id: number
  documentId: string
  username: string
  email: string
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  publishedAt: string
  role?: {
    id: number
    documentId: string
    name: string
    description: string
    type: string
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

export interface StrapiAuthResponse {
  jwt: string
  user: StrapiUser
}

export interface LoginCredentials {
  identifier: string // email o username
  password: string
}

class StrapiAuthService {
  private baseURL: string

  constructor(baseURL: string = STRAPI_URL) {
    this.baseURL = baseURL
  }

  // Login con Strapi
  async login(credentials: LoginCredentials): Promise<StrapiAuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Error de autenticación")
      }

      const data: StrapiAuthResponse = await response.json()
      return data
    } catch (error) {
      console.error("Login Error:", error)
      throw error
    }
  }

  // Obtener datos del usuario actual con JWT
  async getCurrentUser(jwt: string): Promise<StrapiUser> {
    try {
      const response = await fetch(`${this.baseURL}/api/users/me?populate=*`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Error al obtener usuario")
      }

      const user: StrapiUser = await response.json()
      return user
    } catch (error) {
      console.error("Get Current User Error:", error)
      throw error
    }
  }

  // Obtener todos los usuarios (solo para administradores)
  async getAllUsers(jwt: string): Promise<StrapiUser[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/users?populate=*`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Error al obtener usuarios")
      }

      const users: StrapiUser[] = await response.json()
      return users
    } catch (error) {
      console.error("Get All Users Error:", error)
      throw error
    }
  }

  // Obtener usuario por ID
  async getUserById(id: number, jwt: string): Promise<StrapiUser> {
    try {
      const response = await fetch(`${this.baseURL}/api/users/${id}?populate=*`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Error al obtener usuario")
      }

      const user: StrapiUser = await response.json()
      return user
    } catch (error) {
      console.error("Get User By ID Error:", error)
      throw error
    }
  }

  // Validar JWT
  async validateToken(jwt: string): Promise<boolean> {
    try {
      await this.getCurrentUser(jwt)
      return true
    } catch (error) {
      return false
    }
  }

  // Logout (limpiar token del cliente)
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("strapi_jwt")
      localStorage.removeItem("strapi_user")
      document.cookie = "strapi-token=; Max-Age=0; path=/;"
    }
  }

  // Guardar token y usuario en localStorage
  saveAuthData(authData: StrapiAuthResponse): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("strapi_jwt", authData.jwt)
      localStorage.setItem("strapi_user", JSON.stringify(authData.user))

      // También guardar en cookie para SSR
      document.cookie = `strapi-token=${authData.jwt}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 días
    }
  }

  // Obtener token guardado
  getStoredToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("strapi_jwt")
    }
    return null
  }

  // Obtener usuario guardado
  getStoredUser(): StrapiUser | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("strapi_user")
      if (userStr) {
        try {
          return JSON.parse(userStr)
        } catch (error) {
          console.error("Error parsing stored user:", error)
          return null
        }
      }
    }
    return null
  }
}

export const strapiAuth = new StrapiAuthService()

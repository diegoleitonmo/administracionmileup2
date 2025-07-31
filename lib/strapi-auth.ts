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

  // Verificar conexión con Strapi
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      return response.ok
    } catch (error) {
      console.error("Strapi connection error:", error)
      return false
    }
  }

  // Login con Strapi
  async login(credentials: LoginCredentials): Promise<StrapiAuthResponse> {
    try {
      // Verificar conexión primero
      const isConnected = await this.checkConnection()
      if (!isConnected) {
        throw new Error(
          "No se puede conectar con el servidor Strapi. Verifica que esté ejecutándose en " + this.baseURL,
        )
      }

      console.log("Intentando login con:", {
        url: `${this.baseURL}/api/auth/local`,
        identifier: credentials.identifier,
      })

      const response = await fetch(`${this.baseURL}/api/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: { message: `Error HTTP ${response.status}: ${response.statusText}` },
        }))

        console.error("Login error response:", errorData)

        // Mensajes de error más específicos
        if (response.status === 400) {
          throw new Error("Credenciales inválidas. Verifica tu email y contraseña.")
        } else if (response.status === 429) {
          throw new Error("Demasiados intentos de login. Espera unos minutos.")
        } else if (response.status >= 500) {
          throw new Error("Error del servidor. Verifica que Strapi esté funcionando correctamente.")
        }

        throw new Error(errorData.error?.message || `Error de autenticación (${response.status})`)
      }

      const data: StrapiAuthResponse = await response.json()
      console.log("Login successful:", { userId: data.user.id, email: data.user.email })

      return data
    } catch (error) {
      console.error("Login Error:", error)

      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Error de conexión. Verifica que Strapi esté ejecutándose en " + this.baseURL)
      }

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
        const errorData = await response.json().catch(() => ({
          error: { message: `Error HTTP ${response.status}` },
        }))
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
        const errorData = await response.json().catch(() => ({
          error: { message: `Error HTTP ${response.status}` },
        }))
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
        const errorData = await response.json().catch(() => ({
          error: { message: `Error HTTP ${response.status}` },
        }))
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

  // Obtener información de configuración
  getConfig() {
    return {
      baseURL: this.baseURL,
      hasApiToken: !!process.env.NEXT_PUBLIC_STRAPI_API_TOKEN,
      apiToken: process.env.NEXT_PUBLIC_STRAPI_API_TOKEN
        ? process.env.NEXT_PUBLIC_STRAPI_API_TOKEN.substring(0, 10) + "..."
        : "No configurado",
    }
  }
}

export const strapiAuth = new StrapiAuthService()

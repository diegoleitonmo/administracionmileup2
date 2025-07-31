"use client"

// Configuración base de Strapi
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN

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

export interface ConnectionTestResult {
  success: boolean
  status?: number
  contentType?: string
  error?: string
  isHtml?: boolean
  responsePreview?: string
  url?: string
}

class StrapiAuthService {
  private baseURL: string
  private apiToken?: string

  constructor(baseURL: string = STRAPI_URL) {
    this.baseURL = baseURL.replace(/\/$/, "") // Remove trailing slash
    this.apiToken = STRAPI_API_TOKEN
  }

  // Configurar headers con manejo inteligente de tokens
  private getHeaders(useJWT?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    if (useJWT) {
      console.log("🔑 Usando JWT de usuario para autenticación")
      headers["Authorization"] = `Bearer ${useJWT}`
    } else if (this.apiToken) {
      console.log("🔑 Usando API Token para autenticación")
      headers["Authorization"] = `Bearer ${this.apiToken}`
    } else {
      console.log("⚠️ No hay token disponible")
    }

    return headers
  }

  // Test completo de conectividad
  async testConnection(): Promise<ConnectionTestResult> {
    const testUrls = [`${this.baseURL}`, `${this.baseURL}/api`, `${this.baseURL}/api/auth/local`]

    for (const url of testUrls) {
      try {
        console.log(`🧪 Probando URL: ${url}`)

        const response = await fetch(url, {
          method: url.includes("/auth/local") ? "POST" : "GET",
          headers: this.getHeaders(),
          body: url.includes("/auth/local")
            ? JSON.stringify({
                identifier: "test@test.com",
                password: "test",
              })
            : undefined,
          signal: AbortSignal.timeout(10000),
        })

        const contentType = response.headers.get("content-type") || ""
        const isJson = contentType.includes("application/json")
        const isHtml = contentType.includes("text/html") || contentType.includes("text/plain")

        let responseText = ""
        let responsePreview = ""

        try {
          responseText = await response.text()
          responsePreview = responseText.substring(0, 300) + (responseText.length > 300 ? "..." : "")
        } catch (textError) {
          console.error("❌ Error leyendo respuesta:", textError)
        }

        console.log(`📡 Respuesta de ${url}:`, {
          status: response.status,
          statusText: response.statusText,
          contentType,
          isJson,
          isHtml,
          responsePreview: responsePreview.substring(0, 100),
        })

        // Si encontramos una respuesta JSON válida (incluso con error 400), es buena señal
        if (isJson && !isHtml) {
          return {
            success: true,
            status: response.status,
            contentType,
            isHtml: false,
            responsePreview,
            url,
          }
        }

        // Si es HTML, continuar probando otras URLs
        if (isHtml || responseText.startsWith("<!DOCTYPE") || responseText.startsWith("<html")) {
          console.log(`⚠️ ${url} devuelve HTML, probando siguiente URL...`)
          continue
        }

        // Si llegamos aquí y la respuesta es ok, asumir que es válida
        if (response.ok) {
          return {
            success: true,
            status: response.status,
            contentType,
            responsePreview,
            url,
          }
        }
      } catch (error) {
        console.error(`❌ Error probando ${url}:`, error)
        continue
      }
    }

    // Si ninguna URL funcionó
    return {
      success: false,
      error: "No se pudo conectar con ningún endpoint de Strapi",
      responsePreview: "Todas las URLs de prueba fallaron",
    }
  }

  // Verificar conexión básica con Strapi
  async checkConnection(): Promise<boolean> {
    try {
      const testResult = await this.testConnection()
      return testResult.success
    } catch (error) {
      console.error("❌ Error verificando conexión:", error)
      return false
    }
  }

  // Verificar si la respuesta es HTML en lugar de JSON
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get("content-type") || ""
    const responseText = await response.text()

    console.log("📡 Detalles de respuesta:", {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      contentType,
      responsePreview: responseText.substring(0, 200),
    })

    // Si la respuesta es HTML, es un error
    if (contentType.includes("text/html") || responseText.startsWith("<!DOCTYPE") || responseText.startsWith("<html")) {
      console.error("❌ Servidor devolvió HTML en lugar de JSON")
      console.error("📄 Contenido HTML:", responseText.substring(0, 500))

      throw new Error(
        `El servidor devolvió HTML en lugar de JSON. Esto indica que:\n` +
          `1. La URL ${response.url} no es un endpoint válido de API\n` +
          `2. Strapi no está configurado correctamente\n` +
          `3. Hay un problema de enrutamiento en el servidor\n` +
          `4. El servidor web (nginx/apache) está interceptando las peticiones\n\n` +
          `Verifica que Strapi esté ejecutándose y que la URL sea correcta.`,
      )
    }

    // Si no hay contenido, devolver objeto vacío
    if (!responseText.trim()) {
      console.warn("⚠️ Respuesta vacía del servidor")
      return {}
    }

    // Intentar parsear como JSON
    try {
      return JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ Error parseando JSON:", parseError)
      console.error("📄 Contenido de respuesta:", responseText)
      throw new Error(`Error parseando respuesta JSON: ${parseError.message}`)
    }
  }

  // Login con Strapi con múltiples intentos de URL
  async login(credentials: LoginCredentials): Promise<StrapiAuthResponse> {
    const loginUrls = [
      `${this.baseURL}/api/auth/local`,
      `${this.baseURL}/auth/local`, // Fallback sin /api
    ]

    let lastError: Error | null = null

    for (const loginUrl of loginUrls) {
      try {
        console.log("🚀 Intentando login con URL:", loginUrl)
        console.log("👤 Identifier:", credentials.identifier)

        const response = await fetch(loginUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(credentials),
          signal: AbortSignal.timeout(15000),
        })

        console.log(`📡 Respuesta de login (${loginUrl}):`, {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get("content-type"),
        })

        // Si obtenemos HTML, probar la siguiente URL
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("text/html")) {
          console.log(`⚠️ ${loginUrl} devuelve HTML, probando siguiente URL...`)
          continue
        }

        const responseData = await this.parseResponse(response)

        if (!response.ok) {
          console.error("❌ Error en login:", responseData)

          if (response.status === 400) {
            const errorMessage = responseData?.error?.message || "Credenciales inválidas"
            throw new Error(`Credenciales inválidas: ${errorMessage}`)
          } else if (response.status === 429) {
            throw new Error("Demasiados intentos de login. Espera unos minutos.")
          } else if (response.status >= 500) {
            throw new Error("Error del servidor. Verifica que Strapi esté funcionando correctamente.")
          }

          throw new Error(responseData?.error?.message || `Error de autenticación (${response.status})`)
        }

        // Validar estructura de respuesta
        if (!responseData.jwt || !responseData.user) {
          console.error("❌ Estructura de respuesta inválida:", responseData)
          throw new Error("Respuesta de autenticación inválida: faltan campos requeridos")
        }

        console.log("✅ Login exitoso con URL:", loginUrl)
        console.log("📊 Datos básicos:", {
          userId: responseData.user.id,
          email: responseData.user.email,
          hasJWT: !!responseData.jwt,
        })

        // Intentar obtener datos completos del usuario usando API Token
        try {
          console.log("🔍 Obteniendo datos completos del usuario...")
          const fullUserData = await this.getUserById(responseData.user.id)

          return {
            jwt: responseData.jwt,
            user: fullUserData,
          }
        } catch (userError) {
          console.warn("⚠️ No se pudieron obtener datos completos, usando datos básicos:", userError)
          return responseData
        }
      } catch (error) {
        console.error(`❌ Error con URL ${loginUrl}:`, error)
        lastError = error as Error
        continue
      }
    }

    // Si llegamos aquí, todas las URLs fallaron
    console.error("❌ Todas las URLs de login fallaron")

    if (lastError) {
      throw lastError
    }

    throw new Error(
      `No se pudo conectar con Strapi. URLs probadas:\n${loginUrls.join("\n")}\n\n` +
        `Verifica que:\n` +
        `1. Strapi esté ejecutándose en ${this.baseURL}\n` +
        `2. El endpoint /api/auth/local esté disponible\n` +
        `3. No haya problemas de CORS\n` +
        `4. La configuración de red sea correcta`,
    )
  }

  // Obtener datos del usuario actual con JWT
  async getCurrentUser(jwt: string): Promise<StrapiUser> {
    const userUrls = [
      `${this.baseURL}/api/users/me?populate=role`,
      `${this.baseURL}/users/me?populate=role`, // Fallback
    ]

    for (const userUrl of userUrls) {
      try {
        console.log("🔍 Obteniendo usuario actual con URL:", userUrl)

        const response = await fetch(userUrl, {
          method: "GET",
          headers: this.getHeaders(jwt),
          signal: AbortSignal.timeout(10000),
        })

        // Si obtenemos HTML, probar la siguiente URL
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("text/html")) {
          console.log(`⚠️ ${userUrl} devuelve HTML, probando siguiente URL...`)
          continue
        }

        const responseData = await this.parseResponse(response)

        if (!response.ok) {
          console.error("❌ Error obteniendo usuario actual:", responseData)
          continue
        }

        console.log("✅ Usuario actual obtenido con URL:", userUrl)
        console.log("📊 Datos:", {
          id: responseData.id,
          email: responseData.email,
          roleName: responseData.role?.name,
        })

        return responseData
      } catch (error) {
        console.error(`❌ Error con URL ${userUrl}:`, error)
        continue
      }
    }

    throw new Error("No se pudo obtener datos del usuario actual")
  }

  // Obtener usuario por ID usando API Token
  async getUserById(id: number): Promise<StrapiUser> {
    const userUrls = [
      `${this.baseURL}/api/users/${id}?populate=role`,
      `${this.baseURL}/users/${id}?populate=role`, // Fallback
    ]

    if (!this.apiToken) {
      throw new Error("API Token no configurado")
    }

    for (const userUrl of userUrls) {
      try {
        console.log(`🔍 Obteniendo usuario ${id} con URL:`, userUrl)

        const response = await fetch(userUrl, {
          method: "GET",
          headers: this.getHeaders(),
          signal: AbortSignal.timeout(10000),
        })

        // Si obtenemos HTML, probar la siguiente URL
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("text/html")) {
          console.log(`⚠️ ${userUrl} devuelve HTML, probando siguiente URL...`)
          continue
        }

        const responseData = await this.parseResponse(response)

        if (!response.ok) {
          console.error("❌ Error obteniendo usuario por ID:", responseData)
          continue
        }

        console.log("✅ Usuario obtenido por ID con URL:", userUrl)
        console.log("📊 Datos:", {
          id: responseData.id,
          email: responseData.email,
          roleName: responseData.role?.name,
        })

        return responseData
      } catch (error) {
        console.error(`❌ Error con URL ${userUrl}:`, error)
        continue
      }
    }

    throw new Error(`No se pudo obtener usuario con ID ${id}`)
  }

  // Obtener todos los usuarios usando API Token
  async getAllUsers(): Promise<StrapiUser[]> {
    const usersUrls = [
      `${this.baseURL}/api/users?populate=role`,
      `${this.baseURL}/users?populate=role`, // Fallback
    ]

    if (!this.apiToken) {
      throw new Error("API Token no configurado")
    }

    for (const usersUrl of usersUrls) {
      try {
        console.log("📋 Obteniendo todos los usuarios con URL:", usersUrl)

        const response = await fetch(usersUrl, {
          method: "GET",
          headers: this.getHeaders(),
          signal: AbortSignal.timeout(10000),
        })

        // Si obtenemos HTML, probar la siguiente URL
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("text/html")) {
          console.log(`⚠️ ${usersUrl} devuelve HTML, probando siguiente URL...`)
          continue
        }

        const responseData = await this.parseResponse(response)

        if (!response.ok) {
          console.error("❌ Error obteniendo usuarios:", responseData)
          continue
        }

        console.log(`✅ ${responseData.length} usuarios obtenidos con URL:`, usersUrl)
        return responseData
      } catch (error) {
        console.error(`❌ Error con URL ${usersUrl}:`, error)
        continue
      }
    }

    throw new Error("No se pudieron obtener los usuarios")
  }

  // Validar JWT
  async validateToken(jwt: string): Promise<boolean> {
    try {
      console.log("🔍 Validando token JWT...")
      await this.getCurrentUser(jwt)
      console.log("✅ Token válido")
      return true
    } catch (error) {
      console.log("❌ Token inválido:", error.message)
      return false
    }
  }

  // Logout
  logout(): void {
    console.log("🚪 Cerrando sesión...")
    if (typeof window !== "undefined") {
      localStorage.removeItem("strapi_jwt")
      localStorage.removeItem("strapi_user")
      document.cookie = "strapi-token=; Max-Age=0; path=/;"
    }
  }

  // Guardar datos de autenticación
  saveAuthData(authData: StrapiAuthResponse): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("strapi_jwt", authData.jwt)
      localStorage.setItem("strapi_user", JSON.stringify(authData.user))

      document.cookie = `strapi-token=${authData.jwt}; path=/; max-age=${7 * 24 * 60 * 60}`

      console.log("💾 Datos de autenticación guardados:", {
        userId: authData.user.id,
        email: authData.user.email,
        roleName: authData.user.role?.name,
      })
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

  // Obtener configuración
  getConfig() {
    return {
      baseURL: this.baseURL,
      hasApiToken: !!this.apiToken,
      apiToken: this.apiToken ? this.apiToken.substring(0, 10) + "..." : "No configurado",
    }
  }

  // Obtener información de diagnóstico
  async getDiagnosticInfo(): Promise<any> {
    console.log("🔍 Ejecutando diagnóstico completo...")

    const testResult = await this.testConnection()
    const config = this.getConfig()

    return {
      config,
      connectionTest: testResult,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        strapiUrl: process.env.NEXT_PUBLIC_STRAPI_URL,
        hasApiToken: !!process.env.NEXT_PUBLIC_STRAPI_API_TOKEN,
      },
      timestamp: new Date().toISOString(),
    }
  }
}

export const strapiAuth = new StrapiAuthService()

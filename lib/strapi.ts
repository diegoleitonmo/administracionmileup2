
"use client"
// Helper para obtener el rango de fechas de hoy en formato ISO (usado para filtros Strapi)
export function getTodayDateRange(field: string = "createdAt") {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return {
    [`${field}`]: {
      $gte: start.toISOString(),
      $lte: end.toISOString(),
    },
  }
}

// Configuración base de Strapi
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN

interface StrapiResponse<T> {
  data: T
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

interface StrapiError {
  error: {
    status: number
    name: string
    message: string
    details?: any
  }
}

class StrapiService {
  private baseURL: string
  private apiToken?: string
  private userJWT?: string

  constructor(baseURL: string = STRAPI_URL, apiToken?: string) {
    this.baseURL = baseURL
    this.apiToken = apiToken || STRAPI_API_TOKEN
  }

  // Configurar JWT del usuario autenticado
  setUserJWT(jwt: string) {
    this.userJWT = jwt
  }

  // Limpiar JWT del usuario
  clearUserJWT() {
    this.userJWT = undefined
  }

  // Configurar headers por defecto
  private getHeaders(customHeaders?: Record<string, string>, useUserJWT = false): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...customHeaders,
    }

    // Usar JWT del usuario para operaciones autenticadas o API Token para operaciones del sistema
    if (useUserJWT && this.userJWT) {
      headers["Authorization"] = `Bearer ${this.userJWT}`
    } else if (this.apiToken) {
      headers["Authorization"] = `Bearer ${this.apiToken}`
    }

    return headers
  }

  // Manejar respuestas de Strapi
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: StrapiError = await response.json()
      throw new Error(`Strapi Error: ${errorData.error.message}`)
    }

    return response.json()
  }

  // GET - Obtener datos
  /**
   * GET - Obtener datos
   * Para filtrar solo los registros del día de hoy:
   *   filters: getTodayDateRange("createdAt")
   */
  async get<T>(
    endpoint: string,
    params?: {
      populate?: string | string[]
      filters?: Record<string, any>
      sort?: string | string[]
      pagination?: {
        page?: number
        pageSize?: number
        start?: number
        limit?: number
      }
      fields?: string[]
      locale?: string
    },
    useUserJWT = false,
  ): Promise<StrapiResponse<T>> {
    try {
      const url = new URL(`${this.baseURL}/api/${endpoint}`)

      // Agregar parámetros de consulta
      if (params) {
        if (params.populate) {
          const populate = Array.isArray(params.populate) ? params.populate.join(",") : params.populate
          url.searchParams.append("populate", populate)
        }

        if (params.filters) {
          // Serializar filtros anidados correctamente, soportando arrays ($or, $and)
          const buildFilterParams = (obj: any, prefix = "") => {
            Object.entries(obj).forEach(([key, value]) => {
              const paramKey = prefix ? `${prefix}[${key}]` : `filters[${key}]`;
              if (Array.isArray(value)) {
                value.forEach((item, idx) => {
                  buildFilterParams(item, `${paramKey}[${idx}]`);
                });
              } else if (typeof value === "object" && value !== null) {
                buildFilterParams(value, paramKey);
              } else {
                url.searchParams.append(paramKey, String(value));
              }
            });
          };
          buildFilterParams(params.filters);
        }

        if (params.sort) {
          const sort = Array.isArray(params.sort) ? params.sort.join(",") : params.sort
          url.searchParams.append("sort", sort)
        }

        if (params.pagination) {
          Object.entries(params.pagination).forEach(([key, value]) => {
            if (value !== undefined) {
              url.searchParams.append(`pagination[${key}]`, String(value))
            }
          })
        }

        if (params.fields) {
          url.searchParams.append("fields", params.fields.join(","))
        }

        if (params.locale) {
          url.searchParams.append("locale", params.locale)
        }
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders({}, useUserJWT),
      })

      return this.handleResponse<StrapiResponse<T>>(response)
    } catch (error) {
      console.error("GET Error:", error)
      throw error
    }
  }

  // POST - Crear datos
  async post<T>(
    endpoint: string,
    data: any,
    options?: {
      populate?: string | string[]
      locale?: string
    },
    useUserJWT = false,
  ): Promise<StrapiResponse<T>> {
    try {
      const url = new URL(`${this.baseURL}/api/${endpoint}`)

      // Agregar parámetros opcionales
      if (options?.populate) {
        const populate = Array.isArray(options.populate) ? options.populate.join(",") : options.populate
        url.searchParams.append("populate", populate)
      }

      if (options?.locale) {
        url.searchParams.append("locale", options.locale)
      }

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: this.getHeaders({}, useUserJWT),
        body: JSON.stringify({ data }),
      })

      return this.handleResponse<StrapiResponse<T>>(response)
    } catch (error) {
      console.error("POST Error:", error)
      throw error
    }
  }

  // PUT - Actualizar datos
  async put<T>(
    endpoint: string,
    id: string | number,
    data: any,
    options?: {
      populate?: string | string[]
      locale?: string
    },
    useUserJWT = false,
  ): Promise<StrapiResponse<T>> {
    try {
      const url = new URL(`${this.baseURL}/api/${endpoint}/${id}`)

      // Agregar parámetros opcionales
      if (options?.populate) {
        const populate = Array.isArray(options.populate) ? options.populate.join(",") : options.populate
        url.searchParams.append("populate", populate)
      }

      if (options?.locale) {
        url.searchParams.append("locale", options.locale)
      }

      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: this.getHeaders({}, useUserJWT),
        body: JSON.stringify({ data }),
      })

      return this.handleResponse<StrapiResponse<T>>(response)
    } catch (error) {
      console.error("PUT Error:", error)
      throw error
    }
  }

  // DELETE - Eliminar datos
  async delete<T>(endpoint: string, id: string | number, useUserJWT = false): Promise<StrapiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}/api/${endpoint}/${id}`, {
        method: "DELETE",
        headers: this.getHeaders({}, useUserJWT),
      })

      return this.handleResponse<StrapiResponse<T>>(response)
    } catch (error) {
      console.error("DELETE Error:", error)
      throw error
    }
  }

  // Upload de archivos
  async upload(
    files: File | File[],
    options?: {
      ref?: string
      refId?: string | number
      field?: string
    },
    useUserJWT = false,
  ): Promise<any> {
    try {
      const formData = new FormData()

      if (Array.isArray(files)) {
        files.forEach((file) => formData.append("files", file))
      } else {
        formData.append("files", files)
      }

      if (options?.ref) formData.append("ref", options.ref)
      if (options?.refId) formData.append("refId", String(options.refId))
      if (options?.field) formData.append("field", options.field)

      const response = await fetch(`${this.baseURL}/api/upload`, {
        method: "POST",
        headers: this.getHeaders(
          {
            // Remover Content-Type para que el browser lo configure automáticamente
            "Content-Type": undefined as any,
          },
          useUserJWT,
        ),
        body: formData,
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error("Upload Error:", error)
      throw error
    }
  }
}

// Instancia por defecto
export const strapi = new StrapiService()

// Exportar la clase para crear instancias personalizadas
export { StrapiService }
export type { StrapiResponse, StrapiError }

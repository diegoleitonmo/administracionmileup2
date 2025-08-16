"use client"

import { strapi } from "@/lib/strapi"

export interface CiudadStrapi {
  id: number
  documentId: string
  nombre: string
  vigente: boolean
  createdAt: string
  updatedAt: string
  publishedAt: string
}

class CiudadesService {
  private endpoint = "ciudades"

  async getCiudades(options?: {
    filters?: Record<string, any>
    sort?: string[]
    pagination?: { page?: number; pageSize?: number }
    populate?: string | string[]
  }) {
    return strapi.get<CiudadStrapi[]>(
      `${this.endpoint}`,
      {
        ...options,
      },
      false // Usa API Token
    )
  }
}

export const ciudadesService = new CiudadesService()

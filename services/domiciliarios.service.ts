"use client"

import { strapi } from "@/lib/strapi"

export interface DomiciliarioStrapi {
  id: number
  documentId: string
  attributes: {
    nombre: string
    telefono: string
    ciudad: string
    transporte: "moto" | "bicicleta" | "carro" | "a_pie"
    identificacion: string
    correo: string
    estado: "activo" | "inactivo" | "suspendido"
    disponible: "disponible" | "ocupado" | "desconectado"
    fechaRegistro: string
    serviciosCompletados: number
    calificacion: number
    avatar?: {
      data?: {
        id: number
        attributes: {
          url: string
          name: string
        }
      }
    }
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

export class DomiciliariosService {
  private endpoint = "domiciliarios"

  // Obtener todos los domiciliarios (usando API Token)
  async getAll(options?: {
    filters?: Record<string, any>
    sort?: string[]
    pagination?: { page?: number; pageSize?: number }
  }) {
    return strapi.get<DomiciliarioStrapi[]>(
      this.endpoint,
      {
        populate: ["avatar"],
        ...options,
      },
      false, // Usar API Token, no JWT del usuario
    )
  }

  // Obtener un domiciliario por ID (usando API Token)
  async getById(id: string | number) {
    return strapi.get<DomiciliarioStrapi>(
      `${this.endpoint}/${id}`,
      {
        populate: ["avatar"],
      },
      false, // Usar API Token
    )
  }

  // Crear nuevo domiciliario (usando API Token)
  async create(data: Omit<DomiciliarioStrapi["attributes"], "createdAt" | "updatedAt" | "publishedAt">) {
    return strapi.post<DomiciliarioStrapi>(
      this.endpoint,
      data,
      {
        populate: ["avatar"],
      },
      false, // Usar API Token
    )
  }

  // Actualizar domiciliario (usando API Token)
  async update(id: string | number, data: Partial<DomiciliarioStrapi["attributes"]>) {
    return strapi.put<DomiciliarioStrapi>(
      this.endpoint,
      id,
      data,
      {
        populate: ["avatar"],
      },
      false, // Usar API Token
    )
  }

  // Eliminar domiciliario (usando API Token)
  async delete(id: string | number) {
    return strapi.delete(this.endpoint, id, false) // Usar API Token
  }

  // Filtrar por ciudad
  async getByCity(ciudad: string) {
    return this.getAll({
      filters: {
        ciudad: {
          $eq: ciudad,
        },
      },
    })
  }

  // Filtrar por estado
  async getByEstado(estado: "activo" | "inactivo" | "suspendido") {
    return this.getAll({
      filters: {
        estado: {
          $eq: estado,
        },
      },
    })
  }

  // Filtrar por disponibilidad
  async getByDisponibilidad(disponible: "disponible" | "ocupado" | "desconectado") {
    return this.getAll({
      filters: {
        disponible: {
          $eq: disponible,
        },
      },
    })
  }

  // Buscar domiciliarios
  async search(query: string) {
    return this.getAll({
      filters: {
        $or: [
          { nombre: { $containsi: query } },
          { correo: { $containsi: query } },
          { telefono: { $containsi: query } },
          { identificacion: { $containsi: query } },
        ],
      },
    })
  }

  // Cambiar disponibilidad
  async cambiarDisponibilidad(id: string | number, disponible: "disponible" | "ocupado" | "desconectado") {
    return this.update(id, { disponible })
  }

  // Cambiar estado
  async cambiarEstado(id: string | number, estado: "activo" | "inactivo" | "suspendido") {
    return this.update(id, { estado })
  }
}

export const domiciliariosService = new DomiciliariosService()

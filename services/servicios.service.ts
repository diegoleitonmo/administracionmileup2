"use client"

import { strapi } from "@/lib/strapi"

export interface ServicioStrapi {
  id: number
  documentId: string
  attributes: {
    comercio: string
    estado: "pendiente" | "en_proceso" | "en_camino" | "entregado" | "cancelado"
    direccion: string
    fecha: string
    tiempoRestante: number
    tiempoTotal: number
    domiciliario?: {
      data?: {
        id: number
        documentId: string
        attributes: {
          nombre: string
          telefono: string
        }
      }
    }
    cliente?: {
      data?: {
        id: number
        documentId: string
        attributes: {
          nombre: string
          telefono: string
        }
      }
    }
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

export class ServiciosService {
  private endpoint = "servicios"

  // Obtener todos los servicios (usando API Token)
  async getAll(options?: {
    filters?: Record<string, any>
    sort?: string[]
    pagination?: { page?: number; pageSize?: number }
  }) {
    return strapi.get<ServicioStrapi[]>(
      this.endpoint,
      {
        populate: ["domiciliario", "cliente"],
        ...options,
      },
      false, // Usar API Token
    )
  }

  // Obtener un servicio por ID (usando API Token)
  async getById(id: string | number) {
    return strapi.get<ServicioStrapi>(
      `${this.endpoint}/${id}`,
      {
        populate: ["domiciliario", "cliente"],
      },
      false, // Usar API Token
    )
  }

  // Crear nuevo servicio (usando API Token)
  async create(data: Omit<ServicioStrapi["attributes"], "createdAt" | "updatedAt" | "publishedAt">) {
    return strapi.post<ServicioStrapi>(
      this.endpoint,
      data,
      {
        populate: ["domiciliario", "cliente"],
      },
      false, // Usar API Token
    )
  }

  // Actualizar servicio (usando API Token)
  async update(id: string | number, data: Partial<ServicioStrapi["attributes"]>) {
    return strapi.put<ServicioStrapi>(
      this.endpoint,
      id,
      data,
      {
        populate: ["domiciliario", "cliente"],
      },
      false, // Usar API Token
    )
  }

  // Eliminar servicio (usando API Token)
  async delete(id: string | number) {
    return strapi.delete(this.endpoint, id, false) // Usar API Token
  }

  // Filtrar por estado
  async getByEstado(estado: "pendiente" | "en_proceso" | "en_camino" | "entregado" | "cancelado") {
    return this.getAll({
      filters: {
        estado: {
          $eq: estado,
        },
      },
    })
  }

  // Filtrar por domiciliario
  async getByDomiciliario(domiciliarioId: number) {
    return this.getAll({
      filters: {
        domiciliario: {
          id: {
            $eq: domiciliarioId,
          },
        },
      },
    })
  }

  // Servicios activos (no entregados ni cancelados)
  async getActivos() {
    return this.getAll({
      filters: {
        estado: {
          $notIn: ["entregado", "cancelado"],
        },
      },
      sort: ["createdAt:desc"],
    })
  }

  // Cambiar estado del servicio
  async cambiarEstado(
    id: string | number,
    estado: "pendiente" | "en_proceso" | "en_camino" | "entregado" | "cancelado",
  ) {
    return this.update(id, { estado })
  }

  // Asignar domiciliario
  async asignarDomiciliario(servicioId: string | number, domiciliarioId: number) {
    return this.update(servicioId, {
      domiciliario: domiciliarioId as any,
      estado: "en_proceso",
    })
  }

  // Buscar servicios
  async search(query: string) {
    return this.getAll({
      filters: {
        $or: [{ comercio: { $containsi: query } }, { direccion: { $containsi: query } }],
      },
    })
  }
}

export const serviciosService = new ServiciosService()

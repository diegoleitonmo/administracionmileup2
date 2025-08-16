// Nuevo modelo para colaborador desde /colaboradors
export interface ColaboradorStrapi {
  id: number
  documentId: string
  nombre: string
  apellido: string
  direccion: string
  telefono: string
  tipotransporte: string
  tipoIdentificacion: string
  numeroIdentificacion: string
  correoElectronico: string
  datoBancario: string | null
  Activo: boolean
  disponibilidad: boolean
  createdAt: string
  updatedAt: string
  publishedAt: string
  ciudad: {
    id: number
    documentId: string
    nombre: string
    vigente: boolean
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

"use client"

import { strapi } from "@/lib/strapi"

export class DomiciliariosService {
  // Obtener todos los colaboradores (usando API Token)
  async getColaboradores(options?: {
    filters?: Record<string, any>
    sort?: string[]
    pagination?: { page?: number; pageSize?: number }
  }) {
    return strapi.get<ColaboradorStrapi[]>(
      "colaboradors?populate=*",
      {
        ...options,
      },
      false // Usar API Token
    )
  }
  // obtener colaborador por id

async getColaboradorById(id: number, populate: string = "*") {
  return strapi.get<ColaboradorStrapi>(
    `colaboradors/${id}`,
    { populate },
    false // Usar API Token
  )
}

private endpoint = "colaboradors";
// editar colaborador 
  async update(id: string | number, data: Partial<Omit<ColaboradorStrapi, "id">>) {
    return strapi.put<ColaboradorStrapi>(
      this.endpoint,
      id,
      data,
      {
        populate: ["*"],
      },
      false, // Usar API Token
    );
  }

}

export const domiciliariosService = new DomiciliariosService()

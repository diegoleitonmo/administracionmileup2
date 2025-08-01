"use client"

import { strapi, getTodayDateRange } from "@/lib/strapi"



export interface ServicioStrapi {
  id: number;
  documentId: string;
  direccion: string;
  estado: "pendiente" | "asignado" | "cancelado" | "entregado" | "llegada comercio" | "recibí paquete" | "eliminado";
  fechaSolicitud: string;
  fechaAsignado?: string | null;
  observaciones?: string | null;
  fechaCancelacion?: string | null;
  fechaLlegadaComercio?: string | null;
  fechaRecibidoPaquete?: string | null;
  fechaEntrega?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  liquidado: boolean;
  fechaLiquidacion?: string | null;
  locacion?: any;
  comercio: {
    id: number;
    documentId: string;
    nombre: string;
    direccion: string;
    telefono: string;
    nit: string;
    esta_activo: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    web?: string | null;
    url?: string | null;
    placeid?: string | null;
    longitud?: string | null;
    latitud?: string | null;
  };
  colaborador?: {
    id: number;
    documentId: string;
    nombre: string;
    apellido: string;
    direccion?: string | null;
    telefono: string;
    tipotransporte?: string | null;
    tipoIdentificacion?: string | null;
    numeroIdentificacion?: string | null;
    correoElectronico?: string | null;
    datoBancario?: string | null;
    Activo: boolean;
    disponibilidad: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  tipo?: {
    id: number;
    documentId: string;
    descripcion: string;
    padreId: number;
    vigente: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  datos_adicionales_servicio?: any;


}

export class ServiciosService {
  private endpoint = "servicios?populate=*"

  // Obtener todos los servicios (usando API Token)
  async getAll(options?: {
    filters?: Record<string, any>
    sort?: string[]
    pagination?: { page?: number; pageSize?: number }
  }) {
    return strapi.get<ServicioStrapi[]>(
      this.endpoint,
      {
        ...options,
      },
      false, // Usar API Token
    )
  }

  // Obtener servicios solo del día de hoy (por createdAt)
  async getHoy(options?: {
    filters?: Record<string, any>;
    sort?: string[];
    pagination?: { page?: number; pageSize?: number };
  }): Promise<any> {
    return this.getAll({
      ...options,
      filters: {
        ...(options?.filters || {}),
        ...getTodayDateRange("createdAt"),
      },
    });
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
  async create(data: Omit<ServicioStrapi, "id" | "createdAt" | "updatedAt" | "publishedAt">) {
    return strapi.post<ServicioStrapi>(
      this.endpoint,
      data,
      {
        populate: ["domiciliario", "cliente"],
      },
      false, // Usar API Token
    );
  }


  // Actualizar servicio (usando API Token)
  async update(id: string | number, data: Partial<Omit<ServicioStrapi, "id">>) {
    return strapi.put<ServicioStrapi>(
      this.endpoint,
      id,
      data,
      {
        populate: ["domiciliario", "cliente"],
      },
      false, // Usar API Token
    );
  }

  // Eliminar servicio (usando API Token)
  async delete(id: string | number) {
    return strapi.delete(this.endpoint, id, false) // Usar API Token
  }

  // Filtrar por estado (ajustado a los nuevos estados)
  async getByEstado(estado: ServicioStrapi["estado"]) {
    return this.getAll({
      filters: {
        estado: {
          $eq: estado,
        },
      },
    });
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

  // Servicios activos (no entregados, cancelados ni eliminados)
  async getActivos() {
    return this.getAll({
      filters: {
        estado: {
          $notIn: ["entregado", "cancelado", "eliminado"],
        },
      },
      sort: ["createdAt:desc"],
    });
  }

  // Cambiar estado del servicio (ajustado a los nuevos estados)
  async cambiarEstado(
    id: string | number,
    estado: ServicioStrapi["estado"],
  ) {
    return this.update(id, { estado });
  }

  // Asignar domiciliario (colaborador)
  async asignarDomiciliario(servicioId: string | number, colaboradorId: number) {
    return this.update(servicioId, {
      colaborador: colaboradorId as any,
      estado: "asignado",
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

"use client";

import { strapi, getTodayDateRange } from "@/lib/strapi";

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
  private endpoint = "servicios";

  // Obtener servicios por colaborador, con filtros opcionales de fecha y comercio
  async getServiciosByColaborador(
    colaboradorId: string | number,
    fechaInicio?: string,
    fechaFin?: string,
    comercioId?: string | number,
    page?: number,
    pageSize?: number
  ) {
    const filters: Record<string, any> = {};
    // Solo agregar filtro si el id es válido y numérico
    if (colaboradorId && !isNaN(Number(colaboradorId))) {
      filters.colaborador = { id: { $eq: Number(colaboradorId) } };
    }
    if (fechaInicio && fechaFin) {
      filters.fechaSolicitud = { $between: [fechaInicio, fechaFin] };
    } else if (fechaInicio) {
      filters.fechaSolicitud = { $gte: fechaInicio };
    } else if (fechaFin) {
      filters.fechaSolicitud = { $lte: fechaFin };
    }
    if (comercioId && !isNaN(Number(comercioId))) {
      filters.comercio = { id: { $eq: Number(comercioId) } };
    }
    return this.getAll({
      filters,
      sort: ["liquidado:asc", "fechaSolicitud:desc"],
      ...(page && pageSize ? { pagination: { page, pageSize } } : {}),
    });
  }
  // Obtener todos los servicios (usando API Token)
  async getAll(options?: {
    filters?: Record<string, any>;
    sort?: string | string[];
    pagination?: { page?: number; pageSize?: number };
    fields?: string[];
    locale?: string;
  }) {
    return strapi.get<ServicioStrapi[]>(
      this.endpoint,
      {
        populate: "*", // <-- fuerza populate all
        ...options,
      },
      false
    );
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
      false // Usar API Token
    );
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

  // Liquidar servicios por documentId (usando API Token)
  async liquidarServicios(documentIds: string[]) {
    const promises = documentIds.map(documentId => 
      strapi.put<ServicioStrapi>(
        this.endpoint,
        documentId,
        { liquidado: true, fechaLiquidacion: new Date().toISOString() },
        {
        },
        false // Usar API Token
      )
    );
    
    return Promise.all(promises);
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

  // Filtrar por colaborador (antes domiciliario)
  async getByDomiciliario(domiciliarioId: number) {
    return this.getAll({
      filters: {
        colaborador: {
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

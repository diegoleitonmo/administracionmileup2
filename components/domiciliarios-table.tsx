"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Eye,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,  
  RefreshCw,
  UserPlus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Bike,
  Car,
  MessageSquare,
  Users,
} from "lucide-react"
import { domiciliariosService } from "@/services/domiciliarios.service"

export interface Domiciliario {
  id: string
  documentId: string
  nombre: string
  telefono: string
  ciudad: string
  transporte: "moto" | "bicicleta" | "carro" | "a_pie"
  identificacion: string
  correo: string
  estado: "activo" | "inactivo" | "suspendido"
  disponible: "disponible" | "ocupado" | "desconectado"
  avatar?: string
  fechaRegistro?: string
  serviciosCompletados?: number
  calificacion?: number
}

type DomiciliariosTableProps = {
  domiciliarios: Domiciliario[]
  loading: boolean
  onRefresh: () => void
}

type ModalState = { open: boolean; type: "disponibilidad" | "suspender" | null; domiciliario: Domiciliario | null }

export function DomiciliariosTable({ domiciliarios, loading, onRefresh }: DomiciliariosTableProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState<string>("todos")
  const [filtroCiudad, setFiltroCiudad] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")

  const [modal, setModal] = useState<ModalState>({ open: false, type: null, domiciliario: null })
  const [accionLoading, setAccionLoading] = useState(false)

  const handleCambiarDisponibilidad = (domiciliario: Domiciliario) => {
    setModal({ open: true, type: "disponibilidad", domiciliario })
  }

  const handleSuspender = (domiciliario: Domiciliario) => {
    setModal({ open: true, type: "suspender", domiciliario })
  }

  const confirmarAccion = async () => {
    if (!modal.domiciliario) return
    setAccionLoading(true)
    try {
      // Usar documentId si existe, fallback al id
      
      const targetId = modal.domiciliario.documentId
      if (modal.type === "disponibilidad") {
        const isDisponible = modal.domiciliario.disponible === "disponible"
        await domiciliariosService.update(targetId, { disponibilidad: !isDisponible })
      } else if (modal.type === "suspender") {
         const isActivo = modal.domiciliario.estado === "activo"

        await domiciliariosService.update(targetId, { Activo: !isActivo })
      }
      await onRefresh()
    } catch (err: any) {
      console.error("Actualizar domiciliario error", err)
      alert("No se pudo actualizar el domiciliario: " + (err?.message || "Error"))
    } finally {
      setAccionLoading(false)
      setModal({ open: false, type: null, domiciliario: null })
    }
  }

  const ciudades = Array.from(new Set(domiciliarios.map((d) => d.ciudad)))

  const domiciliariosFiltrados = domiciliarios.filter((domiciliario) => {
    const matchEstado = filtroEstado === "todos" || domiciliario.estado === filtroEstado;
    const matchDisponibilidad = filtroDisponibilidad === "todos" || domiciliario.disponible === filtroDisponibilidad;
    const matchCiudad = filtroCiudad === "todos" || domiciliario.ciudad === filtroCiudad;
    const matchBusqueda =
      domiciliario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      domiciliario.telefono.includes(busqueda) ||
      domiciliario.identificacion.includes(busqueda) ||
      domiciliario.correo.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchDisponibilidad && matchCiudad && matchBusqueda;
  });

  // Configuración para los badges e íconos
  const disponibilidadConfig = {
    disponible: { label: "Disponible", color: "bg-green-100 text-green-700", icon: UserCheck },
    ocupado: { label: "Ocupado", color: "bg-blue-100 text-blue-700", icon: Bike },
    desconectado: { label: "Desconectado", color: "bg-gray-100 text-gray-500", icon: UserX },
  };
  const transporteConfig = {
    moto: { label: "Moto", color: "text-purple-600", icon: Bike },
    bicicleta: { label: "Bicicleta", color: "text-green-600", icon: Bike },
    carro: { label: "Carro", color: "text-blue-600", icon: Car },
    a_pie: { label: "A pie", color: "text-orange-600", icon: UserX },
  };
  const estadoConfig = {
    activo: { label: "Activo", color: "bg-green-100 text-green-700" },
    inactivo: { label: "Inactivo", color: "bg-gray-100 text-gray-500" },
    suspendido: { label: "Suspendido", color: "bg-red-100 text-red-700" },
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Lista de Domiciliarios
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {loading ? "Cargando..." : `${domiciliariosFiltrados.length} domiciliarios encontrados`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={onRefresh} variant="outline" size="sm" className="rounded-lg border-purple-200 hover:bg-purple-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg shadow-sm">
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nuevo Domiciliario</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Vista tabla para desktop */}
        <div className="hidden lg:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domiciliario</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Transporte</TableHead>
                <TableHead>Identificación</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domiciliariosFiltrados.map((domiciliario) => {
                const DisponibilidadIcon = disponibilidadConfig[domiciliario.disponible].icon
                const TransporteIcon = transporteConfig[domiciliario.transporte].icon
                return (
                  <TableRow key={domiciliario.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={domiciliario.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {domiciliario.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{domiciliario.nombre}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>⭐ {domiciliario.calificacion}</span>
                            <span>•</span>
                            <span>{domiciliario.serviciosCompletados} servicios</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{domiciliario.telefono}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{domiciliario.ciudad}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TransporteIcon className={`w-4 h-4 ${transporteConfig[domiciliario.transporte].color}`} />
                        <span className="text-sm">{transporteConfig[domiciliario.transporte].label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{domiciliario.identificacion}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-sm truncate max-w-40">{domiciliario.correo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${estadoConfig[domiciliario.estado].color} border`}>
                        {estadoConfig[domiciliario.estado].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${disponibilidadConfig[domiciliario.disponible].color} border`}>
                        <DisponibilidadIcon className="w-3 h-3 mr-1" />
                        {disponibilidadConfig[domiciliario.disponible].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <a href={`/liquidacion-servicios?domiciliario=${domiciliario.id}`} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              Liquidar servicios
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar información
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Llamar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Enviar mensaje
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar correo
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleCambiarDisponibilidad(domiciliario)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            {domiciliario.disponible === "disponible" ? "disponibilidad" : "Habilitar disponibilidad"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleSuspender(domiciliario)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Suspender
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Vista cards para móviles */}
        <div className="lg:hidden space-y-3">
          {domiciliariosFiltrados.map((domiciliario) => {
            const DisponibilidadIcon = disponibilidadConfig[domiciliario.disponible].icon
            const TransporteIcon = transporteConfig[domiciliario.transporte].icon
            return (
              <Card key={domiciliario.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={domiciliario.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-semibold">
                          {domiciliario.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{domiciliario.nombre}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>⭐ {domiciliario.calificacion}</span>
                          <span>•</span>
                          <span>{domiciliario.serviciosCompletados} servicios</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <a href={`/liquidacion-servicios?domiciliario=${domiciliario.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            Liquidar servicios
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Llamar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Mensaje
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{domiciliario.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{domiciliario.ciudad}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TransporteIcon className={`w-4 h-4 ${transporteConfig[domiciliario.transporte].color}`} />
                      <span className="text-sm text-gray-600">{transporteConfig[domiciliario.transporte].label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{domiciliario.correo}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge className={`${estadoConfig[domiciliario.estado].color} border text-xs`}>
                        {estadoConfig[domiciliario.estado].label}
                      </Badge>
                      <Badge className={`${disponibilidadConfig[domiciliario.disponible].color} border text-xs`}>
                        <DisponibilidadIcon className="w-3 h-3 mr-1" />
                        {disponibilidadConfig[domiciliario.disponible].label}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{domiciliario.identificacion}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {domiciliariosFiltrados.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron domiciliarios con los filtros aplicados</p>
          </div>
        )}
        {/* Modal */}
       {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-2">
                {modal.type === "disponibilidad"
                  ? "Confirmar cambio de disponibilidad"
                  : "Confirmar cambio de estado"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {modal.type === "disponibilidad"
                  ? `¿Seguro que deseas ${
                      modal.domiciliario?.disponible === "disponible"
                        ? "deshabilitar"
                        : "habilitar"
                    } la disponibilidad de ${modal.domiciliario?.nombre}?`
                  : `¿Seguro que deseas ${
                      modal.domiciliario?.estado === "inactivo"
                        ? "activar"
                        : "inactivar"
                    } al colaborador: ${modal.domiciliario?.nombre}?`}
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={accionLoading}
                  onClick={() =>
                    setModal({ open: false, type: null, domiciliario: null })
                  }
                >
                  Cancelar
                </Button>

                {/* Botón dinámico */}
                <Button
                  onClick={confirmarAccion}
                  disabled={accionLoading}
                  className={
                    modal.type === "suspender" &&
                    modal.domiciliario?.estado !== "inactivo"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }
                >
                  {accionLoading
                    ? "Guardando..."
                    : modal.type === "disponibilidad"
                    ? modal.domiciliario?.disponible === "disponible"
                      ? "Deshabilitar"
                      : "Habilitar"
                    : modal.domiciliario?.estado === "inactivo"
                    ? "Activar"
                    : "Inactivar"}
                </Button>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  MapPin,
  RefreshCw,
  UserX,
  Clock,
  Filter,
  Package,
  Users,
  Edit,
  Trash2,
  Search,
} from "lucide-react"

interface SeguimientoServiciosTableResponsiveProps {
  servicios: any[]
  loading: boolean
  onRefresh: () => void
  estadoConfig: Record<string, any>
}

export function SeguimientoServiciosTableResponsive({ servicios, loading, onRefresh, estadoConfig }: SeguimientoServiciosTableResponsiveProps) {
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")

  const serviciosFiltrados = servicios.filter((servicio) => {
    const matchBusqueda =
      servicio.id.toString().includes(busqueda) ||
      (servicio.comercio?.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (servicio.colaborador?.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
    const matchEstado = filtroEstado === "todos" || servicio.estado === filtroEstado
    return matchBusqueda && matchEstado
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">Lista de Servicios</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona y supervisa los servicios ({serviciosFiltrados.length} de {servicios.length})
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>
        {/* Filtros responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por ID, comercio o domiciliario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="asignado">Asignado</SelectItem>
              <SelectItem value="llegada_comercio">Llegada a comercio</SelectItem>
              <SelectItem value="recibi_paquete">Recibí paquete</SelectItem>
              <SelectItem value="entregado">Entregado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="eliminado">Eliminado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {/* Mobile/Tablet cards */}
        <div className="space-y-4 p-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : serviciosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No se encontraron servicios</p>
              <Button variant="outline" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          ) : (
            serviciosFiltrados.map((servicio) => (
              <Card key={servicio.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Header con ID y estado */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-100 text-purple-700 font-mono text-xs px-2 py-1">ID: {servicio.id}</Badge>
                      <Badge className={`border ${estadoConfig[servicio.estado]?.color || "bg-gray-100 text-gray-500"} text-xs`}>
                        {estadoConfig[servicio.estado]?.label || servicio.estado}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {/* Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm">{servicio.comercio?.nombre || "Sin comercio"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm">{servicio.direccion || "Sin dirección"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm">{servicio.colaborador?.nombre || "Sin domiciliario"}</span>
                    </div>
                  </div>
                  {/* Estado y fechas */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-gray-100 text-gray-500 border text-xs">
                      {formatDate(servicio.fechaSolicitud)}
                    </Badge>
                    {servicio.fechaEntrega && (
                      <Badge className="bg-green-100 text-green-700 border text-xs">
                        Entregado: {formatDate(servicio.fechaEntrega)}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

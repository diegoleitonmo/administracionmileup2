"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Search,
} from "lucide-react"

export interface Domiciliario {
  id: string
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

export function DomiciliariosTableResponsive({ domiciliarios, loading, onRefresh }: DomiciliariosTableProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState<string>("todos")
  const [filtroCiudad, setFiltroCiudad] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")

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
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">Lista de Domiciliarios</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona y supervisa el equipo de domiciliarios ({domiciliariosFiltrados.length} de {domiciliarios.length})
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Filtros responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar domiciliarios..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
              <SelectItem value="suspendido">Suspendido</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroDisponibilidad} onValueChange={setFiltroDisponibilidad}>
            <SelectTrigger>
              <SelectValue placeholder="Disponibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="ocupado">Ocupado</SelectItem>
              <SelectItem value="desconectado">Desconectado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroCiudad} onValueChange={setFiltroCiudad}>
            <SelectTrigger>
              <SelectValue placeholder="Ciudad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las ciudades</SelectItem>
              {ciudades.map((ciudad) => (
                <SelectItem key={ciudad} value={ciudad}>
                  {ciudad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0 sm:p-6">
        {/* Tabla para desktop */}
        <div className="hidden lg:block">
          <div className="rounded-md border">
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
                  <TableHead>Disponibilidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={9}>
                        <div className="animate-pulse flex space-x-4">
                          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : domiciliariosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <UserX className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500">No se encontraron domiciliarios</p>
                        <Button variant="outline" onClick={onRefresh}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Actualizar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  domiciliariosFiltrados.map((domiciliario) => {
                    const DisponibilidadIcon = disponibilidadConfig[domiciliario.disponible].icon;
                    const TransporteIcon = transporteConfig[domiciliario.transporte].icon;
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
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Contactar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Vista de tarjetas para móviles y tablets */}
        <div className="lg:hidden space-y-4 p-4">
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
          ) : domiciliariosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No se encontraron domiciliarios</p>
              <Button variant="outline" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          ) : (
            domiciliariosFiltrados.map((domiciliario) => {
              const DisponibilidadIcon = disponibilidadConfig[domiciliario.disponible].icon;
              const TransporteIcon = transporteConfig[domiciliario.transporte].icon;
              
              return (
                <Card key={domiciliario.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    {/* Header con avatar y nombre */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={domiciliario.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {domiciliario.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-base">{domiciliario.nombre}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>⭐ {domiciliario.calificacion}</span>
                            <span>•</span>
                            <span>{domiciliario.serviciosCompletados} servicios</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contactar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Información de contacto en grid responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm">{domiciliario.telefono}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm">{domiciliario.ciudad}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm truncate">{domiciliario.correo}</span>
                      </div>
                    </div>

                    {/* Badges y estado en layout responsive */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${estadoConfig[domiciliario.estado].color} border text-xs`}>
                        {estadoConfig[domiciliario.estado].label}
                      </Badge>
                      <Badge className={`${disponibilidadConfig[domiciliario.disponible].color} border text-xs`}>
                        <DisponibilidadIcon className="w-3 h-3 mr-1" />
                        {disponibilidadConfig[domiciliario.disponible].label}
                      </Badge>
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                        <TransporteIcon className={`w-3 h-3 ${transporteConfig[domiciliario.transporte].color}`} />
                        <span className="text-xs">{transporteConfig[domiciliario.transporte].label}</span>
                      </div>
                    </div>

                    {/* ID de identificación */}
                    <div className="text-xs text-gray-500 font-mono border-t pt-2">
                      ID: {domiciliario.identificacion}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

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

export function DomiciliariosTable({ domiciliarios, loading, onRefresh }: DomiciliariosTableProps) {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lista de Domiciliarios</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {loading ? "Cargando..." : `${domiciliariosFiltrados.length} domiciliarios encontrados`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Domiciliario
            </Button>
          </div>
        </div>

      
      </CardHeader>

      <CardContent>
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
                          <DropdownMenuItem>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Cambiar disponibilidad
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
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

        {domiciliariosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron domiciliarios con los filtros aplicados</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

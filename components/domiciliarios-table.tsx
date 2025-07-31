"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Eye,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Search,
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

interface Domiciliario {
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
  fechaRegistro: string
  serviciosCompletados: number
  calificacion: number
}

// Datos de ejemplo
const domiciliariosData: Domiciliario[] = [
  {
    id: "DOM-001",
    nombre: "Carlos Rodríguez",
    telefono: "+57 300 123 4567",
    ciudad: "Bogotá",
    transporte: "moto",
    identificacion: "1234567890",
    correo: "carlos.rodriguez@email.com",
    estado: "activo",
    disponible: "disponible",
    fechaRegistro: "2024-01-10",
    serviciosCompletados: 156,
    calificacion: 4.8,
  },
  {
    id: "DOM-002",
    nombre: "Ana García",
    telefono: "+57 301 234 5678",
    ciudad: "Medellín",
    transporte: "bicicleta",
    identificacion: "2345678901",
    correo: "ana.garcia@email.com",
    estado: "activo",
    disponible: "ocupado",
    fechaRegistro: "2024-01-08",
    serviciosCompletados: 89,
    calificacion: 4.6,
  },
  {
    id: "DOM-003",
    nombre: "Miguel Torres",
    telefono: "+57 302 345 6789",
    ciudad: "Cali",
    transporte: "moto",
    identificacion: "3456789012",
    correo: "miguel.torres@email.com",
    estado: "activo",
    disponible: "disponible",
    fechaRegistro: "2024-01-05",
    serviciosCompletados: 203,
    calificacion: 4.9,
  },
  {
    id: "DOM-004",
    nombre: "Laura Martínez",
    telefono: "+57 303 456 7890",
    ciudad: "Barranquilla",
    transporte: "carro",
    identificacion: "4567890123",
    correo: "laura.martinez@email.com",
    estado: "activo",
    disponible: "disponible",
    fechaRegistro: "2024-01-12",
    serviciosCompletados: 67,
    calificacion: 4.7,
  },
  {
    id: "DOM-005",
    nombre: "Pedro Sánchez",
    telefono: "+57 304 567 8901",
    ciudad: "Cartagena",
    transporte: "moto",
    identificacion: "5678901234",
    correo: "pedro.sanchez@email.com",
    estado: "suspendido",
    disponible: "desconectado",
    fechaRegistro: "2024-01-03",
    serviciosCompletados: 45,
    calificacion: 3.8,
  },
  {
    id: "DOM-006",
    nombre: "Sofia López",
    telefono: "+57 305 678 9012",
    ciudad: "Bogotá",
    transporte: "bicicleta",
    identificacion: "6789012345",
    correo: "sofia.lopez@email.com",
    estado: "inactivo",
    disponible: "desconectado",
    fechaRegistro: "2024-01-01",
    serviciosCompletados: 12,
    calificacion: 4.2,
  },
]

const estadoConfig = {
  activo: {
    label: "Activo",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  inactivo: {
    label: "Inactivo",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  suspendido: {
    label: "Suspendido",
    color: "bg-red-100 text-red-800 border-red-200",
  },
}

const disponibilidadConfig = {
  disponible: {
    label: "Disponible",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: UserCheck,
  },
  ocupado: {
    label: "Ocupado",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Bike,
  },
  desconectado: {
    label: "Desconectado",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: UserX,
  },
}

const transporteConfig = {
  moto: {
    label: "Moto",
    icon: Bike,
    color: "text-blue-600",
  },
  bicicleta: {
    label: "Bicicleta",
    icon: Bike,
    color: "text-green-600",
  },
  carro: {
    label: "Carro",
    icon: Car,
    color: "text-purple-600",
  },
  a_pie: {
    label: "A pie",
    icon: UserCheck,
    color: "text-orange-600",
  },
}

export function DomiciliariosTable() {
  const [domiciliarios, setDomiciliarios] = useState<Domiciliario[]>(domiciliariosData)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState<string>("todos")
  const [filtroCiudad, setFiltroCiudad] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")

  const ciudades = Array.from(new Set(domiciliarios.map((d) => d.ciudad)))

  const domiciliariosFiltrados = domiciliarios.filter((domiciliario) => {
    const matchEstado = filtroEstado === "todos" || domiciliario.estado === filtroEstado
    const matchDisponibilidad = filtroDisponibilidad === "todos" || domiciliario.disponible === filtroDisponibilidad
    const matchCiudad = filtroCiudad === "todos" || domiciliario.ciudad === filtroCiudad
    const matchBusqueda =
      domiciliario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      domiciliario.telefono.includes(busqueda) ||
      domiciliario.identificacion.includes(busqueda) ||
      domiciliario.correo.toLowerCase().includes(busqueda.toLowerCase())

    return matchEstado && matchDisponibilidad && matchCiudad && matchBusqueda
  })

  const handleRefresh = () => {
    console.log("Actualizando datos de domiciliarios...")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lista de Domiciliarios</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{domiciliariosFiltrados.length} domiciliarios encontrados</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Domiciliario
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, teléfono, ID o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
              <SelectItem value="suspendido">Suspendido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroDisponibilidad} onValueChange={setFiltroDisponibilidad}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Disponibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="ocupado">Ocupado</SelectItem>
              <SelectItem value="desconectado">Desconectado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroCiudad} onValueChange={setFiltroCiudad}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ciudad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              {ciudades.map((ciudad) => (
                <SelectItem key={ciudad} value={ciudad}>
                  {ciudad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

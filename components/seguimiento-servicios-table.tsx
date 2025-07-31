"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  MapPin,
  Clock,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface Servicio {
  id: string
  comercio: string
  estado: "pendiente" | "en_proceso" | "en_camino" | "entregado" | "cancelado"
  direccion: string
  fecha: string
  domiciliario: string
  tiempoRestante: number // en minutos
  tiempoTotal: number // en minutos
}

// Datos de ejemplo
const serviciosData: Servicio[] = [
  {
    id: "SRV-001",
    comercio: "Pizza Palace",
    estado: "en_camino",
    direccion: "Calle 123 #45-67, Bogotá",
    fecha: "2024-01-15 14:30",
    domiciliario: "Carlos Rodríguez",
    tiempoRestante: 12,
    tiempoTotal: 35,
  },
  {
    id: "SRV-002",
    comercio: "Burger King",
    estado: "en_proceso",
    direccion: "Carrera 15 #32-18, Medellín",
    fecha: "2024-01-15 14:45",
    domiciliario: "Ana García",
    tiempoRestante: 25,
    tiempoTotal: 40,
  },
  {
    id: "SRV-003",
    comercio: "Sushi Express",
    estado: "pendiente",
    direccion: "Avenida 68 #12-34, Cali",
    fecha: "2024-01-15 15:00",
    domiciliario: "Miguel Torres",
    tiempoRestante: 45,
    tiempoTotal: 45,
  },
  {
    id: "SRV-004",
    comercio: "Café Central",
    estado: "entregado",
    direccion: "Calle 85 #11-23, Barranquilla",
    fecha: "2024-01-15 13:15",
    domiciliario: "Laura Martínez",
    tiempoRestante: 0,
    tiempoTotal: 28,
  },
  {
    id: "SRV-005",
    comercio: "Tacos Locos",
    estado: "cancelado",
    direccion: "Carrera 7 #45-89, Cartagena",
    fecha: "2024-01-15 12:30",
    domiciliario: "Pedro Sánchez",
    tiempoRestante: 0,
    tiempoTotal: 15,
  },
]

const estadoConfig = {
  pendiente: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  en_proceso: {
    label: "En Proceso",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: AlertCircle,
  },
  en_camino: {
    label: "En Camino",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: MapPin,
  },
  entregado: {
    label: "Entregado",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
}

function CountdownTimer({ tiempoRestante }: { tiempoRestante: number }) {
  const [tiempo, setTiempo] = useState(tiempoRestante)

  useEffect(() => {
    if (tiempo <= 0) return

    const interval = setInterval(() => {
      setTiempo((prev) => Math.max(0, prev - 1))
    }, 60000) // Actualizar cada minuto

    return () => clearInterval(interval)
  }, [tiempo])

  const formatTime = (minutos: number) => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`
  }

  if (tiempo <= 0) {
    return <span className="text-gray-500">--</span>
  }

  return (
    <div className="flex items-center gap-1">
      <Clock className="w-3 h-3 text-orange-500" />
      <span className={`text-sm font-medium ${tiempo <= 5 ? "text-red-600" : "text-orange-600"}`}>
        {formatTime(tiempo)}
      </span>
    </div>
  )
}

export function SeguimientoServiciosTable() {
  const [servicios, setServicios] = useState<Servicio[]>(serviciosData)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")

  const serviciosFiltrados = servicios.filter((servicio) => {
    const matchEstado = filtroEstado === "todos" || servicio.estado === filtroEstado
    const matchBusqueda =
      servicio.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      servicio.comercio.toLowerCase().includes(busqueda.toLowerCase()) ||
      servicio.domiciliario.toLowerCase().includes(busqueda.toLowerCase())

    return matchEstado && matchBusqueda
  })

  const handleRefresh = () => {
    // Simular actualización de datos
    console.log("Actualizando datos...")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lista de Servicios</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{serviciosFiltrados.length} servicios encontrados</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por ID, comercio o domiciliario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="en_proceso">En Proceso</SelectItem>
              <SelectItem value="en_camino">En Camino</SelectItem>
              <SelectItem value="entregado">Entregado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Comercio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Domiciliario</TableHead>
                <TableHead>Cuenta Regresiva</TableHead>
                <TableHead>Tiempo Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviciosFiltrados.map((servicio) => {
                const EstadoIcon = estadoConfig[servicio.estado].icon
                return (
                  <TableRow key={servicio.id}>
                    <TableCell className="font-medium">{servicio.id}</TableCell>
                    <TableCell>{servicio.comercio}</TableCell>
                    <TableCell>
                      <Badge className={`${estadoConfig[servicio.estado].color} border`}>
                        <EstadoIcon className="w-3 h-3 mr-1" />
                        {estadoConfig[servicio.estado].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate text-sm">{servicio.direccion}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{servicio.fecha}</TableCell>
                    <TableCell>{servicio.domiciliario}</TableCell>
                    <TableCell>
                      <CountdownTimer tiempoRestante={servicio.tiempoRestante} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{servicio.tiempoTotal}m</span>
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
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Contactar domiciliario
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MapPin className="mr-2 h-4 w-4" />
                            Ver en mapa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar servicio
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

        {serviciosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron servicios con los filtros aplicados</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

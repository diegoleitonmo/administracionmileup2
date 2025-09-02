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
  Menu,
  Phone,
  MapPin,
  Clock,
  Filter,
  RefreshCw,
  XCircle,
} from "lucide-react"

// Celda de cuenta regresiva o tiempo de asignación
function CountdownCell({ servicio }: { servicio: any }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!servicio.fechaAsignado) {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, [servicio.fechaAsignado]);

  const formatTime = (diff: number) => {
    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Si aún no está asignado, mostrar reloj digital naranja tipo "mm:ss"
  if (!servicio.fechaAsignado) {
    const start = new Date(servicio.fechaSolicitud).getTime();
    const diff = Math.max(0, now - start);
    return (
      <span className="font-mono text-orange-500 bg-black px-2 py-1 rounded text-base shadow-sm inline-flex items-center gap-1">
        <Clock className="inline-block w-4 h-4 text-orange-400 mr-1" />
        {formatTime(diff)}
      </span>
    );
  } else {
    // Si ya está asignado, mostrar el formato actual en verde
    const start = new Date(servicio.fechaSolicitud).getTime();
    const end = new Date(servicio.fechaAsignado).getTime();
    const diff = Math.max(0, end - start);
    return (
      <span className="font-mono text-green-600">
        {formatTime(diff)}
      </span>
    );
  }
}

export default function ListaServicios({
  serviciosFiltrados = [],
  estadoConfig = {},
  busqueda = "",
  setBusqueda = () => {},
  filtroEstado = "todos",
  setFiltroEstado = () => {},
  onRefresh = () => {},
  loading = false,
}: any) {
  // Validar que serviciosFiltrados sea un array
  const servicios = Array.isArray(serviciosFiltrados) ? serviciosFiltrados : [];
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [nextUpdateIn, setNextUpdateIn] = useState<number>(180); // segundos hasta la próxima actualización

  // Reloj de cuenta regresiva para la próxima actualización
  useEffect(() => {
    setNextUpdateIn(180);
    const tick = setInterval(() => {
      setNextUpdateIn(prev => {
        if (prev <= 1) return 180;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [lastUpdate]);

  // Actualización automática cada 3 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
      setLastUpdate(new Date());
    }, 180000); // 3 minutos
    return () => clearInterval(interval);
  }, [onRefresh]);

  // Actualizar lastUpdate cuando se refresca manualmente
  const handleRefresh = () => {
    onRefresh();
    setLastUpdate(new Date());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lista de Servicios</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{servicios.length} servicios encontrados</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              size="sm"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-sm transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {loading ? "Actualizando..." : "Actualizar"}
            </Button>
            <span
              className="text-xs px-2 py-1 rounded bg-gray-100 border border-gray-200 text-gray-700 font-mono shadow-sm whitespace-nowrap"
              title={`Actualizado el ${lastUpdate.toLocaleDateString()} a las ${lastUpdate.toLocaleTimeString()}`}
            >
              {`Actualizado: ${lastUpdate.toLocaleTimeString()}`}
            </span>
            <span
              className="text-xs px-2 py-1 rounded bg-black text-green-400 font-mono shadow-sm whitespace-nowrap flex items-center gap-1"
              title="Tiempo para la siguiente actualización automática"
            >
              <Clock className="inline-block w-4 h-4 text-green-400 mr-1" />
              {`${String(Math.floor(nextUpdateIn / 60)).padStart(2, "0")}:${String(nextUpdateIn % 60).padStart(2, "0")}`}
            </span>
          </div>
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
              {servicios.map((servicio: any) => {
                const estadoKey = (servicio.estado || "").replace(/\s+/g, "_")
                const EstadoIcon = estadoConfig[estadoKey]?.icon || Clock

                return (
                  <TableRow key={servicio.id}>
                    <TableCell className="font-medium">{servicio.id}</TableCell>
                    <TableCell>{servicio.comercio?.nombre || ""}</TableCell>
                    <TableCell>
                      <Badge className={`${estadoConfig[estadoKey]?.color || ""} border`}>
                        <EstadoIcon className="w-3 h-3 mr-1" />
                        {estadoConfig[estadoKey]?.label || servicio.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate text-sm">{servicio.direccion}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {servicio.fechaSolicitud ? new Date(servicio.fechaSolicitud).toLocaleString() : ""}
                    </TableCell>
                    <TableCell>
                      {servicio.colaborador ? `${servicio.colaborador.nombre} ${servicio.colaborador.apellido || ""}` : ""}
                    </TableCell>
                    <TableCell>
                      <CountdownCell servicio={servicio} />
                    </TableCell>
                    <TableCell>
                      {servicio.fechaSolicitud && servicio.fechaEntrega ? (() => {
                        const diffMs = new Date(servicio.fechaEntrega).getTime() - new Date(servicio.fechaSolicitud).getTime();
                        const min = Math.floor(diffMs / 60000);
                        const sec = Math.floor((diffMs % 60000) / 1000);
                        let color = "text-green-600";
                        if (min > 20) color = "text-red-600";
                        else if (min > 15) color = "text-yellow-600";
                        return (
                          <span className={`text-sm font-bold font-mono ${color}`}>
                            {min.toString().padStart(2, "0")}:{sec.toString().padStart(2, "0")}
                          </span>
                        );
                      })() : (
                        <span className="text-sm font-medium">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Acciones">
                            <Menu className="h-5 w-5" />
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
        {servicios.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron servicios con los filtros aplicados</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

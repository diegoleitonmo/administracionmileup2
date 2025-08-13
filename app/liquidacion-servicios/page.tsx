"use client"

import { useEffect, useState } from "react"
import { Package, MapPin, Users, Clock, MessageCircle, CheckCircle, X } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthGuard } from "@/components/auth-guard"
import { AdminLayout } from "@/components/dashboard-layout"
import { serviciosService } from "@/services/servicios.service"

function formatCurrency(value: number) {
  return value.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
}

export default function LiquidacionServiciosPage() {
  const searchParams = useSearchParams()
  const [selectedDomiciliario, setSelectedDomiciliario] = useState<string>("")
  const [servicios, setServicios] = useState<any[]>([])
  const [selectedServicios, setSelectedServicios] = useState<number[]>([])
  const [loadingServicios, setLoadingServicios] = useState(false)
  const [fechaInicio, setFechaInicio] = useState<string>("")
  const [fechaFin, setFechaFin] = useState<string>("")
  const [selectedComercio, setSelectedComercio] = useState<string>("all")
  const [liquidadoFilter, setLiquidadoFilter] = useState<"no"|"si"|"todos">("no")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalPages, setTotalPages] = useState(1)
  // Totales globales
  const [totalServicios, setTotalServicios] = useState(0)
  const [totalLiquidados, setTotalLiquidados] = useState(0)
  const [totalNoLiquidados, setTotalNoLiquidados] = useState(0)
  const [showLiquidacionModal, setShowLiquidacionModal] = useState(false)

  // Obtener domiciliario desde URL
  useEffect(() => {
    const idFromUrl = searchParams.get("domiciliario")
    if (idFromUrl) setSelectedDomiciliario(idFromUrl)
  }, [searchParams])


  // Obtener servicios filtrados usando el método del servicio
  // Obtener servicios filtrados según filtro de liquidado
  const getServicios = async (
    colaboradorId?: string,
    fechaInicio?: string,
    fechaFin?: string,
    comercioId?: string,
    page: number = 1,
    pageSize: number = 20
  ) => {
    const comercioParam = comercioId && comercioId !== "all" ? comercioId : undefined;
    let filters: Record<string, any> = {};
    // Filtro de liquidado
    if (liquidadoFilter === "no") filters.liquidado = { $eq: false };
    if (liquidadoFilter === "si") filters.liquidado = { $eq: true };
    // Fechas y comercio
    if (fechaInicio && fechaFin) filters.fechaSolicitud = { $between: [fechaInicio, fechaFin] };
    else if (fechaInicio) filters.fechaSolicitud = { $gte: fechaInicio };
    else if (fechaFin) filters.fechaSolicitud = { $lte: fechaFin };
    if (comercioParam) filters.comercio = { id: { $eq: Number(comercioParam) } };

    if (!colaboradorId) {
      // Todos los servicios
      return serviciosService.getAll({
        filters,
        sort: ["liquidado:asc", "fechaSolicitud:desc"],
        pagination: { page, pageSize },
      });
    } else {
      // Por domiciliario
      return serviciosService.getAll({
        filters: {
          ...filters,
          colaborador: { id: { $eq: Number(colaboradorId) } },
        },
        sort: ["liquidado:asc", "fechaSolicitud:desc"],
        pagination: { page, pageSize },
      });
    }
  }

  useEffect(() => {
    if (!selectedDomiciliario) return;
    setLoadingServicios(true);
    const comercioParam = !selectedComercio || selectedComercio === "all" ? undefined : selectedComercio;
    getServicios(
      selectedDomiciliario,
      fechaInicio || undefined,
      fechaFin || undefined,
      comercioParam,
      page,
      pageSize
    )
      .then((data: any) => {
        setServicios(data?.data || []);
        setTotalPages(data?.meta?.pagination?.pageCount || 1);
        setTotalServicios(data?.meta?.pagination?.total || 0);
      })
      .finally(() => setLoadingServicios(false));

    // Consultar totales globales de liquidados y no liquidados
    // Total liquidados
    serviciosService.getAll({
      filters: {
        ...(selectedDomiciliario ? { colaborador: { id: { $eq: Number(selectedDomiciliario) } } } : {}),
        ...(fechaInicio && fechaFin ? { fechaSolicitud: { $between: [fechaInicio, fechaFin] } } : fechaInicio ? { fechaSolicitud: { $gte: fechaInicio } } : fechaFin ? { fechaSolicitud: { $lte: fechaFin } } : {}),
        ...(comercioParam ? { comercio: { id: { $eq: Number(comercioParam) } } } : {}),
        liquidado: { $eq: true },
      },
      pagination: { page: 1, pageSize: 1 },
    }).then((data: any) => {
      setTotalLiquidados(data?.meta?.pagination?.total || 0);
    });
    // Total no liquidados
    serviciosService.getAll({
      filters: {
        ...(selectedDomiciliario ? { colaborador: { id: { $eq: Number(selectedDomiciliario) } } } : {}),
        ...(fechaInicio && fechaFin ? { fechaSolicitud: { $between: [fechaInicio, fechaFin] } } : fechaInicio ? { fechaSolicitud: { $gte: fechaInicio } } : fechaFin ? { fechaSolicitud: { $lte: fechaFin } } : {}),
        ...(comercioParam ? { comercio: { id: { $eq: Number(comercioParam) } } } : {}),
        liquidado: { $eq: false },
      },
      pagination: { page: 1, pageSize: 1 },
    }).then((data: any) => {
      setTotalNoLiquidados(data?.meta?.pagination?.total || 0);
    });
  }, [selectedDomiciliario, fechaInicio, fechaFin, selectedComercio, liquidadoFilter, page, pageSize]);

  // Limpiar selección de servicios si cambia el listado
  useEffect(() => {
    setSelectedServicios([]);
  }, [servicios]);

  const total = servicios
    .filter(s => selectedServicios.includes(s.id))
    .reduce((acc, s) => {
      const tipo = s.tipo?.descripcion?.toLowerCase() || "urbano"
      return acc + (tipo === "foráneo" ? 8000 : 5000)
    }, 0)

  // Calcular valores para liquidación
  const getValoresLiquidacion = () => {
    const serviciosSeleccionados = servicios.filter(s => selectedServicios.includes(s.id))
    let urbanos = 0
    let rurales = 0
    let totalValor = 0
    const fechasServicios: Date[] = []

    serviciosSeleccionados.forEach(s => {
      const tipo = s.tipo?.descripcion?.toLowerCase() || "urbano"
      if (tipo === "foráneo") {
        rurales++
        totalValor += 8000
      } else {
        urbanos++
        totalValor += 5000
      }

      // Recopilar fechas de solicitud válidas
      if (s.fechaSolicitud) {
        fechasServicios.push(new Date(s.fechaSolicitud))
      }
    })

    // Calcular fechas mínima y máxima
    const fechaInicio = fechasServicios.length > 0 ? new Date(Math.min(...fechasServicios.map(f => f.getTime()))) : null
    const fechaFin = fechasServicios.length > 0 ? new Date(Math.max(...fechasServicios.map(f => f.getTime()))) : null

    const valorDomiciliario = Math.round(totalValor * 0.7)
    const valorAplicacion = Math.round(totalValor * 0.3)

    return {
      serviciosCount: serviciosSeleccionados.length,
      telefonoDomiciliario: ` ${servicios[0].colaborador.telefono}`,
      urbanos,
      rurales,
      totalValor,
      valorDomiciliario,
      valorAplicacion,
      fechaInicioLiquidacion: fechaInicio ? fechaInicio.toLocaleDateString('es-CO') : 'No disponible',
      fechaFinLiquidacion: fechaFin ? fechaFin.toLocaleDateString('es-CO') : 'No disponible',
      nombreDomiciliario: servicios.length > 0 && servicios[0].colaborador ? 
        `${servicios[0].colaborador.nombre || servicios[0].colaborador.name || ''} ${servicios[0].colaborador.apellido || ''}`.trim() : 
        'Sin domiciliario'
    }
  }

  const handleCheck = (id: number) => {
    setSelectedServicios(prev => (prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]))
  }


  const handleCheckAll = () => {
    if (selectedServicios.length === servicios.length) {
      setSelectedServicios([])
    } else {
      setSelectedServicios(servicios.map(s => s.id))
    }
  }

  // Handler para liquidar servicios seleccionados
  const handleLiquidar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevenir submit/recarga
    setShowLiquidacionModal(true)
  }


  const handleEnviarWhatsapp = async () => {
    // Solo enviar los servicios seleccionados (chequeados)
    const valores = getValoresLiquidacion();
    const serviciosSeleccionados = servicios.filter(s => selectedServicios.includes(s.id));
    // Construir payload SOLO con los servicios seleccionados
    const payload = {
      telefonoDomiciliario: valores.telefonoDomiciliario,
      nombreDomiciliario: valores.nombreDomiciliario,
      serviciosCount: valores.serviciosCount,
      fechaInicio: valores.fechaInicioLiquidacion,
      fechaFin: valores.fechaFinLiquidacion,
      urbanos: valores.urbanos,
      rurales: valores.rurales,
      totalValor: valores.totalValor,
      valorDomiciliario: valores.valorDomiciliario,
      valorAplicacion: valores.valorAplicacion,
      servicios: serviciosSeleccionados.map(s => ({
        id: s.id,
        fechaSolicitud: s.fechaSolicitud,
        estado: s.estado,
        comercio: s.comercio?.nombre,
        tipo: s.tipo?.descripcion,
        valor: (s.tipo?.descripcion?.toLowerCase() === "foráneo" ? 8000 : 5000),
        locacion: s.locacion?.tipo,
        cliente: s.colaborador?.nombre + " " + s.colaborador?.apellido,
        liquidado: s.liquidado
      }))
    };
    try {
      const res = await fetch("https://n8nmileup-n8n.te6nfs.easypanel.host/webhook/noitificaciondomiciliario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let errorMsg = "Error al enviar notificación";
        try {
          const errorData = await res.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch {}
        throw new Error(errorMsg);
      }
      alert("Notificación enviada por WhatsApp correctamente");
    } catch (err: any) {
      console.error("Error enviando notificación WhatsApp:", err);
      alert(err?.message ? `Error: ${err.message}` : "Error al enviar notificación por WhatsApp");
    }
  }

  const handleEnviarWhatsappConfirmacion = async ()=> {

    const valores = getValoresLiquidacion();
    const serviciosSeleccionados = servicios.filter(s => selectedServicios.includes(s.id));
    const datos = {
      telefonoDomiciliario: valores.telefonoDomiciliario,
      nombreDomiciliario: valores.nombreDomiciliario,
      serviciosCount: valores.serviciosCount,
      fechaInicio: valores.fechaInicioLiquidacion,
      fechaFin: valores.fechaFinLiquidacion,
      urbanos: valores.urbanos,
      rurales: valores.rurales,
      totalValor: valores.totalValor,
      valorDomiciliario: valores.valorDomiciliario,
      valorAplicacion: valores.valorAplicacion,
      servicios: serviciosSeleccionados.map(s => ({
        id: s.id,
        fechaSolicitud: s.fechaSolicitud,
        estado: s.estado,
        comercio: s.comercio?.nombre,
        tipo: s.tipo?.descripcion,
        valor: (s.tipo?.descripcion?.toLowerCase() === "foráneo" ? 8000 : 5000),
        locacion: s.locacion?.tipo,
        cliente: s.colaborador?.nombre + " " + s.colaborador?.apellido,
        liquidado: s.liquidado
      }))
    };
    try {
      const res = await fetch("https://n8nmileup-n8n.te6nfs.easypanel.host/webhook/noitificaciondomiciliariopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });
      if (!res.ok) throw new Error("Error al enviar notificación");
      alert("Notificación enviada por WhatsApp correctamente");
    } catch (err) {
      console.error("Error enviando notificación WhatsApp:", err);
      alert("Error al enviar notificación por WhatsApp");
    }
  }

  const handleConfirmarLiquidacion = async () => {
    try {
      const serviciosSeleccionados = servicios.filter(s => selectedServicios.includes(s.id))
      const documentIds = serviciosSeleccionados.map(s => s.documentId)      
      if (documentIds.length === 0) {
        console.error('No hay servicios seleccionados para liquidar')
        return
      }

      console.log('Liquidando servicios...', documentIds)
      
      let liquidados = await serviciosService.liquidarServicios(documentIds)
      if (liquidados) {
        await handleEnviarWhatsappConfirmacion();
      }  

      console.log('Servicios liquidados exitosamente')
      
      setShowLiquidacionModal(false)
      setSelectedServicios([])
      
      // Recargar datos para mostrar servicios actualizados
      const comercioParam = !selectedComercio || selectedComercio === "all" ? undefined : selectedComercio;
      const data = await getServicios(
        selectedDomiciliario,
        fechaInicio || undefined,
        fechaFin || undefined,
        comercioParam,
        page,
        pageSize
      )
      setServicios(data?.data || []);
      
    } catch (error) {
      console.error('Error al liquidar servicios:', error)
      // TODO: Mostrar mensaje de error al usuario
    }
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="p-2 sm:p-6 space-y-3 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Liquidador de Servicios</h1>
                <p className="text-xs text-gray-600 sm:text-sm hidden sm:block">Liquida los servicios de tus colaboradores</p>
                <p className="text-xs text-gray-600 sm:hidden">Gestión de liquidaciones</p>
              </div>
            </div>
          </div>

          {/* Stats Cards - Mobile-first grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            <StatCard
              title="Total de Servicios"
              icon={<Package />}
              value={loadingServicios ? "..." : totalLiquidados + totalNoLiquidados}
              color="text-purple-700"
              footer="Total realizados"
            />
            <StatCard
              title="Servicios Liquidados"
              icon={<Clock />}
              value={loadingServicios ? "..." : totalLiquidados}
              color="text-green-600"
              footer="Ya liquidados"
            />
            <StatCard
              title="Servicios No Liquidados"
              icon={<Clock />}
              value={loadingServicios ? "..." : totalNoLiquidados}
              color="text-red-600"
              footer="Pendientes de liquidar"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Liquidación de Servicios de :
              {servicios.length > 0 && servicios[0].colaborador ? (
                <span className="ml-2 text-purple-700 font-semibold">
                  {servicios[0].colaborador.nombre || servicios[0].colaborador.name || ''} {servicios[0].colaborador.apellido || ''}
                </span>
              ) : (
                <span className="ml-2 text-gray-400">Sin domiciliario</span>
              )}
            </CardTitle>

          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={liquidadoFilter} onValueChange={v => { setLiquidadoFilter(v as any); setPage(1); }}>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Filtrar por liquidación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Servicios no liquidados</SelectItem>
                  <SelectItem value="si">Servicios liquidados</SelectItem>
                  <SelectItem value="todos">Todos los servicios</SelectItem>
                </SelectContent>
              </Select>
           

              <div className="flex items-center gap-2">
                <label className="text-sm">Desde</label>
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm">Hasta</label>
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                />
              </div>
            </div>

            {selectedDomiciliario && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Checkbox
                          checked={selectedServicios.length === servicios.length && servicios.length > 0}
                          onCheckedChange={handleCheckAll}
                        />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha solicitud</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Comercio</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Locación</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Liquidado</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {loadingServicios ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center">
                        Cargando servicios...
                      </TableCell>
                    </TableRow>
                  ) : servicios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center">
                        No hay servicios para este domiciliario
                      </TableCell>
                    </TableRow>
                  ) : (
                    servicios.map((s: any) => {
                      const tipo = s.tipo?.descripcion?.toLowerCase() || "domicilio"
                      const valor = tipo === "rural" ? 8000 : 5000
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            {!s.liquidado && (
                              <Checkbox
                                checked={selectedServicios.includes(s.id)}
                                onCheckedChange={() => handleCheck(s.id)}
                              />
                            )}
                          </TableCell>
                          <TableCell>{s.id}</TableCell>
                          <TableCell>
                            {s.fechaSolicitud ? new Date(s.fechaSolicitud).toLocaleString() : ""}
                          </TableCell>
                          <TableCell>{s.estado}</TableCell>
                          <TableCell>{s.comercio?.nombre || ""}</TableCell>
                          <TableCell>{s.tipo?.descripcion || "domicilio"}</TableCell>
                          <TableCell>{formatCurrency(valor)}</TableCell>
                          <TableCell>
                            {s.locacion?.tipo === "rural"
                              ? "Rural"
                              : s.locacion?.tipo === "urbano"
                              ? "Urbano"
                              : "Urbano"}
                          </TableCell>
                          <TableCell>
                            {s.colaborador?.nombre + " " + s.colaborador?.apellido  }
                          </TableCell>
                          <TableCell>{s.liquidado ? "Sí" : "No"}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
                </Table>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm">
                    Seleccionados: <span className="font-bold">{selectedServicios.length}</span>
                  </div>
                  <div className="text-lg font-bold">
                    Total a liquidar: <span className="text-purple-700">{formatCurrency(total)}</span>
                  </div>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={selectedServicios.length === 0}
                    onClick={handleLiquidar}
                  >
                    Liquidar seleccionados
                  </Button>
                </div>
                {/* Paginación */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                    Anterior
                  </Button>
                  <span>Página {page} de {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Modal de Liquidación */}
        {showLiquidacionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-purple-700">
                  Confirmar Liquidación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const valores = getValoresLiquidacion()
                  return (
                    <>
                      {/* Información del Domiciliario */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Información del Domiciliario</h3>
                        <p><strong>Nombre:</strong> {valores.nombreDomiciliario}</p>
                        <p><strong>Servicios a liquidar:</strong> {valores.serviciosCount}</p>
                        <p><strong>Fecha inicio:</strong> {valores.fechaInicioLiquidacion}</p>
                        <p><strong>Fecha fin:</strong> {valores.fechaFinLiquidacion}</p>
                      </div>

                      {/* Detalle de Servicios */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Detalle de Servicios</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p><strong>Servicios Urbanos:</strong> {valores.urbanos}</p>
                            <p className="text-sm text-gray-600">Valor: {formatCurrency(valores.urbanos * 5000)}</p>
                          </div>
                          <div>
                            <p><strong>Servicios Rurales:</strong> {valores.rurales}</p>
                            <p className="text-sm text-gray-600">Valor: {formatCurrency(valores.rurales * 8000)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Distribución de Valores */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Distribución de Valores</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Bruto:</span>
                            <span className="font-bold">{formatCurrency(valores.totalValor)}</span>
                          </div>
                          <div className="flex justify-between text-green-700">
                            <span>Para Domiciliario (70%):</span>
                            <span className="font-bold">{formatCurrency(valores.valorDomiciliario)}</span>
                          </div>
                          <div className="flex justify-between text-purple-700">
                            <span>Para Aplicación (30%):</span>
                            <span className="font-bold">{formatCurrency(valores.valorAplicacion)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Botones */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          onClick={handleEnviarWhatsapp}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1 flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Enviar por WhatsApp
                        </Button>
                        <Button
                          onClick={handleConfirmarLiquidacion}
                          className="bg-purple-600 hover:bg-purple-700 text-white flex-1 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirmar Liquidación
                        </Button>
                        <Button
                          onClick={() => setShowLiquidacionModal(false)}
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cerrar
                        </Button>
                      </div>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}

function StatCard({ title, icon, value, color, footer }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="h-4 w-4 text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{footer}</p>
      </CardContent>
    </Card>
  )
}

"use client"

import { Package, MapPin, Users, Clock } from "lucide-react"
import { estadoConfig } from "@/lib/estadoConfig"
import { useEffect, useState, useMemo } from "react"
import { serviciosService, ServicioStrapi } from "@/services/servicios.service"
import { Button } from "@/components/ui/button"
import { AdminLayout } from "@/components/dashboard-layout"
import SeguimientoServiciosTable from "@/components/seguimiento-servicios-table"
import { SeguimientoServiciosTableResponsive } from "@/components/seguimiento-servicios-table-responsive"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthGuard } from "@/components/auth-guard"

export default function SeguimientoServiciosPage() {
  // Exportar a Excel (CSV)
    const handleExportExcel = async () => {
      // Obtener todos los registros según filtro, no solo los renderizados
      let allServicios: ServicioStrapi[] = [];
      let currentPage = 1;
      const pageSizeExport = 100;
      let totalExport = 0;
      let keepFetching = true;
      if (busqueda.trim() && filtroEstado === "todos" && !soloHoy) {
        // Si hay búsqueda y está en ver todos, usar el endpoint de búsqueda
        let allResults: ServicioStrapi[] = [];
        let pageSearch = 1;
        let totalSearch = 0;
        let keepSearching = true;
        do {
          const res = await serviciosService.getAll({
            filters: {
              $or: [
                { comercio: { $containsi: busqueda.trim() } },
                { direccion: { $containsi: busqueda.trim() } },
                { colaborador: { nombre: { $containsi: busqueda.trim() } } },
                { colaborador: { apellido: { $containsi: busqueda.trim() } } }
              ]
            },
            sort: ["createdAt:desc"],
            pagination: { page: pageSearch, pageSize: pageSizeExport },
          });
          const data = res.data || [];
          totalSearch = res.meta?.pagination?.total || 0;
          allResults = allResults.concat(data);
          pageSearch++;
          keepSearching = allResults.length < totalSearch;
        } while (keepSearching);
        allServicios = allResults;
      } else {
        // Modo normal: recorrer todas las páginas
        do {
          const res = soloHoy
            ? await serviciosService.getHoy({
                sort: ["createdAt:desc"],
                pagination: { page: currentPage, pageSize: pageSizeExport },
              })
            : await serviciosService.getAll({
                sort: ["createdAt:desc"],
                pagination: { page: currentPage, pageSize: pageSizeExport },
              });
          const data = res.data || [];
          totalExport = res.meta?.pagination?.total || 0;
          allServicios = allServicios.concat(data);
          currentPage++;
          keepFetching = allServicios.length < totalExport;
        } while (keepFetching);
      }

      // Filtrar por búsqueda y estado
      const serviciosFiltrados = allServicios.filter(s => {
        const term = busqueda.toLowerCase();
        const matchBusqueda =
          !term ||
          String(s.id).toLowerCase().includes(term) ||
          (s.comercio?.nombre || "").toLowerCase().includes(term) ||
          (s.colaborador?.nombre || "").toLowerCase().includes(term) ||
          (s.colaborador?.apellido || "").toLowerCase().includes(term);
        const matchEstado = filtroEstado === "todos" || s.estado === filtroEstado;
        return matchBusqueda && matchEstado;
      });
      // Encabezados como en la tabla + cuenta regresiva y tiempo total
      const headers = [
        "ID", "Comercio", "Estado", "Dirección", "Fecha Solicitud", "Domiciliario", "Fecha Liquidación", "Liquidado", "Tiempo de asignación", "Tiempo Total (min)"
      ];
      // Filas con formato y punto y coma como separador
      const rows = serviciosFiltrados.map(s => {
        // Cuenta regresiva: si no está asignado, tiempo desde solicitud hasta ahora; si está asignado, tiempo entre solicitud y asignación
        let cuentaRegresiva = "";
        if (!s.fechaAsignado && s.fechaSolicitud) {
          const start = new Date(s.fechaSolicitud).getTime();
          const now = Date.now();
          const diff = Math.max(0, now - start);
          const min = Math.floor(diff / 60000);
          const sec = Math.floor((diff % 60000) / 1000);
          cuentaRegresiva = `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
        } else if (s.fechaAsignado && s.fechaSolicitud) {
          const start = new Date(s.fechaSolicitud).getTime();
          const end = new Date(s.fechaAsignado).getTime();
          const diff = Math.max(0, end - start);
          const min = Math.floor(diff / 60000);
          const sec = Math.floor((diff % 60000) / 1000);
          cuentaRegresiva = `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
        }

        // Tiempo total: si tiene fechaEntrega y fechaSolicitud
        let tiempoTotal = "";
        if (s.fechaEntrega && s.fechaSolicitud) {
          const diffMs = new Date(s.fechaEntrega).getTime() - new Date(s.fechaSolicitud).getTime();
          tiempoTotal = Math.floor(diffMs / 60000).toString();
        }

        return [
          s.id,
          s.comercio?.nombre || "",
          s.estado,
          s.direccion,
          s.fechaSolicitud,
          s.colaborador ? `${s.colaborador.nombre} ${s.colaborador.apellido || ""}` : "",
          s.fechaLiquidacion,
          s.liquidado,
          cuentaRegresiva,
          tiempoTotal
        ];
      });
      // Agregar comillas si el campo tiene punto y coma o coma
      const formatCell = (cell: any) => {
        const str = String(cell ?? "");
        return /[;,\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      };
      const csv = [headers, ...rows]
        .map(r => r.map(formatCell).join(";"))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "seguimiento-servicios.csv";
      a.click();
      URL.revokeObjectURL(url);
    };
  const [servicios, setServicios] = useState<ServicioStrapi[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [soloHoy, setSoloHoy] = useState(true)
  // Estado para búsqueda y filtro
  const [busqueda, setBusquedaState] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaAsignacionInicio, setFechaAsignacionInicio] = useState("");
  const [fechaAsignacionFin, setFechaAsignacionFin] = useState("");
  // Estado para controlar si la paginación está activa
  const paginacionActiva = !(busqueda.trim() && filtroEstado === "todos" && !soloHoy);

  // Handler para búsqueda que desactiva soloHoy automáticamente
  const setBusqueda = (value: string) => {
    setBusquedaState(value);
    if (value.trim() && soloHoy) {
      setSoloHoy(false);
    }
  };

  const fetchServicios = async (pageArg = page, pageSizeArg = pageSize, hoy = soloHoy) => {
    setLoading(true);
    setError(null);
    try {
      if (busqueda.trim() && filtroEstado === "todos" && !hoy) {
        let allResults: ServicioStrapi[] = [];
        let pageSearch = 1;
        let totalSearch = 0;
        let keepSearching = true;
        const filters: any = {
          $or: [
            { comercio: { $containsi: busqueda.trim() } },
            { direccion: { $containsi: busqueda.trim() } },
            { colaborador: { nombre: { $containsi: busqueda.trim() } } },
            { colaborador: { apellido: { $containsi: busqueda.trim() } } }
          ]
        };
        if (fechaAsignacionInicio && fechaAsignacionFin) {
          filters.fechaAsignado = { $between: [fechaAsignacionInicio, fechaAsignacionFin] };
        } else if (fechaAsignacionInicio) {
          filters.fechaAsignado = { $gte: fechaAsignacionInicio };
        } else if (fechaAsignacionFin) {
          filters.fechaAsignado = { $lte: fechaAsignacionFin };
        }
        do {
          const res = await serviciosService.getAll({
            filters,
            sort: ["createdAt:desc"],
            pagination: { page: pageSearch, pageSize: pageSizeArg },
          });
          const data = res.data || [];
          totalSearch = res.meta?.pagination?.total || 0;
          allResults = allResults.concat(data);
          pageSearch++;
          keepSearching = allResults.length < totalSearch;
        } while (keepSearching);
        setServicios(allResults);
        setTotal(allResults.length);
      } else {
        const filters: any = {};
        if (fechaAsignacionInicio && fechaAsignacionFin) {
          filters.fechaAsignado = { $between: [fechaAsignacionInicio, fechaAsignacionFin] };
        } else if (fechaAsignacionInicio) {
          filters.fechaAsignado = { $gte: fechaAsignacionInicio };
        } else if (fechaAsignacionFin) {
          filters.fechaAsignado = { $lte: fechaAsignacionFin };
        }
        const res = hoy
          ? await serviciosService.getHoy({
              sort: ["createdAt:desc"],
              pagination: { page: pageArg, pageSize: pageSizeArg },
            })
          : await serviciosService.getAll({
              sort: ["createdAt:desc"],
              pagination: { page: pageArg, pageSize: pageSizeArg },
              filters,
            });
        setServicios(res.data || []);
        setTotal(res.meta?.pagination?.total || 0);
      }
    } catch (e) {
      setError("Error al cargar los servicios");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios(page, pageSize, soloHoy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, soloHoy])

  const { activos, completadosHoy, domiciliarios, tiempoPromedio } = useMemo(() => {
    const activos = servicios.filter(s =>
      ["pendiente", "asignado", "llegada_comercio", "recibi_paquete"].includes(s.estado)
    ).length

    const completadosHoy = servicios.filter(
      s =>
        s.estado === "entregado" &&
        s.fechaEntrega &&
        new Date(s.fechaEntrega).toDateString() === new Date().toDateString()
    ).length

    const domiciliarios = new Set(servicios.filter(s => s.colaborador).map(s => s.colaborador?.id)).size

    const tiempos = servicios
      .filter(s => s.fechaEntrega && s.fechaSolicitud)
      .map(s => (new Date(s.fechaEntrega!).getTime() - new Date(s.fechaSolicitud).getTime()) / 60000)

    const tiempoPromedio = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0

    return { activos, completadosHoy, domiciliarios, tiempoPromedio }
  }, [servicios])

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Seguimiento de Servicios</h1>
                <p className="text-sm text-gray-600">Estado en tiempo real</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPage(1)
                setSoloHoy(prev => !prev)
              }}
              disabled={loading}
              className={`flex items-center px-3 py-2 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                soloHoy
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 border-purple-600 text-white"
                  : "bg-white border-gray-300 hover:border-purple-400 text-gray-700"
              } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
              aria-pressed={soloHoy}
              title="Mostrar solo servicios de hoy"
            >
              {soloHoy ? "Solo hoy ✓" : "Ver todos"}
            </button>
          </div>

          {error && <div className="text-red-500 font-semibold">{error}</div>}

          {/* Stats Cards con fondo blanco */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Servicios Activos" icon={<Clock className="text-blue-600" />} value={loading ? "..." : activos} footer="En proceso" accent="text-blue-600" />
            <StatCard title="Completados Hoy" icon={<Package className="text-green-600" />} value={loading ? "..." : completadosHoy} footer="Hoy" accent="text-green-600" />
            <StatCard title="Domiciliarios" icon={<Users className="text-purple-600" />} value={loading ? "..." : domiciliarios} footer="Disponibles" accent="text-purple-600" />
            <StatCard title="Tiempo Promedio" icon={<MapPin className="text-orange-600" />} value={loading ? "..." : `${tiempoPromedio}m`} footer="Por servicio" accent="text-orange-600" />
          </div>

          {/* Filtros */}
          <div className="rounded-2xl bg-white shadow p-4 border border-gray-100">
            <div className="flex flex-wrap gap-3 items-center py-2">
              <input
                type="date"
                value={fechaAsignacionInicio}
                onChange={e => setFechaAsignacionInicio(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
                placeholder="Fecha asignación inicio"
              />
              <span>-</span>
              <input
                type="date"
                value={fechaAsignacionFin}
                onChange={e => setFechaAsignacionFin(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
                placeholder="Fecha asignación fin"
              />
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="border rounded px-2 py-1 text-sm flex-1"
                placeholder="Buscar por ID, comercio o domiciliario"
              />
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="todos">Todos los estados</option>
                {Object.keys(estadoConfig).map(key => (
                  <option key={key} value={key}>
                    {estadoConfig[key].label}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => {
                  setPage(1);
                  fetchServicios(1, pageSize, soloHoy);
                }}
                className="whitespace-nowrap"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Aplicar filtros"}
              </Button>
                <Button variant="outline" onClick={handleExportExcel} className="flex gap-2 items-center">
              Descargar Excel
            </Button>
            </div>
          </div>

          {/* Tabla responsive y exportación */}
          <div className="flex justify-end mb-2">
          
          </div>
          <div className="rounded-2xl bg-white shadow p-2 sm:p-4 border border-gray-100">
            {/* Desktop table */}
            <div className="hidden lg:block">
              <SeguimientoServiciosTable
                serviciosFiltrados={
                  servicios.filter(s => {
                    // Filtro de búsqueda por ID, comercio o domiciliario
                    const term = busqueda.toLowerCase();
                    const matchBusqueda =
                      !term ||
                      String(s.id).toLowerCase().includes(term) ||
                      (s.comercio?.nombre || "").toLowerCase().includes(term) ||
                      (s.colaborador?.nombre || "").toLowerCase().includes(term) ||
                      (s.colaborador?.apellido || "").toLowerCase().includes(term);
                    // Filtro de estado
                    const matchEstado = filtroEstado === "todos" || s.estado === filtroEstado;
                    return matchBusqueda && matchEstado;
                  })
                }
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                filtroEstado={filtroEstado}
                setFiltroEstado={setFiltroEstado}
                loading={loading}
                onRefresh={() => fetchServicios(page, pageSize, soloHoy)}
                estadoConfig={estadoConfig}
              />
            </div>
            {/* Mobile/Tablet responsive cards */}
            <div className="block lg:hidden">
              <SeguimientoServiciosTableResponsive
                servicios={servicios}
                loading={loading}
                onRefresh={() => fetchServicios(page, pageSize, soloHoy)}
                estadoConfig={estadoConfig}
              />
            </div>
          </div>

          {/* Paginación condicional */}
          {paginacionActiva ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mt-4">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Página {page} de {Math.ceil(total / pageSize) || 1} ({total} servicios)
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-end">
                <button
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Anterior
                </button>
                <button
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * pageSize >= total || loading}
                >
                  Siguiente
                </button>
                <select
                  className="ml-2 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
                  disabled={loading}
                >
                  {[10, 20, 50, 100].map(size => (
                    <option key={size} value={size}>
                      {size} por página
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex justify-end items-center gap-2 p-2">
              <span className="text-xs text-gray-600">Mostrando todos los resultados ({total} servicios)</span>
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}

import type { ReactNode } from "react"

function StatCard({ title, icon, value, footer, accent }: { title: string; icon: ReactNode; value: string | number; footer: string; accent: string }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-800">{title}</CardTitle>
        <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${accent}`}>{value}</div>
        <p className="text-xs text-gray-600">{footer}</p>
      </CardContent>
    </Card>
  )
}

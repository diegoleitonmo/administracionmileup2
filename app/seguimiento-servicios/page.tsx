"use client"

import { Package, MapPin, Users, Clock } from "lucide-react"
import { estadoConfig } from "@/lib/estadoConfig"
import { useEffect, useState, useMemo } from "react"
import { serviciosService, ServicioStrapi } from "@/services/servicios.service"
import { AdminLayout } from "@/components/dashboard-layout"
import SeguimientoServiciosTable from "@/components/seguimiento-servicios-table"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthGuard } from "@/components/auth-guard"

export default function SeguimientoServiciosPage() {
  const [servicios, setServicios] = useState<ServicioStrapi[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [soloHoy, setSoloHoy] = useState(true)

  const fetchServicios = async (pageArg = page, pageSizeArg = pageSize, hoy = soloHoy) => {
    setLoading(true)
    setError(null)
    try {
      const res = hoy
        ? await serviciosService.getHoy({
            sort: ["createdAt:desc"],
            pagination: { page: pageArg, pageSize: pageSizeArg },
          })
        : await serviciosService.getAll({
            sort: ["createdAt:desc"],
            pagination: { page: pageArg, pageSize: pageSizeArg },
          })

      setServicios(res.data || [])
      setTotal(res.meta?.pagination?.total || 0)
    } catch (e) {
      setError("Error al cargar los servicios")
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

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
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Seguimiento de Servicios</h1>
                <p className="text-gray-600">Monitorea el estado de todos los servicios en tiempo real</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPage(1)
                setSoloHoy(prev => !prev)
              }}
              disabled={loading}
              className={`flex items-center px-3 py-1 rounded-full border-2 transition-colors duration-200 focus:outline-none ${
                soloHoy ? "bg-purple-600 border-purple-600" : "bg-gray-200 border-gray-300"
              } ${loading ? "opacity-60 cursor-not-allowed" : "hover:border-purple-500"}`}
              aria-pressed={soloHoy}
              title="Mostrar solo servicios de hoy"
            >
              <span
                className={`inline-block w-5 h-5 rounded-full transition-all duration-200 mr-2 ${
                  soloHoy ? "bg-white border border-purple-600" : "bg-gray-400 border border-gray-300"
                }`}
                style={{ boxShadow: soloHoy ? "0 0 0 2px #a78bfa" : undefined }}
              >
                {soloHoy && (
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={`text-sm font-semibold ${soloHoy ? "text-white" : "text-gray-700"}`}>
                Solo hoy
              </span>
            </button>
          </div>

          {/* Error */}
          {error && <div className="text-red-500 font-semibold">{error}</div>}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Servicios Activos" icon={<Clock />} value={loading ? "..." : activos} color="text-blue-600" footer="En proceso" />
            <StatCard title="Completados Hoy" icon={<Package />} value={loading ? "..." : completadosHoy} color="text-green-600" footer="Hoy" />
            <StatCard title="Domiciliarios" icon={<Users />} value={loading ? "..." : domiciliarios} color="text-purple-600" footer="Disponibles" />
            <StatCard title="Tiempo Promedio" icon={<MapPin />} value={loading ? "..." : `${tiempoPromedio}m`} color="text-orange-600" footer="Por servicio" />
          </div>

          {/* Table */}
          <SeguimientoServiciosTable
            serviciosFiltrados={servicios}
            loading={loading}
            onRefresh={() => fetchServicios(page, pageSize, soloHoy)}
            estadoConfig={estadoConfig}
          />

          {/* Paginación */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Página {page} de {Math.ceil(total / pageSize) || 1} ({total} servicios)
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Anterior
              </button>
              <button
                className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= total || loading}
              >
                Siguiente
              </button>
              <select
                className="ml-2 border rounded px-2 py-1 text-sm"
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

"use client"

import { Package, MapPin, Users, Clock } from "lucide-react"
import { estadoConfig } from "@/lib/estadoConfig"
import { useEffect, useState, useMemo } from "react"
import { serviciosService, ServicioStrapi } from "@/services/servicios.service"
import { AdminLayout } from "@/components/dashboard-layout"
import SeguimientoServiciosTable from "@/components/seguimiento-servicios-table"
import { SeguimientoServiciosTableResponsive } from "@/components/seguimiento-servicios-table-responsive"
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

          {/* Tabla responsive */}
          <div className="rounded-2xl bg-white shadow p-2 sm:p-4 border border-gray-100">
            {/* Desktop table */}
            <div className="hidden lg:block">
              <SeguimientoServiciosTable
                serviciosFiltrados={servicios}
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

          {/* Paginación */}
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

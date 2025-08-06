import { AuthGuard } from "@/components/auth-guard"
import { AdminLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartSection } from "@/components/chart-section"
import { TrendingUp, Bookmark, Diamond } from "lucide-react"

export default function Dashboard() {
  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
          {/* Header responsive - Mobile-first, con menú hamburguesa */}
          <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
             
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.09-.21 2.28-.71 3.33-1.36C16.67 25.29 18.91 24.79 20 24c2.16-1.21 2-6.45 2-11V7l-10-5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-xs sm:text-base text-gray-500 font-medium">Resumen general del sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-100 to-purple-50 px-3 py-2 rounded-xl mt-2 sm:mt-0 shadow-sm">
              <span className="text-xs sm:text-sm font-semibold text-purple-700">Overview</span>
              <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center">
                <span className="text-[11px] sm:text-xs text-purple-700 font-bold">i</span>
              </div>
            </div>
          </div>

          {/* Metric Cards - Mobile-first grid, diseño moderno */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <MetricCard
              title="Servicios Activos"
              value="$ 15,0000"
              change="+60% esta semana"
              icon={<TrendingUp className="w-6 h-6" />}
              gradient="from-purple-500 via-fuchsia-500 to-pink-500"
              textColor="text-white"
            />
            <MetricCard
              title="Completados Hoy"
              value="45,6334"
              change="-10% hoy"
              icon={<Bookmark className="w-6 h-6" />}
              gradient="from-indigo-500 via-purple-500 to-fuchsia-500"
              textColor="text-white"
            />
            <MetricCard
              title="Domiciliarios"
              value="95,5741"
              change="+5% activos"
              icon={<Diamond className="w-6 h-6" />}
              gradient="from-purple-400 via-violet-500 to-indigo-500"
              textColor="text-white"
            />
          </div>

          {/* Charts Section - Layout responsive, tarjetas con sombra y bordes suaves */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-2xl bg-white shadow-xl p-2 sm:p-4">
              <ChartSection
                title="Visit And Sales Statistics"
                countries={[
                  { name: "CHN", color: "bg-purple-500" },
                  { name: "USA", color: "bg-cyan-500" },
                  { name: "UK", color: "bg-orange-400" },
                ]}
              />
            </div>
            <div className="rounded-2xl bg-white shadow-xl p-2 sm:p-4">
              <ChartSection title="Traffic Sources" isChart={true} />
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}

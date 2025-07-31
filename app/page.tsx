import { AdminLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { ChartSection } from "@/components/chart-section"
import { TrendingUp, Bookmark, Diamond } from "lucide-react"

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.09-.21 2.28-.71 3.33-1.36C16.67 25.29 18.91 24.79 20 24c2.16-1.21 2-6.45 2-11V7l-10-5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Overview</span>
            <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-xs text-purple-600">i</span>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Weekly Sales"
            value="$ 15,0000"
            change="Increased by 60%"
            icon={<TrendingUp className="w-6 h-6" />}
            gradient="from-orange-400 via-pink-400 to-pink-500"
            textColor="text-white"
          />
          <MetricCard
            title="Weekly Orders"
            value="45,6334"
            change="Decreased by 10%"
            icon={<Bookmark className="w-6 h-6" />}
            gradient="from-blue-400 via-blue-500 to-blue-600"
            textColor="text-white"
          />
          <MetricCard
            title="Visitors Online"
            value="95,5741"
            change="Increased by 5%"
            icon={<Diamond className="w-6 h-6" />}
            gradient="from-emerald-400 via-teal-400 to-teal-500"
            textColor="text-white"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSection
            title="Visit And Sales Statistics"
            countries={[
              { name: "CHN", color: "bg-purple-500" },
              { name: "USA", color: "bg-cyan-500" },
              { name: "UK", color: "bg-orange-400" },
            ]}
          />
          <ChartSection title="Traffic Sources" isChart={true} />
        </div>
      </div>
    </AdminLayout>
  )
}

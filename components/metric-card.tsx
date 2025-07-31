import type React from "react"
interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  gradient: string
  textColor: string
}

export function MetricCard({ title, value, change, icon, gradient, textColor }: MetricCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-6 shadow-lg`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/20"></div>
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10"></div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-medium ${textColor}`}>{title}</h3>
          <div className={`${textColor} opacity-80`}>{icon}</div>
        </div>

        <div className="space-y-2">
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
          <p className={`text-sm ${textColor} opacity-90`}>{change}</p>
        </div>
      </div>
    </div>
  )
}

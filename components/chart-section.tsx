interface Country {
  name: string
  color: string
}

interface ChartSectionProps {
  title: string
  countries?: Country[]
  isChart?: boolean
}

export function ChartSection({ title, countries, isChart }: ChartSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {countries && (
          <div className="flex items-center gap-4">
            {countries.map((country, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${country.color}`}></div>
                <span className="text-sm text-gray-600">{country.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        {isChart ? (
          <div className="relative w-48 h-48">
            {/* Simple pie chart representation */}
            <div className="w-full h-full rounded-full bg-gradient-to-r from-orange-400 via-cyan-400 to-pink-400 opacity-80"></div>
            <div className="absolute inset-4 bg-white rounded-full"></div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-100 via-blue-100 to-cyan-100 rounded-lg flex items-end justify-center p-4">
            {/* Simple bar chart representation */}
            <div className="flex items-end gap-2 h-32">
              <div className="w-8 bg-purple-400 h-20 rounded-t"></div>
              <div className="w-8 bg-cyan-400 h-24 rounded-t"></div>
              <div className="w-8 bg-orange-400 h-16 rounded-t"></div>
              <div className="w-8 bg-purple-400 h-28 rounded-t"></div>
              <div className="w-8 bg-cyan-400 h-12 rounded-t"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

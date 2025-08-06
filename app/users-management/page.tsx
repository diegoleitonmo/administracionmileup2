"use client"
import { AuthGuard } from "@/components/auth-guard"
import { AdminLayout } from "@/components/dashboard-layout"
import { StrapiUsersTable } from "@/components/strapi-users-table"
import { StrapiUsersTableResponsive } from "@/components/strapi-users-table-responsive"
import { useEffect, useState } from "react"
import { Users, UserCheck, UserX, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch users from Strapi
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { strapiAuth } = await import("@/lib/strapi-auth")
      const data = await strapiAuth.getAllUsers()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Stats
  const total = users.length
  const confirmados = users.filter((u) => u.confirmed).length
  const bloqueados = users.filter((u) => u.blocked).length
  const roles = Array.from(new Set(users.map((u) => u.role?.name).filter(Boolean))).length

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="pt-10 px-2 md:px-4 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Gestión de Usuarios</h1>
              <p className="text-gray-600 text-sm">Administra y monitorea los usuarios y roles</p>
            </div>
          </div>

          {/* Stats Cards con fondo blanco */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <WhiteCard
              title="Total Usuarios"
              value={loading ? "..." : total}
              icon={<Users className="h-5 w-5 text-purple-600" />}
              accent="text-purple-600"
              subtitle="Registrados"
            />
            <WhiteCard
              title="Confirmados"
              value={loading ? "..." : confirmados}
              icon={<UserCheck className="h-5 w-5 text-green-600" />}
              accent="text-green-600"
              subtitle="Verificados"
            />
            <WhiteCard
              title="Bloqueados"
              value={loading ? "..." : bloqueados}
              icon={<UserX className="h-5 w-5 text-red-600" />}
              accent="text-red-600"
              subtitle="Suspendidos"
            />
            <WhiteCard
              title="Roles"
              value={loading ? "..." : roles}
              icon={<Shield className="h-5 w-5 text-blue-600" />}
              accent="text-blue-600"
              subtitle="Diferentes roles"
            />
          </div>

          {/* Tabla responsive */}
          <div className="rounded-2xl bg-white shadow-xl p-2 sm:p-4 border border-gray-100">
            {/* Desktop table */}
            <div className="hidden lg:block">
              <StrapiUsersTable users={users} loading={loading} onRefresh={fetchUsers} />
            </div>
            {/* Mobile/Tablet responsive cards */}
            <div className="block lg:hidden">
              <StrapiUsersTableResponsive users={users} loading={loading} onRefresh={fetchUsers} />
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}

function WhiteCard({
  title,
  value,
  icon,
  accent,
  subtitle,
}: {
  title: string
  value: string | number
  icon: JSX.Element
  accent: string
  subtitle: string
}) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${accent}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

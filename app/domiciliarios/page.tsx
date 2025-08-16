"use client"
import { AdminLayout } from "@/components/dashboard-layout"
import { DomiciliariosTable } from "@/components/domiciliarios-table"
import { domiciliariosService, ColaboradorStrapi } from "@/services/domiciliarios.service"
import { Domiciliario } from "@/components/domiciliarios-table"
import { Users, UserCheck, UserX, Bike } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { strapiAuth } from "@/lib/strapi-auth"
import { AuthGuard } from "@/components/auth-guard"

export default function DomiciliariosPage() {
  const [domiciliarios, setDomiciliarios] = useState<Domiciliario[]>([])
  const [loading, setLoading] = useState(false)

  // Mapeo helper
  const mapColabToDomiciliario = (colab: ColaboradorStrapi): Domiciliario => {
    const validTransportes = ["moto", "bicicleta", "carro", "a_pie"] as const;
    let transporte: Domiciliario["transporte"] = "moto";
    if (validTransportes.includes(colab.tipotransporte as any)) {
      transporte = colab.tipotransporte as Domiciliario["transporte"];
    } else if (colab.tipotransporte?.toLowerCase().includes("bici")) {
      transporte = "bicicleta";
    } else if (colab.tipotransporte?.toLowerCase().includes("carro")) {
      transporte = "carro";
    } else if (colab.tipotransporte?.toLowerCase().includes("pie")) {
      transporte = "a_pie";
    }
    const estado: Domiciliario["estado"] = colab.Activo ? "activo" : "inactivo";
    const disponible: Domiciliario["disponible"] = colab.disponibilidad ? "disponible" : "desconectado";
    return {
      id: colab.id.toString(),
      documentId: colab.documentId,
      nombre: `${colab.nombre} ${colab.apellido}`,
      telefono: colab.telefono,
      ciudad: colab.ciudad?.nombre || "",
      transporte,
      identificacion: colab.numeroIdentificacion || "sin dato",
      correo: colab.correoElectronico || "sin dato",
      estado,
      disponible,
      avatar: undefined,
      fechaRegistro: colab.createdAt?.split("T")[0] || "",
      serviciosCompletados: 0,
      calificacion: 0,
    }
  }

  const fetchDomiciliarios = async () => {
    setLoading(true)
    try {
      const data = await domiciliariosService.getColaboradores()
      setDomiciliarios((data.data as ColaboradorStrapi[]).map(mapColabToDomiciliario))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDomiciliarios()
  }, [])
  const router = useRouter()
  const [isAuth, setIsAuth] = useState<null | boolean>(null)
  useEffect(() => {
    const checkAuth = async () => {
      const token = strapiAuth.getStoredToken()
      if (!token || !(await strapiAuth.validateToken(token))) {
        router.push("/login")
        setIsAuth(false)
      } else {
        setIsAuth(true)
      }
    }
    checkAuth()
  }, [router])
  if (isAuth === null) {
    return <div className="p-10 text-center text-lg">Cargando...</div>
  }
  if (!isAuth) {
    return null
  }

  // Stats
  const total = domiciliarios.length
  const disponibles = domiciliarios.filter(d => d.disponible === "disponible").length
  // No hay campo "en servicio" real, así que lo dejamos en 0 o puedes ajustar la lógica si tienes ese dato
  const enServicio = 0
  const noDisponibles = domiciliarios.filter(d => d.disponible === "desconectado").length

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="pt-10 px-2 md:px-1 lg:px-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Gestión de Domiciliarios</h1>
                <p className="text-gray-600">Administra y monitorea el equipo de repartidores</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Domiciliarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{loading ? "..." : total}</div>
                <p className="text-xs text-muted-foreground">Registrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{loading ? "..." : disponibles}</div>
                <p className="text-xs text-muted-foreground">En línea ahora</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Servicio</CardTitle>
                <Bike className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{loading ? "..." : enServicio}</div>
                <p className="text-xs text-muted-foreground">Realizando entregas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">No Disponibles</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{loading ? "..." : noDisponibles}</div>
                <p className="text-xs text-muted-foreground">Fuera de línea</p>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <DomiciliariosTable domiciliarios={domiciliarios} loading={loading} onRefresh={fetchDomiciliarios} />
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}

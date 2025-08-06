"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Eye,
  MoreHorizontal,
  Mail,
  RefreshCw,
  UserPlus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react"
import type { StrapiUser } from "@/lib/strapi-auth"

interface StrapiUsersTableResponsiveProps {
  users: StrapiUser[]
  loading: boolean
  onRefresh: () => void
}

export function StrapiUsersTableResponsive({ users, loading, onRefresh }: StrapiUsersTableResponsiveProps) {
  const [busqueda, setBusqueda] = useState("")
  const [filtroConfirmado, setFiltroConfirmado] = useState<string>("todos")
  const [filtroBloqueado, setFiltroBloqueado] = useState<string>("todos")

  const usuariosFiltrados = users.filter((usuario) => {
    const matchBusqueda =
      usuario.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (usuario.role?.name || "").toLowerCase().includes(busqueda.toLowerCase())

    const matchConfirmado =
      filtroConfirmado === "todos" ||
      (filtroConfirmado === "confirmado" && usuario.confirmed) ||
      (filtroConfirmado === "no_confirmado" && !usuario.confirmed)

    const matchBloqueado =
      filtroBloqueado === "todos" || (filtroBloqueado === "bloqueado" && usuario.blocked) || (filtroBloqueado === "no_bloqueado" && !usuario.blocked)

    return matchBusqueda && matchConfirmado && matchBloqueado
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">Lista de Usuarios</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona y supervisa los usuarios ({usuariosFiltrados.length} de {users.length})
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>
        {/* Filtros responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, email o rol..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroConfirmado} onValueChange={setFiltroConfirmado}>
            <SelectTrigger>
              <SelectValue placeholder="Estado de confirmación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="confirmado">Confirmados</SelectItem>
              <SelectItem value="no_confirmado">No confirmados</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroBloqueado} onValueChange={setFiltroBloqueado}>
            <SelectTrigger>
              <SelectValue placeholder="Estado de bloqueo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="no_bloqueado">Activos</SelectItem>
              <SelectItem value="bloqueado">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {/* Desktop table (hidden on mobile) */}
        <div className="hidden lg:block">
          <div className="rounded-md border">
            {/* Puedes reutilizar aquí la tabla de StrapiUsersTable si lo deseas */}
          </div>
        </div>
        {/* Mobile/Tablet cards */}
        <div className="lg:hidden space-y-4 p-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No se encontraron usuarios</p>
              <Button variant="outline" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          ) : (
            usuariosFiltrados.map((usuario) => (
              <Card key={usuario.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Header con avatar y nombre */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={"/placeholder.svg"} />
                        <AvatarFallback>
                          {usuario.username
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-base">{usuario.username}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{usuario.email}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar usuario
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar correo
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {usuario.blocked ? (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Desbloquear
                            </>
                          ) : (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Bloquear
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {/* Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm">{usuario.role?.name || "Sin rol"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm truncate">{usuario.email}</span>
                    </div>
                  </div>
                  {/* Badges y estado */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`border ${usuario.blocked ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"} text-xs`}>
                      {usuario.blocked ? (
                        <>
                          <UserX className="w-3 h-3 mr-1" /> Bloqueado
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" /> Activo
                        </>
                      )}
                    </Badge>
                    <Badge className={`border ${usuario.confirmed ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"} text-xs`}>
                      {usuario.confirmed ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" /> Confirmado
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" /> No confirmado
                        </>
                      )}
                    </Badge>
                  </div>
                  {/* Fecha de registro */}
                  <div className="text-xs text-gray-500 font-mono border-t pt-2">
                    Fecha registro: {formatDate(usuario.createdAt)}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

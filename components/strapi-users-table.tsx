"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Eye,
  MoreHorizontal,
  Mail,
  Search,
  RefreshCw,
  UserPlus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useStrapiAuth } from "@/hooks/use-strapi-auth"
import { strapiAuth, type StrapiUser } from "@/lib/strapi-auth"

export function StrapiUsersTable() {
  const { jwt, user: currentUser } = useStrapiAuth()
  const [users, setUsers] = useState<StrapiUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [filtroConfirmado, setFiltroConfirmado] = useState<string>("todos")
  const [filtroBloqueado, setFiltroBloqueado] = useState<string>("todos")

  // Cargar usuarios
  const loadUsers = async () => {
    if (!jwt) return

    setLoading(true)
    setError(null)

    try {
      const usersData = await strapiAuth.getAllUsers(jwt)
      setUsers(usersData)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [jwt])

  // Filtrar usuarios
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
      filtroBloqueado === "todos" ||
      (filtroBloqueado === "bloqueado" && usuario.blocked) ||
      (filtroBloqueado === "no_bloqueado" && !usuario.blocked)

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lista de Usuarios</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{usuariosFiltrados.length} usuarios encontrados</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadUsers} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, email o rol..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filtroConfirmado} onValueChange={setFiltroConfirmado}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Estado de confirmación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="confirmado">Confirmados</SelectItem>
              <SelectItem value="no_confirmado">No confirmados</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroBloqueado} onValueChange={setFiltroBloqueado}>
            <SelectTrigger className="w-48">
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

      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Confirmado</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuariosFiltrados.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {usuario.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{usuario.username}</p>
                        <p className="text-xs text-gray-500">ID: {usuario.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-sm">{usuario.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      <Shield className="w-3 h-3" />
                      {usuario.role?.name || "Sin rol"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`border ${
                        usuario.blocked
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      }`}
                    >
                      {usuario.blocked ? (
                        <>
                          <UserX className="w-3 h-3 mr-1" />
                          Bloqueado
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Activo
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`border ${
                        usuario.confirmed
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}
                    >
                      {usuario.confirmed ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sí
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          No
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{formatDate(usuario.createdAt)}</TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {usuariosFiltrados.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron usuarios con los filtros aplicados</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando usuarios...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

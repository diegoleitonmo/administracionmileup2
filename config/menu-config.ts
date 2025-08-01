import {
  LayoutDashboard,
  Truck,
  Users,
  UserCheck,
  BarChart3,
  User,
  FileText,
  TrendingUp,
  Settings,
  Eye,
} from "lucide-react"

export type UserRole = "administrador" | "comercio" | "asistente"

export interface MenuItem {
  id: string
  title: string
  icon: any
  href: string
  roles: UserRole[]
  children?: MenuItem[]
}

export const adminMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    roles: ["administrador"],
  },
  {
    id: "seguimiento-servicios",
    title: "Seguimiento de Servicios",
    icon: Truck,
    href: "/seguimiento-servicios",
    roles: ["administrador"],
  },
  {
    id: "usuarios",
    title: "Usuarios",
    icon: Users,
    href: "/users-management",
    roles: ["administrador"],
  },
  {
    id: "domiciliarios",
    title: "Lista de Domiciliarios",
    icon: UserCheck,
    href: "/domiciliarios",
    roles: ["administrador"],
  },
  {
    id: "reportes",
    title: "Reportes Básicos",
    icon: BarChart3,
    href: "#",
    roles: ["administrador"],
    children: [
      {
        id: "reporte-servicios",
        title: "Reporte de Servicios",
        icon: FileText,
        href: "/reportes/servicios",
        roles: ["administrador"],
      },
      {
        id: "reporte-domiciliarios",
        title: "Reporte de Domiciliarios",
        icon: UserCheck,
        href: "/reportes/domiciliarios",
        roles: ["administrador"],
      },
      {
        id: "estadisticas",
        title: "Estadísticas Generales",
        icon: TrendingUp,
        href: "/reportes/estadisticas",
        roles: ["administrador"],
      },
    ],
  },
  {
    id: "perfil",
    title: "Mi Perfil",
    icon: User,
    href: "#",
    roles: ["administrador"],
    children: [
      {
        id: "ver-perfil",
        title: "Ver Perfil",
        icon: Eye,
        href: "/perfil",
        roles: ["administrador"],
      },
      {
        id: "configuracion",
        title: "Configuración",
        icon: Settings,
        href: "/configuracion",
        roles: ["administrador"],
      },
    ],
  },
]

export function getMenuByRole(role: UserRole): MenuItem[] {
  return adminMenuItems
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.roles.includes(role)) || [],
    }))
}

export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    administrador: "Administrador",
    comercio: "Comercio",
    asistente: "Asistente",
  }
  return roleNames[role] || "Usuario"
}

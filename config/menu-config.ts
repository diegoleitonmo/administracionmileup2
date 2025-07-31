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

export interface MenuItemLegacy {
  title: string
  icon: any
  href: string
  roles: UserRole[]
  children?: MenuItemLegacy[]
}

// Configuración del menú para administrador
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

// Función para obtener elementos del menú por rol
export function getMenuItemsByRole(role: UserRole): MenuItem[] {
  return adminMenuItems
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.roles.includes(role)),
    }))
}

// Función para obtener nombre del rol en español
export function getRoleName(role: UserRole): string {
  console.log("getRoleName called with:", role, "type:", typeof role)

  const roleNames: Record<UserRole, string> = {
    administrador: "Administrador",
    comercio: "Comercio",
    asistente: "Asistente",
  }

  const result = roleNames[role] || "Usuario"
  console.log("getRoleName result:", result)

  return result
}

// Configuración legacy para compatibilidad
export const menuConfig: MenuItemLegacy[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    roles: ["administrador"],
  },
  {
    title: "Seguimiento de Servicios",
    icon: Truck,
    href: "/seguimiento-servicios",
    roles: ["administrador"],
  },
  {
    title: "Usuarios",
    icon: Users,
    href: "/users-management",
    roles: ["administrador"],
  },
  {
    title: "Lista de Domiciliarios",
    icon: UserCheck,
    href: "/domiciliarios",
    roles: ["administrador"],
  },
  {
    title: "Reportes Básicos",
    icon: BarChart3,
    href: "#",
    roles: ["administrador"],
    children: [
      {
        title: "Reporte de Servicios",
        icon: FileText,
        href: "/reportes/servicios",
        roles: ["administrador"],
      },
      {
        title: "Reporte de Domiciliarios",
        icon: UserCheck,
        href: "/reportes/domiciliarios",
        roles: ["administrador"],
      },
      {
        title: "Estadísticas Generales",
        icon: TrendingUp,
        href: "/reportes/estadisticas",
        roles: ["administrador"],
      },
    ],
  },
  {
    title: "Mi Perfil",
    icon: User,
    href: "#",
    roles: ["administrador"],
    children: [
      {
        title: "Ver Perfil",
        icon: Eye,
        href: "/perfil",
        roles: ["administrador"],
      },
      {
        title: "Configuración",
        icon: Settings,
        href: "/configuracion",
        roles: ["administrador"],
      },
    ],
  },
]

// Función legacy para compatibilidad
export function getMenuByRole(role: UserRole, pathname?: string): MenuItemLegacy[] {
  console.log("=== MENU CONFIG DEBUG ===")
  console.log("getMenuByRole called with role:", role)
  console.log("Role type:", typeof role)
  console.log("Available menu items:", menuConfig.length)

  const filteredMenu = menuConfig
    .filter((item) => {
      const hasRole = item.roles.includes(role)
      console.log(`Item "${item.title}" - roles:`, item.roles, "- includes role:", hasRole)
      return hasRole
    })
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => {
        const hasChildRole = child.roles.includes(role)
        console.log(`  Child "${child.title}" - roles:`, child.roles, "- includes role:", hasChildRole)
        return hasChildRole
      }),
    }))

  console.log("Filtered menu items:", filteredMenu.length)
  console.log("Filtered menu:", filteredMenu)
  console.log("=== END MENU CONFIG DEBUG ===")

  return filteredMenu
}

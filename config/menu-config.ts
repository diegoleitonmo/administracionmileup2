import {
  Home,
  Circle,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  Package,
  UserCheck,
  MessageSquare,
  Calendar,
  TrendingUp,
  Shield,
  Database,
  Mail,
  Bell,
  Truck,
  Bike,
} from "lucide-react"

export interface MenuItem {
  icon: any
  label: string
  href: string
  active?: boolean
  hasSubmenu?: boolean
  submenu?: MenuItem[]
  roles: string[] // Roles que pueden ver este item
}

export const menuConfig: MenuItem[] = [
  // Dashboard - Todos los roles
  {
    icon: Home,
    label: "Dashboard",
    href: "/",
    roles: ["administrador", "comercio", "asistente"],
  },

  // Seguimiento de Servicios
  {
    icon: Truck,
    label: "Seguimiento de Servicios",
    href: "/seguimiento-servicios",
    roles: ["administrador", "comercio", "asistente"],
  },

  // Domiciliarios - Nuevo item
  {
    icon: Bike,
    label: "Domiciliarios",
    href: "/domiciliarios",
    roles: ["administrador", "comercio"],
  },

  // ADMINISTRADOR - Acceso completo
  {
    icon: Users,
    label: "Gestión de Usuarios",
    href: "/usuarios",
    hasSubmenu: true,
    submenu: [
      { icon: UserCheck, label: "Lista de Usuarios", href: "/usuarios/lista", roles: ["administrador"] },
      { icon: Shield, label: "Roles y Permisos", href: "/usuarios/roles", roles: ["administrador"] },
      { icon: Settings, label: "Configuración", href: "/usuarios/config", roles: ["administrador"] },
    ],
    roles: ["administrador"],
  },
  {
    icon: Database,
    label: "Sistema",
    href: "/sistema",
    hasSubmenu: true,
    submenu: [
      { icon: Settings, label: "Configuración General", href: "/sistema/config", roles: ["administrador"] },
      { icon: Database, label: "Base de Datos", href: "/sistema/database", roles: ["administrador"] },
      { icon: Shield, label: "Seguridad", href: "/sistema/seguridad", roles: ["administrador"] },
    ],
    roles: ["administrador"],
  },
  {
    icon: BarChart3,
    label: "Reportes Avanzados",
    href: "/reportes",
    hasSubmenu: true,
    submenu: [
      { icon: TrendingUp, label: "Analytics", href: "/reportes/analytics", roles: ["administrador"] },
      { icon: FileText, label: "Reportes Personalizados", href: "/reportes/custom", roles: ["administrador"] },
      { icon: BarChart3, label: "Métricas del Sistema", href: "/reportes/metricas", roles: ["administrador"] },
    ],
    roles: ["administrador"],
  },

  // COMERCIO - Gestión de ventas y productos
  {
    icon: ShoppingCart,
    label: "Ventas",
    href: "/ventas",
    hasSubmenu: true,
    submenu: [
      { icon: ShoppingCart, label: "Nueva Venta", href: "/ventas/nueva", roles: ["comercio", "administrador"] },
      { icon: FileText, label: "Historial de Ventas", href: "/ventas/historial", roles: ["comercio", "administrador"] },
      { icon: TrendingUp, label: "Estadísticas", href: "/ventas/estadisticas", roles: ["comercio", "administrador"] },
    ],
    roles: ["comercio", "administrador"],
  },
  {
    icon: Package,
    label: "Productos",
    href: "/productos",
    hasSubmenu: true,
    submenu: [
      { icon: Package, label: "Inventario", href: "/productos/inventario", roles: ["comercio", "administrador"] },
      { icon: Circle, label: "Categorías", href: "/productos/categorias", roles: ["comercio", "administrador"] },
      {
        icon: BarChart3,
        label: "Reportes de Producto",
        href: "/productos/reportes",
        roles: ["comercio", "administrador"],
      },
    ],
    roles: ["comercio", "administrador"],
  },
  {
    icon: Users,
    label: "Clientes",
    href: "/clientes",
    hasSubmenu: true,
    submenu: [
      { icon: Users, label: "Lista de Clientes", href: "/clientes/lista", roles: ["comercio", "administrador"] },
      { icon: UserCheck, label: "Clientes VIP", href: "/clientes/vip", roles: ["comercio", "administrador"] },
      {
        icon: MessageSquare,
        label: "Comunicación",
        href: "/clientes/comunicacion",
        roles: ["comercio", "administrador"],
      },
    ],
    roles: ["comercio", "administrador"],
  },

  // ASISTENTE - Tareas de apoyo y comunicación
  {
    icon: Calendar,
    label: "Agenda",
    href: "/agenda",
    hasSubmenu: true,
    submenu: [
      { icon: Calendar, label: "Mi Calendario", href: "/agenda/calendario", roles: ["asistente", "administrador"] },
      { icon: Bell, label: "Recordatorios", href: "/agenda/recordatorios", roles: ["asistente", "administrador"] },
      { icon: FileText, label: "Tareas Pendientes", href: "/agenda/tareas", roles: ["asistente", "administrador"] },
    ],
    roles: ["asistente", "administrador"],
  },
  {
    icon: MessageSquare,
    label: "Comunicación",
    href: "/comunicacion",
    hasSubmenu: true,
    submenu: [
      { icon: Mail, label: "Mensajes", href: "/comunicacion/mensajes", roles: ["asistente", "administrador"] },
      {
        icon: Bell,
        label: "Notificaciones",
        href: "/comunicacion/notificaciones",
        roles: ["asistente", "administrador"],
      },
      { icon: MessageSquare, label: "Chat Interno", href: "/comunicacion/chat", roles: ["asistente", "administrador"] },
    ],
    roles: ["asistente", "administrador"],
  },
  {
    icon: FileText,
    label: "Documentos",
    href: "/documentos",
    hasSubmenu: true,
    submenu: [
      {
        icon: FileText,
        label: "Mis Documentos",
        href: "/documentos/mis-documentos",
        roles: ["asistente", "administrador"],
      },
      { icon: Circle, label: "Plantillas", href: "/documentos/plantillas", roles: ["asistente", "administrador"] },
      { icon: FileText, label: "Archivo", href: "/documentos/archivo", roles: ["asistente", "administrador"] },
    ],
    roles: ["asistente", "administrador"],
  },

  // COMÚN - Acceso para múltiples roles
  {
    icon: BarChart3,
    label: "Reportes Básicos",
    href: "/reportes-basicos",
    hasSubmenu: true,
    submenu: [
      {
        icon: BarChart3,
        label: "Mis Reportes",
        href: "/reportes-basicos/mis-reportes",
        roles: ["comercio", "asistente", "administrador"],
      },
      {
        icon: TrendingUp,
        label: "Estadísticas Básicas",
        href: "/reportes-basicos/estadisticas",
        roles: ["comercio", "asistente", "administrador"],
      },
    ],
    roles: ["comercio", "asistente", "administrador"],
  },
  {
    icon: Settings,
    label: "Mi Perfil",
    href: "/perfil",
    hasSubmenu: true,
    submenu: [
      {
        icon: UserCheck,
        label: "Información Personal",
        href: "/perfil/info",
        roles: ["comercio", "asistente", "administrador"],
      },
      {
        icon: Settings,
        label: "Configuración",
        href: "/perfil/configuracion",
        roles: ["comercio", "asistente", "administrador"],
      },
      {
        icon: Shield,
        label: "Seguridad",
        href: "/perfil/seguridad",
        roles: ["comercio", "asistente", "administrador"],
      },
    ],
    roles: ["comercio", "asistente", "administrador"],
  },
]

// Función para filtrar menú por rol
export function getMenuByRole(userRole: string, pathname: string): MenuItem[] {
  return menuConfig
    .filter((item) => item.roles.includes(userRole))
    .map((item) => ({
      ...item,
      active: pathname === item.href,
      submenu: item.submenu?.filter((subItem) => subItem.roles.includes(userRole)),
    }))
}

// Función para obtener el nombre del rol en español
export function getRoleName(role: string): string {
  const roleNames: Record<string, string> = {
    administrador: "Administrador",
    comercio: "Comercio",
    asistente: "Asistente",
  }
  return roleNames[role] || role
}

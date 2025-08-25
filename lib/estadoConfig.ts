import { Clock, CheckCircle2, XCircle, Truck, Store, Box } from "lucide-react"

type EstadoConfigItem = {
  label: string;
  color: string;
  icon: any;
};

export const estadoConfig: Record<string, EstadoConfigItem> = {
  pendiente: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  asignado: {
    label: "Asignado",
    color: "bg-blue-100 text-blue-800",
    icon: Truck,
  },
  llegada_comercio: {
    label: "Llegada a comercio",
    color: "bg-purple-100 text-purple-800",
    icon: Store,
  },
  recibi_paquete: {
    label: "Recibí paquete",
    color: "bg-indigo-100 text-indigo-800",
    icon: Box,
  },
  entregado: {
    label: "Entregado",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  eliminado: {
    label: "Eliminado",
    color: "bg-gray-200 text-gray-600",
    icon: XCircle,
  },
}

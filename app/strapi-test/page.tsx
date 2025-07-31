import { AdminLayout } from "@/components/dashboard-layout"
import { StrapiTest } from "@/components/strapi-test"

export default function StrapiTestPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Pruebas de Strapi</h1>
          <p className="text-gray-600">Prueba la conexión y funcionalidades con Strapi</p>
        </div>

        <StrapiTest />
      </div>
    </AdminLayout>
  )
}

import { AdminLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { StrapiTest } from "@/components/strapi-test"

export default function StrapiTestPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <div className="p-3 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Pruebas de Strapi</h1>
            <p className="text-xs sm:text-base text-gray-600">Prueba la conexión y funcionalidades con Strapi</p>
          </div>

          <StrapiTest />
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}

import { StrapiLoginForm } from "@/components/strapi-login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <StrapiLoginForm />
      </div>
    </div>
  )
}

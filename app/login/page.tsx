import { StrapiLoginForm } from "@/components/strapi-login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <StrapiLoginForm />
      </div>
    </div>
  )
}

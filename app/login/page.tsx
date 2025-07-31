"use client"

import { StrapiLoginForm } from "@/components/strapi-login-form"
import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (isAuthenticated && window.location.pathname !== "/login") {
      router.push("/")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <StrapiLoginForm />
      </div>
    </div>
  )
}

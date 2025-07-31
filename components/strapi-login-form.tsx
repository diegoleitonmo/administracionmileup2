"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useStrapiAuth } from "@/hooks/use-strapi-auth"

interface LoginCredentials {
  identifier: string
  password: string
}

export function StrapiLoginForm() {
  const router = useRouter()
  const { login, isLoading, error } = useStrapiAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState<LoginCredentials>({
    identifier: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login(credentials)
      // Redireccionar al dashboard después del login exitoso
      router.push("/")
    } catch (error) {
      // El error ya se maneja en el hook
      console.error("Login failed:", error)
    }
  }

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h18v4H3V3zm0 6h18v4H3V9zm0 6h18v4H3v-4z" />
            </svg>
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Purple
          </span>
        </div>

        <div className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Bienvenido de vuelta</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
              Correo Electrónico
            </Label>
            <Input
              id="identifier"
              type="email"
              placeholder="tu@email.com"
              value={credentials.identifier}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  identifier: e.target.value,
                }))
              }
              className="h-11 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="h-11 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="pt-4 border-t border-gray-100">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Credenciales de prueba:</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>
                <strong>Email:</strong> diley963@gmail.com
              </p>
              <p>
                <strong>Contraseña:</strong> Seguridad2025*.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 text-blue-600 border-blue-200 hover:bg-blue-100 bg-transparent"
              onClick={() =>
                setCredentials({
                  identifier: "diley963@gmail.com",
                  password: "Seguridad2025*.",
                })
              }
            >
              Usar credenciales de prueba
            </Button>
          </div>
        </div>

        {/* Additional Options */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button variant="link" className="text-sm text-purple-600 hover:text-purple-700 p-0">
            ¿Olvidaste tu contraseña?
          </Button>
          <Button variant="link" className="text-sm text-gray-600 hover:text-gray-700 p-0">
            ¿Necesitas ayuda?
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle, RefreshCw, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { strapiAuth } from "@/lib/strapi-auth"

interface LoginCredentials {
  identifier: string
  password: string
}

export function StrapiLoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [credentials, setCredentials] = useState<LoginCredentials>({
    identifier: "",
    password: "",
  })

  // Verificar conexión con Strapi al cargar el componente
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setConnectionStatus("checking")
    try {
      console.log("🔍 Iniciando verificación de conexión completa...")

      const diagnostics = await strapiAuth.getDiagnosticInfo()
      setDiagnosticInfo(diagnostics)

      const isConnected = diagnostics.connectionTest.success
      setConnectionStatus(isConnected ? "connected" : "disconnected")

      console.log("📊 Diagnóstico completo:", diagnostics)
    } catch (error) {
      console.error("❌ Error en diagnóstico:", error)
      setConnectionStatus("disconnected")
      setDiagnosticInfo({
        error: error.message,
        config: strapiAuth.getConfig(),
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validaciones básicas
    if (!credentials.identifier.trim()) {
      setError("Por favor ingresa tu email")
      setIsLoading(false)
      return
    }

    if (!credentials.password.trim()) {
      setError("Por favor ingresa tu contraseña")
      setIsLoading(false)
      return
    }

    try {
      console.log("🚀 Iniciando proceso de login...")

      const authData = await strapiAuth.login(credentials)
      strapiAuth.saveAuthData(authData)

      // Mapear el rol de Strapi a los valores esperados
      let mappedRole: "administrador" | "comercio" | "asistente" = "asistente"
      const strapiRole = authData.user.role?.name?.toLowerCase()

      if (strapiRole === "administrador") mappedRole = "administrador"
      else if (strapiRole === "comercio") mappedRole = "comercio"

      const user = {
        id: String(authData.user.id),
        name: authData.user.username || authData.user.email,
        email: authData.user.email,
        role: mappedRole,
        avatar: `/placeholder.svg?height=40&width=40`,
        department: "",
      }

      console.log("✅ Login exitoso, datos mapeados:", {
        strapiRole: authData.user.role?.name,
        mappedRole,
        userId: user.id,
        email: user.email,
      })

      login(user, authData.jwt)
      router.push("/")
    } catch (err: any) {
      console.error("❌ Error en login:", err)
      setError(err.message || "Error al iniciar sesión. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseTestCredentials = () => {
    console.log("🧪 Usando credenciales de prueba...")
    setCredentials({
      identifier: "diley963@gmail.com",
      password: "Seguridad2025*.",
    })
    setError("")
  }

  const config = strapiAuth.getConfig()

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

        {/* Estado de conexión */}
        <div className="flex items-center justify-center gap-2 text-sm">
          {connectionStatus === "checking" && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-gray-500">Verificando conexión...</span>
            </>
          )}
          {connectionStatus === "connected" && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Conectado a Strapi</span>
            </>
          )}
          {connectionStatus === "disconnected" && (
            <>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600">Sin conexión a Strapi</span>
              <Button variant="ghost" size="sm" onClick={checkConnection} className="ml-2 h-6 px-2">
                <RefreshCw className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Información de configuración */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-800">Configuración:</div>
            <Button variant="ghost" size="sm" onClick={() => setShowDiagnostics(!showDiagnostics)} className="h-6 px-2">
              <Settings className="w-3 h-3" />
            </Button>
          </div>
          <div>
            <strong>URL:</strong> {config.baseURL}
          </div>
          <div>
            <strong>API Token:</strong> {config.apiToken}
          </div>
          <div>
            <strong>Estado:</strong> {connectionStatus}
          </div>

          {showDiagnostics && diagnosticInfo && (
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Ver diagnóstico completo</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(diagnosticInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>

        {/* Alerta de conexión */}
        {connectionStatus === "disconnected" && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700 text-sm">
              <div className="space-y-2">
                <div>No se puede conectar con Strapi en {config.baseURL}</div>
                <div className="text-xs">
                  <strong>Posibles causas:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>El servidor Strapi no está ejecutándose</li>
                    <li>URL incorrecta en NEXT_PUBLIC_STRAPI_URL</li>
                    <li>El servidor devuelve HTML en lugar de JSON</li>
                    <li>Problemas de CORS en Strapi</li>
                    <li>API Token no configurado o inválido</li>
                    <li>Firewall o proxy bloqueando las peticiones</li>
                  </ul>
                </div>
                {diagnosticInfo?.connectionTest?.error && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                    <strong>Error específico:</strong> {diagnosticInfo.connectionTest.error}
                  </div>
                )}
                {diagnosticInfo?.connectionTest?.responsePreview && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                    <strong>Respuesta del servidor:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{diagnosticInfo.connectionTest.responsePreview}</pre>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

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
              onChange={(e) => {
                setCredentials((prev) => ({
                  ...prev,
                  identifier: e.target.value,
                }))
                if (error) setError("")
              }}
              className="h-11 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              required
              disabled={isLoading}
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
                onChange={(e) => {
                  setCredentials((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                  if (error) setError("")
                }}
                className="h-11 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-10"
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
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
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700 text-sm">
                <div className="space-y-2">
                  <div>{error}</div>
                  {error.includes("HTML en lugar de JSON") && (
                    <div className="text-xs">
                      <strong>Soluciones sugeridas:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Verifica que Strapi esté ejecutándose en {config.baseURL}</li>
                        <li>Confirma que el endpoint /api/auth/local esté disponible</li>
                        <li>Revisa la configuración de CORS en Strapi</li>
                        <li>Verifica que no haya un proxy o servidor web interceptando las peticiones</li>
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium shadow-lg"
            disabled={isLoading || connectionStatus === "disconnected"}
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
              onClick={handleUseTestCredentials}
              disabled={isLoading || connectionStatus === "disconnected"}
            >
              Usar credenciales de prueba
            </Button>

            {/* Confirmación de credenciales aplicadas */}
            {credentials.identifier === "diley963@gmail.com" && credentials.password === "Seguridad2025*." && (
              <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                ✅ Credenciales de prueba aplicadas
              </div>
            )}
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

        {/* Debug Info en desarrollo */}
        {process.env.NODE_ENV === "development" && (
          <div className="pt-4 border-t border-gray-100">
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer">Debug Info</summary>
              <div className="mt-2 space-y-1">
                <div>Estado: {isLoading ? "Cargando" : "Listo"}</div>
                <div>Conexión: {connectionStatus}</div>
                <div>Error: {error || "Ninguno"}</div>
                <div>API Token: {config.hasApiToken ? "Configurado" : "No configurado"}</div>
                <div>Diagnósticos: {showDiagnostics ? "Visibles" : "Ocultos"}</div>
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, AlertCircle, RefreshCw, Settings, Wifi, WifiOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { strapiAuth } from "@/lib/strapi-auth"

interface LoginCredentials {
  identifier: string
  password: string
}

export function StrapiLoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    identifier: "",
    password: "",
  });

  useEffect(() => {
    checkConnection();
    // eslint-disable-next-line
  }, []);

  const checkConnection = async () => {
    setConnectionStatus("checking");
    try {
      const diagnostics = await strapiAuth.getDiagnosticInfo();
      setDiagnosticInfo(diagnostics);
      const isConnected = diagnostics.connectionTest.success;
      setConnectionStatus(isConnected ? "connected" : "disconnected");
    } catch (error) {
      let errorMsg = "Error desconocido";
      if (typeof error === "string") errorMsg = error;
      else if (error instanceof Error) errorMsg = error.message;
      setConnectionStatus("disconnected");
      setDiagnosticInfo({
        error: errorMsg,
        config: strapiAuth.getConfig(),
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (!credentials.identifier.trim()) {
      setError("Por favor ingresa tu email");
      setIsLoading(false);
      return;
    }
    if (!credentials.password.trim()) {
      setError("Por favor ingresa tu contraseña");
      setIsLoading(false);
      return;
    }
    try {
      const authData = await strapiAuth.login(credentials);
      strapiAuth.saveAuthData(authData);
      let mappedRole: "administrador" | "comercio" | "asistente" = "asistente";
      const strapiRole = authData.user.role?.name?.toLowerCase();
      if (strapiRole && ["administrador", "admin", "authenticated"].includes(strapiRole)) mappedRole = "administrador";
      else if (strapiRole === "comercio") mappedRole = "comercio";
      const user = {
        id: String(authData.user.id),
        name: authData.user.username || authData.user.email,
        email: authData.user.email,
        role: mappedRole,
        avatar: `/placeholder.svg?height=40&width=40`,
        department: "",
      };
      login(user, authData.jwt);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const config = strapiAuth.getConfig();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-purple-300 py-8 px-2">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center">
        {/* Logo */}
        <img src="/mileupLogo.png" alt="Mileup Logo" className="h-14 w-auto mb-4 drop-shadow-lg" />

        {/* Estado de conexión */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {connectionStatus === "checking" && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-gray-500">Verificando conexión...</span>
            </>
          )}
          {connectionStatus === "connected" && (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Conectado</span>
            </>
          )}
          {connectionStatus === "disconnected" && (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-red-600">Sin conexión a Strapi</span>
              <Button variant="ghost" size="sm" onClick={checkConnection} className="ml-2 h-6 px-2">
                <RefreshCw className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Email */}
          <div>
            <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
              Correo electrónico
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4" /></svg>
              </span>
              <Input
                id="identifier"
                type="email"
                placeholder="tu@email.com"
                value={credentials.identifier}
                onChange={(e) => {
                  setCredentials((prev) => ({ ...prev, identifier: e.target.value }))
                  if (error) setError("")
                }}
                className="h-12 pl-11 pr-3 bg-white border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-gray-800 placeholder-gray-400 text-base transition"
                required
                disabled={isLoading}
                autoComplete="username"
                aria-label="Correo electrónico"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Contraseña
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 0v2m0 4h.01" /></svg>
              </span>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => {
                  setCredentials((prev) => ({ ...prev, password: e.target.value }))
                  if (error) setError("")
                }}
                className="h-12 pl-11 pr-10 bg-white border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-gray-800 placeholder-gray-400 text-base transition"
                required
                disabled={isLoading}
                autoComplete="current-password"
                aria-label="Contraseña"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
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
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-base shadow-lg transition-all duration-200 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            disabled={isLoading || connectionStatus === "disconnected"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        {/* Enlaces de ayuda */}
        <div className="flex flex-col items-center gap-2 mt-6 w-full">
          <Button variant="link" className="text-sm text-purple-600 hover:text-purple-700 p-0" tabIndex={0}>
            ¿Olvidaste tu contraseña?
          </Button>
          <Button variant="link" className="text-sm text-purple-600 hover:text-purple-700 p-0" tabIndex={0}>
            ¿Necesitas ayuda?
          </Button>
        </div>

        {/* Instrucciones para configurar Strapi (opcional, solo si está desconectado) */}
        {connectionStatus === "disconnected" && (
          <div className="pt-4 border-t border-gray-100 w-full">
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">¿Primera vez usando el sistema?</h4>
              <div className="text-xs text-yellow-700 space-y-2">
                <p>Si no tienes Strapi configurado, sigue estos pasos:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Instala Strapi: <code className="bg-yellow-100 px-1 rounded">npx create-strapi-app@latest my-strapi</code>
                  </li>
                  <li>
                    Navega al directorio: <code className="bg-yellow-100 px-1 rounded">cd my-strapi</code>
                  </li>
                  <li>
                    Inicia Strapi: <code className="bg-yellow-100 px-1 rounded">npm run develop</code>
                  </li>
                  <li>
                    Crea un usuario administrador en <code className="bg-yellow-100 px-1 rounded">http://localhost:1337/admin</code>
                  </li>
                  <li>Configura el API Token en Settings → API Tokens</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

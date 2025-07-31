"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { domiciliariosService } from "@/services/domiciliarios.service"
import { serviciosService } from "@/services/servicios.service"
import { Loader2, Key, Database, Users, Truck } from "lucide-react"

export function StrapiTest() {
  const [testResult, setTestResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // Test de conexión básica
  const testConnection = async () => {
    setLoading(true)
    setTestResult("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api`)
      if (response.ok) {
        setTestResult("✅ Conexión exitosa con Strapi")
      } else {
        setTestResult("❌ Error de conexión con Strapi")
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  // Test API Token
  const testApiToken = async () => {
    setLoading(true)
    setTestResult("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/users`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTestResult(`✅ API Token válido - ${data.length} usuarios encontrados`)
      } else {
        setTestResult("❌ API Token inválido o sin permisos")
      }
    } catch (error) {
      setTestResult(`❌ Error con API Token: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  // Test GET Domiciliarios
  const testGetDomiciliarios = async () => {
    setLoading(true)
    setTestResult("")

    try {
      const result = await domiciliariosService.getAll({
        pagination: { pageSize: 3 },
      })
      setTestResult(`✅ GET Domiciliarios exitoso: ${result.data.length} registros obtenidos`)
    } catch (error) {
      setTestResult(`❌ Error GET Domiciliarios: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  // Test GET Servicios
  const testGetServicios = async () => {
    setLoading(true)
    setTestResult("")

    try {
      const result = await serviciosService.getAll({
        pagination: { pageSize: 3 },
      })
      setTestResult(`✅ GET Servicios exitoso: ${result.data.length} registros obtenidos`)
    } catch (error) {
      setTestResult(`❌ Error GET Servicios: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  // Test POST Domiciliario
  const testPostDomiciliario = async () => {
    setLoading(true)
    setTestResult("")

    try {
      const newDomiciliario = {
        nombre: "Test Domiciliario API",
        telefono: "+57 300 000 0001",
        ciudad: "Bogotá",
        transporte: "moto" as const,
        identificacion: "1000000001",
        correo: "test.api@example.com",
        estado: "activo" as const,
        disponible: "disponible" as const,
        fechaRegistro: new Date().toISOString(),
        serviciosCompletados: 0,
        calificacion: 5.0,
      }

      const result = await domiciliariosService.create(newDomiciliario)
      setTestResult(`✅ POST Domiciliario exitoso: ID ${result.data.id} creado`)
    } catch (error) {
      setTestResult(`❌ Error POST Domiciliario: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Pruebas de Conexión Strapi con API Token
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={testConnection} disabled={loading} variant="outline">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              <Database className="w-4 h-4 mr-2" />
              Conexión
            </Button>

            <Button onClick={testApiToken} disabled={loading} variant="outline">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              <Key className="w-4 h-4 mr-2" />
              API Token
            </Button>

            <Button onClick={testGetDomiciliarios} disabled={loading} variant="outline">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              <Users className="w-4 h-4 mr-2" />
              Domiciliarios
            </Button>

            <Button onClick={testGetServicios} disabled={loading} variant="outline">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              <Truck className="w-4 h-4 mr-2" />
              Servicios
            </Button>
          </div>

          <Button onClick={testPostDomiciliario} disabled={loading} className="w-full" variant="secondary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Test POST - Crear Domiciliario
          </Button>

          {testResult && (
            <Alert className={testResult.includes("✅") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertDescription className={testResult.includes("✅") ? "text-green-700" : "text-red-700"}>
                {testResult}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Variables de Entorno</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>NEXT_PUBLIC_STRAPI_URL</Label>
            <Input value={process.env.NEXT_PUBLIC_STRAPI_URL || "No configurada"} readOnly className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label>NEXT_PUBLIC_STRAPI_API_TOKEN</Label>
            <Input
              value={process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ? "***configurado***" : "No configurada"}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> El STRAPI_API_TOKEN es necesario para acceder a las APIs de contenido de
              Strapi. Asegúrate de configurarlo en tu archivo <code>.env.local</code>:
              <br />
              <br />
              <code>NEXT_PUBLIC_STRAPI_URL=http://localhost:1337</code>
              <br />
              <code>NEXT_PUBLIC_STRAPI_API_TOKEN=tu_api_token_aqui</code>
              <br />
              <br />
              El API Token se obtiene desde el panel de administración de Strapi en: Settings → API Tokens
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diferencias entre JWT y API Token</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">🔑 JWT (User Token)</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Para autenticación de usuarios</li>
                <li>• Se obtiene al hacer login</li>
                <li>• Expira automáticamente</li>
                <li>• Usado en: /api/auth/local, /api/users/me</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-blue-700 mb-2">🔐 API Token</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Para acceso a APIs de contenido</li>
                <li>• Se configura en Strapi Admin</li>
                <li>• No expira (hasta que se revoque)</li>
                <li>• Usado en: /api/domiciliarios, /api/servicios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { StrapiAuthGuard } from "@/components/strapi-auth-guard"
import "./globals.css"
import { useState } from "react"
import { User, Wifi } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })



export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <html lang="es">
      <body >
        <div className="relative min-h-screen w-full">
          {/* Sidebar y overlay mobile (Sidebar eliminado, importar como componente aparte si se requiere) */}
          {/* Overlay para mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        
          {/* Contenido principal */}
          <main
            className="transition-all duration-100 min-h-screen flex flex-col md:pl-[250px]"
            style={{ paddingLeft: sidebarOpen ? 0 : undefined }}
          >
            <div >
              <StrapiAuthGuard>{children}</StrapiAuthGuard>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}

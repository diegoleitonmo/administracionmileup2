import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { StrapiAuthGuard } from "@/components/strapi-auth-guard"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Purple Dashboard",
  description: "A modern dashboard layout with Strapi authentication",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className + " bg-gray-50 min-h-screen antialiased scroll-smooth text-gray-900"}>
        <div className="w-full min-h-screen flex flex-col">
          <StrapiAuthGuard>{children}</StrapiAuthGuard>
        </div>
      </body>
    </html>
  )
}

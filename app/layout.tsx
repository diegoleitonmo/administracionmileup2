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
      <body className={inter.className}>
        <StrapiAuthGuard>{children}</StrapiAuthGuard>
      </body>
    </html>
  )
}

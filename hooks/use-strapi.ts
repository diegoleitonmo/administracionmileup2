"use client"

import { useState, useEffect } from "react"
import { strapi, type StrapiResponse } from "@/lib/strapi"

interface UseStrapiOptions {
  populate?: string | string[]
  filters?: Record<string, any>
  sort?: string | string[]
  pagination?: {
    page?: number
    pageSize?: number
    start?: number
    limit?: number
  }
  fields?: string[]
  locale?: string
  enabled?: boolean // Para controlar si la consulta se ejecuta automáticamente
  useUserJWT?: boolean // Para usar JWT del usuario en lugar del API Token
}

interface UseStrapiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  meta?: StrapiResponse<T>["meta"]
}

// Hook para GET automático
export function useStrapi<T>(endpoint: string, options: UseStrapiOptions = {}) {
  const [state, setState] = useState<UseStrapiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const { enabled = true, useUserJWT = false, ...strapiOptions } = options

  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, loading: false }))
      return
    }

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        const response = await strapi.get<T>(endpoint, strapiOptions, useUserJWT)

        setState({
          data: response.data,
          loading: false,
          error: null,
          meta: response.meta,
        })
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        })
      }
    }

    fetchData()
  }, [endpoint, enabled, useUserJWT, JSON.stringify(strapiOptions)])

  const refetch = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const response = await strapi.get<T>(endpoint, strapiOptions, useUserJWT)

      setState({
        data: response.data,
        loading: false,
        error: null,
        meta: response.meta,
      })
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  return {
    ...state,
    refetch,
  }
}

// Hook para mutaciones (POST, PUT, DELETE)
export function useStrapiMutation<T>(useUserJWT = false) {
  const [state, setState] = useState<{
    loading: boolean
    error: string | null
  }>({
    loading: false,
    error: null,
  })

  const create = async (endpoint: string, data: any, options?: { populate?: string | string[] }) => {
    try {
      setState({ loading: true, error: null })
      const response = await strapi.post<T>(endpoint, data, options, useUserJWT)
      setState({ loading: false, error: null })
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setState({ loading: false, error: errorMessage })
      throw error
    }
  }

  const update = async (
    endpoint: string,
    id: string | number,
    data: any,
    options?: { populate?: string | string[] },
  ) => {
    try {
      setState({ loading: true, error: null })
      const response = await strapi.put<T>(endpoint, id, data, options, useUserJWT)
      setState({ loading: false, error: null })
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setState({ loading: false, error: errorMessage })
      throw error
    }
  }

  const remove = async (endpoint: string, id: string | number) => {
    try {
      setState({ loading: true, error: null })
      const response = await strapi.delete<T>(endpoint, id, useUserJWT)
      setState({ loading: false, error: null })
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setState({ loading: false, error: errorMessage })
      throw error
    }
  }

  const upload = async (
    files: File | File[],
    options?: {
      ref?: string
      refId?: string | number
      field?: string
    },
  ) => {
    try {
      setState({ loading: true, error: null })
      const response = await strapi.upload(files, options, useUserJWT)
      setState({ loading: false, error: null })
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setState({ loading: false, error: errorMessage })
      throw error
    }
  }

  return {
    ...state,
    create,
    update,
    remove,
    upload,
  }
}

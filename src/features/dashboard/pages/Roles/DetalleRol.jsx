"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FaUserShield,
  FaIdCard,
  FaArrowLeft,
  FaExclamationTriangle,
  FaToggleOn,
  FaToggleOff,
  FaUsers,
  FaLock,
  FaEdit,
} from "react-icons/fa"
import "../../../../shared/styles/Roles/DetalleRoles.css"

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Función para obtener token
const getValidToken = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  if (!token) {
    console.error("No hay token disponible")
    return null
  }
  return token
}

// Hook personalizado para manejo de API
const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const makeRequest = useCallback(async (url, options = {}) => {
    setLoading(true)
    setError(null)

    const token = getValidToken()
    if (!token) {
      setError("Error de autenticación")
      setLoading(false)
      return null
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesión expirada. Por favor inicie sesión nuevamente.")
        }
        if (response.status === 404) {
          throw new Error("Rol no encontrado.")
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { makeRequest, loading, error }
}

const DetalleRol = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { makeRequest } = useApi()

  const [rol, setRol] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarRol = async () => {
      try {
        setCargando(true)
        setError(null)

        const data = await makeRequest(`/roles/${id}`)
        if (data) {
          setRol(data)
        }
      } catch (error) {
        console.error("Error al cargar rol:", error)
        setError(error.message)
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      cargarRol()
    }
  }, [id, makeRequest])

  const getEstadoClass = (estado) => {
    return estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
  }

  if (cargando) {
    return (
      <div className="detalleRol-container">
        <div className="detalleRol-loading">
          <div className="detalleRol-spinner"></div>
          <p>Cargando detalles del rol...</p>
        </div>
      </div>
    )
  }

  if (error || !rol) {
    return (
      <div className="detalleRol-container">
        <div className="detalleRol-error">
          <div className="detalleRol-error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Error</h2>
          <p>{error || "No se encontró el rol"}</p>
          <button className="detalleRol-btn-back" onClick={() => navigate("/ListarRoles")}>
            <FaArrowLeft />
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleRol-container">
      {/* Header */}
      <div className="detalleRol-header">
        <div className="detalleRol-header-left">
          <button className="detalleRol-btn-back" onClick={() => navigate("/ListarRoles")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="detalleRol-title-section">
            <h1 className="detalleRol-page-title">
              <FaUserShield className="detalleRol-title-icon" />
              Detalle del Rol
            </h1>
            <p className="detalleRol-subtitle">Información completa del rol {rol.nombre}</p>
          </div>
        </div>
        <div className="detalleRol-header-actions">
          <button className="detalleRol-btn-edit" onClick={() => navigate(`/EditarRol/${rol.id}`)}>
            <FaEdit />
            Editar Rol
          </button>
        </div>
      </div>

      {/* Información Básica y Estado */}
      <div className="detalleRol-section">
        <div className="detalleRol-section-header">
          <h2 className="detalleRol-section-title">
            <FaIdCard className="detalleRol-section-icon" />
            Información Básica
          </h2>
        </div>
        <div className="detalleRol-info-grid">
          {/* Nombre del Rol */}
          <div className="detalleRol-info-card">
            <div className="detalleRol-info-icon">
              <FaUserShield />
            </div>
            <div className="detalleRol-info-content">
              <span className="detalleRol-info-label">Nombre del Rol</span>
              <span className="detalleRol-info-value">{rol.nombre}</span>
            </div>
          </div>
          {/* Descripción */}
          <div className="detalleRol-info-card">
            <div className="detalleRol-info-icon">
              <FaLock />
            </div>
            <div className="detalleRol-info-content">
              <span className="detalleRol-info-label">Descripción</span>
              <span className="detalleRol-info-value">{rol.descripcion || "No especificada"}</span>
            </div>
          </div>
          {/* Estado */}
          <div className="detalleRol-info-card">
            <div className="detalleRol-info-icon">
              {rol.estado?.toLowerCase() === "activo" ? <FaToggleOn /> : <FaToggleOff />}
            </div>
            <div className="detalleRol-info-content">
              <span className="detalleRol-info-label">Estado</span>
              <span className={`detalleRol-estado ${getEstadoClass(rol.estado)}`}>
                {rol.estado || "No especificado"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleRol

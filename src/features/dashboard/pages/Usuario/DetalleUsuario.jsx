"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserTag,
  FaEdit,
  FaArrowLeft,
  FaExclamationTriangle,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa"
import "../../../../shared/styles/Usuarios/DetalleUsuario.css"

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
          throw new Error("Usuario no encontrado.")
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

const DetalleUsuario = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { makeRequest } = useApi()

  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setCargando(true)
        setError(null)

        const data = await makeRequest("/usuarios")
        if (data) {
          const usuarioEncontrado = data.find((u) => u.id === Number.parseInt(id))
          if (usuarioEncontrado) {
            setUsuario(usuarioEncontrado)
          } else {
            throw new Error("Usuario no encontrado")
          }
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      cargarUsuario()
    }
  }, [id, makeRequest])

  const getEstadoClass = (estado) => {
    return estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return "No disponible"
    try {
      return new Date(fecha).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "Fecha inválida"
    }
  }

  if (cargando) {
    return (
      <div className="detalleUsuario-container">
        <div className="detalleUsuario-loading">
          <div className="detalleUsuario-spinner"></div>
          <p>Cargando detalles del usuario...</p>
        </div>
      </div>
    )
  }

  if (error || !usuario) {
    return (
      <div className="detalleUsuario-container">
        <div className="detalleUsuario-error">
          <div className="detalleUsuario-error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Error</h2>
          <p>{error || "No se encontró el usuario"}</p>
          <button className="detalleUsuario-btn-back" onClick={() => navigate("/listarUsuarios")}>
            <FaArrowLeft />
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleUsuario-container">
      {/* Header */}
      <div className="detalleUsuario-header">
        <div className="detalleUsuario-header-left">
          <button className="detalleUsuario-btn-back" onClick={() => navigate("/listarUsuarios")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="detalleUsuario-title-section">
            <h1 className="detalleUsuario-page-title">
              <FaUser className="detalleUsuario-title-icon" />
              Detalle del Usuario
            </h1>
            <p className="detalleUsuario-subtitle">
              Información completa de {usuario.nombre} {usuario.apellido}
            </p>
          </div>
        </div>
        <div className="detalleUsuario-header-actions">
          <button className="detalleUsuario-btn-edit" onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}>
            <FaEdit />
            Editar Usuario
          </button>
        </div>
      </div>

      {/* Información Personal */}
      <div className="detalleUsuario-section">
        <div className="detalleUsuario-section-header">
          <h2 className="detalleUsuario-section-title">
            <FaUser className="detalleUsuario-section-icon" />
            Información Personal
          </h2>
        </div>
        <div className="detalleUsuario-info-grid">
          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaUser />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Nombre Completo</span>
              <span className="detalleUsuario-info-value">
                {usuario.nombre} {usuario.apellido}
              </span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaIdCard />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Tipo de Documento</span>
              <span className="detalleUsuario-info-value">{usuario.tipo_documento || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaIdCard />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Número de Documento</span>
              <span className="detalleUsuario-info-value">{usuario.documento || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaEnvelope />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Correo Electrónico</span>
              <span className="detalleUsuario-info-value">{usuario.correo || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaPhone />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Teléfono</span>
              <span className="detalleUsuario-info-value">{usuario.telefono || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Dirección</span>
              <span className="detalleUsuario-info-value">{usuario.direccion || "No especificada"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="detalleUsuario-section">
        <div className="detalleUsuario-section-header">
          <h2 className="detalleUsuario-section-title">
            <FaUserTag className="detalleUsuario-section-icon" />
            Información del Sistema
          </h2>
        </div>
        <div className="detalleUsuario-info-grid">
          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaUserTag />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Rol</span>
              <span className="detalleUsuario-rol-badge">{usuario.rol_nombre || "Sin rol"}</span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              {usuario.estado?.toLowerCase() === "activo" ? <FaToggleOn /> : <FaToggleOff />}
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Estado</span>
              <span className={`detalleUsuario-estado ${getEstadoClass(usuario.estado)}`}>
                {usuario.estado || "No especificado"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleUsuario

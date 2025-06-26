"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTools,
  FaClock,
  FaArrowLeft,
  FaEdit,
  FaExclamationTriangle,
  FaToggleOn,
  FaToggleOff,
  FaCalendarAlt,
  FaChartBar,
  FaCalendarCheck,
  FaWrench,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa"
import Swal from "sweetalert2"
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
          throw new Error("Mecánico no encontrado")
        }
        if (response.status === 502) {
          throw new Error("El servidor no está disponible en este momento. Intente más tarde.")
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      let errorMessage = "Error desconocido"

      if (err instanceof TypeError && err.message === "Failed to fetch") {
        errorMessage = "No se puede conectar al servidor. Verifique su conexión a internet."
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return { makeRequest, loading, error }
}
const VerDetalleMecanico = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { makeRequest } = useApi()

  const [mecanico, setMecanico] = useState(null)
  const [estadisticas, setEstadisticas] = useState(null)
  const [citas, setCitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false)
  const [cargandoCitas, setCargandoCitas] = useState(false)
  const [errorDetalle, setErrorDetalle] = useState(null)
  const [activeTab, setActiveTab] = useState("info") // 'info', 'estadisticas', 'citas'

  // Cargar datos del mecánico
  useEffect(() => {
    const cargarMecanico = async () => {
      if (!id) {
        navigate("/ListarMecanicos")
        return
      }

      try {
        setCargando(true)
        setErrorDetalle(null)

        const data = await makeRequest(`/mecanicos/${id}`)

        if (data) {
          setMecanico(data)
        }
      } catch (error) {
        setErrorDetalle(error.message)

        const errorTitle = error.message.includes("servidor") ? "Servidor no disponible" : "Error de conexión"
        const errorText = error.message.includes("no encontrado")
          ? "El mecánico solicitado no existe o fue eliminado."
          : error.message

        Swal.fire({
          icon: "error",
          title: errorTitle,
          text: errorText,
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setCargando(false)
      }
    }

    cargarMecanico()
  }, [id, makeRequest, navigate])

  // Cargar estadísticas del mecánico
  const cargarEstadisticas = useCallback(async () => {
    if (!id) return

    try {
      setCargandoEstadisticas(true)
      const data = await makeRequest(`/mecanicos/${id}/estadisticas`)
      if (data) {
        setEstadisticas(data)
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
      // No mostrar error si las estadísticas no están disponibles
      setEstadisticas(null)
    } finally {
      setCargandoEstadisticas(false)
    }
  }, [id, makeRequest])

  // Cargar citas del mecánico
  const cargarCitas = useCallback(async () => {
    if (!id) return

    try {
      setCargandoCitas(true)
      const data = await makeRequest(`/mecanicos/${id}/citas`)
      if (data) {
        setCitas(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error al cargar citas:", error)
      setCitas([])
    } finally {
      setCargandoCitas(false)
    }
  }, [id, makeRequest])

  // Cargar datos adicionales cuando se cambia de pestaña
  useEffect(() => {
    if (activeTab === "estadisticas" && !estadisticas && !cargandoEstadisticas) {
      cargarEstadisticas()
    }
    if (activeTab === "citas" && citas.length === 0 && !cargandoCitas) {
      cargarCitas()
    }
  }, [activeTab, estadisticas, citas.length, cargandoEstadisticas, cargandoCitas, cargarEstadisticas, cargarCitas])

  const getEstadoClass = (estado) => {
    return estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return "No especificada"
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Fecha inválida"
    }
  }

  const formatearFechaCorta = (fecha) => {
    if (!fecha) return "No especificada"
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
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
          <p>Cargando información del mecánico...</p>
        </div>
      </div>
    )
  }

  if (errorDetalle || !mecanico) {
    return (
      <div className="detalleUsuario-container">
        <div className="detalleUsuario-error">
          <div className="detalleUsuario-error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Error de Conexión</h2>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <p style={{ marginBottom: "10px" }}>{errorDetalle || "No se encontró el mecánico"}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              className="detalleUsuario-btn-back"
              onClick={() => window.location.reload()}
              style={{ marginRight: "10px" }}
            >
              🔄 Reintentar
            </button>
            <button className="detalleUsuario-btn-back" onClick={() => navigate("/ListarMecanicos")}>
              <FaArrowLeft />
              Volver al listado
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleUsuario-container">
      {/* Header */}
      <div className="detalleUsuario-header">
        <div className="detalleUsuario-header-left">
          <button className="detalleUsuario-btn-back" onClick={() => navigate("/ListarMecanicos")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="detalleUsuario-title-section">
            <h1 className="detalleUsuario-page-title">
              <FaTools className="detalleUsuario-title-icon" />
              Detalle del Mecánico
            </h1>
            <p className="detalleUsuario-subtitle">
              Información completa de {mecanico.nombre} {mecanico.apellido}
            </p>
          </div>
        </div>
        <div className="detalleUsuario-header-actions">
          <button className="detalleUsuario-btn-edit" onClick={() => navigate(`/Mecanicos/editar/${mecanico.id}`)}>
            <FaEdit />
            Editar Mecánico
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
                {mecanico.nombre} {mecanico.apellido}
              </span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaIdCard />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Tipo de Documento</span>
              <span className="detalleUsuario-info-value">{mecanico.tipo_documento || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaIdCard />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Número de Documento</span>
              <span className="detalleUsuario-info-value">{mecanico.documento || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaEnvelope />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Correo Electrónico</span>
              <span className="detalleUsuario-info-value">{mecanico.correo || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaPhone />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Teléfono</span>
              <span className="detalleUsuario-info-value">{mecanico.telefono || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaPhone />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Teléfono de Emergencia</span>
              <span className="detalleUsuario-info-value">{mecanico.telefono_emergencia || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Dirección</span>
              <span className="detalleUsuario-info-value">{mecanico.direccion || "No especificada"}</span>
            </div>
          </div>

          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              {mecanico.estado?.toLowerCase() === "activo" ? <FaToggleOn /> : <FaToggleOff />}
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Estado</span>
              <span className={`detalleUsuario-estado ${getEstadoClass(mecanico.estado)}`}>
                {mecanico.estado || "No especificado"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerDetalleMecanico

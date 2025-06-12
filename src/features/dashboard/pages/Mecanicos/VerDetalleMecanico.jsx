"use client"

import { useState, useEffect } from "react"
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

  const makeRequest = async (url, options = {}) => {
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
  }

  return { makeRequest, loading, error }
}

const VerDetalleMecanico = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { makeRequest, loading } = useApi()

  const [mecanico, setMecanico] = useState(null)
  const [horario, setHorario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarMecanico = async () => {
      try {
        setCargando(true)
        setError(null)
        const data = await makeRequest(`/mecanicos/${id}`)
        if (data) {
          setMecanico(data)
          // Cargar el horario del mecánico, pero maneja errores aparte
          try {
            const horarioData = await makeRequest(`/horarios/${data.horario_id}`)
            if (horarioData) {
              setHorario(horarioData)
            }
          } catch (error) {
            setHorario(null)
            Swal.fire("Advertencia", "No se pudo cargar el horario asignado", "warning")
          }
        }
      } catch (error) {
        console.error("Error al cargar mecánico:", error)
        setError(error.message)
        Swal.fire("Error", "No se pudo cargar la información del mecánico", "error")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      cargarMecanico()
    }
  }, [id, makeRequest])

  const getEstadoClass = (estado) => {
    return estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
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

  if (error || !mecanico) {
    return (
      <div className="detalleUsuario-container">
        <div className="detalleUsuario-error">
          <div className="detalleUsuario-error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Error</h2>
          <p>{error || "No se encontró el mecánico"}</p>
          <button className="detalleUsuario-btn-back" onClick={() => navigate("/ListarMecanicos")}>
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
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="detalleUsuario-section">
        <div className="detalleUsuario-section-header">
          <h2 className="detalleUsuario-section-title">
            <FaTools className="detalleUsuario-section-icon" />
            Información del Sistema
          </h2>
        </div>
        <div className="detalleUsuario-info-grid">
          <div className="detalleUsuario-info-card">
            <div className="detalleUsuario-info-icon">
              <FaClock />
            </div>
            <div className="detalleUsuario-info-content">
              <span className="detalleUsuario-info-label">Horario Asignado</span>
              <span className="detalleUsuario-rol-badge">
                {horario ? `${horario.dia} - ${horario.hora_inicio} a ${horario.hora_fin}` : "Sin horario"}
              </span>
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

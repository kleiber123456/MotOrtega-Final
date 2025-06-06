"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FaCar,
  FaIdCard,
  FaPalette,
  FaUser,
  FaCogs,
  FaEdit,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaToggleOn,
  FaToggleOff,
  FaTag,
} from "react-icons/fa"
import axios from "axios"
import "../../../../shared/styles/detalleVehiculo.css"

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
      const response = await axios({
        url: `${API_BASE_URL}${url}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        ...options,
      })

      return response.data
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

const DetalleVehiculo = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { makeRequest } = useApi()

  const [vehiculo, setVehiculo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarVehiculo = async () => {
      try {
        setCargando(true)
        setError(null)

        const data = await makeRequest(`/vehiculos/${id}`)
        if (data) {
          setVehiculo(data)
        }
      } catch (error) {
        console.error("Error al cargar vehículo:", error)
        setError(error.message)
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      cargarVehiculo()
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
      <div className="detalleVehiculo-container">
        <div className="detalleVehiculo-loading">
          <div className="detalleVehiculo-spinner"></div>
          <p>Cargando detalles del vehículo...</p>
        </div>
      </div>
    )
  }

  if (error || !vehiculo) {
    return (
      <div className="detalleVehiculo-container">
        <div className="detalleVehiculo-error">
          <div className="detalleVehiculo-error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Error</h2>
          <p>{error || "No se encontró el vehículo"}</p>
          <button className="detalleVehiculo-btn-back" onClick={() => navigate("/vehiculos")}>
            <FaArrowLeft />
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleVehiculo-container">
      {/* Header */}
      <div className="detalleVehiculo-header">
        <div className="detalleVehiculo-header-left">
          <button className="detalleVehiculo-btn-back" onClick={() => navigate("/vehiculos")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="detalleVehiculo-title-section">
            <h1 className="detalleVehiculo-page-title">
              <FaCar className="detalleVehiculo-title-icon" />
              Detalle del Vehículo
            </h1>
            <p className="detalleVehiculo-subtitle">Información completa del vehículo {vehiculo.placa}</p>
          </div>
        </div>
        <div className="detalleVehiculo-header-actions">
          <button className="detalleVehiculo-btn-edit" onClick={() => navigate(`/vehiculos/editar/${vehiculo.id}`)}>
            <FaEdit />
            Editar Vehículo
          </button>
        </div>
      </div>

      {/* Información del Vehículo */}
      <div className="detalleVehiculo-section">
        <div className="detalleVehiculo-section-header">
          <h2 className="detalleVehiculo-section-title">
            <FaCar className="detalleVehiculo-section-icon" />
            Información del Vehículo
          </h2>
        </div>
        <div className="detalleVehiculo-info-grid">
          <div className="detalleVehiculo-info-card">
            <div className="detalleVehiculo-info-icon">
              <FaIdCard />
            </div>
            <div className="detalleVehiculo-info-content">
              <span className="detalleVehiculo-info-label">Placa</span>
              <span className="detalleVehiculo-info-value">{vehiculo.placa}</span>
            </div>
          </div>

          <div className="detalleVehiculo-info-card">
            <div className="detalleVehiculo-info-icon">
              <FaPalette />
            </div>
            <div className="detalleVehiculo-info-content">
              <span className="detalleVehiculo-info-label">Color</span>
              <span className="detalleVehiculo-info-value">{vehiculo.color}</span>
            </div>
          </div>

          <div className="detalleVehiculo-info-card">
            <div className="detalleVehiculo-info-icon">
              <FaCar />
            </div>
            <div className="detalleVehiculo-info-content">
              <span className="detalleVehiculo-info-label">Tipo de Vehículo</span>
              <span className="detalleVehiculo-info-value">{vehiculo.tipo_vehiculo}</span>
            </div>
          </div>

          <div className="detalleVehiculo-info-card">
            <div className="detalleVehiculo-info-icon">
              <FaTag />
            </div>
            <div className="detalleVehiculo-info-content">
              <span className="detalleVehiculo-info-label">Marca</span>
              <span className="detalleVehiculo-info-value">{vehiculo.marca_nombre || "No especificada"}</span>
            </div>
          </div>

          <div className="detalleVehiculo-info-card">
            <div className="detalleVehiculo-info-icon">
              <FaUser />
            </div>
            <div className="detalleVehiculo-info-content">
              <span className="detalleVehiculo-info-label">Cliente</span>
              <span className="detalleVehiculo-info-value">{vehiculo.cliente_nombre || "No asignado"}</span>
            </div>
          </div>

          <div className="detalleVehiculo-info-card">
            <div className="detalleVehiculo-info-icon">
              <FaCogs />
            </div>
            <div className="detalleVehiculo-info-content">
              <span className="detalleVehiculo-info-label">Referencia</span>
              <span className="detalleVehiculo-info-value">{vehiculo.referencia_nombre || "No especificada"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="detalleVehiculo-section">
        <div className="detalleVehiculo-section-header">
          <h2 className="detalleVehiculo-section-title">
            <FaCogs className="detalleVehiculo-section-icon" />
            Información del Sistema
          </h2>
        </div>
        <div className="detalleVehiculo-info-grid">
          <div className="detalleVehiculo-info-card">
            <div className="detalleVehiculo-info-icon">
              {vehiculo.estado?.toLowerCase() === "activo" ? <FaToggleOn /> : <FaToggleOff />}
            </div>
            <div className="detalleVehiculo-info-content">
              <span className="detalleVehiculo-info-label">Estado</span>
              <span className={`detalleVehiculo-estado ${getEstadoClass(vehiculo.estado)}`}>
                {vehiculo.estado || "No especificado"}
              </span>
            </div>
          </div>

          {vehiculo.fecha_creacion && (
            <div className="detalleVehiculo-info-card">
              <div className="detalleVehiculo-info-icon">
                <FaCalendarAlt />
              </div>
              <div className="detalleVehiculo-info-content">
                <span className="detalleVehiculo-info-label">Fecha de Registro</span>
                <span className="detalleVehiculo-info-value">{formatearFecha(vehiculo.fecha_creacion)}</span>
              </div>
            </div>
          )}

          {vehiculo.ultima_actualizacion && (
            <div className="detalleVehiculo-info-card">
              <div className="detalleVehiculo-info-icon">
                <FaCalendarAlt />
              </div>
              <div className="detalleVehiculo-info-content">
                <span className="detalleVehiculo-info-label">Última Actualización</span>
                <span className="detalleVehiculo-info-value">{formatearFecha(vehiculo.ultima_actualizacion)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetalleVehiculo

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
import "../../../../shared/styles/Clientes/DetalleCliente.css"

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
          throw new Error("Cliente no encontrado.")
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

const DetalleCliente = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { makeRequest } = useApi()

  const [cliente, setCliente] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        setCargando(true)
        setError(null)

        const data = await makeRequest(`/clientes/${id}`)
        if (data) {
          setCliente(data)
        }
      } catch (error) {
        console.error("Error al cargar cliente:", error)
        setError(error.message)
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      cargarCliente()
    }
  }, [id, makeRequest])

  const getEstadoClass = (estado) => {
    return estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
  }

  if (cargando) {
    return (
      <div className="detalleCliente-container">
        <div className="detalleCliente-loading">
          <div className="detalleCliente-spinner"></div>
          <p>Cargando detalles del cliente...</p>
        </div>
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div className="detalleCliente-container">
        <div className="detalleCliente-error">
          <div className="detalleCliente-error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Error</h2>
          <p>{error || "No se encontró el cliente"}</p>
          <button className="detalleCliente-btn-back" onClick={() => navigate("/ListarClientes")}>
            <FaArrowLeft />
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleCliente-container">
      {/* Header */}
      <div className="detalleCliente-header">
        <div className="detalleCliente-header-left">
          <button className="detalleCliente-btn-back" onClick={() => navigate("/ListarClientes")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="detalleCliente-title-section">
            <h1 className="detalleCliente-page-title">
              <FaUser className="detalleCliente-title-icon" />
              Detalle del Cliente
            </h1>
            <p className="detalleCliente-subtitle">
              Información completa de {cliente.nombre} {cliente.apellido}
            </p>
          </div>
        </div>
        <div className="detalleCliente-header-actions">
          <button className="detalleCliente-btn-edit" onClick={() => navigate(`/EditarCliente/${cliente.id}`)}>
            <FaEdit />
            Editar Cliente
          </button>
        </div>
      </div>

      {/* Información Personal */}
      <div className="detalleCliente-section">
        <div className="detalleCliente-section-header">
          <h2 className="detalleCliente-section-title">
            <FaUser className="detalleCliente-section-icon" />
            Información Personal
          </h2>
        </div>
        <div className="detalleCliente-info-grid">
          <div className="detalleCliente-info-card">
            <div className="detalleCliente-info-icon">
              <FaUser />
            </div>
            <div className="detalleCliente-info-content">
              <span className="detalleCliente-info-label">Nombre Completo</span>
              <span className="detalleCliente-info-value">
                {cliente.nombre} {cliente.apellido}
              </span>
            </div>
          </div>

          <div className="detalleCliente-info-card">
            <div className="detalleCliente-info-icon">
              <FaIdCard />
            </div>
            <div className="detalleCliente-info-content">
              <span className="detalleCliente-info-label">Tipo de Documento</span>
              <span className="detalleCliente-info-value">{cliente.tipo_documento || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleCliente-info-card">
            <div className="detalleCliente-info-icon">
              <FaIdCard />
            </div>
            <div className="detalleCliente-info-content">
              <span className="detalleCliente-info-label">Número de Documento</span>
              <span className="detalleCliente-info-value">{cliente.documento || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleCliente-info-card">
            <div className="detalleCliente-info-icon">
              <FaEnvelope />
            </div>
            <div className="detalleCliente-info-content">
              <span className="detalleCliente-info-label">Correo Electrónico</span>
              <span className="detalleCliente-info-value">{cliente.correo || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleCliente-info-card">
            <div className="detalleCliente-info-icon">
              <FaPhone />
            </div>
            <div className="detalleCliente-info-content">
              <span className="detalleCliente-info-label">Teléfono</span>
              <span className="detalleCliente-info-value">{cliente.telefono || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleCliente-info-card">
            <div className="detalleCliente-info-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="detalleCliente-info-content">
              <span className="detalleCliente-info-label">Dirección</span>
              <span className="detalleCliente-info-value">{cliente.direccion || "No especificada"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="detalleCliente-section">
        <div className="detalleCliente-section-header">
          <h2 className="detalleCliente-section-title">
            <FaUserTag className="detalleCliente-section-icon" />
            Información del Sistema
          </h2>
        </div>
        <div className="detalleCliente-info-grid">
          <div className="detalleCliente-info-card">
            <div className="detalleCliente-info-icon">
              {cliente.estado?.toLowerCase() === "activo" ? <FaToggleOn /> : <FaToggleOff />}
            </div>
            <div className="detalleCliente-info-content">
              <span className="detalleCliente-info-label">Estado</span>
              <span className={`detalleCliente-estado ${getEstadoClass(cliente.estado)}`}>
                {cliente.estado || "No especificado"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleCliente

"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FaUser,
  FaBuilding,
  FaPhone,
  FaIdCard,
  FaMapMarkerAlt,
  FaEnvelope,
  FaEdit,
  FaArrowLeft,
  FaExclamationTriangle,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa"
import "../../../../shared/styles/detalleProveedor.css"

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

const DetalleProveedor = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [proveedor, setProveedor] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProveedor = async () => {
      try {
        setCargando(true)
        setError(null)

        const token = getValidToken()
        if (!token) {
          setError("No autorizado: Token de autenticación no encontrado.")
          return
        }

        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("No autorizado: La sesión ha expirado o no tienes permisos.")
          }
          if (response.status === 404) {
            throw new Error("Proveedor no encontrado.")
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setProveedor(data)
      } catch (err) {
        console.error("Error al obtener proveedor:", err)
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      fetchProveedor()
    }
  }, [id])

  const getEstadoClass = (estado) => {
    return estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
  }

  if (cargando) {
    return (
      <div className="detalleProveedor-container">
        <div className="detalleProveedor-loading">
          <div className="detalleProveedor-spinner"></div>
          <p>Cargando detalles del proveedor...</p>
        </div>
      </div>
    )
  }

  if (error || !proveedor) {
    return (
      <div className="detalleProveedor-container">
        <div className="detalleProveedor-error">
          <div className="detalleProveedor-error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Error</h2>
          <p>{error || "No se encontró el proveedor"}</p>
          <button className="detalleProveedor-btn-back" onClick={() => navigate("/ListarProveedores")}>
            <FaArrowLeft />
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleProveedor-container">
      {/* Header */}
      <div className="detalleProveedor-header">
        <div className="detalleProveedor-header-left">
          <button className="detalleProveedor-btn-back" onClick={() => navigate("/ListarProveedores")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="detalleProveedor-title-section">
            <h1 className="detalleProveedor-page-title">
              <FaBuilding className="detalleProveedor-title-icon" />
              Detalle del Proveedor
            </h1>
            <p className="detalleProveedor-subtitle">
              Información completa de {proveedor.nombre} - {proveedor.nombre_empresa}
            </p>
          </div>
        </div>
        <div className="detalleProveedor-header-actions">
          <button
            className="detalleProveedor-btn-edit"
            onClick={() => navigate(`/EditarProveedor/editar/${proveedor._id}`)}
          >
            <FaEdit />
            Editar Proveedor
          </button>
        </div>
      </div>

      {/* Información Personal */}
      <div className="detalleProveedor-section">
        <div className="detalleProveedor-section-header">
          <h2 className="detalleProveedor-section-title">
            <FaUser className="detalleProveedor-section-icon" />
            Información Personal
          </h2>
        </div>
        <div className="detalleProveedor-info-grid">
          <div className="detalleProveedor-info-card">
            <div className="detalleProveedor-info-icon">
              <FaUser />
            </div>
            <div className="detalleProveedor-info-content">
              <span className="detalleProveedor-info-label">Nombre</span>
              <span className="detalleProveedor-info-value">{proveedor.nombre}</span>
            </div>
          </div>

          <div className="detalleProveedor-info-card">
            <div className="detalleProveedor-info-icon">
              <FaPhone />
            </div>
            <div className="detalleProveedor-info-content">
              <span className="detalleProveedor-info-label">Teléfono</span>
              <span className="detalleProveedor-info-value">{proveedor.telefono}</span>
            </div>
          </div>

          <div className="detalleProveedor-info-card">
            <div className="detalleProveedor-info-icon">
              <FaEnvelope />
            </div>
            <div className="detalleProveedor-info-content">
              <span className="detalleProveedor-info-label">Correo Electrónico</span>
              <span className="detalleProveedor-info-value">{proveedor.correo || "No especificado"}</span>
            </div>
          </div>

          <div className="detalleProveedor-info-card">
            <div className="detalleProveedor-info-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="detalleProveedor-info-content">
              <span className="detalleProveedor-info-label">Dirección</span>
              <span className="detalleProveedor-info-value">{proveedor.direccion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información de la Empresa */}
      <div className="detalleProveedor-section">
        <div className="detalleProveedor-section-header">
          <h2 className="detalleProveedor-section-title">
            <FaBuilding className="detalleProveedor-section-icon" />
            Información de la Empresa
          </h2>
        </div>
        <div className="detalleProveedor-info-grid">
          <div className="detalleProveedor-info-card">
            <div className="detalleProveedor-info-icon">
              <FaBuilding />
            </div>
            <div className="detalleProveedor-info-content">
              <span className="detalleProveedor-info-label">Nombre de la Empresa</span>
              <span className="detalleProveedor-info-value">{proveedor.nombre_empresa}</span>
            </div>
          </div>

          <div className="detalleProveedor-info-card">
            <div className="detalleProveedor-info-icon">
              <FaPhone />
            </div>
            <div className="detalleProveedor-info-content">
              <span className="detalleProveedor-info-label">Teléfono Empresa</span>
              <span className="detalleProveedor-info-value">{proveedor.telefono_empresa}</span>
            </div>
          </div>

          <div className="detalleProveedor-info-card">
            <div className="detalleProveedor-info-icon">
              <FaIdCard />
            </div>
            <div className="detalleProveedor-info-content">
              <span className="detalleProveedor-info-label">NIT</span>
              <span className="detalleProveedor-info-value">{proveedor.nit}</span>
            </div>
          </div>

          <div className="detalleProveedor-info-card">
            <div className="detalleProveedor-info-icon">
              {proveedor.estado?.toLowerCase() === "activo" ? <FaToggleOn /> : <FaToggleOff />}
            </div>
            <div className="detalleProveedor-info-content">
              <span className="detalleProveedor-info-label">Estado</span>
              <span className={`detalleProveedor-estado ${getEstadoClass(proveedor.estado)}`}>
                {proveedor.estado || "No especificado"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleProveedor

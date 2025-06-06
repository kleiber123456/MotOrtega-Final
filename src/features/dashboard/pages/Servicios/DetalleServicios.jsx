"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaCog, FaFileAlt, FaDollarSign, FaToggleOn, FaEdit, FaArrowLeft, FaExclamationTriangle } from "react-icons/fa"
import "../../../../shared/styles/detalleServicios.css"

const DetalleServicio = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [servicio, setServicio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  useEffect(() => {
    const cargarServicio = async () => {
      try {
        setCargando(true)
        setError(null)

        if (!token) {
          setError("No autorizado: Token de autenticación no encontrado.")
          return
        }

        const response = await fetch(`https://api-final-8rw7.onrender.com/api/servicios/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError("No autorizado: La sesión ha expirado o no tienes permisos.")
          } else if (response.status === 404) {
            setError("Servicio no encontrado.")
          } else {
            setError("Error al cargar los detalles del servicio.")
          }
          return
        }

        const data = await response.json()
        setServicio(data)
      } catch (err) {
        console.error("Error al obtener servicio:", err)
        setError(err.message || "Error al cargar los detalles del servicio.")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      cargarServicio()
    }
  }, [id, token])

  const getEstadoClass = (estado) => {
    return estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
  }

  if (cargando) {
    return (
      <div className="detalleServicio-container">
        <div className="detalleServicio-loading">
          <div className="detalleServicio-spinner"></div>
          <p>Cargando detalles del servicio...</p>
        </div>
      </div>
    )
  }

  if (error || !servicio) {
    return (
      <div className="detalleServicio-container">
        <div className="detalleServicio-error">
          <div className="detalleServicio-error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Error</h2>
          <p>{error || "No se encontró el servicio"}</p>
          <button className="detalleServicio-btn-back" onClick={() => navigate("/listarServicios")}>
            <FaArrowLeft />
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleServicio-container">
      {/* Header */}
      <div className="detalleServicio-header">
        <div className="detalleServicio-header-left">
          <button className="detalleServicio-btn-back" onClick={() => navigate("/listarServicios")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="detalleServicio-title-section">
            <h1 className="detalleServicio-page-title">
              <FaCog className="detalleServicio-title-icon" />
              Detalle del Servicio
            </h1>
            <p className="detalleServicio-subtitle">Información completa de {servicio.nombre}</p>
          </div>
        </div>
        <div className="detalleServicio-header-actions">
          <button className="detalleServicio-btn-edit" onClick={() => navigate(`/servicios/editar/${servicio.id}`)}>
            <FaEdit />
            Editar Servicio
          </button>
        </div>
      </div>

      {/* Información del Servicio */}
      <div className="detalleServicio-section">
        <div className="detalleServicio-section-header">
          <h2 className="detalleServicio-section-title">
            <FaCog className="detalleServicio-section-icon" />
            Información del Servicio
          </h2>
        </div>
        <div className="detalleServicio-info-grid">
          <div className="detalleServicio-info-card">
            <div className="detalleServicio-info-icon">
              <FaCog />
            </div>
            <div className="detalleServicio-info-content">
              <span className="detalleServicio-info-label">Nombre del Servicio</span>
              <span className="detalleServicio-info-value">{servicio.nombre}</span>
            </div>
          </div>

          <div className="detalleServicio-info-card">
            <div className="detalleServicio-info-icon">
              <FaFileAlt />
            </div>
            <div className="detalleServicio-info-content">
              <span className="detalleServicio-info-label">Descripción</span>
              <span className="detalleServicio-info-value descripcion">{servicio.descripcion}</span>
            </div>
          </div>

          <div className="detalleServicio-info-card">
            <div className="detalleServicio-info-icon">
              <FaDollarSign />
            </div>
            <div className="detalleServicio-info-content">
              <span className="detalleServicio-info-label">Precio</span>
              <span className="detalleServicio-info-value precio">${servicio.precio?.toLocaleString()}</span>
            </div>
          </div>

          <div className="detalleServicio-info-card">
            <div className="detalleServicio-info-icon">
              <FaToggleOn />
            </div>
            <div className="detalleServicio-info-content">
              <span className="detalleServicio-info-label">Estado</span>
              <span className={`detalleServicio-estado ${getEstadoClass(servicio.estado)}`}>
                {servicio.estado || "No especificado"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleServicio

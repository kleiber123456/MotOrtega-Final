"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FaBox,
  FaTag,
  FaDollarSign,
  FaCalendar,
  FaToggleOn,
  FaToggleOff,
  FaEdit,
  FaArrowLeft,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Repuesto.css"

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
          throw new Error("Repuesto no encontrado.")
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

function DetalleRepuesto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [repuesto, setRepuesto] = useState(null)
  const [categoria, setCategoria] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRepuesto = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Obtener datos del repuesto
        const dataRepuesto = await makeRequest(`/repuestos/${id}`)
        if (dataRepuesto) {
          setRepuesto(dataRepuesto)

          // Obtener categorías para mostrar el nombre de la categoría
          if (dataRepuesto.categoria_repuesto_id) {
            const dataCategorias = await makeRequest("/categorias-repuestos")
            if (dataCategorias) {
              const categoriaEncontrada = dataCategorias.find((cat) => cat.id === dataRepuesto.categoria_repuesto_id)
              setCategoria(categoriaEncontrada ? categoriaEncontrada.nombre : "Sin categoría")
            } else {
              setCategoria("Sin categoría")
            }
          }
        }
      } catch (err) {
        console.error("Error al cargar repuesto:", err)
        setError(err.message)

        if (err.message.includes("no encontrado")) {
          await Swal.fire({
            icon: "error",
            title: "Repuesto no encontrado",
            text: "El repuesto que buscas no existe o ha sido eliminado.",
            confirmButtonColor: "#ef4444",
          })
          navigate("/repuestos")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchRepuesto()
  }, [id, makeRequest, navigate])

  const formatearPrecio = useCallback((precio) => {
    if (!precio) return "$0.00"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(precio)
  }, [])

  const formatearFecha = useCallback((fecha) => {
    if (!fecha) return "N/A"
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [])

  const handleEditar = useCallback(() => {
    navigate(`/repuestos/editar/${repuesto.id}`)
  }, [navigate, repuesto])

  const handleVolver = useCallback(() => {
    navigate("/repuestos")
  }, [navigate])

  if (isLoading) {
    return (
      <div className="repuestos-container">
        <div className="repuestos-loading">
          <FaSpinner className="spinning" />
          <h2>Cargando detalles del repuesto...</h2>
          <p>Por favor espere un momento</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="repuestos-container">
        <div className="repuestos-error">
          <FaExclamationTriangle className="repuestos-error-icon" />
          <h2>Error al cargar el repuesto</h2>
          <p>{error}</p>
          <div className="repuestos-error-actions">
            <button className="repuestos-secondary-button" onClick={handleVolver}>
              <FaArrowLeft className="repuestos-button-icon" />
              Volver al listado
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!repuesto) {
    return (
      <div className="repuestos-container">
        <div className="repuestos-error">
          <FaExclamationTriangle className="repuestos-error-icon" />
          <h2>Repuesto no disponible</h2>
          <p>No se pudo cargar la información del repuesto.</p>
          <div className="repuestos-error-actions">
            <button className="repuestos-secondary-button" onClick={handleVolver}>
              <FaArrowLeft className="repuestos-button-icon" />
              Volver al listado
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="repuestos-container">
      <div className="repuestos-header">
        <div className="repuestos-header-content">
          <h1 className="repuestos-page-title">
            <FaBox className="repuestos-title-icon" />
            Detalle del Repuesto
          </h1>
          <p className="repuestos-subtitle">Información completa del repuesto seleccionado</p>
        </div>
        <div className="repuestos-header-actions">
          <button className="repuestos-secondary-button" onClick={handleVolver}>
            <FaArrowLeft className="repuestos-button-icon" />
            Volver
          </button>
          <button className="repuestos-primary-button" onClick={handleEditar}>
            <FaEdit className="repuestos-button-icon" />
            Editar
          </button>
        </div>
      </div>

      <div className="repuestos-detail-card">
        <div className="repuestos-detail-header">
          <div className="repuestos-detail-title">
            <h2>{repuesto.nombre}</h2>
            <div className={`repuestos-status-badge ${repuesto.estado === "Activo" ? "active" : "inactive"}`}>
              {repuesto.estado === "Activo" ? (
                <FaCheckCircle className="repuestos-status-icon" />
              ) : (
                <FaTimesCircle className="repuestos-status-icon" />
              )}
              {repuesto.estado}
            </div>
          </div>
        </div>

        <div className="repuestos-detail-content">
          <div className="repuestos-detail-grid">
            <div className="repuestos-detail-section">
              <h3 className="repuestos-detail-section-title">
                <FaFileText className="repuestos-section-icon" />
                Información General
              </h3>

              <div className="repuestos-detail-field">
                <label className="repuestos-detail-label">
                  <FaBox className="repuestos-field-icon" />
                  Nombre del Repuesto
                </label>
                <div className="repuestos-detail-value">{repuesto.nombre}</div>
              </div>

              <div className="repuestos-detail-field">
                <label className="repuestos-detail-label">
                  <FaFileText className="repuestos-field-icon" />
                  Descripción
                </label>
                <div className="repuestos-detail-value">{repuesto.descripcion || "Sin descripción"}</div>
              </div>

              <div className="repuestos-detail-field">
                <label className="repuestos-detail-label">
                  <FaTag className="repuestos-field-icon" />
                  Categoría
                </label>
                <div className="repuestos-detail-value">
                  <span className="repuestos-category-badge">{categoria}</span>
                </div>
              </div>
            </div>

            <div className="repuestos-detail-section">
              <h3 className="repuestos-detail-section-title">
                <FaDollarSign className="repuestos-section-icon" />
                Información Financiera
              </h3>

              <div className="repuestos-detail-field">
                <label className="repuestos-detail-label">
                  <FaBox className="repuestos-field-icon" />
                  Cantidad en Stock
                </label>
                <div className="repuestos-detail-value">
                  <span className="repuestos-quantity-display">{repuesto.cantidad || 0} unidades</span>
                </div>
              </div>

              <div className="repuestos-detail-field">
                <label className="repuestos-detail-label">
                  <FaDollarSign className="repuestos-field-icon" />
                  Precio Unitario
                </label>
                <div className="repuestos-detail-value">
                  <span className="repuestos-price-display">{formatearPrecio(repuesto.preciounitario)}</span>
                </div>
              </div>

              <div className="repuestos-detail-field">
                <label className="repuestos-detail-label">
                  <FaDollarSign className="repuestos-field-icon" />
                  Valor Total en Inventario
                </label>
                <div className="repuestos-detail-value">
                  <span className="repuestos-total-display">{formatearPrecio(repuesto.total)}</span>
                </div>
              </div>
            </div>

            <div className="repuestos-detail-section">
              <h3 className="repuestos-detail-section-title">
                <FaCalendar className="repuestos-section-icon" />
                Información del Sistema
              </h3>

              <div className="repuestos-detail-field">
                <label className="repuestos-detail-label">
                  <FaCalendar className="repuestos-field-icon" />
                  Fecha de Creación
                </label>
                <div className="repuestos-detail-value">{formatearFecha(repuesto.created_at)}</div>
              </div>

              <div className="repuestos-detail-field">
                <label className="repuestos-detail-label">
                  <FaCalendar className="repuestos-field-icon" />
                  Última Actualización
                </label>
                <div className="repuestos-detail-value">{formatearFecha(repuesto.updated_at)}</div>
              </div>

              <div className="repuestos-detail-field">
                <label className="repuestos-detail-label">
                  {repuesto.estado === "Activo" ? (
                    <FaToggleOn className="repuestos-field-icon active" />
                  ) : (
                    <FaToggleOff className="repuestos-field-icon inactive" />
                  )}
                  Estado del Repuesto
                </label>
                <div className="repuestos-detail-value">
                  <div className={`repuestos-status-badge ${repuesto.estado === "Activo" ? "active" : "inactive"}`}>
                    {repuesto.estado === "Activo" ? (
                      <FaCheckCircle className="repuestos-status-icon" />
                    ) : (
                      <FaTimesCircle className="repuestos-status-icon" />
                    )}
                    {repuesto.estado}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="repuestos-detail-actions">
          <button className="repuestos-secondary-button" onClick={handleVolver}>
            <FaArrowLeft className="repuestos-button-icon" />
            Volver al Listado
          </button>
          <button className="repuestos-primary-button" onClick={handleEditar}>
            <FaEdit className="repuestos-button-icon" />
            Editar Repuesto
          </button>
        </div>
      </div>
    </div>
  )
}

export default DetalleRepuesto

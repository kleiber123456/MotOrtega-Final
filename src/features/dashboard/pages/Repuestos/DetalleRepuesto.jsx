"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FaBox,
  FaTag,
  FaDollarSign,
  FaToggleOn,
  FaToggleOff,
  FaEdit,
  FaArrowLeft,
  FaExclamationTriangle,
  FaFileAlt,
  FaShoppingCart,
  FaChartLine,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Repuestos/DetalleRepuesto.css"

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

  const calcularMargenGanancia = useCallback(() => {
    if (!repuesto?.precio_compra || !repuesto?.preciounitario || repuesto.precio_compra <= 0) return 0
    return ((repuesto.preciounitario - repuesto.precio_compra) / repuesto.precio_compra) * 100
  }, [repuesto])

  const handleEditar = useCallback(() => {
    navigate(`/repuestos/editar/${repuesto.id}`)
  }, [navigate, repuesto])

  const handleVolver = useCallback(() => {
    navigate("/repuestos")
  }, [navigate])

  const getEstadoClass = (estado) => {
    return estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
  }

  if (isLoading) {
    return (
      <div className="detalleRepuesto-container">
        <div className="detalleRepuesto-loading">
          <div className="detalleRepuesto-spinner"></div>
          <p>Cargando detalles del repuesto...</p>
        </div>
      </div>
    )
  }

  if (error || !repuesto) {
    return (
      <div className="detalleRepuesto-container">
        <div className="detalleRepuesto-error">
          <div className="detalleRepuesto-error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Error</h2>
          <p>{error || "No se encontró el repuesto"}</p>
          <button className="detalleRepuesto-btn-back" onClick={handleVolver}>
            <FaArrowLeft />
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleRepuesto-container">
      {/* Header */}
      <div className="detalleRepuesto-header">
        <div className="detalleRepuesto-header-left">
          <button className="detalleRepuesto-btn-back" onClick={handleVolver}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="detalleRepuesto-title-section">
            <h1 className="detalleRepuesto-page-title">
              <FaBox className="detalleRepuesto-title-icon" />
              Detalle del Repuesto
            </h1>
            <p className="detalleRepuesto-subtitle">Información completa de {repuesto.nombre}</p>
          </div>
        </div>
        <div className="detalleRepuesto-header-actions">
          <button className="detalleRepuesto-btn-edit" onClick={handleEditar}>
            <FaEdit />
            Editar Repuesto
          </button>
        </div>
      </div>

      {/* Información General */}
      <div className="detalleRepuesto-section">
        <div className="detalleRepuesto-section-header">
          <h2 className="detalleRepuesto-section-title">
            <FaFileAlt className="detalleRepuesto-section-icon" />
            Información General
          </h2>
        </div>
        <div className="detalleRepuesto-info-grid">
          <div className="detalleRepuesto-info-card">
            <div className="detalleRepuesto-info-icon">
              <FaBox />
            </div>
            <div className="detalleRepuesto-info-content">
              <span className="detalleRepuesto-info-label">Nombre del Repuesto</span>
              <span className="detalleRepuesto-info-value">{repuesto.nombre}</span>
            </div>
          </div>

          <div className="detalleRepuesto-info-card">
            <div className="detalleRepuesto-info-icon">
              <FaTag />
            </div>
            <div className="detalleRepuesto-info-content">
              <span className="detalleRepuesto-info-label">Categoría</span>
              <span className="detalleRepuesto-categoria-badge">{categoria}</span>
            </div>
          </div>

          <div className="detalleRepuesto-info-card">
            <div className="detalleRepuesto-info-icon">
              <FaFileAlt />
            </div>
            <div className="detalleRepuesto-info-content">
              <span className="detalleRepuesto-info-label">Descripción</span>
              <span className="detalleRepuesto-info-value">{repuesto.descripcion || "Sin descripción"}</span>
            </div>
          </div>

          <div className="detalleRepuesto-info-card">
            <div className="detalleRepuesto-info-icon">
              <FaBox />
            </div>
            <div className="detalleRepuesto-info-content">
              <span className="detalleRepuesto-info-label">Cantidad en Stock</span>
              <span className="detalleRepuesto-quantity-display">{repuesto.cantidad || 0} unidades</span>
            </div>
          </div>

          <div className="detalleRepuesto-info-card">
            <div className="detalleRepuesto-info-icon">
              {repuesto.estado?.toLowerCase() === "activo" ? <FaToggleOn /> : <FaToggleOff />}
            </div>
            <div className="detalleRepuesto-info-content">
              <span className="detalleRepuesto-info-label">Estado del Repuesto</span>
              <span className={`detalleRepuesto-estado ${getEstadoClass(repuesto.estado)}`}>
                {repuesto.estado || "No especificado"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Información de Precios */}
      <div className="detalleRepuesto-section">
        <div className="detalleRepuesto-section-header">
          <h2 className="detalleRepuesto-section-title">
            <FaDollarSign className="detalleRepuesto-section-icon" />
            Información de Precios
          </h2>
        </div>
        <div className="detalleRepuesto-info-grid">
          <div className="detalleRepuesto-info-card">
            <div className="detalleRepuesto-info-icon">
              <FaShoppingCart />
            </div>
            <div className="detalleRepuesto-info-content">
              <span className="detalleRepuesto-info-label">Precio de Compra</span>
              <span className="detalleRepuesto-price-compra-display">{formatearPrecio(repuesto.precio_compra)}</span>
            </div>
          </div>

          <div className="detalleRepuesto-info-card">
            <div className="detalleRepuesto-info-icon">
              <FaDollarSign />
            </div>
            <div className="detalleRepuesto-info-content">
              <span className="detalleRepuesto-info-label">Precio de Venta</span>
              <span className="detalleRepuesto-price-display">{formatearPrecio(repuesto.preciounitario)}</span>
            </div>
          </div>

          <div className="detalleRepuesto-info-card">
            <div className="detalleRepuesto-info-icon">
              <FaChartLine />
            </div>
            <div className="detalleRepuesto-info-content">
              <span className="detalleRepuesto-info-label">Margen de Ganancia</span>
              <span className="detalleRepuesto-margin-display">
                {calcularMargenGanancia() > 0 ? `${calcularMargenGanancia().toFixed(2)}%` : "0%"}
              </span>
            </div>
          </div>

          <div className="detalleRepuesto-info-card">
            <div className="detalleRepuesto-info-icon">
              <FaDollarSign />
            </div>
            <div className="detalleRepuesto-info-content">
              <span className="detalleRepuesto-info-label">Valor Total en Inventario</span>
              <span className="detalleRepuesto-total-display">{formatearPrecio(repuesto.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleRepuesto

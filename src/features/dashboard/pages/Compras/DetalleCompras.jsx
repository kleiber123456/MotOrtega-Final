"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  FaArrowLeft,
  FaShoppingCart,
  FaUser,
  FaCalendarAlt,
  FaBoxes,
  FaDollarSign,
  FaDownload,
  FaExclamationTriangle,
} from "react-icons/fa"
import Swal from "sweetalert2"
import { generarFacturaPDF } from "../../utils/pdf-generator"
import "../../../../shared/styles/Compras/DetalleCompras.css"

const DetalleCompra = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [compra, setCompra] = useState(null)
  const [proveedor, setProveedor] = useState(null)
  const [detallesConProductos, setDetallesConProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      cargarDetalleCompra()
    }
  }, [id])

  const cargarDetalleCompra = async () => {
    try {
      setCargando(true)
      setError(null)

      // Cargar detalles de la compra
      const responseCompra = await fetch(`https://api-final-8rw7.onrender.com/api/compras/${id}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (!responseCompra.ok) {
        throw new Error("Error al cargar los detalles de la compra")
      }

      const dataCompra = await responseCompra.json()
      setCompra(dataCompra)

      // Cargar información del proveedor
      if (dataCompra.proveedor_id) {
        try {
          const responseProveedor = await fetch(
            `https://api-final-8rw7.onrender.com/api/proveedores/${dataCompra.proveedor_id}`,
            {
              method: "GET",
              headers: {
                Authorization: token,
              },
            },
          )

          if (responseProveedor.ok) {
            const dataProveedor = await responseProveedor.json()
            setProveedor(dataProveedor)
          }
        } catch (error) {
          console.warn("No se pudo cargar la información del proveedor:", error)
        }
      }

      // Cargar detalles de productos si existen
      if (dataCompra.detalles && dataCompra.detalles.length > 0) {
        await cargarDetallesConProductos(dataCompra.detalles)
      } else {
        // Si no hay detalles en la respuesta, intentar cargar desde el endpoint de detalles
        await cargarDetallesDesdeAPI()
      }
    } catch (error) {
      console.error("Error al cargar detalle:", error)
      setError("No se pudo cargar el detalle de la compra")
      Swal.fire("Error", "No se pudo cargar el detalle de la compra", "error")
    } finally {
      setCargando(false)
    }
  }

  const cargarDetallesDesdeAPI = async () => {
    try {
      // Intentar cargar detalles desde un endpoint específico
      const responseDetalles = await fetch(`https://api-final-8rw7.onrender.com/api/compras/${id}/detalles`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (responseDetalles.ok) {
        const detalles = await responseDetalles.json()
        await cargarDetallesConProductos(detalles)
      }
    } catch (error) {
      console.warn("No se pudieron cargar los detalles desde el endpoint específico:", error)
    }
  }

  const cargarDetallesConProductos = async (detalles) => {
    try {
      const detallesEnriquecidos = await Promise.all(
        detalles.map(async (detalle) => {
          try {
            // Cargar información del producto/repuesto
            const responseRepuesto = await fetch(
              `https://api-final-8rw7.onrender.com/api/repuestos/${detalle.repuesto_id}`,
              {
                method: "GET",
                headers: {
                  Authorization: token,
                },
              },
            )

            let nombreProducto = `Repuesto ID: ${detalle.repuesto_id}`
            let descripcionProducto = ""
            let precioUnitario = 0

            if (responseRepuesto.ok) {
              const dataRepuesto = await responseRepuesto.json()
              nombreProducto = dataRepuesto.nombre || nombreProducto
              descripcionProducto = dataRepuesto.descripcion || ""
            }

            // Calcular precio unitario desde subtotal y cantidad
            if (detalle.cantidad && detalle.cantidad > 0) {
              precioUnitario = (detalle.subtotal || 0) / detalle.cantidad
            }

            return {
              ...detalle,
              nombre_repuesto: nombreProducto,
              descripcion: descripcionProducto,
              precio: precioUnitario,
              // Asegurar que tenemos subtotal
              subtotal: detalle.subtotal || precioUnitario * (detalle.cantidad || 0),
            }
          } catch (error) {
            console.warn(`Error al cargar repuesto ${detalle.repuesto_id}:`, error)
            // Retornar detalle con información básica si falla la carga del producto
            const precioUnitario = detalle.cantidad > 0 ? (detalle.subtotal || 0) / detalle.cantidad : 0
            return {
              ...detalle,
              nombre_repuesto: `Repuesto ID: ${detalle.repuesto_id}`,
              descripcion: "",
              precio: precioUnitario,
              subtotal: detalle.subtotal || 0,
            }
          }
        }),
      )

      setDetallesConProductos(detallesEnriquecidos)
    } catch (error) {
      console.error("Error al enriquecer detalles:", error)
      // Si falla, usar los detalles básicos
      const detallesBasicos = detalles.map((detalle) => {
        const precioUnitario = detalle.cantidad > 0 ? (detalle.subtotal || 0) / detalle.cantidad : 0
        return {
          ...detalle,
          nombre_repuesto: `Repuesto ID: ${detalle.repuesto_id}`,
          descripcion: "",
          precio: precioUnitario,
          subtotal: detalle.subtotal || 0,
        }
      })
      setDetallesConProductos(detallesBasicos)
    }
  }

  const formatearPrecio = (precio) => {
    if (!precio) return "$0.00"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(precio)
  }

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "Completado":
        return "estado-completado"
      case "Pendiente":
        return "estado-pendiente"
      case "Cancelado":
        return "estado-cancelado"
      default:
        return ""
    }
  }

  const handleGenerarPDF = async () => {
    try {
      if (!compra) return

      // Mostrar loading
      Swal.fire({
        title: "Generando PDF...",
        text: "Por favor espere mientras se genera el documento",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Generar el PDF usando el generador unificado
      await generarFacturaPDF(compra, proveedor, detallesConProductos, token)

      // Cerrar loading y mostrar éxito
      Swal.close()
      Swal.fire("¡Éxito!", "El PDF se ha generado correctamente", "success")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      Swal.close()
      Swal.fire("Error", "No se pudo generar el PDF", "error")
    }
  }

  if (cargando) {
    return (
      <div className="detalleCompra-container">
        <div className="detalleCompra-loading">
          <div className="detalleCompra-spinner"></div>
          <p>Cargando detalle de la compra...</p>
        </div>
      </div>
    )
  }

  if (error || !compra) {
    return (
      <div className="detalleCompra-container">
        <div className="detalleCompra-error">
          <div className="detalleCompra-error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Error</h2>
          <p>{error || "No se encontró la compra"}</p>
          <button className="detalleCompra-btn-back" onClick={() => navigate("/compras")}>
            <FaArrowLeft />
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleCompra-container">
      {/* Header */}
      <div className="detalleCompra-header">
        <div className="detalleCompra-header-left">
          <button className="detalleCompra-btn-back" onClick={() => navigate("/compras")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="detalleCompra-title-section">
            <h1 className="detalleCompra-page-title">
              <FaShoppingCart className="detalleCompra-title-icon" />
              Detalle de Compra #{compra.id}
            </h1>
            <p className="detalleCompra-subtitle">Información completa de la compra</p>
          </div>
        </div>
        <div className="detalleCompra-header-actions">
          <button className="detalleCompra-btn-pdf" onClick={handleGenerarPDF}>
            <FaDownload />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Información General */}
      <div className="detalleCompra-section">
        <div className="detalleCompra-section-header">
          <h2 className="detalleCompra-section-title">
            <FaBoxes className="detalleCompra-section-icon" />
            Información General
          </h2>
        </div>
        <div className="detalleCompra-info-grid">
          <div className="detalleCompra-info-card">
            <div className="detalleCompra-info-icon">
              <FaCalendarAlt />
            </div>
            <div className="detalleCompra-info-content">
              <span className="detalleCompra-info-label">Fecha</span>
              <span className="detalleCompra-info-value">
                {new Date(compra.fecha).toLocaleDateString("es-CO", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="detalleCompra-info-card">
            <div className="detalleCompra-info-icon">
              <FaDollarSign />
            </div>
            <div className="detalleCompra-info-content">
              <span className="detalleCompra-info-label">Total</span>
              <span className="detalleCompra-info-value detalleCompra-total">{formatearPrecio(compra.total)}</span>
            </div>
          </div>

          <div className="detalleCompra-info-card">
            <div className="detalleCompra-info-icon">
              <FaShoppingCart />
            </div>
            <div className="detalleCompra-info-content">
              <span className="detalleCompra-info-label">Estado</span>
              <span className={`detalleCompra-estado ${getEstadoClass(compra.estado)}`}>{compra.estado}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Proveedor */}
      {proveedor && (
        <div className="detalleCompra-section">
          <div className="detalleCompra-section-header">
            <h2 className="detalleCompra-section-title">
              <FaUser className="detalleCompra-section-icon" />
              Información del Proveedor
            </h2>
          </div>
          <div className="detalleCompra-proveedor-card">
            <div className="detalleCompra-proveedor-info">
              <h3 className="detalleCompra-proveedor-name">{proveedor.nombre || "Sin nombre"}</h3>
              <div className="detalleCompra-proveedor-details">
                <div className="detalleCompra-proveedor-detail">
                  <span className="detalleCompra-proveedor-label">Documento:</span>
                  <span className="detalleCompra-proveedor-value">{proveedor.nit || "N/A"}</span>
                </div>
                <div className="detalleCompra-proveedor-detail">
                  <span className="detalleCompra-proveedor-label">Email:</span>
                  <span className="detalleCompra-proveedor-value">{proveedor.correo || "N/A"}</span>
                </div>
                <div className="detalleCompra-proveedor-detail">
                  <span className="detalleCompra-proveedor-label">Teléfono:</span>
                  <span className="detalleCompra-proveedor-value">{proveedor.telefono || "N/A"}</span>
                </div>
                {proveedor.direccion && (
                  <div className="detalleCompra-proveedor-detail">
                    <span className="detalleCompra-proveedor-label">Dirección:</span>
                    <span className="detalleCompra-proveedor-value">{proveedor.direccion}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="detalleCompra-section">
        <div className="detalleCompra-section-header">
          <h2 className="detalleCompra-section-title">
            <FaBoxes className="detalleCompra-section-icon" />
            Productos ({detallesConProductos?.length || 0})
          </h2>
        </div>

        {detallesConProductos && detallesConProductos.length > 0 ? (
          <div className="detalleCompra-productos">
            <div className="detalleCompra-productos-table">
              <div className="detalleCompra-table-header">
                <div className="detalleCompra-table-cell">#</div>
                <div className="detalleCompra-table-cell">Producto</div>
                <div className="detalleCompra-table-cell">Cantidad</div>
                <div className="detalleCompra-table-cell">Precio Unitario</div>
                <div className="detalleCompra-table-cell">Subtotal</div>
              </div>
              {detallesConProductos.map((detalle, index) => (
                <div key={index} className="detalleCompra-table-row">
                  <div className="detalleCompra-table-cell detalleCompra-table-number">{index + 1}</div>
                  <div className="detalleCompra-table-cell detalleCompra-producto-info">
                    <div className="detalleCompra-producto-name">
                      {detalle.nombre_repuesto || `Repuesto ID: ${detalle.repuesto_id}`}
                    </div>
                    {detalle.descripcion && <div className="detalleCompra-producto-desc">{detalle.descripcion}</div>}
                  </div>
                  <div className="detalleCompra-table-cell detalleCompra-cantidad">{detalle.cantidad}</div>
                  <div className="detalleCompra-table-cell detalleCompra-precio">
                    {formatearPrecio(detalle.precio || 0)}
                  </div>
                  <div className="detalleCompra-table-cell detalleCompra-subtotal">
                    {formatearPrecio(detalle.subtotal || 0)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="detalleCompra-total-section">
              <div className="detalleCompra-total-card">
                <span className="detalleCompra-total-label">Total de la Compra:</span>
                <span className="detalleCompra-total-amount">{formatearPrecio(compra.total)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="detalleCompra-no-productos">
            <FaBoxes size={48} />
            <p>No hay productos registrados en esta compra</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DetalleCompra

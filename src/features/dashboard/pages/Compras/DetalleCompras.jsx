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
  FaExclamationTriangle,
  FaHashtag, // Importar nuevo icono
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
  }, [id, token])

  const cargarDetalleCompra = async () => {
    try {
      setCargando(true)
      setError(null)

      const responseCompra = await fetch(`https://api-final-8rw7.onrender.com/api/compras/${id}`, {
        headers: { Authorization: token },
      })

      if (!responseCompra.ok) {
        throw new Error(`Error al cargar la compra: ${responseCompra.status}`)
      }
      const dataCompra = await responseCompra.json()
      setCompra(dataCompra)

      if (dataCompra.proveedor_id) {
        const responseProveedor = await fetch(
          `https://api-final-8rw7.onrender.com/api/proveedores/${dataCompra.proveedor_id}`,
          { headers: { Authorization: token } },
        )
        if (responseProveedor.ok) {
          const dataProveedor = await responseProveedor.json()
          setProveedor(dataProveedor)
        } else {
          console.warn(`No se pudo cargar el proveedor: ${responseProveedor.status}`)
        }
      }

      if (dataCompra.detalles && dataCompra.detalles.length > 0) {
        await enriquecerDetallesConRepuestos(dataCompra.detalles)
      } else {
        setDetallesConProductos([])
      }
    } catch (err) {
      setError("No se pudo cargar el detalle de la compra.")
      console.error("Error al cargar detalle de compra:", err)
      Swal.fire("Error", "No se pudo cargar el detalle de la compra.", "error")
    } finally {
      setCargando(false)
    }
  }

  const enriquecerDetallesConRepuestos = async (detalles) => {
    const detallesEnriquecidos = await Promise.all(
      detalles.map(async (detalle) => {
        const enriched = { ...detalle, nombre_repuesto: `ID: ${detalle.repuesto_id}`, descripcion: "" }
        try {
          if (detalle.repuesto_id) {
            const responseRepuesto = await fetch(
              `https://api-final-8rw7.onrender.com/api/repuestos/${detalle.repuesto_id}`,
              { headers: { Authorization: token } },
            )
            if (responseRepuesto.ok) {
              const dataRepuesto = await responseRepuesto.json()
              enriched.nombre_repuesto = dataRepuesto.nombre || `ID: ${detalle.repuesto_id}`
              enriched.descripcion = dataRepuesto.descripcion || ""
            }
          }
        } catch (error) {
          console.error(`Error enriqueciendo detalle para repuesto ${detalle.repuesto_id}:`, error)
        }
        return enriched
      }),
    )
    setDetallesConProductos(detallesEnriquecidos)
  }

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(precio || 0)
  }

  const handleGenerarPDF = async () => {
    if (!compra) return
    try {
      Swal.fire({
        title: "Generando PDF...",
        text: "Por favor espere",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })
      await generarFacturaPDF(compra, proveedor, detallesConProductos, token)
      Swal.close()
      Swal.fire("¡Éxito!", "El PDF se ha generado correctamente.", "success")
    } catch (err) {
      console.error("Error al generar PDF:", err)
      Swal.close()
      Swal.fire("Error", "No se pudo generar el PDF.", "error")
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
          <p>{error || "No se encontró la compra."}</p>
          <button className="detalleCompra-btn-back" onClick={() => navigate("/ListarCompras")}>
            <FaArrowLeft /> Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleCompra-container">
      <div className="editarUsuario-header">
        <div className="editarUsuario-header-left">
          <button className="editarUsuario-btn-back" onClick={() => navigate("/ListarCompras")} type="button">
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarUsuario-title-section">
            <h1 className="detalleCompra-page-title">
              <FaShoppingCart className="detalleCompra-title-icon" />
              Detalle de Compra
            </h1>
            <p className="detalleCompra-subtitle">Información completa de la compra</p>
          </div>
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
              <FaHashtag />
            </div>
            <div className="detalleCompra-info-content">
              <span className="detalleCompra-info-label">N° Factura</span>
              <span className="detalleCompra-info-value">{compra.numerofactura || "N/A"}</span>
            </div>
          </div>

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
                <div className="detalleCompra-table-cell">Precio Compra</div>
                <div className="detalleCompra-table-cell">Precio Venta</div>
                <div className="detalleCompra-table-cell">Subtotal</div>
              </div>
              {detallesConProductos.map((detalle, index) => (
                <div key={`${detalle.repuesto_id}-${index}`} className="detalleCompra-table-row">
                  <div className="detalleCompra-table-cell detalleCompra-table-number">{index + 1}</div>
                  <div className="detalleCompra-table-cell detalleCompra-producto-info">
                    <div className="detalleCompra-producto-name">
                      {detalle.nombre_repuesto}
                    </div>
                    {detalle.descripcion && <div className="detalleCompra-producto-desc">{detalle.descripcion}</div>}
                  </div>
                  <div className="detalleCompra-table-cell detalleCompra-cantidad">{detalle.cantidad || 0}</div>
                  <div className="detalleCompra-table-cell detalleCompra-precio">
                    {formatearPrecio(detalle.precio_compra || 0)}
                  </div>
                  <div className="detalleCompra-table-cell detalleCompra-precio">
                    {formatearPrecio(detalle.precio_venta || 0)}
                  </div>
                  <div className="detalleCompra-table-cell detalleCompra-subtotal">
                    {formatearPrecio(detalle.subtotal || 0)}
                  </div>
                </div>
              ))}
            </div>

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
            <p>No hay productos registrados en esta compra.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DetalleCompra

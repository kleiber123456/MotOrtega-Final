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

      console.log("=== INICIANDO CARGA DE COMPRA ===")
      console.log("Compra ID:", id)
      console.log("Token disponible:", !!token)

      // Cargar detalles de la compra
      const responseCompra = await fetch(`https://api-final-8rw7.onrender.com/api/compras/${id}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (!responseCompra.ok) {
        throw new Error(`Error al cargar los detalles de la compra: ${responseCompra.status}`)
      }

      const dataCompra = await responseCompra.json()
      console.log("=== DATOS DE COMPRA CARGADOS ===")
      console.log("Compra completa:", JSON.stringify(dataCompra, null, 2))
      setCompra(dataCompra)

      // Cargar información del proveedor
      if (dataCompra.proveedor_id) {
        try {
          console.log("Cargando proveedor ID:", dataCompra.proveedor_id)
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
            console.log("Proveedor cargado:", dataProveedor)
            setProveedor(dataProveedor)
          } else {
            console.warn("Error al cargar proveedor:", responseProveedor.status)
          }
        } catch (error) {
          console.warn("Excepción al cargar proveedor:", error)
        }
      }

      // Cargar detalles de productos
      await procesarDetallesCompra(dataCompra)
    } catch (error) {
      console.error("=== ERROR AL CARGAR COMPRA ===", error)
      setError("No se pudo cargar el detalle de la compra")
      Swal.fire("Error", "No se pudo cargar el detalle de la compra", "error")
    } finally {
      setCargando(false)
    }
  }

  const procesarDetallesCompra = async (dataCompra) => {
    console.log("=== PROCESANDO DETALLES DE COMPRA ===")

    let detallesParaProcesar = []

    // Estrategia 1: Usar detalles de la respuesta principal
    if (dataCompra.detalles && Array.isArray(dataCompra.detalles) && dataCompra.detalles.length > 0) {
      detallesParaProcesar = dataCompra.detalles
      console.log("Usando detalles de respuesta principal:", detallesParaProcesar.length, "items")
    }
    // Estrategia 2: Intentar endpoint específico de detalles
    else {
      console.log("No hay detalles en respuesta principal, intentando endpoint específico...")
      try {
        const responseDetalles = await fetch(`https://api-final-8rw7.onrender.com/api/compras/${id}/detalles`, {
          method: "GET",
          headers: {
            Authorization: token,
          },
        })

        if (responseDetalles.ok) {
          const detallesData = await responseDetalles.json()
          console.log("Detalles desde endpoint específico:", detallesData)
          detallesParaProcesar = Array.isArray(detallesData) ? detallesData : []
        } else {
          console.warn("Error en endpoint específico:", responseDetalles.status)
        }
      } catch (error) {
        console.warn("Excepción en endpoint específico:", error)
      }
    }

    console.log("=== DETALLES PARA PROCESAR ===")
    console.log("Total de detalles:", detallesParaProcesar.length)
    detallesParaProcesar.forEach((detalle, index) => {
      console.log(`Detalle ${index + 1}:`, {
        repuesto_id: detalle.repuesto_id,
        cantidad: detalle.cantidad,
        precio_compra: detalle.precio_compra,
        precio_venta: detalle.precio_venta,
        subtotal: detalle.subtotal,
      })
    })

    if (detallesParaProcesar.length > 0) {
      await enriquecerDetallesConRepuestos(detallesParaProcesar)
    } else {
      console.warn("No se encontraron detalles para procesar")
      setDetallesConProductos([])
    }
  }

  const enriquecerDetallesConRepuestos = async (detalles) => {
    console.log("=== ENRIQUECIENDO DETALLES CON REPUESTOS ===")

    const detallesEnriquecidos = []

    for (let i = 0; i < detalles.length; i++) {
      const detalle = detalles[i]
      console.log(`\n--- Procesando detalle ${i + 1}/${detalles.length} ---`)
      console.log("Detalle original:", detalle)

      try {
        let nombreProducto = `Repuesto ID: ${detalle.repuesto_id}`
        let descripcionProducto = ""
        const precioCompra = detalle.precio_compra || 0
        const precioVenta = detalle.precio_venta || 0
        let subtotal = detalle.subtotal || 0

        // Intentar cargar información del repuesto
        if (detalle.repuesto_id) {
          console.log(`Cargando repuesto ID: ${detalle.repuesto_id}`)

          try {
            const responseRepuesto = await fetch(
              `https://api-final-8rw7.onrender.com/api/repuestos/${detalle.repuesto_id}`,
              {
                method: "GET",
                headers: {
                  Authorization: token,
                },
              },
            )

            console.log(
              `Respuesta repuesto ${detalle.repuesto_id}:`,
              responseRepuesto.status,
              responseRepuesto.statusText,
            )

            if (responseRepuesto.ok) {
              const dataRepuesto = await responseRepuesto.json()
              console.log(`Datos del repuesto ${detalle.repuesto_id}:`, dataRepuesto)

              if (dataRepuesto && dataRepuesto.nombre) {
                nombreProducto = dataRepuesto.nombre
                descripcionProducto = dataRepuesto.descripcion || ""
                console.log(`✅ Repuesto ${detalle.repuesto_id} cargado exitosamente: ${nombreProducto}`)
              } else {
                console.warn(`⚠️ Repuesto ${detalle.repuesto_id} sin nombre en respuesta:`, dataRepuesto)
              }
            } else {
              console.warn(`❌ Error HTTP al cargar repuesto ${detalle.repuesto_id}:`, responseRepuesto.status)

              // Intentar obtener más información del error
              try {
                const errorText = await responseRepuesto.text()
                console.warn("Respuesta de error:", errorText)
              } catch (e) {
                console.warn("No se pudo leer respuesta de error")
              }
            }
          } catch (repuestoError) {
            console.error(`💥 Excepción al cargar repuesto ${detalle.repuesto_id}:`, repuestoError)
          }
        }

        // Calcular subtotal si no existe
        if (!subtotal && detalle.cantidad && precioCompra) {
          subtotal = detalle.cantidad * precioCompra
          console.log(`Subtotal calculado: ${subtotal}`)
        }

        const detalleEnriquecido = {
          ...detalle,
          nombre_repuesto: nombreProducto,
          descripcion: descripcionProducto,
          precio_compra: precioCompra,
          precio_venta: precioVenta,
          precio: precioCompra, // Para compatibilidad
          subtotal: subtotal,
        }

        console.log(`Detalle ${i + 1} enriquecido:`, {
          repuesto_id: detalleEnriquecido.repuesto_id,
          nombre_repuesto: detalleEnriquecido.nombre_repuesto,
          descripcion: detalleEnriquecido.descripcion,
          cantidad: detalleEnriquecido.cantidad,
          precio_compra: detalleEnriquecido.precio_compra,
          subtotal: detalleEnriquecido.subtotal,
        })

        detallesEnriquecidos.push(detalleEnriquecido)
      } catch (error) {
        console.error(`💥 Error al procesar detalle ${i + 1}:`, error)

        // Agregar detalle con información básica
        const detalleBasico = {
          ...detalle,
          nombre_repuesto: `Repuesto ID: ${detalle.repuesto_id}`,
          descripcion: "",
          precio_compra: detalle.precio_compra || 0,
          precio_venta: detalle.precio_venta || 0,
          precio: detalle.precio_compra || 0,
          subtotal: detalle.subtotal || detalle.cantidad * (detalle.precio_compra || 0) || 0,
        }

        detallesEnriquecidos.push(detalleBasico)
      }
    }

    console.log("=== RESULTADO FINAL ===")
    console.log("Total detalles enriquecidos:", detallesEnriquecidos.length)
    detallesEnriquecidos.forEach((detalle, index) => {
      console.log(`Final ${index + 1}: ${detalle.nombre_repuesto} (ID: ${detalle.repuesto_id})`)
    })

    setDetallesConProductos(detallesEnriquecidos)
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
                <div className="detalleCompra-table-cell">Precio Compra</div>
                <div className="detalleCompra-table-cell">Precio Venta</div>
                <div className="detalleCompra-table-cell">Subtotal</div>
              </div>
              {detallesConProductos.map((detalle, index) => (
                <div key={`${detalle.repuesto_id}-${index}`} className="detalleCompra-table-row">
                  <div className="detalleCompra-table-cell detalleCompra-table-number">{index + 1}</div>
                  <div className="detalleCompra-table-cell detalleCompra-producto-info">
                    <div className="detalleCompra-producto-name">
                      {detalle.nombre_repuesto || `Repuesto ID: ${detalle.repuesto_id}`}
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

"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  User,
  Calendar,
  Package,
  Wrench,
  FileText,
  ShoppingBag,
  AlertTriangle,
  Loader,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Swal from "sweetalert2"
import { generarFacturaPDF } from "../../utils/pdf-generator"
import "../../../../shared/styles/Ventas/DetalleVenta.css"

function DetalleVenta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const [venta, setVenta] = useState(null)
  const [cliente, setCliente] = useState(null)
  const [estadosVenta, setEstadosVenta] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    cargarDatos()
    return () => {
      document.body.style.background = ""
    }
  }, [id, token])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError(null)

      // Cargar estados de venta
      const resEstados = await fetch("https://api-final-8rw7.onrender.com/api/estados-venta", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (!resEstados.ok) throw new Error("Error al cargar los estados de venta")

      const dataEstados = await resEstados.json()
      setEstadosVenta(dataEstados)

      // Cargar venta
      const resVenta = await fetch(`https://api-final-8rw7.onrender.com/api/ventas/${id}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (!resVenta.ok) {
        if (resVenta.status === 404) {
          throw new Error("Venta no encontrada")
        }
        throw new Error("Error al cargar la venta")
      }

      const dataVenta = await resVenta.json()
      setVenta(dataVenta)

      // Cargar información del cliente
      if (dataVenta.cliente_id) {
        const resCliente = await fetch(`https://api-final-8rw7.onrender.com/api/clientes/${dataVenta.cliente_id}`, {
          method: "GET",
          headers: {
            Authorization: token,
          },
        })

        if (resCliente.ok) {
          const dataCliente = await resCliente.json()
          setCliente(dataCliente)
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
      setError(error.message || "No se pudieron cargar los datos")
    } finally {
      setCargando(false)
    }
  }

  // Función para obtener el nombre del estado
  const getNombreEstado = (estadoId) => {
    const estado = estadosVenta.find((e) => e.id === estadoId)
    return estado ? estado.nombre : "Desconocido"
  }

  // Función para obtener la clase de color según el estado
  const getEstadoClass = (estadoId) => {
    const nombreEstado = getNombreEstado(estadoId)
    switch (nombreEstado) {
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

  // Función para confirmar una venta (cambiar a Completado)
  const handleConfirmarVenta = async () => {
    try {
      // Buscar el ID del estado "Completado"
      const estadoCompletado = estadosVenta.find((estado) => estado.nombre === "Completado")
      if (!estadoCompletado) {
        Swal.fire("Error", "No se encontró el estado 'Completado'", "error")
        return
      }

      // Validar que solo se puedan confirmar ventas pendientes
      const estadoActual = getNombreEstado(venta.estado_venta_id)
      if (estadoActual !== "Pendiente") {
        Swal.fire("Información", "Solo se pueden confirmar ventas en estado Pendiente", "info")
        return
      }

      // Mostrar confirmación
      const { isConfirmed } = await Swal.fire({
        title: "Confirmar Venta",
        text: "¿Está seguro de que desea confirmar esta venta? Esta acción no se puede deshacer.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "Cancelar",
      })

      if (!isConfirmed) return

      // Realizar la petición
      const response = await fetch(`https://api-final-8rw7.onrender.com/api/ventas/${id}/cambiar-estado`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado_venta_id: estadoCompletado.id }),
      })

      if (!response.ok) {
        throw new Error("Error al confirmar la venta")
      }

      // Actualizar la venta local
      setVenta((prev) => ({ ...prev, estado_venta_id: estadoCompletado.id }))

      Swal.fire("¡Éxito!", "La venta ha sido confirmada exitosamente", "success")
    } catch (error) {
      console.error("Error al confirmar venta:", error)
      Swal.fire("Error", "No se pudo confirmar la venta", "error")
    }
  }

  // Función para anular una venta (cambiar a Cancelado)
  const handleAnularVenta = async () => {
    try {
      // Buscar el ID del estado "Cancelado"
      const estadoCancelado = estadosVenta.find((estado) => estado.nombre === "Cancelado")
      if (!estadoCancelado) {
        Swal.fire("Error", "No se encontró el estado 'Cancelado'", "error")
        return
      }

      // Validar que solo se puedan anular ventas pendientes
      const estadoActual = getNombreEstado(venta.estado_venta_id)
      if (estadoActual !== "Pendiente") {
        Swal.fire("Información", "Solo se pueden anular ventas en estado Pendiente", "info")
        return
      }

      // Mostrar confirmación
      const { isConfirmed } = await Swal.fire({
        title: "Anular Venta",
        text: "¿Está seguro de que desea anular esta venta? Esta acción devolverá los productos al inventario.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, anular",
        cancelButtonText: "Cancelar",
      })

      if (!isConfirmed) return

      // Mostrar loading mientras se procesa
      Swal.fire({
        title: "Procesando...",
        text: "Anulando la venta",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Realizar la petición
      const response = await fetch(`https://api-final-8rw7.onrender.com/api/ventas/${id}/cambiar-estado`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado_venta_id: estadoCancelado.id }),
      })

      if (!response.ok) {
        throw new Error("Error al anular la venta")
      }

      // Actualizar la venta local
      setVenta((prev) => ({ ...prev, estado_venta_id: estadoCancelado.id }))

      // Cerrar loading y mostrar éxito
      Swal.close()
      Swal.fire("¡Éxito!", "La venta ha sido anulada exitosamente", "success")
    } catch (error) {
      console.error("Error al anular venta:", error)
      Swal.close()
      Swal.fire("Error", "No se pudo anular la venta", "error")
    }
  }

  // Función para generar PDF
  const handleGenerarPDF = async () => {
    try {
      // Mostrar loading
      Swal.fire({
        title: "Generando PDF...",
        text: "Por favor espere mientras se genera el documento",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Generar el PDF
      await generarFacturaPDF(
        {
          ...venta,
          tipo: "venta",
        },
        cliente,
        [...(venta.servicios || []), ...(venta.repuestos || [])],
        token,
      )

      // Cerrar loading y mostrar éxito
      Swal.close()
      Swal.fire("¡Éxito!", "El PDF se ha generado correctamente", "success")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      Swal.close()
      Swal.fire("Error", "No se pudo generar el PDF de la venta", "error")
    }
  }

  // Función para formatear el precio
  const formatearPrecio = (precio) => {
    if (!precio) return "$0.00"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(precio)
  }

  if (cargando) {
    return (
      <div className="detalleVenta-container">
        <div className="detalleVenta-loading">
          <Loader className="detalleVenta-spinner spinning" size={48} />
          <p>Cargando detalles de la venta...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="detalleVenta-container">
        <div className="detalleVenta-error">
          <AlertTriangle size={48} className="detalleVenta-error-icon" />
          <h2>Error</h2>
          <p>{error}</p>
          <div className="detalleVenta-error-actions">
            <button className="detalleVenta-retry-button" onClick={cargarDatos}>
              Reintentar
            </button>
            <button className="detalleVenta-back-button" onClick={() => navigate("/ListarVentas")}>
              Volver a Ventas
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!venta) {
    return (
      <div className="detalleVenta-container">
        <div className="detalleVenta-not-found">
          <AlertTriangle size={48} className="detalleVenta-error-icon" />
          <h2>Venta no encontrada</h2>
          <p>La venta solicitada no existe o no tienes permisos para verla.</p>
          <button className="detalleVenta-back-button" onClick={() => navigate("/ventas")}>
            Volver a Ventas
          </button>
        </div>
      </div>
    )
  }

  const estadoActual = getNombreEstado(venta.estado_venta_id)

  return (
    <div className="detalleVenta-container">
      <div className="detalleVenta-header">
        <div className="detalleVenta-title-section">
          <button className="detalleVenta-back-button" onClick={() => navigate("/ListarVentas")}>
            <ArrowLeft className="detalleVenta-back-icon" />
            Volver
          </button>
          <div className="detalleVenta-title-info">
            <h1 className="detalleVenta-page-title">
              <ShoppingBag className="detalleVenta-title-icon" />
              Detalle de Venta #{venta.id}
            </h1>
            <p className="detalleVenta-subtitle">Información completa de la venta</p>
          </div>
        </div>
        <div className="detalleVenta-actions">
          {/* Solo mostrar botones de acción si la venta está en estado Pendiente */}
          {estadoActual === "Pendiente" && (
            <>
              <button className="detalleVenta-action-button confirmar" onClick={handleConfirmarVenta}>
                <CheckCircle className="detalleVenta-button-icon" />
                Confirmar Venta
              </button>
              <button className="detalleVenta-action-button anular" onClick={handleAnularVenta}>
                <XCircle className="detalleVenta-button-icon" />
                Anular Venta
              </button>
            </>
          )}
          <button className="detalleVenta-action-button pdf" onClick={handleGenerarPDF}>
            <FileText className="detalleVenta-button-icon" />
            Generar PDF
          </button>
        </div>
      </div>

      <div className="detalleVenta-content">
        {/* Información General */}
        <div className="detalleVenta-section">
          <div className="detalleVenta-section-header">
            <h2 className="detalleVenta-section-title">
              <ShoppingBag className="detalleVenta-section-icon" />
              Información General
            </h2>
          </div>
          <div className="detalleVenta-info-grid">
            <div className="detalleVenta-info-item">
              <span className="detalleVenta-info-label">ID de Venta:</span>
              <span className="detalleVenta-info-value">#{venta.id}</span>
            </div>
            <div className="detalleVenta-info-item">
              <span className="detalleVenta-info-label">
                <Calendar size={16} /> Fecha:
              </span>
              <span className="detalleVenta-info-value">
                {new Date(venta.fecha).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="detalleVenta-info-item">
              <span className="detalleVenta-info-label">Estado:</span>
              <span className={`detalleVenta-estado ${getEstadoClass(venta.estado_venta_id)}`}>{estadoActual}</span>
            </div>
            <div className="detalleVenta-info-item total">
              <span className="detalleVenta-info-label">Total:</span>
              <span className="detalleVenta-total-amount">{formatearPrecio(venta.total)}</span>
            </div>
          </div>
        </div>

        {/* Información del Cliente */}
        {cliente && (
          <div className="detalleVenta-section">
            <div className="detalleVenta-section-header">
              <h2 className="detalleVenta-section-title">
                <User className="detalleVenta-section-icon" />
                Información del Cliente
              </h2>
            </div>
            <div className="detalleVenta-info-grid">
              <div className="detalleVenta-info-item">
                <span className="detalleVenta-info-label">Nombre:</span>
                <span className="detalleVenta-info-value">{cliente.nombre}</span>
              </div>
              <div className="detalleVenta-info-item">
                <span className="detalleVenta-info-label">Email:</span>
                <span className="detalleVenta-info-value">{cliente.email}</span>
              </div>
              <div className="detalleVenta-info-item">
                <span className="detalleVenta-info-label">Teléfono:</span>
                <span className="detalleVenta-info-value">{cliente.telefono}</span>
              </div>
              <div className="detalleVenta-info-item">
                <span className="detalleVenta-info-label">Dirección:</span>
                <span className="detalleVenta-info-value">{cliente.direccion || "No especificada"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Productos */}
        {venta.repuestos && venta.repuestos.length > 0 && (
          <div className="detalleVenta-section">
            <div className="detalleVenta-section-header">
              <h2 className="detalleVenta-section-title">
                <Package className="detalleVenta-section-icon" />
                Productos ({venta.repuestos.length})
              </h2>
            </div>
            <div className="detalleVenta-items-container">
              {venta.repuestos.map((repuesto, index) => (
                <div key={index} className="detalleVenta-item-card">
                  <div className="detalleVenta-item-header">
                    <h4 className="detalleVenta-item-name">{repuesto.nombre}</h4>
                    <span className="detalleVenta-item-subtotal">{formatearPrecio(repuesto.subtotal)}</span>
                  </div>
                  <div className="detalleVenta-item-details">
                    <div className="detalleVenta-item-info">
                      <span className="detalleVenta-item-label">Cantidad:</span>
                      <span className="detalleVenta-item-value">{repuesto.cantidad}</span>
                    </div>
                    <div className="detalleVenta-item-info">
                      <span className="detalleVenta-item-label">Precio unitario:</span>
                      <span className="detalleVenta-item-value">
                        {formatearPrecio(repuesto.subtotal / repuesto.cantidad)}
                      </span>
                    </div>
                    {repuesto.descripcion && (
                      <div className="detalleVenta-item-info full-width">
                        <span className="detalleVenta-item-label">Descripción:</span>
                        <span className="detalleVenta-item-value">{repuesto.descripcion}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios */}
        {venta.servicios && venta.servicios.length > 0 && (
          <div className="detalleVenta-section">
            <div className="detalleVenta-section-header">
              <h2 className="detalleVenta-section-title">
                <Wrench className="detalleVenta-section-icon" />
                Servicios ({venta.servicios.length})
              </h2>
            </div>
            <div className="detalleVenta-items-container">
              {venta.servicios.map((servicio, index) => (
                <div key={index} className="detalleVenta-item-card service">
                  <div className="detalleVenta-item-header">
                    <h4 className="detalleVenta-item-name">{servicio.nombre}</h4>
                    <span className="detalleVenta-item-subtotal">{formatearPrecio(servicio.subtotal)}</span>
                  </div>
                  <div className="detalleVenta-item-details">
                    {servicio.descripcion && (
                      <div className="detalleVenta-item-info full-width">
                        <span className="detalleVenta-item-label">Descripción:</span>
                        <span className="detalleVenta-item-value">{servicio.descripcion}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumen */}
        <div className="detalleVenta-section">
          <div className="detalleVenta-section-header">
            <h2 className="detalleVenta-section-title">Resumen de la Venta</h2>
          </div>
          <div className="detalleVenta-summary">
            <div className="detalleVenta-summary-row">
              <span className="detalleVenta-summary-label">Productos:</span>
              <span className="detalleVenta-summary-value">
                {venta.repuestos ? venta.repuestos.length : 0} item{venta.repuestos?.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="detalleVenta-summary-row">
              <span className="detalleVenta-summary-label">Servicios:</span>
              <span className="detalleVenta-summary-value">
                {venta.servicios ? venta.servicios.length : 0} servicio{venta.servicios?.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="detalleVenta-summary-row subtotal">
              <span className="detalleVenta-summary-label">Subtotal Productos:</span>
              <span className="detalleVenta-summary-value">
                {formatearPrecio(venta.repuestos ? venta.repuestos.reduce((sum, item) => sum + item.subtotal, 0) : 0)}
              </span>
            </div>
            <div className="detalleVenta-summary-row subtotal">
              <span className="detalleVenta-summary-label">Subtotal Servicios:</span>
              <span className="detalleVenta-summary-value">
                {formatearPrecio(venta.servicios ? venta.servicios.reduce((sum, item) => sum + item.subtotal, 0) : 0)}
              </span>
            </div>
            <div className="detalleVenta-summary-row total">
              <span className="detalleVenta-summary-label">Total:</span>
              <span className="detalleVenta-summary-value">{formatearPrecio(venta.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleVenta

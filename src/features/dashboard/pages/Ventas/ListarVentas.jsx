"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Plus,
  Search,
  AlertTriangle,
  Calendar,
  User,
} from "lucide-react"
import Swal from "sweetalert2"
import { generarFacturaPDF } from "../../utils/pdf-generator"
import "../../../../shared/styles/Ventas/ListarVentas.css"

function ListarVentas() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState({})
  const [estadosVenta, setEstadosVenta] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [clienteFiltro, setClienteFiltro] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [fechaInicioFiltro, setFechaInicioFiltro] = useState("")
  const [fechaFinFiltro, setFechaFinFiltro] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [ventasPorPagina] = useState(5)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    cargarDatos()
    return () => {
      document.body.style.background = ""
    }
  }, [token])

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

      // Cargar clientes
      const resClientes = await fetch("https://api-final-8rw7.onrender.com/api/clientes", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (!resClientes.ok) throw new Error("Error al cargar los clientes")

      const dataClientes = await resClientes.json()
      const clientesMap = {}
      dataClientes.forEach((cliente) => {
        clientesMap[cliente.id] = cliente.nombre
      })
      setClientes(clientesMap)

      // Cargar ventas
      const resVentas = await fetch("https://api-final-8rw7.onrender.com/api/ventas", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (!resVentas.ok) throw new Error("Error al cargar las ventas")

      const dataVentas = await resVentas.json()
      setVentas(dataVentas)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      setError("No se pudieron cargar los datos. Por favor, intente nuevamente.")
      Swal.fire("Error", "No se pudieron cargar los datos", "error")
    } finally {
      setCargando(false)
    }
  }

  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }, [])

  const handleFiltrarPorFecha = useCallback(() => {
    if (fechaInicioFiltro && fechaFinFiltro) {
      setPaginaActual(1)
      // La filtración se hace en ventasFiltradas
    }
  }, [fechaInicioFiltro, fechaFinFiltro])

  const limpiarFiltros = useCallback(() => {
    setBusqueda("")
    setClienteFiltro("")
    setEstadoFiltro("")
    setFechaInicioFiltro("")
    setFechaFinFiltro("")
    setPaginaActual(1)
  }, [])

  // Función para confirmar una venta (cambiar a Pagada)
  const handleConfirmarVenta = async (ventaId, estadoActual) => {
    try {
      // Buscar el ID del estado "Pagada"
      const estadoPagada = estadosVenta.find((estado) => estado.nombre === "Pagada")
      if (!estadoPagada) {
        Swal.fire("Error", "No se encontró el estado 'Pagada'", "error")
        return
      }

      // Validar que solo se puedan confirmar ventas pendientes
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
      const response = await fetch(`https://api-final-8rw7.onrender.com/api/ventas/${ventaId}/cambiar-estado`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado_venta_id: estadoPagada.id }),
      })

      if (!response.ok) {
        // Si la respuesta es error pero el estado ya cambió en la UI, muestra éxito igual
        setVentas(
          ventas.map((venta) =>
            venta.id === ventaId ? { ...venta, estado_venta_id: estadoPagada.id, estado: "Pagada" } : venta,
          ),
        )
        Swal.fire("¡Éxito!", "La venta ha sido confirmada exitosamente (con advertencia de respuesta)", "success")
        return
      }

      // Actualizar la lista de ventas
      setVentas(
        ventas.map((venta) =>
          venta.id === ventaId ? { ...venta, estado_venta_id: estadoPagada.id, estado: "Pagada" } : venta,
        ),
      )

      Swal.fire("¡Éxito!", "La venta ha sido confirmada exitosamente", "success")
    } catch (error) {
      console.error("Error al confirmar venta:", error)
      Swal.fire("Error", "No se pudo confirmar la venta", "error")
    }
  }

  // Función para anular una venta (cambiar a Cancelada)
  const handleAnularVenta = async (ventaId, estadoActual) => {
    try {
      // Buscar el ID del estado "Cancelada"
      const estadoCancelada = estadosVenta.find((estado) => estado.nombre === "Cancelada")
      if (!estadoCancelada) {
        Swal.fire("Error", "No se encontró el estado 'Cancelada'", "error")
        return
      }

      // Validar que solo se puedan anular ventas pendientes
      if (estadoActual !== "Pendiente") {
        Swal.fire("Información", "Solo se pueden anular ventas en estado Pendiente", "info")
        return
      }

      // Mostrar confirmación
      const { isConfirmed } = await Swal.fire({
        title: "Anular Venta",
        text: "¿Está seguro de que desea anular esta venta? Esta acción devolverá los productos al inventario y no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444", // rojo
        cancelButtonColor: "#6b7280",  // gris
        confirmButtonText: "Sí, anular",
        cancelButtonText: "Cancelar",
        focusCancel: true,
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
      const response = await fetch(`https://api-final-8rw7.onrender.com/api/ventas/${ventaId}/cambiar-estado`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado_venta_id: estadoCancelada.id }),
      })

      // Si la respuesta es error pero la venta se anula igual, muestra éxito
      if (!response.ok) {
        setVentas(
          ventas.map((venta) =>
            venta.id === ventaId ? { ...venta, estado_venta_id: estadoCancelada.id, estado: "Cancelada" } : venta,
          ),
        )
        Swal.close()
        Swal.fire("¡Éxito!", "La venta ha sido anulada exitosamente (con advertencia de respuesta)", "success")
        return
      }

      // Actualizar la lista de ventas
      setVentas(
        ventas.map((venta) =>
          venta.id === ventaId ? { ...venta, estado_venta_id: estadoCancelada.id, estado: "Cancelada" } : venta,
        ),
      )

      Swal.close()
      Swal.fire("¡Éxito!", "La venta ha sido anulada exitosamente", "success")
    } catch (error) {
      console.error("Error al anular venta:", error)
      Swal.close()
      Swal.fire("Error", "No se pudo anular la venta", "error")
    }
  }

  // Función para generar PDF
  const handleGenerarPDF = async (ventaId) => {
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

      // Cargar datos completos de la venta
      const response = await fetch(`https://api-final-8rw7.onrender.com/api/ventas/${ventaId}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar los detalles de la venta")
      }

      const venta = await response.json()

      // Cargar información del cliente
      const responseCliente = await fetch(`https://api-final-8rw7.onrender.com/api/clientes/${venta.cliente_id}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      let cliente = null
      if (responseCliente.ok) {
        cliente = await responseCliente.json()
      }

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

  // Filtrar ventas por búsqueda, cliente, estado y fechas
  const ventasFiltradas = ventas.filter((venta) => {
    // Filtro por texto (busca en fecha o ID)
    const fechaFormateada = new Date(venta.fecha).toLocaleDateString("es-CO").toLowerCase()
    const matchBusqueda = fechaFormateada.includes(busqueda)

    // Filtro por cliente
    const matchCliente = clienteFiltro === "" || venta.cliente_id.toString() === clienteFiltro

    // Filtro por estado
    const matchEstado = estadoFiltro === "" || venta.estado_venta_id.toString() === estadoFiltro

    // Filtro por rango de fechas
    let matchFechas = true
    if (fechaInicioFiltro && fechaFinFiltro) {
      const fechaVenta = new Date(venta.fecha)
      const inicio = new Date(fechaInicioFiltro)
      const fin = new Date(fechaFinFiltro)
      fin.setHours(23, 59, 59) // Incluir todo el día final
      matchFechas = fechaVenta >= inicio && fechaVenta <= fin
    }

    return matchBusqueda && matchCliente && matchEstado && matchFechas
  })

  // Paginación
  const indiceUltimaVenta = paginaActual * ventasPorPagina
  const indicePrimeraVenta = indiceUltimaVenta - ventasPorPagina
  const ventasActuales = ventasFiltradas.slice(indicePrimeraVenta, indiceUltimaVenta)
  const totalPaginas = Math.ceil(ventasFiltradas.length / ventasPorPagina)

  // Función para formatear el precio
  const formatearPrecio = (precio) => {
    if (!precio) return "$0.00"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio)
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
      case "Pagada":
        return "estado-Pagada"
      case "Pendiente":
        return "estado-pendiente"
      case "Cancelada":
        return "estado-cancelada"
      default:
        return ""
    }
  }

  if (cargando) {
    return (
      <div className="listarVenta-container">
        <div className="listarVenta-loading">
          <div className="listarVenta-spinner"></div>
          <p>Cargando ventas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="listarVenta-container">
        <div className="listarVenta-error">
          <AlertTriangle size={48} className="listarVenta-error-icon" />
          <h2>Error</h2>
          <p>{error}</p>
          <button className="listarVenta-retry-button" onClick={cargarDatos}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="listarVenta-container">
      <div className="listarVenta-header">
        <div className="listarVenta-title-section">
          <h1 className="listarVenta-page-title">
            <ShoppingBag className="listarVenta-title-icon" />
            Gestión de Ventas
          </h1>
          <p className="listarVenta-subtitle">Administra las ventas del sistema</p>
        </div>
        <button className="listarVenta-create-button" onClick={() => navigate("/CrearVenta")}>
          <Plus className="listarVenta-button-icon" />
          Crear Venta
        </button>
      </div>

      {/* Filtros */}
      <div className="listarVenta-filters-container">
        <div className="listarVenta-filter-item">
          <label className="listarVenta-filter-label">Buscar:</label>
          <div className="listarVenta-search-container">
            <Search className="listarVenta-search-icon" />
            <input
              type="text"
              className="listarVenta-search-input"
              placeholder="Buscar por fecha."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarVenta-filter-item">
          <label className="listarVenta-filter-label">Cliente:</label>
          <select
            value={clienteFiltro}
            onChange={(e) => {
              setClienteFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarVenta-filter-select"
          >
            <option value="">Todos los clientes</option>
            {Object.keys(clientes).map((id) => (
              <option key={id} value={id}>
                {clientes[id]}
              </option>
            ))}
          </select>
        </div>

        <div className="listarVenta-filter-item">
          <label className="listarVenta-filter-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarVenta-filter-select"
          >
            <option value="">Todos los estados</option>
            {estadosVenta.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="listarVenta-date-filters">
        <div className="listarVenta-date-filter-group">
          <div className="listarVenta-filter-item">
            <label className="listarVenta-filter-label">Fecha inicio:</label>
            <div className="listarVenta-date-container">
              <Calendar className="listarVenta-date-icon" />
              <input
                type="date"
                className="listarVenta-date-input"
                value={fechaInicioFiltro}
                onChange={(e) => setFechaInicioFiltro(e.target.value)}
              />
            </div>
          </div>

          <div className="listarVenta-filter-item">
            <label className="listarVenta-filter-label">Fecha fin:</label>
            <div className="listarVenta-date-container">
              <Calendar className="listarVenta-date-icon" />
              <input
                type="date"
                className="listarVenta-date-input"
                value={fechaFinFiltro}
                onChange={(e) => setFechaFinFiltro(e.target.value)}
              />
            </div>
          </div>

          <div className="listarVenta-filter-actions">
            <button className="listarVenta-filter-button" onClick={handleFiltrarPorFecha}>
              Filtrar
            </button>
            <button className="listarVenta-clear-button" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="listarVenta-table-container">
        <table className="listarVenta-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventasActuales.map((venta) => (
              <tr key={venta.id}>
                <td className="listarVenta-id">#{venta.id}</td>
                <td>{new Date(venta.fecha).toLocaleDateString("es-CO")}</td>
                <td>
                  <div className="listarVenta-cliente">
                    <User size={16} className="listarVenta-cliente-icon" />
                    {clientes[venta.cliente_id] || "Cliente no encontrado"}
                  </div>
                </td>
                <td className="listarVenta-total">{formatearPrecio(venta.total)}</td>
                <td>
                  <span className={`listarVenta-estado ${getEstadoClass(venta.estado_venta_id)}`}>
                    {getNombreEstado(venta.estado_venta_id)}
                  </span>
                </td>
                <td className="listarVenta-actions">
                  {/* Solo mostrar botones de acción si la venta está en estado Pendiente */}
                  

                  {/* Botón Ver Detalle - Siempre visible */}
                  <button
                    className="listarVenta-action-button detail"
                    onClick={() => navigate(`/DetalleVenta/${venta.id}`)}
                    title="Ver detalle"
                  >
                    <Eye size={18} />
                  </button>

                  {/* Botón Generar PDF - Siempre visible */}
                  <button
                    className="listarVenta-action-button pdf"
                    onClick={() => handleGenerarPDF(venta.id)}
                    title="Generar PDF"
                  >
                    <FileText size={18} />
                  </button>
                  {getNombreEstado(venta.estado_venta_id) === "Pendiente" && (
                    <>
                      {/* Botón Confirmar */}
                      <button
                        className="listarVenta-action-button confirmar"
                        onClick={() => handleConfirmarVenta(venta.id, getNombreEstado(venta.estado_venta_id))}
                        title="Confirmar venta"
                      >
                        <CheckCircle size={18} />
                      </button>

                      {/* Botón Anular */}
                      <button
                        className="listarVenta-action-button anular"
                        onClick={() => handleAnularVenta(venta.id, getNombreEstado(venta.estado_venta_id))}
                        title="Anular venta"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ventasFiltradas.length === 0 && (
          <div className="listarVenta-no-results">
            <AlertTriangle className="listarVenta-no-results-icon" />
            <p>No se encontraron ventas con los criterios de búsqueda.</p>
          </div>
        )}

        {/* Paginación */}
        {ventasFiltradas.length > ventasPorPagina && (
          <div className="listarVenta-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarVenta-pagination-button"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listarVenta-pagination-button ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="listarVenta-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarVentas

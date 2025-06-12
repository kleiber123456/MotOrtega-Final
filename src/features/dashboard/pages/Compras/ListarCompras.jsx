"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  ShoppingCartIcon as FaShoppingCart,
  PlusIcon as FaPlus,
  SearchIcon as FaSearch,
  TriangleIcon as FaExclamationTriangle,
  FanIcon as FaTimes,
  TagIcon as FaTag,
} from "lucide-react"
import Swal from "sweetalert2"
import { generarFacturaPDF, cargarDatosCompletosCompra } from "../../utils/pdf-generator"
import "../../../../shared/styles/Compras/ListarCompras.css"

// Componente del modal para proveedores
const ProveedorModal = ({ show, onClose, proveedores, onSelect, proveedorActual }) => {
  const [busquedaProveedor, setBusquedaProveedor] = useState("")
  const [proveedoresPorPagina] = useState(5)
  const [paginaActualProveedores, setPaginaActualProveedores] = useState(1)
  const modalRef = useRef(null)

  useEffect(() => {
    if (show) {
      setBusquedaProveedor("")
      setPaginaActualProveedores(1)
    }
  }, [show])

  // Cerrar modal al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (show) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [show, onClose])

  // Convertir objeto de proveedores a array
  const proveedoresArray = Object.keys(proveedores).map((id) => ({
    id: Number.parseInt(id),
    nombre: proveedores[id],
  }))

  // Filtrar proveedores basado en la búsqueda
  const proveedoresFiltrados = proveedoresArray.filter((proveedor) =>
    proveedor.nombre.toLowerCase().includes(busquedaProveedor.toLowerCase()),
  )

  // Calcular índices para la paginación
  const indiceUltimoProveedor = paginaActualProveedores * proveedoresPorPagina
  const indicePrimerProveedor = indiceUltimoProveedor - proveedoresPorPagina
  const proveedoresActuales = proveedoresFiltrados.slice(indicePrimerProveedor, indiceUltimoProveedor)
  const totalPaginasProveedores = Math.ceil(proveedoresFiltrados.length / proveedoresPorPagina)

  // Función para ir a la página anterior
  const irPaginaAnterior = () => {
    setPaginaActualProveedores((prev) => Math.max(prev - 1, 1))
  }

  // Función para ir a la página siguiente
  const irPaginaSiguiente = () => {
    setPaginaActualProveedores((prev) => Math.min(prev + 1, totalPaginasProveedores))
  }

  // Función para manejar el cambio de búsqueda
  const handleBusquedaChange = (e) => {
    setBusquedaProveedor(e.target.value)
    setPaginaActualProveedores(1)
  }

  if (!show) return null

  return (
    <div className="listarCompra-modal-overlay">
      <div className="listarCompra-proveedor-modal" ref={modalRef}>
        <div className="listarCompra-proveedor-modal-header">
          <h2>
            <FaTag className="listarCompra-modal-header-icon" />
            Seleccionar Proveedor
          </h2>
          <button type="button" className="listarCompra-proveedor-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="listarCompra-proveedor-modal-content">
          {/* Buscador centrado */}
          <div className="listarCompra-proveedor-search-container">
            <div className="listarCompra-proveedor-search-wrapper">
              <FaSearch className="listarCompra-proveedor-search-icon" />
              <input
                type="text"
                placeholder="Buscar proveedor..."
                value={busquedaProveedor}
                onChange={handleBusquedaChange}
                className="listarCompra-proveedor-search-input"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de proveedores con paginación */}
          <div className="listarCompra-proveedor-list">
            {proveedoresActuales.length === 0 ? (
              <div className="listarCompra-proveedor-no-results">
                <FaExclamationTriangle className="listarCompra-proveedor-no-results-icon" />
                <p>{busquedaProveedor ? "No se encontraron proveedores" : "No hay proveedores disponibles"}</p>
              </div>
            ) : (
              <table className="listarCompra-proveedor-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedoresActuales.map((proveedor) => (
                    <tr key={proveedor.id} className="listarCompra-proveedor-row">
                      <td>
                        <div className="listarCompra-proveedor-name">{proveedor.nombre || "N/A"}</div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="listarCompra-proveedor-select-button"
                          onClick={() => onSelect(proveedor)}
                        >
                          <CheckCircle /> Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Controles de paginación */}
          {totalPaginasProveedores > 1 && (
            <div className="listarCompra-proveedor-pagination">
              <button
                onClick={irPaginaAnterior}
                disabled={paginaActualProveedores === 1}
                className="listarCompra-proveedor-pagination-button"
                type="button"
              >
                Anterior
              </button>

              <span className="listarCompra-proveedor-page-info">
                Página {paginaActualProveedores} de {totalPaginasProveedores}
                {proveedoresFiltrados.length > 0 && (
                  <span className="listarCompra-proveedor-total-info">
                    {" "}
                    ({proveedoresFiltrados.length} proveedor{proveedoresFiltrados.length !== 1 ? "es" : ""})
                  </span>
                )}
              </span>

              <button
                onClick={irPaginaSiguiente}
                disabled={paginaActualProveedores === totalPaginasProveedores}
                className="listarCompra-proveedor-pagination-button"
                type="button"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ListarCompras() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const [compras, setCompras] = useState([])
  const [proveedores, setProveedores] = useState({})
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [proveedorFiltro, setProveedorFiltro] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [comprasPorPagina] = useState(4)
  const [mostrarModalProveedores, setMostrarModalProveedores] = useState(false)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)

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

      // Cargar proveedores
      const resProveedores = await fetch("https://api-final-8rw7.onrender.com/api/proveedores", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (!resProveedores.ok) throw new Error("Error al cargar los proveedores")

      const dataProveedores = await resProveedores.json()
      const proveedoresMap = {}
      dataProveedores.forEach((prov) => {
        proveedoresMap[prov.id] = prov.nombre
      })
      setProveedores(proveedoresMap)

      // Cargar compras
      const resCompras = await fetch("https://api-final-8rw7.onrender.com/api/compras", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (!resCompras.ok) throw new Error("Error al cargar las compras")

      const dataCompras = await resCompras.json()
      setCompras(dataCompras)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      Swal.fire("Error", "No se pudieron cargar los datos", "error")
    } finally {
      setCargando(false)
    }
  }

  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }, [])

  const handleSeleccionarProveedor = useCallback((proveedor) => {
    setProveedorSeleccionado(proveedor)
    setProveedorFiltro(proveedor.id.toString())
    setMostrarModalProveedores(false)
    setPaginaActual(1)
  }, [])

  const limpiarFiltroProveedor = useCallback(() => {
    setProveedorSeleccionado(null)
    setProveedorFiltro("")
    setPaginaActual(1)
  }, [])

  // Función para confirmar una compra (cambiar a Completado)
  const handleConfirmarCompra = async (compraId, estadoActual) => {
    try {
      if (estadoActual !== "Pendiente") {
        Swal.fire("Información", "Solo se pueden confirmar compras en estado Pendiente", "info")
        return
      }

      const { isConfirmed } = await Swal.fire({
        title: "Confirmar Compra",
        text: "¿Está seguro de que desea confirmar esta compra? Esta acción no se puede deshacer.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "Cancelar",
      })

      if (!isConfirmed) return

      const response = await fetch(`https://api-final-8rw7.onrender.com/api/compras/${compraId}/cambiar-estado`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "Completado" }),
      })

      if (!response.ok) {
        throw new Error("Error al confirmar la compra")
      }

      setCompras(compras.map((compra) => (compra.id === compraId ? { ...compra, estado: "Completado" } : compra)))

      Swal.fire("¡Éxito!", "La compra ha sido confirmada exitosamente", "success")
    } catch (error) {
      console.error("Error al confirmar compra:", error)
      Swal.fire("Error", "No se pudo confirmar la compra", "error")
    }
  }

  // Función para anular una compra (cambiar a Cancelado)
  const handleAnularCompra = async (compraId, estadoActual) => {
    try {
      if (estadoActual !== "Pendiente") {
        Swal.fire("Información", "Solo se pueden anular compras en estado Pendiente", "info")
        return
      }

      const { isConfirmed } = await Swal.fire({
        title: "Anular Compra",
        text: "¿Está seguro de que desea anular esta compra? Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, anular",
        cancelButtonText: "Cancelar",
      })

      if (!isConfirmed) return

      Swal.fire({
        title: "Procesando...",
        text: "Anulando la compra",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const response1 = await fetch(`https://api-final-8rw7.onrender.com/api/compras/${compraId}/cambiar-estado`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "Cancelado" }),
      })

      if (!response1.ok) {
        throw new Error("Error en la primera petición para anular la compra")
      }

      const response2 = await fetch(`https://api-final-8rw7.onrender.com/api/compras/${compraId}/cambiar-estado`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "Cancelado" }),
      })

      if (!response2.ok) {
        throw new Error("Error en la segunda petición para anular la compra")
      }

      setCompras(compras.map((compra) => (compra.id === compraId ? { ...compra, estado: "Cancelado" } : compra)))

      Swal.close()
      Swal.fire("¡Éxito!", "La compra ha sido anulada exitosamente", "success")
    } catch (error) {
      console.error("Error al anular compra:", error)
      Swal.close()
      Swal.fire("Error", "No se pudo anular la compra", "error")
    }
  }

  // Función para generar PDF
  const handleGenerarPDF = async (compraId) => {
    try {
      Swal.fire({
        title: "Generando PDF...",
        text: "Por favor espere mientras se genera el documento",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const { compra, proveedor, detallesConProductos } = await cargarDatosCompletosCompra(compraId, token)
      await generarFacturaPDF(compra, proveedor, detallesConProductos, token)

      Swal.close()
      Swal.fire("¡Éxito!", "El PDF se ha generado correctamente", "success")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      Swal.close()
      Swal.fire("Error", "No se pudo generar el PDF de la compra", "error")
    }
  }

  // Filtrar compras por búsqueda, proveedor y estado
  const comprasFiltradas = compras.filter((compra) => {
    const fechaFormateada = new Date(compra.fecha).toLocaleDateString("es-CO").toLowerCase()
    const matchFecha = fechaFormateada.includes(busqueda)
    const matchProveedor = proveedorFiltro === "" || compra.proveedor_id.toString() === proveedorFiltro
    const matchEstado = estadoFiltro === "" || compra.estado === estadoFiltro
    return matchFecha && matchProveedor && matchEstado
  })

  // Paginación
  const indiceUltimaCompra = paginaActual * comprasPorPagina
  const indicePrimeraCompra = indiceUltimaCompra - comprasPorPagina
  const comprasActuales = comprasFiltradas.slice(indicePrimeraCompra, indiceUltimaCompra)
  const totalPaginas = Math.ceil(comprasFiltradas.length / comprasPorPagina)

  // Función para formatear el precio
  const formatearPrecio = (precio) => {
    if (!precio) return "$0.00"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(precio)
  }

  // Función para obtener la clase de color según el estado
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

  if (cargando) {
    return (
      <div className="listarCompra-container">
        <div className="listarCompra-loading">
          <div className="listarCompra-spinner"></div>
          <p>Cargando compras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarCompra-container">
      <div className="listarCompra-header">
        <div className="listarCompra-title-section">
          <h1 className="listarCompra-page-title">
            <FaShoppingCart className="listarCompra-title-icon" />
            Gestión de Compras
          </h1>
          <p className="listarCompra-subtitle">Administra las compras del sistema</p>
        </div>
        <button className="listarCompra-create-button" onClick={() => navigate("/CrearCompras")}>
          <FaPlus className="listarCompra-button-icon" />
          Crear Compra
        </button>
      </div>

      {/* Filtros */}
      <div className="listarCompra-filters-container">
        <div className="listarCompra-filter-item">
          <label className="listarCompra-filter-label">Buscar:</label>
          <div className="listarCompra-search-container">
            <FaSearch className="listarCompra-search-icon" />
            <input
              type="text"
              className="listarCompra-search-input"
              placeholder="Buscar por fecha..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarCompra-filter-item">
          <label className="listarCompra-filter-label">Proveedor:</label>
          <div className="listarCompra-proveedor-filter-container">
            <input
              type="text"
              placeholder="Seleccione un proveedor..."
              value={proveedorSeleccionado ? proveedorSeleccionado.nombre : ""}
              onClick={() => setMostrarModalProveedores(true)}
              readOnly
              className="listarCompra-proveedor-filter-input"
              style={{ cursor: "pointer" }}
            />
            {proveedorSeleccionado && (
              <button
                type="button"
                className="listarCompra-clear-proveedor-button"
                onClick={limpiarFiltroProveedor}
                title="Limpiar filtro"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div className="listarCompra-filter-item">
          <label className="listarCompra-filter-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarCompra-filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="Completado">Completado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="listarCompra-table-container">
        <table className="listarCompra-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comprasActuales.map((compra) => (
              <tr key={compra.id}>
                <td>{new Date(compra.fecha).toLocaleDateString("es-CO")}</td>
                <td>{proveedores[compra.proveedor_id] || "Sin proveedor"}</td>
                <td>{formatearPrecio(compra.total)}</td>
                <td>
                  <span className={`listarCompra-estado ${getEstadoClass(compra.estado)}`}>{compra.estado}</span>
                </td>
                <td className="listarCompra-actions">
                  {compra.estado === "Pendiente" && (
                    <>
                      <button
                        className="listarCompra-action-button confirmar"
                        onClick={() => handleConfirmarCompra(compra.id, compra.estado)}
                        title="Confirmar compra"
                      >
                        <CheckCircle size={18} />
                      </button>

                      <button
                        className="listarCompra-action-button anular"
                        onClick={() => handleAnularCompra(compra.id, compra.estado)}
                        title="Anular compra"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}

                  <button
                    className="listarCompra-action-button detail"
                    onClick={() => navigate(`/DetalleCompra/${compra.id}`)}
                    title="Ver detalle"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    className="listarCompra-action-button pdf"
                    onClick={() => handleGenerarPDF(compra.id)}
                    title="Generar PDF"
                  >
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {comprasFiltradas.length === 0 && (
          <div className="listarCompra-no-results">
            <FaExclamationTriangle className="listarCompra-no-results-icon" />
            <p>No se encontraron compras con los criterios de búsqueda.</p>
          </div>
        )}

        {/* Paginación */}
        {comprasFiltradas.length > comprasPorPagina && (
          <div className="listarCompra-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarCompra-pagination-button"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listarCompra-pagination-button ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="listarCompra-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal de proveedores */}
      {mostrarModalProveedores && (
        <ProveedorModal
          show={mostrarModalProveedores}
          onClose={() => setMostrarModalProveedores(false)}
          proveedores={proveedores}
          onSelect={handleSeleccionarProveedor}
          proveedorActual={proveedorFiltro}
        />
      )}
    </div>
  )
}

export default ListarCompras

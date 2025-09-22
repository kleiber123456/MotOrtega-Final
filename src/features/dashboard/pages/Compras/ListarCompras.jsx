"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Eye,
  FileText,
  CheckCircle,
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

// Función para formatear fecha
const formatearFecha = (fechaString) => {
  if (!fechaString) return "N/A"
  try {
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return "N/A"
  }
}

// Componente del modal para proveedores
const ProveedorModal = ({ show, onClose, proveedores, onSelect }) => {
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

  const proveedoresArray = Object.keys(proveedores).map((id) => ({
    id: id,
    nombre: proveedores[id],
  }))

  const proveedoresFiltrados = proveedoresArray.filter((proveedor) =>
    proveedor.nombre.toLowerCase().includes(busquedaProveedor.toLowerCase()),
  )

  const indiceUltimoProveedor = paginaActualProveedores * proveedoresPorPagina
  const indicePrimerProveedor = indiceUltimoProveedor - proveedoresPorPagina
  const proveedoresActuales = proveedoresFiltrados.slice(indicePrimerProveedor, indiceUltimoProveedor)
  const totalPaginasProveedores = Math.ceil(proveedoresFiltrados.length / proveedoresPorPagina)

  const irPaginaAnterior = () => setPaginaActualProveedores((prev) => Math.max(prev - 1, 1))
  const irPaginaSiguiente = () => setPaginaActualProveedores((prev) => Math.min(prev + 1, totalPaginasProveedores))
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
      const [resProveedores, resCompras] = await Promise.all([
        fetch("https://api-final-8rw7.onrender.com/api/proveedores", { headers: { Authorization: token } }),
        fetch("https://api-final-8rw7.onrender.com/api/compras", { headers: { Authorization: token } }),
      ])

      if (!resProveedores.ok) throw new Error("Error al cargar los proveedores")
      const dataProveedores = await resProveedores.json()
      const proveedoresMap = dataProveedores.reduce((acc, prov) => {
        acc[prov.id] = prov.nombre
        return acc
      }, {})
      setProveedores(proveedoresMap)

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
    setBusqueda(e.target.value)
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

  const handleGenerarPDF = async (compraId) => {
    try {
      Swal.fire({
        title: "Generando PDF...",
        text: "Por favor espere mientras se genera el documento",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      const { compra, proveedor, detallesConProductos } = await cargarDatosCompletosCompra(compraId, token)
      const detallesConPrecios = detallesConProductos.map((detalle) => ({
        ...detalle,
        precio_compra: detalle.precio_compra || detalle.precio || 0,
        precio_venta: detalle.precio_venta || 0,
      }))

      await generarFacturaPDF(compra, proveedor, detallesConPrecios, token)
      Swal.close()
      Swal.fire("¡Éxito!", "El PDF se ha generado correctamente", "success")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      Swal.close()
      Swal.fire("Error", "No se pudo generar el PDF de la compra", "error")
    }
  }

  const comprasFiltradas = compras.filter((compra) => {
    const searchLower = busqueda.toLowerCase()
    const matchBusqueda =
      formatearFecha(compra.fecha).toLowerCase().includes(searchLower) ||
      (compra.numerofactura && compra.numerofactura.toLowerCase().includes(searchLower)) ||
      (proveedores[compra.proveedor_id] && proveedores[compra.proveedor_id].toLowerCase().includes(searchLower))

    const matchProveedor = proveedorFiltro === "" || compra.proveedor_id.toString() === proveedorFiltro

    return matchBusqueda && matchProveedor
  })

  const indiceUltimaCompra = paginaActual * comprasPorPagina
  const indicePrimeraCompra = indiceUltimaCompra - comprasPorPagina
  const comprasActuales = comprasFiltradas.slice(indicePrimeraCompra, indiceUltimaCompra)
  const totalPaginas = Math.ceil(comprasFiltradas.length / comprasPorPagina)

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(precio || 0)
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

      <div className="listarCompra-filters-container">
        <div className="listarCompra-filter-item">
          <label className="listarCompra-filter-label">Buscar:</label>
          <div className="listarCompra-search-container">
            <FaSearch className="listarCompra-search-icon" />
            <input
              type="text"
              className="listarCompra-search-input"
              placeholder="Buscar por N° Factura, proveedor o fecha..."
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
      </div>

      <div className="listarCompra-table-container">
        <table className="listarCompra-table">
          <thead>
            <tr>
              <th>N° Factura</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comprasActuales.map((compra) => (
              <tr key={compra.id}>
                <td>{compra.numerofactura || "N/A"}</td>
                <td>{formatearFecha(compra.fecha)}</td>
                <td>{proveedores[compra.proveedor_id] || "Sin proveedor"}</td>
                <td>{formatearPrecio(compra.total)}</td>
                <td className="listarCompra-actions">
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

        {comprasFiltradas.length > comprasPorPagina && (
          <div className="listarCompra-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarCompra-pagination-button"
            >
              Anterior
            </button>
            {/* Paginación sin cambios... */}
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

      {mostrarModalProveedores && (
        <ProveedorModal
          show={mostrarModalProveedores}
          onClose={() => setMostrarModalProveedores(false)}
          proveedores={proveedores}
          onSelect={handleSeleccionarProveedor}
        />
      )}
    </div>
  )
}

export default ListarCompras

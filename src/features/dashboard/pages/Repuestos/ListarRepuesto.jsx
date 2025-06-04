"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaSpinner,
  FaExclamationTriangle,
  FaBox,
  FaToggleOn,
  FaToggleOff,
  FaChevronLeft,
  FaChevronRight,
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

function ListarRepuestos() {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [repuestos, setRepuestos] = useState([])
  const [categorias, setCategorias] = useState({})
  const [listaCategoriasCompleta, setListaCategoriasCompleta] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Estados de filtros
  const [busqueda, setBusqueda] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const [repuestosPorPagina] = useState(10)

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true)

        // Cargar categorías
        const dataCategorias = await makeRequest("/categorias-repuestos")
        if (dataCategorias) {
          setListaCategoriasCompleta(dataCategorias)

          // Crear mapa de categorías para búsqueda rápida
          const categoriasMap = {}
          dataCategorias.forEach((cat) => {
            categoriasMap[cat.id] = cat.nombre
          })
          setCategorias(categoriasMap)
        }

        // Cargar repuestos
        const dataRepuestos = await makeRequest("/repuestos")
        if (dataRepuestos) {
          setRepuestos(dataRepuestos)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los datos",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsLoading(false)
      }
    }

    cargarDatos()
  }, [makeRequest])

  // Filtrar repuestos
  const repuestosFiltrados = repuestos.filter((rep) => {
    const matchNombre = rep.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchDescripcion = rep.descripcion ? rep.descripcion.toLowerCase().includes(busqueda.toLowerCase()) : false
    const matchBusqueda = matchNombre || matchDescripcion
    const matchCategoria = categoriaFiltro === "" || rep.categoria_repuesto_id.toString() === categoriaFiltro
    const matchEstado = estadoFiltro === "" || rep.estado === estadoFiltro
    return matchBusqueda && matchCategoria && matchEstado
  })

  // Paginación
  const indiceUltimoRepuesto = paginaActual * repuestosPorPagina
  const indicePrimerRepuesto = indiceUltimoRepuesto - repuestosPorPagina
  const repuestosActuales = repuestosFiltrados.slice(indicePrimerRepuesto, indiceUltimoRepuesto)
  const totalPaginas = Math.ceil(repuestosFiltrados.length / repuestosPorPagina)

  // Manejadores
  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value)
    setPaginaActual(1)
  }, [])

  const handleCategoriaFilter = useCallback((e) => {
    setCategoriaFiltro(e.target.value)
    setPaginaActual(1)
  }, [])

  const handleEstadoFilter = useCallback((e) => {
    setEstadoFiltro(e.target.value)
    setPaginaActual(1)
  }, [])

  const handleCambiarEstado = useCallback(
    async (id, estadoActual) => {
      const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo"

      try {
        await makeRequest(`/repuestos/estado/${id}`, {
          method: "PUT",
          body: JSON.stringify({ estado: nuevoEstado }),
        })

        // Actualizar estado local
        setRepuestos((prev) => prev.map((rep) => (rep.id === id ? { ...rep, estado: nuevoEstado } : rep)))

        await Swal.fire({
          title: "Estado actualizado",
          text: `El repuesto ahora está ${nuevoEstado.toLowerCase()}`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al cambiar el estado:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el estado",
          confirmButtonColor: "#ef4444",
        })
      }
    },
    [makeRequest],
  )

  const handleEliminar = useCallback(
    async (id, nombre) => {
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: `Se eliminará el repuesto "${nombre}". Esta acción no se puede revertir.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (!confirmacion.isConfirmed) return

      try {
        await makeRequest(`/repuestos/${id}`, {
          method: "DELETE",
        })

        setRepuestos((prev) => prev.filter((rep) => rep.id !== id))

        await Swal.fire({
          title: "Eliminado",
          text: "El repuesto ha sido eliminado correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al eliminar el repuesto:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el repuesto",
          confirmButtonColor: "#ef4444",
        })
      }
    },
    [makeRequest],
  )

  const formatearPrecio = useCallback((precio) => {
    if (!precio) return "$0.00"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(precio)
  }, [])

  const limpiarFiltros = useCallback(() => {
    setBusqueda("")
    setCategoriaFiltro("")
    setEstadoFiltro("")
    setPaginaActual(1)
  }, [])

  if (isLoading) {
    return (
      <div className="repuestos-container">
        <div className="repuestos-loading">
          <FaSpinner className="spinning" />
          <h2>Cargando repuestos...</h2>
          <p>Por favor espere un momento</p>
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
            Gestión de Repuestos
          </h1>
          <p className="repuestos-subtitle">Administra el inventario de repuestos de la empresa</p>
        </div>
        <button className="repuestos-create-button" onClick={() => navigate("/crearRepuestos")}>
          <FaPlus className="repuestos-button-icon" />
          Crear Repuesto
        </button>
      </div>

      {/* Filtros */}
      <div className="repuestos-filters-section">
        <div className="repuestos-filters-header">
          <h3>
            <FaFilter className="repuestos-section-icon" />
            Filtros de Búsqueda
          </h3>
          <button className="repuestos-clear-filters-button" onClick={limpiarFiltros}>
            Limpiar Filtros
          </button>
        </div>

        <div className="repuestos-filters-grid">
          <div className="repuestos-filter-group">
            <label className="repuestos-filter-label">
              <FaSearch className="repuestos-filter-icon" />
              Buscar
            </label>
            <input
              type="text"
              className="repuestos-filter-input"
              placeholder="Buscar por nombre o descripción..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>

          <div className="repuestos-filter-group">
            <label className="repuestos-filter-label">
              <FaBox className="repuestos-filter-icon" />
              Categoría
            </label>
            <select value={categoriaFiltro} onChange={handleCategoriaFilter} className="repuestos-filter-select">
              <option value="">Todas las categorías</option>
              {listaCategoriasCompleta.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="repuestos-filter-group">
            <label className="repuestos-filter-label">
              <FaToggleOn className="repuestos-filter-icon" />
              Estado
            </label>
            <select value={estadoFiltro} onChange={handleEstadoFilter} className="repuestos-filter-select">
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de repuestos */}
      <div className="repuestos-table-section">
        <div className="repuestos-table-header">
          <h3>Lista de Repuestos ({repuestosFiltrados.length})</h3>
        </div>

        <div className="repuestos-table-container">
          <table className="repuestos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {repuestosActuales.map((repuesto) => (
                <tr key={repuesto.id} className="repuestos-table-row">
                  <td className="repuestos-table-cell">
                    <div className="repuestos-product-name">{repuesto.nombre}</div>
                  </td>
                  <td className="repuestos-table-cell">
                    <div className="repuestos-description" title={repuesto.descripcion || "Sin descripción"}>
                      {repuesto.descripcion
                        ? repuesto.descripcion.length > 50
                          ? repuesto.descripcion.substring(0, 50) + "..."
                          : repuesto.descripcion
                        : "Sin descripción"}
                    </div>
                  </td>
                  <td className="repuestos-table-cell">
                    <span className="repuestos-category-badge">
                      {categorias[repuesto.categoria_repuesto_id] || "Sin categoría"}
                    </span>
                  </td>
                  <td className="repuestos-table-cell">
                    <span className="repuestos-quantity">{repuesto.cantidad || 0}</span>
                  </td>
                  <td className="repuestos-table-cell">
                    <span className="repuestos-price">{formatearPrecio(repuesto.preciounitario)}</span>
                  </td>
                  <td className="repuestos-table-cell">
                    <span className="repuestos-total">{formatearPrecio(repuesto.total)}</span>
                  </td>
                  <td className="repuestos-table-cell">
                    <button
                      className={`repuestos-status-toggle ${repuesto.estado === "Activo" ? "active" : "inactive"}`}
                      onClick={() => handleCambiarEstado(repuesto.id, repuesto.estado)}
                      title={`Cambiar a ${repuesto.estado === "Activo" ? "Inactivo" : "Activo"}`}
                    >
                      {repuesto.estado === "Activo" ? (
                        <FaToggleOn className="repuestos-toggle-icon" />
                      ) : (
                        <FaToggleOff className="repuestos-toggle-icon" />
                      )}
                      <span className="repuestos-status-text">{repuesto.estado}</span>
                    </button>
                  </td>
                  <td className="repuestos-table-cell">
                    <div className="repuestos-actions">
                      <button
                        className="repuestos-action-button view"
                        onClick={() => navigate(`/DetalleRepuesto/${repuesto.id}`)}
                        title="Ver detalles"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="repuestos-action-button edit"
                        onClick={() => navigate(`/repuestos/editar/${repuesto.id}`)}
                        title="Editar repuesto"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="repuestos-action-button delete"
                        onClick={() => handleEliminar(repuesto.id, repuesto.nombre)}
                        title="Eliminar repuesto"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {repuestosFiltrados.length === 0 && (
            <div className="repuestos-no-results">
              <FaExclamationTriangle className="repuestos-no-results-icon" />
              <h3>No se encontraron repuestos</h3>
              <p>No hay repuestos que coincidan con los criterios de búsqueda.</p>
              <button className="repuestos-clear-filters-button" onClick={limpiarFiltros}>
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="repuestos-pagination">
            <div className="repuestos-pagination-info">
              Mostrando {indicePrimerRepuesto + 1} - {Math.min(indiceUltimoRepuesto, repuestosFiltrados.length)} de{" "}
              {repuestosFiltrados.length} repuestos
            </div>

            <div className="repuestos-pagination-controls">
              <button
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className="repuestos-pagination-button"
              >
                <FaChevronLeft />
                Anterior
              </button>

              <div className="repuestos-pagination-numbers">
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  let pageNumber
                  if (totalPaginas <= 5) {
                    pageNumber = i + 1
                  } else if (paginaActual <= 3) {
                    pageNumber = i + 1
                  } else if (paginaActual >= totalPaginas - 2) {
                    pageNumber = totalPaginas - 4 + i
                  } else {
                    pageNumber = paginaActual - 2 + i
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPaginaActual(pageNumber)}
                      className={`repuestos-pagination-number ${paginaActual === pageNumber ? "active" : ""}`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className="repuestos-pagination-button"
              >
                Siguiente
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarRepuestos

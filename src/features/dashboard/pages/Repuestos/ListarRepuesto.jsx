"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaExclamationTriangle,
  FaBox,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Repuestos/ListarRepuesto.css"

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
  const [repuestosPorPagina] = useState(4)

  // Cargar datos iniciales
  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
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
    return () => {
      document.body.style.background = ""
    }
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
    setBusqueda(e.target.value.toLowerCase())
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
        const result = await Swal.fire({
          title: `¿Cambiar estado a ${nuevoEstado}?`,
          text: `El repuesto será marcado como ${nuevoEstado.toLowerCase()}`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Sí, cambiar",
          cancelButtonText: "Cancelar",
        })

        if (!result.isConfirmed) return

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
      <div className="listarRepuesto-container">
        <div className="listarRepuesto-loading">
          <div className="listarRepuesto-spinner"></div>
          <p>Cargando repuestos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarRepuesto-container">
      <div className="listarRepuesto-header">
        <div className="listarRepuesto-title-section">
          <h1 className="listarRepuesto-page-title">
            <FaBox className="listarRepuesto-title-icon" />
            Gestión de Repuestos
          </h1>
          <p className="listarRepuesto-subtitle">Administra el inventario de repuestos de la empresa</p>
        </div>
        <button className="listarRepuesto-create-button" onClick={() => navigate("/crearRepuestos")}>
          <FaPlus className="listarRepuesto-button-icon" />
          Crear Repuesto
        </button>
      </div>

      {/* Filtros */}
      <div className="listarRepuesto-filters-container">
        <div className="listarRepuesto-filter-item">
          <label className="listarRepuesto-filter-label">Buscar:</label>
          <div className="listarRepuesto-search-container">
            <FaSearch className="listarRepuesto-search-icon" />
            <input
              type="text"
              className="listarRepuesto-search-input"
              placeholder="Buscar por nombre o descripción..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarRepuesto-filter-item">
          <label className="listarRepuesto-filter-label">Categoría:</label>
          <select value={categoriaFiltro} onChange={handleCategoriaFilter} className="listarRepuesto-filter-select">
            <option value="">Todas las categorías</option>
            {listaCategoriasCompleta.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="listarRepuesto-filter-item">
          <label className="listarRepuesto-filter-label">Estado:</label>
          <select value={estadoFiltro} onChange={handleEstadoFilter} className="listarRepuesto-filter-select">
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Tabla de repuestos */}
      <div className="listarRepuesto-table-container">
        <table className="listarRepuesto-table">
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
              <tr key={repuesto.id}>
                <td>
                  <div className="listarRepuesto-product-info">
                    <span className="listarRepuesto-product-name">{repuesto.nombre}</span>
                  </div>
                </td>
                <td>
                  <div className="listarRepuesto-description" title={repuesto.descripcion || "Sin descripción"}>
                    {repuesto.descripcion
                      ? repuesto.descripcion.length > 50
                        ? repuesto.descripcion.substring(0, 50) + "..."
                        : repuesto.descripcion
                      : "Sin descripción"}
                  </div>
                </td>
                <td>
                  <span className="listarRepuesto-category-badge">
                    {categorias[repuesto.categoria_repuesto_id] || "Sin categoría"}
                  </span>
                </td>
                <td>
                  <span className="listarRepuesto-quantity">{repuesto.cantidad || 0}</span>
                </td>
                <td>
                  <span className="listarRepuesto-price">{formatearPrecio(repuesto.preciounitario)}</span>
                </td>
                <td>
                  <span className="listarRepuesto-total">{formatearPrecio(repuesto.total)}</span>
                </td>
                <td>
                  <button
                    className={`listarRepuesto-estado-toggle ${
                      repuesto.estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
                    }`}
                    onClick={() => handleCambiarEstado(repuesto.id, repuesto.estado)}
                    title={`Estado: ${repuesto.estado} - Click para cambiar`}
                  >
                    {repuesto.estado?.toLowerCase() === "activo" ? (
                      <FaToggleOn className="listarRepuesto-toggle-icon" />
                    ) : (
                      <FaToggleOff className="listarRepuesto-toggle-icon" />
                    )}
                    <span className="listarRepuesto-estado-text">{repuesto.estado}</span>
                  </button>
                </td>
                <td className="listarRepuesto-actions">
                  <button
                    className="listarRepuesto-action-button edit"
                    onClick={() => navigate(`/repuestos/editar/${repuesto.id}`)}
                    title="Editar repuesto"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="listarRepuesto-action-button delete"
                    onClick={() => handleEliminar(repuesto.id, repuesto.nombre)}
                    title="Eliminar repuesto"
                  >
                    <FaTrash />
                  </button>
                  <button
                    className="listarRepuesto-action-button detail"
                    onClick={() => navigate(`/DetalleRepuesto/${repuesto.id}`)}
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {repuestosFiltrados.length === 0 && (
          <div className="listarRepuesto-no-results">
            <FaExclamationTriangle className="listarRepuesto-no-results-icon" />
            <p>No se encontraron repuestos con los criterios de búsqueda.</p>
          </div>
        )}

        {/* Paginación */}
        {repuestosFiltrados.length > repuestosPorPagina && (
          <div className="listarRepuesto-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarRepuesto-pagination-button"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listarRepuesto-pagination-button ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="listarRepuesto-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarRepuestos

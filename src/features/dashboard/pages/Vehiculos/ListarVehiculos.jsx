"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaCar,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaExclamationTriangle,
  FaPlus,
  FaToggleOn,
  FaToggleOff,
  FaSortAlphaDown,
  FaSortAlphaUp,
} from "react-icons/fa"
import Swal from "sweetalert2"
import axios from "axios"
import "../../../../shared/styles/Vehiculos/ListarVehiculos.css"

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
      const response = await axios({
        url: `${API_BASE_URL}${url}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        ...options,
      })

      return response.data
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

const ListarVehiculos = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [vehiculos, setVehiculos] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
    const [ordenAscendente, setOrdenAscendente] = useState(true)
  const [paginaActual, setPaginaActual] = useState(1)
  const [vehiculosPorPagina] = useState(4)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    cargarVehiculos()
    return () => {
      document.body.style.background = ""
    }
  }, [])

  const cargarVehiculos = async () => {
    try {
      setCargando(true)
      const data = await makeRequest("/vehiculos")
      if (data) {
        setVehiculos(data)
      }
    } catch (error) {
      console.error("Error al cargar vehículos:", error)
      Swal.fire("Error", "No se pudieron cargar los vehículos", "error")
    } finally {
      setCargando(false)
    }
  }

  const eliminarVehiculo = useCallback(
    async (id) => {
      if (!id) {
        Swal.fire("Error", "ID de vehículo inválido", "error")
        return
      }

      const result = await Swal.fire({
        title: "¿Eliminar vehículo?",
        text: "Esta acción eliminará el vehículo permanentemente y no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) return

      try {
        await makeRequest(`/vehiculos/${id}`, {
          method: "DELETE",
        })

        setVehiculos((prev) => prev.filter((vehiculo) => vehiculo.id !== id))

        Swal.fire({
          icon: "success",
          title: "Vehículo eliminado",
          text: "El vehículo ha sido eliminado correctamente",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al eliminar vehículo:", error)
        Swal.fire("Error", "No se pudo eliminar el vehículo", "error")
      }
    },
    [makeRequest],
  )

  const cambiarEstado = useCallback(
    async (id, estadoActual) => {
      // Buscar el vehículo por id para obtener su placa
      const vehiculo = vehiculos.find((v) => v.id === id)
      const nombreVehiculo = vehiculo ? vehiculo.placa : "el vehículo"
      try {
        const nuevoEstado = estadoActual?.toLowerCase() === "activo" ? "Inactivo" : "Activo"

        const result = await Swal.fire({
          title: `¿Cambiar estado a ${nuevoEstado}?`,
          text: `El vehículo "${nombreVehiculo}" será marcado como ${nuevoEstado.toLowerCase()}`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Sí, cambiar",
          cancelButtonText: "Cancelar",
        })

        if (!result.isConfirmed) return

        await makeRequest(`/vehiculos/${id}/cambiar-estado`, {
          method: "PUT",
        })

        setVehiculos((prev) => prev.map((v) => (v.id === id ? { ...v, estado: nuevoEstado } : v)))

        Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          text: `El vehículo "${nombreVehiculo}" ahora está ${nuevoEstado.toLowerCase()}`,
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al cambiar estado:", error)
        Swal.fire("Error", "No se pudo cambiar el estado del vehículo", "error")
      }
    },
    [makeRequest, vehiculos],
  )

  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }, [])

  // Filtrar vehículos
  let vehiculosFiltrados = vehiculos.filter((vehiculo) => {
    const matchBusqueda = Object.values(vehiculo).some((val) => String(val).toLowerCase().includes(busqueda))
    const matchTipo = tipoFiltro === "" || vehiculo.tipo_vehiculo === tipoFiltro
    const matchEstado = estadoFiltro === "" || vehiculo.estado === estadoFiltro
    return matchBusqueda && matchTipo && matchEstado
  })
  // Ordenar por placa
  vehiculosFiltrados = vehiculosFiltrados.sort((a, b) => {
    if (!a.placa || !b.placa) return 0
    return ordenAscendente
      ? a.placa.localeCompare(b.placa, 'es', { sensitivity: 'base' })
      : b.placa.localeCompare(a.placa, 'es', { sensitivity: 'base' })
  })

  // Paginación
  const indiceUltimoVehiculo = paginaActual * vehiculosPorPagina
  const indicePrimerVehiculo = indiceUltimoVehiculo - vehiculosPorPagina
  const vehiculosActuales = vehiculosFiltrados.slice(indicePrimerVehiculo, indiceUltimoVehiculo)
  const totalPaginas = Math.ceil(vehiculosFiltrados.length / vehiculosPorPagina)

  // Obtener tipos únicos para el filtro
  const tiposUnicos = [...new Set(vehiculos.map((v) => v.tipo_vehiculo).filter(Boolean))]

  if (cargando) {
    return (
      <div className="listarVehiculos-container">
        <div className="listarVehiculos-loading">
          <div className="listarVehiculos-spinner"></div>
          <p>Cargando vehículos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarVehiculos-container">
      <div className="listarVehiculos-header">
        <div className="listarVehiculos-title-section">
          <h1 className="listarVehiculos-page-title">
            <FaCar className="listarVehiculos-title-icon" />
            Gestión de Vehículos
          </h1>
          <p className="listarVehiculos-subtitle">Administra los vehículos del sistema</p>
        </div>
        <button className="listarVehiculos-create-button" onClick={() => navigate("/vehiculos/crear")}>
          <FaPlus className="listarVehiculos-button-icon" />
          Crear Vehículo
        </button>
      </div>

      {/* Filtros */}
      <div className="listarVehiculos-filters-container">
        <div className="listarVehiculos-filter-item">
          <label className="listarVehiculos-filter-label">Buscar:</label>
          <div className="listarVehiculos-search-container">
            <FaSearch className="listarVehiculos-search-icon" />
            <input
              type="text"
              className="listarVehiculos-search-input"
              placeholder="Buscar por cualquier campo..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarVehiculos-filter-item">
          <label className="listarVehiculos-filter-label">Tipo:</label>
          <select
            value={tipoFiltro}
            onChange={(e) => {
              setTipoFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarVehiculos-filter-select"
          >
            <option value="">Todos los tipos</option>
            {tiposUnicos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div className="listarVehiculos-filter-item">
          <label className="listarVehiculos-filter-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarVehiculos-filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <div className="listarVehiculos-filter-item">
          <label className="listarVehiculos-filter-label">Ordenar:</label>
          <button
            className="listarVehiculos-sort-button"
            onClick={() => setOrdenAscendente((prev) => !prev)}
            title={`Ordenar ${ordenAscendente ? "descendente" : "ascendente"}`}
          >
            {ordenAscendente ? (
              <>
                <FaSortAlphaDown className="listarVehiculos-sort-icon" />
                Ascendente
              </>
            ) : (
              <>
                <FaSortAlphaUp className="listarVehiculos-sort-icon" />
                Descendente
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="listarVehiculos-table-container">
        <table className="listarVehiculos-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Color</th>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Cliente</th>
              <th>Referencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosActuales.map((vehiculo) => (
              <tr key={vehiculo.id}>
                <td>
                  <div className="listarVehiculos-vehiculo-info">
                    <span className="listarVehiculos-vehiculo-placa">{vehiculo.placa}</span>
                  </div>
                </td>
                <td>{vehiculo.color}</td>
                <td>{vehiculo.tipo_vehiculo}</td>
                <td>{vehiculo.marca_nombre || "N/A"}</td>
                <td>{vehiculo.cliente_nombre || "N/A"}</td>
                <td>{vehiculo.referencia_nombre || "N/A"}</td>
                <td>
                  <button
                    className={`listarVehiculos-estado-toggle ${
                      vehiculo.estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
                    }`}
                    onClick={() => cambiarEstado(vehiculo.id, vehiculo.estado)}
                    title={`Estado: ${vehiculo.estado} - Click para cambiar`}
                  >
                    {vehiculo.estado?.toLowerCase() === "activo" ? (
                      <FaToggleOn className="listarVehiculos-toggle-icon" />
                    ) : (
                      <FaToggleOff className="listarVehiculos-toggle-icon" />
                    )}
                    <span className="listarVehiculos-estado-text">{vehiculo.estado}</span>
                  </button>
                </td>
                <td className="listarVehiculos-actions">
                   <button
                    className="listarVehiculos-action-button detail"
                    onClick={() => navigate(`/vehiculos/detalle/${vehiculo.id}`)}
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button> 
                  <button
                    className="listarVehiculos-action-button edit"
                    onClick={() => navigate(`/vehiculos/editar/${vehiculo.id}`)}
                    title="Editar vehículo"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="listarVehiculos-action-button delete"
                    onClick={() => eliminarVehiculo(vehiculo.id)}
                    title="Eliminar vehículo"
                  >
                    <FaTrash />
                  </button>
                 
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {vehiculosFiltrados.length === 0 && (
          <div className="listarVehiculos-no-results">
            <FaExclamationTriangle className="listarVehiculos-no-results-icon" />
            <p>No se encontraron vehículos con los criterios de búsqueda.</p>
          </div>
        )}

        {/* Paginación */}
        {vehiculosFiltrados.length > vehiculosPorPagina && (
          <div className="listarVehiculos-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarVehiculos-pagination-button"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listarVehiculos-pagination-button ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="listarVehiculos-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarVehiculos

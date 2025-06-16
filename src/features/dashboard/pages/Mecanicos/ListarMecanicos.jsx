"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaExclamationTriangle,
  FaPlus,
  FaToggleOn,
  FaToggleOff,
  FaTools,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Usuarios/ListarUsuarios.css"

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

const ListarMecanicos = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [mecanicos, setMecanicos] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [mecanicosPorPagina] = useState(4)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    cargarMecanicos()
    return () => {
      document.body.style.background = ""
    }
  }, [])

  const cargarMecanicos = async () => {
    try {
      setCargando(true)
      const data = await makeRequest("/mecanicos")
      if (data) {
        setMecanicos(data)
      }
    } catch (error) {
      console.error("Error al cargar mecánicos:", error)
      Swal.fire("Error", "No se pudieron cargar los mecánicos", "error")
    } finally {
      setCargando(false)
    }
  }

  const eliminarMecanico = useCallback(
    async (id) => {
      if (!id) {
        Swal.fire("Error", "ID de mecánico inválido", "error")
        return
      }

      const result = await Swal.fire({
        title: "¿Eliminar mecánico?",
        text: "Esta acción eliminará al mecánico permanentemente y no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) return

      try {
        await makeRequest(`/mecanicos/${id}`, {
          method: "DELETE",
        })

        setMecanicos((prev) => prev.filter((mecanico) => mecanico.id !== id))

        Swal.fire({
          icon: "success",
          title: "Mecánico eliminado",
          text: "El mecánico ha sido eliminado correctamente",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al eliminar mecánico:", error)
        Swal.fire("Error", "No se pudo eliminar el mecánico", "error")
      }
    },
    [makeRequest],
  )

  const cambiarEstado = useCallback(
    async (id, estadoActual) => {
      try {
        const nuevoEstado = estadoActual?.toLowerCase() === "activo" ? "Inactivo" : "Activo"

        const result = await Swal.fire({
          title: `¿Cambiar estado a ${nuevoEstado}?`,
          text: `El mecánico será marcado como ${nuevoEstado.toLowerCase()}`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Sí, cambiar",
          cancelButtonText: "Cancelar",
        })

        if (!result.isConfirmed) return

        await makeRequest(`/mecanicos/${id}/cambiar-estado`, {
          method: "PUT",
        })

        setMecanicos((prev) => prev.map((m) => (m.id === id ? { ...m, estado: nuevoEstado } : m)))

        Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          text: `El mecánico ahora está ${nuevoEstado.toLowerCase()}`,
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al cambiar estado:", error)
        Swal.fire("Error", "No se pudo cambiar el estado del mecánico", "error")
      }
    },
    [makeRequest],
  )

  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }, [])

  const mecanicosFiltrados = mecanicos.filter((mecanico) => {
    const matchBusqueda = Object.values(mecanico).some((val) => String(val).toLowerCase().includes(busqueda))
    const matchEstado = estadoFiltro === "" || mecanico.estado === estadoFiltro

    return matchBusqueda && matchEstado
  })

  // Paginación
  const indiceUltimoMecanico = paginaActual * mecanicosPorPagina
  const indicePrimerMecanico = indiceUltimoMecanico - mecanicosPorPagina
  const mecanicosActuales = mecanicosFiltrados.slice(indicePrimerMecanico, indiceUltimoMecanico)
  const totalPaginas = Math.ceil(mecanicosFiltrados.length / mecanicosPorPagina)

  if (cargando) {
    return (
      <div className="listarUsuarios-container">
        <div className="listarUsuarios-loading">
          <div className="listarUsuarios-spinner"></div>
          <p>Cargando mecánicos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarUsuarios-container">
      <div className="listarUsuarios-header">
        <div className="listarUsuarios-title-section">
          <h1 className="listarUsuarios-page-title">
            <FaTools className="listarUsuarios-title-icon" />
            Gestión de Mecánicos
          </h1>
          <p className="listarUsuarios-subtitle">Administra los mecánicos del taller</p>
        </div>
        <button className="listarUsuarios-create-button" onClick={() => navigate("/CrearMecanicos")}>
          <FaPlus className="listarUsuarios-button-icon" />
          Crear Mecánico
        </button>
      </div>

      {/* Filtros */}
      <div className="listarUsuarios-filters-container">
        <div className="listarUsuarios-filter-item">
          <label className="listarUsuarios-filter-label">Buscar:</label>
          <div className="listarUsuarios-search-container">
            <FaSearch className="listarUsuarios-search-icon" />
            <input
              type="text"
              className="listarUsuarios-search-input"
              placeholder="Buscar por cualquier campo..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarUsuarios-filter-item">
          <label className="listarUsuarios-filter-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarUsuarios-filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="listarUsuarios-table-container">
        <table className="listarUsuarios-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Documento</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Teléfono Emergencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mecanicosActuales.map((mecanico) => (
              <tr key={mecanico.id}>
                <td>
                  <div className="listarUsuarios-user-info">
                    <span className="listarUsuarios-user-name">
                      {mecanico.nombre} {mecanico.apellido}
                    </span>
                    <span className="listarUsuarios-user-doc-type">{mecanico.tipo_documento}</span>
                  </div>
                </td>
                <td>{mecanico.documento}</td>
                <td>{mecanico.direccion}</td>
                <td>{mecanico.telefono}</td>
                <td>{mecanico.telefono_emergencia}</td>
                <td>
                  <button
                    className={`listarUsuarios-estado-toggle ${
                      mecanico.estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
                    }`}
                    onClick={() => cambiarEstado(mecanico.id, mecanico.estado)}
                    title={`Estado: ${mecanico.estado} - Click para cambiar`}
                  >
                    {mecanico.estado?.toLowerCase() === "activo" ? (
                      <FaToggleOn className="listarUsuarios-toggle-icon" />
                    ) : (
                      <FaToggleOff className="listarUsuarios-toggle-icon" />
                    )}
                    <span className="listarUsuarios-estado-text">{mecanico.estado}</span>
                  </button>
                </td>
                <td className="listarUsuarios-actions">
                  <button
                    className="listarUsuarios-action-button detail"
                    onClick={() => navigate(`/Mecanicos/detalle/${mecanico.id}`)}
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="listarUsuarios-action-button edit"
                    onClick={() => navigate(`/Mecanicos/editar/${mecanico.id}`)}
                    title="Editar mecánico"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="listarUsuarios-action-button delete"
                    onClick={() => eliminarMecanico(mecanico.id)}
                    title="Eliminar mecánico"
                  >
                    <FaTrash />
                  </button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {mecanicosFiltrados.length === 0 && (
          <div className="listarUsuarios-no-results">
            <FaExclamationTriangle className="listarUsuarios-no-results-icon" />
            <p>No se encontraron mecánicos con los criterios de búsqueda.</p>
          </div>
        )}

        {/* Paginación */}
        {mecanicosFiltrados.length > mecanicosPorPagina && (
          <div className="listarUsuarios-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarUsuarios-pagination-button"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listarUsuarios-pagination-button ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="listarUsuarios-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarMecanicos

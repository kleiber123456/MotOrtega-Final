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
  FaUserShield,
  FaUsers,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Roles/ListarRoles.css"

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

const ListarRoles = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [roles, setRoles] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [rolesPorPagina] = useState(6)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    cargarRoles()
    return () => {
      document.body.style.background = ""
    }
  }, [])

  const cargarRoles = async () => {
    try {
      setCargando(true)
      const data = await makeRequest("/roles")
      if (data) {
        setRoles(data)
      }
    } catch (error) {
      console.error("Error al cargar roles:", error)
      Swal.fire("Error", "No se pudieron cargar los roles", "error")
    } finally {
      setCargando(false)
    }
  }

  const eliminarRol = useCallback(
    async (id, nombreRol) => {
      if (!id) {
        Swal.fire("Error", "ID de rol inválido", "error")
        return
      }

      const result = await Swal.fire({
        title: "¿Eliminar rol?",
        text: `Esta acción eliminará el rol "${nombreRol}" permanentemente y no se puede deshacer.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) return

      try {
        await makeRequest(`/roles/${id}`, {
          method: "DELETE",
        })

        setRoles((prev) => prev.filter((rol) => rol.id !== id))

        Swal.fire({
          icon: "success",
          title: "Rol eliminado",
          text: "El rol ha sido eliminado correctamente",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al eliminar rol:", error)
        Swal.fire("Error", "No se pudo eliminar el rol", "error")
      }
    },
    [makeRequest],
  )

  const cambiarEstado = useCallback(
    async (id, estadoActual, nombreRol) => {
      try {
        const nuevoEstado = estadoActual?.toLowerCase() === "activo" ? "Inactivo" : "Activo"

        const result = await Swal.fire({
          title: `¿Cambiar estado a ${nuevoEstado}?`,
          text: `El rol "${nombreRol}" será marcado como ${nuevoEstado.toLowerCase()}`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Sí, cambiar",
          cancelButtonText: "Cancelar",
        })

        if (!result.isConfirmed) return

        await makeRequest(`/roles/${id}/cambiar-estado`, {
          method: "PUT",
          body: JSON.stringify({ estado: nuevoEstado }),
        })

        setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, estado: nuevoEstado } : r)))

        Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          text: `El rol ahora está ${nuevoEstado.toLowerCase()}`,
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al cambiar estado:", error)
        Swal.fire("Error", "No se pudo cambiar el estado del rol", "error")
      }
    },
    [makeRequest],
  )

  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }, [])

  // Filtrar roles
  const rolesFiltrados = roles.filter((rol) => {
    const matchNombre = rol.nombre && rol.nombre.toLowerCase().includes(busqueda)
    const matchDescripcion = rol.descripcion && rol.descripcion.toLowerCase().includes(busqueda)

    const matchBusqueda = matchNombre || matchDescripcion
    const matchEstado = estadoFiltro === "" || rol.estado === estadoFiltro

    return matchBusqueda && matchEstado
  })

  // Paginación
  const indiceUltimoRol = paginaActual * rolesPorPagina
  const indicePrimerRol = indiceUltimoRol - rolesPorPagina
  const rolesActuales = rolesFiltrados.slice(indicePrimerRol, indiceUltimoRol)
  const totalPaginas = Math.ceil(rolesFiltrados.length / rolesPorPagina)

  // Obtener tipos únicos para el filtro
  const tiposUnicos = [...new Set(roles.map((r) => r.tipo).filter(Boolean))]

  if (cargando) {
    return (
      <div className="listarRoles-container">
        <div className="listarRoles-loading">
          <div className="listarRoles-spinner"></div>
          <p>Cargando roles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarRoles-container">
      <div className="listarRoles-header">
        <div className="listarRoles-title-section">
          <h1 className="listarRoles-page-title">
            <FaUserShield className="listarRoles-title-icon" />
            Gestión de Roles
          </h1>
          <p className="listarRoles-subtitle">Administra los roles y permisos del sistema</p>
        </div>
        <button className="listarRoles-create-button" onClick={() => navigate("/CrearRoles")}>
          <FaPlus className="listarRoles-button-icon" />
          Crear Rol
        </button>
      </div>

      {/* Filtros */}
      <div className="listarRoles-filters-container">
        <div className="listarRoles-filter-item">
          <label className="listarRoles-filter-label">Buscar:</label>
          <div className="listarRoles-search-container">
            <FaSearch className="listarRoles-search-icon" />
            <input
              type="text"
              className="listarRoles-search-input"
              placeholder="Buscar por nombre, descripción o tipo..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarRoles-filter-item">
          <label className="listarRoles-filter-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarRoles-filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="listarRoles-table-container">
        <table className="listarRoles-table">
          <thead>
            <tr>
              <th>Nombre del Rol</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rolesActuales.map((rol) => (
              <tr key={rol.id}>
                <td>
                  <div className="listarRoles-role-info">
                    <span className="listarRoles-role-name">{rol.nombre || "Sin nombre"}</span>
                  </div>
                </td>
                <td>
                  <div className="listarRoles-descripcion" title={rol.descripcion || "Sin descripción"}>
                    {rol.descripcion || "Sin descripción"}
                  </div>
                </td>
                <td>
                  <div className="listarRoles-usuarios">
                    <FaUsers className="listarRoles-usuarios-icon" />
                    <span>{rol.usuarios_asignados || 0} usuarios</span>
                  </div>
                </td>
                <td>
                  <button
                    className={`listarRoles-estado-toggle ${
                      rol.estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
                    }`}
                    onClick={() => cambiarEstado(rol.id, rol.estado, rol.nombre)}
                    title={`Estado: ${rol.estado} - Click para cambiar`}
                  >
                    {rol.estado?.toLowerCase() === "activo" ? (
                      <FaToggleOn className="listarRoles-toggle-icon" />
                    ) : (
                      <FaToggleOff className="listarRoles-toggle-icon" />
                    )}
                    <span className="listarRoles-estado-text">{rol.estado}</span>
                  </button>
                </td>
                <td className="listarRoles-actions">
                  <button
                    className="listarRoles-action-button detail"
                    onClick={() => navigate(`/DetalleRol/${rol.id}`)}
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="listarRoles-action-button edit"
                    onClick={() => navigate(`/EditarRol/${rol.id}`)}
                    title="Editar rol"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="listarRoles-action-button delete"
                    onClick={() => eliminarRol(rol.id, rol.nombre)}
                    title="Eliminar rol"
                  >
                    <FaTrash />
                  </button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rolesFiltrados.length === 0 && (
          <div className="listarRoles-no-results">
            <FaExclamationTriangle className="listarRoles-no-results-icon" />
            <p>No se encontraron roles con los criterios de búsqueda.</p>
          </div>
        )}

        {/* Paginación */}
        {rolesFiltrados.length > rolesPorPagina && (
          <div className="listarRoles-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarRoles-pagination-button"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listarRoles-pagination-button ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="listarRoles-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarRoles

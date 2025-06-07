"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaUser,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaExclamationTriangle,
  FaPlus,
  FaToggleOn,
  FaToggleOff,
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

const ListarUsuarios = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [rolFiltro, setRolFiltro] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [usuariosPorPagina] = useState(4)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    cargarUsuarios()
    return () => {
      document.body.style.background = ""
    }
  }, [])

  const cargarUsuarios = async () => {
    try {
      setCargando(true)
      const data = await makeRequest("/usuarios")
      if (data) {
        setUsuarios(data)
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      Swal.fire("Error", "No se pudieron cargar los usuarios", "error")
    } finally {
      setCargando(false)
    }
  }

  const eliminarUsuario = useCallback(
    async (id) => {
      if (!id) {
        Swal.fire("Error", "ID de usuario inválido", "error")
        return
      }

      const result = await Swal.fire({
        title: "¿Eliminar usuario?",
        text: "Esta acción eliminará al usuario permanentemente y no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) return

      try {
        await makeRequest(`/usuarios/${id}`, {
          method: "DELETE",
        })

        setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id))

        Swal.fire({
          icon: "success",
          title: "Usuario eliminado",
          text: "El usuario ha sido eliminado correctamente",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al eliminar usuario:", error)
        Swal.fire("Error", "No se pudo eliminar el usuario", "error")
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
          text: `El usuario será marcado como ${nuevoEstado.toLowerCase()}`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Sí, cambiar",
          cancelButtonText: "Cancelar",
        })

        if (!result.isConfirmed) return

        await makeRequest(`/usuarios/${id}/cambiar-estado`, {
          method: "PUT",
        })

        setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, estado: nuevoEstado } : u)))

        Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          text: `El usuario ahora está ${nuevoEstado.toLowerCase()}`,
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al cambiar estado:", error)
        Swal.fire("Error", "No se pudo cambiar el estado del usuario", "error")
      }
    },
    [makeRequest],
  )

  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }, [])

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchBusqueda = Object.values(usuario).some((val) => String(val).toLowerCase().includes(busqueda))
    const matchEstado = estadoFiltro === "" || usuario.estado === estadoFiltro
    const matchRol = rolFiltro === "" || usuario.rol_nombre === rolFiltro

    return matchBusqueda && matchEstado && matchRol
  })

  // Paginación
  const indiceUltimoUsuario = paginaActual * usuariosPorPagina
  const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina
  const usuariosActuales = usuariosFiltrados.slice(indicePrimerUsuario, indiceUltimoUsuario)
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina)

  // Obtener roles únicos para el filtro
  const rolesUnicos = [...new Set(usuarios.map((u) => u.rol_nombre).filter(Boolean))]

  if (cargando) {
    return (
      <div className="listarUsuarios-container">
        <div className="listarUsuarios-loading">
          <div className="listarUsuarios-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarUsuarios-container">
      <div className="listarUsuarios-header">
        <div className="listarUsuarios-title-section">
          <h1 className="listarUsuarios-page-title">
            <FaUser className="listarUsuarios-title-icon" />
            Gestión de Usuarios
          </h1>
          <p className="listarUsuarios-subtitle">Administra los usuarios del sistema</p>
        </div>
        <button className="listarUsuarios-create-button" onClick={() => navigate("/crearUsuarios")}>
          <FaPlus className="listarUsuarios-button-icon" />
          Crear Usuario
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

        <div className="listarUsuarios-filter-item">
          <label className="listarUsuarios-filter-label">Rol:</label>
          <select
            value={rolFiltro}
            onChange={(e) => {
              setRolFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarUsuarios-filter-select"
          >
            <option value="">Todos los roles</option>
            {rolesUnicos.map((rol) => (
              <option key={rol} value={rol}>
                {rol}
              </option>
            ))}
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
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosActuales.map((usuario) => (
              <tr key={usuario.id}>
                <td>
                  <div className="listarUsuarios-user-info">
                    <span className="listarUsuarios-user-name">
                      {usuario.nombre} {usuario.apellido}
                    </span>
                    <span className="listarUsuarios-user-doc-type">{usuario.tipo_documento}</span>
                  </div>
                </td>
                <td>{usuario.documento}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.telefono}</td>
                <td>
                  <span className="listarUsuarios-rol-badge">{usuario.rol_nombre || "Sin rol"}</span>
                </td>
                <td>
                  <button
                    className={`listarUsuarios-estado-toggle ${
                      usuario.estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
                    }`}
                    onClick={() => cambiarEstado(usuario.id, usuario.estado)}
                    title={`Estado: ${usuario.estado} - Click para cambiar`}
                  >
                    {usuario.estado?.toLowerCase() === "activo" ? (
                      <FaToggleOn className="listarUsuarios-toggle-icon" />
                    ) : (
                      <FaToggleOff className="listarUsuarios-toggle-icon" />
                    )}
                    <span className="listarUsuarios-estado-text">{usuario.estado}</span>
                  </button>
                </td>
                <td className="listarUsuarios-actions">
                  <button
                    className="listarUsuarios-action-button edit"
                    onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                    title="Editar usuario"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="listarUsuarios-action-button delete"
                    onClick={() => eliminarUsuario(usuario.id)}
                    title="Eliminar usuario"
                  >
                    <FaTrash />
                  </button>
                  <button
                    className="listarUsuarios-action-button detail"
                    onClick={() => navigate(`/usuarios/detalle/${usuario.id}`)}
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuariosFiltrados.length === 0 && (
          <div className="listarUsuarios-no-results">
            <FaExclamationTriangle className="listarUsuarios-no-results-icon" />
            <p>No se encontraron usuarios con los criterios de búsqueda.</p>
          </div>
        )}

        {/* Paginación */}
        {usuariosFiltrados.length > usuariosPorPagina && (
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

export default ListarUsuarios

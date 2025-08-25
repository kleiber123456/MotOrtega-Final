"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaUserShield,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaToggleOn,
  FaToggleOff,
  FaSortAlphaDown,
  FaSortAlphaUp,
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

  // Estados principales
  const [roles, setRoles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Estados para filtros y búsqueda
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("Todos")
    const [ordenAscendente, setOrdenAscendente] = useState(true)

  // Estados para paginación - CAMBIÉ A 3 PARA QUE SE VEA LA PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1)
  const [elementosPorPagina] = useState(5)

  // NUEVO
  const [usuarios, setUsuarios] = useState([])

  // Cargar roles
  const cargarRoles = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await makeRequest("/roles")
      if (data && Array.isArray(data)) {
        setRoles(data)
      } 
    } catch (error) {
      console.error("Error al cargar roles:", error)
      setError(error.message || "Error al cargar los roles")

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los roles. Por favor intenta nuevamente.",
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setCargando(false)
    }
  }, [makeRequest])

  // Cargar usuarios
  const cargarUsuarios = useCallback(async () => {
    try {
      const data = await makeRequest("/usuarios")
      if (data && Array.isArray(data)) {
        setUsuarios(data)
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
    }
  }, [makeRequest])

  // Cargar roles y usuarios al montar el componente
  useEffect(() => {
    cargarRoles()
    cargarUsuarios()
  }, [cargarRoles, cargarUsuarios])

  // Filtrar roles según búsqueda y estado
  const rolesFiltrados = useMemo(() => {
    let filtrados = roles.filter((rol) => {
      const coincideBusqueda =
        rol.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        rol.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      const coincideEstado = filtroEstado === "Todos" || rol.estado === filtroEstado
      return coincideBusqueda && coincideEstado
    })
    filtrados = filtrados.sort((a, b) => {
      if (!a.nombre || !b.nombre) return 0
      return ordenAscendente
        ? a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        : b.nombre.localeCompare(a.nombre, 'es', { sensitivity: 'base' })
    })
    return filtrados
  }, [roles, busqueda, filtroEstado, ordenAscendente])

  // Calcular paginación
  const totalElementos = rolesFiltrados.length
  const totalPaginas = Math.ceil(totalElementos / elementosPorPagina)
  const indiceInicio = (paginaActual - 1) * elementosPorPagina
  const indiceFin = indiceInicio + elementosPorPagina
  const rolesEnPagina = rolesFiltrados.slice(indiceInicio, indiceFin)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda, filtroEstado])

  // Funciones de paginación
  const irAPagina = useCallback(
    (pagina) => {
      if (pagina >= 1 && pagina <= totalPaginas) {
        setPaginaActual(pagina)
      }
    },
    [totalPaginas],
  )

  // Manejar búsqueda
  const handleBusquedaChange = useCallback((e) => {
    setBusqueda(e.target.value)
  }, [])

  // Manejar filtro de estado
  const handleFiltroEstadoChange = useCallback((e) => {
    setFiltroEstado(e.target.value)
  }, [])

  // Navegar a crear rol
  const handleCrearRol = useCallback(() => {
    navigate("/CrearRoles")
  }, [navigate])

  // Cambiar estado
  const cambiarEstado = async (id, estado, nombre) => {
    if (nombre?.toLowerCase() === "administrador") {
      await Swal.fire({
        icon: "warning",
        title: "Acción no permitida",
        text: "No puedes desactivar el rol Administrador.",
        confirmButtonColor: "#ef4444",
      })
      return
    }

    // Buscar si hay usuarios con este rol
    const tieneUsuarios = usuarios.some(
      (u) => u.rol_nombre && u.rol_nombre.toLowerCase() === nombre?.toLowerCase()
    )
    if (tieneUsuarios) {
      await Swal.fire({
        icon: "warning",
        title: "Acción no permitida",
        text: `No puedes desactivar el rol ${nombre} porque tiene usuarios asociados.`,
        confirmButtonColor: "#ef4444",
      })
      return
    }

    const nuevoEstado = estado === "Activo" ? "Inactivo" : "Activo"
    const result = await Swal.fire({
      title: "¿Cambiar estado?",
      text: `¿Deseas cambiar el estado del rol ${nombre} a ${nuevoEstado}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        await makeRequest(`/roles/${id}/cambiar-estado`, {
          method: "PUT",
        })
        Swal.fire("Actualizado!", `El rol ha cambiado a ${nuevoEstado}.`, "success")
        cargarRoles()
        cargarUsuarios()
      } catch (error) {
        console.error("Error al cambiar el estado del rol:", error)
        Swal.fire("Error!", "No se pudo cambiar el estado del rol.", "error")
      }
    }
  }

  const eliminarRol = async (id, nombre) => {
    // Buscar si hay usuarios con este rol
    const tieneUsuarios = usuarios.some(
      (u) => u.rol_nombre && u.rol_nombre.toLowerCase() === nombre?.toLowerCase()
    )
    if (tieneUsuarios) {
      await Swal.fire({
        icon: "warning",
        title: "Acción no permitida",
        text: `No puedes eliminar el rol ${nombre} porque tiene usuarios asociados.`,
        confirmButtonColor: "#ef4444",
      })
      return
    }

    if (nombre?.toLowerCase() === "administrador") {
      await Swal.fire({
        icon: "warning",
        title: "Acción no permitida",
        text: "No puedes eliminar el rol de Administrador.",
        confirmButtonColor: "#ef4444",
      })
      return
    }

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar el rol ${nombre}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        await makeRequest(`/roles/${id}`, {
          method: "DELETE",
        })
        Swal.fire("Eliminado!", "El rol ha sido eliminado.", "success")
        cargarRoles()
        cargarUsuarios()
      } catch (error) {
        console.error("Error al eliminar el rol:", error)
        Swal.fire("Error!", "No se pudo eliminar el rol.", "error")
      }
    }
  }

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
      {/* Header */}
      <div className="listarRoles-header">
        <div className="listarRoles-title-section">
          <h1 className="listarRoles-page-title">
            <FaUserShield className="listarRoles-title-icon" />
            Gestión de Roles
          </h1>
          <p className="listarRoles-subtitle">Administra los roles y permisos del sistema</p>
        </div>
        <button className="listarRoles-create-button" onClick={handleCrearRol}>
          <FaPlus className="listarRoles-button-icon" />
          Crear Rol
        </button>
      </div>

      {/* Filtros */}
      <div className="listarRoles-filters-container">
        <div className="listarRoles-filter-item">
          <label className="listarRoles-filter-label">Buscar</label>
          <div className="listarRoles-search-container">
            <FaSearch className="listarRoles-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={busqueda}
              onChange={handleBusquedaChange}
              className="listarRoles-search-input"
            />
          </div>
        </div>

        <div className="listarRoles-filter-item">
          <label className="listarRoles-filter-label">Estado</label>
          <select value={filtroEstado} onChange={handleFiltroEstadoChange} className="listarRoles-filter-select">
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>
          <div className="listarRoles-filter-item">
            <label className="listarRoles-filter-label">Ordenar:</label>
            <button
              className="listarRoles-sort-button"
              onClick={() => setOrdenAscendente((prev) => !prev)}
              title={`Ordenar ${ordenAscendente ? "descendente" : "ascendente"}`}
            >
              {ordenAscendente ? (
                <>
                  <FaSortAlphaDown className="listarRoles-sort-icon" />
                  Ascendente
                </>
              ) : (
                <>
                  <FaSortAlphaUp className="listarRoles-sort-icon" />
                  Descendente
                </>
              )}
            </button>
          </div>
      </div>

      {/* Tabla */}
      {rolesEnPagina.length === 0 ? (
        <div className="listarRoles-no-results">
          <FaUserShield className="listarRoles-no-results-icon" />
          <p>
            {busqueda || filtroEstado !== "Todos"
              ? "No se encontraron roles que coincidan con los filtros aplicados."
              : "Aún no hay roles creados en el sistema."}
          </p>
        </div>
      ) : (
        <>
          <div className="listarRoles-table-container">
            <table className="listarRoles-table">
              <thead>
                <tr>
                  
                  <th>Nombre del Rol</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rolesEnPagina.map((rol) => (
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
  {rol.nombre?.toLowerCase() !== "administrador" && (
    <button
      type="button"
      className={`listarRoles-estado-toggle ${
        rol.estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
      }`}
      onClick={e => {
        e.preventDefault()
        cambiarEstado(
          rol.id,
          rol.estado,
          rol.nombre,
          rol.usuariosAsociados || rol.cantidadUsuarios || 0
        )
      }}
      title={`Estado: ${rol.estado} - Click para cambiar`}
      disabled={
        (rol.usuariosAsociados && rol.usuariosAsociados > 0) ||
        (rol.cantidadUsuarios && rol.cantidadUsuarios > 0)
      }
    >
      {rol.estado?.toLowerCase() === "activo" ? (
        <FaToggleOn className="listarRoles-toggle-icon" />
      ) : (
        <FaToggleOff className="listarRoles-toggle-icon" />
      )}
      <span className="listarRoles-estado-text">{rol.estado}</span>
    </button>
  )}
  {/* Si es administrador, no mostrar nada */}
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
                      {rol.nombre?.toLowerCase() !== "administrador" && (
    <button
      className="listarRoles-action-button delete"
      onClick={() => eliminarRol(rol.id, rol.nombre, rol.usuariosAsociados || rol.cantidadUsuarios || 0)}
      title="Eliminar rol"
      disabled={
        (rol.usuariosAsociados && rol.usuariosAsociados > 0) ||
        (rol.cantidadUsuarios && rol.cantidadUsuarios > 0)
      }
    >
      <FaTrash />
    </button>
  )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación - SIEMPRE SE MUESTRA SI HAY MÁS DE 1 PÁGINA */}
          {totalPaginas > 1 && (
            <div className="listarRoles-pagination">
              <button
                onClick={() => irAPagina(1)}
                disabled={paginaActual === 1}
                className="listarRoles-pagination-button"
                title="Primera página"
              >
                <FaAngleDoubleLeft />
              </button>

              <button
                onClick={() => irAPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="listarRoles-pagination-button"
                title="Página anterior"
              >
                <FaChevronLeft />
              </button>

              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                let pageNumber
                if (totalPaginas <= 5) {
                  pageNumber = i + 1
                } else if (paginaActual <= 5) {
                  pageNumber = i + 1
                } else if (paginaActual >= totalPaginas - 5) {
                  pageNumber = totalPaginas - 4 + i
                } else {
                  pageNumber = paginaActual - 2 + i
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => irAPagina(pageNumber)}
                    className={`listarRoles-pagination-button ${pageNumber === paginaActual ? "active" : ""}`}
                  >
                    {pageNumber}
                  </button>
                )
              })}

              <button
                onClick={() => irAPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="listarRoles-pagination-button"
                title="Página siguiente"
              >
                <FaChevronRight />
              </button>

              <button
                onClick={() => irAPagina(totalPaginas)}
                disabled={paginaActual === totalPaginas}
                className="listarRoles-pagination-button"
                title="Última página"
              >
                <FaAngleDoubleRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ListarRoles

"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaCog,
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
import "../../../../shared/styles/Servicios/ListarServicios.css"

const ListarServicios = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [servicios, setServicios] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
    const [ordenAscendente, setOrdenAscendente] = useState(true)
  const [paginaActual, setPaginaActual] = useState(1)
  const [serviciosPorPagina] = useState(5)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    cargarServicios()
    return () => {
      document.body.style.background = ""
    }
  }, [])

  const cargarServicios = async () => {
    try {
      setCargando(true)
      const response = await fetch("https://api-final-8rw7.onrender.com/api/servicios", {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar servicios")
      }

      const data = await response.json()
      setServicios(data)
    } catch (error) {
      console.error("Error al cargar servicios:", error)
      Swal.fire("Error", "No se pudieron cargar los servicios", "error")
    } finally {
      setCargando(false)
    }
  }

  const eliminarServicio = useCallback(
    async (id) => {
      if (!id) {
        Swal.fire("Error", "ID de servicio inválido", "error")
        return
      }

      const result = await Swal.fire({
        title: "¿Eliminar servicio?",
        text: "Esta acción eliminará el servicio permanentemente y no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) return

      try {
        const response = await fetch(`https://api-final-8rw7.onrender.com/api/servicios/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Error al eliminar servicio")
        }

        setServicios((prev) => prev.filter((servicio) => servicio.id !== id))

        Swal.fire({
          icon: "success",
          title: "Servicio eliminado",
          text: "El servicio ha sido eliminado correctamente",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al eliminar servicio:", error)
        Swal.fire("Error", "No se pudo eliminar el servicio", "error")
      }
    },
    [token],
  )

  const cambiarEstado = useCallback(
    async (id, estadoActual) => {
      // Buscar el servicio por id para obtener su nombre
      const servicio = servicios.find((s) => s.id === id)
      const nombreServicio = servicio ? servicio.nombre : "el servicio"

      try {
        const nuevoEstado = estadoActual?.toLowerCase() === "activo" ? "Inactivo" : "Activo"

        const result = await Swal.fire({
          title: `¿Cambiar estado a ${nuevoEstado}?`,
          text: `El servicio "${nombreServicio}" será marcado como ${nuevoEstado.toLowerCase()}`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Sí, cambiar",
          cancelButtonText: "Cancelar",
        })

        if (!result.isConfirmed) return

        const response = await fetch(`https://api-final-8rw7.onrender.com/api/servicios/${id}/cambiar-estado`, {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Error al cambiar estado")
        }

        setServicios((prev) => prev.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s)))

        Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          text: `El servicio "${nombreServicio}" ahora está ${nuevoEstado.toLowerCase()}`,
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al cambiar estado:", error)
        Swal.fire("Error", "No se pudo cambiar el estado del servicio", "error")
      }
    },
    [token, servicios],
  )

  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }, [])

  // Filtrar servicios
  let serviciosFiltrados = servicios.filter((servicio) => {
    const matchBusqueda = Object.values(servicio).some((val) => String(val).toLowerCase().includes(busqueda))
    const matchEstado = estadoFiltro === "" || servicio.estado === estadoFiltro
    return matchBusqueda && matchEstado
  })

  // Ordenar servicios por nombre
  serviciosFiltrados = serviciosFiltrados.sort((a, b) => {
    if (!a.nombre || !b.nombre) return 0
    return ordenAscendente
      ? a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      : b.nombre.localeCompare(a.nombre, 'es', { sensitivity: 'base' })
  })

  // Paginación
  const indiceUltimoServicio = paginaActual * serviciosPorPagina
  const indicePrimerServicio = indiceUltimoServicio - serviciosPorPagina
  const serviciosActuales = serviciosFiltrados.slice(indicePrimerServicio, indiceUltimoServicio)
  const totalPaginas = Math.ceil(serviciosFiltrados.length / serviciosPorPagina)

  if (cargando) {
    return (
      <div className="listarServicios-container">
        <div className="listarServicios-loading">
          <div className="listarServicios-spinner"></div>
          <p>Cargando servicios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarServicios-container">
      <div className="listarServicios-header">
        <div className="listarServicios-title-section">
          <h1 className="listarServicios-page-title">
            <FaCog className="listarServicios-title-icon" />
            Gestión de Servicios
          </h1>
          <p className="listarServicios-subtitle">Administra los servicios del sistema</p>
        </div>
        <button className="listarServicios-create-button" onClick={() => navigate("/crearServicios")}>
          <FaPlus className="listarServicios-button-icon" />
          Crear Servicio
        </button>
      </div>

      {/* Filtros */}
      <div className="listarServicios-filters-container">
        <div className="listarServicios-filter-item">
          <label className="listarServicios-filter-label">Buscar:</label>
          <div className="listarServicios-search-container">
            <FaSearch className="listarServicios-search-icon" />
            <input
              type="text"
              className="listarServicios-search-input"
              placeholder="Buscar por cualquier campo..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarServicios-filter-item">
          <label className="listarServicios-filter-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarServicios-filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <div className="listarServicios-filter-item">
          <label className="listarServicios-filter-label">Ordenar:</label>
          <button
            className="listarServicios-sort-button"
            onClick={() => setOrdenAscendente((prev) => !prev)}
            title={`Ordenar ${ordenAscendente ? "descendente" : "ascendente"}`}
          >
            {ordenAscendente ? (
              <>
                <FaSortAlphaDown className="listarServicios-sort-icon" />
                Ascendente
              </>
            ) : (
              <>
                <FaSortAlphaUp className="listarServicios-sort-icon" />
                Descendente
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="listarServicios-table-container">
        <table className="listarServicios-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {serviciosActuales.map((servicio) => (
              <tr key={servicio.id}>
                <td>
                  <div className="listarServicios-servicio-info">
                    <span className="listarServicios-servicio-name">{servicio.nombre}</span>
                    <span className="listarServicios-servicio-description">{servicio.descripcion}</span>
                  </div>
                </td>
                <td>
                  <span className="listarServicios-precio-badge">${servicio.precio?.toLocaleString()}</span>
                </td>
                <td>
                  <button
                    className={`listarServicios-estado-toggle ${
                      servicio.estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
                    }`}
                    onClick={() => cambiarEstado(servicio.id, servicio.estado)}
                    title={`Estado: ${servicio.estado} - Click para cambiar`}
                  >
                    {servicio.estado?.toLowerCase() === "activo" ? (
                      <FaToggleOn className="listarServicios-toggle-icon" />
                    ) : (
                      <FaToggleOff className="listarServicios-toggle-icon" />
                    )}
                    <span className="listarServicios-estado-text">{servicio.estado}</span>
                  </button>
                </td>
                <td className="listarServicios-actions">
                  <button
                    className="listarServicios-action-button detail"
                    onClick={() => navigate(`/servicios/detalle/${servicio.id}`)}
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="listarServicios-action-button edit"
                    onClick={() => navigate(`/servicios/editar/${servicio.id}`)}
                    title="Editar servicio"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="listarServicios-action-button delete"
                    onClick={() => eliminarServicio(servicio.id)}
                    title="Eliminar servicio"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {serviciosFiltrados.length === 0 && (
          <div className="listarServicios-no-results">
            <FaExclamationTriangle className="listarServicios-no-results-icon" />
            <p>No se encontraron servicios con los criterios de búsqueda.</p>
          </div>
        )}

        {/* Paginación */}
        {serviciosFiltrados.length > serviciosPorPagina && (
          <div className="listarServicios-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarServicios-pagination-button"
            >
              Anterior
            </button>

            {(() => {
              const pages = []
              const maxVisiblePages = 5

              if (totalPaginas <= maxVisiblePages) {
                // Si hay pocas páginas, mostrar todas
                for (let i = 1; i <= totalPaginas; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setPaginaActual(i)}
                      className={`listarServicios-pagination-button ${paginaActual === i ? "active" : ""}`}
                    >
                      {i}
                    </button>,
                  )
                }
              } else {
                // Si hay muchas páginas, mostrar paginación inteligente
                const startPage = Math.max(1, paginaActual - 2)
                const endPage = Math.min(totalPaginas, paginaActual + 2)

                // Primera página
                if (startPage > 1) {
                  pages.push(
                    <button key={1} onClick={() => setPaginaActual(1)} className="listarServicios-pagination-button">
                      1
                    </button>,
                  )
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="listarServicios-pagination-ellipsis">
                        ...
                      </span>,
                    )
                  }
                }

                // Páginas del rango actual
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setPaginaActual(i)}
                      className={`listarServicios-pagination-button ${paginaActual === i ? "active" : ""}`}
                    >
                      {i}
                    </button>,
                  )
                }

                // Última página
                if (endPage < totalPaginas) {
                  if (endPage < totalPaginas - 1) {
                    pages.push(
                      <span key="ellipsis2" className="listarServicios-pagination-ellipsis">
                        ...
                      </span>,
                    )
                  }
                  pages.push(
                    <button
                      key={totalPaginas}
                      onClick={() => setPaginaActual(totalPaginas)}
                      className="listarServicios-pagination-button"
                    >
                      {totalPaginas}
                    </button>,
                  )
                }
              }

              return pages
            })()}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="listarServicios-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarServicios

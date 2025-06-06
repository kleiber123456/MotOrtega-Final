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
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/listarServicios.css"

const ListarServicios = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [servicios, setServicios] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
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
      try {
        const nuevoEstado = estadoActual?.toLowerCase() === "activo" ? "Inactivo" : "Activo"

        const result = await Swal.fire({
          title: `¿Cambiar estado a ${nuevoEstado}?`,
          text: `El servicio será marcado como ${nuevoEstado.toLowerCase()}`,
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
          text: `El servicio ahora está ${nuevoEstado.toLowerCase()}`,
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al cambiar estado:", error)
        Swal.fire("Error", "No se pudo cambiar el estado del servicio", "error")
      }
    },
    [token],
  )

  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }, [])

  // Filtrar servicios
  const serviciosFiltrados = servicios.filter((servicio) => {
    const matchBusqueda = Object.values(servicio).some((val) => String(val).toLowerCase().includes(busqueda))
    const matchEstado = estadoFiltro === "" || servicio.estado === estadoFiltro

    return matchBusqueda && matchEstado
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
                  <button
                    className="listarServicios-action-button detail"
                    onClick={() => navigate(`/servicios/detalle/${servicio.id}`)}
                    title="Ver detalle"
                  >
                    <FaEye />
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

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listarServicios-pagination-button ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

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

"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaExclamationTriangle,
  FaEye,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Horarios/ListarHorarios.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const ListarHorarios = () => {
  const navigate = useNavigate()
  const [horarios, setHorarios] = useState([])
  const [mecanicos, setMecanicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")
  const [filtroMecanico, setFiltroMecanico] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [horariosPorPagina] = useState(4)

  const makeRequest = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token disponible")
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error)
      throw error
    }
  }

  // Función para calcular correctamente el día de la semana
  const calcularDiaSemana = (fechaStr) => {
    if (!fechaStr) return ""

    try {
      const fecha = new Date(fechaStr)
      if (isNaN(fecha.getTime())) {
        console.error("Fecha inválida:", fechaStr)
        return ""
      }

      const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
      return diasSemana[fecha.getDay()]
    } catch (error) {
      console.error("Error al calcular día de la semana:", error)
      return ""
    }
  }

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    cargarDatos()
    return () => {
      document.body.style.background = ""
    }
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [horariosResponse, mecanicosResponse] = await Promise.all([
        makeRequest("/horarios"),
        makeRequest("/mecanicos"),
      ])

      const horariosData = Array.isArray(horariosResponse) ? horariosResponse : horariosResponse.data || []
      const mecanicosData = Array.isArray(mecanicosResponse) ? mecanicosResponse : mecanicosResponse.data || []

      setHorarios(horariosData)
      setMecanicos(mecanicosData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      Swal.fire("Error", "No se pudieron cargar los datos", "error")
    } finally {
      setLoading(false)
    }
  }

  const eliminarHorario = async (id) => {
    if (!id) {
      Swal.fire("Error", "ID de horario inválido", "error")
      return
    }

    const result = await Swal.fire({
      title: "¿Eliminar novedad?",
      text: "Esta acción eliminará la novedad permanentemente y no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) return

    try {
      await makeRequest(`/horarios/${id}`, {
        method: "DELETE",
      })

      setHorarios((prev) => prev.filter((horario) => horario.id !== id))

      Swal.fire({
        icon: "success",
        title: "Novedad eliminada",
        text: "La novedad ha sido eliminada correctamente",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error al eliminar horario:", error)
      Swal.fire("Error", "No se pudo eliminar la novedad", "error")
    }
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case "Ausencia":
        return "#dc3545" // Rojo
      case "Llegada Tarde":
        return "#ffc107" // Amarillo
      case "Salida Temprana":
        return "#fd7e14" // Naranja
      case "Horario Especial":
        return "#6f42c1" // Púrpura
      default:
        return "#6c757d" // Gris
    }
  }

  const formatearHora = (hora) => {
    if (!hora) return "N/A"
    return hora.substring(0, 5)
  }

  const handleSearch = (e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }

  // Filtrar horarios
  const horariosFiltrados = horarios.filter((horario) => {
    const mecanico = mecanicos.find((m) => m.id === horario.mecanico_id)
    const nombreMecanico = mecanico ? `${mecanico.nombre} ${mecanico.apellido}` : ""

    const matchBusqueda =
      (horario.motivo || "").toLowerCase().includes(busqueda) ||
      nombreMecanico.toLowerCase().includes(busqueda) ||
      (horario.tipo_novedad || "").toLowerCase().includes(busqueda)

    const matchTipo = filtroTipo === "" || horario.tipo_novedad === filtroTipo
    const matchMecanico = filtroMecanico === "" || horario.mecanico_id === Number.parseInt(filtroMecanico)

    return matchBusqueda && matchTipo && matchMecanico
  })

  // Paginación
  const indiceUltimoHorario = paginaActual * horariosPorPagina
  const indicePrimerHorario = indiceUltimoHorario - horariosPorPagina
  const horariosActuales = horariosFiltrados.slice(indicePrimerHorario, indiceUltimoHorario)
  const totalPaginas = Math.ceil(horariosFiltrados.length / horariosPorPagina)

  // Obtener tipos únicos para el filtro
  const tiposUnicos = [...new Set(horarios.map((h) => h.tipo_novedad).filter(Boolean))]

  if (loading) {
    return (
      <div className="listarHorarios-container">
        <div className="listarHorarios-loading">
          <div className="listarHorarios-spinner"></div>
          <p>Cargando novedades de horario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarHorarios-container">
      <div className="listarHorarios-header">
        <div className="listarHorarios-title-section">
          <h1 className="listarHorarios-page-title">
            <FaClock className="listarHorarios-title-icon" />
            Gestión de Novedades de Horario
          </h1>
          <p className="listarHorarios-subtitle">Administra las excepciones al horario laboral normal</p>
        </div>
        <button className="listarHorarios-create-button" onClick={() => navigate("/CrearHorario")}>
          <FaPlus className="listarHorarios-button-icon" />
          Crear Novedad
        </button>
      </div>

      {/* Filtros */}
      <div className="listarHorarios-filters-container">
        <div className="listarHorarios-filter-item">
          <label className="listarHorarios-filter-label">Buscar:</label>
          <div className="listarHorarios-search-container">
            <FaSearch className="listarHorarios-search-icon" />
            <input
              type="text"
              className="listarHorarios-search-input"
              placeholder="Buscar por cualquier campo..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarHorarios-filter-item">
          <label className="listarHorarios-filter-label">Tipo de Novedad:</label>
          <select
            value={filtroTipo}
            onChange={(e) => {
              setFiltroTipo(e.target.value)
              setPaginaActual(1)
            }}
            className="listarHorarios-filter-select"
          >
            <option value="">Todos los tipos</option>
            {tiposUnicos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div className="listarHorarios-filter-item">
          <label className="listarHorarios-filter-label">Mecánico:</label>
          <select
            value={filtroMecanico}
            onChange={(e) => {
              setFiltroMecanico(e.target.value)
              setPaginaActual(1)
            }}
            className="listarHorarios-filter-select"
          >
            <option value="">Todos los mecánicos</option>
            {mecanicos.map((mecanico) => (
              <option key={mecanico.id} value={mecanico.id}>
                {mecanico.nombre} {mecanico.apellido}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="listarHorarios-table-container">
        <table className="listarHorarios-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Día</th>
              <th>Mecánico</th>
              <th>Tipo de Novedad</th>
              <th>Horario</th>
              <th>Motivo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {horariosActuales.map((horario) => {
              const mecanico = mecanicos.find((m) => m.id === horario.mecanico_id)
              const diaCorrecto = calcularDiaSemana(horario.fecha)

              return (
                <tr key={horario.id}>
                  <td>
                    <div className="listarHorarios-fecha-info">
                      <FaCalendarAlt />
                      {new Date(horario.fecha).toLocaleDateString("es-ES")}
                    </div>
                  </td>
                  <td>
                    <span className="listarHorarios-dia-badge">{diaCorrecto}</span>
                  </td>
                  <td>
                    <div className="listarHorarios-mecanico-info">
                      <FaUser />
                      {mecanico ? `${mecanico.nombre} ${mecanico.apellido}` : "N/A"}
                    </div>
                  </td>
                  <td>
                    <span
                      className="listarHorarios-tipo-badge"
                      style={{ backgroundColor: getTipoColor(horario.tipo_novedad) }}
                    >
                      {horario.tipo_novedad}
                    </span>
                  </td>
                  <td>
                    <div className="listarHorarios-horario-info">
                      {horario.tipo_novedad === "Ausencia" ? (
                        <span className="listarHorarios-ausencia">Todo el día</span>
                      ) : (
                        <span>
                          <FaClock /> {formatearHora(horario.hora_inicio)} - {formatearHora(horario.hora_fin)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="listarHorarios-motivo-cell" title={horario.motivo}>
                      {horario.motivo && horario.motivo.length > 50
                        ? `${horario.motivo.substring(0, 50)}...`
                        : horario.motivo || "Sin motivo"}
                    </div>
                  </td>
                  <td className="listarHorarios-actions">
                    <button
                      className="listarHorarios-action-button view"
                      onClick={() => navigate(`/DetalleHorario/${horario.id}`)}
                      title="Ver detalle"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="listarHorarios-action-button edit"
                      onClick={() => navigate(`/EditarHorario/${horario.id}`)}
                      title="Editar novedad"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="listarHorarios-action-button delete"
                      onClick={() => eliminarHorario(horario.id)}
                      title="Eliminar novedad"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {horariosFiltrados.length === 0 && (
          <div className="listarHorarios-no-results">
            <FaExclamationTriangle className="listarHorarios-no-results-icon" />
            <p>No se encontraron novedades de horario con los criterios de búsqueda.</p>
          </div>
        )}

        {/* Paginación */}
        {horariosFiltrados.length > horariosPorPagina && (
          <div className="listarHorarios-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarHorarios-pagination-button"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listarHorarios-pagination-button ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="listarHorarios-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarHorarios

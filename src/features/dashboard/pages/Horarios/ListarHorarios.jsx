"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../components/layout/layout.jsx"
import "../../../../shared/styles/Horarios/ListarHorarios.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const ListarHorarios = () => {
  const navigate = useNavigate()
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [filtroFecha, setFiltroFecha] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 10

  const makeRequest = useCallback(async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token disponible")
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
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
  }, [])

  const cargarHorarios = async () => {
    try {
      setLoading(true)
      const response = await makeRequest("/horarios")
      setHorarios(response.data || [])
    } catch (error) {
      console.error("Error al cargar horarios:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los horarios",
        confirmButtonColor: "#dc3545",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarHorarios()
  }, [])

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        setLoading(true)
        await makeRequest(`/horarios/${id}`, {
          method: "DELETE",
        })

        Swal.fire({
          icon: "success",
          title: "¡Eliminado!",
          text: "El horario ha sido eliminado correctamente",
          confirmButtonColor: "#28a745",
        })

        cargarHorarios()
      } catch (error) {
        console.error("Error al eliminar horario:", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el horario",
          confirmButtonColor: "#dc3545",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const formatearFecha = (fecha) => {
    const date = new Date(fecha)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatearHora = (hora) => {
    return hora.substring(0, 5)
  }

  const esFechaPasada = (fecha) => {
    const fechaHorario = new Date(fecha)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return fechaHorario < hoy
  }

  // Filtrado de horarios
  const horariosFiltrados = horarios.filter((horario) => {
    const cumpleBusqueda =
      busqueda === "" ||
      horario.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      formatearFecha(horario.fecha).toLowerCase().includes(busqueda.toLowerCase())

    const cumpleFecha = filtroFecha === "" || horario.fecha === filtroFecha

    return cumpleBusqueda && cumpleFecha
  })

  // Paginación
  const totalPaginas = Math.ceil(horariosFiltrados.length / itemsPorPagina)
  const horariosPaginados = horariosFiltrados.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina)

  const handlePaginaAnterior = () => {
    setPaginaActual((prev) => Math.max(prev - 1, 1))
  }

  const handlePaginaSiguiente = () => {
    setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
  }

  const handlePagina = (pagina) => {
    setPaginaActual(pagina)
  }

  return (
    <div className="listar-horarios-container">
      <div className="listar-horarios-header">
        <div className="header-content">
          <div className="header-title">
            <FaClock className="header-icon" />
            <h1>Gestión de Horarios</h1>
          </div>
          <button className="btn-nuevo" onClick={() => navigate("/dashboard/horarios/crear")} disabled={loading}>
            <FaPlus /> Nuevo Horario
          </button>
        </div>
      </div>

      <div className="listar-horarios-content">
        <div className="filtros-section">
          <div className="filtros-row">
            <div className="filtro-busqueda">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por descripción o fecha..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value)
                  setPaginaActual(1)
                }}
              />
            </div>

            <div className="filtro-fecha">
              <FaFilter className="filter-icon" />
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => {
                  setFiltroFecha(e.target.value)
                  setPaginaActual(1)
                }}
              />
            </div>

            <button
              className="btn-limpiar"
              onClick={() => {
                setBusqueda("")
                setFiltroFecha("")
                setPaginaActual(1)
              }}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        <div className="tabla-section">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando horarios...</p>
            </div>
          ) : horariosPaginados.length > 0 ? (
            <>
              <div className="tabla-container">
                <table className="horarios-tabla">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora Inicio</th>
                      <th>Hora Fin</th>
                      <th>Duración</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horariosPaginados.map((horario) => {
                      const fechaPasada = esFechaPasada(horario.fecha)
                      const [horaInicio, minutoInicio] = horario.hora_inicio.split(":").map(Number)
                      const [horaFin, minutoFin] = horario.hora_fin.split(":").map(Number)
                      const duracionMinutos = horaFin * 60 + minutoFin - (horaInicio * 60 + minutoInicio)
                      const duracionHoras = Math.floor(duracionMinutos / 60)
                      const duracionMinutosRestantes = duracionMinutos % 60

                      return (
                        <tr key={horario.id} className={fechaPasada ? "fecha-pasada" : ""}>
                          <td>
                            <div className="fecha-cell">
                              <FaCalendarAlt />
                              <span>{formatearFecha(horario.fecha)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="hora-cell">
                              <FaClock />
                              <span>{formatearHora(horario.hora_inicio)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="hora-cell">
                              <FaClock />
                              <span>{formatearHora(horario.hora_fin)}</span>
                            </div>
                          </td>
                          <td>
                            <span className="duracion">
                              {duracionHoras > 0 && `${duracionHoras}h `}
                              {duracionMinutosRestantes > 0 && `${duracionMinutosRestantes}m`}
                            </span>
                          </td>
                          <td>
                            <span className="descripcion">{horario.descripcion || "Sin descripción"}</span>
                          </td>
                          <td>
                            <span className={`estado ${fechaPasada ? "pasado" : "activo"}`}>
                              {fechaPasada ? "Pasado" : "Activo"}
                            </span>
                          </td>
                          <td>
                            <div className="acciones">
                              <button
                                className="btn-editar"
                                onClick={() => navigate(`/dashboard/horarios/editar/${horario.id}`)}
                                disabled={loading || fechaPasada}
                                title={fechaPasada ? "No se puede editar un horario pasado" : "Editar horario"}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn-eliminar"
                                onClick={() => handleEliminar(horario.id)}
                                disabled={loading || fechaPasada}
                                title={fechaPasada ? "No se puede eliminar un horario pasado" : "Eliminar horario"}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <div className="paginacion">
                  <button className="btn-paginacion" onClick={handlePaginaAnterior} disabled={paginaActual === 1}>
                    <FaChevronLeft />
                  </button>

                  <div className="paginas">
                    {Array.from({ length: totalPaginas }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`btn-pagina ${paginaActual === i + 1 ? "activa" : ""}`}
                        onClick={() => handlePagina(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    className="btn-paginacion"
                    onClick={handlePaginaSiguiente}
                    disabled={paginaActual === totalPaginas}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}

              <div className="resultados-info">
                <p>
                  Mostrando {horariosPaginados.length} de {horariosFiltrados.length} horarios
                  {busqueda || filtroFecha ? " (filtrados)" : ""}
                </p>
              </div>
            </>
          ) : (
            <div className="no-horarios">
              <FaExclamationTriangle className="no-horarios-icon" />
              <h3>No hay horarios disponibles</h3>
              <p>
                {busqueda || filtroFecha
                  ? "No se encontraron horarios con los filtros aplicados"
                  : "Aún no has creado ningún horario"}
              </p>
              {!busqueda && !filtroFecha && (
                <button className="btn-crear-primero" onClick={() => navigate("/dashboard/horarios/crear")}>
                  <FaPlus /> Crear Primer Horario
                </button>
              )}
            </div>
          )}
        </div>

        <div className="info-section">
          <div className="info-card">
            <h3>
              <FaInfoCircle /> Información sobre Horarios
            </h3>
            <ul>
              <li>Los horarios definen las franjas de tiempo disponibles para citas</li>
              <li>Los horarios pasados no se pueden editar ni eliminar</li>
              <li>Cada horario puede tener una descripción opcional</li>
              <li>Los mecánicos pueden tener citas programadas dentro de estos horarios</li>
              <li>Se recomienda crear horarios con anticipación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListarHorarios

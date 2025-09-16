"use client"

import { useState, useEffect } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/es"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import "../../../../shared/styles/Citas/ListarCitas.css"
import { FaPlus, FaEye, FaTrash, FaCalendarAlt, FaList } from "react-icons/fa"
import Swal from "sweetalert2"

// Configurar localización en español
moment.locale("es")
const localizer = momentLocalizer(moment)

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Suprimir warnings de JSX transform para esta librería específica
const originalConsoleWarn = console.warn
console.warn = (...args) => {
  if (args[0]?.includes?.("JSX transform") || args[0]?.includes?.("outdated JSX")) {
    return // Suprimir este warning específico
  }
  originalConsoleWarn.apply(console, args)
}

const ListarCitas = () => {
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("list") // 'calendar' o 'list'
  const [selectedCita, setSelectedCita] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [calendarView, setCalendarView] = useState("month")

  useEffect(() => {
    fetchCitas()
  }, [])

  // Función para determinar si se puede eliminar una cita según las reglas de negocio
  const canDeleteCita = (estadoId) => {
    // Solo se puede eliminar si está en estado:
    // 1 = Programada
    // 4 = Cancelada
    // NO se puede eliminar si está en estado:
    // 2 = En Proceso
    // 3 = Completada
    return estadoId === 1 || estadoId === 4
  }

  const fetchCitas = async () => {
    setLoading(true)
    try {
      // Probar diferentes formatos de token
      const tokenFromLocal = localStorage.getItem("token")
      const tokenFromSession = sessionStorage.getItem("token")
      const finalToken = tokenFromLocal || tokenFromSession

      if (!finalToken) {
        toast.error("No hay token de autenticación")
        setLoading(false)
        return
      }

      // Probar primero sin "Bearer"
      let response
      try {
        response = await axios.get(`${API_BASE_URL}/citas`, {
          headers: {
            Authorization: finalToken, // Sin "Bearer"
            "Content-Type": "application/json",
          },
        })
      } catch (error) {
        if (error.response?.status === 401) {
          // Si falla, probar con "Bearer"
          response = await axios.get(`${API_BASE_URL}/citas`, {
            headers: {
              Authorization: `${finalToken}`,
              "Content-Type": "application/json",
            },
          })
        } else {
          throw error
        }
      }


      const citasData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
          ? response.data.data
          : []


      // SIMPLIFICAR - No transformar, usar datos directos
      setCitas(citasData)
      setLoading(false)
    } catch (error) {
      console.error("Error completo:", error)
      if (error.response?.status === 401) {
        toast.error("Token inválido o expirado. Por favor, inicie sesión nuevamente.")
      } else if (error.response?.status === 403) {
        toast.error("No tiene permisos para acceder a las citas.")
      } else {
        toast.error("Error al cargar las citas")
      }
      setCitas([])
      setLoading(false)
    }
  }

  const handleDeleteCita = async (id) => {
    const cita = citas.find((c) => c.id === id)
    const citaInfo = cita
      ? `${cita.documento || cita.cliente_documento || "N/A"} - ${cita.cliente_nombre || "N/A"}`
      : "esta cita"

    const result = await Swal.fire({
      title: "¿Eliminar cita?",
      text: `¿Está seguro que desea eliminar la cita de:\n${citaInfo}? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token")
        if (!token) {
          toast.error("No hay sesión activa. Por favor inicie sesión nuevamente.")
          return
        }

        await axios.delete(`${API_BASE_URL}/citas/${id}`, {
          headers: {
            Authorization: token,
          },
        })
        toast.success("Cita eliminada correctamente")
        fetchCitas()
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(`Error: ${error.response.data.message}`)
        } else {
          toast.error("Error al eliminar la cita")
        }
      }
    }
  }

  const handleSelectEvent = (event) => {
    setSelectedCita(event)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedCita(null)
  }

  // Funciones para manejar la navegación del calendario
  const handleNavigate = (newDate) => {
    setCalendarDate(newDate)
  }

  const handleViewChange = (view) => {
    setCalendarView(view)
  }

  // Función para obtener el nombre del estado
  const getEstadoNombre = (estadoId, estadoObj) => {
    // Primero intentar usar el objeto estado si existe
    if (estadoObj && estadoObj.nombre) {
      return estadoObj.nombre
    }

    // Fallback basado en el ID real de la base de datos
    switch (estadoId) {
      case 1:
        return "Programada"
      case 2:
        return "En Proceso"
      case 3:
        return "Completada"
      case 4:
        return "Cancelada"
      default:
        return "Desconocido"
    }
  }

  // MEJORAR LA TRANSFORMACIÓN DE EVENTOS PARA EL CALENDARIO
  const calendarEvents = Array.isArray(citas)
    ? citas
        .map((cita) => {
          if (!cita.fecha) {
            console.warn("Cita sin fecha:", cita.id)
            return null
          }

          try {
            // Mejorar el parsing de fecha y hora
            let fechaStr = cita.fecha
            let horaStr = cita.hora || "08:00"


            // Si la fecha viene con formato ISO, extraer solo la fecha
            if (fechaStr.includes("T")) {
              fechaStr = fechaStr.split("T")[0]
            }

            // Si la hora viene con segundos, extraer solo HH:MM
            if (horaStr.includes(":") && horaStr.length > 5) {
              horaStr = horaStr.substring(0, 5)
            }

            // Crear la fecha usando el constructor de Date más confiable
            const [year, month, day] = fechaStr.split("-").map(Number)
            const [hour, minute] = horaStr.split(":").map(Number)

            const start = new Date(year, month - 1, day, hour, minute)


            // Verificar que la fecha sea válida
            if (isNaN(start.getTime())) {
              console.warn("Fecha inválida para cita:", cita.id, fechaStr, horaStr)
              return null
            }

            // Crear fecha de fin (1 hora después)
            const end = new Date(start)
            end.setHours(end.getHours() + 1)

            const event = {
              id: cita.id,
              title: `Doc: ${cita.documento || cita.cliente_documento || "Sin documento"} - ${cita.cliente_nombre || "Sin cliente"}`,
              start,
              end,
              resource: cita,
              allDay: false,
            }

            return event
          } catch (error) {
            console.error("Error procesando cita:", cita.id, error)
            return null
          }
        })
        .filter((event) => event !== null)
    : []


  // Personalizar los eventos del calendario
  const eventStyleGetter = (event) => {
    const estado = event.resource.estado_cita_id
    const style = {
      borderRadius: "8px",
      border: "none",
      color: "white",
      fontWeight: "600",
      fontSize: "12px",
      padding: "2px 6px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    }

    switch (estado) {
      case 1: // Programada
        style.backgroundColor = "#2563eb" // Azul principal
        style.borderLeft = "4px solid #1d4ed8"
        break
      case 2: // En Proceso
        style.backgroundColor = "#f59e0b" // Amarillo
        style.borderLeft = "4px solid #d97706"
        break
      case 3: // Completada
        style.backgroundColor = "#10b981" // Verde
        style.borderLeft = "4px solid #059669"
        break
      case 4: // Cancelada
        style.backgroundColor = "#ef4444" // Rojo
        style.borderLeft = "4px solid #dc2626"
        break
      default:
        style.backgroundColor = "#6b7280"
        style.borderLeft = "4px solid #4b5563"
    }

    return { style }
  }

  // Mensajes en español para el calendario
  const messages = {
    allDay: "Todo el día",
    previous: "Anterior",
    next: "Siguiente",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    date: "Fecha",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "No hay citas en este rango de fechas",
    showMore: (total) => `+ Ver ${total} más`,
  }

  // Filtrar citas basadas en el término de búsqueda
  const filteredCitas = citas.filter((cita) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      cita.fecha?.toLowerCase().includes(searchTermLower) ||
      cita.hora?.toLowerCase().includes(searchTermLower) ||
      cita.documento?.toLowerCase().includes(searchTermLower) ||
      cita.cliente_documento?.toLowerCase().includes(searchTermLower) ||
      cita.cliente_nombre?.toLowerCase().includes(searchTermLower) ||
      cita.cliente_apellido?.toLowerCase().includes(searchTermLower) ||
      cita.mecanico_nombre?.toLowerCase().includes(searchTermLower) ||
      cita.mecanico_apellido?.toLowerCase().includes(searchTermLower) ||
      cita.estado_nombre?.toLowerCase().includes(searchTermLower)
    )
  })

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentCitas = filteredCitas.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredCitas.length / itemsPerPage)
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="listarCitas-container">
      <div className="listarCitas-header">
        <div className="listarCitas-header-content">
          <h1 className="listarCitas-title">Gestión de Citas</h1>
          <p className="listarCitas-subtitle">Administra y visualiza las citas de tus clientes.</p>
        </div>
        <div className="listarCitas-actions">
          <input
            type="text"
            placeholder="Buscar..."
            className="listarCitas-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="listarCitas-view-toggle">
            <button
              className={`listarCitas-view-btn listarCitas-list-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <FaList className="listarCitas-view-icon" />
            </button>
            <button
              className={`listarCitas-view-btn listarCitas-calendar-btn ${viewMode === "calendar" ? "active" : ""}`}
              onClick={() => setViewMode("calendar")}
            >
              <FaCalendarAlt className="listarCitas-view-icon" />
            </button>
          </div>
          <Link to="/citas/crear" className="listarCitas-btn-crear">
            <FaPlus className="listarCitas-crear-icon" /> Nueva Cita
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="listarCitas-loading-container">
          <div className="listarCitas-loading-content">
            <div className="listarCitas-spinner"></div>
            <p className="listarCitas-loading-text">Cargando citas...</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === "calendar" ? (
            <div className="listarCitas-calendar-container">
              <div className="listarCitas-calendar-legend">
                <div className="listarCitas-legend-item listarCitas-legend-pendiente">
                  <span className="listarCitas-legend-color listarCitas-color-pendiente"></span>
                  <span className="listarCitas-legend-text">Programada</span>
                </div>
                <div className="listarCitas-legend-item listarCitas-legend-confirmada">
                  <span className="listarCitas-legend-color listarCitas-color-confirmada"></span>
                  <span className="listarCitas-legend-text">En Proceso</span>
                </div>
                <div className="listarCitas-legend-item listarCitas-legend-completada">
                  <span className="listarCitas-legend-color listarCitas-color-completada"></span>
                  <span className="listarCitas-legend-text">Completada</span>
                </div>
                <div className="listarCitas-legend-item listarCitas-legend-cancelada">
                  <span className="listarCitas-legend-color listarCitas-color-cancelada"></span>
                  <span className="listarCitas-legend-text">Cancelada</span>
                </div>
              </div>

              <div className="listarCitas-calendar-wrapper">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  titleAccessor="title"
                  style={{ height: 600, minHeight: 600 }}
                  messages={messages}
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={handleSelectEvent}
                  views={["month", "week", "day"]}
                  view={calendarView}
                  onView={handleViewChange}
                  date={calendarDate}
                  onNavigate={handleNavigate}
                  popup={true}
                  popupOffset={30}
                  step={60}
                  showMultiDayTimes={true}
                  culture="es"
                  className="listarCitas-calendar"
                  formats={{
                    dateFormat: "DD",
                    dayFormat: (date, culture, localizer) => localizer.format(date, "dddd", culture),
                    dayHeaderFormat: (date, culture, localizer) => localizer.format(date, "dddd DD/MM", culture),
                    monthHeaderFormat: (date, culture, localizer) => localizer.format(date, "MMMM YYYY", culture),
                    agendaDateFormat: "DD/MM/YYYY",
                    agendaTimeFormat: "HH:mm",
                    agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
                      `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(end, "HH:mm", culture)}`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="listarCitas-table-container">
              <div className="listarCitas-table-wrapper">
                <table className="listarCitas-table">
                  <thead className="listarCitas-table-header">
                    <tr className="listarCitas-header-row">
                      <th className="listarCitas-th listarCitas-th-fecha">Fecha</th>
                      <th className="listarCitas-th listarCitas-th-hora">Hora</th>
                      <th className="listarCitas-th listarCitas-th-documento">Documento</th>
                      <th className="listarCitas-th listarCitas-th-cliente">Cliente</th>
                      <th className="listarCitas-th listarCitas-th-mecanico">Mecánico</th>
                      <th className="listarCitas-th listarCitas-th-servicios">Servicios</th>
                      <th className="listarCitas-th listarCitas-th-total">Total</th>
                      <th className="listarCitas-th listarCitas-th-estado">Estado</th>
                      <th className="listarCitas-th listarCitas-th-acciones">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="listarCitas-table-body">
                    {currentCitas.length > 0 ? (
                      currentCitas.map((cita) => {

                        // --- Construcción local de la fecha igual que en el calendario ---
                        const fechaStr = cita.fecha
                        const horaStr = cita.hora ? cita.hora.slice(0, 5) : "08:00"

                        let fechaBase = fechaStr
                        if (fechaStr && fechaStr.includes("T")) {
                          fechaBase = fechaStr.split("T")[0]
                        }

                        let fechaLocal = null
                        if (fechaBase) {
                          const [year, month, day] = fechaBase.split("-")
                          const [hour, minute] = horaStr.split(":")
                          fechaLocal = new Date(
                            Number(year),
                            Number(month) - 1,
                            Number(day),
                            Number(hour),
                            Number(minute),
                          )
                        }
                        // ---------------------------------------------------------------

                        // Calcular servicios y total
                                                // Mostrar servicio único y subtotal si existen
                                                // Proteger serviciosMap para que nunca sea undefined
                                                const safeServiciosMap = typeof serviciosMap === 'object' && serviciosMap !== null ? serviciosMap : {};
                                                const servicioNombre = cita.servicio_nombre || (cita.servicio_id && safeServiciosMap[cita.servicio_id]?.nombre) || "Sin servicio";
                                                const total = cita.subtotal ? Number(cita.subtotal) : (cita.servicio_id && safeServiciosMap[cita.servicio_id]?.precio) || 0;
                                                return (
                                                  <tr key={cita.id} className="listarCitas-table-row">
                                                    <td className="listarCitas-td listarCitas-td-fecha">
                                                      {fechaLocal
                                                        ? fechaLocal.toLocaleDateString("es-CO", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                          })
                                                        : "N/A"}
                                                    </td>
                                                    <td className="listarCitas-td listarCitas-td-hora">
                                                      {fechaLocal
                                                        ? fechaLocal.toLocaleTimeString("es-CO", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: false,
                                                          })
                                                        : "N/A"}
                                                    </td>
                                                    <td className="listarCitas-td listarCitas-td-documento">
                                                      <span className="listarCitas-documento-numero">
                                                        {cita.documento || cita.cliente_documento || "Sin documento"}
                                                      </span>
                                                    </td>
                                                    <td className="listarCitas-td listarCitas-td-cliente">
                                                      <span className="listarCitas-cliente-nombre">
                                                        {cita.cliente_nombre
                                                          ? `${cita.cliente_nombre} ${cita.cliente_apellido || ""}`
                                                          : "Sin cliente"}
                                                      </span>
                                                    </td>
                                                    <td className="listarCitas-td listarCitas-td-mecanico">
                                                      <span className="listarCitas-mecanico-nombre">
                                                        {cita.mecanico_nombre
                                                          ? `${cita.mecanico_nombre} ${cita.mecanico_apellido || ""}`
                                                          : "Sin mecánico"}
                                                      </span>
                                                    </td>
                                                    <td className="listarCitas-td listarCitas-td-servicios">
                                                      {servicioNombre ? servicioNombre : <span style={{color:'#888'}}>Sin servicio</span>}
                                                    </td>
                                                    <td className="listarCitas-td listarCitas-td-total">
                                                      {total > 0 ? `$${total.toLocaleString()}` : <span style={{color:'#888'}}>0</span>}
                                                    </td>
                                                    <td className="listarCitas-td listarCitas-td-estado">
                                                      <span className={`listarCitas-estado-badge listarCitas-estado-${cita.estado_cita_id}`}>
                                                        {getEstadoNombre(cita.estado_cita_id, cita.estado_cita)}
                                                      </span>
                                                    </td>
                                                    <td className="listarCitas-td listarCitas-actions-cell">
                                                      <div className="listarCitas-actions-group">
                                                        <Link
                                                          to={`/citas/detalle/${cita.id}`}
                                                          className="listarCitas-btn-action listarCitas-btn-view"
                                                          title="Ver detalle"
                                                        >
                                                          <FaEye className="listarCitas-action-icon" />
                                                        </Link>
                                                        {/* Solo mostrar botón eliminar según las reglas de negocio */}
                                                        {canDeleteCita(cita.estado_cita_id) && (
                                                          <button
                                                            className="listarCitas-btn-action listarCitas-btn-delete"
                                                            onClick={() => handleDeleteCita(cita.id)}
                                                            title={`Eliminar cita (Estado: ${getEstadoNombre(cita.estado_cita_id, cita.estado_cita)})`}
                                                          >
                                                            <FaTrash className="listarCitas-action-icon" />
                                                          </button>
                                                        )}
                                                      </div>
                                                    </td>
                                                  </tr>
                                                );
                      })
                    ) : (
                      <tr className="listarCitas-no-data-row">
                        <td colSpan="7" className="listarCitas-no-data">
                          <div className="listarCitas-no-data-content">
                            <span className="listarCitas-no-data-text">No hay citas registradas</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación igual que ListarUsuarios */}
              {filteredCitas.length > itemsPerPage && (
                <div className="listarCitas-pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="listarCitas-pagination-button"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`listarCitas-pagination-button ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="listarCitas-pagination-button"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal de detalle de cita */}
      {showModal && selectedCita && (
        <div className="listarCitas-modal-overlay">
          <div className="listarCitas-modal-content">
            <div className="listarCitas-modal-header">
              <h2 className="listarCitas-modal-title">Detalle de Cita</h2>
              <button className="listarCitas-close-btn" onClick={closeModal}>
                <span className="listarCitas-close-icon">×</span>
              </button>
            </div>
            <div className="listarCitas-modal-body">
              <div className="listarCitas-modal-info">
                <div className="listarCitas-info-group listarCitas-info-fecha">
                  <strong className="listarCitas-info-label">Fecha:</strong>
                  <span className="listarCitas-info-value">{moment(selectedCita.start).format("DD/MM/YYYY")}</span>
                </div>
                <div className="listarCitas-info-group listarCitas-info-hora">
                  <strong className="listarCitas-info-label">Hora:</strong>
                  <span className="listarCitas-info-value">{moment(selectedCita.start).format("HH:mm")}</span>
                </div>
                <div className="listarCitas-info-group listarCitas-info-documento">
                  <strong className="listarCitas-info-label">Documento:</strong>
                  <span className="listarCitas-info-value">
                    {selectedCita.resource.documento || selectedCita.resource.cliente_documento || "Sin documento"}
                  </span>
                </div>
                <div className="listarCitas-info-group listarCitas-info-cliente">
                  <strong className="listarCitas-info-label">Cliente:</strong>
                  <span className="listarCitas-info-value">
                    {selectedCita.resource.cliente_nombre
                      ? `${selectedCita.resource.cliente_nombre} ${selectedCita.resource.cliente_apellido || ""}`
                      : "Sin cliente"}
                  </span>
                </div>
                <div className="listarCitas-info-group listarCitas-info-mecanico">
                  <strong className="listarCitas-info-label">Mecánico:</strong>
                  <span className="listarCitas-info-value">
                    {selectedCita.resource.mecanico_nombre
                      ? `${selectedCita.resource.mecanico_nombre} ${selectedCita.resource.mecanico_apellido || ""}`
                      : "Sin mecánico"}
                  </span>
                </div>
                <div className="listarCitas-info-group listarCitas-info-estado">
                  <strong className="listarCitas-info-label">Estado:</strong>
                  <span
                    className={`listarCitas-estado-badge listarCitas-estado-${selectedCita.resource.estado_cita_id}`}
                  >
                    {getEstadoNombre(selectedCita.resource.estado_cita_id, selectedCita.resource.estado_cita)}
                  </span>
                </div>
                <div className="listarCitas-info-group listarCitas-info-observaciones">
                  <strong className="listarCitas-info-label">Observaciones:</strong>
                  <span className="listarCitas-info-value">
                    {selectedCita.resource.observaciones || "Sin observaciones"}
                  </span>
                </div>
              </div>
            </div>
            <div className="listarCitas-modal-footer">
              <Link to={`/citas/detalle/${selectedCita.resource.id}`} className="listarCitas-btn-edit-modal">
                <FaEye className="listarCitas-modal-icon" /> Ver Detalle
              </Link>
              <button className="listarCitas-btn-close-modal" onClick={closeModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListarCitas

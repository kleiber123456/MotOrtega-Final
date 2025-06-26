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
import { FaPlus, FaEye, FaTrash, FaSync, FaCalendarAlt, FaList } from "react-icons/fa"

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

  useEffect(() => {
    fetchCitas()
  }, [])

  // 1. FETCH Y TRANSFORMACIÓN DE CITAS
  const token = localStorage.getItem("token")

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
              Authorization: `Bearer ${finalToken}`,
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

      const citasTransformadas = citasData.map((cita) => ({
        ...cita,
        fecha: cita.fecha || cita.fecha_cita || "",
        hora: cita.hora || cita.hora_cita || "",
        vehiculo: {
          placa: cita.vehiculo_placa || cita.placa || "N/A",
          cliente: {
            nombre: cita.cliente_nombre || "N/A",
            apellido: cita.cliente_apellido || "",
          },
        },
        mecanico: {
          nombre: cita.mecanico_nombre || "N/A",
          apellido: cita.mecanico_apellido || "",
        },
        estado_cita: {
          nombre: cita.estado_nombre || "Pendiente",
        },
        estado_cita_id: cita.estado_cita_id || 1,
      }))

      setCitas(citasTransformadas)
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
    // Encontrar la cita para mostrar información en la confirmación
    const cita = citas.find((c) => c.id === id)
    const citaInfo = cita
      ? `${cita.vehiculo?.placa || "N/A"} - ${cita.vehiculo?.cliente?.nombre || "N/A"} ${cita.vehiculo?.cliente?.apellido || ""}`
      : "esta cita"

    if (
      window.confirm(
        `⚠️ CONFIRMAR ELIMINACIÓN\n\n¿Está seguro que desea eliminar la cita de:\n${citaInfo}?\n\nEsta acción no se puede deshacer.`,
      )
    ) {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token")

        if (!token) {
          toast.error("No hay sesión activa. Por favor inicie sesión nuevamente.")
          return
        }

        await axios.delete(`${API_BASE_URL}/citas/${id}`, {
          headers: {
            Authorization: token, // Usar el mismo formato que funcionó para GET
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

  // MEJORAR LA TRANSFORMACIÓN DE EVENTOS PARA EL CALENDARIO
  const calendarEvents = Array.isArray(citas)
    ? citas
        .map((cita) => {
          if (!cita.fecha) return null

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

            // Crear la fecha completa
            const fechaCompleta = `${fechaStr}T${horaStr}:00`
            const start = new Date(fechaCompleta)

            // Verificar que la fecha sea válida
            if (isNaN(start.getTime())) {
              console.warn("Fecha inválida para cita:", cita.id, fechaCompleta)
              return null
            }

            // Crear fecha de fin (1 hora después)
            const end = new Date(start)
            end.setHours(end.getHours() + 1)

            return {
              id: cita.id,
              title: `${cita.vehiculo?.placa || "Sin placa"} - ${cita.vehiculo?.cliente?.nombre || "Sin cliente"}`,
              start,
              end,
              resource: cita,
              allDay: false,
            }
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
      case 1: // Pendiente
        style.backgroundColor = "#f59e0b" // Amarillo
        style.borderLeft = "4px solid #d97706"
        break
      case 2: // Confirmada
        style.backgroundColor = "#10b981" // Verde
        style.borderLeft = "4px solid #059669"
        break
      case 3: // Cancelada
        style.backgroundColor = "#ef4444" // Rojo
        style.borderLeft = "4px solid #dc2626"
        break
      case 4: // Finalizada/Completada
        style.backgroundColor = "#3b82f6" // Azul
        style.borderLeft = "4px solid #1d4ed8"
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
    agenda: "Agenda",
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
      cita.vehiculo?.placa?.toLowerCase().includes(searchTermLower) ||
      cita.vehiculo?.cliente?.nombre?.toLowerCase().includes(searchTermLower) ||
      cita.vehiculo?.cliente?.apellido?.toLowerCase().includes(searchTermLower) ||
      cita.mecanico?.nombre?.toLowerCase().includes(searchTermLower) ||
      cita.mecanico?.apellido?.toLowerCase().includes(searchTermLower) ||
      cita.estado_cita?.nombre?.toLowerCase().includes(searchTermLower)
    )
  })

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentCitas = filteredCitas.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="listarCitas-container">
      <div className="listarCitas-header">
        <div>
          <h1>Gestión de Citas</h1>
          <p>Administra y visualiza las citas de tus clientes.</p>
        </div>
        <div className="listarCitas-actions">
          <input
            type="text"
            placeholder="Buscar..."
            className="listarCitas-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="listarCitas-btn-refresh" onClick={fetchCitas}>
            <FaSync />
          </button>
          <div className="listarCitas-view-toggle">
            <button
              className={`listarCitas-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <FaList />
            </button>
            <button
              className={`listarCitas-view-btn ${viewMode === "calendar" ? "active" : ""}`}
              onClick={() => setViewMode("calendar")}
            >
              <FaCalendarAlt />
            </button>
          </div>
          <Link to="/citas/crear" className="listarCitas-btn-crear">
            <FaPlus /> Nueva Cita
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="listarUsuarios-container">
          <div className="listarUsuarios-loading">
            <div className="listarUsuarios-spinner"></div>
            <p>Cargando citas...</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === "calendar" ? (
            <div className="listarCitas-calendar-container">
              <div className="listarCitas-calendar-legend">
                <div className="listarCitas-legend-item">
                  <span className="listarCitas-legend-color" style={{ backgroundColor: "#f59e0b" }}></span>
                  <span>Pendiente</span>
                </div>
                <div className="listarCitas-legend-item">
                  <span className="listarCitas-legend-color" style={{ backgroundColor: "#10b981" }}></span>
                  <span>Completada</span>
                </div>
                <div className="listarCitas-legend-item">
                  <span className="listarCitas-legend-color" style={{ backgroundColor: "#ef4444" }}></span>
                  <span>Cancelada</span>
                </div>
                <div className="listarCitas-legend-item">
                  <span className="listarCitas-legend-color" style={{ backgroundColor: "#3b82f6" }}></span>
                  <span>Finalizada</span>
                </div>
              </div>

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
                views={["month", "week", "day", "agenda"]}
                defaultView="month"
                popup={true}
                popupOffset={30}
                step={60}
                showMultiDayTimes={true}
                culture="es"
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
          ) : (
            <div className="listarCitas-table-container">
              <table className="listarCitas-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Vehículo</th>
                    <th>Cliente</th>
                    <th>Mecánico</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
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

                      return (
                        <tr key={cita.id}>
                          <td>
                            {fechaLocal
                              ? fechaLocal.toLocaleDateString("es-CO", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </td>
                          <td>
                            {fechaLocal
                              ? fechaLocal.toLocaleTimeString("es-CO", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })
                              : "N/A"}
                          </td>
                          <td>{cita.vehiculo?.placa || "N/A"}</td>
                          <td>
                            {cita.vehiculo?.cliente?.nombre
                              ? `${cita.vehiculo.cliente.nombre} ${cita.vehiculo.cliente.apellido || ""}`
                              : "N/A"}
                          </td>
                          <td>
                            {cita.mecanico?.nombre ? `${cita.mecanico.nombre} ${cita.mecanico.apellido || ""}` : "N/A"}
                          </td>
                          <td>
                            <span className={`listarCitas-estado-badge listarCitas-estado-${cita.estado_cita_id}`}>
                              {cita.estado_cita?.nombre || "Pendiente"}
                            </span>
                          </td>
                          <td className="listarCitas-actions-cell">
                            <Link
                              to={`/citas/detalle/${cita.id}`}
                              className="listarCitas-btn-action listarCitas-btn-view"
                            >
                              <FaEye />
                            </Link>
                            <button
                              className="listarCitas-btn-action listarCitas-btn-delete"
                              onClick={() => handleDeleteCita(cita.id)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="listarCitas-no-data">
                        No hay citas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Paginación */}
              <div className="listarCitas-pagination">
                {Array.from({ length: Math.ceil(filteredCitas.length / itemsPerPage) }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`listarCitas-page-number ${currentPage === number ? "listarCitas-active" : ""}`}
                    >
                      {number}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de detalle de cita */}
      {showModal && selectedCita && (
        <div className="listarCitas-modal-overlay">
          <div className="listarCitas-modal-content">
            <div className="listarCitas-modal-header">
              <h2>Detalle de Cita</h2>
              <button className="listarCitas-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="listarCitas-modal-body">
              <div className="listarCitas-modal-info">
                <div className="listarCitas-info-group">
                  <strong>Fecha:</strong>
                  <span>{moment(selectedCita.start).format("DD/MM/YYYY")}</span>
                </div>
                <div className="listarCitas-info-group">
                  <strong>Hora:</strong>
                  <span>{moment(selectedCita.start).format("HH:mm")}</span>
                </div>
                <div className="listarCitas-info-group">
                  <strong>Vehículo:</strong>
                  <span>{selectedCita.resource.vehiculo?.placa || "N/A"}</span>
                </div>
                <div className="listarCitas-info-group">
                  <strong>Cliente:</strong>
                  <span>
                    {selectedCita.resource.vehiculo?.cliente?.nombre
                      ? `${selectedCita.resource.vehiculo.cliente.nombre} ${selectedCita.resource.vehiculo.cliente.apellido || ""}`
                      : "N/A"}
                  </span>
                </div>
                <div className="listarCitas-info-group">
                  <strong>Mecánico:</strong>
                  <span>
                    {selectedCita.resource.mecanico?.nombre
                      ? `${selectedCita.resource.mecanico.nombre} ${selectedCita.resource.mecanico.apellido || ""}`
                      : "N/A"}
                  </span>
                </div>
                <div className="listarCitas-info-group">
                  <strong>Estado:</strong>
                  <span
                    className={`listarCitas-estado-badge listarCitas-estado-${selectedCita.resource.estado_cita_id}`}
                  >
                    {selectedCita.resource.estado_cita?.nombre || "Pendiente"}
                  </span>
                </div>
                <div className="listarCitas-info-group">
                  <strong>Observaciones:</strong>
                  <span>{selectedCita.resource.observaciones || "Sin observaciones"}</span>
                </div>
              </div>
            </div>
            <div className="listarCitas-modal-footer">
              <Link to={`/citas/detalle/${selectedCita.resource.id}`} className="listarCitas-btn-edit-modal">
                <FaEye /> Ver Detalle
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

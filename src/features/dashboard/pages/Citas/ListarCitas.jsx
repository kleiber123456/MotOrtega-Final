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
import { FaPlus, FaEye, FaEdit, FaTrash, FaSync, FaCalendarAlt, FaList } from "react-icons/fa"

// Configurar localización en español
moment.locale("es")
const localizer = momentLocalizer(moment)

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

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
      const response = await axios.get(`${API_BASE_URL}/citas`, {
        headers: {
          Authorization: token,
        },
      })

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
      setCitas([])
      setLoading(false)
    }
  }

  const handleDeleteCita = async (id) => {
    if (window.confirm("¿Está seguro que desea eliminar esta cita?")) {
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

  

  // Personalizar los eventos del calendario
  const eventStyleGetter = (event) => {
    let backgroundColor = "#3b82f6"

    if (event.resource.estado_cita_id === 1) {
      backgroundColor = "#f59e0b"
    } else if (event.resource.estado_cita_id === 2) {
      backgroundColor = "#10b981"
    } else if (event.resource.estado_cita_id === 3) {
      backgroundColor = "#ef4444"
    } else if (event.resource.estado_cita_id === 4) {
      backgroundColor = "#3b82f6"
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    }
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
    noEventsInRange: "No hay citas en este rango",
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
        <div className="listarCitas-loading-spinner">Cargando...</div>
      ) : (
        <>
          {viewMode === "calendar" ? (
            <div className="listarCitas-calendar-container">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                style={{ height: 500 }}
                messages={messages}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
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
                          Number(minute)
                        )
                      }
                      // ---------------------------------------------------------------

                      return (
                        <tr key={cita.id}>
                          <td>
                            {fechaLocal
                              ? fechaLocal.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })
                              : "N/A"}
                          </td>
                          <td>
                            {fechaLocal
                              ? fechaLocal.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false })
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
                            <Link to={`/citas/editar/${cita.id}`} className="listarCitas-btn-action listarCitas-btn-edit">
                              <FaEdit />
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
              <p>
                <strong>Fecha:</strong> {moment(selectedCita.start).format("DD/MM/YYYY")}
              </p>
              <p>
                <strong>Hora:</strong> {moment(selectedCita.start).format("HH:mm")}
              </p>
              <p>
                <strong>Vehículo:</strong> {selectedCita.resource.vehiculo?.placa || "N/A"}
              </p>
              <p>
                <strong>Cliente:</strong>{" "}
                {selectedCita.resource.vehiculo?.cliente?.nombre
                  ? `${selectedCita.resource.vehiculo.cliente.nombre} ${selectedCita.resource.vehiculo.cliente.apellido || ""}`
                  : "N/A"}
              </p>
              <p>
                <strong>Mecánico:</strong>{" "}
                {selectedCita.resource.mecanico?.nombre
                  ? `${selectedCita.resource.mecanico.nombre} ${selectedCita.resource.mecanico.apellido || ""}`
                  : "N/A"}
              </p>
              <p>
                <strong>Estado:</strong> {selectedCita.resource.estado_cita?.nombre || "Pendiente"}
              </p>
              <p>
                <strong>Observaciones:</strong> {selectedCita.resource.observaciones || "Sin observaciones"}
              </p>
            </div>
            <div className="listarCitas-modal-footer">
              <Link to={`/citas/editar/${selectedCita.resource.id}`} className="listarCitas-btn-edit-modal">
                Editar
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

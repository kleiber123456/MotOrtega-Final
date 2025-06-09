"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaCalendarAlt,
  FaPlus,
  FaClock,
  FaUser,
  FaCar,
  FaWrench,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaExclamationTriangle,
  FaSearch,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaPalette,
  FaTag,
  FaTools,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "./CitasCalendar.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const useApi = () => {
  const makeRequest = useCallback(async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token disponible")
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: token, // Sin "Bearer", solo el token directo
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`Respuesta de ${endpoint}:`, data) // Para debug
      return data
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error)
      throw error
    }
  }, [])

  return { makeRequest }
}

const CitasCalendar = () => {
  const navigate = useNavigate()
  const { makeRequest } = useApi()

  // Estados principales
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [citas, setCitas] = useState([])
  const [citasDelDia, setCitasDelDia] = useState([])
  const [loading, setLoading] = useState(false)

  // Estados para modales
  const [showModal, setShowModal] = useState(false)
  const [showClienteModal, setShowClienteModal] = useState(false)
  const [showVehiculoModal, setShowVehiculoModal] = useState(false)
  const [showMecanicoModal, setShowMecanicoModal] = useState(false)

  // Estados para datos
  const [clientes, setClientes] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [vehiculosCliente, setVehiculosCliente] = useState([])
  const [mecanicos, setMecanicos] = useState([])
  const [estadosCita, setEstadosCita] = useState([])
  const [horarios, setHorarios] = useState([])
  const [horariosDisponibles, setHorariosDisponibles] = useState([])

  // Estados para búsqueda y paginación
  const [clienteBusqueda, setClienteBusqueda] = useState("")
  const [vehiculoBusqueda, setVehiculoBusqueda] = useState("")
  const [mecanicoBusqueda, setMecanicoBusqueda] = useState("")
  const [clientePagina, setClientePagina] = useState(1)
  const [vehiculoPagina, setVehiculoPagina] = useState(1)
  const [mecanicoPagina, setMecanicoPagina] = useState(1)
  const itemsPorPagina = 5

  // Estado para nueva cita
  const [nuevaCita, setNuevaCita] = useState({
    fecha: "",
    hora: "",
    vehiculo_id: "",
    mecanico_id: "",
    estado_cita_id: 1,
  })

  // Estados para selección
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null)
  const [mecanicoSeleccionado, setMecanicoSeleccionado] = useState(null)

  const [errors, setErrors] = useState({})

  // Cargar datos iniciales
  useEffect(() => {
    cargarCitas()
    cargarClientes()
    cargarMecanicos()
    cargarEstadosCita()
  }, [])

  // Cargar horarios cuando cambia la fecha
  useEffect(() => {
    if (nuevaCita.fecha && mecanicoSeleccionado) {
      cargarHorariosPorFecha(nuevaCita.fecha, mecanicoSeleccionado.id)
    }
  }, [nuevaCita.fecha, mecanicoSeleccionado])

  // Cargar vehículos cuando se selecciona un cliente
  useEffect(() => {
    if (clienteSeleccionado) {
      cargarVehiculosPorCliente(clienteSeleccionado.id)
    }
  }, [clienteSeleccionado])

  // Funciones para cargar datos
  const cargarCitas = async () => {
    try {
      setLoading(true)
      const response = await makeRequest("/citas")
      console.log("Respuesta citas completa:", response)

      // Manejar diferentes estructuras de respuesta
      let citasData = []
      if (Array.isArray(response)) {
        citasData = response
      } else if (response.data && Array.isArray(response.data)) {
        citasData = response.data
      } else if (response.citas && Array.isArray(response.citas)) {
        citasData = response.citas
      }

      setCitas(citasData)
    } catch (error) {
      console.error("Error al cargar citas:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las citas",
      })
    } finally {
      setLoading(false)
    }
  }

  const cargarClientes = async () => {
    try {
      const response = await makeRequest("/clientes")
      console.log("Respuesta clientes completa:", response)

      // Manejar diferentes estructuras de respuesta
      let clientesData = []
      if (Array.isArray(response)) {
        clientesData = response
      } else if (response.data && Array.isArray(response.data)) {
        clientesData = response.data
      } else if (response.clientes && Array.isArray(response.clientes)) {
        clientesData = response.clientes
      }

      setClientes(clientesData)
    } catch (error) {
      console.error("Error al cargar clientes:", error)
    }
  }

  const cargarVehiculosPorCliente = async (clienteId) => {
    try {
      const response = await makeRequest(`/vehiculos/cliente/${clienteId}`)
      console.log("Respuesta vehículos por cliente:", response)

      // Manejar diferentes estructuras de respuesta
      let vehiculosData = []
      if (Array.isArray(response)) {
        vehiculosData = response
      } else if (response.data && Array.isArray(response.data)) {
        vehiculosData = response.data
      } else if (response.vehiculos && Array.isArray(response.vehiculos)) {
        vehiculosData = response.vehiculos
      }

      setVehiculosCliente(vehiculosData)
    } catch (error) {
      console.error("Error al cargar vehículos del cliente:", error)
      setVehiculosCliente([])
    }
  }

  const cargarMecanicos = async () => {
    try {
      const response = await makeRequest("/mecanicos")
      console.log("Respuesta mecánicos completa:", response)

      // Manejar diferentes estructuras de respuesta
      let mecanicosData = []
      if (Array.isArray(response)) {
        mecanicosData = response
      } else if (response.data && Array.isArray(response.data)) {
        mecanicosData = response.data
      } else if (response.mecanicos && Array.isArray(response.mecanicos)) {
        mecanicosData = response.mecanicos
      }

      // Filtrar solo mecánicos activos
      const mecanicosActivos = mecanicosData.filter((mecanico) => mecanico.estado === "Activo")
      setMecanicos(mecanicosActivos)
    } catch (error) {
      console.error("Error al cargar mecánicos:", error)
    }
  }

  const cargarEstadosCita = async () => {
    try {
      const response = await makeRequest("/estados-cita")
      console.log("Respuesta estados cita:", response)

      // Manejar diferentes estructuras de respuesta
      let estadosData = []
      if (Array.isArray(response)) {
        estadosData = response
      } else if (response.data && Array.isArray(response.data)) {
        estadosData = response.data
      } else if (response.estados && Array.isArray(response.estados)) {
        estadosData = response.estados
      }

      setEstadosCita(estadosData)
    } catch (error) {
      console.error("Error al cargar estados de cita:", error)
      // Estados por defecto si no se pueden cargar
      setEstadosCita([
        { id: 1, nombre: "Programada" },
        { id: 2, nombre: "En Proceso" },
        { id: 3, nombre: "Completada" },
        { id: 4, nombre: "Cancelada" },
      ])
    }
  }

  const cargarHorariosPorFecha = async (fecha, mecanicoId) => {
    try {
      // Primero cargar los horarios disponibles para esa fecha
      const responseHorarios = await makeRequest(`/horarios/fecha/${fecha}`)
      console.log("Respuesta horarios:", responseHorarios)

      let horariosData = []
      if (Array.isArray(responseHorarios)) {
        horariosData = responseHorarios
      } else if (responseHorarios.data && Array.isArray(responseHorarios.data)) {
        horariosData = responseHorarios.data
      } else if (responseHorarios.horarios && Array.isArray(responseHorarios.horarios)) {
        horariosData = responseHorarios.horarios
      }

      setHorarios(horariosData)

      // Luego cargar las citas existentes para ese mecánico en esa fecha
      const responseCitas = await makeRequest(`/citas/mecanico/${mecanicoId}`)
      console.log("Respuesta citas mecánico:", responseCitas)

      let citasMecanicoData = []
      if (Array.isArray(responseCitas)) {
        citasMecanicoData = responseCitas
      } else if (responseCitas.data && Array.isArray(responseCitas.data)) {
        citasMecanicoData = responseCitas.data
      } else if (responseCitas.citas && Array.isArray(responseCitas.citas)) {
        citasMecanicoData = responseCitas.citas
      }

      const citasEnFecha = citasMecanicoData.filter((cita) => cita.fecha === fecha)

      // Generar slots de horarios disponibles
      generarHorariosDisponibles(horariosData, citasEnFecha)
    } catch (error) {
      console.error("Error al cargar horarios:", error)
      setHorarios([])
      setHorariosDisponibles([])
    }
  }

  const generarHorariosDisponibles = (horarios, citasExistentes) => {
    if (!horarios || horarios.length === 0) {
      setHorariosDisponibles([])
      return
    }

    // Crear array de slots de 30 minutos entre hora_inicio y hora_fin
    const slots = []

    horarios.forEach((horario) => {
      const [horaInicio, minutosInicio] = horario.hora_inicio.split(":").map(Number)
      const [horaFin, minutosFin] = horario.hora_fin.split(":").map(Number)

      let currentHour = horaInicio
      let currentMinute = minutosInicio

      while (currentHour < horaFin || (currentHour === horaFin && currentMinute < minutosFin)) {
        const hora = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}:00`

        // Verificar si el slot ya está ocupado por una cita
        const ocupado = citasExistentes.some(
          (cita) => cita.hora === hora && ["Programada", "En Proceso"].includes(cita.estado_nombre),
        )

        slots.push({
          hora,
          disponible: !ocupado,
        })

        // Avanzar 30 minutos
        currentMinute += 30
        if (currentMinute >= 60) {
          currentHour += 1
          currentMinute = 0
        }
      }
    })

    setHorariosDisponibles(slots)
  }

  // Funciones del calendario
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]
  }

  const getCitasForDate = (date) => {
    const dateStr = formatDate(date)
    return citas.filter((cita) => cita.fecha === dateStr)
  }

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
    const citasDelDia = getCitasForDate(clickedDate)
    setCitasDelDia(citasDelDia)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  // Funciones para modales de selección
  const handleClienteSelect = (cliente) => {
    setClienteSeleccionado(cliente)
    setShowClienteModal(false)
    // Limpiar selección de vehículo si se cambia de cliente
    setVehiculoSeleccionado(null)
    setNuevaCita((prev) => ({
      ...prev,
      vehiculo_id: "",
    }))
  }

  const handleVehiculoSelect = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo)
    setShowVehiculoModal(false)
    setNuevaCita((prev) => ({
      ...prev,
      vehiculo_id: vehiculo.id,
    }))
  }

  const handleMecanicoSelect = (mecanico) => {
    setMecanicoSeleccionado(mecanico)
    setShowMecanicoModal(false)
    setNuevaCita((prev) => ({
      ...prev,
      mecanico_id: mecanico.id,
    }))

    // Cargar horarios disponibles si ya hay fecha seleccionada
    if (nuevaCita.fecha) {
      cargarHorariosPorFecha(nuevaCita.fecha, mecanico.id)
    }
  }

  const handleHorarioSelect = (slot) => {
    if (!slot.disponible) return

    setNuevaCita((prev) => ({
      ...prev,
      hora: slot.hora,
    }))
  }

  // Funciones para crear cita
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNuevaCita((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validarCita = () => {
    const newErrors = {}

    if (!nuevaCita.fecha) newErrors.fecha = "La fecha es requerida"
    if (!nuevaCita.hora) newErrors.hora = "La hora es requerida"
    if (!nuevaCita.vehiculo_id) newErrors.vehiculo_id = "El vehículo es requerido"
    if (!nuevaCita.mecanico_id) newErrors.mecanico_id = "El mecánico es requerido"

    // Validar que la fecha no sea en el pasado
    if (nuevaCita.fecha) {
      const fechaCita = new Date(nuevaCita.fecha)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      if (fechaCita < hoy) {
        newErrors.fecha = "La fecha no puede ser en el pasado"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarCita()) return

    try {
      setLoading(true)
      await makeRequest("/citas", {
        method: "POST",
        body: JSON.stringify(nuevaCita),
      })

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Cita creada correctamente",
      })

      setShowModal(false)
      setNuevaCita({
        fecha: "",
        hora: "",
        vehiculo_id: "",
        mecanico_id: "",
        estado_cita_id: 1,
      })
      setClienteSeleccionado(null)
      setVehiculoSeleccionado(null)
      setMecanicoSeleccionado(null)
      setErrors({})
      cargarCitas()
    } catch (error) {
      console.error("Error al crear cita:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear la cita",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNuevaCita = () => {
    if (selectedDate) {
      setNuevaCita((prev) => ({
        ...prev,
        fecha: formatDate(selectedDate),
      }))
    }
    setShowModal(true)
  }

  const getEstadoColor = (estadoId) => {
    switch (estadoId) {
      case 1:
        return "#007bff" // Programada - Azul
      case 2:
        return "#ffc107" // En Proceso - Amarillo
      case 3:
        return "#28a745" // Completada - Verde
      case 4:
        return "#dc3545" // Cancelada - Rojo
      default:
        return "#6c757d" // Gris
    }
  }

  // Filtrado y paginación para modales
  const clientesFiltrados = clientes.filter((cliente) => {
    const nombreCompleto = `${cliente.nombre || ""} ${cliente.apellido || ""}`.toLowerCase()
    const documento = cliente.documento ? cliente.documento.toLowerCase() : ""
    const correo = cliente.correo ? cliente.correo.toLowerCase() : ""
    const telefono = cliente.telefono ? cliente.telefono.toLowerCase() : ""

    const busqueda = clienteBusqueda.toLowerCase()

    return (
      nombreCompleto.includes(busqueda) ||
      documento.includes(busqueda) ||
      correo.includes(busqueda) ||
      telefono.includes(busqueda)
    )
  })

  const vehiculosFiltrados = vehiculosCliente.filter((vehiculo) => {
    const marca = vehiculo.marca ? vehiculo.marca.toLowerCase() : ""
    const modelo = vehiculo.modelo ? vehiculo.modelo.toLowerCase() : ""
    const placa = vehiculo.placa ? vehiculo.placa.toLowerCase() : ""
    const color = vehiculo.color ? vehiculo.color.toLowerCase() : ""

    const busqueda = vehiculoBusqueda.toLowerCase()

    return marca.includes(busqueda) || modelo.includes(busqueda) || placa.includes(busqueda) || color.includes(busqueda)
  })

  const mecanicosFiltrados = mecanicos.filter((mecanico) => {
    const nombreCompleto = `${mecanico.nombre || ""} ${mecanico.apellido || ""}`.toLowerCase()
    const documento = mecanico.documento ? mecanico.documento.toLowerCase() : ""
    const especialidad = mecanico.especialidad ? mecanico.especialidad.toLowerCase() : ""

    const busqueda = mecanicoBusqueda.toLowerCase()

    return nombreCompleto.includes(busqueda) || documento.includes(busqueda) || especialidad.includes(busqueda)
  })

  const clientesPaginados = clientesFiltrados.slice(
    (clientePagina - 1) * itemsPorPagina,
    clientePagina * itemsPorPagina,
  )

  const vehiculosPaginados = vehiculosFiltrados.slice(
    (vehiculoPagina - 1) * itemsPorPagina,
    vehiculoPagina * itemsPorPagina,
  )

  const mecanicosPaginados = mecanicosFiltrados.slice(
    (mecanicoPagina - 1) * itemsPorPagina,
    mecanicoPagina * itemsPorPagina,
  )

  const totalPaginasClientes = Math.ceil(clientesFiltrados.length / itemsPorPagina)
  const totalPaginasVehiculos = Math.ceil(vehiculosFiltrados.length / itemsPorPagina)
  const totalPaginasMecanicos = Math.ceil(mecanicosFiltrados.length / itemsPorPagina)

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const citasDelDia = getCitasForDate(date)
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear()
      const isToday = new Date().toDateString() === date.toDateString()

      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${
            citasDelDia.length > 0 ? "has-citas" : ""
          }`}
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {citasDelDia.length > 0 && (
            <div className="citas-indicator">
              <span className="citas-count">{citasDelDia.length}</span>
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <div className="citas-calendar-container">
      <div className="citas-calendar-header">
        <div className="header-content">
          <div className="header-title">
            <FaCalendarAlt className="header-icon" />
            <h1>Calendario de Citas</h1>
          </div>
          <button className="btn-nueva-cita" onClick={handleNuevaCita} disabled={loading}>
            <FaPlus /> Nueva Cita
          </button>
        </div>
      </div>

      <div className="calendar-content">
        <div className="calendar-section">
          <div className="calendar-header">
            <button className="nav-btn" onClick={handlePrevMonth}>
              <FaChevronLeft />
            </button>
            <h2 className="month-year">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button className="nav-btn" onClick={handleNextMonth}>
              <FaChevronRight />
            </button>
          </div>

          <div className="calendar-grid">
            <div className="day-names">
              {dayNames.map((day) => (
                <div key={day} className="day-name">
                  {day}
                </div>
              ))}
            </div>
            <div className="calendar-days">{renderCalendar()}</div>
          </div>
        </div>

        <div className="citas-section">
          <div className="citas-header">
            <h3>
              {selectedDate
                ? `Citas del ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}`
                : "Selecciona un día"}
            </h3>
          </div>

          <div className="citas-list">
            {selectedDate ? (
              citasDelDia.length > 0 ? (
                citasDelDia.map((cita) => (
                  <div key={cita.id} className="cita-card">
                    <div className="cita-header">
                      <div className="cita-time">
                        <FaClock /> {cita.hora?.substring(0, 5)}
                      </div>
                      <div className="cita-estado" style={{ backgroundColor: getEstadoColor(cita.estado_cita_id) }}>
                        {estadosCita.find((e) => e.id === cita.estado_cita_id)?.nombre || "Desconocido"}
                      </div>
                    </div>
                    <div className="cita-details">
                      <div className="cita-detail">
                        <FaCar />
                        <span>
                          {cita.vehiculo?.marca} {cita.vehiculo?.modelo} - {cita.vehiculo?.placa}
                        </span>
                      </div>
                      <div className="cita-detail">
                        <FaUser />
                        <span>
                          {cita.vehiculo?.cliente?.nombre} {cita.vehiculo?.cliente?.apellido}
                        </span>
                      </div>
                      <div className="cita-detail">
                        <FaWrench />
                        <span>
                          {cita.mecanico?.nombre} {cita.mecanico?.apellido}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-citas">
                  <FaCalendarAlt className="no-citas-icon" />
                  <p>No hay citas programadas para este día</p>
                  <button className="btn-crear-cita-dia" onClick={handleNuevaCita}>
                    <FaPlus /> Crear cita para este día
                  </button>
                </div>
              )
            ) : (
              <div className="select-date">
                <FaCalendarAlt className="select-date-icon" />
                <p>Selecciona un día en el calendario para ver las citas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear nueva cita */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <FaPlus /> Nueva Cita
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaCalendarAlt /> Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={nuevaCita.fecha}
                    onChange={handleInputChange}
                    className={errors.fecha ? "error" : ""}
                  />
                  {errors.fecha && <span className="error-text">{errors.fecha}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FaUser /> Cliente
                </label>
                <div className="form-row">
                  <input
                    type="text"
                    value={clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` : ""}
                    readOnly
                    placeholder="Seleccione un cliente"
                    className={errors.cliente ? "error" : ""}
                  />
                  <button type="button" className="btn-submit" onClick={() => setShowClienteModal(true)}>
                    Seleccionar Cliente
                  </button>
                </div>
                {errors.cliente && <span className="error-text">{errors.cliente}</span>}
              </div>

              <div className="form-group">
                <label>
                  <FaCar /> Vehículo
                </label>
                <div className="form-row">
                  <input
                    type="text"
                    value={
                      vehiculoSeleccionado
                        ? `${vehiculoSeleccionado.marca} ${vehiculoSeleccionado.modelo} - ${vehiculoSeleccionado.placa}`
                        : ""
                    }
                    readOnly
                    placeholder={clienteSeleccionado ? "Seleccione un vehículo" : "Primero seleccione un cliente"}
                    className={errors.vehiculo_id ? "error" : ""}
                  />
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={() => setShowVehiculoModal(true)}
                    disabled={!clienteSeleccionado}
                  >
                    Seleccionar Vehículo
                  </button>
                </div>
                {errors.vehiculo_id && <span className="error-text">{errors.vehiculo_id}</span>}
              </div>

              <div className="form-group">
                <label>
                  <FaWrench /> Mecánico
                </label>
                <div className="form-row">
                  <input
                    type="text"
                    value={
                      mecanicoSeleccionado ? `${mecanicoSeleccionado.nombre} ${mecanicoSeleccionado.apellido}` : ""
                    }
                    readOnly
                    placeholder="Seleccione un mecánico"
                    className={errors.mecanico_id ? "error" : ""}
                  />
                  <button type="button" className="btn-submit" onClick={() => setShowMecanicoModal(true)}>
                    Seleccionar Mecánico
                  </button>
                </div>
                {errors.mecanico_id && <span className="error-text">{errors.mecanico_id}</span>}
              </div>

              {/* Mostrar horarios disponibles si hay fecha y mecánico seleccionados */}
              {nuevaCita.fecha && mecanicoSeleccionado && (
                <div className="horario-disponibilidad">
                  <h4>
                    <FaClock /> Horarios Disponibles
                  </h4>

                  {horariosDisponibles.length > 0 ? (
                    <div className="horario-slots">
                      {horariosDisponibles.map((slot, index) => (
                        <div
                          key={index}
                          className={`horario-slot ${slot.disponible ? "disponible" : "ocupado"} ${nuevaCita.hora === slot.hora ? "seleccionado" : ""}`}
                          onClick={() => handleHorarioSelect(slot)}
                        >
                          {slot.hora.substring(0, 5)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="horario-no-disponible">
                      <FaExclamationTriangle /> No hay horarios disponibles para esta fecha
                    </div>
                  )}

                  {errors.hora && <span className="error-text">{errors.hora}</span>}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "Creando..." : "Crear Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para seleccionar cliente */}
      {showClienteModal && (
        <div className="modal-overlay">
          <div className="modal-content selector-modal-content">
            <div className="modal-header">
              <h3>
                <FaUser /> Seleccionar Cliente
              </h3>
              <button className="modal-close" onClick={() => setShowClienteModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-form">
              <div className="selector-search">
                <FaSearch className="selector-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, documento, correo o teléfono..."
                  value={clienteBusqueda}
                  onChange={(e) => {
                    setClienteBusqueda(e.target.value)
                    setClientePagina(1)
                  }}
                />
              </div>

              <div className="selector-list">
                {clientesPaginados.length > 0 ? (
                  clientesPaginados.map((cliente) => (
                    <div
                      key={cliente.id}
                      className={`selector-item ${clienteSeleccionado?.id === cliente.id ? "selected" : ""}`}
                      onClick={() => handleClienteSelect(cliente)}
                    >
                      <div className="selector-item-header">
                        <span className="selector-item-title">
                          {cliente.nombre} {cliente.apellido}
                        </span>
                        <span className="selector-item-subtitle">
                          {cliente.tipo_documento}: {cliente.documento}
                        </span>
                      </div>
                      <div className="selector-item-details">
                        <span className="selector-item-detail">
                          <FaEnvelope /> {cliente.correo || "Sin correo"}
                        </span>
                        <span className="selector-item-detail">
                          <FaPhone /> {cliente.telefono || "Sin teléfono"}
                        </span>
                        <span className="selector-item-detail">
                          <FaMapMarkerAlt /> {cliente.direccion || "Sin dirección"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="selector-no-results">
                    <FaExclamationTriangle className="selector-no-results-icon" />
                    <p>No se encontraron clientes con los criterios de búsqueda</p>
                  </div>
                )}
              </div>

              {totalPaginasClientes > 1 && (
                <div className="selector-pagination">
                  <button
                    className="selector-pagination-button"
                    onClick={() => setClientePagina((prev) => Math.max(prev - 1, 1))}
                    disabled={clientePagina === 1}
                  >
                    <FaChevronLeft />
                  </button>

                  {Array.from({ length: totalPaginasClientes }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`selector-pagination-button ${clientePagina === i + 1 ? "active" : ""}`}
                      onClick={() => setClientePagina(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="selector-pagination-button"
                    onClick={() => setClientePagina((prev) => Math.min(prev + 1, totalPaginasClientes))}
                    disabled={clientePagina === totalPaginasClientes}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowClienteModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para seleccionar vehículo */}
      {showVehiculoModal && (
        <div className="modal-overlay">
          <div className="modal-content selector-modal-content">
            <div className="modal-header">
              <h3>
                <FaCar /> Seleccionar Vehículo
              </h3>
              <button className="modal-close" onClick={() => setShowVehiculoModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-form">
              <div className="selector-search">
                <FaSearch className="selector-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por marca, modelo, placa o color..."
                  value={vehiculoBusqueda}
                  onChange={(e) => {
                    setVehiculoBusqueda(e.target.value)
                    setVehiculoPagina(1)
                  }}
                />
              </div>

              <div className="selector-list">
                {vehiculosPaginados.length > 0 ? (
                  vehiculosPaginados.map((vehiculo) => (
                    <div
                      key={vehiculo.id}
                      className={`selector-item ${vehiculoSeleccionado?.id === vehiculo.id ? "selected" : ""}`}
                      onClick={() => handleVehiculoSelect(vehiculo)}
                    >
                      <div className="selector-item-header">
                        <span className="selector-item-title">
                          {vehiculo.marca} {vehiculo.modelo}
                        </span>
                        <span className="selector-item-subtitle">Placa: {vehiculo.placa}</span>
                      </div>
                      <div className="selector-item-details">
                        <span className="selector-item-detail">
                          <FaPalette /> {vehiculo.color || "Sin color"}
                        </span>
                        <span className="selector-item-detail">
                          <FaCalendarAlt /> {vehiculo.año || "Sin año"}
                        </span>
                        <span className="selector-item-detail">
                          <FaTag /> {vehiculo.estado || "Sin estado"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="selector-no-results">
                    <FaExclamationTriangle className="selector-no-results-icon" />
                    <p>
                      {clienteSeleccionado
                        ? "Este cliente no tiene vehículos registrados"
                        : "No se encontraron vehículos con los criterios de búsqueda"}
                    </p>
                  </div>
                )}
              </div>

              {totalPaginasVehiculos > 1 && (
                <div className="selector-pagination">
                  <button
                    className="selector-pagination-button"
                    onClick={() => setVehiculoPagina((prev) => Math.max(prev - 1, 1))}
                    disabled={vehiculoPagina === 1}
                  >
                    <FaChevronLeft />
                  </button>

                  {Array.from({ length: totalPaginasVehiculos }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`selector-pagination-button ${vehiculoPagina === i + 1 ? "active" : ""}`}
                      onClick={() => setVehiculoPagina(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="selector-pagination-button"
                    onClick={() => setVehiculoPagina((prev) => Math.min(prev + 1, totalPaginasVehiculos))}
                    disabled={vehiculoPagina === totalPaginasVehiculos}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowVehiculoModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para seleccionar mecánico */}
      {showMecanicoModal && (
        <div className="modal-overlay">
          <div className="modal-content selector-modal-content">
            <div className="modal-header">
              <h3>
                <FaWrench /> Seleccionar Mecánico
              </h3>
              <button className="modal-close" onClick={() => setShowMecanicoModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-form">
              <div className="selector-search">
                <FaSearch className="selector-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, documento o especialidad..."
                  value={mecanicoBusqueda}
                  onChange={(e) => {
                    setMecanicoBusqueda(e.target.value)
                    setMecanicoPagina(1)
                  }}
                />
              </div>

              <div className="selector-list">
                {mecanicosPaginados.length > 0 ? (
                  mecanicosPaginados.map((mecanico) => (
                    <div
                      key={mecanico.id}
                      className={`selector-item ${mecanicoSeleccionado?.id === mecanico.id ? "selected" : ""}`}
                      onClick={() => handleMecanicoSelect(mecanico)}
                    >
                      <div className="selector-item-header">
                        <span className="selector-item-title">
                          {mecanico.nombre} {mecanico.apellido}
                        </span>
                        <span className="selector-item-subtitle">
                          {mecanico.tipo_documento}: {mecanico.documento}
                        </span>
                      </div>
                      <div className="selector-item-details">
                        <span className="selector-item-detail">
                          <FaTools /> {mecanico.especialidad || "Sin especialidad"}
                        </span>
                        <span className="selector-item-detail">
                          <FaPhone /> {mecanico.telefono || "Sin teléfono"}
                        </span>
                        <span className="selector-item-detail">
                          <FaEnvelope /> {mecanico.correo || "Sin correo"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="selector-no-results">
                    <FaExclamationTriangle className="selector-no-results-icon" />
                    <p>No se encontraron mecánicos activos con los criterios de búsqueda</p>
                  </div>
                )}
              </div>

              {totalPaginasMecanicos > 1 && (
                <div className="selector-pagination">
                  <button
                    className="selector-pagination-button"
                    onClick={() => setMecanicoPagina((prev) => Math.max(prev - 1, 1))}
                    disabled={mecanicoPagina === 1}
                  >
                    <FaChevronLeft />
                  </button>

                  {Array.from({ length: totalPaginasMecanicos }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`selector-pagination-button ${mecanicoPagina === i + 1 ? "active" : ""}`}
                      onClick={() => setMecanicoPagina(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="selector-pagination-button"
                    onClick={() => setMecanicoPagina((prev) => Math.min(prev + 1, totalPaginasMecanicos))}
                    disabled={mecanicoPagina === totalPaginasMecanicos}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowMecanicoModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  )
}

export default CitasCalendar

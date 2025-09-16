"use client"

import { useState, useEffect, useRef } from "react"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"
import {
  FaCalendarAlt,
  FaCar,
  FaClipboardList,
  FaArrowLeft,
  FaCheck,
  FaExclamationTriangle,
  FaClock,
  FaTools,
  FaTimes,
  FaSearch,
  FaUser,
} from "react-icons/fa"
import { CheckCircle } from "lucide-react"
import "../../../shared/styles/Citas/CrearCita.css" // Usando estilos del admin para consistencia

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Modal para seleccionar hora
const HoraModal = ({ show, onClose, onSelect, horaActual, horariosMecanico = [], citasMecanico = [], formData = {} }) => {
  const modalRef = useRef(null)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) onClose()
    }
    if (show) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [show, onClose])

  const generarHoras = () => {
    const horas = []
    for (let i = 8; i < 18; i++) {
      const hora = `${i.toString().padStart(2, "0")}:00`
      horas.push({ id: hora, hora, descripcion: `${hora} - ${(i + 1).toString().padStart(2, "0")}:00` })
    }
    return horas
  }

  const fechaSeleccionada = formData?.fecha
  const mecanicoId = Number(formData?.mecanico_id)
  const novedadesFiltradas = horariosMecanico.filter(
    (n) => n.mecanico_id === mecanicoId && n.fecha && n.fecha.split("T")[0] === fechaSeleccionada,
  )

  const tieneAusencia = novedadesFiltradas.some((n) => n.tipo_novedad === "Ausencia")

  const todasLasHoras = generarHoras()
  const horasBloqueadas = []

  // FIX: Use local date to avoid timezone issues with `toISOString()`
  const today = new Date()
  const localDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`
  const esHoy = fechaSeleccionada === localDateString
  const now = new Date().getHours()

  if (esHoy) {
    todasLasHoras.forEach((hora) => {
      const horaNumero = Number.parseInt(hora.hora.split(":")[0])
      if (horaNumero <= now) {
        horasBloqueadas.push(hora.hora)
      }
    })
  }

  novedadesFiltradas.forEach((novedad) => {
    if (novedad.tipo_novedad === "Ausencia") {
      todasLasHoras.forEach((h) => horasBloqueadas.push(h.hora))
    } else if (novedad.hora_inicio && novedad.hora_fin) {
      const inicio = Number.parseInt(novedad.hora_inicio.split(":")[0])
      const fin = Number.parseInt(novedad.hora_fin.split(":")[0])
      for (let h = inicio; h < fin; h++) {
        horasBloqueadas.push(`${h.toString().padStart(2, "0")}:00`)
      }
    }
  })

  const horasOcupadas = citasMecanico
    .filter((cita) => {
      if (!cita.fecha) return false
      const fechaCita = cita.fecha.includes("T") ? cita.fecha.split("T")[0] : cita.fecha
      return fechaCita === fechaSeleccionada && Number(cita.mecanico_id) === mecanicoId
    })
    .map((cita) => (typeof cita.hora === "string" && cita.hora.length >= 5 ? cita.hora.slice(0, 5) : cita.hora))

  const horasNoDisponibles = Array.from(new Set([...horasBloqueadas, ...horasOcupadas]))
  const horasFiltradas = todasLasHoras.filter((hora) => !horasNoDisponibles.includes(hora.hora))

  if (!show) return null

  return (
    <div className="crearCita-modal-overlay">
      <div className="crearCita-hora-modal" ref={modalRef}>
        <div className="crearCita-modal-header">
          <h2>
            <FaClock className="crearCita-modal-header-icon" />
            Seleccionar Hora
          </h2>
          <button type="button" className="crearCita-modal-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="crearCita-modal-content">
          <div className="crearCita-horas-grid">
            {tieneAusencia ? (
              <div className="crearCita-no-results">
                <FaExclamationTriangle className="crearCita-no-results-icon" />
                <p>El mecánico no está disponible este día por ausencia.</p>
              </div>
            ) : horasFiltradas.length === 0 ? (
              <div className="crearCita-no-results">
                <FaExclamationTriangle className="crearCita-no-results-icon" />
                <p>No hay horas disponibles</p>
              </div>
            ) : (
              horasFiltradas.map((hora) => (
                <div
                  key={hora.id}
                  className={`crearCita-hora-card ${horaActual === hora.hora ? "selected" : ""}`}
                  onClick={() => onSelect(hora)}
                >
                  <div className="crearCita-hora-time">
                    <FaClock className="crearCita-hora-icon" />
                    {hora.hora}
                  </div>
                  <div className="crearCita-hora-description">{hora.descripcion}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente principal
const AgendarCita = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({})
  const [vehiculos, setVehiculos] = useState([])
  const [mecanicos, setMecanicos] = useState([])
  const [errors, setErrors] = useState({})

  const [mostrarModalHoras, setMostrarModalHoras] = useState(false)
  const [horaSeleccionada, setHoraSeleccionada] = useState(null)

  const [novedadesDia, setNovedadesDia] = useState([])
  const [horariosMecanico, setHorariosMecanico] = useState([])
  const [citasMecanico, setCitasMecanico] = useState([])

  const [formData, setFormData] = useState({
    fecha: "",
    vehiculo_id: "",
    mecanico_id: "",
    hora: "",
    observaciones: "",
  })

  const makeRequest = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      if (!token) throw new Error("No hay token disponible")

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`)

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json()
      } else {
        return {}
      }
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error)
      throw error
    }
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setUserData(user)

          const vehiculosResponse = await makeRequest(`/vehiculos/cliente/${user.id}`)
          const vehiculosData = Array.isArray(vehiculosResponse) ? vehiculosResponse : vehiculosResponse?.data || []
          const vehiculosActivos = vehiculosData.filter((v) => v.estado === "Activo")
          setVehiculos(vehiculosActivos)

          const mecanicosRes = await makeRequest("/mecanicos")
          const mecanicosData = Array.isArray(mecanicosRes) ? mecanicosRes : mecanicosRes?.data || []
          setMecanicos(mecanicosData.filter((m) => m.estado === "Activo"))
        }
      } catch (error) {
        console.error("Error cargando datos iniciales:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    const fetchNovedadesDia = async () => {
      if (formData.fecha) {
        try {
          const res = await makeRequest(`/horarios?fecha=${formData.fecha}`)
          setNovedadesDia(Array.isArray(res) ? res : res?.data || [])
        } catch {
          setNovedadesDia([])
        }
      } else {
        setNovedadesDia([])
      }
    }
    fetchNovedadesDia()
  }, [formData.fecha])

  useEffect(() => {
    const fetchHorariosYCitas = async () => {
      if (formData.fecha && formData.mecanico_id) {
        try {
          const horariosRes = await makeRequest(`/horarios?fecha=${formData.fecha}&mecanico_id=${formData.mecanico_id}`)
          setHorariosMecanico(Array.isArray(horariosRes) ? horariosRes : horariosRes?.data || [])

          const citasRes = await makeRequest(`/citas?fecha=${formData.fecha}&mecanico_id=${formData.mecanico_id}`)
          setCitasMecanico(Array.isArray(citasRes) ? citasRes : citasRes?.data || [])
        } catch {
          setHorariosMecanico([])
          setCitasMecanico([])
        }
      } else {
        setHorariosMecanico([])
        setCitasMecanico([])
      }
    }
    fetchHorariosYCitas()
  }, [formData.fecha, formData.mecanico_id])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fecha) {
      newErrors.fecha = "Debe seleccionar una fecha"
    } else {
      const selectedDate = new Date(formData.fecha + "T00:00:00")
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.fecha = "No puede seleccionar una fecha pasada"
      }

      if (selectedDate.getDay() === 0) {
        newErrors.fecha = "No se pueden agendar citas los domingos"
      }
    }

    if (!formData.mecanico_id) {
      newErrors.mecanico_id = "Debe seleccionar un mecánico"
    }

    if (!formData.hora) {
      newErrors.hora = "Debe seleccionar una hora"
    }

    if (!formData.vehiculo_id) {
      newErrors.vehiculo_id = "Debe seleccionar un vehículo"
    }

    if (!formData.observaciones.trim()) {
      newErrors.observaciones = "Debe agregar observaciones sobre el servicio requerido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFechaChange = (e) => {
    const { value } = e.target
    setHoraSeleccionada(null)
    setFormData({
      ...formData,
      fecha: value,
      mecanico_id: "",
      hora: "",
    })
    if (errors.fecha) {
      setErrors((prev) => ({ ...prev, fecha: "" }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newState = { ...prev, [name]: value }
      if (name === "mecanico_id") {
        newState.hora = ""
        setHoraSeleccionada(null)
      }
      return newState
    })

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSeleccionarHora = (hora) => {
    setHoraSeleccionada(hora)
    setFormData({ ...formData, hora: hora.hora })
    setMostrarModalHoras(false)
    if (errors.hora) setErrors((prev) => ({ ...prev, hora: "" }))
  }

  const limpiarHora = () => {
    setHoraSeleccionada(null)
    setFormData({ ...formData, hora: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, revisa y completa todos los campos obligatorios.",
        confirmButtonColor: "#f59e0b",
      })
      return
    }

    try {
      setLoading(true)

      const citaData = {
        fecha: formData.fecha,
        hora: formData.hora,
        observaciones: formData.observaciones,
        vehiculo_id: Number.parseInt(formData.vehiculo_id),
        mecanico_id: Number.parseInt(formData.mecanico_id),
        cliente_id: userData.id,
      }

      await makeRequest("/citas/cliente/crear", {
        method: "POST",
        body: JSON.stringify(citaData),
      })

      await Swal.fire({
        icon: "success",
        title: "¡Cita Agendada!",
        text: "Tu cita ha sido programada exitosamente. Nos pondremos en contacto para confirmar los detalles.",
        confirmButtonColor: "#10b981",
        timer: 3000,
        timerProgressBar: true,
      })
      navigate("/client/dashboard")
    } catch (error) {
      console.error("Error creando la cita:", error)
      await Swal.fire({
        icon: "error",
        title: "Error al Agendar",
        text: "No se pudo agendar la cita. Por favor, intenta nuevamente.",
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setLoading(false)
    }
  }

  const mecanicosDisponibles = formData.fecha
    ? mecanicos.filter((mecanico) => {
        if (novedadesDia && novedadesDia.length > 0) {
          const tieneAusencia = novedadesDia.some(
            (n) => n.mecanico_id === mecanico.id && n.tipo_novedad === "Ausencia",
          )
          return !tieneAusencia
        }
        return true
      })
    : []

  return (
    <div className="crearCita-container">
      <div className="crearCita-header">
        <div className="crearCita-headerContent">
          <div className="crearCita-iconContainer">
            <FaCalendarAlt className="crearCita-icon" />
          </div>
          <div className="crearCita-titleSection">
            <h1 className="crearCita-title">Agendar Nueva Cita</h1>
            <p className="crearCita-subtitle">Completa el formulario para programar tu cita</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate("/client/dashboard")} className="crearCita-backButton">
          <FaArrowLeft /> Volver
        </button>
      </div>

      <div className="crearCita-content">
        <form onSubmit={handleSubmit} className="crearCita-mainCard">
          {loading ? (
            <div className="crearCita-loading">
              <div className="crearCita-spinner"></div>
              <p>Cargando...</p>
            </div>
          ) : (
            <>
              <div className="crearCita-form-section">
                <FaCalendarAlt className="crearCita-section-icon" />
                <h2 className="crearCita-section-title">Información de la Cita</h2>
                <div className="crearCita-form-grid">
                  <div className="crearCita-form-group">
                    <label className="crearCita-label">Fecha *</label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleFechaChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={`crearCita-form-input ${errors.fecha ? "error" : ""}`}
                    />
                    {errors.fecha && <span className="crearCita-error-text">{errors.fecha}</span>}
                  </div>
                  <div className="crearCita-form-group">
                    <label className="crearCita-label">Mecánico *</label>
                    <select
                      name="mecanico_id"
                      value={formData.mecanico_id}
                      onChange={handleInputChange}
                      disabled={!formData.fecha || mecanicosDisponibles.length === 0}
                      className={`crearCita-form-input ${errors.mecanico_id ? "error" : ""} ${
                        !formData.fecha ? "disabled" : ""
                      }`}
                    >
                      <option value="">Seleccione un mecánico</option>
                      {mecanicosDisponibles.map((mecanico) => (
                        <option key={mecanico.id} value={mecanico.id}>
                          {mecanico.nombre} {mecanico.apellido}
                        </option>
                      ))}
                    </select>
                    {errors.mecanico_id && <span className="crearCita-error-text">{errors.mecanico_id}</span>}
                  </div>

                  <div className="crearCita-form-group">
                    <label className="crearCita-label">Hora *</label>
                    <div className="crearCita-input-container">
                      <input
                        type="text"
                        placeholder="Seleccione una hora"
                        value={horaSeleccionada ? horaSeleccionada.hora : ""}
                        onClick={() => formData.mecanico_id && setMostrarModalHoras(true)}
                        readOnly
                        disabled={!formData.mecanico_id}
                        className={`crearCita-form-input ${errors.hora ? "error" : ""} ${
                          !formData.mecanico_id ? "disabled" : ""
                        }`}
                      />
                      {horaSeleccionada && (
                        <button type="button" className="crearCita-clear-button" onClick={limpiarHora}>
                          <FaTimes />
                        </button>
                      )}
                    </div>
                    {errors.hora && <span className="crearCita-error-text">{errors.hora}</span>}
                  </div>
                </div>
              </div>

              <div className="crearCita-form-section">
                <h2 className="crearCita-section-title">
                  <FaCar className="crearCita-section-icon" />
                  Vehículo y Servicio
                </h2>
                <div className="crearCita-form-grid">
                  <div className="crearCita-form-group">
                    <label className="crearCita-label">Vehículo *</label>
                    {vehiculos.length > 0 ? (
                      <select
                        name="vehiculo_id"
                        value={formData.vehiculo_id}
                        onChange={handleInputChange}
                        className={`crearCita-form-input ${errors.vehiculo_id ? "error" : ""}`}
                      >
                        <option value="">Seleccione un vehículo</option>
                        {vehiculos.map((vehiculo) => (
                          <option key={vehiculo.id} value={vehiculo.id}>
                            {vehiculo.placa} - {vehiculo.marca_nombre} {vehiculo.referencia_nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="crearCita-info-text">
                        No tienes vehículos activos.{" "}
                        <button
                          type="button"
                          onClick={() => navigate("/client/vehiculos/crear")}
                          className="crearCita-link-button"
                        >
                          Registrar uno
                        </button>
                      </div>
                    )}
                    {errors.vehiculo_id && <span className="crearCita-error-text">{errors.vehiculo_id}</span>}
                  </div>

                  <div className="crearCita-form-group">
                    <label className="crearCita-label">Describe el servicio que necesitas *</label>
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Ej: Cambio de aceite, revisión de frenos, etc."
                      className={`crearCita-form-input crearCita-textarea ${errors.observaciones ? "error" : ""}`}
                    />
                    {errors.observaciones && <span className="crearCita-error-text">{errors.observaciones}</span>}
                  </div>
                </div>
              </div>

              <div className="crearCita-form-actions">
                <button type="button" onClick={() => navigate("/client/dashboard")} className="crearCita-cancel-button">
                  Cancelar
                </button>
                <button type="submit" className="crearCita-submit-button" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="crearCita-spinner spinning"></div>
                      Agendando...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Agendar Cita
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {mostrarModalHoras && (
        <HoraModal
          show={mostrarModalHoras}
          onClose={() => setMostrarModalHoras(false)}
          onSelect={handleSeleccionarHora}
          horaActual={formData.hora}
          horariosMecanico={horariosMecanico}
          citasMecanico={citasMecanico}
          formData={formData}
        />
      )}
    </div>
  )
}

export default AgendarCita

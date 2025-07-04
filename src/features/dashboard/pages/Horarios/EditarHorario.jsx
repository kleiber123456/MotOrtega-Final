"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FaClock, FaArrowLeft, FaSave, FaTimes } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../components/layout/layout.jsx"
import "../../../../shared/styles/Horarios/EditarHorario.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

// Devuelve la fecha mínima permitida (hoy - 3 días)
const getFechaMinima = () => {
  const hoy = new Date()
  hoy.setDate(hoy.getDate() - 3)
  return hoy.toISOString().split("T")[0]
}

const EditarHorario = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [horarioOriginal, setHorarioOriginal] = useState(null)

  const [horario, setHorario] = useState({
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    descripcion: "",
  })

  const makeRequest = async (endpoint, options = {}) => {
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
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error)
      throw error
    }
  }

  const cargarHorario = async () => {
    try {
      setLoading(true)
      const horarioData = await makeRequest(`/horarios/${id}`)

      if (!horarioData || Object.keys(horarioData).length === 0) {
        Swal.fire({
          icon: "error",
          title: "No encontrado",
          text: "No se encontró el horario solicitado.",
          confirmButtonColor: "#dc3545",
        }).then(() => {
          navigate("/Horarios")
        })
        return
      }

      setHorarioOriginal(horarioData)
      setHorario({
        fecha: horarioData.fecha.split("T")[0], // Tomar solo la parte de la fecha YYYY-MM-DD
        hora_inicio: horarioData.hora_inicio,
        hora_fin: horarioData.hora_fin,
        descripcion: horarioData.descripcion || "",
      })
    } catch (error) {
      console.error("Error al cargar horario:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el horario.",
        confirmButtonColor: "#dc3545",
      }).then(() => {
        navigate("/Horarios")
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      cargarHorario()
    }
  }, [id])

  // Validar y limpiar si el usuario selecciona un domingo o fecha fuera de rango
  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === "fecha" && value) {
      const [anio, mes, dia] = value.split("-")
      const dateObj = new Date(`${anio}-${mes}-${dia}T12:00:00`)
      const diaSemana = diasSemana[dateObj.getDay()]
      const fechaMinima = getFechaMinima()

      // Si es domingo
      if (diaSemana === "Domingo") {
        setHorario((prev) => ({ ...prev, fecha: "" }))
        setErrors((prev) => ({
          ...prev,
          fecha: "No se pueden editar novedades para domingos (día no laboral)",
        }))
        return
      }

      // Si es menor a la fecha mínima
      if (value < fechaMinima) {
        setHorario((prev) => ({ ...prev, fecha: "" }))
        setErrors((prev) => ({
          ...prev,
          fecha: "No se pueden editar novedades para fechas con más de 3 días de antigüedad",
        }))
        return
      }
    }

    setHorario((prev) => ({
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

  const validarHorario = () => {
    const newErrors = {}

    if (!horario.fecha) {
      newErrors.fecha = "La fecha es requerida"
    } else {
      const [anio, mes, dia] = horario.fecha.split("-")
      const dateObj = new Date(`${anio}-${mes}-${dia}T12:00:00`)
      const diaSemana = diasSemana[dateObj.getDay()]
      const fechaMinima = getFechaMinima()

      if (diaSemana === "Domingo") {
        newErrors.fecha = "No se pueden editar novedades para domingos (día no laboral)"
      }
      if (horario.fecha < fechaMinima) {
        newErrors.fecha = "No se pueden editar novedades para fechas con más de 3 días de antigüedad"
      }
    }

    if (!horario.hora_inicio) {
      newErrors.hora_inicio = "La hora de inicio es requerida"
    }

    if (!horario.hora_fin) {
      newErrors.hora_fin = "La hora de fin es requerida"
    }

    // Validar que la hora de fin sea mayor que la hora de inicio
    if (horario.hora_inicio && horario.hora_fin) {
      const [horaInicio, minutoInicio] = horario.hora_inicio.split(":").map(Number)
      const [horaFin, minutoFin] = horario.hora_fin.split(":").map(Number)

      const minutosInicio = horaInicio * 60 + minutoInicio
      const minutosFin = horaFin * 60 + minutoFin

      if (minutosFin <= minutosInicio) {
        newErrors.hora_fin = "La hora de fin debe ser mayor que la hora de inicio"
      }

      // Validar horario laboral (6:00 AM - 8:00 PM)
      if (minutosInicio < 360) {
        // 6:00 AM
        newErrors.hora_inicio = "La hora de inicio no puede ser antes de las 6:00 AM"
      }

      if (minutosFin > 1200) {
        // 8:00 PM
        newErrors.hora_fin = "La hora de fin no puede ser después de las 8:00 PM"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validarHorario()) return

    try {
      setLoading(true)
      const [anio, mes, dia] = horario.fecha.split("-")
      const dateObj = new Date(`${anio}-${mes}-${dia}T12:00:00`)
      const diaSemana = diasSemana[dateObj.getDay()]

      const horarioPayload = {
        fecha: horario.fecha,
        dia: diaSemana,
        motivo: horario.descripcion || horarioOriginal?.motivo || "",
        tipo_novedad: horarioOriginal?.tipo_novedad || "",
        mecanico_id: horarioOriginal?.mecanico_id || "",
        hora_inicio: normalizarHora(horario.hora_inicio),
        hora_fin: normalizarHora(horario.hora_fin),
        descripcion: horario.descripcion,
      }

      console.log("Payload enviado:", horarioPayload)

      await makeRequest(`/horarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") || sessionStorage.getItem("token"),
        },
        body: JSON.stringify(horarioPayload),
      })

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Horario actualizado correctamente",
        confirmButtonColor: "#2d3748",
      }).then(() => {
        navigate("/Horarios")
      })
    } catch (error) {
      console.error("Error al actualizar horario:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el horario. Verifique que no exista un horario conflictivo.",
        confirmButtonColor: "#dc3545",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/Horarios")
  }

  const esFechaPasada = (fecha) => {
    const fechaHorario = new Date(fecha + "T12:00:00")
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return fechaHorario < hoy
  }

  // Formatear fecha sin desfase de zona horaria y mostrar día de la semana en español
  const formatearFecha = (fecha) => {
    if (!fecha) return ""
    let fechaStr = fecha
    if (fechaStr.includes("T")) {
      fechaStr = fechaStr.split("T")[0]
    }
    const [anio, mes, dia] = fechaStr.split("-")
    // Crear objeto Date a las 12:00 para evitar desfase y obtener el día de la semana
    const dateObj = new Date(`${anio}-${mes}-${dia}T12:00:00`)
    const diaSemana = dateObj.toLocaleDateString("es-ES", { weekday: "long" })
    return `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${dia}/${mes}/${anio}`
  }

  const pad = (n) => n.toString().padStart(2, "0")
  const normalizarHora = (hora) => {
    if (!hora) return ""
    // Si ya tiene segundos, retorna igual
    if (hora.length === 8) return hora
    // Si viene como "HH:mm", agrega ":00"
    if (hora.length === 5) return `${hora}:00`
    return hora
  }

  if (loading && !horarioOriginal) {
    return (
      <div className="editar-horario-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando horario...</p>
        </div>
      </div>
    )
  }

  const fechaPasada = horarioOriginal && esFechaPasada(horarioOriginal.fecha)

  return (
    <div className="editarHorario-container">
      <div className="editarUsuario-header">
        <div className="editarUsuario-header-left">
          <button
            className="editarUsuario-btn-back"
            onClick={handleCancel}
            type="button"
            disabled={loading}
          >
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarUsuario-title-section">
            <h1 className="editarUsuario-page-title">
              <FaClock className="editarUsuario-title-icon" />
              Editar Horario
            </h1>
            <p className="editarUsuario-subtitle">Modifica la información del horario.</p>
          </div>
        </div>
      </div>

      {fechaPasada && (
        <div className="editarHorario-alerta">
          <strong>¡Atención!</strong>
          <span> Este horario corresponde a una fecha pasada y no puede ser editado.</span>
        </div>
      )}

      <div className="editarHorario-content">
        <div className="editarHorario-form-card">
          <form onSubmit={handleSubmit} className="editarHorario-form">
            <div className="editarHorario-form-header">
              <h3 className="editarHorario-form-title">Información del Horario</h3>
              <p className="editarHorario-form-description">
                Aquí puedes modificar la información del horario. Los campos marcados con (*) son obligatorios.
              </p>
            </div>

            <div className="editarHorario-form-content">
              {horarioOriginal && (
                <div className="editarHorario-current-info">
                  <h4>Horario Actual:</h4>
                  <p>
                    <strong>Fecha:</strong> {formatearFecha(horarioOriginal.fecha)}
                  </p>
                  <p>
                    <strong>Horario:</strong> {horarioOriginal.hora_inicio.substring(0, 5)} -{" "}
                    {horarioOriginal.hora_fin.substring(0, 5)}
                  </p>
                  {horarioOriginal.descripcion && (
                    <p>
                      <strong>Descripción:</strong> {horarioOriginal.descripcion}
                    </p>
                  )}
                </div>
              )}

              <div className="editarHorario-form-grid">
                <div className="editarHorario-form-group">
                  <label htmlFor="fecha" className="editarHorario-label">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    id="fecha"
                    value={horario.fecha}
                    onChange={handleInputChange}
                    min={getFechaMinima()}
                    className={`editarHorario-input ${errors.fecha ? "editarHorario-input-error" : ""}`}
                    disabled={loading || fechaPasada}
                  />
                  {errors.fecha && <p className="editarHorario-error-text">{errors.fecha}</p>}
                </div>

                <div className="editarHorario-form-group">
                  <label htmlFor="hora_inicio" className="editarHorario-label">
                    Hora de Inicio *
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    id="hora_inicio"
                    value={horario.hora_inicio}
                    onChange={handleInputChange}
                    className={`editarHorario-input ${errors.hora_inicio ? "editarHorario-input-error" : ""}`}
                    disabled={loading || fechaPasada}
                    min="06:00"
                    max="20:00"
                  />
                  {errors.hora_inicio && <p className="editarHorario-error-text">{errors.hora_inicio}</p>}
                </div>

                <div className="editarHorario-form-group">
                  <label htmlFor="hora_fin" className="editarHorario-label">
                    Hora de Fin *
                  </label>
                  <input
                    type="time"
                    name="hora_fin"
                    id="hora_fin"
                    value={horario.hora_fin}
                    onChange={handleInputChange}
                    className={`editarHorario-input ${errors.hora_fin ? "editarHorario-input-error" : ""}`}
                    disabled={loading || fechaPasada}
                    min="06:00"
                    max="20:00"
                  />
                  {errors.hora_fin && <p className="editarHorario-error-text">{errors.hora_fin}</p>}
                </div>

                <div className="editarHorario-form-group editarHorario-form-group-full">
                  <label htmlFor="descripcion" className="editarHorario-label">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    rows="3"
                    value={horario.descripcion}
                    onChange={handleInputChange}
                    className="editarHorario-textarea"
                    placeholder="Descripción del horario (ej: Horario especial, Mantenimiento, etc.)"
                    disabled={loading || fechaPasada}
                  />
                </div>
              </div>
            </div>

            <div className="editarHorario-form-actions">
              <button type="button" className="editarHorario-btn-cancel" onClick={handleCancel} disabled={loading}>
                <FaTimes /> Cancelar
              </button>
              <button type="submit" className="editarHorario-btn-submit" disabled={loading || fechaPasada}>
                {loading ? (
                  <>
                    <div className="editarHorario-spinner"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <FaSave /> Actualizar Horario
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="editarHorario-info-card">
          <div className="editarHorario-info-header">
            <h3 className="editarHorario-info-title">Información Importante</h3>
            <p className="editarHorario-info-description">Consideraciones al editar un horario.</p>
          </div>
          <ul className="editarHorario-info-list">
            <li>Los horarios deben estar entre las 6:00 AM y 6:00 PM</li>
            <li>La hora de fin debe ser mayor que la hora de inicio</li>
            <li>No se pueden editar horarios de fechas pasadas</li>
            <li>Los cambios pueden afectar las citas programadas</li>
            <li>Verifique que no existan conflictos con otros horarios</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default EditarHorario

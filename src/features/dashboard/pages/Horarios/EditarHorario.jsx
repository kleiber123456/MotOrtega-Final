"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FaClock, FaCalendarAlt, FaArrowLeft, FaSave, FaTimes, FaExclamationTriangle } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../components/layout/layout.jsx"
import "../../../../shared/styles/Horarios/EditarHorario.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

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
          Authorization: `Bearer ${token}`,
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

  const cargarHorario = async () => {
    try {
      setLoading(true)
      const response = await makeRequest(`/horarios/${id}`)
      const horarioData = response.data

      setHorarioOriginal(horarioData)
      setHorario({
        fecha: horarioData.fecha,
        hora_inicio: horarioData.hora_inicio,
        hora_fin: horarioData.hora_fin,
        descripcion: horarioData.descripcion || "",
      })
    } catch (error) {
      console.error("Error al cargar horario:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el horario",
        confirmButtonColor: "#dc3545",
      }).then(() => {
        navigate("/dashboard/horarios")
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
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
      // Validar que la fecha no sea en el pasado (solo si se está cambiando)
      if (horario.fecha !== horarioOriginal?.fecha) {
        const fechaHorario = new Date(horario.fecha)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)

        if (fechaHorario < hoy) {
          newErrors.fecha = "La fecha no puede ser en el pasado"
        }
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

      // Validar horario laboral (6:00 AM - 6:00 PM)
      if (minutosInicio < 360) {
        // 6:00 AM
        newErrors.hora_inicio = "La hora de inicio no puede ser antes de las 6:00 AM"
      }

      if (minutosFin > 1080) {
        // 6:00 PM
        newErrors.hora_fin = "La hora de fin no puede ser después de las 6:00 PM"
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

      await makeRequest(`/horarios/${id}`, {
        method: "PUT",
        body: JSON.stringify(horario),
      })

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Horario actualizado correctamente",
        confirmButtonColor: "#2d3748",
      }).then(() => {
        navigate("/dashboard/horarios")
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
    navigate("/dashboard/horarios")
  }

  const esFechaPasada = (fecha) => {
    const fechaHorario = new Date(fecha)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return fechaHorario < hoy
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
    <div className="editar-horario-container">
      <div className="editar-horario-header">
        <div className="header-content">
          <div className="header-title">
            <FaClock className="header-icon" />
            <h1>Editar Horario</h1>
          </div>
          <button className="btn-volver" onClick={handleCancel} disabled={loading}>
            <FaArrowLeft /> Volver
          </button>
        </div>
      </div>

      {fechaPasada && (
        <div className="alerta-fecha-pasada">
          <FaExclamationTriangle />
          <span>Este horario corresponde a una fecha pasada y no puede ser editado</span>
        </div>
      )}

      <div className="editar-horario-content">
        <div className="form-card">
          <form onSubmit={handleSubmit} className="horario-form">
            <div className="form-section">
              <h3>
                <FaCalendarAlt /> Información del Horario
              </h3>

              {horarioOriginal && (
                <div className="horario-actual">
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fecha">
                    <FaCalendarAlt /> Fecha *
                  </label>
                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={horario.fecha}
                    onChange={handleInputChange}
                    className={errors.fecha ? "error" : ""}
                    disabled={loading || fechaPasada}
                  />
                  {errors.fecha && <span className="error-text">{errors.fecha}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="hora_inicio">
                    <FaClock /> Hora de Inicio *
                  </label>
                  <input
                    type="time"
                    id="hora_inicio"
                    name="hora_inicio"
                    value={horario.hora_inicio}
                    onChange={handleInputChange}
                    className={errors.hora_inicio ? "error" : ""}
                    disabled={loading || fechaPasada}
                    min="06:00"
                    max="18:00"
                  />
                  {errors.hora_inicio && <span className="error-text">{errors.hora_inicio}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="hora_fin">
                    <FaClock /> Hora de Fin *
                  </label>
                  <input
                    type="time"
                    id="hora_fin"
                    name="hora_fin"
                    value={horario.hora_fin}
                    onChange={handleInputChange}
                    className={errors.hora_fin ? "error" : ""}
                    disabled={loading || fechaPasada}
                    min="06:00"
                    max="18:00"
                  />
                  {errors.hora_fin && <span className="error-text">{errors.hora_fin}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">
                  <FaExclamationTriangle /> Descripción (Opcional)
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={horario.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción del horario (ej: Horario especial, Mantenimiento, etc.)"
                  rows="3"
                  disabled={loading || fechaPasada}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
                <FaTimes /> Cancelar
              </button>
              <button type="submit" className="btn-submit" disabled={loading || fechaPasada}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
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

        <div className="info-card">
          <h3>
            <FaExclamationTriangle /> Información Importante
          </h3>
          <ul>
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

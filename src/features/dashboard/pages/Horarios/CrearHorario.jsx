"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaClock, FaCalendarAlt, FaArrowLeft, FaSave, FaTimes, FaExclamationTriangle } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../components/layout/layout.jsx"
import "../../../../shared/styles/Horarios/CrearHorario.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const CrearHorario = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

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
      // Validar que la fecha no sea en el pasado
      const fechaHorario = new Date(horario.fecha)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      if (fechaHorario < hoy) {
        newErrors.fecha = "La fecha no puede ser en el pasado"
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

      await makeRequest("/horarios", {
        method: "POST",
        body: JSON.stringify(horario),
      })

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Horario creado correctamente",
        confirmButtonColor: "#2d3748",
      }).then(() => {
        navigate("/dashboard/horarios")
      })
    } catch (error) {
      console.error("Error al crear horario:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el horario. Verifique que no exista un horario conflictivo.",
        confirmButtonColor: "#dc3545",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/dashboard/horarios")
  }

  return (
    <div className="crear-horario-container">
      <div className="crear-horario-header">
        <div className="header-content">
          <div className="header-title">
            <FaClock className="header-icon" />
            <h1>Crear Nuevo Horario</h1>
          </div>
          <button className="btn-volver" onClick={handleCancel} disabled={loading}>
            <FaArrowLeft /> Volver
          </button>
        </div>
      </div>

      <div className="crear-horario-content">
        <div className="form-card">
          <form onSubmit={handleSubmit} className="horario-form">
            <div className="form-section">
              <h3>
                <FaCalendarAlt /> Información del Horario
              </h3>

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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
                <FaTimes /> Cancelar
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <FaSave /> Crear Horario
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
            <li>No se pueden crear horarios para fechas pasadas</li>
            <li>Los horarios se utilizan para programar citas</li>
            <li>Asegúrese de no crear horarios conflictivos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CrearHorario

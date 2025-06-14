"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaClock,
  FaCalendarAlt,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaUser,
  FaInfoCircle,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Horarios/CrearHorario.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const CrearHorario = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [mecanicos, setMecanicos] = useState([])

  const [horario, setHorario] = useState({
    fecha: "",
    dia: "",
    hora_inicio: "",
    hora_fin: "",
    motivo: "",
    tipo_novedad: "",
    mecanico_id: "",
  })

  const tiposNovedad = [
    { value: "Ausencia", label: "Ausencia", description: "El mecánico no estará disponible todo el día" },
    { value: "Llegada Tarde", label: "Llegada Tarde", description: "El mecánico llegará más tarde de lo normal" },
    { value: "Salida Temprana", label: "Salida Temprana", description: "El mecánico saldrá antes de lo normal" },
    { value: "Horario Especial", label: "Horario Especial", description: "Horario diferente al habitual" },
  ]

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

  useEffect(() => {
    cargarMecanicos()
  }, [])

  const cargarMecanicos = async () => {
    try {
      const response = await makeRequest("/mecanicos")
      const mecanicosData = Array.isArray(response) ? response : response.data || []
      const mecanicosActivos = mecanicosData.filter((m) => m.estado === "Activo")
      setMecanicos(mecanicosActivos)
    } catch (error) {
      console.error("Error al cargar mecánicos:", error)
      Swal.fire("Error", "No se pudieron cargar los mecánicos", "error")
    }
  }

  const calcularDiaSemana = (fecha) => {
    const fechaObj = new Date(fecha + "T12:00:00")
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    return diasSemana[fechaObj.getDay()]
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    const newHorario = { ...horario, [name]: value }

    if (name === "fecha" && value) {
      const dia = calcularDiaSemana(value)
      newHorario.dia = dia

      if (dia === "Domingo") {
        setErrors((prev) => ({ ...prev, fecha: "No se pueden crear novedades para domingos (día no laboral)" }))
      } else {
        setErrors((prev) => ({ ...prev, fecha: "" }))
      }
    }

    if (name === "tipo_novedad" && value === "Ausencia") {
      newHorario.hora_inicio = ""
      newHorario.hora_fin = ""
    }

    setHorario(newHorario)

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validarHorario = () => {
    const newErrors = {}

    if (!horario.fecha) {
      newErrors.fecha = "La fecha es requerida"
    } else {
      const fechaObj = new Date(horario.fecha + "T12:00:00")
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      if (fechaObj < hoy) {
        newErrors.fecha = "La fecha no puede ser en el pasado"
      }

      if (horario.dia === "Domingo") {
        newErrors.fecha = "No se pueden crear novedades para domingos"
      }
    }

    if (!horario.mecanico_id) {
      newErrors.mecanico_id = "Debe seleccionar un mecánico"
    }

    if (!horario.tipo_novedad) {
      newErrors.tipo_novedad = "Debe seleccionar un tipo de novedad"
    }

    if (!horario.motivo.trim()) {
      newErrors.motivo = "El motivo es requerido"
    }

    if (horario.tipo_novedad && horario.tipo_novedad !== "Ausencia") {
      if (!horario.hora_inicio) {
        newErrors.hora_inicio = "La hora de inicio es requerida"
      }
      if (!horario.hora_fin) {
        newErrors.hora_fin = "La hora de fin es requerida"
      }

      if (horario.hora_inicio && horario.hora_fin) {
        const [horaInicio, minutoInicio] = horario.hora_inicio.split(":").map(Number)
        const [horaFin, minutoFin] = horario.hora_fin.split(":").map(Number)

        const minutosInicio = horaInicio * 60 + minutoInicio
        const minutosFin = horaFin * 60 + minutoFin

        if (minutosFin <= minutosInicio) {
          newErrors.hora_fin = "La hora de fin debe ser mayor que la hora de inicio"
        }

        if (minutosInicio < 480) {
          newErrors.hora_inicio = "La hora de inicio no puede ser antes de las 8:00 AM"
        }

        if (minutosFin > 1080) {
          newErrors.hora_fin = "La hora de fin no puede ser después de las 6:00 PM"
        }
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
        text: "Novedad de horario creada correctamente",
        confirmButtonColor: "#2d3748",
      }).then(() => {
        navigate("/Horarios")
      })
    } catch (error) {
      console.error("Error al crear novedad:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo crear la novedad de horario",
        confirmButtonColor: "#dc3545",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/Horarios")
  }

  const tipoNovedadSeleccionado = tiposNovedad.find((t) => t.value === horario.tipo_novedad)

  return (
    <div className="crearHorarios-container">
      <div className="crearHorarios-header">
        <div className="crearHorarios-headerContent">
          <div className="crearHorarios-headerLeft">
            <div className="crearHorarios-headerIcon">
              <FaClock />
            </div>
            <div className="crearHorarios-headerText">
              <h1>Crear Novedad de Horario</h1>
              <p>Registrar excepciones al horario laboral normal</p>
            </div>
          </div>
          <button className="crearHorarios-btnVolver" onClick={handleCancel} disabled={loading}>
            <FaArrowLeft /> Volver
          </button>
        </div>
      </div>

      <div className="crearHorarios-content">
        <div className="crearHorarios-formCard">
          <form onSubmit={handleSubmit}>
            <div className="crearHorarios-formSection">
              <h3 className="crearHorarios-sectionTitle">
                <FaCalendarAlt /> Información de la Novedad
              </h3>

              <div className="crearHorarios-formRow">
                <div className="crearHorarios-formGroup">
                  <label className="crearHorarios-label">
                    <FaCalendarAlt /> Fecha *
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={horario.fecha}
                    onChange={handleInputChange}
                    className={`crearHorarios-input ${errors.fecha ? "error" : ""}`}
                    disabled={loading}
                  />
                  {errors.fecha && <span className="crearHorarios-errorMessage">{errors.fecha}</span>}
                </div>

                <div className="crearHorarios-formGroup">
                  <label className="crearHorarios-label">
                    <FaCalendarAlt /> Día de la Semana
                  </label>
                  <input
                    type="text"
                    value={horario.dia}
                    readOnly
                    className="crearHorarios-input crearHorarios-inputReadonly"
                    placeholder="Se calcula automáticamente"
                  />
                </div>
              </div>

              <div className="crearHorarios-formGroup">
                <label className="crearHorarios-label">
                  <FaUser /> Mecánico *
                </label>
                <select
                  name="mecanico_id"
                  value={horario.mecanico_id}
                  onChange={handleInputChange}
                  className={`crearHorarios-select ${errors.mecanico_id ? "error" : ""}`}
                  disabled={loading}
                >
                  <option value="">Seleccione un mecánico...</option>
                  {mecanicos.map((mecanico) => (
                    <option key={mecanico.id} value={mecanico.id}>
                      {mecanico.nombre} {mecanico.apellido} - {mecanico.documento}
                    </option>
                  ))}
                </select>
                {errors.mecanico_id && <span className="crearHorarios-errorMessage">{errors.mecanico_id}</span>}
              </div>

              <div className="crearHorarios-formGroup">
                <label className="crearHorarios-label">
                  <FaExclamationTriangle /> Tipo de Novedad *
                </label>
                <select
                  name="tipo_novedad"
                  value={horario.tipo_novedad}
                  onChange={handleInputChange}
                  className={`crearHorarios-select ${errors.tipo_novedad ? "error" : ""}`}
                  disabled={loading}
                >
                  <option value="">Seleccione un tipo...</option>
                  {tiposNovedad.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
                {errors.tipo_novedad && <span className="crearHorarios-errorMessage">{errors.tipo_novedad}</span>}
                {tipoNovedadSeleccionado && (
                  <div className="crearHorarios-descriptionText">
                    <FaInfoCircle /> {tipoNovedadSeleccionado.description}
                  </div>
                )}
              </div>

              {horario.tipo_novedad && horario.tipo_novedad !== "Ausencia" && (
                <div className="crearHorarios-formRow">
                  <div className="crearHorarios-formGroup">
                    <label className="crearHorarios-label">
                      <FaClock /> Hora de Inicio *
                    </label>
                    <input
                      type="time"
                      name="hora_inicio"
                      value={horario.hora_inicio}
                      onChange={handleInputChange}
                      className={`crearHorarios-input ${errors.hora_inicio ? "error" : ""}`}
                      disabled={loading}
                      min="08:00"
                      max="18:00"
                    />
                    {errors.hora_inicio && <span className="crearHorarios-errorMessage">{errors.hora_inicio}</span>}
                  </div>

                  <div className="crearHorarios-formGroup">
                    <label className="crearHorarios-label">
                      <FaClock /> Hora de Fin *
                    </label>
                    <input
                      type="time"
                      name="hora_fin"
                      value={horario.hora_fin}
                      onChange={handleInputChange}
                      className={`crearHorarios-input ${errors.hora_fin ? "error" : ""}`}
                      disabled={loading}
                      min="08:00"
                      max="18:00"
                    />
                    {errors.hora_fin && <span className="crearHorarios-errorMessage">{errors.hora_fin}</span>}
                  </div>
                </div>
              )}

              <div className="crearHorarios-formGroup">
                <label className="crearHorarios-label">
                  <FaExclamationTriangle /> Motivo *
                </label>
                <textarea
                  name="motivo"
                  value={horario.motivo}
                  onChange={handleInputChange}
                  placeholder="Describa el motivo de la novedad (ej: Cita médica, emergencia familiar, etc.)"
                  rows="3"
                  className={`crearHorarios-textarea ${errors.motivo ? "error" : ""}`}
                  disabled={loading}
                />
                {errors.motivo && <span className="crearHorarios-errorMessage">{errors.motivo}</span>}
              </div>
            </div>

            <div className="crearHorarios-formActions">
              <button type="button" className="crearHorarios-btnCancelar" onClick={handleCancel} disabled={loading}>
                <FaTimes /> Cancelar
              </button>
              <button type="submit" className="crearHorarios-btnGuardar" disabled={loading}>
                {loading ? (
                  <>
                    <div className="crearHorarios-loadingSpinner"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <FaSave /> Crear Novedad
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="crearHorarios-infoCard">
          <h3>
            <FaInfoCircle /> Información Importante
          </h3>
          <div className="crearHorarios-horarioNormal">
            <h4>Horario Laboral Normal:</h4>
            <p>
              <strong>Días:</strong> Lunes a Sábado
            </p>
            <p>
              <strong>Horario:</strong> 8:00 AM - 6:00 PM
            </p>
            <p>
              <strong>No laborable:</strong> Domingos
            </p>
          </div>
          <p>Las novedades de horario son excepciones al horario normal de trabajo.</p>
        </div>
      </div>
    </div>
  )
}

export default CrearHorario

"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  FaClock,
  FaCalendarAlt,
  FaArrowLeft,
  FaUser,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEdit,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Horarios/DetalleHorario.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const DetalleHorario = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [horario, setHorario] = useState(null)
  const [mecanico, setMecanico] = useState(null)
  const [loading, setLoading] = useState(true)

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
    const cargarDatos = async () => {
      try {
        setLoading(true)
        const horarioData = await makeRequest(`/horarios/${id}`)

        const horarioInfo = Array.isArray(horarioData)
          ? horarioData[0]
          : horarioData.data
            ? horarioData.data
            : horarioData

        setHorario(horarioInfo)

        if (horarioInfo && horarioInfo.mecanico_id) {
          const mecanicoData = await makeRequest(`/mecanicos/${horarioInfo.mecanico_id}`)
          const mecanicoInfo = Array.isArray(mecanicoData)
            ? mecanicoData[0]
            : mecanicoData.data
              ? mecanicoData.data
              : mecanicoData

          setMecanico(mecanicoInfo)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la información del horario",
          confirmButtonColor: "#dc3545",
        })
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [id])

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

  const formatearHora = (hora) => {
    if (!hora) return "N/A"
    return hora.substring(0, 5)
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case "Ausencia":
        return "#dc3545"
      case "Llegada Tarde":
        return "#ffc107"
      case "Salida Temprana":
        return "#fd7e14"
      case "Horario Especial":
        return "#6f42c1"
      default:
        return "#6c757d"
    }
  }

  const esFechaPasada = (fecha) => {
    if (!fecha) return false
    let fechaStr = fecha
    if (fechaStr.includes("T")) {
      fechaStr = fechaStr.split("T")[0]
    }
    const [anio, mes, dia] = fechaStr.split("-")
    const fechaHorario = new Date(`${anio}-${mes}-${dia}T12:00:00`)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return fechaHorario < hoy
  }

  if (loading) {
    return (
      <div className="detalleHorario-container">
        <div className="detalleHorario-loading">
          <div className="detalleHorario-spinner"></div>
          <p>Cargando información del horario...</p>
        </div>
      </div>
    )
  }

  if (!horario) {
    return (
      <div className="detalleHorario-container">
        <div className="detalleHorario-error">
          <FaExclamationTriangle className="detalleHorario-errorIcon" />
          <h2>No se encontró la información del horario</h2>
          <button className="detalleHorario-btnVolver" onClick={() => navigate("/Horarios")}>
            <FaArrowLeft /> Volver a Horarios
          </button>
        </div>
      </div>
    )
  }

  const fechaPasada = esFechaPasada(horario.fecha)

  return (
    <div className="detalleHorario-container">
      <div className="detalleHorario-header">
        <div className="detalleHorario-headerContent">
          <div className="detalleHorario-headerLeft">
            <div className="detalleHorario-iconContainer">
              <FaClock className="detalleHorario-headerIcon" />
            </div>
            <div className="detalleHorario-headerText">
              <h1 className="detalleHorario-title">Detalle de Novedad de Horario</h1>
              <p className="detalleHorario-subtitle">Información completa de la novedad</p>
            </div>
          </div>
          <button className="detalleHorario-btnVolver" onClick={() => navigate("/Horarios")}>
            <FaArrowLeft /> Volver
          </button>
        </div>
      </div>

      <div className="detalleHorario-content">
        <div className="detalleHorario-mainCard">
          <div className="detalleHorario-cardHeader">
            <div className="detalleHorario-cardTitle">
              <span
                className="detalleHorario-tipoBadge"
                style={{ backgroundColor: getTipoColor(horario.tipo_novedad) }}
              >
                {horario.tipo_novedad}
              </span>
              <h2>{formatearFecha(horario.fecha)}</h2>
            </div>
            <div className="detalleHorario-actions">
              <button
                className="detalleHorario-btnEdit"
                onClick={() => navigate(`/EditarHorario/${horario.id}`)}
                disabled={fechaPasada}
                title={fechaPasada ? "No se puede editar una novedad pasada" : "Editar novedad"}
              >
                <FaEdit /> Editar
              </button>
            </div>
          </div>

          {fechaPasada && (
            <div className="detalleHorario-alert">
              <FaExclamationTriangle />
              <span>Esta novedad corresponde a una fecha pasada</span>
            </div>
          )}

          <div className="detalleHorario-section">
            <h3 className="detalleHorario-sectionTitle">
              <FaCalendarAlt /> Información de la Fecha
            </h3>
            <div className="detalleHorario-grid">
              <div className="detalleHorario-field">
                <label className="detalleHorario-label">Fecha:</label>
                <span className="detalleHorario-value">{formatearFecha(horario.fecha)}</span>
              </div>
              <div className="detalleHorario-field">
                <label className="detalleHorario-label">Día de la semana:</label>
                <span className="detalleHorario-value">
                  {formatearFecha(horario.fecha).split(",")[0]}
                </span>
              </div>
              {horario.tipo_novedad !== "Ausencia" && (
                <>
                  <div className="detalleHorario-field">
                    <label className="detalleHorario-label">Hora de inicio:</label>
                    <span className="detalleHorario-value">{formatearHora(horario.hora_inicio)}</span>
                  </div>
                  <div className="detalleHorario-field">
                    <label className="detalleHorario-label">Hora de fin:</label>
                    <span className="detalleHorario-value">{formatearHora(horario.hora_fin)}</span>
                  </div>
                </>
              )}
              {horario.tipo_novedad === "Ausencia" && (
                <div className="detalleHorario-field detalleHorario-fieldFull">
                  <label className="detalleHorario-label">Duración:</label>
                  <span className="detalleHorario-ausenciaBadge">Todo el día</span>
                </div>
              )}
            </div>
          </div>

          {mecanico && (
            <div className="detalleHorario-section">
              <h3 className="detalleHorario-sectionTitle">
                <FaUser /> Información del Mecánico
              </h3>
              <div className="detalleHorario-grid">
                <div className="detalleHorario-field">
                  <label className="detalleHorario-label">Nombre:</label>
                  <span className="detalleHorario-value">
                    {mecanico.nombre} {mecanico.apellido}
                  </span>
                </div>
                <div className="detalleHorario-field">
                  <label className="detalleHorario-label">Documento:</label>
                  <span className="detalleHorario-value">
                    {mecanico.tipo_documento}: {mecanico.documento}
                  </span>
                </div>
                <div className="detalleHorario-field">
                  <label className="detalleHorario-label">Especialidad:</label>
                  <span className="detalleHorario-value">{mecanico.especialidad || "No especificada"}</span>
                </div>
                <div className="detalleHorario-field">
                  <label className="detalleHorario-label">Teléfono:</label>
                  <span className="detalleHorario-value">{mecanico.telefono || "No especificado"}</span>
                </div>
              </div>
            </div>
          )}

          <div className="detalleHorario-section">
            <h3 className="detalleHorario-sectionTitle">
              <FaInfoCircle /> Motivo de la Novedad
            </h3>
            <div className="detalleHorario-motivoContainer">
              <p>{horario.motivo}</p>
            </div>
          </div>
        </div>

        <div className="detalleHorario-infoCard">
          <h3 className="detalleHorario-infoTitle">
            <FaInfoCircle /> Información Importante
          </h3>
          <div className="detalleHorario-horarioNormal">
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
          <p className="detalleHorario-infoText">
            Las novedades de horario afectan la disponibilidad del mecánico para las citas.
          </p>
          <div className="detalleHorario-tipoInfo">
            <p>
              <strong>Tipo de novedad:</strong> {horario.tipo_novedad}
            </p>
            <span className="detalleHorario-tipoDescripcion">
              {horario.tipo_novedad === "Ausencia" && "El mecánico no estará disponible todo el día"}
              {horario.tipo_novedad === "Llegada Tarde" && "El mecánico llegará más tarde de lo normal"}
              {horario.tipo_novedad === "Salida Temprana" && "El mecánico saldrá antes de lo normal"}
              {horario.tipo_novedad === "Horario Especial" && "Horario diferente al habitual"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleHorario

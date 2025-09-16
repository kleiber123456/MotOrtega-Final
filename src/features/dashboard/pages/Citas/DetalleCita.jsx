"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import "../../../../shared/styles/Citas/DetalleCita.css"
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCar,
  FaTools,
  FaClipboardList,
  FaEdit,
  FaArrowLeft,
  FaIdCard,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa"
import moment from "moment"
import "moment/locale/es"

// Configurar localización en español
moment.locale("es")

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const DetalleCita = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [cita, setCita] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCita()
  }, [id])

  const fetchCita = async () => {
    try {
      setLoading(true)
  // console.log eliminado

      // Obtener el token de autenticación
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token) {
        toast.error("No hay sesión activa. Por favor inicie sesión nuevamente.")
        navigate("/citas")
        return
      }

      // Realizar la solicitud con el token en los headers
      const response = await axios.get(`${API_BASE_URL}/citas/${id}`, {
        headers: {
          Authorization: token,
        },
      })

  // console.log eliminado

      if (response.data) {
        setCita(response.data)
      } else {
        toast.error("Error al cargar los datos de la cita")
        navigate("/citas")
      }

      setLoading(false)
    } catch (error) {
      console.error("Error al cargar la cita:", error)

      if (error.response) {
        console.error("Detalles del error:", error.response.data)
        toast.error(`Error al cargar la cita: ${error.response.data.message || "Error del servidor"}`)
      } else if (error.request) {
        console.error("No se recibió respuesta:", error.request)
        toast.error("No se pudo conectar con el servidor. Verifique su conexión.")
      } else {
        toast.error("Error al cargar los datos de la cita")
      }

      navigate("/citas")
    }
  }

  // Función para obtener información del cliente
  const getClienteInfo = () => {
    // Priorizar información del vehículo.cliente si está disponible
    if (cita.vehiculo && cita.vehiculo.cliente) {
      return cita.vehiculo.cliente
    }

    // Fallback a información directa de la cita
    return {
      nombre: cita.cliente_nombre || "",
      apellido: cita.cliente_apellido || "",
      documento: cita.cliente_documento || "",
      telefono: cita.cliente_telefono || "",
      correo: cita.cliente_correo || "",
    }
  }

  // Función para obtener información del vehículo
  const getVehiculoInfo = () => {
    return {
      placa: cita.vehiculo_placa || "No especificado",
      tipo_vehiculo: "No especificado", // No viene en la respuesta
      color: cita.vehiculo_color || "No especificado",
      referencia: cita.referencia_nombre || "No especificado",
      marca: cita.marca_nombre || "No especificado",
    }
  }

  // Función para formatear fecha correctamente sin problemas de zona horaria
  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A"

    try {
      // Si la fecha viene en formato ISO (YYYY-MM-DD), usar directamente
      if (fecha.includes("-") && !fecha.includes("T")) {
        const [year, month, day] = fecha.split("-")
        return `${day}/${month}/${year}`
      }

      // Si viene con timestamp, extraer solo la fecha
      if (fecha.includes("T")) {
        const fechaSolo = fecha.split("T")[0]
        const [year, month, day] = fechaSolo.split("-")
        return `${day}/${month}/${year}`
      }

      // Fallback usando moment pero sin conversión de zona horaria
      return moment(fecha, "YYYY-MM-DD").format("DD/MM/YYYY")
    } catch (error) {
      console.error("Error formateando fecha:", error)
      return "Fecha inválida"
    }
  }

  // Función para formatear hora correctamente
  const formatearHora = (hora) => {
    if (!hora) return "N/A"

    try {
      // Si la hora viene con segundos, extraer solo HH:MM
      if (hora.includes(":") && hora.length > 5) {
        return hora.substring(0, 5)
      }

      return hora
    } catch (error) {
      console.error("Error formateando hora:", error)
      return "Hora inválida"
    }
  }

  // Función para obtener el nombre del estado basado en los estados reales de la BD
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

  if (loading) {
    return (
      <div className="detalleCita-loading">
        <div className="detalleCita-spinner"></div>
        <p>Cargando información de la cita...</p>
      </div>
    )
  }

  if (!cita) {
    return (
      <div className="detalleCita-error">
        <h2>Cita no encontrada</h2>
        <p>No se pudo cargar la información de la cita solicitada.</p>
        <button onClick={() => navigate("/citas")} className="detalleCita-btn-volver">
          Volver a Citas
        </button>
      </div>
    )
  }

  const clienteInfo = getClienteInfo()
  const vehiculoInfo = getVehiculoInfo()

  return (
    <div className="detalleCita-container">
      {/* Header */}
      <div className="detalleCita-header">
        <div className="detalleCita-header-content">
          <div className="detalleCita-icon-container">
            <FaCalendarAlt className="detalleCita-icon" />
          </div>
          <div className="detalleCita-header-text">
            <h1 className="detalleCita-title">Detalle de Cita #{id}</h1>
            <p className="detalleCita-subtitle">Información completa de la cita programada</p>
          </div>
        </div>
        <button onClick={() => navigate("/citas")} className="detalleCita-btn-volver">
          <FaArrowLeft />
          Volver
        </button>
      </div>

      {/* Content */}
      <div className="detalleCita-content">
        {/* Main Content */}
        <div className="detalleCita-main">
          {/* Información de la Cita */}
          <div className="detalleCita-section">
            <div className="detalleCita-section-header">
              <FaCalendarAlt className="detalleCita-section-icon" />
              <h2>Información de la Cita</h2>
            </div>
            <div className="detalleCita-grid">
              <div className="detalleCita-field">
                <label className="detalleCita-label">
                  <FaCalendarAlt />
                  Fecha
                </label>
                <span className="detalleCita-value">{formatearFecha(cita.fecha)}</span>
              </div>
              <div className="detalleCita-field">
                <label className="detalleCita-label">
                  <FaClock />
                  Hora
                </label>
                <span className="detalleCita-value">{formatearHora(cita.hora)} horas</span>
              </div>
              <div className="detalleCita-field">
                <label className="detalleCita-label">
                  <FaClipboardList />
                  Estado
                </label>
                <span className={`detalleCita-badge estado-${cita.estado_cita_id}`}>
                  {getEstadoNombre(cita.estado_cita_id, cita.estado_cita)}
                </span>
              </div>
              <div className="detalleCita-field">
                <label className="detalleCita-label">
                  <FaClipboardList />
                  Servicio
                </label>
                <span className="detalleCita-value">{cita.servicio_nombre || (cita.servicio && cita.servicio.nombre) || "No especificado"}</span>
              </div>
              <div className="detalleCita-field">
                <label className="detalleCita-label">
                  <FaClipboardList />
                  Subtotal
                </label>
                <span className="detalleCita-value">{cita.subtotal !== undefined ? `$${Number(cita.subtotal).toLocaleString('es-CO')}` : "No especificado"}</span>
              </div>
            </div>
          </div>

          {/* Información Completa del Cliente */}
          <div className="detalleCita-section">
            <div className="detalleCita-section-header">
              <FaUser className="detalleCita-section-icon" />
              <h2>Información del Cliente</h2>
            </div>
            {clienteInfo.nombre || clienteInfo.apellido ? (
              <div className="detalleCita-grid">
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaUser />
                    Nombre Completo
                  </label>
                  <span className="detalleCita-value">
                    {`${clienteInfo.nombre || ""} ${clienteInfo.apellido || ""}`.trim() || "No especificado"}
                  </span>
                </div>
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaIdCard />
                    Documento
                  </label>
                  <span className="detalleCita-value">{clienteInfo.documento || "No especificado"}</span>
                </div>
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaPhone />
                    Teléfono
                  </label>
                  <span className="detalleCita-value">{clienteInfo.telefono || "No especificado"}</span>
                </div>
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaEnvelope />
                    Correo Electrónico
                  </label>
                  <span className="detalleCita-value">{clienteInfo.correo || "No especificado"}</span>
                </div>
              </div>
            ) : (
              <p className="detalleCita-no-data">No hay información disponible del cliente</p>
            )}
          </div>

          {/* Información del Vehículo */}
          <div className="detalleCita-section">
            <div className="detalleCita-section-header">
              <FaCar className="detalleCita-section-icon" />
              <h2>Información del Vehículo</h2>
            </div>
            {vehiculoInfo.placa ? (
              <div className="detalleCita-grid">
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaCar />
                    Placa
                  </label>
                  <span className="detalleCita-value">{vehiculoInfo.placa}</span>
                </div>
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaCar />
                    Color
                  </label>
                  <span className="detalleCita-value">{vehiculoInfo.color || "No especificado"}</span>
                </div>
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaCar />
                    Marca
                  </label>
                  <span className="detalleCita-value">{vehiculoInfo.marca}</span>
                </div>
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaCar />
                    Modelo
                  </label>
                  <span className="detalleCita-value">{vehiculoInfo.referencia}</span>
                </div>
              </div>
            ) : (
              <p className="detalleCita-no-data">No hay información disponible del vehículo</p>
            )}
          </div>

          {/* Mecánico */}
          <div className="detalleCita-section">
            <div className="detalleCita-section-header">
              <FaTools className="detalleCita-section-icon" />
              <h2>Mecánico Asignado</h2>
            </div>
            {cita.mecanico_nombre || (cita.mecanico && cita.mecanico.nombre) ? (
              <div className="detalleCita-grid">
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaTools />
                    Nombre
                  </label>
                  <span className="detalleCita-value">
                    {cita.mecanico
                      ? `${cita.mecanico.nombre || ""} ${cita.mecanico.apellido || ""}`.trim()
                      : `${cita.mecanico_nombre || ""} ${cita.mecanico_apellido || ""}`.trim()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="detalleCita-no-data">No hay mecánico asignado</p>
            )}
          </div>

          {/* Observaciones */}
          <div className="detalleCita-section">
            <div className="detalleCita-section-header">
              <FaClipboardList className="detalleCita-section-icon" />
              <h2>Observaciones</h2>
            </div>
            <div className="detalleCita-observaciones">{cita.observaciones || "Sin observaciones"}</div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="detalleCita-sidebar">
          
        </div>
      </div>
    </div>
  )
}

export default DetalleCita

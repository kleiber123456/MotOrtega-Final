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
      console.log("Solicitando detalle de cita con ID:", id)

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

      console.log("Respuesta detalle de cita:", response)

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

  const handleCambiarEstado = async (estadoId) => {
    try {
      // Obtener el token de autenticación
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token) {
        console.error("No hay token disponible")
        toast.error("No hay sesión activa. Por favor inicie sesión nuevamente.")
        return
      }

      await axios.put(
        `${API_BASE_URL}/citas/${id}/cambiar-estado`,
        { estado_cita_id: estadoId },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      )

      toast.success("Estado de la cita actualizado correctamente")
      fetchCita()
    } catch (error) {
      console.error("Error al cambiar el estado de la cita:", error)

      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`)
      } else {
        toast.error("Error al cambiar el estado de la cita")
      }
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
    if (cita.vehiculo) {
      return cita.vehiculo
    }

    return {
      placa: cita.vehiculo_placa || "",
      tipo_vehiculo: cita.vehiculo_tipo || "",
      color: cita.vehiculo_color || "",
      referencia: null,
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
                <span className="detalleCita-value">{moment(cita.fecha).format("DD/MM/YYYY")}</span>
              </div>
              <div className="detalleCita-field">
                <label className="detalleCita-label">
                  <FaClock />
                  Hora
                </label>
                <span className="detalleCita-value">{moment(cita.hora, "HH:mm:ss").format("HH:mm")} horas</span>
              </div>
              <div className="detalleCita-field">
                <label className="detalleCita-label">
                  <FaClipboardList />
                  Estado
                </label>
                <span className={`detalleCita-badge estado-${cita.estado_cita_id}`}>
                  {cita.estado_cita?.nombre || "Pendiente"}
                </span>
              </div>
            </div>

            {/* Cambiar Estado */}
            <div className="detalleCita-estado-section">
              <h3>Cambiar Estado de la Cita</h3>
              <div className="detalleCita-estado-buttons">
                <button
                  className="detalleCita-btn-estado btn-pendiente"
                  onClick={() => handleCambiarEstado(1)}
                  disabled={cita.estado_cita_id === 1}
                >
                  Pendiente
                </button>
                <button
                  className="detalleCita-btn-estado btn-confirmada"
                  onClick={() => handleCambiarEstado(2)}
                  disabled={cita.estado_cita_id === 2}
                >
                  Confirmada
                </button>
                <button
                  className="detalleCita-btn-estado btn-cancelada"
                  onClick={() => handleCambiarEstado(3)}
                  disabled={cita.estado_cita_id === 3}
                >
                  Cancelada
                </button>
                <button
                  className="detalleCita-btn-estado btn-completada"
                  onClick={() => handleCambiarEstado(4)}
                  disabled={cita.estado_cita_id === 4}
                >
                  Completada
                </button>
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
                    Tipo de Vehículo
                  </label>
                  <span className="detalleCita-value">{vehiculoInfo.tipo_vehiculo || "No especificado"}</span>
                </div>
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaCar />
                    Color
                  </label>
                  <span className="detalleCita-value">{vehiculoInfo.color || "No especificado"}</span>
                </div>
                {vehiculoInfo.referencia && (
                  <>
                    <div className="detalleCita-field">
                      <label className="detalleCita-label">
                        <FaCar />
                        Marca
                      </label>
                      <span className="detalleCita-value">
                        {vehiculoInfo.referencia.marca?.nombre || "No especificada"}
                      </span>
                    </div>
                    <div className="detalleCita-field">
                      <label className="detalleCita-label">
                        <FaCar />
                        Modelo
                      </label>
                      <span className="detalleCita-value">{vehiculoInfo.referencia.nombre || "No especificado"}</span>
                    </div>
                  </>
                )}
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
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaPhone />
                    Teléfono
                  </label>
                  <span className="detalleCita-value">
                    {cita.mecanico?.telefono || cita.mecanico_telefono || "No especificado"}
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
          <div className="detalleCita-info-card">
            <div className="detalleCita-info-header">
              <FaCalendarAlt className="detalleCita-info-icon" />
              <h3>Acciones Disponibles</h3>
            </div>
            <div className="detalleCita-info-content">
              <p className="detalleCita-info-text">Desde aquí puedes realizar las siguientes acciones con esta cita:</p>
              <div className="detalleCita-actions">
                <Link to={`/citas/editar/${id}`} className="detalleCita-btn-action btn-edit">
                  <FaEdit />
                  Editar Cita
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleCita

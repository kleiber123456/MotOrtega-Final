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
  FaPrint,
  FaArrowLeft,
} from "react-icons/fa"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
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

  const generarPDF = () => {
    if (!cita) return

    const doc = new jsPDF()

    // Título
    doc.setFontSize(20)
    doc.text("Detalle de Cita", 105, 20, { align: "center" })

    // Información de la empresa
    doc.setFontSize(12)
    doc.text("MotOrtega", 105, 30, { align: "center" })
    doc.text("Taller Mecánico", 105, 35, { align: "center" })
    doc.text("NIT: 123456789", 105, 40, { align: "center" })

    // Línea divisoria
    doc.setLineWidth(0.5)
    doc.line(20, 45, 190, 45)

    // Información de la cita
    doc.setFontSize(14)
    doc.text("Información de la Cita", 20, 55)

    doc.setFontSize(11)
    doc.text(`Número de Cita: ${cita.id}`, 20, 65)
    doc.text(`Fecha: ${moment(cita.fecha).format("DD/MM/YYYY")}`, 20, 72)
    doc.text(`Hora: ${moment(cita.hora, "HH:mm:ss").format("HH:mm")} horas`, 20, 79)
    doc.text(`Estado: ${cita.estado_cita?.nombre || "Pendiente"}`, 20, 86)

    // Información del cliente y vehículo
    doc.setFontSize(14)
    doc.text("Cliente y Vehículo", 20, 100)

    doc.setFontSize(11)
    if (cita.vehiculo && cita.vehiculo.cliente) {
      doc.text(`Cliente: ${cita.vehiculo.cliente.nombre} ${cita.vehiculo.cliente.apellido}`, 20, 110)
      doc.text(`Documento: ${cita.vehiculo.cliente.documento}`, 20, 117)
      doc.text(`Teléfono: ${cita.vehiculo.cliente.telefono}`, 20, 124)
    }

    if (cita.vehiculo) {
      doc.text(`Vehículo: ${cita.vehiculo.placa}`, 20, 131)
      if (cita.vehiculo.referencia) {
        doc.text(`Marca: ${cita.vehiculo.referencia.marca?.nombre || "N/A"}`, 20, 138)
        doc.text(`Modelo: ${cita.vehiculo.referencia.nombre || "N/A"}`, 20, 145)
      }
      doc.text(`Tipo: ${cita.vehiculo.tipo_vehiculo || "N/A"}`, 20, 152)
      doc.text(`Color: ${cita.vehiculo.color || "N/A"}`, 20, 159)
    }

    // Información del mecánico
    doc.setFontSize(14)
    doc.text("Mecánico Asignado", 20, 175)

    doc.setFontSize(11)
    if (cita.mecanico) {
      doc.text(`Nombre: ${cita.mecanico.nombre} ${cita.mecanico.apellido}`, 20, 185)
      doc.text(`Documento: ${cita.mecanico.documento}`, 20, 192)
      doc.text(`Teléfono: ${cita.mecanico.telefono}`, 20, 199)
    }

    // Observaciones
    doc.setFontSize(14)
    doc.text("Observaciones", 20, 215)

    doc.setFontSize(11)
    const observaciones = cita.observaciones || "Sin observaciones"

    // Dividir observaciones largas en múltiples líneas
    const splitObservaciones = doc.splitTextToSize(observaciones, 170)
    doc.text(splitObservaciones, 20, 225)

    // Pie de página
    doc.setFontSize(10)
    doc.text(`Fecha de impresión: ${moment().format("DD/MM/YYYY HH:mm")}`, 20, 280)
    doc.text("MotOrtega - Todos los derechos reservados", 105, 285, { align: "center" })

    // Guardar el PDF
    doc.save(`Cita_${cita.id}_${moment().format("YYYYMMDD")}.pdf`)
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

          {/* Cliente y Vehículo */}
          <div className="detalleCita-section">
            <div className="detalleCita-section-header">
              <FaUser className="detalleCita-section-icon" />
              <h2>Cliente y Vehículo</h2>
            </div>
            {cita.cliente_nombre || cita.vehiculo_placa ? (
              <div className="detalleCita-grid">
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaUser />
                    Cliente
                  </label>
                  <span className="detalleCita-value">
                    {`${cita.cliente_nombre || ""} ${cita.cliente_apellido || ""}`}
                  </span>
                </div>
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaCar />
                    Vehículo
                  </label>
                  <span className="detalleCita-value">{cita.vehiculo_placa || ""}</span>
                </div>
              </div>
            ) : (
              <p className="detalleCita-no-data">No hay información disponible del cliente o vehículo</p>
            )}
          </div>

          {/* Mecánico */}
          <div className="detalleCita-section">
            <div className="detalleCita-section-header">
              <FaTools className="detalleCita-section-icon" />
              <h2>Mecánico Asignado</h2>
            </div>
            {cita.mecanico_nombre ? (
              <div className="detalleCita-grid">
                <div className="detalleCita-field">
                  <label className="detalleCita-label">
                    <FaTools />
                    Nombre
                  </label>
                  <span className="detalleCita-value">
                    {`${cita.mecanico_nombre || ""} ${cita.mecanico_apellido || ""}`}
                  </span>
                </div>
              </div>
            ) : (
              <p className="detalleCita-no-data">No hay información disponible del mecánico</p>
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
                <button onClick={generarPDF} className="detalleCita-btn-action btn-print">
                  <FaPrint />
                  Generar PDF
                </button>
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

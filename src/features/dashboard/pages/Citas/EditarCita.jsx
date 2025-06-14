"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { FaCalendarAlt, FaClock, FaCar, FaUser, FaClipboardList, FaStickyNote } from "react-icons/fa"
import "../../../../shared/styles/Citas/EditarCita.css"

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const EditarCita = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [vehiculos, setVehiculos] = useState([])
  const [mecanicos, setMecanicos] = useState([])
  const [estadosCita, setEstadosCita] = useState([])
  const [formData, setFormData] = useState({
    vehiculo_id: "",
    mecanico_id: "",
    fecha: "",
    hora: "",
    estado_cita_id: "",
    observaciones: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token") || sessionStorage.getItem("token")

        // Obtener datos de la cita
        const citaResponse = await axios.get(`${API_BASE_URL}/citas/${id}`, {
          headers: { Authorization: token },
        })

        const citaData = citaResponse.data

        // Obtener vehículos
        const vehiculosResponse = await axios.get(`${API_BASE_URL}/vehiculos`, {
          headers: { Authorization: token },
        })
        setVehiculos(vehiculosResponse.data)

        // Obtener mecánicos
        const mecanicosResponse = await axios.get(`${API_BASE_URL}/mecanicos`, {
          headers: { Authorization: token },
        })
        setMecanicos(mecanicosResponse.data)

        // Obtener estados de cita
        const estadosResponse = await axios.get(`${API_BASE_URL}/estados-cita`, {
          headers: { Authorization: token },
        })
        setEstadosCita(estadosResponse.data)

        // Formatear fecha y hora para los inputs
        const fechaFormateada = citaData.fecha ? citaData.fecha.split("T")[0] : ""
        const horaFormateada = citaData.hora || ""

        // Establecer datos del formulario
        setFormData({
          vehiculo_id: citaData.vehiculo_id || "",
          mecanico_id: citaData.mecanico_id || "",
          fecha: fechaFormateada,
          hora: horaFormateada,
          estado_cita_id: citaData.estado_cita_id || "",
          observaciones: citaData.observaciones || "",
        })

        setLoading(false)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast.error("Error al cargar los datos de la cita")
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.vehiculo_id) newErrors.vehiculo_id = "Seleccione un vehículo"
    if (!formData.mecanico_id) newErrors.mecanico_id = "Seleccione un mecánico"
    if (!formData.fecha) newErrors.fecha = "Seleccione una fecha"
    if (!formData.hora) newErrors.hora = "Seleccione una hora"
    if (!formData.estado_cita_id) newErrors.estado_cita_id = "Seleccione un estado"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Por favor complete todos los campos requeridos")
      return
    }

    try {
      setLoadingSubmit(true)
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      await axios.put(`${API_BASE_URL}/citas/${id}`, formData, {
        headers: { Authorization: token },
      })

      toast.success("Cita actualizada correctamente")
      navigate("/citas")
    } catch (error) {
      console.error("Error al actualizar la cita:", error)
      toast.error(error.response?.data?.message || "Error al actualizar la cita. Por favor intente nuevamente.")
    } finally {
      setLoadingSubmit(false)
    }
  }

  if (loading) {
    return (
      <div className="editarCita-loading">
        <div className="editarCita-spinner"></div>
        <p>Cargando datos de la cita...</p>
      </div>
    )
  }

  return (
    <div className="editarCita-container">
      {/* Header */}
      <div className="editarCita-header">
        <div className="editarCita-headerContent">
          <div className="editarCita-iconContainer">
            <FaCalendarAlt className="editarCita-headerIcon" />
          </div>
          <div className="editarCita-headerText">
            <h1 className="editarCita-title">Editar Cita</h1>
            <p className="editarCita-subtitle">Modifica los datos de la cita programada</p>
          </div>
        </div>
        <Link to="/citas" className="editarCita-backButton">
          Volver
        </Link>
      </div>

      {/* Contenido principal */}
      <div className="editarCita-content">
        {/* Formulario principal */}
        <div className="editarCita-mainCard">
          <form onSubmit={handleSubmit} className="editarCita-form">
            {/* Información Básica */}
            <div className="editarCita-section">
              <h2 className="editarCita-sectionTitle">
                <FaCalendarAlt className="editarCita-sectionIcon" />
                Información Básica
              </h2>

              <div className="editarCita-row">
                <div className="editarCita-field">
                  <label className="editarCita-label">
                    <FaCalendarAlt className="editarCita-fieldIcon" />
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className={`editarCita-input ${errors.fecha ? "editarCita-inputError" : ""}`}
                  />
                  {errors.fecha && <span className="editarCita-error">{errors.fecha}</span>}
                </div>

                <div className="editarCita-field">
                  <label className="editarCita-label">
                    <FaClock className="editarCita-fieldIcon" />
                    Hora *
                  </label>
                  <input
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    className={`editarCita-input ${errors.hora ? "editarCita-inputError" : ""}`}
                  />
                  {errors.hora && <span className="editarCita-error">{errors.hora}</span>}
                </div>
              </div>
            </div>

            {/* Detalles de la Cita */}
            <div className="editarCita-section">
              <h2 className="editarCita-sectionTitle">
                <FaCar className="editarCita-sectionIcon" />
                Detalles de la Cita
              </h2>

              <div className="editarCita-field">
                <label className="editarCita-label">
                  <FaCar className="editarCita-fieldIcon" />
                  Vehículo *
                </label>
                <select
                  name="vehiculo_id"
                  value={formData.vehiculo_id}
                  onChange={handleChange}
                  className={`editarCita-select ${errors.vehiculo_id ? "editarCita-inputError" : ""}`}
                >
                  <option value="">Seleccione un vehículo</option>
                  {vehiculos.map((vehiculo) => (
                    <option key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                    </option>
                  ))}
                </select>
                {errors.vehiculo_id && <span className="editarCita-error">{errors.vehiculo_id}</span>}
              </div>

              <div className="editarCita-field">
                <label className="editarCita-label">
                  <FaUser className="editarCita-fieldIcon" />
                  Mecánico *
                </label>
                <select
                  name="mecanico_id"
                  value={formData.mecanico_id}
                  onChange={handleChange}
                  className={`editarCita-select ${errors.mecanico_id ? "editarCita-inputError" : ""}`}
                >
                  <option value="">Seleccione un mecánico</option>
                  {mecanicos.map((mecanico) => (
                    <option key={mecanico.id} value={mecanico.id}>
                      {mecanico.nombre} {mecanico.apellido}
                    </option>
                  ))}
                </select>
                {errors.mecanico_id && <span className="editarCita-error">{errors.mecanico_id}</span>}
              </div>

              <div className="editarCita-field">
                <label className="editarCita-label">
                  <FaClipboardList className="editarCita-fieldIcon" />
                  Estado *
                </label>
                <select
                  name="estado_cita_id"
                  value={formData.estado_cita_id}
                  onChange={handleChange}
                  className={`editarCita-select ${errors.estado_cita_id ? "editarCita-inputError" : ""}`}
                >
                  <option value="">Seleccione un estado</option>
                  {estadosCita.map((estado) => (
                    <option key={estado.id} value={estado.id}>
                      {estado.nombre}
                    </option>
                  ))}
                </select>
                {errors.estado_cita_id && <span className="editarCita-error">{errors.estado_cita_id}</span>}
              </div>
            </div>

            {/* Observaciones */}
            <div className="editarCita-section">
              <h2 className="editarCita-sectionTitle">
                <FaStickyNote className="editarCita-sectionIcon" />
                Observaciones
              </h2>

              <div className="editarCita-field">
                <label className="editarCita-label">
                  <FaStickyNote className="editarCita-fieldIcon" />
                  Observaciones adicionales
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows="4"
                  className="editarCita-textarea"
                  placeholder="Ingrese observaciones adicionales sobre la cita..."
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="editarCita-actions">
              <Link to="/citas" className="editarCita-cancelButton">
                Cancelar
              </Link>
              <button type="submit" className="editarCita-submitButton" disabled={loadingSubmit}>
                {loadingSubmit ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>

        {/* Card de información lateral */}
        <div className="editarCita-infoCard">
          <h3 className="editarCita-infoTitle">Información Importante</h3>
          <div className="editarCita-infoContent">
            <div className="editarCita-infoItem">
              <strong>Horario de Atención:</strong>
              <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
              <p>Sábados: 8:00 AM - 2:00 PM</p>
            </div>
            <div className="editarCita-infoItem">
              <strong>Tiempo de Servicio:</strong>
              <p>Los servicios pueden tomar entre 1-4 horas dependiendo del tipo de reparación.</p>
            </div>
            <div className="editarCita-infoItem">
              <strong>Cancelaciones:</strong>
              <p>Las citas pueden cancelarse hasta 2 horas antes del horario programado.</p>
            </div>
          </div>
          <div className="editarCita-infoNote">
            <p>Asegúrate de verificar la disponibilidad del mecánico antes de confirmar los cambios.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditarCita

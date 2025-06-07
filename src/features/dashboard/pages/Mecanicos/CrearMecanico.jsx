"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaSave, FaArrowLeft, FaUser, FaMapMarkerAlt, FaClock } from "react-icons/fa"
import "../../../../shared/styles/Mecanicos/CrearMecanicos.css"

const CrearMecanico = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "Cédula de ciudadanía",
    documento: "",
    direccion: "",
    telefono: "",
    telefono_emergencia: "",
    estado: "Activo",
    horario_id: "",
  })
  const [horarios, setHorarios] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar horarios disponibles
  useEffect(() => {
    const horariosMock = [
      { id: 1, descripcion: "Lunes a Viernes 8:00 AM - 5:00 PM" },
      { id: 2, descripcion: "Lunes a Sábado 7:00 AM - 4:00 PM" },
      { id: 3, descripcion: "Martes a Sábado 9:00 AM - 6:00 PM" },
      { id: 4, descripcion: "Lunes a Viernes 2:00 PM - 10:00 PM" },
    ]
    setHorarios(horariosMock)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es obligatorio"
    }

    if (!formData.documento.trim()) {
      newErrors.documento = "El documento es obligatorio"
    } else if (formData.documento.length < 6) {
      newErrors.documento = "El documento debe tener al menos 6 caracteres"
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es obligatoria"
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio"
    } else if (!/^\d{10}$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono debe tener 10 dígitos"
    }

    if (!formData.telefono_emergencia.trim()) {
      newErrors.telefono_emergencia = "El teléfono de emergencia es obligatorio"
    } else if (!/^\d{10}$/.test(formData.telefono_emergencia)) {
      newErrors.telefono_emergencia = "El teléfono de emergencia debe tener 10 dígitos"
    }

    if (!formData.horario_id) {
      newErrors.horario_id = "Debe seleccionar un horario"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Aquí iría la llamada a la API
      console.log("Datos del mecánico a crear:", formData)

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirigir a la lista de mecánicos
      navigate("/dashboard/mecanicos")
    } catch (error) {
      console.error("Error al crear mecánico:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="crearMecanicos-container">
      <div className="crearMecanicos-header">
        <button className="crearMecanicos-backButton" onClick={() => navigate("/dashboard/mecanicos")}>
          <FaArrowLeft /> Volver
        </button>
        <h1 className="crearMecanicos-title">Crear Nuevo Mecánico</h1>
      </div>

      <form onSubmit={handleSubmit} className="crearMecanicos-form">
        <div className="crearMecanicos-section">
          <h2 className="crearMecanicos-sectionTitle">
            <FaUser /> Información Personal
          </h2>

          <div className="crearMecanicos-row">
            <div className="crearMecanicos-field">
              <label className="crearMecanicos-label">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={`crearMecanicos-input ${errors.nombre ? "error" : ""}`}
                placeholder="Ingrese el nombre"
              />
              {errors.nombre && <span className="crearMecanicos-error">{errors.nombre}</span>}
            </div>

            <div className="crearMecanicos-field">
              <label className="crearMecanicos-label">Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                className={`crearMecanicos-input ${errors.apellido ? "error" : ""}`}
                placeholder="Ingrese el apellido"
              />
              {errors.apellido && <span className="crearMecanicos-error">{errors.apellido}</span>}
            </div>
          </div>

          <div className="crearMecanicos-row">
            <div className="crearMecanicos-field">
              <label className="crearMecanicos-label">Tipo de Documento *</label>
              <select
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleInputChange}
                className="crearMecanicos-select"
              >
                <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                <option value="Tarjeta de identidad">Tarjeta de identidad</option>
              </select>
            </div>

            <div className="crearMecanicos-field">
              <label className="crearMecanicos-label">Número de Documento *</label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleInputChange}
                className={`crearMecanicos-input ${errors.documento ? "error" : ""}`}
                placeholder="Ingrese el número de documento"
              />
              {errors.documento && <span className="crearMecanicos-error">{errors.documento}</span>}
            </div>
          </div>
        </div>

        <div className="crearMecanicos-section">
          <h2 className="crearMecanicos-sectionTitle">
            <FaMapMarkerAlt /> Información de Contacto
          </h2>

          <div className="crearMecanicos-field">
            <label className="crearMecanicos-label">Dirección *</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              className={`crearMecanicos-input ${errors.direccion ? "error" : ""}`}
              placeholder="Ingrese la dirección completa"
            />
            {errors.direccion && <span className="crearMecanicos-error">{errors.direccion}</span>}
          </div>

          <div className="crearMecanicos-row">
            <div className="crearMecanicos-field">
              <label className="crearMecanicos-label">Teléfono *</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className={`crearMecanicos-input ${errors.telefono ? "error" : ""}`}
                placeholder="3001234567"
              />
              {errors.telefono && <span className="crearMecanicos-error">{errors.telefono}</span>}
            </div>

            <div className="crearMecanicos-field">
              <label className="crearMecanicos-label">Teléfono de Emergencia *</label>
              <input
                type="tel"
                name="telefono_emergencia"
                value={formData.telefono_emergencia}
                onChange={handleInputChange}
                className={`crearMecanicos-input ${errors.telefono_emergencia ? "error" : ""}`}
                placeholder="3007654321"
              />
              {errors.telefono_emergencia && <span className="crearMecanicos-error">{errors.telefono_emergencia}</span>}
            </div>
          </div>
        </div>

        <div className="crearMecanicos-section">
          <h2 className="crearMecanicos-sectionTitle">
            <FaClock /> Información Laboral
          </h2>

          <div className="crearMecanicos-row">
            <div className="crearMecanicos-field">
              <label className="crearMecanicos-label">Horario de Trabajo *</label>
              <select
                name="horario_id"
                value={formData.horario_id}
                onChange={handleInputChange}
                className={`crearMecanicos-select ${errors.horario_id ? "error" : ""}`}
              >
                <option value="">Seleccione un horario</option>
                {horarios.map((horario) => (
                  <option key={horario.id} value={horario.id}>
                    {horario.descripcion}
                  </option>
                ))}
              </select>
              {errors.horario_id && <span className="crearMecanicos-error">{errors.horario_id}</span>}
            </div>

            <div className="crearMecanicos-field">
              <label className="crearMecanicos-label">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="crearMecanicos-select"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="crearMecanicos-actions">
          <button
            type="button"
            onClick={() => navigate("/dashboard/mecanicos")}
            className="crearMecanicos-cancelButton"
          >
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="crearMecanicos-submitButton">
            <FaSave /> {isSubmitting ? "Guardando..." : "Guardar Mecánico"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CrearMecanico

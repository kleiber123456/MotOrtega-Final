"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FaSave, FaArrowLeft, FaUser, FaMapMarkerAlt, FaClock } from "react-icons/fa"
import "../../../../shared/styles/Mecanicos/EditarMecanicos.css"

const EditarMecanico = () => {
  const navigate = useNavigate()
  const { id } = useParams()
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
  const [loading, setLoading] = useState(true)

  // Cargar datos del mecánico y horarios
  useEffect(() => {
    const loadData = async () => {
      try {
        // Datos mock del mecánico
        const mecanicoMock = {
          id: 1,
          nombre: "Juan Carlos",
          apellido: "Pérez García",
          tipo_documento: "Cédula de ciudadanía",
          documento: "12345678",
          direccion: "Calle 123 #45-67",
          telefono: "3001234567",
          telefono_emergencia: "3007654321",
          estado: "Activo",
          horario_id: "1",
        }

        const horariosMock = [
          { id: 1, descripcion: "Lunes a Viernes 8:00 AM - 5:00 PM" },
          { id: 2, descripcion: "Lunes a Sábado 7:00 AM - 4:00 PM" },
          { id: 3, descripcion: "Martes a Sábado 9:00 AM - 6:00 PM" },
          { id: 4, descripcion: "Lunes a Viernes 2:00 PM - 10:00 PM" },
        ]

        setFormData(mecanicoMock)
        setHorarios(horariosMock)
        setLoading(false)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [id])

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
      console.log("Datos del mecánico a actualizar:", formData)

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirigir a la lista de mecánicos
      navigate("/dashboard/mecanicos")
    } catch (error) {
      console.error("Error al actualizar mecánico:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="editarMecanicos-container">
        <div className="editarMecanicos-loading">Cargando datos del mecánico...</div>
      </div>
    )
  }

  return (
    <div className="editarMecanicos-container">
      <div className="editarMecanicos-header">
        <button className="editarMecanicos-backButton" onClick={() => navigate("/dashboard/mecanicos")}>
          <FaArrowLeft /> Volver
        </button>
        <h1 className="editarMecanicos-title">Editar Mecánico</h1>
      </div>

      <form onSubmit={handleSubmit} className="editarMecanicos-form">
        <div className="editarMecanicos-section">
          <h2 className="editarMecanicos-sectionTitle">
            <FaUser /> Información Personal
          </h2>

          <div className="editarMecanicos-row">
            <div className="editarMecanicos-field">
              <label className="editarMecanicos-label">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={`editarMecanicos-input ${errors.nombre ? "error" : ""}`}
                placeholder="Ingrese el nombre"
              />
              {errors.nombre && <span className="editarMecanicos-error">{errors.nombre}</span>}
            </div>

            <div className="editarMecanicos-field">
              <label className="editarMecanicos-label">Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                className={`editarMecanicos-input ${errors.apellido ? "error" : ""}`}
                placeholder="Ingrese el apellido"
              />
              {errors.apellido && <span className="editarMecanicos-error">{errors.apellido}</span>}
            </div>
          </div>

          <div className="editarMecanicos-row">
            <div className="editarMecanicos-field">
              <label className="editarMecanicos-label">Tipo de Documento *</label>
              <select
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleInputChange}
                className="editarMecanicos-select"
              >
                <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                <option value="Tarjeta de identidad">Tarjeta de identidad</option>
              </select>
            </div>

            <div className="editarMecanicos-field">
              <label className="editarMecanicos-label">Número de Documento *</label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleInputChange}
                className={`editarMecanicos-input ${errors.documento ? "error" : ""}`}
                placeholder="Ingrese el número de documento"
              />
              {errors.documento && <span className="editarMecanicos-error">{errors.documento}</span>}
            </div>
          </div>
        </div>

        <div className="editarMecanicos-section">
          <h2 className="editarMecanicos-sectionTitle">
            <FaMapMarkerAlt /> Información de Contacto
          </h2>

          <div className="editarMecanicos-field">
            <label className="editarMecanicos-label">Dirección *</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              className={`editarMecanicos-input ${errors.direccion ? "error" : ""}`}
              placeholder="Ingrese la dirección completa"
            />
            {errors.direccion && <span className="editarMecanicos-error">{errors.direccion}</span>}
          </div>

          <div className="editarMecanicos-row">
            <div className="editarMecanicos-field">
              <label className="editarMecanicos-label">Teléfono *</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className={`editarMecanicos-input ${errors.telefono ? "error" : ""}`}
                placeholder="3001234567"
              />
              {errors.telefono && <span className="editarMecanicos-error">{errors.telefono}</span>}
            </div>

            <div className="editarMecanicos-field">
              <label className="editarMecanicos-label">Teléfono de Emergencia *</label>
              <input
                type="tel"
                name="telefono_emergencia"
                value={formData.telefono_emergencia}
                onChange={handleInputChange}
                className={`editarMecanicos-input ${errors.telefono_emergencia ? "error" : ""}`}
                placeholder="3007654321"
              />
              {errors.telefono_emergencia && (
                <span className="editarMecanicos-error">{errors.telefono_emergencia}</span>
              )}
            </div>
          </div>
        </div>

        <div className="editarMecanicos-section">
          <h2 className="editarMecanicos-sectionTitle">
            <FaClock /> Información Laboral
          </h2>

          <div className="editarMecanicos-row">
            <div className="editarMecanicos-field">
              <label className="editarMecanicos-label">Horario de Trabajo *</label>
              <select
                name="horario_id"
                value={formData.horario_id}
                onChange={handleInputChange}
                className={`editarMecanicos-select ${errors.horario_id ? "error" : ""}`}
              >
                <option value="">Seleccione un horario</option>
                {horarios.map((horario) => (
                  <option key={horario.id} value={horario.id}>
                    {horario.descripcion}
                  </option>
                ))}
              </select>
              {errors.horario_id && <span className="editarMecanicos-error">{errors.horario_id}</span>}
            </div>

            <div className="editarMecanicos-field">
              <label className="editarMecanicos-label">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="editarMecanicos-select"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="editarMecanicos-actions">
          <button
            type="button"
            onClick={() => navigate("/dashboard/mecanicos")}
            className="editarMecanicos-cancelButton"
          >
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="editarMecanicos-submitButton">
            <FaSave /> {isSubmitting ? "Actualizando..." : "Actualizar Mecánico"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarMecanico

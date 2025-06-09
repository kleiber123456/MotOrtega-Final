"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FaSave, FaArrowLeft, FaUser, FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa"
import "../../../../shared/styles/Clientes/EditarCliente.css"

const EditarCliente = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "Cédula de ciudadanía",
    documento: "",
    direccion: "",
    telefono: "",
    correo: "",
    estado: "Activo",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        const response = await fetch(`https://api-final-8rw7.onrender.com/api/clientes/${id}`, {
          headers: {
            Authorization: token,
          },
        })

        if (!response.ok) throw new Error("Error al cargar el cliente")

        const data = await response.json()
        setFormData(data)
        setLoading(false)
      } catch (error) {
        console.error("Error al cargar cliente:", error)
        setLoading(false)
      }
    }

    cargarCliente()
  }, [id, token])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

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
    } else if (!/^\d+$/.test(formData.documento.trim())) {
      newErrors.documento = "El documento solo puede contener números"
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "El formato del correo no es válido"
    }

    if (formData.telefono && !/^\d+$/.test(formData.telefono.replace(/\s/g, ""))) {
      newErrors.telefono = "El teléfono solo puede contener números"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`https://api-final-8rw7.onrender.com/api/clientes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error al actualizar el cliente")

      navigate("/Clientes")
    } catch (error) {
      console.error("Error:", error)
      setErrors((prev) => ({
        ...prev,
        submit: "Error al actualizar el cliente",
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="editarCliente-container">
        <div className="editarCliente-loading">Cargando información del cliente...</div>
      </div>
    )
  }

  return (
    <div className="editarCliente-container">
      <div className="editarCliente-header">
        <button className="editarCliente-backButton" onClick={() => navigate("/Clientes")}>
          <FaArrowLeft /> Volver
        </button>
        <h1 className="editarCliente-title">Editar Cliente</h1>
      </div>

      <form onSubmit={handleSubmit} className="editarCliente-form">
        <div className="editarCliente-section">
          <h2 className="editarCliente-sectionTitle">
            <FaUser /> Información Personal
          </h2>
          <div className="editarCliente-grid">
            <div className="editarCliente-field">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={errors.nombre ? "error" : ""}
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>

            <div className="editarCliente-field">
              <label>Apellido:</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                className={errors.apellido ? "error" : ""}
              />
              {errors.apellido && <span className="error-message">{errors.apellido}</span>}
            </div>

            <div className="editarCliente-field">
              <label>Tipo de Documento:</label>
              <select name="tipo_documento" value={formData.tipo_documento} onChange={handleInputChange}>
                <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                <option value="Tarjeta de identidad">Tarjeta de identidad</option>
              </select>
            </div>

            <div className="editarCliente-field">
              <label>Número de Documento:</label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleInputChange}
                className={errors.documento ? "error" : ""}
              />
              {errors.documento && <span className="error-message">{errors.documento}</span>}
            </div>
          </div>
        </div>

        <div className="editarCliente-section">
          <h2 className="editarCliente-sectionTitle">
            <FaMapMarkerAlt /> Información de Contacto
          </h2>
          <div className="editarCliente-grid">
            <div className="editarCliente-field">
              <label>Dirección:</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className={errors.direccion ? "error" : ""}
              />
              {errors.direccion && <span className="error-message">{errors.direccion}</span>}
            </div>

            <div className="editarCliente-field">
              <label>Teléfono:</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className={errors.telefono ? "error" : ""}
              />
              {errors.telefono && <span className="error-message">{errors.telefono}</span>}
            </div>

            <div className="editarCliente-field">
              <label>Correo Electrónico:</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                className={errors.correo ? "error" : ""}
              />
              {errors.correo && <span className="error-message">{errors.correo}</span>}
            </div>

            <div className="editarCliente-field">
              <label>Estado:</label>
              <select name="estado" value={formData.estado} onChange={handleInputChange}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        {errors.submit && <div className="editarCliente-submitError">{errors.submit}</div>}

        <div className="editarCliente-actions">
          <button type="submit" className="editarCliente-submitButton" disabled={isSubmitting}>
            <FaSave /> {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarCliente
"use client"

import { useState } from "react"
import { Save, X, Users, User, Mail, Phone, MapPin, FileText, CreditCard, ToggleLeft } from "lucide-react"
import Swal from "sweetalert2"
import "../../../../shared/styles/Clientes/CrearClientes.css"

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Función para obtener el token
const getValidToken = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  if (!token) {
    console.error("No hay token en localStorage ni en sessionStorage")
    return null
  }
  return token
}

const CrearCliente = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    direccion: "",
    tipo_documento: "Cédula de ciudadanía",
    documento: "",
    correo: "",
    telefono: "",
    estado: "Activo",
  })
  const [cargando, setCargando] = useState(false)
  const [errores, setErrores] = useState({})

  // Validar formulario con validaciones mejoradas
  const validarFormulario = () => {
    const nuevosErrores = {}

    // Validar nombre - solo letras y espacios
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio"
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre.trim())) {
      nuevosErrores.nombre = "El nombre solo puede contener letras y espacios"
    }

    // Validar apellido - solo letras y espacios
    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio"
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellido.trim())) {
      nuevosErrores.apellido = "El apellido solo puede contener letras y espacios"
    }

    // Validar documento - solo números
    if (!formData.documento.trim()) {
      nuevosErrores.documento = "El documento es obligatorio"
    } else if (!/^\d+$/.test(formData.documento.trim())) {
      nuevosErrores.documento = "El documento solo puede contener números"
    }

    // Validar correo si se proporciona
    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      nuevosErrores.correo = "El formato del correo no es válido"
    }

    // Validar teléfono - solo números y espacios, entre 7 y 15 dígitos
    if (formData.telefono) {
      const telefonoLimpio = formData.telefono.replace(/\s/g, "")
      if (!/^\d+$/.test(telefonoLimpio)) {
        nuevosErrores.telefono = "El teléfono solo puede contener números"
      } else if (telefonoLimpio.length < 7 || telefonoLimpio.length > 15) {
        nuevosErrores.telefono = "El teléfono debe tener entre 7 y 15 dígitos"
      }
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  // Manejadores específicos para validación en tiempo real
  const handleNombreChange = (e) => {
    const value = e.target.value
    // Permitir solo letras, espacios y caracteres acentuados
    const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
    setFormData((prev) => ({ ...prev, nombre: filteredValue }))

    if (errores.nombre) {
      setErrores((prev) => ({ ...prev, nombre: "" }))
    }
  }

  const handleApellidoChange = (e) => {
    const value = e.target.value
    // Permitir solo letras, espacios y caracteres acentuados
    const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
    setFormData((prev) => ({ ...prev, apellido: filteredValue }))

    if (errores.apellido) {
      setErrores((prev) => ({ ...prev, apellido: "" }))
    }
  }

  const handleDocumentoChange = (e) => {
    const value = e.target.value
    // Permitir solo números
    const filteredValue = value.replace(/[^\d]/g, "")
    setFormData((prev) => ({ ...prev, documento: filteredValue }))

    if (errores.documento) {
      setErrores((prev) => ({ ...prev, documento: "" }))
    }
  }

  const handleTelefonoChange = (e) => {
    const value = e.target.value
    // Permitir solo números y espacios
    const filteredValue = value.replace(/[^\d\s]/g, "")
    setFormData((prev) => ({ ...prev, telefono: filteredValue }))

    if (errores.telefono) {
      setErrores((prev) => ({ ...prev, telefono: "" }))
    }
  }

  // Manejador para cambios generales en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Manejador para enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      Swal.fire("Error", "Por favor corrija los errores en el formulario", "error")
      return
    }

    // Validar token antes de hacer la petición
    const token = getValidToken()
    if (!token) {
      Swal.fire("Error", "Error de autenticación. Por favor inicie sesión nuevamente.", "error")
      return
    }

    try {
      setCargando(true)

      const clienteData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        direccion: formData.direccion.trim() || null,
        tipo_documento: formData.tipo_documento,
        documento: formData.documento.trim(),
        correo: formData.correo.trim() || null,
        telefono: formData.telefono.trim() || null,
        estado: formData.estado,
      }

      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(clienteData),
      })

      if (response.ok) {
        const result = await response.json()
        await Swal.fire("¡Éxito!", "El cliente ha sido creado exitosamente", "success")

        // Redirigir al listado de clientes
        window.location.href = "/ListarClientes"
      } else if (response.status === 401) {
        Swal.fire("Error", "Error de autenticación. Por favor inicie sesión nuevamente.", "error")
      } else {
        const error = await response.json()
        Swal.fire("Error", `Error al crear el cliente: ${error.message || "Error desconocido"}`, "error")
      }
    } catch (error) {
      console.error("Error:", error)
      Swal.fire("Error", "Error de conexión al crear el cliente", "error")
    } finally {
      setCargando(false)
    }
  }

  // Manejador para cancelar
  const handleCancel = () => {
    window.location.href = "/ListarClientes"
  }

  if (cargando) {
    return (
      <div className="crearCliente-container">
        <div className="crearCliente-loading">
          <div className="crearCliente-spinner"></div>
          <p>Creando cliente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="crearCliente-container">
      <div className="crearCliente-header">
        <h1 className="crearCliente-page-title">
          <Users className="crearCliente-title-icon" />
          Crear Nuevo Cliente
        </h1>
        <p className="crearCliente-subtitle">Registra un nuevo cliente en el sistema</p>
      </div>

      <form className="crearCliente-form" onSubmit={handleSubmit}>
        {/* Información personal */}
        <div className="crearCliente-form-section">
          <h3 className="crearCliente-section-title">
            <User className="crearCliente-section-icon" />
            Información Personal
          </h3>

          <div className="crearCliente-info-card">
            <h4 className="crearCliente-info-title">
              <Users size={14} />
              Información importante
            </h4>
            <p className="crearCliente-info-text">
              Complete la información personal del cliente. Los campos marcados con (*) son obligatorios. Solo se
              permiten letras en nombres y apellidos, y números en documentos y teléfonos.
            </p>
          </div>

          <div className="crearCliente-form-grid">
            <div className="crearCliente-form-group">
              <label htmlFor="nombre" className="crearCliente-label">
                <User className="crearCliente-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className={`crearCliente-form-input ${errores.nombre ? "error" : ""} ${formData.nombre && !errores.nombre ? "valid" : ""}`}
                placeholder="Ej: Juan Carlos"
                value={formData.nombre}
                onChange={handleNombreChange}
                required
              />
              {errores.nombre && <span className="crearCliente-error-message">{errores.nombre}</span>}
              {!errores.nombre && <span className="crearCliente-help-text">Solo letras y espacios</span>}
            </div>

            <div className="crearCliente-form-group">
              <label htmlFor="apellido" className="crearCliente-label">
                <User className="crearCliente-label-icon" />
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                className={`crearCliente-form-input ${errores.apellido ? "error" : ""} ${formData.apellido && !errores.apellido ? "valid" : ""}`}
                placeholder="Ej: Pérez García"
                value={formData.apellido}
                onChange={handleApellidoChange}
                required
              />
              {errores.apellido && <span className="crearCliente-error-message">{errores.apellido}</span>}
              {!errores.apellido && <span className="crearCliente-help-text">Solo letras y espacios</span>}
            </div>
          </div>
        </div>

        {/* Información de identificación */}
        <div className="crearCliente-form-section">
          <h3 className="crearCliente-section-title">
            <CreditCard className="crearCliente-section-icon" />
            Información de Identificación
          </h3>

          <div className="crearCliente-form-grid">
            <div className="crearCliente-form-group">
              <label htmlFor="tipo_documento" className="crearCliente-label">
                <FileText className="crearCliente-label-icon" />
                Tipo de Documento *
              </label>
              <select
                id="tipo_documento"
                name="tipo_documento"
                className="crearCliente-form-select"
                value={formData.tipo_documento}
                onChange={handleInputChange}
                required
              >
                <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                <option value="Tarjeta de identidad">Tarjeta de identidad</option>
              </select>
            </div>

            <div className="crearCliente-form-group">
              <label htmlFor="documento" className="crearCliente-label">
                <CreditCard className="crearCliente-label-icon" />
                Número de Documento *
              </label>
              <input
                type="text"
                id="documento"
                name="documento"
                className={`crearCliente-form-input ${errores.documento ? "error" : ""} ${formData.documento && !errores.documento ? "valid" : ""}`}
                placeholder="Ej: 1234567890"
                value={formData.documento}
                onChange={handleDocumentoChange}
                required
              />
              {errores.documento && <span className="crearCliente-error-message">{errores.documento}</span>}
              {!errores.documento && <span className="crearCliente-help-text">Solo números</span>}
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="crearCliente-form-section">
          <h3 className="crearCliente-section-title">
            <Phone className="crearCliente-section-icon" />
            Información de Contacto
          </h3>

          <div className="crearCliente-form-grid">
            <div className="crearCliente-form-group">
              <label htmlFor="correo" className="crearCliente-label">
                <Mail className="crearCliente-label-icon" />
                Correo Electrónico
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                className={`crearCliente-form-input ${errores.correo ? "error" : ""} ${formData.correo && !errores.correo ? "valid" : ""}`}
                placeholder="Ej: cliente@email.com"
                value={formData.correo}
                onChange={handleInputChange}
              />
              {errores.correo && <span className="crearCliente-error-message">{errores.correo}</span>}
              {!errores.correo && <span className="crearCliente-help-text">Formato: usuario@dominio.com</span>}
            </div>

            <div className="crearCliente-form-group">
              <label htmlFor="telefono" className="crearCliente-label">
                <Phone className="crearCliente-label-icon" />
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                className={`crearCliente-form-input ${errores.telefono ? "error" : ""} ${formData.telefono && !errores.telefono ? "valid" : ""}`}
                placeholder="Ej: 3001234567"
                value={formData.telefono}
                onChange={handleTelefonoChange}
              />
              {errores.telefono && <span className="crearCliente-error-message">{errores.telefono}</span>}
              {!errores.telefono && <span className="crearCliente-help-text">Solo números, 7-15 dígitos</span>}
            </div>

            <div className="crearCliente-form-group full-width">
              <label htmlFor="direccion" className="crearCliente-label">
                <MapPin className="crearCliente-label-icon" />
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                className="crearCliente-form-input"
                placeholder="Ej: Calle 123 #45-67, Barrio Centro"
                value={formData.direccion}
                onChange={handleInputChange}
              />
              <span className="crearCliente-help-text">Dirección completa del cliente</span>
            </div>

            <div className="crearCliente-form-group">
              <label htmlFor="estado" className="crearCliente-label">
                <ToggleLeft className="crearCliente-label-icon" />
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                className="crearCliente-form-select"
                value={formData.estado}
                onChange={handleInputChange}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Acciones del formulario */}
        <div className="crearCliente-form-actions">
          <button type="button" className="crearCliente-cancel-button" onClick={handleCancel}>
            <X className="crearCliente-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearCliente-submit-button" disabled={cargando}>
            <Save className="crearCliente-button-icon" />
            {cargando ? "Guardando..." : "Crear Cliente"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CrearCliente

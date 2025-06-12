"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserTag,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaUsers,
} from "react-icons/fa"
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

// Hook personalizado para manejo de API
const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const makeRequest = useCallback(async (url, options = {}) => {
    setLoading(true)
    setError(null)

    const token = getValidToken()
    if (!token) {
      setError("Error de autenticación")
      setLoading(false)
      return null
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesión expirada. Por favor inicie sesión nuevamente.")
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { makeRequest, loading, error }
}

const CrearCliente = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    direccion: "",
    tipo_documento: "Cédula de ciudadanía",
    documento: "",
    correo: "",
    telefono: "",
    estado: "Activo",
    password: "",
  })

  const [errores, setErrores] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validar campo individual
  const validarCampo = useCallback((name, value) => {
    let nuevoError = ""

    switch (name) {
      case "nombre":
        if (!value.trim()) {
          nuevoError = "El nombre es obligatorio."
        } else if (value.trim().length < 3) {
          nuevoError = "El nombre debe tener al menos 3 caracteres."
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          nuevoError = "El nombre solo puede contener letras y espacios."
        }
        break
      case "apellido":
        if (!value.trim()) {
          nuevoError = "El apellido es obligatorio."
        } else if (value.trim().length < 3) {
          nuevoError = "El apellido debe tener al menos 3 caracteres."
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          nuevoError = "El apellido solo puede contener letras y espacios."
        }
        break
      case "documento":
        if (!value.trim()) {
          nuevoError = "El documento es obligatorio."
        } else if (!/^\d+$/.test(value.trim())) {
          nuevoError = "El documento solo puede contener números."
        }
        break
      case "correo":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          nuevoError = "Ingresa un correo electrónico válido."
        }
        break
      case "telefono":
        if (value) {
          const telefonoLimpio = value.replace(/\s/g, "")
          if (!/^\d+$/.test(telefonoLimpio)) {
            nuevoError = "El teléfono solo puede contener números."
          } else if (telefonoLimpio.length < 7 || telefonoLimpio.length > 15) {
            nuevoError = "El teléfono debe tener entre 7 y 15 dígitos."
          }
        }
        break
      case "direccion":
        if (!value.trim()) {
          nuevoError = "La dirección es obligatoria."
        } else if (value.trim().length < 5) {
          nuevoError = "La dirección debe tener al menos 5 caracteres."
        }
        break
      case "password":
        if (!value) {
          nuevoError = "La contraseña es obligatoria."
        } else {
          const errores = []
          if (value.length < 8) {
            errores.push("al menos 8 caracteres")
          }
          if (!/[A-Z]/.test(value)) {
            errores.push("una letra mayúscula")
          }
          if (!/[0-9]/.test(value)) {
            errores.push("un número")
          }

          if (errores.length > 0) {
            nuevoError = "La contraseña debe contener: " + errores.join(", ") + "."
          }
        }
        break
    }

    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
  }, [])

  // Manejadores específicos para validación en tiempo real
  const handleNombreChange = useCallback(
    (e) => {
      const value = e.target.value
      // Permitir solo letras, espacios y caracteres acentuados
      const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
      setFormData((prev) => ({ ...prev, nombre: filteredValue }))
      validarCampo("nombre", filteredValue)
    },
    [validarCampo],
  )

  const handleApellidoChange = useCallback(
    (e) => {
      const value = e.target.value
      // Permitir solo letras, espacios y caracteres acentuados
      const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
      setFormData((prev) => ({ ...prev, apellido: filteredValue }))
      validarCampo("apellido", filteredValue)
    },
    [validarCampo],
  )

  const handleDocumentoChange = useCallback(
    (e) => {
      const value = e.target.value
      // Permitir solo números
      const filteredValue = value.replace(/[^\d]/g, "")
      setFormData((prev) => ({ ...prev, documento: filteredValue }))
      validarCampo("documento", filteredValue)
    },
    [validarCampo],
  )

  const handleTelefonoChange = useCallback(
    (e) => {
      const value = e.target.value
      // Permitir solo números y espacios
      const filteredValue = value.replace(/[^\d\s]/g, "")
      setFormData((prev) => ({ ...prev, telefono: filteredValue }))
      validarCampo("telefono", filteredValue)
    },
    [validarCampo],
  )

  // Manejador para cambios generales en el formulario
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))

      validarCampo(name, value)
    },
    [validarCampo],
  )

  // Función para permitir solo números
  const soloNumeros = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "")
  }, [])

  // Función para permitir solo letras
  const soloLetras = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "")
  }, [])

  // Validar formulario completo
  const validarFormulario = useCallback(() => {
    let hayErrores = false
    const nuevosErrores = {}

    // Validar todos los campos requeridos
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio."
      hayErrores = true
    }
    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio."
      hayErrores = true
    }
    if (!formData.documento.trim()) {
      nuevosErrores.documento = "El documento es obligatorio."
      hayErrores = true
    }
    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es obligatoria."
      hayErrores = true
    }
    if (!formData.password) {
      nuevosErrores.password = "La contraseña es obligatoria."
      hayErrores = true
    }

    // Actualizar errores
    setErrores(nuevosErrores)

    return !hayErrores
  }, [formData])

  // Manejador para enviar el formulario
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (!validarFormulario()) {
        await Swal.fire({
          icon: "warning",
          title: "Campos inválidos",
          text: "Por favor corrige los errores antes de continuar.",
          confirmButtonColor: "#2563eb",
        })
        return
      }

      setIsSubmitting(true)

      try {
        const clienteData = {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          direccion: formData.direccion.trim() || null,
          tipo_documento: formData.tipo_documento,
          documento: formData.documento.trim(),
          correo: formData.correo.trim() || null,
          telefono: formData.telefono.trim() || null,
          estado: formData.estado,
          password: formData.password,
        }

        await makeRequest("/clientes", {
          method: "POST",
          body: JSON.stringify(clienteData),
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "El cliente ha sido creado exitosamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        // Redirigir al listado de clientes
        navigate("/ListarClientes")
      } catch (error) {
        console.error("Error:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "Error al crear el cliente",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validarFormulario, makeRequest, navigate],
  )

  // Manejador para cancelar
  const handleCancel = useCallback(async () => {
    const hasData = Object.values(formData).some(
      (value) => value !== "" && value !== "Cédula de ciudadanía" && value !== "Activo",
    )

    if (hasData) {
      const result = await Swal.fire({
        title: "¿Cancelar creación?",
        text: "Se perderán todos los datos ingresados",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Continuar editando",
      })

      if (result.isConfirmed) {
        navigate("/ListarClientes")
      }
    } else {
      navigate("/ListarClientes")
    }
  }, [formData, navigate])

  if (apiLoading) {
    return (
      <div className="crearCliente-container">
        <div className="crearCliente-loading">
          <div className="crearCliente-spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="crearCliente-container">
      <div className="crearCliente-header">
        <h1 className="crearCliente-page-title">
          <FaUsers className="crearCliente-title-icon" />
          Crear Nuevo Cliente
        </h1>
        <p className="crearCliente-subtitle">Registra un nuevo cliente en el sistema</p>
      </div>

      <form className="crearCliente-form" onSubmit={handleSubmit}>
        {/* Información personal */}
        <div className="crearCliente-form-section">
          <h3 className="crearCliente-section-title">
            <FaUser className="crearCliente-section-icon" />
            Información Personal
          </h3>

          <div className="crearCliente-form-grid">
            <div className="crearCliente-form-group">
              <label htmlFor="nombre" className="crearCliente-label">
                <FaUser className="crearCliente-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className={`crearCliente-form-input ${errores.nombre ? "error" : ""}`}
                placeholder="Ej: Juan Carlos"
                value={formData.nombre}
                onChange={handleNombreChange}
                onInput={soloLetras}
                maxLength={30}
                autoComplete="off"
                required
              />
              {errores.nombre && (
                <span className="crearCliente-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="crearCliente-form-group">
              <label htmlFor="apellido" className="crearCliente-label">
                <FaUser className="crearCliente-label-icon" />
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                className={`crearCliente-form-input ${errores.apellido ? "error" : ""}`}
                placeholder="Ej: Pérez García"
                value={formData.apellido}
                onChange={handleApellidoChange}
                onInput={soloLetras}
                maxLength={35}
                autoComplete="off"
                required
              />
              {errores.apellido && (
                <span className="crearCliente-error-text">
                  <FaExclamationTriangle /> {errores.apellido}
                </span>
              )}
            </div>

            <div className="crearCliente-form-group">
              <label htmlFor="tipo_documento" className="crearCliente-label">
                <FaIdCard className="crearCliente-label-icon" />
                Tipo de Documento *
              </label>
              <select
                id="tipo_documento"
                name="tipo_documento"
                className="crearCliente-form-input"
                value={formData.tipo_documento}
                onChange={handleInputChange}
                required
              >
                <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                <option value="Tarjeta de identidad">Tarjeta de identidad</option>
                <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="crearCliente-form-group">
              <label htmlFor="documento" className="crearCliente-label">
                <FaIdCard className="crearCliente-label-icon" />
                Número de Documento *
              </label>
              <input
                type="text"
                id="documento"
                name="documento"
                className={`crearCliente-form-input ${errores.documento ? "error" : ""}`}
                placeholder="Ej: 1234567890"
                value={formData.documento}
                onChange={handleDocumentoChange}
                onInput={soloNumeros}
                maxLength={15}
                autoComplete="off"
                required
              />
              {errores.documento && (
                <span className="crearCliente-error-text">
                  <FaExclamationTriangle /> {errores.documento}
                </span>
              )}
            </div>

            <div className="crearCliente-form-group">
              <label htmlFor="correo" className="crearCliente-label">
                <FaEnvelope className="crearCliente-label-icon" />
                Correo Electrónico
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                className={`crearCliente-form-input ${errores.correo ? "error" : ""}`}
                placeholder="Ej: cliente@email.com"
                value={formData.correo}
                onChange={handleInputChange}
                maxLength={254}
                autoComplete="off"
              />
              {errores.correo && (
                <span className="crearCliente-error-text">
                  <FaExclamationTriangle /> {errores.correo}
                </span>
              )}
            </div>

            <div className="crearCliente-form-group">
              <label htmlFor="telefono" className="crearCliente-label">
                <FaPhone className="crearCliente-label-icon" />
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                className={`crearCliente-form-input ${errores.telefono ? "error" : ""}`}
                placeholder="Ej: 3001234567"
                value={formData.telefono}
                onChange={handleTelefonoChange}
                onInput={soloNumeros}
                maxLength={15}
                autoComplete="off"
              />
              {errores.telefono && (
                <span className="crearCliente-error-text">
                  <FaExclamationTriangle /> {errores.telefono}
                </span>
              )}
            </div>

            <div className="crearCliente-form-group">
              <label htmlFor="direccion" className="crearCliente-label">
                <FaMapMarkerAlt className="crearCliente-label-icon" />
                Dirección *
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                className={`crearCliente-form-input ${errores.direccion ? "error" : ""}`}
                placeholder="Ej: Calle 123 #45-67, Barrio Centro"
                value={formData.direccion}
                onChange={handleInputChange}
                maxLength={100}
                autoComplete="off"
                required
              />
              {errores.direccion && (
                <span className="crearCliente-error-text">
                  <FaExclamationTriangle /> {errores.direccion}
                </span>
              )}
            </div>

            <div className="crearCliente-form-group">
              <label htmlFor="estado" className="crearCliente-label">
                <FaUserTag className="crearCliente-label-icon" />
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                className="crearCliente-form-input"
                value={formData.estado}
                onChange={handleInputChange}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuración de cuenta */}
        <div className="crearCliente-form-section">
          <h3 className="crearCliente-section-title">
            <FaUser className="crearCliente-section-icon" />
            Configuración de Cuenta
          </h3>
          <div className="crearCliente-form-grid">
            <div className="crearCliente-form-group">
              <label htmlFor="password" className="crearCliente-label">
                <FaUser className="crearCliente-label-icon" />
                Contraseña *
              </label>
              <div className="crearCliente-password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  maxLength={30}
                  autoComplete="new-password"
                  className={`crearCliente-form-input ${errores.password ? "error" : ""}`}
                  placeholder="Ingrese una contraseña segura"
                  required
                />
                <button
                  type="button"
                  className="crearCliente-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errores.password && (
                <span className="crearCliente-error-text">
                  <FaExclamationTriangle /> {errores.password}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Acciones del formulario */}
        <div className="crearCliente-form-actions">
          <button type="button" className="crearCliente-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="crearCliente-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearCliente-submit-button" disabled={isSubmitting || apiLoading}>
            {isSubmitting ? (
              <>
                <FaSpinner className="crearCliente-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="crearCliente-button-icon" />
                Crear Cliente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CrearCliente

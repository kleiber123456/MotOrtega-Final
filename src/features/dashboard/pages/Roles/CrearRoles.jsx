"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft, FaUserShield, FaIdCard, FaTimes, FaSpinner, FaExclamationTriangle, FaSave, FaLock } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Roles/CrearRoles.css"

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

const CrearRol = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "Activo",
  })

  const [errores, setErrores] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)

  // Función para verificar si el rol ya existe
  const verificarRolExistente = useCallback(
    async (nombre) => {
      if (!nombre.trim()) return false

      try {
        setIsCheckingDuplicate(true)
        const roles = await makeRequest("/roles")

        if (roles && Array.isArray(roles)) {
          return roles.some((rol) => rol.nombre.toLowerCase().trim() === nombre.toLowerCase().trim())
        }
        return false
      } catch (error) {
        console.error("Error al verificar rol existente:", error)
        return false
      } finally {
        setIsCheckingDuplicate(false)
      }
    },
    [makeRequest],
  )

  // Validar campo individual
  const validarCampo = useCallback((name, value) => {
    let nuevoError = ""

    switch (name) {
      case "nombre":
        if (!value.trim()) {
          nuevoError = "El nombre del rol es obligatorio."
        } else if (value.trim().length < 3) {
          nuevoError = "El nombre debe tener al menos 3 caracteres."
        } else if (value.trim().length > 50) {
          nuevoError = "El nombre no puede exceder 50 caracteres."
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          nuevoError = "El nombre solo puede contener letras y espacios."
        }
        break
      case "descripcion":
        if (!value.trim()) {
          nuevoError = "La descripción es obligatoria."
        } else if (value.trim().length < 10) {
          nuevoError = "La descripción debe tener al menos 10 caracteres."
        } else if (value.trim().length > 500) {
          nuevoError = "La descripción no puede exceder 500 caracteres."
        }
        break
    }

    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
    return nuevoError === ""
  }, [])

  // Manejadores específicos para validación en tiempo real
  const handleNombreChange = useCallback(
    (e) => {
      const value = e.target.value
      const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
      setFormData((prev) => ({ ...prev, nombre: filteredValue }))
      validarCampo("nombre", filteredValue)
    },
    [validarCampo],
  )

  // Validación cuando el usuario termina de escribir el nombre (onBlur)
  const handleNombreBlur = useCallback(
    async (e) => {
      const nombre = e.target.value.trim()
      if (nombre && validarCampo("nombre", nombre)) {
        const existe = await verificarRolExistente(nombre)
        if (existe) {
          setErrores((prev) => ({
            ...prev,
            nombre: "Ya existe un rol con este nombre. Por favor elige otro nombre.",
          }))
        }
      }
    },
    [validarCampo, verificarRolExistente],
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

  // Validar formulario completo
  const validarFormulario = useCallback(() => {
    let hayErrores = false
    const nuevosErrores = {}

    // Validar todos los campos requeridos
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre del rol es obligatorio."
      hayErrores = true
    } else if (!validarCampo("nombre", formData.nombre)) {
      hayErrores = true
    }

    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria."
      hayErrores = true
    } else if (!validarCampo("descripcion", formData.descripcion)) {
      hayErrores = true
    }

    // Verificar si hay errores existentes
    const tieneErroresExistentes = Object.values(errores).some((error) => error !== "")
    if (tieneErroresExistentes) {
      hayErrores = true
    }

    // Actualizar errores
    setErrores((prev) => ({ ...prev, ...nuevosErrores }))

    return !hayErrores
  }, [formData, errores, validarCampo])

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
        // Verificar una vez más si el rol existe antes de crear
        const existe = await verificarRolExistente(formData.nombre)
        if (existe) {
          setErrores((prev) => ({
            ...prev,
            nombre: "Ya existe un rol con este nombre. Por favor elige otro nombre.",
          }))

          await Swal.fire({
            icon: "error",
            title: "Rol duplicado",
            text: "Ya existe un rol con este nombre. Por favor elige otro nombre.",
            confirmButtonColor: "#ef4444",
          })
          return
        }

        const rolData = {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          estado: formData.estado,
        }

        console.log("Creando rol:", rolData)

        await makeRequest("/roles", {
          method: "POST",
          body: JSON.stringify(rolData),
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "El rol ha sido creado exitosamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
          showConfirmButton: false,
        })

        // Redirigir al listado de roles
        navigate("/ListarRoles")
      } catch (error) {
        console.error("Error:", error)

        let errorMessage = "Error al crear el rol"
        if (error.message?.includes("duplicate") || error.message?.includes("duplicado")) {
          errorMessage = "Ya existe un rol con este nombre"
          setErrores((prev) => ({
            ...prev,
            nombre: "Ya existe un rol con este nombre. Por favor elige otro nombre.",
          }))
        } else if (error.message) {
          errorMessage = error.message
        }

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validarFormulario, makeRequest, navigate, verificarRolExistente, errores],
  )

  // Manejador para cancelar
  const handleCancel = useCallback(async () => {
    const hasData = Object.values(formData).some(
      (value) =>
        (typeof value === "string" && value !== "" && value !== "Personalizado" && value !== "Activo") ||
        (Array.isArray(value) && value.length > 0),
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
        navigate("/ListarRoles")
      }
    } else {
      navigate("/ListarRoles")
    }
  }, [formData, navigate])

  if (apiLoading) {
    return (
      <div className="crearRol-container">
        <div className="crearRol-loading">
          <div className="crearRol-spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="crearRol-container">
      <div className="editarUsuario-header">
        <div className="editarUsuario-header-left">
          <button
            className="editarUsuario-btn-back"
            onClick={() => navigate(-1)}
            type="button"
          >
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarUsuario-title-section">
            <h1 className="crearRol-page-title">
              <FaUserShield className="crearRol-title-icon" />
              Crear Nuevo Rol
            </h1>
            <p className="crearRol-subtitle">Define un nuevo rol con sus permisos correspondientes</p>
          </div>
        </div>
      </div>

      <form className="crearRol-form" onSubmit={handleSubmit}>
        {/* Información básica */}
        <div className="crearRol-form-section">
          <h3 className="crearRol-section-title">
            <FaIdCard className="crearRol-section-icon" />
            Información Básica
          </h3>

          <div className="crearRol-form-grid">
            <div className="crearRol-form-group">
              <label htmlFor="nombre" className="crearRol-label">
                <FaUserShield className="crearRol-label-icon" />
                Nombre del Rol *{isCheckingDuplicate && <FaSpinner className="crearRol-checking-icon spinning" />}
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className={`crearRol-form-input ${errores.nombre ? "error" : ""}`}
                placeholder="Ej: Administrador de Ventas"
                value={formData.nombre}
                onChange={handleNombreChange}
                onBlur={handleNombreBlur}
                maxLength={50}
                autoComplete="off"
                disabled={isCheckingDuplicate}
                required
              />
              {errores.nombre && (
                <span className="crearRol-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="crearRol-form-group">
              <label htmlFor="estado" className="crearRol-label">
                <FaLock className="crearRol-label-icon" />
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                className="crearRol-form-input"
                value={formData.estado}
                onChange={handleInputChange}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className="crearRol-form-group crearRol-form-group-full">
              <label htmlFor="descripcion" className="crearRol-label">
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                className={`crearRol-form-textarea ${errores.descripcion ? "error" : ""}`}
                placeholder="Describe las responsabilidades y alcance de este rol..."
                value={formData.descripcion}
                onChange={handleInputChange}
                maxLength={500}
                rows={4}
                required
              />
              {errores.descripcion && (
                <span className="crearRol-error-text">
                  <FaExclamationTriangle /> {errores.descripcion}
                </span>
              )}
              <small className="crearRol-char-count">{formData.descripcion.length}/500 caracteres</small>
            </div>
          </div>
        </div>

        {/* Acciones del formulario */}
        <div className="crearRol-form-actions">
          <button type="button" className="crearRol-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="crearRol-button-icon" />
            Cancelar
          </button>
          <button
            type="submit"
            className="crearRol-submit-button"
            disabled={isSubmitting || apiLoading || isCheckingDuplicate}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="crearRol-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="crearRol-button-icon" />
                Crear Rol
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CrearRol

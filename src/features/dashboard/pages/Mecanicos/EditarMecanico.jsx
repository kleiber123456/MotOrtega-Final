"use client"

import { useState, useCallback, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  FaUser,
  FaIdCard,
  FaPhone,
  FaMapMarkerAlt,
  FaTools,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Usuarios/EditarUsuario.css"

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Función para obtener token
const getValidToken = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  if (!token) {
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
console
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

const EditarMecanico = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { makeRequest, loading: apiLoading } = useApi()

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "Cédula de ciudadanía",
    documento: "",
    direccion: "",
    telefono: "",
    telefono_emergencia: "",
    estado: "Activo",
  })

  const [errores, setErrores] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cargando, setCargando] = useState(true)

  // Cargar datos del mecánico (SIN horarios)
  useEffect(() => {
    const cargarMecanico = async () => {
      if (!id) {
        
        navigate("/ListarMecanicos")
        return
      }

      try {
        setCargando(true)
        

        // Solo cargar datos básicos del mecánico, NO horarios
        const data = await makeRequest(`/mecanicos/${id}`)

        if (data) {
          

          // Mapear solo los campos que existen en la base de datos
          setFormulario({
            nombre: data.nombre || "",
            apellido: data.apellido || "",
            tipo_documento: data.tipo_documento || "Cédula de ciudadanía",
            documento: data.documento || "",
            direccion: data.direccion || "",
            telefono: data.telefono || "",
            telefono_emergencia: data.telefono_emergencia || "",
            estado: data.estado || "Activo",
          })
        } else {
          throw new Error("No se encontraron datos del mecánico")
        }
      } catch (error) {
        console.error("Error al cargar mecánico:", error)

        // Mostrar error específico sin mencionar horarios
        const errorMessage = error.message?.includes("horario")
          ? "No se pudo cargar la información del mecánico"
          : error.message || "Error al cargar los datos"

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          confirmButtonColor: "#ef4444",
        })

        navigate("/ListarMecanicos")
      } finally {
        setCargando(false)
      }
    }

    cargarMecanico()
  }, [id, makeRequest, navigate])

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setFormulario((prev) => ({ ...prev, [name]: value }))

      // Limpiar error del campo cuando el usuario empiece a escribir
      if (errores[name]) {
        setErrores((prev) => ({ ...prev, [name]: "" }))
      }
    },
    [errores],
  )

  const validarCampo = useCallback((name, value) => {
    let nuevoError = ""

    switch (name) {
      case "nombre":
        if (!value.trim()) {
          nuevoError = "El nombre es obligatorio."
        } else if (value.trim().length < 2) {
          nuevoError = "El nombre debe tener al menos 2 caracteres."
        } else if (value.trim().length > 45) {
          nuevoError = "El nombre no puede exceder 45 caracteres."
        }
        break
      case "apellido":
        if (!value.trim()) {
          nuevoError = "El apellido es obligatorio."
        } else if (value.trim().length < 2) {
          nuevoError = "El apellido debe tener al menos 2 caracteres."
        } else if (value.trim().length > 45) {
          nuevoError = "El apellido no puede exceder 45 caracteres."
        }
        break
      case "documento":
        if (!value.trim()) {
          nuevoError = "El documento es obligatorio."
        } else if (value.trim().length < 6) {
          nuevoError = "El documento debe tener al menos 6 caracteres."
        } else if (value.trim().length > 45) {
          nuevoError = "El documento no puede exceder 45 caracteres."
        }
        break
      case "tipo_documento":
        if (!value) {
          nuevoError = "Selecciona un tipo de documento."
        }
        break
      case "direccion":
        if (!value.trim()) {
          nuevoError = "La dirección es obligatoria."
        } else if (value.trim().length < 5) {
          nuevoError = "La dirección debe tener al menos 5 caracteres."
        } else if (value.trim().length > 100) {
          nuevoError = "La dirección no puede exceder 100 caracteres."
        }
        break
      case "telefono":
        if (!value.trim()) {
          nuevoError = "El teléfono es obligatorio."
        } else if (value.trim().length < 7) {
          nuevoError = "El teléfono debe tener al menos 7 números."
        } else if (value.trim().length > 45) {
          nuevoError = "El teléfono no puede exceder 45 caracteres."
        }
        break
      case "telefono_emergencia":
        if (!value.trim()) {
          nuevoError = "El teléfono de emergencia es obligatorio."
        } else if (value.trim().length < 7) {
          nuevoError = "El teléfono de emergencia debe tener al menos 7 números."
        } else if (value.trim().length > 45) {
          nuevoError = "El teléfono de emergencia no puede exceder 45 caracteres."
        }
        break
    }

    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
    return nuevoError === ""
  }, [])

  const validarFormulario = useCallback(() => {
    const camposRequeridos = [
      "nombre",
      "apellido",
      "documento",
      "tipo_documento",
      "direccion",
      "telefono",
      "telefono_emergencia",
    ]

    let formularioValido = true
    const nuevosErrores = {}

    // Validar cada campo requerido
    camposRequeridos.forEach((campo) => {
      const esValido = validarCampo(campo, formulario[campo])
      if (!esValido) {
        formularioValido = false
      }
    })

    return formularioValido
  }, [formulario, validarCampo])

  const soloNumeros = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "")
  }, [])

  const soloLetras = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "")
  }, [])

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
        console.log("Enviando datos del mecánico:", formulario)

        // Enviar solo los datos que corresponden a la estructura de la BD
        const datosParaEnviar = {
          nombre: formulario.nombre.trim(),
          apellido: formulario.apellido.trim(),
          tipo_documento: formulario.tipo_documento,
          documento: formulario.documento.trim(),
          direccion: formulario.direccion.trim(),
          telefono: formulario.telefono.trim(),
          telefono_emergencia: formulario.telefono_emergencia.trim(),
          estado: formulario.estado,
        }

        await makeRequest(`/mecanicos/${id}`, {
          method: "PUT",
          body: JSON.stringify(datosParaEnviar),
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Mecánico actualizado correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
          showConfirmButton: false,
        })

        navigate("/ListarMecanicos")
      } catch (error) {
        console.error("Error al actualizar mecánico:", error)

        let errorMessage = "No se pudo actualizar el mecánico"
        if (error.message?.includes("duplicate") || error.message?.includes("duplicado")) {
          errorMessage = "Ya existe un mecánico con este documento"
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
    [formulario, validarFormulario, makeRequest, navigate, id],
  )

  const handleCancel = useCallback(async () => {
    const result = await Swal.fire({
      title: "¿Cancelar edición?",
      text: "Se perderán todos los cambios realizados",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Continuar editando",
    })

    if (result.isConfirmed) {
      navigate("/ListarMecanicos")
    }
  }, [navigate])

  if (cargando) {
    return (
      <div className="editarUsuario-container">
        <div className="editarUsuario-loading">
          <div className="editarUsuario-spinner"></div>
          <p>Cargando datos del mecánico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editarUsuario-container">
      <div className="editarUsuario-header">
        <div className="editarUsuario-header-left">
          <button className="editarUsuario-btn-back" onClick={() => navigate("/ListarMecanicos")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarUsuario-title-section">
            <h1 className="editarUsuario-page-title">
              <FaTools className="editarUsuario-title-icon" />
              Editar Mecánico
            </h1>
            <p className="editarUsuario-subtitle">Modifica la información del mecánico</p>
          </div>
        </div>
      </div>

      <form className="editarUsuario-form" onSubmit={handleSubmit}>
        <div className="editarUsuario-form-section">
          <h3 className="editarUsuario-section-title">
            <FaUser className="editarUsuario-section-icon" />
            Información Personal
          </h3>
          <div className="editarUsuario-form-grid">
            <div className="editarUsuario-form-group">
              <label htmlFor="nombre" className="editarUsuario-label">
                <FaUser className="editarUsuario-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={45}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="apellido" className="editarUsuario-label">
                <FaUser className="editarUsuario-label-icon" />
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formulario.apellido}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={45}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.apellido ? "error" : ""}`}
                required
              />
              {errores.apellido && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.apellido}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="tipo_documento" className="editarUsuario-label">
                <FaIdCard className="editarUsuario-label-icon" />
                Tipo Documento *
              </label>
              <select
                id="tipo_documento"
                name="tipo_documento"
                value={formulario.tipo_documento}
                onChange={handleChange}
                className={`editarUsuario-form-input ${errores.tipo_documento ? "error" : ""}`}
                required
                disabled // <-- Campo deshabilitado
              >
                <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                <option value="Tarjeta de identidad">Tarjeta de identidad</option>
              </select>
              {errores.tipo_documento && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.tipo_documento}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="documento" className="editarUsuario-label">
                <FaIdCard className="editarUsuario-label-icon" />
                Documento *
              </label>
              <input
                type="text"
                id="documento"
                name="documento"
                value={formulario.documento}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={45}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.documento ? "error" : ""}`}
                required
                disabled // <-- Campo deshabilitado
              />
              {errores.documento && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.documento}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="direccion" className="editarUsuario-label">
                <FaMapMarkerAlt className="editarUsuario-label-icon" />
                Dirección *
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formulario.direccion}
                onChange={handleChange}
                maxLength={100}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.direccion ? "error" : ""}`}
                required
              />
              {errores.direccion && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.direccion}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="telefono" className="editarUsuario-label">
                <FaPhone className="editarUsuario-label-icon" />
                Teléfono *
              </label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={formulario.telefono}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={45}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.telefono ? "error" : ""}`}
                required
              />
              {errores.telefono && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.telefono}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="telefono_emergencia" className="editarUsuario-label">
                <FaPhone className="editarUsuario-label-icon" />
                Teléfono de Emergencia *
              </label>
              <input
                type="text"
                id="telefono_emergencia"
                name="telefono_emergencia"
                value={formulario.telefono_emergencia}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={45}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.telefono_emergencia ? "error" : ""}`}
                required
              />
              {errores.telefono_emergencia && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.telefono_emergencia}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="estado" className="editarUsuario-label">
                <FaUser className="editarUsuario-label-icon" />
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={formulario.estado}
                onChange={handleChange}
                className="editarUsuario-form-input"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="editarUsuario-form-actions">
          <button type="button" className="editarUsuario-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="editarUsuario-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="editarUsuario-submit-button" disabled={isSubmitting || apiLoading}>
            {isSubmitting ? (
              <>
                <FaSpinner className="editarUsuario-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="editarUsuario-button-icon" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarMecanico

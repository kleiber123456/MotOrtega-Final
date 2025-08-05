"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  FaArrowLeft, // <-- Agrega este icono
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Usuarios/CrearUsuarios.css"

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Función para obtener token
const getValidToken = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  if (!token) {
    console.error("No hay token disponible")
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

const CrearUsuario = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "Cédula de ciudadanía",
    documento: "",
    direccion: "",
    correo: "",
    telefono: "",
    telefono_emergencia: "",
    rol_id: "",
    estado: "Activo",
    password: "",
  })

  const [roles, setRoles] = useState([])
  const [errores, setErrores] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentoDuplicado, setDocumentoDuplicado] = useState(false)
  const debounceTimeout = useRef(null)

  // Cargar roles al montar el componente
  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const data = await makeRequest("/roles")
        if (data) {
          setRoles(data)
        }
      } catch (error) {
        console.error("Error al cargar roles:", error)
        Swal.fire("Error", "No se pudieron cargar los roles", "error")
      }
    }

    cargarRoles()
  }, [makeRequest])

  const validarCampo = useCallback(
    (name, value) => {
      let nuevoError = ""

      switch (name) {
        case "nombre":
          if (!value.trim()) {
            nuevoError = "El nombre es obligatorio."
          } else if (value.trim().length < 3) {
            nuevoError = "El nombre debe tener al menos 3 caracteres."
          }
          break
        case "apellido":
          if (!value.trim()) {
            nuevoError = "El apellido es obligatorio."
          } else if (value.trim().length < 3) {
            nuevoError = "El apellido debe tener al menos 3 caracteres."
          }
          break
        case "documento":
          if (!value.trim()) {
            nuevoError = "El documento es obligatorio."
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
          }
          break
        case "correo":
          if (!value.trim()) {
            nuevoError = "El correo es obligatorio."
          } else if (!/\S+@\S+\.\S+/.test(value)) {
            nuevoError = "Ingresa un correo electrónico válido."
          }
          break
        case "telefono":
          if (!value.trim()) {
            nuevoError = "El teléfono es obligatorio."
          } else if (value.trim().length < 10) {
            nuevoError = "El teléfono debe tener al menos 10 números."
          }
          break
        case "rol_id":
          if (!value) {
            nuevoError = "Selecciona un rol."
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
        case "telefono_emergencia":
          if (Number.parseInt(formulario.rol_id) === 3) {
            if (!value.trim()) {
              nuevoError = "El teléfono de emergencia es obligatorio para mecánicos."
            } else if (value.trim().length < 10) {
              nuevoError = "El teléfono de emergencia debe tener al menos 10 números."
            }
          }
          break
      }

      setErrores((prev) => ({ ...prev, [name]: nuevoError }))
    },
    [formulario.rol_id],
  )

  // Validar documento duplicado instantáneamente
  const validarDocumentoDuplicado = useCallback(
    async (valor) => {
      if (!valor.trim()) {
        setDocumentoDuplicado(false)
        return
      }
      try {
        const data = await makeRequest(`/usuarios?documento=${valor.trim()}`, { method: "GET" })
        // Si la API retorna usuarios, el documento ya existe
        if (Array.isArray(data) && data.length > 0) {
          setDocumentoDuplicado(true)
          setErrores((prev) => ({
            ...prev,
            documento: "Este número de documento ya está registrado.",
          }))
        } else {
          setDocumentoDuplicado(false)
          setErrores((prev) => ({ ...prev, documento: "" }))
        }
      } catch (error) {
        // Si hay error, no bloquear por defecto
        setDocumentoDuplicado(false)
      }
    },
    [makeRequest],
  )

  // Modifica handleChange para validar documento duplicado con debounce
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target
      // Elimina espacios al inicio para todos los campos
      const cleanValue = typeof value === "string" ? value.replace(/^\s+/, "") : value
      setFormulario((prev) => ({ ...prev, [name]: cleanValue }))
      validarCampo(name, cleanValue)

      if (name === "documento") {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
        debounceTimeout.current = setTimeout(() => {
          validarDocumentoDuplicado(cleanValue)
        }, 400)
      }
    },
    [validarCampo, validarDocumentoDuplicado],
  )

  const validarFormulario = useCallback(() => {
    let hayErrores = false
    const nuevosErrores = {}

    // Validar todos los campos requeridos
    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio."
      hayErrores = true
    }
    if (!formulario.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio."
      hayErrores = true
    }
    if (!formulario.documento.trim()) {
      nuevosErrores.documento = "El documento es obligatorio."
      hayErrores = true
    }
    if (!formulario.correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio."
      hayErrores = true
    }
    if (!formulario.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio."
      hayErrores = true
    }
    if (!formulario.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es obligatoria."
      hayErrores = true
    }
    if (!formulario.rol_id) {
      nuevosErrores.rol_id = "Selecciona un rol."
      hayErrores = true
    }
    if (!formulario.password) {
      nuevosErrores.password = "La contraseña es obligatoria."
      hayErrores = true
    }

    // Actualizar errores
    setErrores(nuevosErrores)

    return !hayErrores
  }, [formulario])

  // Función para permitir solo números
  const soloNumeros = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "")
  }, [])

  // Función para permitir solo letras
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
        // Preparar datos base
        const userData = {
          nombre: formulario.nombre.trim(),
          apellido: formulario.apellido.trim(),
          tipo_documento: formulario.tipo_documento,
          documento: formulario.documento.trim(),
          direccion: formulario.direccion.trim(),
          correo: formulario.correo.trim(),
          telefono: formulario.telefono.trim(),
          rol_id: Number.parseInt(formulario.rol_id),
          estado: formulario.estado,
          password: formulario.password,
        }

        // Agregar campos específicos según el rol
        if (Number.parseInt(formulario.rol_id) === 3) {
          // Mecánico - agregar teléfono de emergencia
          userData.telefono_emergencia = formulario.telefono.trim() // Usar el mismo teléfono como emergencia por defecto
        }

        await makeRequest("/usuarios", {
          method: "POST",
          body: JSON.stringify(userData),
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Usuario creado correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate(-1)
      } catch (error) {
        console.error("Error al crear usuario:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo crear el usuario",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formulario, validarFormulario, makeRequest, navigate],
  )

  const handleCancel = useCallback(async () => {
    const hasData = Object.values(formulario).some(
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
        navigate(-1)
      }
    } else {
      navigate(-1)
    }
  }, [formulario, navigate])

  return (
    <div className="crearUsuario-container">
      <div className="editarUsuario-header">
        <div className="editarUsuario-header-left">
          <button className="editarUsuario-btn-back" onClick={() => navigate(-1)} type="button">
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarUsuario-title-section">
            <h1 className="crearUsuario-page-title">
              <FaUser className="crearUsuario-title-icon" />
              Crear Usuario
            </h1>
            <p className="crearUsuario-subtitle">Registra un nuevo usuario en el sistema</p>
          </div>
        </div>
      </div>

      <form className="crearUsuario-form" onSubmit={handleSubmit}>
        <div className="crearUsuario-form-section">
          <h3 className="crearUsuario-section-title">
            <FaUser className="crearUsuario-section-icon" />
            Información Personal
          </h3>
          <div className="crearUsuario-form-grid">
            <div className="crearUsuario-form-group">
              <label htmlFor="nombre" className="crearUsuario-label">
                <FaUser className="crearUsuario-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={30}
                autoComplete="off"
                className={`crearUsuario-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="crearUsuario-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="crearUsuario-form-group">
              <label htmlFor="apellido" className="crearUsuario-label">
                <FaUser className="crearUsuario-label-icon" />
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formulario.apellido}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={35}
                autoComplete="off"
                className={`crearUsuario-form-input ${errores.apellido ? "error" : ""}`}
                required
              />
              {errores.apellido && (
                <span className="crearUsuario-error-text">
                  <FaExclamationTriangle /> {errores.apellido}
                </span>
              )}
            </div>

            <div className="crearUsuario-form-group">
              <label htmlFor="tipo_documento" className="crearUsuario-label">
                <FaIdCard className="crearUsuario-label-icon" />
                Tipo Documento *
              </label>
              <select
                id="tipo_documento"
                name="tipo_documento"
                value={formulario.tipo_documento}
                onChange={handleChange}
                className={`crearUsuario-form-input ${errores.tipo_documento ? "error" : ""}`}
                required
              >
                <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                <option value="Tarjeta de identidad">Tarjeta de identidad</option>
                <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Otro">Otro</option>
              </select>
              {errores.tipo_documento && (
                <span className="crearUsuario-error-text">
                  <FaExclamationTriangle /> {errores.tipo_documento}
                </span>
              )}
            </div>

            <div className="crearUsuario-form-group">
              <label htmlFor="documento" className="crearUsuario-label">
                <FaIdCard className="crearUsuario-label-icon" />
                Documento *
              </label>
              <input
                type="text"
                id="documento"
                name="documento"
                value={formulario.documento}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={15}
                autoComplete="off"
                className={`crearUsuario-form-input ${errores.documento ? "error" : ""}`}
                required
              />
              {errores.documento && (
                <span className="crearUsuario-error-text">
                  <FaExclamationTriangle /> {errores.documento}
                </span>
              )}
            </div>

            <div className="crearUsuario-form-group">
              <label htmlFor="correo" className="crearUsuario-label">
                <FaEnvelope className="crearUsuario-label-icon" />
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formulario.correo}
                onChange={handleChange}
                maxLength={254}
                autoComplete="off"
                className={`crearUsuario-form-input ${errores.correo ? "error" : ""}`}
                required
              />
              {errores.correo && (
                <span className="crearUsuario-error-text">
                  <FaExclamationTriangle /> {errores.correo}
                </span>
              )}
            </div>

            <div className="crearUsuario-form-group">
              <label htmlFor="telefono" className="crearUsuario-label">
                <FaPhone className="crearUsuario-label-icon" />
                Teléfono *
              </label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={formulario.telefono}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={15}
                autoComplete="off"
                className={`crearUsuario-form-input ${errores.telefono ? "error" : ""}`}
                required
              />
              {errores.telefono && (
                <span className="crearUsuario-error-text">
                  <FaExclamationTriangle /> {errores.telefono}
                </span>
              )}
            </div>

            {/* Teléfono de Emergencia - Solo para mecánicos */}
            {Number.parseInt(formulario.rol_id) === 3 && (
              <div className="crearUsuario-form-group">
                <label htmlFor="telefono_emergencia" className="crearUsuario-label">
                  <FaPhone className="crearUsuario-label-icon" />
                  Teléfono de Emergencia *
                </label>
                <input
                  type="text"
                  id="telefono_emergencia"
                  name="telefono_emergencia"
                  value={formulario.telefono_emergencia || ""}
                  onChange={handleChange}
                  onInput={soloNumeros}
                  maxLength={15}
                  autoComplete="off"
                  className={`crearUsuario-form-input ${errores.telefono_emergencia ? "error" : ""}`}
                  required
                />
                {errores.telefono_emergencia && (
                  <span className="crearUsuario-error-text">
                    <FaExclamationTriangle /> {errores.telefono_emergencia}
                  </span>
                )}
              </div>
            )}

            <div className="crearUsuario-form-group">
              <label htmlFor="direccion" className="crearUsuario-label">
                <FaMapMarkerAlt className="crearUsuario-label-icon" />
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
                className={`crearUsuario-form-input ${errores.direccion ? "error" : ""}`}
                required
              />
              {errores.direccion && (
                <span className="crearUsuario-error-text">
                  <FaExclamationTriangle /> {errores.direccion}
                </span>
              )}
            </div>

            <div className="crearUsuario-form-group">
              <label htmlFor="rol_id" className="crearUsuario-label">
                <FaUserTag className="crearUsuario-label-icon" />
                Rol *
              </label>
              <select
                id="rol_id"
                name="rol_id"
                value={formulario.rol_id}
                onChange={handleChange}
                className={`crearUsuario-form-input ${errores.rol_id ? "error" : ""}`}
                required
              >
                <option value="">Seleccione un rol...</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
              {errores.rol_id && (
                <span className="crearUsuario-error-text">
                  <FaExclamationTriangle /> {errores.rol_id}
                </span>
              )}
            </div>
            <div className="crearUsuario-form-group" style={{ display:"none"}}>
              <label htmlFor="estado" className="crearUsuario-label">
                <FaUserTag className="crearUsuario-label-icon" />
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={formulario.estado}
                onChange={handleChange}
                className="crearUsuario-form-input"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="crearUsuario-form-section">
          <h3 className="crearUsuario-section-title">
            <FaUser className="crearUsuario-section-icon" />
            Configuración de Cuenta
          </h3>
          <div className="crearUsuario-form-grid">
            <div className="crearUsuario-form-group">
              <label htmlFor="password" className="crearUsuario-label">
                <FaUser className="crearUsuario-label-icon" />
                Contraseña *
              </label>
              <div className="crearUsuario-password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formulario.password}
                  onChange={handleChange}
                  maxLength={30}
                  autoComplete="new-password"
                  className={`crearUsuario-form-input ${errores.password ? "error" : ""}`}
                  required
                />
                <button
                  type="button"
                  className="crearUsuario-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errores.password && (
                <span className="crearUsuario-error-text">
                  <FaExclamationTriangle /> {errores.password}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="crearUsuario-form-actions">
          <button type="button" className="crearUsuario-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="crearUsuario-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearUsuario-submit-button" disabled={isSubmitting || apiLoading || documentoDuplicado}>
            {isSubmitting ? (
              <>
                <FaSpinner className="crearUsuario-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="crearUsuario-button-icon" />
                Guardar Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CrearUsuario

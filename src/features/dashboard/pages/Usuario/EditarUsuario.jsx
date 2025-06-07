"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserTag,
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

const EditarUsuario = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [usuario, setUsuario] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "",
    documento: "",
    correo: "",
    telefono: "",
    direccion: "",
    estado: "",
    rol_id: "",
  })

  const [roles, setRoles] = useState([])
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)

        // Cargar usuario y roles en paralelo
        const [usuarioData, rolesData] = await Promise.all([makeRequest(`/usuarios/${id}`), makeRequest("/roles")])

        if (usuarioData) {
          setUsuario({
            nombre: usuarioData.nombre || "",
            apellido: usuarioData.apellido || "",
            tipo_documento: usuarioData.tipo_documento || "",
            documento: usuarioData.documento || "",
            correo: usuarioData.correo || "",
            telefono: usuarioData.telefono || "",
            direccion: usuarioData.direccion || "",
            estado: usuarioData.estado || "",
            rol_id: usuarioData.rol_id || "",
          })
        }

        if (rolesData) {
          setRoles(rolesData)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        Swal.fire("Error", "No se pudieron cargar los datos del usuario", "error")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      cargarDatos()
    }
  }, [id, makeRequest])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setUsuario((prev) => ({ ...prev, [name]: value }))
    validarCampo(name, value)
  }, [])

  const validarCampo = useCallback((name, value) => {
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
    }

    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
  }, [])

  const validarFormulario = useCallback(() => {
    const nuevosErrores = {}

    // Validar todos los campos
    Object.keys(usuario).forEach((key) => {
      validarCampo(key, usuario[key])
    })

    return Object.keys(errores).every((key) => !errores[key])
  }, [usuario, errores, validarCampo])

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
        await makeRequest(`/usuarios/${id}`, {
          method: "PUT",
          body: JSON.stringify(usuario),
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Usuario actualizado correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/listarUsuarios")
      } catch (error) {
        console.error("Error al actualizar usuario:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo actualizar el usuario",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [usuario, validarFormulario, makeRequest, id, navigate],
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
      navigate("/listarUsuarios")
    }
  }, [navigate])

  if (cargando) {
    return (
      <div className="editarUsuario-container">
        <div className="editarUsuario-loading">
          <div className="editarUsuario-spinner"></div>
          <p>Cargando datos del usuario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editarUsuario-container">
      <div className="editarUsuario-header">
        <div className="editarUsuario-header-left">
          <button className="editarUsuario-btn-back" onClick={() => navigate("/listarUsuarios")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarUsuario-title-section">
            <h1 className="editarUsuario-page-title">
              <FaUser className="editarUsuario-title-icon" />
              Editar Usuario
            </h1>
            <p className="editarUsuario-subtitle">Modifica la información del usuario</p>
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
                value={usuario.nombre}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={30}
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
                value={usuario.apellido}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={35}
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
                value={usuario.tipo_documento}
                onChange={handleChange}
                className={`editarUsuario-form-input ${errores.tipo_documento ? "error" : ""}`}
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="Cedula de Ciudadania">Cédula de Ciudadanía</option>
                <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
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
                value={usuario.documento}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={15}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.documento ? "error" : ""}`}
                required
              />
              {errores.documento && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.documento}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="correo" className="editarUsuario-label">
                <FaEnvelope className="editarUsuario-label-icon" />
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={usuario.correo}
                onChange={handleChange}
                maxLength={254}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.correo ? "error" : ""}`}
                required
              />
              {errores.correo && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.correo}
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
                value={usuario.telefono}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={15}
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
              <label htmlFor="direccion" className="editarUsuario-label">
                <FaMapMarkerAlt className="editarUsuario-label-icon" />
                Dirección *
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={usuario.direccion}
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
              <label htmlFor="estado" className="editarUsuario-label">
                <FaUserTag className="editarUsuario-label-icon" />
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={usuario.estado}
                onChange={handleChange}
                className={`editarUsuario-form-input ${errores.estado ? "error" : ""}`}
                required
              >
                <option value="">Seleccionar estado</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errores.estado && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.estado}
                </span>
              )}
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

export default EditarUsuario

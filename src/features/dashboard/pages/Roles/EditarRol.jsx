"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FaUserShield,
  FaIdCard,
  FaLock,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Roles/EditarRol.css"

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

const EditarRol = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [rol, setRol] = useState({
    nombre: "",
    descripcion: "",
    estado: "",
  })

  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado oculto para los nombres de roles existentes
  const rolesNombresRef = useRef([])

  // Al montar, carga los nombres de los roles una sola vez
  useEffect(() => {
    ;(async () => {
      try {
        const roles = await makeRequest("/roles")
        if (roles && Array.isArray(roles)) {
          // Excluye el nombre del rol actual para permitir editar sin error
          rolesNombresRef.current = roles
            .filter((r) => String(r.id) !== String(id))
            .map((r) => r.nombre.toLowerCase().trim())
        }
      } catch {
        // Silencioso, no mostrar nada
      }
    })()
  }, [makeRequest, id])

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)
        const rolData = await makeRequest(`/roles/${id}`)
        if (rolData) {
          setRol({
            nombre: rolData.nombre || "",
            descripcion: rolData.descripcion || "",
            estado: rolData.estado || "",
          })
        }
      } catch (error) {
        Swal.fire("Error", "No se pudieron cargar los datos del rol", "error")
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
    setRol((prev) => ({ ...prev, [name]: value }))
    validarCampo(name, value)
  }, [])

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
        } else if (rolesNombresRef.current.includes(value.trim().toLowerCase())) {
          nuevoError = "Ya existe un rol con este nombre. Por favor elige otro nombre."
        }
        break
      case "descripcion":
        if (!value.trim()) {
          nuevoError = "La descripción es obligatoria."
        } else if (value.trim().length < 10) {
          nuevoError = "La descripción debe tener al menos 10 caracteres."
        } else if (value.trim().length > 80) {
          nuevoError = "La descripción no puede exceder 80 caracteres."
        }
        break
    }
    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
  }, [])

  // Validación en tiempo real solo para nombre
  const handleNombreChange = useCallback(
    (e) => {
      const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
      setRol((prev) => ({ ...prev, nombre: value }))
      validarCampo("nombre", value)
    },
    [validarCampo],
  )

  const validarFormulario = useCallback(() => {
    const nuevosErrores = {}
    validarCampo("nombre", rol.nombre)
    validarCampo("descripcion", rol.descripcion)
    setErrores((prev) => ({ ...prev, ...nuevosErrores }))
    return Object.values(errores).every((error) => !error)
  }, [rol, errores, validarCampo])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!validarFormulario()) {
        await Swal.fire({
          icon: "warning",
          title: "Campos inválidos",
          text: "Por favor corrige los errores antes de continuar.",
          confirmButtonColor: "#7c3aed",
        })
        return
      }
      setIsSubmitting(true)
      try {
        const rolData = {
          nombre: rol.nombre.trim(),
          descripcion: rol.descripcion.trim(),
          estado: rol.estado,
        }
        await makeRequest(`/roles/${id}`, {
          method: "PUT",
          body: JSON.stringify(rolData),
        })
        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Rol actualizado correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })
        navigate("/ListarRoles")
      } catch (error) {
        console.error("Error al actualizar rol:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo actualizar el rol",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [rol, validarFormulario, makeRequest, id, navigate],
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
      navigate("/ListarRoles")
    }
  }, [navigate])

  if (cargando) {
    return (
      <div className="editarRol-container">
        <div className="editarRol-loading">
          <div className="editarRol-spinner"></div>
          <p>Cargando datos del rol...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editarRol-container">
      <div className="editarRol-header">
        <div className="editarRol-header-left">
          <button className="editarRol-btn-back" onClick={() => navigate("/ListarRoles")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarRol-title-section">
            <h1 className="editarRol-page-title">
              <FaUserShield className="editarRol-title-icon" />
              Editar Rol
            </h1>
            <p className="editarRol-subtitle">Modifica la información del rol</p>
          </div>
        </div>
      </div>

      <form className="editarRol-form" onSubmit={handleSubmit}>
        {/* Información básica */}
        <div className="editarRol-form-section">
          <h3 className="editarRol-section-title">
            <FaIdCard className="editarRol-section-icon" />
            Información Básica
          </h3>

          <div className="editarRol-form-grid">
            <div className="editarRol-form-group">
              <label htmlFor="nombre" className="editarRol-label">
                <FaUserShield className="editarRol-label-icon" />
                Nombre del Rol *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className={`editarRol-form-input ${errores.nombre ? "error" : ""}`}
                placeholder="Ej: Administrador de Ventas"
                value={rol.nombre}
                onChange={handleNombreChange}
                maxLength={50}
                autoComplete="off"
                required
              />
              {errores.nombre && (
                <span className="editarRol-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="editarRol-form-group">
              <label htmlFor="estado" className="editarRol-label">
                <FaLock className="editarRol-label-icon" />
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                className="editarRol-form-input"
                value={rol.estado}
                onChange={handleChange}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className="editarRol-form-group editarRol-form-group-full">
              <label htmlFor="descripcion" className="editarRol-label">
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                className={`editarRol-form-textarea ${errores.descripcion ? "error" : ""}`}
                placeholder="Describe las responsabilidades y alcance de este rol..."
                value={rol.descripcion}
                onChange={handleChange}
                maxLength={80}
                rows={4}
                required
              />
              {errores.descripcion && (
                <span className="editarRol-error-text">
                  <FaExclamationTriangle /> {errores.descripcion}
                </span>
              )}
              <small className="editarRol-char-count">{rol.descripcion.length}/80 caracteres</small>
            </div>
          </div>
        </div>

        {/* Acciones del formulario */}
        <div className="editarRol-form-actions">
          <button type="button" className="editarRol-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="editarRol-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="editarRol-submit-button" disabled={isSubmitting || apiLoading}>
            {isSubmitting ? (
              <>
                <FaSpinner className="editarRol-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="editarRol-button-icon" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarRol

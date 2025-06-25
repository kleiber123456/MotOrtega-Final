"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaUser,
  FaBuilding,
  FaPhone,
  FaIdCard,
  FaMapMarkerAlt,
  FaEnvelope,
  FaUserTag,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaArrowLeft, // <-- Agrega este icono
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Proveedores/CrearProveedor.css"

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

const CrearProveedor = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    nombre_empresa: "",
    telefono_empresa: "",
    nit: "",
    direccion: "",
    correo: "",
    estado: "Activo",
  })

  const [errores, setErrores] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const soloNumeros = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "")
  }, [])

  const soloLetras = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "")
  }, [])

  const validarCampo = useCallback((name, value) => {
    let nuevoError = ""

    switch (name) {
      case "nombre":
        if (!value.trim()) {
          nuevoError = "El nombre es obligatorio."
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          nuevoError = "El nombre solo debe contener letras."
        }
        break
      case "telefono":
        if (!value.trim()) {
          nuevoError = "El teléfono es obligatorio."
        } else if (!/^\d+$/.test(value)) {
          nuevoError = "El teléfono solo debe contener números."
        }
        break
      case "nombre_empresa":
        if (!value.trim()) {
          nuevoError = "El nombre de la empresa es obligatorio."
        }
        break
      case "telefono_empresa":
        if (!value.trim()) {
          nuevoError = "El teléfono de la empresa es obligatorio."
        } else if (!/^\d+$/.test(value)) {
          nuevoError = "El teléfono de la empresa solo debe contener números."
        }
        break
      case "nit":
        if (!value.trim()) {
          nuevoError = "El NIT es obligatorio."
        } else if (!/^\d+$/.test(value)) {
          nuevoError = "El NIT solo debe contener números."
        }
        break
      case "direccion":
        if (!value.trim()) {
          nuevoError = "La dirección es obligatoria."
        }
        break
      case "correo":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          nuevoError = "El correo electrónico no es válido."
        }
        break
      case "estado":
        if (!["Activo", "Inactivo"].includes(value)) {
          nuevoError = "Estado inválido."
        }
        break
    }

    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
  }, [])

  const validarFormulario = useCallback(() => {
    const nuevosErrores = {}

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio."
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre)) {
      nuevosErrores.nombre = "El nombre solo debe contener letras."
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio."
    } else if (!/^\d+$/.test(formData.telefono)) {
      nuevosErrores.telefono = "El teléfono solo debe contener números."
    }

    if (!formData.nombre_empresa.trim()) {
      nuevosErrores.nombre_empresa = "El nombre de la empresa es obligatorio."
    }

    if (!formData.telefono_empresa.trim()) {
      nuevosErrores.telefono_empresa = "El teléfono de la empresa es obligatorio."
    } else if (!/^\d+$/.test(formData.telefono_empresa)) {
      nuevosErrores.telefono_empresa = "El teléfono de la empresa solo debe contener números."
    }

    if (!formData.nit.trim()) {
      nuevosErrores.nit = "El NIT es obligatorio."
    } else if (!/^\d+$/.test(formData.nit)) {
      nuevosErrores.nit = "El NIT solo debe contener números."
    }

    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es obligatoria."
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      nuevosErrores.correo = "El correo electrónico no es válido."
    }

    if (!["Activo", "Inactivo"].includes(formData.estado)) {
      nuevosErrores.estado = "Estado inválido."
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [formData])

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target
      // Elimina espacios al inicio para todos los campos
      const cleanValue = typeof value === "string" ? value.replace(/^\s+/, "") : value
      setFormData((prev) => ({ ...prev, [name]: cleanValue }))
      validarCampo(name, cleanValue)
    },
    [validarCampo],
  )

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
        const token = getValidToken()
        if (!token) {
          throw new Error("No autorizado: Token de autenticación no encontrado.")
        }

        // Verificar duplicados
        const checkResponse = await fetch(`${API_BASE_URL}/proveedores`, {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!checkResponse.ok) {
          const errorData = await checkResponse.json()
          throw new Error(errorData.message || "Error al verificar duplicados.")
        }

        const proveedores = await checkResponse.json()
        const proveedorDuplicado = proveedores.find((p) => p.nit === formData.nit)

        if (proveedorDuplicado) {
          await Swal.fire({
            icon: "warning",
            title: "Duplicado detectado",
            text: "Ya existe un proveedor con el mismo NIT.",
            confirmButtonColor: "#f59e0b",
          })
          return
        }

        // Crear proveedor
        const response = await fetch(`${API_BASE_URL}/proveedores`, {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Error al crear proveedor.")
        }

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Proveedor creado exitosamente.",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate(-1)
      } catch (error) {
        console.error("Error al crear proveedor:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo crear el proveedor.",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validarFormulario, navigate],
  )

  const handleCancel = useCallback(async () => {
    const hasData = Object.values(formData).some((value) => value !== "" && value !== "Activo")

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
  }, [formData, navigate])

  return (
    <div className="crearProveedor-container">
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
            <h1 className="crearProveedor-page-title">
              <FaBuilding className="crearProveedor-title-icon" />
              Crear Proveedor
            </h1>
            <p className="crearProveedor-subtitle">Registra un nuevo proveedor en el sistema</p>
          </div>
        </div>
      </div>

      <form className="crearProveedor-form" onSubmit={handleSubmit}>
        <div className="crearProveedor-form-section">
          <h3 className="crearProveedor-section-title">
            <FaUser className="crearProveedor-section-icon" />
            Información Personal
          </h3>
          <div className="crearProveedor-form-grid">
            <div className="crearProveedor-form-group">
              <label htmlFor="nombre" className="crearProveedor-label">
                <FaUser className="crearProveedor-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={50}
                autoComplete="off"
                className={`crearProveedor-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="crearProveedor-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="crearProveedor-form-group">
              <label htmlFor="telefono" className="crearProveedor-label">
                <FaPhone className="crearProveedor-label-icon" />
                Teléfono *
              </label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={15}
                autoComplete="off"
                className={`crearProveedor-form-input ${errores.telefono ? "error" : ""}`}
                required
              />
              {errores.telefono && (
                <span className="crearProveedor-error-text">
                  <FaExclamationTriangle /> {errores.telefono}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="crearProveedor-form-section">
          <h3 className="crearProveedor-section-title">
            <FaBuilding className="crearProveedor-section-icon" />
            Información de la Empresa
          </h3>
          <div className="crearProveedor-form-grid">
            <div className="crearProveedor-form-group">
              <label htmlFor="nombre_empresa" className="crearProveedor-label">
                <FaBuilding className="crearProveedor-label-icon" />
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                id="nombre_empresa"
                name="nombre_empresa"
                value={formData.nombre_empresa}
                onChange={handleChange}
                maxLength={45}
                autoComplete="off"
                className={`crearProveedor-form-input ${errores.nombre_empresa ? "error" : ""}`}
                required
              />
              {errores.nombre_empresa && (
                <span className="crearProveedor-error-text">
                  <FaExclamationTriangle /> {errores.nombre_empresa}
                </span>
              )}
            </div>

            <div className="crearProveedor-form-group">
              <label htmlFor="telefono_empresa" className="crearProveedor-label">
                <FaPhone className="crearProveedor-label-icon" />
                Teléfono Empresa *
              </label>
              <input
                type="text"
                id="telefono_empresa"
                name="telefono_empresa"
                value={formData.telefono_empresa}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={45}
                autoComplete="off"
                className={`crearProveedor-form-input ${errores.telefono_empresa ? "error" : ""}`}
                required
              />
              {errores.telefono_empresa && (
                <span className="crearProveedor-error-text">
                  <FaExclamationTriangle /> {errores.telefono_empresa}
                </span>
              )}
            </div>

            <div className="crearProveedor-form-group">
              <label htmlFor="nit" className="crearProveedor-label">
                <FaIdCard className="crearProveedor-label-icon" />
                NIT *
              </label>
              <input
                type="text"
                id="nit"
                name="nit"
                value={formData.nit}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={15}
                autoComplete="off"
                className={`crearProveedor-form-input ${errores.nit ? "error" : ""}`}
                required
              />
              {errores.nit && (
                <span className="crearProveedor-error-text">
                  <FaExclamationTriangle /> {errores.nit}
                </span>
              )}
            </div>

            <div className="crearProveedor-form-group">
              <label htmlFor="direccion" className="crearProveedor-label">
                <FaMapMarkerAlt className="crearProveedor-label-icon" />
                Dirección *
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                maxLength={45}
                autoComplete="off"
                className={`crearProveedor-form-input ${errores.direccion ? "error" : ""}`}
                required
              />
              {errores.direccion && (
                <span className="crearProveedor-error-text">
                  <FaExclamationTriangle /> {errores.direccion}
                </span>
              )}
            </div>

            <div className="crearProveedor-form-group">
              <label htmlFor="correo" className="crearProveedor-label">
                <FaEnvelope className="crearProveedor-label-icon" />
                Correo
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                maxLength={45}
                autoComplete="off"
                className={`crearProveedor-form-input ${errores.correo ? "error" : ""}`}
              />
              {errores.correo && (
                <span className="crearProveedor-error-text">
                  <FaExclamationTriangle /> {errores.correo}
                </span>
              )}
            </div>

            <div className="crearProveedor-form-group">
              <label htmlFor="estado" className="crearProveedor-label">
                <FaUserTag className="crearProveedor-label-icon" />
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className={`crearProveedor-form-input ${errores.estado ? "error" : ""}`}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errores.estado && (
                <span className="crearProveedor-error-text">
                  <FaExclamationTriangle /> {errores.estado}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="crearProveedor-form-actions">
          <button type="button" className="crearProveedor-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="crearProveedor-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearProveedor-submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FaSpinner className="crearProveedor-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="crearProveedor-button-icon" />
                Guardar Proveedor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CrearProveedor

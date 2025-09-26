"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
  FaArrowLeft,
} from "react-icons/fa"

import Swal from "sweetalert2"
import "../../../../shared/styles/Proveedores/EditarProveedor.css"
import { validateField, commonValidationRules } from "../../../../shared/utils/validationUtils"

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

// Hook personalizado para manejo de API (igual que en EditarUsuario)
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

const EditarProveedor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [proveedor, setProveedor] = useState({
    nombre: "",
    telefono: "",
    nombre_empresa: "",
    telefono_empresa: "",
    nit: "",
    direccion: "",
    correo: "",
    estado: "activo",
  })

  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)

        const proveedorData = await makeRequest(`/proveedores/${id}`)

        if (proveedorData) {
          setProveedor({
            nombre: proveedorData.nombre || "",
            telefono: proveedorData.telefono || "",
            nombre_empresa: proveedorData.nombre_empresa || "",
            telefono_empresa: proveedorData.telefono_empresa || "",
            nit: proveedorData.nit || "",
            direccion: proveedorData.direccion || "",
            correo: proveedorData.correo || "",
            estado: proveedorData.estado || "activo",
          })
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        Swal.fire("Error", "No se pudieron cargar los datos del proveedor", "error")
        navigate("/ListarProveedores")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      cargarDatos()
    }
  }, [id, makeRequest, navigate])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    if (name !== "nit") {
      // El NIT no se puede editar
      setProveedor((prev) => ({ ...prev, [name]: value }))
      validarCampo(name, value)
    }
  }, [])

  const validarCampo = useCallback((name, value) => {
    let rules = {}
    switch (name) {
      case "nombre":
        rules = { required: true, onlyLetters: true, minLength: 2, maxLength: 50, fieldName: "Nombre" }
        break
      case "telefono":
        rules = { required: true, onlyNumbers: true, minLength: 7, maxLength: 15, fieldName: "Teléfono" }
        break
      case "nombre_empresa":
        rules = { required: true, minLength: 2, maxLength: 50, fieldName: "Nombre de la empresa" }
        break
      case "telefono_empresa":
        rules = { required: true, onlyNumbers: true, minLength: 7, maxLength: 15, fieldName: "Teléfono de la empresa" }
        break
      case "direccion":
        rules = { required: true, minLength: 5, maxLength: 100, fieldName: "Dirección" }
        break
      case "correo":
        rules = commonValidationRules.email
        break
      default:
        rules = { required: true, fieldName: name }
    }
    const error = validateField(value, rules)
    setErrores((prev) => ({ ...prev, [name]: error }))
  }, [])

  const validarFormulario = useCallback(() => {
    const nuevosErrores = {}

    // Validar todos los campos
    Object.keys(proveedor).forEach((key) => {
      if (key !== "nit") {
        // No validar NIT ya que es solo lectura
        validarCampo(key, proveedor[key])
      }
    })

    return Object.keys(errores).every((key) => !errores[key])
  }, [proveedor, errores, validarCampo])

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
        await makeRequest(`/proveedores/${id}`, {
          method: "PUT",
          body: JSON.stringify(proveedor),
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Proveedor actualizado correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/ListarProveedores")
      } catch (error) {
        console.error("Error al actualizar proveedor:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo actualizar el proveedor",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [proveedor, validarFormulario, makeRequest, id, navigate],
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
      navigate("/ListarProveedores")
    }
  }, [navigate])

  if (cargando) {
    return (
      <div className="editarProveedor-container">
        <div className="editarProveedor-loading">
          <div className="editarProveedor-spinner"></div>
          <p>Cargando datos del proveedor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editarProveedor-container">
      <div className="editarProveedor-header">
        <div className="editarProveedor-header-left">
          <button className="editarProveedor-btn-back" onClick={() => navigate("/ListarProveedores")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarProveedor-title-section">
            <h1 className="editarProveedor-page-title">
              <FaBuilding className="editarProveedor-title-icon" />
              Editar Proveedor
            </h1>
            <p className="editarProveedor-subtitle">Modifica la información del proveedor</p>
          </div>
        </div>
      </div>

      <form className="editarProveedor-form" onSubmit={handleSubmit}>
        <div className="editarProveedor-form-section">
          <h3 className="editarProveedor-section-title">
            <FaUser className="editarProveedor-section-icon" />
            Información Personal
          </h3>
          <div className="editarProveedor-form-grid">
            <div className="editarProveedor-form-group">
              <label htmlFor="nombre" className="editarProveedor-label">
                <FaUser className="editarProveedor-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={proveedor.nombre}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={50}
                autoComplete="off"
                className={`editarProveedor-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="editarProveedor-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="editarProveedor-form-group">
              <label htmlFor="telefono" className="editarProveedor-label">
                <FaPhone className="editarProveedor-label-icon" />
                Teléfono *
              </label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={proveedor.telefono}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={15}
                autoComplete="off"
                className={`editarProveedor-form-input ${errores.telefono ? "error" : ""}`}
                required
              />
              {errores.telefono && (
                <span className="editarProveedor-error-text">
                  <FaExclamationTriangle /> {errores.telefono}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="editarProveedor-form-section">
          <h3 className="editarProveedor-section-title">
            <FaBuilding className="editarProveedor-section-icon" />
            Información de la Empresa
          </h3>
          <div className="editarProveedor-form-grid">
            <div className="editarProveedor-form-group">
              <label htmlFor="nombre_empresa" className="editarProveedor-label">
                <FaBuilding className="editarProveedor-label-icon" />
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                id="nombre_empresa"
                name="nombre_empresa"
                value={proveedor.nombre_empresa}
                onChange={handleChange}
                maxLength={45}
                autoComplete="off"
                className={`editarProveedor-form-input ${errores.nombre_empresa ? "error" : ""}`}
                required
              />
              {errores.nombre_empresa && (
                <span className="editarProveedor-error-text">
                  <FaExclamationTriangle /> {errores.nombre_empresa}
                </span>
              )}
            </div>

            <div className="editarProveedor-form-group">
              <label htmlFor="telefono_empresa" className="editarProveedor-label">
                <FaPhone className="editarProveedor-label-icon" />
                Teléfono Empresa *
              </label>
              <input
                type="text"
                id="telefono_empresa"
                name="telefono_empresa"
                value={proveedor.telefono_empresa}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={45}
                autoComplete="off"
                className={`editarProveedor-form-input ${errores.telefono_empresa ? "error" : ""}`}
                required
              />
              {errores.telefono_empresa && (
                <span className="editarProveedor-error-text">
                  <FaExclamationTriangle /> {errores.telefono_empresa}
                </span>
              )}
            </div>

            <div className="editarProveedor-form-group">
              <label htmlFor="nit" className="editarProveedor-label">
                <FaIdCard className="editarProveedor-label-icon" />
                NIT
              </label>
              <input
                type="text"
                id="nit"
                name="nit"
                value={proveedor.nit}
                readOnly
                maxLength={15}
                autoComplete="off"
                className="editarProveedor-form-input"
                style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
              />
            </div>

            <div className="editarProveedor-form-group">
              <label htmlFor="direccion" className="editarProveedor-label">
                <FaMapMarkerAlt className="editarProveedor-label-icon" />
                Dirección *
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={proveedor.direccion}
                onChange={handleChange}
                maxLength={45}
                autoComplete="off"
                className={`editarProveedor-form-input ${errores.direccion ? "error" : ""}`}
                required
              />
              {errores.direccion && (
                <span className="editarProveedor-error-text">
                  <FaExclamationTriangle /> {errores.direccion}
                </span>
              )}
            </div>

            <div className="editarProveedor-form-group">
              <label htmlFor="correo" className="editarProveedor-label">
                <FaEnvelope className="editarProveedor-label-icon" />
                Correo *
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={proveedor.correo}
                onChange={handleChange}
                maxLength={45}
                autoComplete="off"
                className={`editarProveedor-form-input ${errores.correo ? "error" : ""}`}
                required
              />
              {errores.correo && (
                <span className="editarProveedor-error-text">
                  <FaExclamationTriangle /> {errores.correo}
                </span>
              )}
            </div>

            <div className="editarProveedor-form-group">
              <label htmlFor="estado" className="editarProveedor-label">
                <FaUserTag className="editarProveedor-label-icon" />
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={proveedor.estado}
                onChange={handleChange}
                className={`editarProveedor-form-input ${errores.estado ? "error" : ""}`}
                required
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              {errores.estado && (
                <span className="editarProveedor-error-text">
                  <FaExclamationTriangle /> {errores.estado}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="editarProveedor-form-actions">
          <button
            type="button"
            className="editarProveedor-cancel-button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <FaTimes className="editarProveedor-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="editarProveedor-submit-button" disabled={isSubmitting || apiLoading}>
            {isSubmitting ? (
              <>
                <FaSpinner className="editarProveedor-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="editarProveedor-button-icon" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarProveedor

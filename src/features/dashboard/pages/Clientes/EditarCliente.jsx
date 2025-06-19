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
import "../../../../shared/styles/Clientes/EditarCliente.css"

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

const EditarCliente = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [cliente, setCliente] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "",
    documento: "",
    correo: "",
    telefono: "",
    direccion: "",
    estado: "",
  })

  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)

        const clienteData = await makeRequest(`/clientes/${id}`)

        if (clienteData) {
          setCliente({
            nombre: clienteData.nombre || "",
            apellido: clienteData.apellido || "",
            tipo_documento: clienteData.tipo_documento || "",
            documento: clienteData.documento || "",
            correo: clienteData.correo || "",
            telefono: clienteData.telefono || "",
            direccion: clienteData.direccion || "",
            estado: clienteData.estado || "",
          })
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        Swal.fire("Error", "No se pudieron cargar los datos del cliente", "error")
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
    setCliente((prev) => ({ ...prev, [name]: value }))
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
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          nuevoError = "Ingresa un correo electrónico válido."
        }
        break
      case "telefono":
        if (value && !/^\d+$/.test(value.replace(/\s/g, ""))) {
          nuevoError = "El teléfono solo puede contener números."
        }
        break
    }

    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
  }, [])

  const validarFormulario = useCallback(() => {
    const nuevosErrores = {}

    // Validar todos los campos
    Object.keys(cliente).forEach((key) => {
      validarCampo(key, cliente[key])
    })

    return Object.keys(errores).every((key) => !errores[key])
  }, [cliente, errores, validarCampo])

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
        await makeRequest(`/clientes/${id}`, {
          method: "PUT",
          body: JSON.stringify(cliente),
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Cliente actualizado correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/ListarClientes")
      } catch (error) {
        console.error("Error al actualizar cliente:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo actualizar el cliente",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [cliente, validarFormulario, makeRequest, id, navigate],
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
      navigate("/ListarClientes")
    }
  }, [navigate])

  if (cargando) {
    return (
      <div className="editarCliente-container">
        <div className="editarCliente-loading">
          <div className="editarCliente-spinner"></div>
          <p>Cargando datos del cliente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editarCliente-container">
      <div className="editarCliente-header">
        <div className="editarCliente-header-left">
          <button className="editarCliente-btn-back" onClick={() => navigate("/ListarClientes")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarCliente-title-section">
            <h1 className="editarCliente-page-title">
              <FaUser className="editarCliente-title-icon" />
              Editar Cliente
            </h1>
            <p className="editarCliente-subtitle">Modifica la información del cliente</p>
          </div>
        </div>
      </div>

      <form className="editarCliente-form" onSubmit={handleSubmit}>
        <div className="editarCliente-form-section">
          <h3 className="editarCliente-section-title">
            <FaUser className="editarCliente-section-icon" />
            Información Personal
          </h3>
          <div className="editarCliente-form-grid">
            <div className="editarCliente-form-group">
              <label htmlFor="nombre" className="editarCliente-label">
                <FaUser className="editarCliente-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={cliente.nombre}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={30}
                autoComplete="off"
                className={`editarCliente-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="editarCliente-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="editarCliente-form-group">
              <label htmlFor="apellido" className="editarCliente-label">
                <FaUser className="editarCliente-label-icon" />
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={cliente.apellido}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={35}
                autoComplete="off"
                className={`editarCliente-form-input ${errores.apellido ? "error" : ""}`}
                required
              />
              {errores.apellido && (
                <span className="editarCliente-error-text">
                  <FaExclamationTriangle /> {errores.apellido}
                </span>
              )}
            </div>

            <div className="editarCliente-form-group">
              <label htmlFor="tipo_documento" className="editarCliente-label">
                <FaIdCard className="editarCliente-label-icon" />
                Tipo de Documento *
              </label>
              <select
                id="tipo_documento"
                name="tipo_documento"
                value={cliente.tipo_documento}
                onChange={handleChange}
                className={`editarCliente-form-input ${errores.tipo_documento ? "error" : ""}`}
                required
                disabled
              >
                <option value="">Seleccionar tipo</option>
                <option value="Cédula de ciudadanía">Cédula de Ciudadanía</option>
                <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
              </select>
              {errores.tipo_documento && (
                <span className="editarCliente-error-text">
                  <FaExclamationTriangle /> {errores.tipo_documento}
                </span>
              )}
            </div>

            <div className="editarCliente-form-group">
              <label htmlFor="documento" className="editarCliente-label">
                <FaIdCard className="editarCliente-label-icon" />
                Documento *
              </label>
              <input
                type="text"
                id="documento"
                name="documento"
                value={cliente.documento}
                onChange={handleChange}
                maxLength={15}
                autoComplete="off"
                className={`editarCliente-form-input ${errores.documento ? "error" : ""}`}
                required
                disabled
              />
              {errores.documento && (
                <span className="editarCliente-error-text">
                  <FaExclamationTriangle /> {errores.documento}
                </span>
              )}
            </div>

            <div className="editarCliente-form-group">
              <label htmlFor="correo" className="editarCliente-label">
                <FaEnvelope className="editarCliente-label-icon" />
                Correo Electrónico
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={cliente.correo}
                onChange={handleChange}
                maxLength={254}
                autoComplete="off"
                className={`editarCliente-form-input ${errores.correo ? "error" : ""}`}
              />
              {errores.correo && (
                <span className="editarCliente-error-text">
                  <FaExclamationTriangle /> {errores.correo}
                </span>
              )}
            </div>

            <div className="editarCliente-form-group">
              <label htmlFor="telefono" className="editarCliente-label">
                <FaPhone className="editarCliente-label-icon" />
                Teléfono
              </label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={cliente.telefono}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={15}
                autoComplete="off"
                className={`editarCliente-form-input ${errores.telefono ? "error" : ""}`}
              />
              {errores.telefono && (
                <span className="editarCliente-error-text">
                  <FaExclamationTriangle /> {errores.telefono}
                </span>
              )}
            </div>

            <div className="editarCliente-form-group">
              <label htmlFor="direccion" className="editarCliente-label">
                <FaMapMarkerAlt className="editarCliente-label-icon" />
                Dirección *
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={cliente.direccion}
                onChange={handleChange}
                maxLength={100}
                autoComplete="off"
                className={`editarCliente-form-input ${errores.direccion ? "error" : ""}`}
                required
              />
              {errores.direccion && (
                <span className="editarCliente-error-text">
                  <FaExclamationTriangle /> {errores.direccion}
                </span>
              )}
            </div>

            <div className="editarCliente-form-group">
              <label htmlFor="estado" className="editarCliente-label">
                <FaUserTag className="editarCliente-label-icon" />
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={cliente.estado}
                onChange={handleChange}
                className={`editarCliente-form-input ${errores.estado ? "error" : ""}`}
                required
              >
                <option value="">Seleccionar estado</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errores.estado && (
                <span className="editarCliente-error-text">
                  <FaExclamationTriangle /> {errores.estado}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="editarCliente-form-actions">
          <button type="button" className="editarCliente-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="editarCliente-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="editarCliente-submit-button" disabled={isSubmitting || apiLoading}>
            {isSubmitting ? (
              <>
                <FaSpinner className="editarCliente-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="editarCliente-button-icon" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarCliente

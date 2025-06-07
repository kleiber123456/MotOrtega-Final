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

const EditarProveedor = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formulario, setFormulario] = useState({
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
  const [cargando, setCargando] = useState(true)
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
      case "direccion":
        if (!value.trim()) {
          nuevoError = "La dirección es obligatoria."
        }
        break
      case "correo":
        if (!value.trim()) {
          nuevoError = "El correo es obligatorio."
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          nuevoError = "El correo no es válido."
        }
        break
      case "estado":
        if (!["Activo", "Inactivo"].includes(value)) {
          nuevoError = "Estado inválido."
        }
        break
    }

    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
    return nuevoError === ""
  }, [])

  const validarFormulario = useCallback(() => {
    let esValido = true

    if (!validarCampo("nombre", formulario.nombre)) esValido = false
    if (!validarCampo("telefono", formulario.telefono)) esValido = false
    if (!validarCampo("nombre_empresa", formulario.nombre_empresa)) esValido = false
    if (!validarCampo("telefono_empresa", formulario.telefono_empresa)) esValido = false
    if (!validarCampo("direccion", formulario.direccion)) esValido = false
    if (!validarCampo("correo", formulario.correo)) esValido = false
    if (!validarCampo("estado", formulario.estado)) esValido = false

    return esValido
  }, [formulario, validarCampo])

  useEffect(() => {
    const obtenerProveedor = async () => {
      try {
        setCargando(true)
        const token = getValidToken()
        if (!token) {
          Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
          navigate("/login")
          return
        }

        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Error al cargar los datos del proveedor")
        }

        const data = await response.json()
        setFormulario({
          ...data,
          estado: data.estado.charAt(0).toUpperCase() + data.estado.slice(1),
        })
      } catch (error) {
        console.error("Error al obtener proveedor:", error)
        Swal.fire("Error", "Error al cargar los datos del proveedor.", "error")
        navigate("/ListarProveedores")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      obtenerProveedor()
    }
  }, [id, navigate])

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target
      if (name !== "nit") {
        setFormulario((prev) => ({ ...prev, [name]: value }))
        validarCampo(name, value)
      }
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
          Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
          navigate("/login")
          return
        }

        const estadoParaAPI = formulario.estado.toLowerCase()

        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formulario, estado: estadoParaAPI }),
        })

        if (!response.ok) {
          throw new Error("Error al actualizar el proveedor")
        }

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Proveedor actualizado exitosamente.",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/ListarProveedores")
      } catch (error) {
        console.error("Error al actualizar proveedor:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el proveedor.",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formulario, validarFormulario, id, navigate],
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
                value={formulario.nombre}
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
                value={formulario.telefono}
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
                value={formulario.nombre_empresa}
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
                value={formulario.telefono_empresa}
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
                value={formulario.nit}
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
                value={formulario.direccion}
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
                value={formulario.correo}
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
                value={formulario.estado}
                onChange={handleChange}
                className={`editarProveedor-form-input ${errores.estado ? "error" : ""}`}
                required
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
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
          <button type="submit" className="editarProveedor-submit-button" disabled={isSubmitting}>
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

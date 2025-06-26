"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa"
import "../../../../shared/styles/Usuarios/CrearUsuarios.css"

const Perfil = () => {
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "",
    documento: "",
    direccion: "",
    correo: "",
    password: "",
    telefono: "",
  })

  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState("")
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const tiposDocumento = ["Cédula de ciudadanía", "Tarjeta de identidad", "Cédula de Extranjería", "Pasaporte", "Otro"]

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const res = await axios.get("https://api-final-8rw7.onrender.com/api/usuarios/mi-perfil", {
          headers: { Authorization: `${token}` },
        })
        setPerfil(res.data)
      } catch (err) {
        console.error("Error al obtener perfil:", err.response?.data || err.message)
      } finally {
        setLoading(false)
      }
    }

    obtenerPerfil()
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setPerfil({ ...perfil, [name]: value })
    validarCampo(name, value)
  }

  const validarCampo = (name, value) => {
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
      case "telefono":
        if (!value.trim()) {
          nuevoError = "El teléfono es obligatorio."
        } else if (value.trim().length < 10) {
          nuevoError = "El teléfono debe tener al menos 10 números."
        }
        break
      case "direccion":
        if (!value.trim()) {
          nuevoError = "La dirección es obligatoria."
        } else if (value.trim().length < 5) {
          nuevoError = "La dirección debe tener al menos 5 caracteres."
        }
        break
    }

    setErrores((prevErrores) => ({
      ...prevErrores,
      [name]: nuevoError,
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    let hayErrores = false

    if (!perfil.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio."
      hayErrores = true
    } else if (perfil.nombre.trim().length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres."
      hayErrores = true
    }

    if (!perfil.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio."
      hayErrores = true
    } else if (perfil.apellido.trim().length < 3) {
      nuevosErrores.apellido = "El apellido debe tener al menos 3 caracteres."
      hayErrores = true
    }

    if (!perfil.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio."
      hayErrores = true
    } else if (perfil.telefono.trim().length < 10) {
      nuevosErrores.telefono = "El teléfono debe tener al menos 10 números."
      hayErrores = true
    }

    if (!perfil.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es obligatoria."
      hayErrores = true
    } else if (perfil.direccion.trim().length < 5) {
      nuevosErrores.direccion = "La dirección debe tener al menos 5 caracteres."
      hayErrores = true
    }

    setErrores(nuevosErrores)
    return !hayErrores
  }

  const soloNumeros = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "")
  }

  const soloLetras = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "")
  }

  const actualizarPerfil = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      Swal.fire({
        icon: "warning",
        title: "Campos inválidos",
        text: "Por favor corrige los errores antes de continuar.",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await axios.put("https://api-final-8rw7.onrender.com/api/usuarios/mi-perfil", perfil, {
        headers: { Authorization: `${token}` },
      })

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Perfil actualizado correctamente",
        confirmButtonColor: "#10b981",
        timer: 2000,
      })

      setPerfil(res.data)
      navigate("/dashboard")
    } catch (err) {
      const errorMsg =
        err.response?.status === 401
          ? "Token inválido. No se pudo actualizar el perfil."
          : "No se pudo actualizar el perfil"

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCambiarPassword = () => navigate("/CambiarContraseña")

  const handleCancel = async () => {
    const hasData = Object.values(perfil).some(
      (value) => value !== "" && value !== "Cédula de ciudadanía" && value !== "Activo",
    )

    if (hasData) {
      const result = await Swal.fire({
        title: "¿Cancelar actualización?",
        text: "Se perderán todos los cambios realizados",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Continuar editando",
      })

      if (result.isConfirmed) {
        navigate("/dashboard")
      }
    } else {
      navigate("/dashboard")
    }
  }

  if (loading)
    return (
      <div className="listarUsuarios-container">
        <div className="listarUsuarios-loading">
          <div className="listarUsuarios-spinner"></div>
          <p>Cargando información del perfil...</p>
        </div>
      </div>
    )

  return (
    <div className="crearUsuario-container">
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
            <h1 className="crearUsuario-page-title">
              <FaUser className="crearUsuario-title-icon" />
              Mi Perfil
            </h1>
            <p className="crearUsuario-subtitle">Actualiza tu información personal</p>
          </div>
        </div>
      </div>

      <form className="crearUsuario-form" onSubmit={actualizarPerfil}>
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
                value={perfil.nombre || ""}
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
                value={perfil.apellido || ""}
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
                Tipo Documento
              </label>
              <select
                id="tipo_documento"
                name="tipo_documento"
                value={perfil.tipo_documento || ""}
                disabled
                className="crearUsuario-form-input"
              >
                <option value="">Seleccionar</option>
                {tiposDocumento.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="crearUsuario-form-group">
              <label htmlFor="documento" className="crearUsuario-label">
                <FaIdCard className="crearUsuario-label-icon" />
                Documento
              </label>
              <input
                type="text"
                id="documento"
                name="documento"
                value={perfil.documento || ""}
                disabled
                className="crearUsuario-form-input"
              />
            </div>

            <div className="crearUsuario-form-group">
              <label htmlFor="correo" className="crearUsuario-label">
                <FaEnvelope className="crearUsuario-label-icon" />
                Correo Electrónico
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={perfil.correo || ""}
                disabled
                className="crearUsuario-form-input"
              />
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
                value={perfil.telefono || ""}
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

            <div className="crearUsuario-form-group">
              <label htmlFor="direccion" className="crearUsuario-label">
                <FaMapMarkerAlt className="crearUsuario-label-icon" />
                Dirección *
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={perfil.direccion || ""}
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
              <label htmlFor="password" className="crearUsuario-label">
                <FaUser className="crearUsuario-label-icon" />
                Contraseña
              </label>
              <div className="crearUsuario-password-container">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value=".................."
                  readOnly
                  disabled
                  className="crearUsuario-form-input"
                />
                <button type="button" className="crearUsuario-password-toggle" onClick={handleCambiarPassword}>
                  Cambiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="crearUsuario-form-actions">
          <button type="button" className="crearUsuario-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="crearUsuario-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearUsuario-submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FaSpinner className="crearUsuario-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="crearUsuario-button-icon" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Perfil

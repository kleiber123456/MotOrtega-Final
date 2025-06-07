"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaCog,
  FaFileAlt,
  FaDollarSign,
  FaToggleOn,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Servicios/CrearServicios.css"

const CrearServicio = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    estado: "Activo",
  })

  const [errores, setErrores] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const soloNumeros = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^0-9.]/g, "")
  }, [])

  const validarCampo = useCallback((name, value) => {
    let nuevoError = ""

    switch (name) {
      case "nombre":
        if (!value.trim()) {
          nuevoError = "El nombre es obligatorio."
        }
        break
      case "descripcion":
        if (!value.trim()) {
          nuevoError = "La descripción es obligatoria."
        }
        break
      case "precio":
        if (!value.trim()) {
          nuevoError = "El precio es obligatorio."
        } else if (isNaN(value) || Number.parseFloat(value) <= 0) {
          nuevoError = "El precio debe ser un número mayor a 0."
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
    }

    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria."
    }

    if (!formData.precio.trim()) {
      nuevosErrores.precio = "El precio es obligatorio."
    } else if (isNaN(formData.precio) || Number.parseFloat(formData.precio) <= 0) {
      nuevosErrores.precio = "El precio debe ser un número mayor a 0."
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
      setFormData((prev) => ({ ...prev, [name]: value }))
      validarCampo(name, value)
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
        // Verificar duplicados
        const checkResponse = await fetch("https://api-final-8rw7.onrender.com/api/servicios", {
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

        const servicios = await checkResponse.json()

        const servicioDuplicado = servicios.find((s) => s.nombre.toLowerCase() === formData.nombre.toLowerCase())

        if (servicioDuplicado) {
          await Swal.fire({
            icon: "warning",
            title: "Duplicado detectado",
            text: "Ya existe un servicio con el mismo nombre.",
            confirmButtonColor: "#2563eb",
          })
          return
        }

        const response = await fetch("https://api-final-8rw7.onrender.com/api/servicios", {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            precio: Number.parseFloat(formData.precio),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Error al crear servicio.")
        }

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Servicio creado exitosamente.",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/listarServicios")
      } catch (err) {
        console.error("Error en la creación/verificación:", err)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "No se pudo crear el servicio.",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validarFormulario, token, navigate],
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
        navigate("/listarServicios")
      }
    } else {
      navigate("/listarServicios")
    }
  }, [formData, navigate])

  return (
    <div className="crearServicio-container">
      <div className="crearServicio-header">
        <h1 className="crearServicio-page-title">
          <FaCog className="crearServicio-title-icon" />
          Crear Servicio
        </h1>
        <p className="crearServicio-subtitle">Registra un nuevo servicio en el sistema</p>
      </div>

      <form className="crearServicio-form" onSubmit={handleSubmit}>
        <div className="crearServicio-form-section">
          <h3 className="crearServicio-section-title">
            <FaCog className="crearServicio-section-icon" />
            Información del Servicio
          </h3>
          <div className="crearServicio-form-grid">
            <div className="crearServicio-form-group">
              <label htmlFor="nombre" className="crearServicio-label">
                <FaCog className="crearServicio-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                maxLength={45}
                autoComplete="off"
                className={`crearServicio-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="crearServicio-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="crearServicio-form-group">
              <label htmlFor="descripcion" className="crearServicio-label">
                <FaFileAlt className="crearServicio-label-icon" />
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                maxLength={200}
                autoComplete="off"
                className={`crearServicio-form-input ${errores.descripcion ? "error" : ""}`}
                rows={3}
                required
              />
              {errores.descripcion && (
                <span className="crearServicio-error-text">
                  <FaExclamationTriangle /> {errores.descripcion}
                </span>
              )}
            </div>

            <div className="crearServicio-form-group">
              <label htmlFor="precio" className="crearServicio-label">
                <FaDollarSign className="crearServicio-label-icon" />
                Precio *
              </label>
              <input
                type="text"
                id="precio"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                onInput={soloNumeros}
                autoComplete="off"
                className={`crearServicio-form-input ${errores.precio ? "error" : ""}`}
                placeholder="0.00"
                required
              />
              {errores.precio && (
                <span className="crearServicio-error-text">
                  <FaExclamationTriangle /> {errores.precio}
                </span>
              )}
            </div>

            <div className="crearServicio-form-group">
              <label htmlFor="estado" className="crearServicio-label">
                <FaToggleOn className="crearServicio-label-icon" />
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className={`crearServicio-form-input ${errores.estado ? "error" : ""}`}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errores.estado && (
                <span className="crearServicio-error-text">
                  <FaExclamationTriangle /> {errores.estado}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="crearServicio-form-actions">
          <button type="button" className="crearServicio-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="crearServicio-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearServicio-submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FaSpinner className="crearServicio-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="crearServicio-button-icon" />
                Guardar Servicio
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CrearServicio

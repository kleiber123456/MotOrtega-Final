"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FaCog,
  FaFileAlt,
  FaDollarSign,
  FaToggleOn,
  FaArrowLeft,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
} from "react-icons/fa"
import Swal from "sweetalert2"

import "../../../../shared/styles/Servicios/EditarServicios.css"
import { validateField } from "../../../../shared/utils/validationUtils"

const EditarServicio = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    estado: "Activo",
  })

  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const soloNumeros = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^0-9.]/g, "")
  }, [])

  const validarCampo = useCallback((name, value) => {
    let rules = {}
    switch (name) {
      case "nombre":
        rules = { required: true, minLength: 3, maxLength: 50, onlyLetters: true, noLeadingSpaces: true, fieldName: "Nombre" }
        break
      case "descripcion":
        rules = { required: true, minLength: 10, maxLength: 100, noLeadingSpaces: true, fieldName: "Descripción" }
        break
      case "precio":
        rules = { required: true, fieldName: "Precio" }
        break
      case "estado":
        rules = { required: true, fieldName: "Estado" }
        break
      default:
        rules = { required: true, fieldName: name }
    }
    let error = validateField(value, rules)
    // Validación especial para precio
    if (name === "precio" && (isNaN(value) || Number.parseFloat(value) <= 0)) {
      error = "El precio debe ser un número mayor a 0."
    }
    if (name === "estado" && !["Activo", "Inactivo"].includes(value)) {
      error = "Estado inválido."
    }
    setErrores((prev) => ({ ...prev, [name]: error }))
    return error === ""
  }, [])

  const validarFormulario = useCallback(() => {
    let esValido = true

    if (!validarCampo("nombre", formulario.nombre)) esValido = false
    if (!validarCampo("descripcion", formulario.descripcion)) esValido = false
    if (!validarCampo("precio", formulario.precio)) esValido = false
    if (!validarCampo("estado", formulario.estado)) esValido = false

    return esValido
  }, [formulario, validarCampo])

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)

        if (!token) {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "No autorizado: Token no encontrado.",
            confirmButtonColor: "#2563eb",
          })
          navigate("/login")
          return
        }

        const response = await fetch(`https://api-final-8rw7.onrender.com/api/servicios/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Error al cargar servicio")
        }

        const data = await response.json()
        setFormulario({
          ...data,
          precio: data.precio.toString(),
          estado: data.estado.charAt(0).toUpperCase() + data.estado.slice(1),
        })
      } catch (error) {
        console.error("Error al obtener servicio:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al cargar los datos del servicio.",
          confirmButtonColor: "#2563eb",
        })
        navigate("/listarServicios")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      cargarDatos()
    }
  }, [id, navigate, token])

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setFormulario((prev) => ({ ...prev, [name]: value }))
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
        if (!token) {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "No autorizado: Token no encontrado.",
            confirmButtonColor: "#2563eb",
          })
          navigate("/login")
          return
        }

        // Verificar duplicados excluyendo el servicio actual
        const checkResponse = await fetch("https://api-final-8rw7.onrender.com/api/servicios", {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!checkResponse.ok) {
          throw new Error("Error al verificar duplicados")
        }

        const servicios = await checkResponse.json()
        const servicioDuplicado = servicios.find(
          (s) => s.id !== Number.parseInt(id) && s.nombre.toLowerCase() === formulario.nombre.toLowerCase(),
        )

        if (servicioDuplicado) {
          await Swal.fire({
            icon: "warning",
            title: "Duplicado detectado",
            text: "Ya existe otro servicio con el mismo nombre.",
            confirmButtonColor: "#2563eb",
          })
          return
        }

        const estadoParaAPI = formulario.estado.toLowerCase()

        const response = await fetch(`https://api-final-8rw7.onrender.com/api/servicios/${id}`, {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formulario,
            precio: Number.parseFloat(formulario.precio),
            estado: estadoParaAPI,
          }),
        })

        if (!response.ok) {
          throw new Error("Error al actualizar servicio")
        }

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Servicio actualizado exitosamente.",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/listarServicios")
      } catch (error) {
        console.error("Error al actualizar servicio:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo actualizar el servicio.",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formulario, validarFormulario, token, id, navigate],
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
      navigate("/listarServicios")
    }
  }, [navigate])

  if (cargando) {
    return (
      <div className="editarServicio-container">
        <div className="editarServicio-loading">
          <div className="editarServicio-spinner"></div>
          <p>Cargando datos del servicio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editarServicio-container">
      <div className="editarServicio-header">
        <div className="editarServicio-header-left">
          <button className="editarServicio-btn-back" onClick={() => navigate("/listarServicios")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarServicio-title-section">
            <h1 className="editarServicio-page-title">
              <FaCog className="editarServicio-title-icon" />
              Editar Servicio
            </h1>
            <p className="editarServicio-subtitle">Modifica la información del servicio</p>
          </div>
        </div>
      </div>

      <form className="editarServicio-form" onSubmit={handleSubmit}>
        <div className="editarServicio-form-section">
          <h3 className="editarServicio-section-title">
            <FaCog className="editarServicio-section-icon" />
            Información del Servicio
          </h3>
          <div className="editarServicio-form-grid">
            <div className="editarServicio-form-group">
              <label htmlFor="nombre" className="editarServicio-label">
                <FaCog className="editarServicio-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
                maxLength={45}
                autoComplete="off"
                className={`editarServicio-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="editarServicio-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="editarServicio-form-group">
              <label htmlFor="descripcion" className="editarServicio-label">
                <FaFileAlt className="editarServicio-label-icon" />
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formulario.descripcion}
                onChange={handleChange}
                maxLength={200}
                autoComplete="off"
                className={`editarServicio-form-input ${errores.descripcion ? "error" : ""}`}
                rows={3}
                required
              />
              {errores.descripcion && (
                <span className="editarServicio-error-text">
                  <FaExclamationTriangle /> {errores.descripcion}
                </span>
              )}
            </div>

            <div className="editarServicio-form-group">
              <label htmlFor="precio" className="editarServicio-label">
                <FaDollarSign className="editarServicio-label-icon" />
                Precio *
              </label>
              <input
                type="text"
                id="precio"
                name="precio"
                value={formulario.precio}
                onChange={handleChange}
                onInput={soloNumeros}
                autoComplete="off"
                className={`editarServicio-form-input ${errores.precio ? "error" : ""}`}
                placeholder="0.00"
                required
              />
              {errores.precio && (
                <span className="editarServicio-error-text">
                  <FaExclamationTriangle /> {errores.precio}
                </span>
              )}
            </div>

            <div className="editarServicio-form-group">
              <label htmlFor="estado" className="editarServicio-label">
                <FaToggleOn className="editarServicio-label-icon" />
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={formulario.estado}
                onChange={handleChange}
                className={`editarServicio-form-input ${errores.estado ? "error" : ""}`}
                required
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errores.estado && (
                <span className="editarServicio-error-text">
                  <FaExclamationTriangle /> {errores.estado}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="editarServicio-form-actions">
          <button type="button" className="editarServicio-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="editarServicio-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="editarServicio-submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FaSpinner className="editarServicio-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="editarServicio-button-icon" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarServicio

"use client"

import { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaTag, FaTimes, FaSpinner, FaExclamationTriangle, FaSave, FaArrowLeft } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Referencia/CrearReferencia.css"

const CrearReferencia = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [referencia, setReferencia] = useState({
    nombre: "",
    descripcion: "",
    marca_id: "",
    tipo_vehiculo: "",
  })

  const [marcas, setMarcas] = useState([])
  const [errores, setErrores] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const res = await fetch("https://api-final-8rw7.onrender.com/api/marcas", {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        })
        if (!res.ok) throw new Error("Error al obtener las marcas")
        const data = await res.json()
        setMarcas(data)
      } catch (error) {
        console.error(error)
        Swal.fire("Error", "No se pudieron cargar las marcas", "error")
      }
    }
    fetchMarcas()
  }, [token])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    const newValue = value.replace(/^\s+/, "")
    setReferencia((prev) => ({ ...prev, [name]: newValue }))
    validarCampo(name, newValue)
  }, [])

  const validarCampo = useCallback((name, value) => {
    let error = ""

    if (name === "nombre") {
      if (!value.trim()) {
        error = "El nombre es obligatorio."
      } else if (value.trim().length < 2) {
        error = "El nombre debe tener al menos 2 caracteres."
      }
    }
    if (name === "descripcion") {
      if (!value.trim()) {
        error = "La descripción es obligatoria."
      } else if (value.trim().length < 10) {
        error = "La descripción debe tener al menos 10 caracteres."
      }
    }
    if (name === "marca_id") {
      if (!value) {
        error = "Debe seleccionar una marca."
      }
    }
    if (name === "tipo_vehiculo") {
      if (!value.trim()) {
        error = "El tipo de vehículo es obligatorio."
      }
    }
    setErrores((prev) => ({ ...prev, [name]: error }))
  }, [])

  const validarFormulario = useCallback(() => {
    const nuevosErrores = {}

    if (!referencia.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio."
    } else if (referencia.nombre.trim().length < 2) {
      nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres."
    }

    if (!referencia.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria."
    } else if (referencia.descripcion.trim().length < 10) {
      nuevosErrores.descripcion = "La descripción debe tener al menos 10 caracteres."
    }

    if (!referencia.marca_id) {
      nuevosErrores.marca_id = "Debe seleccionar una marca."
    }

    if (!referencia.tipo_vehiculo.trim()) {
      nuevosErrores.tipo_vehiculo = "El tipo de vehículo es obligatorio."
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [referencia])

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
        const res = await fetch("https://api-final-8rw7.onrender.com/api/referencias", {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(referencia),
        })

        if (!res.ok) throw new Error("Error al crear la referencia")

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Referencia creada correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate(-1)
      } catch (error) {
        console.error("Error al crear la referencia:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo crear la referencia",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [referencia, validarFormulario, token, navigate],
  )

  const handleCancel = useCallback(async () => {
    const hasData = Object.values(referencia).some(val => val !== "");
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
        navigate("/referencias")
      }
    } else {
      navigate("/referencias")
    }
  }, [referencia, navigate])

  return (
    <div className="crearReferencia-container">
      <div className="crearReferencia-header">
        <div className="crearReferencia-header-left">
          <button
            className="crearReferencia-btn-back"
            onClick={() => navigate(-1)}
            type="button"
          >
            <FaArrowLeft />
            Volver
          </button>
          <div className="crearReferencia-title-section">
            <h1 className="crearReferencia-page-title">
              <FaTag className="crearReferencia-title-icon" />
              Crear Referencia
            </h1>
            <p className="crearReferencia-subtitle">Registra una nueva referencia en el sistema</p>
          </div>
        </div>
      </div>

      <form className="crearReferencia-form" onSubmit={handleSubmit}>
        <div className="crearReferencia-form-section">
          <h3 className="crearReferencia-section-title">
            <FaTag className="crearReferencia-section-icon" />
            Información de la Referencia
          </h3>
          <div className="crearReferencia-form-grid">
            <div className="crearReferencia-form-group">
              <label htmlFor="nombre" className="crearReferencia-label">
                <FaTag className="crearReferencia-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={referencia.nombre}
                onChange={handleChange}
                maxLength={50}
                autoComplete="off"
                className={`crearReferencia-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="crearReferencia-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>
            <div className="crearReferencia-form-group">
              <label htmlFor="descripcion" className="crearReferencia-label">
                <FaTag className="crearReferencia-label-icon" />
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={referencia.descripcion}
                onChange={handleChange}
                maxLength={255}
                autoComplete="off"
                className={`crearReferencia-form-input ${errores.descripcion ? "error" : ""}`}
                required
              />
              {errores.descripcion && (
                <span className="crearReferencia-error-text">
                  <FaExclamationTriangle /> {errores.descripcion}
                </span>
              )}
            </div>
            <div className="crearReferencia-form-group">
              <label htmlFor="marca_id" className="crearReferencia-label">
                <FaTag className="crearReferencia-label-icon" />
                Marca *
              </label>
              <select
                id="marca_id"
                name="marca_id"
                value={referencia.marca_id}
                onChange={handleChange}
                className={`crearReferencia-form-input ${errores.marca_id ? "error" : ""}`}
                required
              >
                <option value="">Seleccione una marca</option>
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
              {errores.marca_id && (
                <span className="crearReferencia-error-text">
                  <FaExclamationTriangle /> {errores.marca_id}
                </span>
              )}
            </div>
            <div className="crearReferencia-form-group">
              <label htmlFor="tipo_vehiculo" className="crearReferencia-label">
                <FaTag className="crearReferencia-label-icon" />
                Tipo de Vehículo *
              </label>
              {/* This can be changed to a dropdown if necessary */}
              <input
                type="text"
                id="tipo_vehiculo"
                name="tipo_vehiculo"
                value={referencia.tipo_vehiculo}
                onChange={handleChange}
                maxLength={50}
                autoComplete="off"
                className={`crearReferencia-form-input ${errores.tipo_vehiculo ? "error" : ""}`}
                required
              />
              {errores.tipo_vehiculo && (
                <span className="crearReferencia-error-text">
                  <FaExclamationTriangle /> {errores.tipo_vehiculo}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="crearReferencia-form-actions">
          <button
            type="button"
            className="crearReferencia-cancel-button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <FaTimes className="crearReferencia-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearReferencia-submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FaSpinner className="crearReferencia-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="crearReferencia-button-icon" />
                Guardar Referencia
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CrearReferencia

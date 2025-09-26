"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { FaTag, FaTimes, FaSpinner, FaExclamationTriangle, FaSave, FaArrowLeft } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Marca/CrearMarca.css"

const CrearMarca = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [marca, setMarca] = useState({
    nombre: "",
  })

  const [errores, setErrores] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    // Elimina espacios al inicio
    const newValue = value.replace(/^\s+/, "")
    setMarca((prev) => ({ ...prev, [name]: newValue }))
    validarCampo(name, newValue)
  }, [])

  const validarCampo = useCallback((name, value) => {
    let error = ""

    if (name === "nombre") {
      if (!value.trim()) {
        error = "El nombre es obligatorio."
      } else if (value.trim().length < 3) {
        error = "El nombre debe tener al menos 3 caracteres."
      }
    }
    setErrores((prev) => ({ ...prev, [name]: error }))
  }, [])

  const validarFormulario = useCallback(() => {
    const nuevosErrores = {}

    if (!marca.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio."
    } else if (marca.nombre.trim().length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres."
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [marca])

  // Función para permitir solo letras en los campos
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
        const res = await fetch("https://api-final-8rw7.onrender.com/api/marcas", {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(marca),
        })

        if (!res.ok) throw new Error("Error al crear la marca")

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Marca creada correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate(-1)
      } catch (error) {
        console.error("Error al crear la marca:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo crear la marca",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [marca, validarFormulario, token, navigate],
  )

  const handleCancel = useCallback(async () => {
    const hasData = marca.nombre
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
        navigate("/marcas") // Redirige siempre al listado
      }
    } else {
      navigate("/marcas") // Redirige siempre al listado
    }
  }, [marca, navigate])

  return (
    <div className="crearMarca-container">
      <div className="crearMarca-header">
        <div className="crearMarca-header-left">
          <button
            className="crearMarca-btn-back"
            onClick={() => navigate(-1)}
            type="button"
          >
            <FaArrowLeft />
            Volver
          </button>
          <div className="crearMarca-title-section">
            <h1 className="crearMarca-page-title">
              <FaTag className="crearMarca-title-icon" />
              Crear Marca
            </h1>
            <p className="crearMarca-subtitle">Registra una nueva marca en el sistema</p>
          </div>
        </div>
      </div>

      <form className="crearMarca-form" onSubmit={handleSubmit}>
        <div className="crearMarca-form-section">
          <h3 className="crearMarca-section-title">
            <FaTag className="crearMarca-section-icon" />
            Información de la Marca
          </h3>
          <div className="crearMarca-form-grid">
            <div className="crearMarca-form-group">
              <label htmlFor="nombre" className="crearMarca-label">
                <FaTag className="crearMarca-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={marca.nombre}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={50}
                autoComplete="off"
                className={`crearMarca-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="crearMarca-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="crearMarca-form-actions">
          <button
            type="button"
            className="crearMarca-cancel-button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <FaTimes className="crearMarca-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearMarca-submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FaSpinner className="crearMarca-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="crearMarca-button-icon" />
                Guardar Marca
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CrearMarca

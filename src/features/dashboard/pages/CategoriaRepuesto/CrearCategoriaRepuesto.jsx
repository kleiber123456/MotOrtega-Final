"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { FaTag, FaTimes, FaSpinner, FaExclamationTriangle, FaSave } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Categorias/CrearCategoriaRepuesto.css"

const CrearCategoriaRepuesto = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [categoria, setCategoria] = useState({
    nombre: "",
    estado: "Activo",
  })

  const [errores, setErrores] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setCategoria((prev) => ({ ...prev, [name]: value }))
    validarCampo(name, value)
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

    if (!categoria.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio."
    } else if (categoria.nombre.trim().length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres."
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [categoria])

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
        const res = await fetch("https://api-final-8rw7.onrender.com/api/categorias-repuestos", {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoria),
        })

        if (!res.ok) throw new Error("Error al crear la categoría")

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Categoría creada correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate(-1)
      } catch (error) {
        console.error("Error al crear la categoría:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo crear la categoría",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [categoria, validarFormulario, token, navigate],
  )

  const handleCancel = useCallback(async () => {
    const hasData = Object.values(categoria).some((value) => value !== "" && value !== "Activo")

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
        navigate("-1")
      }
    } else {
      navigate("-1")
    }
  }, [categoria, navigate])

  return (
    <div className="crearCategoriaRepuesto-container">
      <div className="crearCategoriaRepuesto-header">
        <h1 className="crearCategoriaRepuesto-page-title">
          <FaTag className="crearCategoriaRepuesto-title-icon" />
          Crear Categoría de Repuesto
        </h1>
        <p className="crearCategoriaRepuesto-subtitle">Registra una nueva categoría de repuesto en el sistema</p>
      </div>

      <form className="crearCategoriaRepuesto-form" onSubmit={handleSubmit}>
        <div className="crearCategoriaRepuesto-form-section">
          <h3 className="crearCategoriaRepuesto-section-title">
            <FaTag className="crearCategoriaRepuesto-section-icon" />
            Información de la Categoría
          </h3>
          <div className="crearCategoriaRepuesto-form-grid">
            <div className="crearCategoriaRepuesto-form-group">
              <label htmlFor="nombre" className="crearCategoriaRepuesto-label">
                <FaTag className="crearCategoriaRepuesto-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={categoria.nombre}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={50}
                autoComplete="off"
                className={`crearCategoriaRepuesto-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="crearCategoriaRepuesto-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="crearCategoriaRepuesto-form-group">
              <label htmlFor="estado" className="crearCategoriaRepuesto-label">
                <FaTag className="crearCategoriaRepuesto-label-icon" />
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={categoria.estado}
                onChange={handleChange}
                className="crearCategoriaRepuesto-form-input"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="crearCategoriaRepuesto-form-actions">
          <button
            type="button"
            className="crearCategoriaRepuesto-cancel-button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <FaTimes className="crearCategoriaRepuesto-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearCategoriaRepuesto-submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FaSpinner className="crearCategoriaRepuesto-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="crearCategoriaRepuesto-button-icon" />
                Guardar Categoría
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CrearCategoriaRepuesto

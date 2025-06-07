"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaTag, FaTimes, FaSpinner, FaExclamationTriangle, FaSave, FaArrowLeft } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Categorias/EditarCategoriaRepuesto.css"

const EditarCategoriaRepuesto = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [categoria, setCategoria] = useState({
    nombre: "",
    estado: "Activo",
  })

  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        setCargando(true)
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/categorias-repuestos/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Error al obtener la categoría")

        const data = await res.json()
        setCategoria({
          nombre: data.nombre || "",
          estado: data.estado || "Activo",
        })
      } catch (err) {
        console.error("Error al cargar datos:", err)
        Swal.fire("Error", "No se pudieron cargar los datos de la categoría", "error")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      fetchCategoria()
    }
  }, [id, token])

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
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/categorias-repuestos/${id}`, {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoria),
        })

        if (!res.ok) throw new Error("Error al actualizar la categor��a")

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Categoría actualizada correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/categorias-repuesto")
      } catch (error) {
        console.error("Error al actualizar la categoría:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo actualizar la categoría",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [categoria, validarFormulario, token, id, navigate],
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
      navigate("/categorias-repuesto")
    }
  }, [navigate])

  if (cargando) {
    return (
      <div className="editarCategoriaRepuesto-container">
        <div className="editarCategoriaRepuesto-loading">
          <div className="editarCategoriaRepuesto-spinner"></div>
          <p>Cargando datos de la categoría...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editarCategoriaRepuesto-container">
      <div className="editarCategoriaRepuesto-header">
        <div className="editarCategoriaRepuesto-header-left">
          <button className="editarCategoriaRepuesto-btn-back" onClick={() => navigate("/categorias-repuesto")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarCategoriaRepuesto-title-section">
            <h1 className="editarCategoriaRepuesto-page-title">
              <FaTag className="editarCategoriaRepuesto-title-icon" />
              Editar Categoría de Repuesto
            </h1>
            <p className="editarCategoriaRepuesto-subtitle">Modifica la información de la categoría</p>
          </div>
        </div>
      </div>

      <form className="editarCategoriaRepuesto-form" onSubmit={handleSubmit}>
        <div className="editarCategoriaRepuesto-form-section">
          <h3 className="editarCategoriaRepuesto-section-title">
            <FaTag className="editarCategoriaRepuesto-section-icon" />
            Información de la Categoría
          </h3>
          <div className="editarCategoriaRepuesto-form-grid">
            <div className="editarCategoriaRepuesto-form-group">
              <label htmlFor="nombre" className="editarCategoriaRepuesto-label">
                <FaTag className="editarCategoriaRepuesto-label-icon" />
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
                className={`editarCategoriaRepuesto-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="editarCategoriaRepuesto-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="editarCategoriaRepuesto-form-group">
              <label htmlFor="estado" className="editarCategoriaRepuesto-label">
                <FaTag className="editarCategoriaRepuesto-label-icon" />
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={categoria.estado}
                onChange={handleChange}
                className="editarCategoriaRepuesto-form-input"
                required
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="editarCategoriaRepuesto-form-actions">
          <button
            type="button"
            className="editarCategoriaRepuesto-cancel-button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <FaTimes className="editarCategoriaRepuesto-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="editarCategoriaRepuesto-submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FaSpinner className="editarCategoriaRepuesto-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="editarCategoriaRepuesto-button-icon" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarCategoriaRepuesto

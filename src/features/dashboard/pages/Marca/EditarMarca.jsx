"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaTag, FaTimes, FaSpinner, FaExclamationTriangle, FaSave, FaArrowLeft } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Marca/EditarMarca.css"

const EditarMarca = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [marca, setMarca] = useState({
    nombre: "",
  })

  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchMarca = async () => {
      try {
        setCargando(true)
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/marcas/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Error al obtener la marca")

        const data = await res.json()
        setMarca({
          nombre: data.nombre || "",
        })
      } catch (err) {
        console.error("Error al cargar datos:", err)
        Swal.fire("Error", "No se pudieron cargar los datos de la marca", "error")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      fetchMarca()
    }
  }, [id, token])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setMarca((prev) => ({ ...prev, [name]: value }))
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
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/marcas/${id}`, {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(marca),
        })

        if (!res.ok) throw new Error("Error al actualizar la marca")

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Marca actualizada correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/marcas")
      } catch (error) {
        console.error("Error al actualizar la marca:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo actualizar la marca",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [marca, validarFormulario, token, id, navigate],
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
      navigate("/marcas")
    }
  }, [navigate])

  if (cargando) {
    return (
      <div className="editarMarca-container">
        <div className="editarMarca-loading">
          <div className="editarMarca-spinner"></div>
          <p>Cargando datos de la marca...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editarMarca-container">
      <div className="editarMarca-header">
        <div className="editarMarca-header-left">
          <button className="editarMarca-btn-back" onClick={() => navigate("/marcas")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarMarca-title-section">
            <h1 className="editarMarca-page-title">
              <FaTag className="editarMarca-title-icon" />
              Editar Marca
            </h1>
            <p className="editarMarca-subtitle">Modifica la información de la marca</p>
          </div>
        </div>
      </div>

      <form className="editarMarca-form" onSubmit={handleSubmit}>
        <div className="editarMarca-form-section">
          <h3 className="editarMarca-section-title">
            <FaTag className="editarMarca-section-icon" />
            Información de la Marca
          </h3>
          <div className="editarMarca-form-grid">
            <div className="editarMarca-form-group">
              <label htmlFor="nombre" className="editarMarca-label">
                <FaTag className="editarMarca-label-icon" />
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
                className={`editarMarca-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="editarMarca-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="editarMarca-form-actions">
          <button
            type="button"
            className="editarMarca-cancel-button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <FaTimes className="editarMarca-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="editarMarca-submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FaSpinner className="editarMarca-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="editarMarca-button-icon" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarMarca

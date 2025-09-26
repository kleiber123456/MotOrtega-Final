"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaTag, FaTimes, FaSpinner, FaExclamationTriangle, FaSave, FaArrowLeft } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Referencia/EditarReferencia.css"

const EditarReferencia = () => {
  const { id } = useParams()
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
  const [cargando, setCargando] = useState(true)
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

  useEffect(() => {
    const fetchReferencia = async () => {
      try {
        setCargando(true)
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/referencias/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Error al obtener la referencia")

        const data = await res.json()
        setReferencia({
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          marca_id: data.marca_id || "",
          tipo_vehiculo: data.tipo_vehiculo || "",
        })
      } catch (err) {
        console.error("Error al cargar datos:", err)
        Swal.fire("Error", "No se pudieron cargar los datos de la referencia", "error")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      fetchReferencia()
    }
  }, [id, token])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setReferencia((prev) => ({ ...prev, [name]: value }))
    validarCampo(name, value)
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
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/referencias/${id}`, {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(referencia),
        })

        if (!res.ok) throw new Error("Error al actualizar la referencia")

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Referencia actualizada correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/referencias")
      } catch (error) {
        console.error("Error al actualizar la referencia:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo actualizar la referencia",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [referencia, validarFormulario, token, id, navigate],
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
      navigate("/referencias")
    }
  }, [navigate])

  if (cargando) {
    return (
      <div className="editarReferencia-container">
        <div className="editarReferencia-loading">
          <div className="editarReferencia-spinner"></div>
          <p>Cargando datos de la referencia...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editarReferencia-container">
      <div className="editarReferencia-header">
        <div className="editarReferencia-header-left">
          <button className="editarReferencia-btn-back" onClick={() => navigate("/referencias")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarReferencia-title-section">
            <h1 className="editarReferencia-page-title">
              <FaTag className="editarReferencia-title-icon" />
              Editar Referencia
            </h1>
            <p className="editarReferencia-subtitle">Modifica la información de la referencia</p>
          </div>
        </div>
      </div>

      <form className="editarReferencia-form" onSubmit={handleSubmit}>
        <div className="editarReferencia-form-section">
          <h3 className="editarReferencia-section-title">
            <FaTag className="editarReferencia-section-icon" />
            Información de la Referencia
          </h3>
          <div className="editarReferencia-form-grid">
            <div className="editarReferencia-form-group">
              <label htmlFor="nombre" className="editarReferencia-label">
                <FaTag className="editarReferencia-label-icon" />
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
                className={`editarReferencia-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="editarReferencia-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>
            <div className="editarReferencia-form-group">
              <label htmlFor="descripcion" className="editarReferencia-label">
                <FaTag className="editarReferencia-label-icon" />
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={referencia.descripcion}
                onChange={handleChange}
                maxLength={255}
                autoComplete="off"
                className={`editarReferencia-form-input ${errores.descripcion ? "error" : ""}`}
                required
              />
              {errores.descripcion && (
                <span className="editarReferencia-error-text">
                  <FaExclamationTriangle /> {errores.descripcion}
                </span>
              )}
            </div>
            <div className="editarReferencia-form-group">
              <label htmlFor="marca_id" className="editarReferencia-label">
                <FaTag className="editarReferencia-label-icon" />
                Marca *
              </label>
              <select
                id="marca_id"
                name="marca_id"
                value={referencia.marca_id}
                onChange={handleChange}
                className={`editarReferencia-form-input ${errores.marca_id ? "error" : ""}`}
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
                <span className="editarReferencia-error-text">
                  <FaExclamationTriangle /> {errores.marca_id}
                </span>
              )}
            </div>
            <div className="editarReferencia-form-group">
              <label htmlFor="tipo_vehiculo" className="editarReferencia-label">
                <FaTag className="editarReferencia-label-icon" />
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
                className={`editarReferencia-form-input ${errores.tipo_vehiculo ? "error" : ""}`}
                required
              />
              {errores.tipo_vehiculo && (
                <span className="editarReferencia-error-text">
                  <FaExclamationTriangle /> {errores.tipo_vehiculo}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="editarReferencia-form-actions">
          <button
            type="button"
            className="editarReferencia-cancel-button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <FaTimes className="editarReferencia-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="editarReferencia-submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FaSpinner className="editarReferencia-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="editarReferencia-button-icon" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarReferencia

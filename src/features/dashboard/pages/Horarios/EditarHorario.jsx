"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FaSave, FaArrowLeft } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Horarios/EditarHorario.css"

const EditarHorario = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const [formData, setFormData] = useState({
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarHorario = async () => {
      try {
        const response = await fetch(`https://api-final-8rw7.onrender.com/api/horarios/${id}`, {
          headers: {
            Authorization: token,
          },
        })

        if (!response.ok) throw new Error("Error al cargar el horario")

        const data = await response.json()
        setFormData(data)
        setLoading(false)
      } catch (error) {
        console.error("Error:", error)
        Swal.fire("Error", "No se pudo cargar el horario", "error")
        setLoading(false)
      }
    }

    cargarHorario()
  }, [id, token])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.fecha) newErrors.fecha = "La fecha es requerida"
    if (!formData.hora_inicio) newErrors.hora_inicio = "La hora de inicio es requerida"
    if (!formData.hora_fin) newErrors.hora_fin = "La hora de fin es requerida"

    if (formData.hora_inicio && formData.hora_fin) {
      if (formData.hora_inicio >= formData.hora_fin) {
        newErrors.hora_fin = "La hora de fin debe ser mayor a la hora de inicio"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`https://api-final-8rw7.onrender.com/api/horarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error al actualizar el horario")

      Swal.fire("Éxito", "Horario actualizado correctamente", "success")
      navigate("/Horarios")
    } catch (error) {
      console.error("Error:", error)
      Swal.fire("Error", "No se pudo actualizar el horario", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="editarHorario-container">
        <div className="editarHorario-loading">Cargando horario...</div>
      </div>
    )
  }

  return (
    <div className="editarHorario-container">
      <div className="editarHorario-header">
        <button className="editarHorario-back-button" onClick={() => navigate("/Horarios")}>
          <FaArrowLeft /> Volver
        </button>
        <h1 className="editarHorario-title">Editar Horario</h1>
      </div>

      <form onSubmit={handleSubmit} className="editarHorario-form">
        <div className="editarHorario-form-group">
          <label>Fecha:</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
            className={errors.fecha ? "error" : ""}
          />
          {errors.fecha && <span className="error-message">{errors.fecha}</span>}
        </div>

        <div className="editarHorario-form-group">
          <label>Hora de Inicio:</label>
          <input
            type="time"
            name="hora_inicio"
            value={formData.hora_inicio}
            onChange={handleInputChange}
            className={errors.hora_inicio ? "error" : ""}
          />
          {errors.hora_inicio && <span className="error-message">{errors.hora_inicio}</span>}
        </div>

        <div className="editarHorario-form-group">
          <label>Hora de Fin:</label>
          <input
            type="time"
            name="hora_fin"
            value={formData.hora_fin}
            onChange={handleInputChange}
            className={errors.hora_fin ? "error" : ""}
          />
          {errors.hora_fin && <span className="error-message">{errors.hora_fin}</span>}
        </div>

        <div className="editarHorario-form-actions">
          <button type="submit" className="editarHorario-submit-button" disabled={isSubmitting}>
            <FaSave /> {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarHorario
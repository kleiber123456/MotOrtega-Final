"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaSave, FaArrowLeft } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Horarios/CrearHorario.css"

const CrearHorario = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const [formData, setFormData] = useState({
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const response = await fetch("https://api-final-8rw7.onrender.com/api/horarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error al crear el horario")

      Swal.fire("Éxito", "Horario creado correctamente", "success")
      navigate("/Horarios")
    } catch (error) {
      console.error("Error:", error)
      Swal.fire("Error", "No se pudo crear el horario", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="crearHorario-container">
      <div className="crearHorario-header">
        <button className="crearHorario-back-button" onClick={() => navigate("/Horarios")}>
          <FaArrowLeft /> Volver
        </button>
        <h1 className="crearHorario-title">Crear Nuevo Horario</h1>
      </div>

      <form onSubmit={handleSubmit} className="crearHorario-form">
        <div className="crearHorario-form-group">
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

        <div className="crearHorario-form-group">
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

        <div className="crearHorario-form-group">
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

        <div className="crearHorario-form-actions">
          <button type="submit" className="crearHorario-submit-button" disabled={isSubmitting}>
            <FaSave /> {isSubmitting ? "Guardando..." : "Guardar Horario"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CrearHorario
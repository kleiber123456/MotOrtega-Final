"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaCalendarAlt,
  FaCar,
  FaClipboardList,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa"
import "../../../shared/styles/Dashboard.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const AgendarCita = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState({})
  const [vehiculos, setVehiculos] = useState([])
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    fecha: "",
    vehiculo_id: "",
    observaciones: "",
  })

  // Función para realizar peticiones autenticadas
  const makeRequest = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token disponible")
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error)
      throw error
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setUserData(user)

          // Cargar vehículos del cliente
          const vehiculosResponse = await makeRequest(`/vehiculos?cliente_id=${user.id}`)
          const vehiculosData = Array.isArray(vehiculosResponse) ? vehiculosResponse : vehiculosResponse?.data || []
          setVehiculos(vehiculosData)
        }
      } catch (error) {
        console.error("Error cargando datos del usuario:", error)
      }
    }

    fetchUserData()
  }, [])

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.fecha) {
          newErrors.fecha = "Debe seleccionar una fecha"
        } else {
          const selectedDate = new Date(formData.fecha)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          if (selectedDate < today) {
            newErrors.fecha = "No puede seleccionar una fecha pasada"
          }

          if (selectedDate.getDay() === 0) {
            newErrors.fecha = "No se pueden agendar citas los domingos"
          }
        }
        break
      case 2:
        if (!formData.vehiculo_id) {
          newErrors.vehiculo_id = "Debe seleccionar un vehículo"
        }
        break
      case 3:
        if (!formData.observaciones.trim()) {
          newErrors.observaciones = "Debe agregar observaciones sobre el servicio requerido"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    try {
      setLoading(true)

      const citaData = {
        fecha: formData.fecha,
        hora: "09:00", // Hora por defecto, se asignará automáticamente
        observaciones: formData.observaciones,
        vehiculo_id: Number.parseInt(formData.vehiculo_id),
        cliente_id: userData.id,
        estado_cita_id: 1, // Estado pendiente
        // No se incluye mecanico_id, se asignará automáticamente
      }

      await makeRequest("/citas", {
        method: "POST",
        body: JSON.stringify(citaData),
      })

      // Mostrar mensaje de éxito y redirigir
      alert(
        "¡Cita agendada exitosamente! Nos pondremos en contacto contigo para confirmar la hora y asignar el mecánico.",
      )
      navigate("/client/dashboard")
    } catch (error) {
      console.error("Error creando la cita:", error)
      alert("Error al agendar la cita. Por favor intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const getSelectedVehiculo = () => {
    return vehiculos.find((v) => v.id === Number.parseInt(formData.vehiculo_id))
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="crearCita-container">
      {/* Header */}
      <div className="crearCita-header">
        <div className="crearCita-headerContent">
          <div className="crearCita-iconContainer">
            <FaCalendarAlt className="crearCita-icon" />
          </div>
          <div className="crearCita-titleSection">
            <h1 className="crearCita-title">Agendar Nueva Cita</h1>
            <p className="crearCita-subtitle">Paso {currentStep} de 3</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate("/client/dashboard")} className="crearCita-backButton">
          <FaArrowLeft /> Volver
        </button>
      </div>

      {/* Indicador de pasos */}
      <div className="step-indicator" style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
        {[1, 2, 3].map((step) => (
          <div key={step} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: currentStep >= step ? "#4CAF50" : "#ddd",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {currentStep > step ? <FaCheck /> : step}
            </div>
            {step < 3 && (
              <div
                style={{
                  width: "60px",
                  height: "2px",
                  backgroundColor: currentStep > step ? "#4CAF50" : "#ddd",
                  margin: "0 10px",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Contenido principal */}
      <div className="crearCita-content">
        <div className="crearCita-mainCard">
          {/* Paso 1: Seleccionar Fecha */}
          {currentStep === 1 && (
            <div className="crearCita-form-section">
              <h2 className="crearCita-section-title">
                <FaCalendarAlt className="crearCita-section-icon" />
                Seleccionar Fecha
              </h2>
              <div className="crearCita-form-group">
                <label className="crearCita-label">
                  <FaCalendarAlt className="crearCita-label-icon" />
                  Fecha de la cita *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  max={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  className={`crearCita-form-input ${errors.fecha ? "error" : ""}`}
                />
                {errors.fecha && (
                  <span className="crearCita-error-text">
                    <FaExclamationTriangle />
                    {errors.fecha}
                  </span>
                )}
                <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>* No se atiende los domingos</p>
              </div>
            </div>
          )}

          {/* Paso 2: Seleccionar Vehículo */}
          {currentStep === 2 && (
            <div className="crearCita-form-section">
              <h2 className="crearCita-section-title">
                <FaCar className="crearCita-section-icon" />
                Seleccionar Vehículo
              </h2>
              <div className="crearCita-form-group">
                <label className="crearCita-label">
                  <FaCar className="crearCita-label-icon" />
                  Vehículo *
                </label>
                {vehiculos.length > 0 ? (
                  <select
                    name="vehiculo_id"
                    value={formData.vehiculo_id}
                    onChange={handleInputChange}
                    className={`crearCita-form-input ${errors.vehiculo_id ? "error" : ""}`}
                  >
                    <option value="">Seleccione un vehículo</option>
                    {vehiculos.map((vehiculo) => (
                      <option key={vehiculo.id} value={vehiculo.id}>
                        {vehiculo.placa} - {vehiculo.referencia?.marca?.nombre || vehiculo.marca_nombre}{" "}
                        {vehiculo.referencia?.nombre || vehiculo.referencia_nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                    <FaCar style={{ fontSize: "3rem", marginBottom: "1rem" }} />
                    <p>No tienes vehículos registrados</p>
                    <button
                      type="button"
                      className="crearCita-submit-button"
                      onClick={() => navigate("/vehiculos/crear")}
                      style={{ marginTop: "1rem" }}
                    >
                      Registrar Vehículo
                    </button>
                  </div>
                )}
                {errors.vehiculo_id && (
                  <span className="crearCita-error-text">
                    <FaExclamationTriangle />
                    {errors.vehiculo_id}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Paso 3: Observaciones */}
          {currentStep === 3 && (
            <div className="crearCita-form-section">
              <h2 className="crearCita-section-title">
                <FaClipboardList className="crearCita-section-icon" />
                Detalles del Servicio
              </h2>

              {/* Resumen de la cita */}
              <div style={{ backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
                <h3 style={{ margin: "0 0 1rem 0", color: "#333" }}>Resumen de tu cita:</h3>
                <p>
                  <strong>Fecha:</strong> {formatearFecha(formData.fecha)}
                </p>
                <p>
                  <strong>Vehículo:</strong>{" "}
                  {getSelectedVehiculo()
                    ? `${getSelectedVehiculo().placa} - ${getSelectedVehiculo().referencia?.marca?.nombre || getSelectedVehiculo().marca_nombre} ${getSelectedVehiculo().referencia?.nombre || getSelectedVehiculo().referencia_nombre}`
                    : "No seleccionado"}
                </p>
                <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
                  <FaClock /> La hora será asignada automáticamente y te contactaremos para confirmarla
                </p>
              </div>

              <div className="crearCita-form-group">
                <label className="crearCita-label">
                  <FaClipboardList className="crearCita-label-icon" />
                  Describe el servicio que necesitas *
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Ejemplo: Cambio de aceite, revisión de frenos, ruido extraño en el motor, etc."
                  className={`crearCita-form-input crearCita-textarea ${errors.observaciones ? "error" : ""}`}
                />
                {errors.observaciones && (
                  <span className="crearCita-error-text">
                    <FaExclamationTriangle />
                    {errors.observaciones}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="crearCita-form-actions">
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="crearCita-cancel-button">
                <FaArrowLeft className="crearCita-button-icon" />
                Anterior
              </button>
            )}

            {currentStep < 3 ? (
              <button type="button" onClick={nextStep} className="crearCita-submit-button">
                Siguiente
                <FaArrowRight className="crearCita-button-icon" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} className="crearCita-submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <div className="crearCita-spinner spinning"></div>
                    Agendando...
                  </>
                ) : (
                  <>
                    <FaCheck className="crearCita-button-icon" />
                    Agendar Cita
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgendarCita

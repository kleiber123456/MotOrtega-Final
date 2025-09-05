"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaCar, FaArrowLeft, FaArrowRight, FaCheck, FaExclamationTriangle, FaInfoCircle, FaCogs } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../shared/styles/Client/CrearVehiculo.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const CrearVehiculo = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState({})
  const [marcas, setMarcas] = useState([])
  const [referencias, setReferencias] = useState([])
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    placa: "",
    color: "",
    tipo_vehiculo: "",
    marca_id: "",
    referencia_id: "",
    estado: "Activo",
  })

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
    const fetchInitialData = async () => {
      try {
        const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setUserData(user)
        }

        try {
          const marcasResponse = await makeRequest("/marcas")
          const marcasData = Array.isArray(marcasResponse) ? marcasResponse : marcasResponse?.data || []
          setMarcas(marcasData)
        } catch (error) {
          console.error("Error cargando marcas:", error)
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar las marcas. Intenta nuevamente.",
            confirmButtonColor: "#ef4444",
          })
        }
      } catch (error) {
        console.error("Error cargando datos iniciales:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al cargar los datos iniciales",
          confirmButtonColor: "#ef4444",
        })
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    const fetchReferencias = async () => {
      if (formData.marca_id) {
        try {
          const referenciasResponse = await makeRequest(`/referencias?marca_id=${formData.marca_id}`)
          const referenciasData = Array.isArray(referenciasResponse)
            ? referenciasResponse
            : referenciasResponse?.data || []
          setReferencias(referenciasData)
        } catch (error) {
          console.error("Error cargando referencias:", error)
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los modelos. Intenta nuevamente.",
            confirmButtonColor: "#ef4444",
          })
          setReferencias([])
        }
      } else {
        setReferencias([])
      }
    }

    fetchReferencias()
  }, [formData.marca_id])

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.placa.trim()) {
          newErrors.placa = "La placa es obligatoria"
        } else if (!/^[A-Z]{3}[0-9]{3}$|^[A-Z]{3}[0-9]{2}[A-Z]$/.test(formData.placa.toUpperCase())) {
          newErrors.placa = "Formato de placa inválido (ej: ABC123 o ABC12D)"
        }

        if (!formData.color.trim()) {
          newErrors.color = "El color es obligatorio"
        } else if (formData.color.trim().length < 3) {
          newErrors.color = "El color debe tener al menos 3 caracteres"
        }

        if (!formData.tipo_vehiculo.trim()) {
          newErrors.tipo_vehiculo = "El tipo de vehículo es obligatorio"
        }
        break

      case 2:
        if (!formData.marca_id) {
          newErrors.marca_id = "Debe seleccionar una marca"
        }

        if (!formData.referencia_id) {
          newErrors.referencia_id = "Debe seleccionar un modelo"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 2))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    let processedValue = value

    // Process specific values
    if (name === "placa") {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    } else if (name === "color") {
      processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "")
    } else if (name === "marca_id") {
      // Reset referencia when marca changes
      setFormData((prev) => ({
        ...prev,
        referencia_id: "",
      }))
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return

    try {
      setLoading(true)

      const vehiculoData = {
        placa: formData.placa.toUpperCase(),
        color: formData.color.trim(),
        tipo_vehiculo: formData.tipo_vehiculo,
        referencia_id: Number.parseInt(formData.referencia_id),
        cliente_id: userData.id,
        estado: formData.estado,
      }

      await makeRequest("/vehiculos/cliente/crear", {
        method: "POST",
        body: JSON.stringify(vehiculoData),
      })

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Vehículo registrado exitosamente",
        confirmButtonColor: "#10b981",
        timer: 2000,
      })

      navigate("/client/vehiculos")
    } catch (error) {
      console.error("Error creando el vehículo:", error)
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al registrar el vehículo. Por favor intenta nuevamente.",
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setLoading(false)
    }
  }

  const getSelectedReferencia = () => {
    return referencias.find((r) => r.id === Number.parseInt(formData.referencia_id))
  }

  const getSelectedMarca = () => {
    return marcas.find((m) => m.id === Number.parseInt(formData.marca_id))
  }

  return (
    <div className="cvc-crear-container">
      {/* Header */}
      <div className="cvc-crear-header">
        <div className="cvc-crear-header-content">
          <div className="cvc-crear-icon-container">
            <FaCar className="cvc-crear-icon" />
          </div>
          <div className="cvc-crear-title-section">
            <h1>Registrar Nuevo Vehículo</h1>
            <p>Paso {currentStep} de 2</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate("/client/vehiculos")} className="cvc-crear-back-button">
          <FaArrowLeft /> Volver
        </button>
      </div>

      {/* Step indicator */}
      <div className="cvc-crear-step-indicator">
        {[1, 2].map((step) => (
          <div key={step} className="cvc-crear-step">
            <div className={`cvc-crear-step-circle ${currentStep >= step ? "active" : "inactive"}`}>
              {currentStep > step ? <FaCheck /> : step}
            </div>
            {step < 2 && <div className={`cvc-crear-step-line ${currentStep > step ? "active" : "inactive"}`} />}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="cvc-crear-content">
        <div className="cvc-crear-main-card">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="cvc-crear-form-section">
              <h2 className="cvc-crear-section-title">
                <FaInfoCircle className="cvc-crear-section-icon" />
                Información Básica
              </h2>

              <div className="cvc-crear-form-group">
                <label className="cvc-crear-label">
                  <FaCar className="cvc-crear-label-icon" />
                  Placa del vehículo *
                </label>
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handleInputChange}
                  placeholder="ABC123"
                  maxLength="6"
                  className={`cvc-crear-form-input ${errors.placa ? "error" : ""}`}
                />
                {errors.placa && (
                  <span className="cvc-crear-error-text">
                    <FaExclamationTriangle />
                    {errors.placa}
                  </span>
                )}
              </div>

              <div className="cvc-crear-form-grid">
                <div className="cvc-crear-form-group">
                  <label className="cvc-crear-label">Color *</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="Blanco, Azul, Negro..."
                    maxLength="30"
                    className={`cvc-crear-form-input ${errors.color ? "error" : ""}`}
                  />
                  {errors.color && (
                    <span className="cvc-crear-error-text">
                      <FaExclamationTriangle />
                      {errors.color}
                    </span>
                  )}
                </div>

                <div className="cvc-crear-form-group">
                  <label className="cvc-crear-label">Tipo de Vehículo *</label>
                  <select
                    name="tipo_vehiculo"
                    value={formData.tipo_vehiculo}
                    onChange={handleInputChange}
                    className={`cvc-crear-form-input ${errors.tipo_vehiculo ? "error" : ""}`}
                  >
                    <option value="">Seleccione el tipo</option>
                    <option value="Automóvil">Automóvil</option>
                    <option value="Moto">Motocicleta</option>
                    <option value="SUV">SUV</option>
                    <option value="Camioneta">Camioneta</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                  {errors.tipo_vehiculo && (
                    <span className="cvc-crear-error-text">
                      <FaExclamationTriangle />
                      {errors.tipo_vehiculo}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Brand and Model */}
          {currentStep === 2 && (
            <div className="cvc-crear-form-section">
              <h2 className="cvc-crear-section-title">
                <FaCogs className="cvc-crear-section-icon" />
                Marca y Modelo
              </h2>

              <div className="cvc-crear-form-group">
                <label className="cvc-crear-label">Marca *</label>
                <select
                  name="marca_id"
                  value={formData.marca_id}
                  onChange={handleInputChange}
                  className={`cvc-crear-form-input ${errors.marca_id ? "error" : ""}`}
                >
                  <option value="">Seleccione una marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>
                {errors.marca_id && (
                  <span className="cvc-crear-error-text">
                    <FaExclamationTriangle />
                    {errors.marca_id}
                  </span>
                )}
              </div>

              <div className="cvc-crear-form-group">
                <label className="cvc-crear-label">Modelo *</label>
                <select
                  name="referencia_id"
                  value={formData.referencia_id}
                  onChange={handleInputChange}
                  disabled={!formData.marca_id}
                  className={`cvc-crear-form-input ${errors.referencia_id ? "error" : ""}`}
                >
                  <option value="">
                    {formData.marca_id ? "Seleccione un modelo" : "Primero seleccione una marca"}
                  </option>
                  {referencias.map((referencia) => (
                    <option key={referencia.id} value={referencia.id}>
                      {referencia.nombre}
                    </option>
                  ))}
                </select>
                {errors.referencia_id && (
                  <span className="cvc-crear-error-text">
                    <FaExclamationTriangle />
                    {errors.referencia_id}
                  </span>
                )}
              </div>

              {formData.referencia_id && (
                <div className="cvc-crear-vehicle-preview">
                  <h4>Vehículo seleccionado:</h4>
                  <p>
                    <strong>
                      {getSelectedMarca()?.nombre} {getSelectedReferencia()?.nombre} - {formData.tipo_vehiculo}
                    </strong>
                  </p>
                  <p>
                    Placa: {formData.placa} | Color: {formData.color}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="cvc-crear-form-actions">
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="cvc-crear-cancel-button">
                <FaArrowLeft className="cvc-crear-button-icon" />
                Anterior
              </button>
            )}

            {currentStep < 2 ? (
              <button type="button" onClick={nextStep} className="cvc-crear-submit-button">
                Siguiente
                <FaArrowRight className="cvc-crear-button-icon" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} className="cvc-crear-submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <div className="cvc-crear-spinner"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <FaCheck className="cvc-crear-button-icon" />
                    Registrar Vehículo
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

export default CrearVehiculo

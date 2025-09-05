"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  FaCar,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCogs,
  FaSpinner,
} from "react-icons/fa"
import "../../../shared/styles/Dashboard.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const EditarVehiculo = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [userData, setUserData] = useState({})
  const [marcas, setMarcas] = useState([])
  const [referencias, setReferencias] = useState([])
  const [errors, setErrors] = useState({})
  const [vehiculoOriginal, setVehiculoOriginal] = useState(null)

  const [formData, setFormData] = useState({
    placa: "",
    color: "",
    tipo_vehiculo: "",
    referencia_id: "",
    estado: "Activo",
  })

  const MOCK_MARCAS = [
    { id: 1, nombre: "Toyota" },
    { id: 2, nombre: "Honda" },
    { id: 3, nombre: "Hyundai" },
    { id: 4, nombre: "Chevrolet" },
    { id: 5, nombre: "Nissan" },
    { id: 6, nombre: "Mazda" },
    { id: 7, nombre: "Ford" },
    { id: 8, nombre: "Volkswagen" },
  ]

  const MOCK_REFERENCIAS = {
    1: [
      { id: 1, nombre: "Corolla", marca_id: 1 },
      { id: 2, nombre: "Camry", marca_id: 1 },
      { id: 3, nombre: "RAV4", marca_id: 1 },
      { id: 4, nombre: "Prius", marca_id: 1 },
    ],
    2: [
      { id: 5, nombre: "Civic", marca_id: 2 },
      { id: 6, nombre: "Accord", marca_id: 2 },
      { id: 7, nombre: "CR-V", marca_id: 2 },
      { id: 8, nombre: "Fit", marca_id: 2 },
    ],
    3: [
      { id: 9, nombre: "Elantra", marca_id: 3 },
      { id: 10, nombre: "Tucson", marca_id: 3 },
      { id: 11, nombre: "Accent", marca_id: 3 },
      { id: 12, nombre: "Santa Fe", marca_id: 3 },
    ],
    4: [
      { id: 13, nombre: "Spark", marca_id: 4 },
      { id: 14, nombre: "Cruze", marca_id: 4 },
      { id: 15, nombre: "Captiva", marca_id: 4 },
      { id: 16, nombre: "Aveo", marca_id: 4 },
    ],
  }

  const MOCK_VEHICULO = {
    id: Number.parseInt(id),
    placa: "ABC123",
    color: "Blanco",
    tipo_vehiculo: "Automóvil",
    referencia_id: 1,
    cliente_id: 1,
    estado: "Activo",
    referencia_nombre: "Corolla",
    marca_nombre: "Toyota",
  }

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

  const loadMockData = () => {
    console.log("[v0] Cargando datos simulados para edición de vehículo")
    setMarcas(MOCK_MARCAS)

    const vehiculo = MOCK_VEHICULO
    setVehiculoOriginal(vehiculo)

    setFormData({
      placa: vehiculo.placa,
      color: vehiculo.color,
      tipo_vehiculo: vehiculo.tipo_vehiculo,
      referencia_id: vehiculo.referencia_id?.toString() || "",
      estado: vehiculo.estado,
    })
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true)
        const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setUserData(user)
        }

        try {
          const vehiculoResponse = await makeRequest(`/vehiculos/cliente/detalle/${id}`)
          const vehiculo = vehiculoResponse?.data || vehiculoResponse
          setVehiculoOriginal(vehiculo)

          setFormData({
            placa: vehiculo.placa || "",
            color: vehiculo.color || "",
            tipo_vehiculo: vehiculo.tipo_vehiculo || "",
            referencia_id: vehiculo.referencia_id?.toString() || "",
            estado: vehiculo.estado || "Activo",
          })
        } catch (error) {
          console.error("Error cargando vehículo:", error)
          loadMockData()
          return
        }

        try {
          const marcasResponse = await makeRequest("/marcas")
          const marcasData = Array.isArray(marcasResponse) ? marcasResponse : marcasResponse?.data || []
          setMarcas(marcasData)
        } catch (error) {
          console.error("Error cargando marcas:", error)
          if (!marcas.length) {
            setMarcas(MOCK_MARCAS)
          }
        }
      } catch (error) {
        console.error("Error cargando datos iniciales:", error)
        loadMockData()
      } finally {
        setLoadingData(false)
      }
    }

    if (id) {
      fetchInitialData()
    }
  }, [id])

  useEffect(() => {
    const fetchReferencias = async () => {
      if (formData.referencia_id) {
        try {
          const referenciasResponse = await makeRequest(`/referencias?marca_id=${formData.referencia_id}`)
          const referenciasData = Array.isArray(referenciasResponse)
            ? referenciasResponse
            : referenciasResponse?.data || []
          setReferencias(referenciasData)
        } catch (error) {
          console.error("Error cargando referencias:", error)
          const mockRefs = MOCK_REFERENCIAS[formData.referencia_id] || []
          setReferencias(mockRefs)
        }
      } else {
        setReferencias([])
      }
    }

    fetchReferencias()
  }, [formData.referencia_id])

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
        }

        if (!formData.tipo_vehiculo.trim()) {
          newErrors.tipo_vehiculo = "El tipo de vehículo es obligatorio"
        }
        break

      case 2:
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

    if (name === "placa") {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    } else if (name === "referencia_id") {
      setFormData((prev) => ({
        ...prev,
        referencia_id: "",
      }))
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

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
        color: formData.color,
        tipo_vehiculo: formData.tipo_vehiculo,
        referencia_id: Number.parseInt(formData.referencia_id),
        estado: formData.estado,
      }

      await makeRequest(`/vehiculos/cliente/editar/${id}`, {
        method: "PUT",
        body: JSON.stringify(vehiculoData),
      })

      alert("¡Vehículo actualizado exitosamente!")
      navigate("/client/vehiculos")
    } catch (error) {
      console.error("Error actualizando el vehículo:", error)
      alert("Error al actualizar el vehículo. Por favor intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const getSelectedReferencia = () => {
    return referencias.find((r) => r.id === Number.parseInt(formData.referencia_id))
  }

  if (loadingData) {
    return (
      <div className="crearCita-container">
        <div className="crearCita-header">
          <div className="crearCita-headerContent">
            <div className="crearCita-iconContainer">
              <FaCar className="crearCita-icon" />
            </div>
            <div className="crearCita-titleSection">
              <h1 className="crearCita-title">Editar Vehículo</h1>
              <p className="crearCita-subtitle">Cargando datos...</p>
            </div>
          </div>
        </div>
        <div className="crearCita-content">
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <FaSpinner className="spinning" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#0ea5e9" }} />
            <p>Cargando información del vehículo...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!vehiculoOriginal) {
    return (
      <div className="crearCita-container">
        <div className="crearCita-header">
          <div className="crearCita-headerContent">
            <div className="crearCita-iconContainer">
              <FaCar className="crearCita-icon" />
            </div>
            <div className="crearCita-titleSection">
              <h1 className="crearCita-title">Vehículo no encontrado</h1>
            </div>
          </div>
          <button type="button" onClick={() => navigate("/client/vehiculos")} className="crearCita-backButton">
            <FaArrowLeft /> Volver
          </button>
        </div>
        <div className="crearCita-content">
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <FaExclamationTriangle style={{ fontSize: "3rem", marginBottom: "1rem", color: "#ef4444" }} />
            <h3>No se pudo cargar el vehículo</h3>
            <p>El vehículo solicitado no existe o no tienes permisos para editarlo.</p>
            <button
              onClick={() => navigate("/client/vehiculos")}
              style={{
                marginTop: "1rem",
                background: "#0ea5e9",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "0.75rem 1.5rem",
                cursor: "pointer",
              }}
            >
              Volver a Mis Vehículos
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="crearCita-container">
      <div className="crearCita-header">
        <div className="crearCita-headerContent">
          <div className="crearCita-iconContainer">
            <FaCar className="crearCita-icon" />
          </div>
          <div className="crearCita-titleSection">
            <h1 className="crearCita-title">Editar Vehículo</h1>
            <p className="crearCita-subtitle">
              {vehiculoOriginal?.placa} - {vehiculoOriginal?.marca_nombre} {vehiculoOriginal?.referencia_nombre}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => navigate("/client/vehiculos")} className="crearCita-backButton">
          <FaArrowLeft /> Volver
        </button>
      </div>

      <div className="step-indicator" style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
        {[1, 2].map((step) => (
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
            {step < 2 && (
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

      <div className="crearCita-content">
        <div className="crearCita-mainCard">
          {currentStep === 1 && (
            <div className="crearCita-form-section">
              <h2 className="crearCita-section-title">
                <FaInfoCircle className="crearCita-section-icon" />
                Información Básica
              </h2>

              <div className="crearCita-form-group">
                <label className="crearCita-label">
                  <FaCar className="crearCita-label-icon" />
                  Placa del vehículo *
                </label>
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handleInputChange}
                  placeholder="ABC123"
                  maxLength="6"
                  className={`crearCita-form-input ${errors.placa ? "error" : ""}`}
                />
                {errors.placa && (
                  <span className="crearCita-error-text">
                    <FaExclamationTriangle />
                    {errors.placa}
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="crearCita-form-group">
                  <label className="crearCita-label">Color *</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="Blanco, Azul, Negro..."
                    className={`crearCita-form-input ${errors.color ? "error" : ""}`}
                  />
                  {errors.color && (
                    <span className="crearCita-error-text">
                      <FaExclamationTriangle />
                      {errors.color}
                    </span>
                  )}
                </div>

                <div className="crearCita-form-group">
                  <label className="crearCita-label">Tipo de Vehículo *</label>
                  <select
                    name="tipo_vehiculo"
                    value={formData.tipo_vehiculo}
                    onChange={handleInputChange}
                    className={`crearCita-form-input ${errors.tipo_vehiculo ? "error" : ""}`}
                  >
                    <option value="">Seleccione el tipo</option>
                    <option value="Automóvil">Automóvil</option>
                    <option value="Moto">Motocicleta</option>
                    <option value="SUV">SUV</option>
                    <option value="Camioneta">Camioneta</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                  {errors.tipo_vehiculo && (
                    <span className="crearCita-error-text">
                      <FaExclamationTriangle />
                      {errors.tipo_vehiculo}
                    </span>
                  )}
                </div>
              </div>

              <div className="crearCita-form-group">
                <label className="crearCita-label">Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="crearCita-form-input"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="crearCita-form-section">
              <h2 className="crearCita-section-title">
                <FaCogs className="crearCita-section-icon" />
                Marca y Modelo
              </h2>

              <div className="crearCita-form-group">
                <label className="crearCita-label">Modelo *</label>
                <select
                  name="referencia_id"
                  value={formData.referencia_id}
                  onChange={handleInputChange}
                  className={`crearCita-form-input ${errors.referencia_id ? "error" : ""}`}
                >
                  <option value="">Seleccione un modelo</option>
                  {referencias.map((referencia) => (
                    <option key={referencia.id} value={referencia.id}>
                      {referencia.nombre}
                    </option>
                  ))}
                </select>
                {errors.referencia_id && (
                  <span className="crearCita-error-text">
                    <FaExclamationTriangle />
                    {errors.referencia_id}
                  </span>
                )}
              </div>

              {formData.referencia_id && (
                <div
                  style={{
                    backgroundColor: "#f0f9ff",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #0ea5e9",
                    marginTop: "1rem",
                  }}
                >
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "#0369a1" }}>Vehículo actualizado:</h4>
                  <p style={{ margin: 0, color: "#0369a1" }}>
                    <strong>
                      {getSelectedReferencia()?.nombre} - {formData.tipo_vehiculo}
                    </strong>
                  </p>
                  <p style={{ margin: "0.25rem 0 0 0", color: "#0369a1", fontSize: "0.9rem" }}>
                    Placa: {formData.placa} | Color: {formData.color} | Estado: {formData.estado}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="crearCita-form-actions">
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="crearCita-cancel-button">
                <FaArrowLeft className="crearCita-button-icon" />
                Anterior
              </button>
            )}

            {currentStep < 2 ? (
              <button type="button" onClick={nextStep} className="crearCita-submit-button">
                Siguiente
                <FaArrowRight className="crearCita-button-icon" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} className="crearCita-submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <div className="crearCita-spinner spinning"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <FaCheck className="crearCita-button-icon" />
                    Actualizar Vehículo
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

export default EditarVehiculo

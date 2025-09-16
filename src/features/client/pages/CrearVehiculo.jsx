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
  const [allReferencias, setAllReferencias] = useState([])
  const [referencias, setReferencias] = useState([])
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    placa: "",
    color: "",
    tipo_vehiculo: "",
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

        // Cargar todas las referencias una vez, como en el panel de admin
        const referenciasResponse = await makeRequest("/referencias")
        const referenciasData =
          Array.isArray(referenciasResponse) ? referenciasResponse : referenciasResponse?.data || []
        setAllReferencias(referenciasData)
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

  const validateForm = () => {
    const newErrors = {}

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

    if (!formData.referencia_id) {
      newErrors.referencia_id = "Debe seleccionar un modelo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => {
      let processedValue = value

      if (name === "placa") {
        processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "")
      } else if (name === "color") {
        processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "")
      }

      const newState = {
        ...prev,
        [name]: processedValue,
      }

      if (name === "tipo_vehiculo") {
        newState.referencia_id = "" // Resetear referencia cuando cambia la marca o el tipo
      }

      return newState
    })

    // Limpiar el error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Campos Incompletos",
        text: "Por favor, revisa y completa todos los campos obligatorios.",
        confirmButtonColor: "#f59e0b",
      })
      return
    }

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

  // Filtrar referencias en el frontend, igual que en el panel de admin
  const referenciasFiltradas = formData.tipo_vehiculo
    ? allReferencias.filter(
        (ref) => ref.tipo_vehiculo === formData.tipo_vehiculo || ref.categoria === formData.tipo_vehiculo,
      )
    : []

  return (
    <div className="cvc-crear-container">
      {/* Header */}
      <div className="cvc-crear-header">
        <div className="cvc-crear-header-content">
          <div className="cvc-crear-icon-container">
            <FaCar className="cvc-crear-icon" />
          </div>
          <div className="cvc-crear-title-section">
            <h1 className="cvc-crear-page-title">Registrar Nuevo Vehículo</h1>
          </div>
        </div>
        <button type="button" onClick={() => navigate(-1)} className="cvc-crear-back-button">
          <FaArrowLeft /> Volver
        </button>
      </div>

      <div className="cvc-crear-content">
        <form onSubmit={handleSubmit} className="cvc-crear-main-card">
          <div className="cvc-crear-form-section">
            <h2 className="cvc-crear-section-title">
              <FaInfoCircle className="cvc-crear-section-icon" />
              Información del Vehículo
            </h2>
            <div className="cvc-crear-form-grid">
              <div className="cvc-crear-form-group">
                <label htmlFor="placa" className="cvc-crear-label ">
                  Placa *
                </label>
                <input
                  id="placa"
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handleInputChange}
                  placeholder="Ej: ABC123"
                  maxLength="6"
                  className={`cvc-crear-form-input-l ${errors.placa ? "error" : ""}`}
                />
                {errors.placa && <span className="cvc-crear-error-text">{errors.placa}</span>}
              </div>

              <div className="cvc-crear-form-group">
                <label htmlFor="color" className="cvc-crear-label">
                  Color *
                </label>
                <input
                  id="color"
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Ej: Negro"
                  maxLength="30"
                  className={`cvc-crear-form-input-l ${errors.color ? "error" : ""}`}
                />
                {errors.color && <span className="cvc-crear-error-text">{errors.color}</span>}
              </div>

              <div className="cvc-crear-form-group">
                <label htmlFor="tipo_vehiculo" className="cvc-crear-label">
                  Tipo de Vehículo *
                </label>
                <select
                  id="tipo_vehiculo"
                  name="tipo_vehiculo"
                  value={formData.tipo_vehiculo}
                  onChange={handleInputChange}
                  className={`cvc-crear-form-input ${errors.tipo_vehiculo ? "error" : ""}`}
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="Carro">Carro</option>
                  <option value="Moto">Moto</option>
                  <option value="Camioneta">Camioneta</option>
                </select>
                {errors.tipo_vehiculo && <span className="cvc-crear-error-text">{errors.tipo_vehiculo}</span>}
              </div>

              <div className="cvc-crear-form-group">
                <label htmlFor="referencia_id" className="cvc-crear-label">
                  Modelo / Referencia *
                </label>
                <select
                  id="referencia_id"
                  name="referencia_id"
                  value={formData.referencia_id}
                  onChange={handleInputChange}
                  disabled={!formData.tipo_vehiculo || referenciasFiltradas.length === 0}
                  className={`cvc-crear-form-input ${errors.referencia_id ? "error" : ""}`}
                >
                  <option value="">
                    {!formData.tipo_vehiculo
                      ? "Seleccione un tipo de vehículo"
                      : "Seleccione un modelo"}
                  </option>
                  {referenciasFiltradas.map((referencia) => (
                    <option key={referencia.id} value={referencia.id}>
                      {referencia.nombre}
                    </option>
                  ))}
                </select>
                {errors.referencia_id && <span className="cvc-crear-error-text">{errors.referencia_id}</span>}
              </div>
            </div>
          </div>
            <div className="cvc-crear-form-actions">
            <button type="submit" className="cvc-crear-submit-button" disabled={loading}>
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
          </div>
        </form>
      </div>
    </div>
  )
}

export default CrearVehiculo

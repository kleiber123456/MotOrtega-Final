"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import "../../../../shared/styles/Citas/CrearCita.css"
import { FaCalendarAlt, FaClock, FaUser, FaCar, FaTools, FaClipboardList, FaArrowLeft } from "react-icons/fa"

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const CrearCita = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    observaciones: "",
    estado_cita_id: 1, // Por defecto: Pendiente
    vehiculo_id: "",
    mecanico_id: "",
  })

  const [clientes, setClientes] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [mecanicos, setMecanicos] = useState([])
  const [estados, setEstados] = useState([])
  const [selectedCliente, setSelectedCliente] = useState("")
  const [vehiculosFiltrados, setVehiculosFiltrados] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [horasDisponibles, setHorasDisponibles] = useState([])

  // Función para realizar peticiones a la API con el token de autenticación
  const makeRequest = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token disponible")
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
        ...options,
      }

      const response = await axios(`${API_BASE_URL}${endpoint}`, config)
      return response
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error)
      throw error
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedCliente) {
      fetchVehiculosPorCliente(selectedCliente)
    } else {
      setVehiculosFiltrados([])
    }
  }, [selectedCliente])

  useEffect(() => {
    if (formData.fecha && formData.mecanico_id) {
      verificarDisponibilidad()
    }
  }, [formData.fecha, formData.mecanico_id])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Obtener clientes
      const clientesRes = await makeRequest("/clientes")
      if (clientesRes.data && Array.isArray(clientesRes.data)) {
        setClientes(clientesRes.data)
      } else if (clientesRes.data && Array.isArray(clientesRes.data.data)) {
        setClientes(clientesRes.data.data)
      } else {
        console.error("La respuesta de clientes no es un array:", clientesRes.data)
        setClientes([])
      }

      // Obtener vehículos
      const vehiculosRes = await makeRequest("/vehiculos")
      if (vehiculosRes.data && Array.isArray(vehiculosRes.data)) {
        setVehiculos(vehiculosRes.data)
      } else if (vehiculosRes.data && Array.isArray(vehiculosRes.data.data)) {
        setVehiculos(vehiculosRes.data.data)
      } else {
        console.error("La respuesta de vehículos no es un array:", vehiculosRes.data)
        setVehiculos([])
      }

      // Obtener mecánicos
      const mecanicosRes = await makeRequest("/mecanicos")
      if (mecanicosRes.data && Array.isArray(mecanicosRes.data)) {
        setMecanicos(mecanicosRes.data)
      } else if (mecanicosRes.data && Array.isArray(mecanicosRes.data.data)) {
        setMecanicos(mecanicosRes.data.data)
      } else {
        console.error("La respuesta de mecánicos no es un array:", mecanicosRes.data)
        setMecanicos([])
      }

      // Obtener estados de cita
      const estadosRes = await makeRequest("/estados-cita")
      if (estadosRes.data && Array.isArray(estadosRes.data)) {
        setEstados(estadosRes.data)
      } else if (estadosRes.data && Array.isArray(estadosRes.data.data)) {
        setEstados(estadosRes.data.data)
      } else {
        console.error("La respuesta de estados no es un array:", estadosRes.data)
        setEstados([])
      }

      setLoading(false)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar los datos necesarios")
      setClientes([])
      setVehiculos([])
      setMecanicos([])
      setEstados([])
      setLoading(false)
    }
  }

  const fetchVehiculosPorCliente = async (clienteId) => {
    try {
      const response = await makeRequest(`/vehiculos/cliente/${clienteId}`)
      if (response.data && Array.isArray(response.data)) {
        setVehiculosFiltrados(response.data)
      } else if (response.data && Array.isArray(response.data.data)) {
        setVehiculosFiltrados(response.data.data)
      } else {
        console.error("La respuesta de vehículos por cliente no es un array:", response.data)
        setVehiculosFiltrados([])
        toast.error("Error al cargar los vehículos del cliente")
      }
    } catch (error) {
      console.error("Error al cargar vehículos del cliente:", error)
      toast.error("Error al cargar los vehículos del cliente")
      setVehiculosFiltrados([])
    }
  }

  const verificarDisponibilidad = async () => {
    try {
      console.log("Verificando disponibilidad para:", formData.fecha, formData.mecanico_id)
      const response = await makeRequest(`/citas/disponibilidad/mecanicos`, {
        params: {
          fecha: formData.fecha,
          hora: formData.hora || "08:00",
        },
      })

      console.log("Respuesta de disponibilidad:", response.data)

      if (response.data) {
        if (Array.isArray(response.data)) {
          const mecanico = response.data.find((m) => m.id === Number.parseInt(formData.mecanico_id))
          if (mecanico && Array.isArray(mecanico.horasDisponibles)) {
            setHorasDisponibles(mecanico.horasDisponibles)
          } else {
            setHorasDisponibles([])
          }
        } else if (response.data.data && Array.isArray(response.data.data)) {
          const mecanico = response.data.data.find((m) => m.id === Number.parseInt(formData.mecanico_id))
          if (mecanico && Array.isArray(mecanico.horasDisponibles)) {
            setHorasDisponibles(mecanico.horasDisponibles)
          } else {
            setHorasDisponibles([])
          }
        } else {
          console.error("La respuesta de disponibilidad no tiene el formato esperado:", response.data)
          setHorasDisponibles([])
        }
      } else {
        setHorasDisponibles([])
      }
    } catch (error) {
      console.error("Error al verificar disponibilidad:", error)
      setHorasDisponibles([])
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fecha) {
      newErrors.fecha = "La fecha es requerida"
    } else {
      const fechaObj = new Date(formData.fecha)
      if (fechaObj.getDay() === 0) {
        newErrors.fecha = "No se pueden programar citas los domingos"
      }
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      if (fechaObj < hoy) {
        newErrors.fecha = "No se pueden programar citas en fechas pasadas"
      }
    }

    if (!formData.hora) {
      newErrors.hora = "La hora es requerida"
    } else {
      const hora = Number.parseInt(formData.hora.split(":")[0])
      if (hora < 8 || hora >= 18) {
        newErrors.hora = "Las citas solo pueden programarse entre 8:00 AM y 6:00 PM"
      }
    }

    if (!formData.vehiculo_id) {
      newErrors.vehiculo_id = "Debe seleccionar un vehículo"
    }

    if (!formData.mecanico_id) {
      newErrors.mecanico_id = "Debe seleccionar un mecánico"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const handleClienteChange = (e) => {
    setSelectedCliente(e.target.value)
    setFormData({
      ...formData,
      vehiculo_id: "",
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Por favor corrija los errores en el formulario")
      return
    }

    try {
      setLoading(true)
      console.log("Enviando datos de cita:", formData)

      const response = await makeRequest("/citas", {
        method: "POST",
        data: formData,
      })

      console.log("Respuesta de creación de cita:", response.data)
      toast.success("Cita creada correctamente")
      navigate("/citas")
    } catch (error) {
      console.error("Error al crear la cita:", error)

      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`)
      } else if (error.response && typeof error.response.data === "string") {
        toast.error(`Error: ${error.response.data}`)
      } else if (error.message) {
        toast.error(`Error: ${error.message}`)
      } else {
        toast.error("Error al crear la cita")
      }

      setLoading(false)
    }
  }

  const generarHorasSelect = () => {
    const horas = []
    for (let i = 8; i < 18; i++) {
      const hora = `${i.toString().padStart(2, "0")}:00`
      horas.push(hora)
    }
    return horas
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
            <h1 className="crearCita-title">Crear Nueva Cita</h1>
            <p className="crearCita-subtitle">Programa una nueva cita para el cliente</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate("/citas")} className="crearCita-backButton">
          <FaArrowLeft /> Volver
        </button>
      </div>

      {/* Contenido principal */}
      <div className="crearCita-content">
        {/* Formulario principal */}
        <div className="crearCita-mainCard">
          {loading ? (
            <div className="crearCita-loading">
              <div className="crearCita-spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="crearCita-form">
              {/* Información de la Cita */}
              <div className="crearCita-section">
                <h2 className="crearCita-sectionTitle">
                  <FaCalendarAlt /> Información de la Cita
                </h2>

                <div className="crearCita-row">
                  <div className="crearCita-field">
                    <label className="crearCita-label">
                      <FaCalendarAlt /> Fecha *
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={`crearCita-input ${errors.fecha ? "crearCita-inputError" : ""}`}
                    />
                    {errors.fecha && <span className="crearCita-error">{errors.fecha}</span>}
                  </div>

                  <div className="crearCita-field">
                    <label className="crearCita-label">
                      <FaClock /> Hora *
                    </label>
                    <select
                      name="hora"
                      value={formData.hora}
                      onChange={handleChange}
                      className={`crearCita-input ${errors.hora ? "crearCita-inputError" : ""}`}
                      disabled={!formData.fecha || !formData.mecanico_id}
                    >
                      <option value="">Seleccione una hora</option>
                      {horasDisponibles.length > 0
                        ? horasDisponibles.map((hora) => (
                            <option key={hora} value={hora}>
                              {hora}
                            </option>
                          ))
                        : generarHorasSelect().map((hora) => (
                            <option key={hora} value={hora}>
                              {hora}
                            </option>
                          ))}
                    </select>
                    {errors.hora && <span className="crearCita-error">{errors.hora}</span>}
                    {formData.fecha && formData.mecanico_id && horasDisponibles.length === 0 && (
                      <span className="crearCita-info">
                        No hay horas disponibles para este mecánico en la fecha seleccionada
                      </span>
                    )}
                  </div>
                </div>

                <div className="crearCita-field">
                  <label className="crearCita-label">
                    <FaClipboardList /> Estado
                  </label>
                  <select
                    name="estado_cita_id"
                    value={formData.estado_cita_id}
                    onChange={handleChange}
                    className="crearCita-input"
                  >
                    {Array.isArray(estados) ? (
                      estados.map((estado) => (
                        <option key={estado.id} value={estado.id}>
                          {estado.nombre}
                        </option>
                      ))
                    ) : (
                      <option value="1">Pendiente</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Cliente y Vehículo */}
              <div className="crearCita-section">
                <h2 className="crearCita-sectionTitle">
                  <FaUser /> Cliente y Vehículo
                </h2>

                <div className="crearCita-field">
                  <label className="crearCita-label">
                    <FaUser /> Cliente *
                  </label>
                  <select
                    name="cliente"
                    value={selectedCliente}
                    onChange={handleClienteChange}
                    className="crearCita-input"
                  >
                    <option value="">Seleccione un cliente</option>
                    {Array.isArray(clientes) &&
                      clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.apellido} - {cliente.documento}
                        </option>
                      ))}
                  </select>
                  <button type="button" onClick={() => navigate("/CrearClientes")} className="crearCita-linkButton">
                    Registrar nuevo cliente
                  </button>
                </div>

                <div className="crearCita-field">
                  <label className="crearCita-label">
                    <FaCar /> Vehículo *
                  </label>
                  <select
                    name="vehiculo_id"
                    value={formData.vehiculo_id}
                    onChange={handleChange}
                    className={`crearCita-input ${errors.vehiculo_id ? "crearCita-inputError" : ""}`}
                    disabled={!selectedCliente}
                  >
                    <option value="">Seleccione un vehículo</option>
                    {Array.isArray(vehiculosFiltrados) &&
                      vehiculosFiltrados.map((vehiculo) => (
                        <option key={vehiculo.id} value={vehiculo.id}>
                          {vehiculo.placa} - {vehiculo.referencia?.marca?.nombre || ""}{" "}
                          {vehiculo.referencia?.nombre || ""}
                        </option>
                      ))}
                  </select>
                  <button type="button" onClick={() => navigate("/vehiculos/crear")} className="crearCita-linkButton">
                    Registrar nuevo vehículo
                  </button>
                  {errors.vehiculo_id && <span className="crearCita-error">{errors.vehiculo_id}</span>}
                  {selectedCliente && (!Array.isArray(vehiculosFiltrados) || vehiculosFiltrados.length === 0) && (
                    <span className="crearCita-info">Este cliente no tiene vehículos registrados</span>
                  )}
                </div>
              </div>

              {/* Mecánico y Observaciones */}
              <div className="crearCita-section">
                <h2 className="crearCita-sectionTitle">
                  <FaTools /> Mecánico y Observaciones
                </h2>

                <div className="crearCita-field">
                  <label className="crearCita-label">
                    <FaTools /> Mecánico *
                  </label>
                  <select
                    name="mecanico_id"
                    value={formData.mecanico_id}
                    onChange={handleChange}
                    className={`crearCita-input ${errors.mecanico_id ? "crearCita-inputError" : ""}`}
                  >
                    <option value="">Seleccione un mecánico</option>
                    {Array.isArray(mecanicos) &&
                      mecanicos.map((mecanico) => (
                        <option key={mecanico.id} value={mecanico.id}>
                          {mecanico.nombre} {mecanico.apellido}
                        </option>
                      ))}
                  </select>
                  {errors.mecanico_id && <span className="crearCita-error">{errors.mecanico_id}</span>}
                </div>

                <div className="crearCita-field">
                  <label className="crearCita-label">Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Ingrese observaciones o detalles adicionales sobre la cita"
                    className="crearCita-textarea"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="crearCita-actions">
                <button type="button" onClick={() => navigate("/citas")} className="crearCita-cancelButton">
                  Cancelar
                </button>
                <button type="submit" className="crearCita-submitButton" disabled={loading}>
                  {loading ? "Guardando..." : "Crear Cita"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Card de información lateral */}
        <div className="crearCita-infoCard">
          <div className="crearCita-infoHeader">
            <FaCalendarAlt className="crearCita-infoIcon" />
            <h3 className="crearCita-infoTitle">Información de la Cita</h3>
          </div>
          <div className="crearCita-infoContent">
            <div className="crearCita-infoItem">
              <strong>Horario Laboral:</strong>
              <p>Lunes a Sábado</p>
              <p>8:00 AM - 6:00 PM</p>
            </div>
            <div className="crearCita-infoItem">
              <strong>No laborable:</strong>
              <p>Domingos</p>
            </div>
            <div className="crearCita-infoItem">
              <strong>Nota:</strong>
              <p className="crearCita-infoNote">
                Las citas se programan por horas completas. Asegúrese de que el cliente y vehículo estén registrados
                antes de crear la cita.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrearCita

"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaCar,
  FaIdCard,
  FaPalette,
  FaUser,
  FaCogs,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaSearch,
} from "react-icons/fa"
import Swal from "sweetalert2"
import axios from "axios"
import "../../../../shared/styles/crearVehiculo.css"

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Función para obtener token
const getValidToken = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  if (!token) {
    console.error("No hay token disponible")
    return null
  }
  return token
}

// Hook personalizado para manejo de API
const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const makeRequest = useCallback(async (url, options = {}) => {
    setLoading(true)
    setError(null)

    const token = getValidToken()
    if (!token) {
      setError("Error de autenticación")
      setLoading(false)
      return null
    }

    try {
      const response = await axios({
        url: `${API_BASE_URL}${url}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        ...options,
      })

      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { makeRequest, loading, error }
}

const CrearVehiculo = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [formulario, setFormulario] = useState({
    placa: "",
    color: "",
    tipo_vehiculo: "Carro",
    referencia_id: "",
    cliente_id: "",
    estado: "Activo",
  })

  const [referencias, setReferencias] = useState([])
  const [clientes, setClientes] = useState([])
  const [errores, setErrores] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalReferencia, setModalReferencia] = useState(false)
  const [modalCliente, setModalCliente] = useState(false)
  const [referenciaSeleccionada, setReferenciaSeleccionada] = useState(null)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [busquedaReferencia, setBusquedaReferencia] = useState("")
  const [busquedaCliente, setBusquedaCliente] = useState("")

  // Cargar datos iniciales
  useEffect(() => {
    cargarReferencias()
    cargarClientes()
  }, [])

  const cargarReferencias = async () => {
    try {
      const data = await makeRequest("/referencias")
      if (data) {
        setReferencias(data)
      }
    } catch (error) {
      console.error("Error al cargar referencias:", error)
    }
  }

  const cargarClientes = async () => {
    try {
      const data = await makeRequest("/clientes")
      if (data) {
        setClientes(data)
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error)
    }
  }

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
    validarCampo(name, value)
  }, [])

  const validarCampo = useCallback((name, value) => {
    let nuevoError = ""

    switch (name) {
      case "placa":
        if (!value.trim()) {
          nuevoError = "La placa es obligatoria."
        } else if (!/^[A-Z0-9]{6}$/.test(value)) {
          nuevoError = "La placa debe tener exactamente 6 caracteres alfanuméricos."
        }
        break
      case "color":
        if (!value.trim()) {
          nuevoError = "El color es obligatorio."
        } else if (value.trim().length < 3) {
          nuevoError = "El color debe tener al menos 3 caracteres."
        }
        break
      case "tipo_vehiculo":
        if (!value) {
          nuevoError = "Selecciona un tipo de vehículo."
        }
        break
      case "referencia_id":
        if (!value) {
          nuevoError = "Debe seleccionar una referencia."
        }
        break
      case "cliente_id":
        if (!value) {
          nuevoError = "Debe seleccionar un cliente."
        }
        break
    }

    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
  }, [])

  const validarFormulario = useCallback(() => {
    const nuevosErrores = {}

    Object.keys(formulario).forEach((key) => {
      validarCampo(key, formulario[key])
    })

    return Object.keys(errores).every((key) => !errores[key])
  }, [formulario, errores, validarCampo])

  // Función para permitir solo números y letras
  const soloLetrasYNumeros = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
  }, [])

  // Función para permitir solo letras
  const soloLetras = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "")
  }, [])

  const handleSeleccionarReferencia = (referencia) => {
    setReferenciaSeleccionada(referencia)
    setFormulario((prev) => ({ ...prev, referencia_id: referencia.id }))
    validarCampo("referencia_id", referencia.id)
    setModalReferencia(false)
  }

  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente)
    setFormulario((prev) => ({ ...prev, cliente_id: cliente.id }))
    validarCampo("cliente_id", cliente.id)
    setModalCliente(false)
  }

  const referenciasFiltradas = referencias.filter((ref) => {
    const textoBusqueda = busquedaReferencia.toLowerCase()
    const coincideTipo = ref.tipo_vehiculo === formulario.tipo_vehiculo || ref.categoria === formulario.tipo_vehiculo
    const coincideBusqueda =
      ref.nombre?.toLowerCase().includes(textoBusqueda) ||
      ref.marca_nombre?.toLowerCase().includes(textoBusqueda) ||
      ref.descripcion?.toLowerCase().includes(textoBusqueda)

    return coincideTipo && coincideBusqueda
  })

  const clientesFiltrados = clientes.filter((cliente) => {
    const textoBusqueda = busquedaCliente.toLowerCase()
    return (
      cliente.nombre?.toLowerCase().includes(textoBusqueda) ||
      cliente.apellido?.toLowerCase().includes(textoBusqueda) ||
      cliente.documento?.toLowerCase().includes(textoBusqueda) ||
      cliente.telefono?.toLowerCase().includes(textoBusqueda) ||
      cliente.correo?.toLowerCase().includes(textoBusqueda)
    )
  })

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
        // Verificar si la placa ya existe
        const vehiculosExistentes = await makeRequest("/vehiculos")
        const placaExiste = vehiculosExistentes?.find((v) => v.placa === formulario.placa)

        if (placaExiste) {
          await Swal.fire({
            icon: "warning",
            title: "Placa duplicada",
            text: "Ya existe un vehículo con esta placa.",
            confirmButtonColor: "#ef4444",
          })
          return
        }

        await makeRequest("/vehiculos", {
          method: "POST",
          data: {
            ...formulario,
            estado: formulario.estado.toLowerCase(),
          },
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Vehículo creado correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/vehiculos")
      } catch (error) {
        console.error("Error al crear vehículo:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo crear el vehículo",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formulario, validarFormulario, makeRequest, navigate],
  )

  const handleCancel = useCallback(async () => {
    const hasData = Object.values(formulario).some((value) => value !== "" && value !== "Carro" && value !== "Activo")

    if (hasData) {
      const result = await Swal.fire({
        title: "¿Cancelar creación?",
        text: "Se perderán todos los datos ingresados",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Continuar editando",
      })

      if (result.isConfirmed) {
        navigate("/vehiculos")
      }
    } else {
      navigate("/vehiculos")
    }
  }, [formulario, navigate])

  return (
    <div className="crearVehiculo-container">
      <div className="crearVehiculo-header">
        <h1 className="crearVehiculo-page-title">
          <FaCar className="crearVehiculo-title-icon" />
          Crear Vehículo
        </h1>
        <p className="crearVehiculo-subtitle">Registra un nuevo vehículo en el sistema</p>
      </div>

      <form className="crearVehiculo-form" onSubmit={handleSubmit}>
        <div className="crearVehiculo-form-section">
          <h3 className="crearVehiculo-section-title">
            <FaCar className="crearVehiculo-section-icon" />
            Información del Vehículo
          </h3>
          <div className="crearVehiculo-form-grid">
            <div className="crearVehiculo-form-group">
              <label htmlFor="placa" className="crearVehiculo-label">
                <FaIdCard className="crearVehiculo-label-icon" />
                Placa *
              </label>
              <input
                type="text"
                id="placa"
                name="placa"
                value={formulario.placa}
                onChange={handleChange}
                onInput={soloLetrasYNumeros}
                maxLength={6}
                autoComplete="off"
                className={`crearVehiculo-form-input ${errores.placa ? "error" : ""}`}
                placeholder="ABC123"
                required
              />
              {errores.placa && (
                <span className="crearVehiculo-error-text">
                  <FaExclamationTriangle /> {errores.placa}
                </span>
              )}
            </div>

            <div className="crearVehiculo-form-group">
              <label htmlFor="color" className="crearVehiculo-label">
                <FaPalette className="crearVehiculo-label-icon" />
                Color *
              </label>
              <input
                type="text"
                id="color"
                name="color"
                value={formulario.color}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={45}
                autoComplete="off"
                className={`crearVehiculo-form-input ${errores.color ? "error" : ""}`}
                placeholder="Rojo"
                required
              />
              {errores.color && (
                <span className="crearVehiculo-error-text">
                  <FaExclamationTriangle /> {errores.color}
                </span>
              )}
            </div>

            <div className="crearVehiculo-form-group">
              <label htmlFor="tipo_vehiculo" className="crearVehiculo-label">
                <FaCar className="crearVehiculo-label-icon" />
                Tipo de Vehículo *
              </label>
              <select
                id="tipo_vehiculo"
                name="tipo_vehiculo"
                value={formulario.tipo_vehiculo}
                onChange={handleChange}
                className={`crearVehiculo-form-input ${errores.tipo_vehiculo ? "error" : ""}`}
                required
              >
                <option value="Carro">Carro</option>
                <option value="Moto">Moto</option>
                <option value="Camioneta">Camioneta</option>
              </select>
              {errores.tipo_vehiculo && (
                <span className="crearVehiculo-error-text">
                  <FaExclamationTriangle /> {errores.tipo_vehiculo}
                </span>
              )}
            </div>

            <div className="crearVehiculo-form-group">
              <label htmlFor="referencia" className="crearVehiculo-label">
                <FaCogs className="crearVehiculo-label-icon" />
                Referencia *
              </label>
              <div className="crearVehiculo-input-with-button">
                <input
                  type="text"
                  value={
                    referenciaSeleccionada
                      ? `${referenciaSeleccionada.marca_nombre ? referenciaSeleccionada.marca_nombre + " - " : ""}${referenciaSeleccionada.nombre}`
                      : ""
                  }
                  placeholder={`Seleccionar referencia de ${formulario.tipo_vehiculo.toLowerCase()}`}
                  readOnly
                  className={`crearVehiculo-form-input ${errores.referencia_id ? "error" : ""}`}
                  required
                />
                <button type="button" className="crearVehiculo-search-button" onClick={() => setModalReferencia(true)}>
                  <FaSearch />
                </button>
              </div>
              {errores.referencia_id && (
                <span className="crearVehiculo-error-text">
                  <FaExclamationTriangle /> {errores.referencia_id}
                </span>
              )}
            </div>

            <div className="crearVehiculo-form-group">
              <label htmlFor="cliente" className="crearVehiculo-label">
                <FaUser className="crearVehiculo-label-icon" />
                Cliente *
              </label>
              <div className="crearVehiculo-input-with-button">
                <input
                  type="text"
                  value={clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` : ""}
                  placeholder="Seleccionar cliente"
                  readOnly
                  className={`crearVehiculo-form-input ${errores.cliente_id ? "error" : ""}`}
                  required
                />
                <button type="button" className="crearVehiculo-search-button" onClick={() => setModalCliente(true)}>
                  <FaSearch />
                </button>
              </div>
              {errores.cliente_id && (
                <span className="crearVehiculo-error-text">
                  <FaExclamationTriangle /> {errores.cliente_id}
                </span>
              )}
            </div>

            <div className="crearVehiculo-form-group">
              <label htmlFor="estado" className="crearVehiculo-label">
                <FaCogs className="crearVehiculo-label-icon" />
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={formulario.estado}
                onChange={handleChange}
                className="crearVehiculo-form-input"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="crearVehiculo-form-actions">
          <button type="button" className="crearVehiculo-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="crearVehiculo-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearVehiculo-submit-button" disabled={isSubmitting || apiLoading}>
            {isSubmitting ? (
              <>
                <FaSpinner className="crearVehiculo-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="crearVehiculo-button-icon" />
                Guardar Vehículo
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal de Referencias */}
      {modalReferencia && (
        <div className="crearVehiculo-modal-overlay">
          <div className="crearVehiculo-modal-container">
            <div className="crearVehiculo-modal-header">
              <h3>Seleccionar Referencia - {formulario.tipo_vehiculo}</h3>
              <button className="crearVehiculo-modal-close" onClick={() => setModalReferencia(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="crearVehiculo-modal-content">
              <div className="crearVehiculo-modal-search">
                <div className="crearVehiculo-search-container">
                  <FaSearch className="crearVehiculo-search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, marca o descripción..."
                    value={busquedaReferencia}
                    onChange={(e) => setBusquedaReferencia(e.target.value)}
                    className="crearVehiculo-search-input"
                  />
                </div>
              </div>

              <div className="crearVehiculo-modal-list">
                {referenciasFiltradas.length > 0 ? (
                  <div className="crearVehiculo-referencias-grid">
                    {referenciasFiltradas.map((ref) => (
                      <div
                        key={ref.id}
                        className={`crearVehiculo-referencia-card ${referenciaSeleccionada?.id === ref.id ? "selected" : ""}`}
                        onClick={() => handleSeleccionarReferencia(ref)}
                      >
                        <div className="crearVehiculo-referencia-info">
                          <h4>{ref.nombre}</h4>
                          {ref.marca_nombre && <p className="crearVehiculo-marca">Marca: {ref.marca_nombre}</p>}
                          {ref.descripcion && <p className="crearVehiculo-descripcion">{ref.descripcion}</p>}
                          <span className="crearVehiculo-tipo-badge">{ref.tipo_vehiculo || ref.categoria}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="crearVehiculo-modal-empty">
                    {busquedaReferencia
                      ? `No se encontraron referencias que coincidan con "${busquedaReferencia}"`
                      : `No hay referencias disponibles para ${formulario.tipo_vehiculo}`}
                  </div>
                )}
              </div>
            </div>

            <div className="crearVehiculo-modal-footer">
              <button className="crearVehiculo-modal-cancel" onClick={() => setModalReferencia(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Clientes */}
      {modalCliente && (
        <div className="crearVehiculo-modal-overlay">
          <div className="crearVehiculo-modal-container">
            <div className="crearVehiculo-modal-header">
              <h3>Seleccionar Cliente</h3>
              <button className="crearVehiculo-modal-close" onClick={() => setModalCliente(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="crearVehiculo-modal-content">
              <div className="crearVehiculo-modal-search">
                <div className="crearVehiculo-search-container">
                  <FaSearch className="crearVehiculo-search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, documento, teléfono o correo..."
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    className="crearVehiculo-search-input"
                  />
                </div>
              </div>

              <div className="crearVehiculo-modal-list">
                {clientesFiltrados.length > 0 ? (
                  <div className="crearVehiculo-clientes-grid">
                    {clientesFiltrados.map((cliente) => (
                      <div
                        key={cliente.id}
                        className={`crearVehiculo-cliente-card ${clienteSeleccionado?.id === cliente.id ? "selected" : ""}`}
                        onClick={() => handleSeleccionarCliente(cliente)}
                      >
                        <div className="crearVehiculo-cliente-info">
                          <div className="crearVehiculo-cliente-avatar">
                            <FaUser />
                          </div>
                          <div className="crearVehiculo-cliente-details">
                            <h4>
                              {cliente.nombre} {cliente.apellido}
                            </h4>
                            <p className="crearVehiculo-documento">Doc: {cliente.documento}</p>
                            {cliente.telefono && <p className="crearVehiculo-telefono">Tel: {cliente.telefono}</p>}
                            {cliente.correo && <p className="crearVehiculo-correo">{cliente.correo}</p>}
                            <span className={`crearVehiculo-estado-badge ${cliente.estado?.toLowerCase()}`}>
                              {cliente.estado}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="crearVehiculo-modal-empty">
                    {busquedaCliente
                      ? `No se encontraron clientes que coincidan con "${busquedaCliente}"`
                      : "No hay clientes disponibles"}
                  </div>
                )}
              </div>
            </div>

            <div className="crearVehiculo-modal-footer">
              <button className="crearVehiculo-modal-cancel" onClick={() => setModalCliente(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CrearVehiculo

"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
  FaArrowLeft,
  FaSearch,
} from "react-icons/fa"
import Swal from "sweetalert2"
import axios from "axios"
import "../../../../shared/styles/Vehiculos/EditarVehiculo.css"

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

const EditarVehiculo = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [vehiculo, setVehiculo] = useState({
    placa: "",
    color: "",
    tipo_vehiculo: "",
    referencia_id: "",
    cliente_id: "",
    estado: "",
  })

  const [referencias, setReferencias] = useState([])
  const [clientes, setClientes] = useState([])
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalReferencia, setModalReferencia] = useState(false)
  const [modalCliente, setModalCliente] = useState(false)
  const [referenciaSeleccionada, setReferenciaSeleccionada] = useState(null)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [busquedaReferencia, setBusquedaReferencia] = useState("")
  const [busquedaCliente, setBusquedaCliente] = useState("")

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)

        // Cargar vehículo, referencias y clientes en paralelo
        const [vehiculoData, referenciaData, clienteData] = await Promise.all([
          makeRequest(`/vehiculos/${id}`),
          makeRequest("/referencias"),
          makeRequest("/clientes"),
        ])

        if (vehiculoData) {
          setVehiculo({
            placa: vehiculoData.placa || "",
            color: vehiculoData.color || "",
            tipo_vehiculo: vehiculoData.tipo_vehiculo || "",
            referencia_id: vehiculoData.referencia_id || "",
            cliente_id: vehiculoData.cliente_id || "",
            estado: vehiculoData.estado?.charAt(0).toUpperCase() + vehiculoData.estado?.slice(1) || "",
          })

          // Establecer referencia y cliente seleccionados
          if (vehiculoData.referencia_id) {
            setReferenciaSeleccionada({
              id: vehiculoData.referencia_id,
              nombre: vehiculoData.referencia_nombre,
              marca_nombre: vehiculoData.marca_nombre,
            })
          }

          if (vehiculoData.cliente_id) {
            setClienteSeleccionado({
              id: vehiculoData.cliente_id,
              nombre: vehiculoData.cliente_nombre?.split(" ")[0] || "",
              apellido: vehiculoData.cliente_nombre?.split(" ").slice(1).join(" ") || "",
            })
          }
        }

        if (referenciaData) {
          setReferencias(referenciaData)
        }

        if (clienteData) {
          setClientes(clienteData)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        Swal.fire("Error", "No se pudieron cargar los datos del vehículo", "error")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      cargarDatos()
    }
  }, [id, makeRequest])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setVehiculo((prev) => ({ ...prev, [name]: value }))
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

    // Validar todos los campos
    Object.keys(vehiculo).forEach((key) => {
      if (key !== "estado") {
        validarCampo(key, vehiculo[key])
      }
    })

    return Object.keys(errores).every((key) => !errores[key])
  }, [vehiculo, errores, validarCampo])

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
    setVehiculo((prev) => ({ ...prev, referencia_id: referencia.id }))
    validarCampo("referencia_id", referencia.id)
    setModalReferencia(false)
  }

  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente)
    setVehiculo((prev) => ({ ...prev, cliente_id: cliente.id }))
    validarCampo("cliente_id", cliente.id)
    setModalCliente(false)
  }

  const referenciasFiltradas = referencias.filter((ref) => {
    const textoBusqueda = busquedaReferencia.toLowerCase()
    const coincideTipo = ref.tipo_vehiculo === vehiculo.tipo_vehiculo || ref.categoria === vehiculo.tipo_vehiculo
    const coincideBusqueda =
      ref.nombre?.toLowerCase().includes(textoBusqueda) ||
      ref.marca_nombre?.toLowerCase().includes(textoBusqueda) ||
      ref.descripcion?.toLowerCase().includes(textoBusqueda)

    return coincideTipo && coincideBusqueda
  })

  // Filtrar solo clientes activos y por búsqueda
  const clientesFiltrados = clientes.filter((cliente) => {
    const textoBusqueda = busquedaCliente.toLowerCase()
    const esActivo = cliente.estado?.toLowerCase() === "activo"
    return (
      esActivo &&
      (
        cliente.nombre?.toLowerCase().includes(textoBusqueda) ||
        cliente.apellido?.toLowerCase().includes(textoBusqueda) ||
        cliente.documento?.toLowerCase().includes(textoBusqueda) ||
        cliente.telefono?.toLowerCase().includes(textoBusqueda) ||
        cliente.correo?.toLowerCase().includes(textoBusqueda)
      )
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
        // Verificar si la placa ya existe en otro vehículo
        const vehiculosExistentes = await makeRequest("/vehiculos")
        const vehiculoDuplicado = vehiculosExistentes?.find(
          (v) => v.id !== Number.parseInt(id) && v.placa === vehiculo.placa,
        )

        if (vehiculoDuplicado) {
          await Swal.fire({
            icon: "warning",
            title: "Placa duplicada",
            text: "Ya existe otro vehículo con esta placa.",
            confirmButtonColor: "#ef4444",
          })
          return
        }

        await makeRequest(`/vehiculos/${id}`, {
          method: "PUT",
          data: {
            ...vehiculo,
            estado: vehiculo.estado.toLowerCase(),
          },
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Vehículo actualizado correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/vehiculos")
      } catch (error) {
        console.error("Error al actualizar vehículo:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo actualizar el vehículo",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [vehiculo, validarFormulario, makeRequest, id, navigate],
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
      navigate("/vehiculos")
    }
  }, [navigate])

  // Cuando se cargan los clientes, setear clienteSeleccionado si existe el id
  useEffect(() => {
    if (vehiculo.cliente_id && clientes.length > 0) {
      const cliente = clientes.find((c) => c.id === vehiculo.cliente_id)
      if (cliente) setClienteSeleccionado(cliente)
    }
  }, [vehiculo.cliente_id, clientes])

  if (cargando) {
    return (
      <div className="editarVehiculo-container">
        <div className="editarVehiculo-loading">
          <div className="editarVehiculo-spinner"></div>
          <p>Cargando datos del vehículo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editarVehiculo-container">
      <div className="editarVehiculo-header">
        <div className="editarVehiculo-header-left">
          <button className="editarVehiculo-btn-back" onClick={() => navigate("/vehiculos")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarVehiculo-title-section">
            <h1 className="editarVehiculo-page-title">
              <FaCar className="editarVehiculo-title-icon" />
              Editar Vehículo
            </h1>
            <p className="editarVehiculo-subtitle">Modifica la información del vehículo</p>
          </div>
        </div>
      </div>

      <form className="editarVehiculo-form" onSubmit={handleSubmit}>
        <div className="editarVehiculo-form-section">
          <h3 className="editarVehiculo-section-title">
            <FaCar className="editarVehiculo-section-icon" />
            Información del Vehículo
          </h3>
          <div className="editarVehiculo-form-grid">
            <div className="editarVehiculo-form-group">
              <label htmlFor="placa" className="editarVehiculo-label">
                <FaIdCard className="editarVehiculo-label-icon" />
                Placa *
              </label>
              <input
                type="text"
                id="placa"
                name="placa"
                value={vehiculo.placa}
                onChange={handleChange}
                onInput={soloLetrasYNumeros}
                maxLength={6}
                autoComplete="off"
                className={`editarVehiculo-form-input ${errores.placa ? "error" : ""}`}
                required
              />
              {errores.placa && (
                <span className="editarVehiculo-error-text">
                  <FaExclamationTriangle /> {errores.placa}
                </span>
              )}
            </div>

            <div className="editarVehiculo-form-group">
              <label htmlFor="color" className="editarVehiculo-label">
                <FaPalette className="editarVehiculo-label-icon" />
                Color *
              </label>
              <input
                type="text"
                id="color"
                name="color"
                value={vehiculo.color}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={45}
                autoComplete="off"
                className={`editarVehiculo-form-input ${errores.color ? "error" : ""}`}
                required
              />
              {errores.color && (
                <span className="editarVehiculo-error-text">
                  <FaExclamationTriangle /> {errores.color}
                </span>
              )}
            </div>

            <div className="editarVehiculo-form-group">
              <label htmlFor="tipo_vehiculo" className="editarVehiculo-label">
                <FaCar className="editarVehiculo-label-icon" />
                Tipo de Vehículo *
              </label>
              <select
                id="tipo_vehiculo"
                name="tipo_vehiculo"
                value={vehiculo.tipo_vehiculo}
                onChange={handleChange}
                className={`editarVehiculo-form-input ${errores.tipo_vehiculo ? "error" : ""}`}
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="Carro">Carro</option>
                <option value="Moto">Moto</option>
                <option value="Camioneta">Camioneta</option>
              </select>
              {errores.tipo_vehiculo && (
                <span className="editarVehiculo-error-text">
                  <FaExclamationTriangle /> {errores.tipo_vehiculo}
                </span>
              )}
            </div>

            <div className="editarVehiculo-form-group">
              <label htmlFor="referencia" className="editarVehiculo-label">
                <FaCogs className="editarVehiculo-label-icon" />
                Referencia *
              </label>
              <div className="editarVehiculo-input-with-button">
                <input
                  type="text"
                  value={
                    referenciaSeleccionada
                      ? `${referenciaSeleccionada.marca_nombre ? referenciaSeleccionada.marca_nombre + " - " : ""}${referenciaSeleccionada.nombre}`
                      : ""
                  }
                  placeholder={`Seleccionar referencia de ${vehiculo.tipo_vehiculo.toLowerCase()}`}
                  readOnly
                  className={`editarVehiculo-form-input ${errores.referencia_id ? "error" : ""}`}
                  required
                />
                <button type="button" className="editarVehiculo-search-button" onClick={() => setModalReferencia(true)}>
                  <FaSearch />
                </button>
              </div>
              {errores.referencia_id && (
                <span className="editarVehiculo-error-text">
                  <FaExclamationTriangle /> {errores.referencia_id}
                </span>
              )}
            </div>

            <div className="editarVehiculo-form-group">
              <label htmlFor="cliente" className="editarVehiculo-label">
                <FaUser className="editarVehiculo-label-icon" />
                Cliente *
              </label>
              <div className="editarVehiculo-input-with-button">
                <input
                  type="text"
                  value={clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` : ""}
                  placeholder="Seleccionar cliente"
                  readOnly
                  className={`editarVehiculo-form-input ${errores.cliente_id ? "error" : ""}`}
                  required
                />
                <input type="hidden" name="cliente_id" value={vehiculo.cliente_id} />
                <button type="button" className="editarVehiculo-search-button" onClick={() => setModalCliente(true)}>
                  <FaSearch />
                </button>
              </div>
              {errores.cliente_id && (
                <span className="editarVehiculo-error-text">
                  <FaExclamationTriangle /> {errores.cliente_id}
                </span>
              )}
            </div>

            <div className="editarVehiculo-form-group">
              <label htmlFor="estado" className="editarVehiculo-label">
                <FaCogs className="editarVehiculo-label-icon" />
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={vehiculo.estado}
                onChange={handleChange}
                className={`editarVehiculo-form-input ${errores.estado ? "error" : ""}`}
                required
              >
                <option value="">Seleccionar estado</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errores.estado && (
                <span className="editarVehiculo-error-text">
                  <FaExclamationTriangle /> {errores.estado}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="editarVehiculo-form-actions">
          <button type="button" className="editarVehiculo-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="editarVehiculo-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="editarVehiculo-submit-button" disabled={isSubmitting || apiLoading}>
            {isSubmitting ? (
              <>
                <FaSpinner className="editarVehiculo-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="editarVehiculo-button-icon" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal de Referencias */}
      {modalReferencia && (
        <div className="editarVehiculo-modal-overlay">
          <div className="editarVehiculo-modal-container">
            <div className="editarVehiculo-modal-header">
              <h3>Seleccionar Referencia - {vehiculo.tipo_vehiculo}</h3>
              <button className="editarVehiculo-modal-close" onClick={() => setModalReferencia(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="editarVehiculo-modal-content">
              <div className="editarVehiculo-modal-search">
                <div className="editarVehiculo-search-container">
                  <FaSearch className="editarVehiculo-search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, marca o descripción..."
                    value={busquedaReferencia}
                    onChange={(e) => setBusquedaReferencia(e.target.value)}
                    className="editarVehiculo-search-input"
                  />
                </div>
              </div>

              <div className="editarVehiculo-modal-list">
                {referenciasFiltradas.length > 0 ? (
                  <div className="editarVehiculo-referencias-grid">
                    {referenciasFiltradas.map((ref) => (
                      <div
                        key={ref.id}
                        className={`editarVehiculo-referencia-card ${referenciaSeleccionada?.id === ref.id ? "selected" : ""}`}
                        onClick={() => handleSeleccionarReferencia(ref)}
                      >
                        <div className="editarVehiculo-referencia-info">
                          <h4>{ref.nombre}</h4>
                          {ref.marca_nombre && <p className="editarVehiculo-marca">Marca: {ref.marca_nombre}</p>}
                          {ref.descripcion && <p className="editarVehiculo-descripcion">{ref.descripcion}</p>}
                          <span className="editarVehiculo-tipo-badge">{ref.tipo_vehiculo || ref.categoria}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="editarVehiculo-modal-empty">
                    {busquedaReferencia
                      ? `No se encontraron referencias que coincidan con "${busquedaReferencia}"`
                      : `No hay referencias disponibles para ${vehiculo.tipo_vehiculo}`}
                  </div>
                )}
              </div>
            </div>

            <div className="editarVehiculo-modal-footer">
              <button className="editarVehiculo-modal-cancel" onClick={() => setModalReferencia(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Clientes */}
      {modalCliente && (
        <div className="editarVehiculo-modal-overlay">
          <div className="editarVehiculo-modal-container">
            <div className="editarVehiculo-modal-header">
              <h3>Seleccionar Cliente</h3>
              <button className="editarVehiculo-modal-close" onClick={() => setModalCliente(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="editarVehiculo-modal-content">
              <div className="editarVehiculo-modal-search">
                <div className="editarVehiculo-search-container">
                  <FaSearch className="editarVehiculo-search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, documento, teléfono o correo..."
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    className="editarVehiculo-search-input"
                  />
                </div>
              </div>

              <div className="editarVehiculo-modal-list">
                {clientesFiltrados.length > 0 ? (
                  <div className="editarVehiculo-clientes-grid">
                    {clientesFiltrados.map((cliente) => (
                      <div
                        key={cliente.id}
                        className={`editarVehiculo-cliente-card ${clienteSeleccionado?.id === cliente.id ? "selected" : ""}`}
                        onClick={() => handleSeleccionarCliente(cliente)}
                      >
                        <div className="editarVehiculo-cliente-info">
                          <div className="editarVehiculo-cliente-avatar">
                            <FaUser />
                          </div>
                          <div className="editarVehiculo-cliente-details">
                            <h4>
                              {cliente.nombre} {cliente.apellido}
                            </h4>
                            <p className="editarVehiculo-documento">Doc: {cliente.documento}</p>
                            {cliente.telefono && <p className="editarVehiculo-telefono">Tel: {cliente.telefono}</p>}
                            {cliente.correo && <p className="editarVehiculo-correo">{cliente.correo}</p>}
                            <span className={`editarVehiculo-estado-badge ${cliente.estado?.toLowerCase()}`}>
                              {cliente.estado}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="editarVehiculo-modal-empty">
                    {busquedaCliente
                      ? `No se encontraron clientes que coincidan con "${busquedaCliente}"`
                      : "No hay clientes disponibles"}
                  </div>
                )}
              </div>
            </div>

            <div className="editarVehiculo-modal-footer">
              <button className="editarVehiculo-modal-cancel" onClick={() => setModalCliente(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditarVehiculo

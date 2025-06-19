"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  X,
  User,
  Package,
  ShoppingBag,
  Loader,
  AlertTriangle,
  CheckCircle,
  Search,
  Trash,
  Save,
  Wrench,
  Car,
} from "lucide-react"
import Swal from "sweetalert2"
import "../../../../shared/styles/Ventas/CrearVenta.css"

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Add this utility function at the top of the file, after the API_BASE_URL constant
const formatCurrency = (amount) => {
  const number = Number.parseFloat(amount) || 0
  // If the number has no decimal part or the decimal part is .00, show without decimals
  if (number % 1 === 0) {
    return `$${number.toLocaleString("es-CO")}`
  }
  // Otherwise, show with 2 decimal places
  return `$${number.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Función mejorada para obtener token
const getValidToken = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  if (!token) {
    console.error("No hay token disponible")
    return null
  }
  return token
}

// Hook personalizado para manejo de API (SIN sistema de reservas)
const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mecanicos, setMecanicos] = useState([])

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
      console.log(`Haciendo petición a: ${API_BASE_URL}${url}`)
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
      })

      console.log(`Respuesta del servidor: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesión expirada. Por favor inicie sesión nuevamente.")
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`Datos recibidos:`, data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      console.error(`Error en solicitud a ${url}:`, errorMessage)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const fetchMecanicos = async () => {
      try {
        console.log("Iniciando carga de mecánicos...")
        setError(null)

        // CORREGIDO: Usar endpoint correcto para mecánicos activos
        const data = await makeRequest("/mecanicos/estado/Activo")

        if (data) {
          const mecanicosList = Array.isArray(data) ? data : data.mecanicos || data.data || []

          if (Array.isArray(mecanicosList) && mecanicosList.length > 0) {
            setMecanicos(mecanicosList)
            console.log(`Se cargaron ${mecanicosList.length} mecánicos exitosamente`)
          } else {
            console.warn("No se encontraron mecánicos en la respuesta")
            setMecanicos([])
            setError("No se encontraron mecánicos disponibles")
          }
        } else {
          console.warn("Respuesta vacía del servidor")
          setMecanicos([])
          setError("No se recibió respuesta del servidor")
        }
      } catch (error) {
        console.error("Error detallado al cargar mecánicos:", error)
        setMecanicos([])

        if (error.message.includes("500")) {
          setError("Error interno del servidor. El endpoint de mecánicos puede estar experimentando problemas.")
        } else if (error.message.includes("404")) {
          setError("El endpoint de mecánicos no fue encontrado. Verifique la configuración de la API.")
        } else if (error.message.includes("401")) {
          setError("Error de autenticación. Por favor inicie sesión nuevamente.")
        } else {
          setError(`Error al cargar mecánicos: ${error.message}`)
        }
      }
    }

    fetchMecanicos()
  }, [makeRequest])

  return {
    makeRequest,
    loading,
    setLoading,
    error,
    setError,
    mecanicos,
    setMecanicos,
  }
}

// Componente principal
const CrearVenta = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading, setLoading, mecanicos, error, setError, setMecanicos } = useApi()

  const [showProductModal, setShowProductModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [showVehiculoClienteModal, setShowVehiculoClienteModal] = useState(false)
  const [showMecanicoModal, setShowMecanicoModal] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedVehiculo, setSelectedVehiculo] = useState(null)
  const [selectedMecanico, setSelectedMecanico] = useState(null)
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().substr(0, 10),
    mecanico_id: "",
    vehiculo_id: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [estadosVenta, setEstadosVenta] = useState([])
  const [vehiculosCliente, setVehiculosCliente] = useState([])
  const [clientes, setClientes] = useState([])

  // Cargar clientes al iniciar
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const data = await makeRequest("/usuarios")
        if (data && Array.isArray(data)) {
          setClientes(data.filter((cliente) => cliente.estado === "Activo"))
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error)
      }
    }

    cargarClientes()
  }, [makeRequest])

  // Cargar estados de venta al iniciar
  useEffect(() => {
    const cargarEstadosVenta = async () => {
      try {
        const data = await makeRequest("/estados-venta")
        if (data && Array.isArray(data)) {
          setEstadosVenta(data)
        }
      } catch (error) {
        console.error("Error al cargar estados de venta:", error)
      }
    }

    cargarEstadosVenta()
  }, [makeRequest])

  // Calcular el total cuando cambian los productos o servicios seleccionados
  useEffect(() => {
    const productsTotal = selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const servicesTotal = selectedServices.reduce((sum, item) => sum + item.precio, 0)
    setTotal(productsTotal + servicesTotal)
  }, [selectedProducts, selectedServices])

  // Validaciones del formulario
  const validateForm = useCallback(() => {
    const errors = {}

    if (!selectedClient) {
      errors.client = "Debe seleccionar un cliente"
    }

    if (selectedProducts.length === 0 && selectedServices.length === 0) {
      errors.items = "Debe seleccionar al menos un producto o servicio"
    }

    if (!formData.fecha) {
      errors.fecha = "La fecha es obligatoria"
    }

    if (!selectedMecanico && !formData.mecanico_id) {
      errors.mecanico = "Debe seleccionar un mecánico"
    }

    selectedProducts.forEach((product, index) => {
      if (product.quantity <= 0) {
        errors[`product_${index}_quantity`] = `Cantidad inválida para ${product.nombre}`
      }
      if (product.price <= 0) {
        errors[`product_${index}_price`] = `Precio inválido para ${product.nombre}`
      }
      // NUEVA VALIDACIÓN: Verificar que no exceda el stock disponible
      if (product.quantity > product.stockOriginal) {
        errors[`product_${index}_stock`] = `Cantidad excede el stock disponible para ${product.nombre}`
      }
    })

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [selectedClient, selectedProducts, selectedServices, formData, selectedMecanico])

  // Manejadores para modales
  const openProductModal = useCallback(() => setShowProductModal(true), [])
  const closeProductModal = useCallback(() => setShowProductModal(false), [])
  const openServiceModal = useCallback(() => setShowServiceModal(true), [])
  const closeServiceModal = useCallback(() => setShowServiceModal(false), [])
  const openClientModal = useCallback(() => setShowClientModal(true), [])
  const closeClientModal = useCallback(() => setShowClientModal(false), [])
  const openVehiculoClienteModal = useCallback(() => setShowVehiculoClienteModal(true), [])
  const closeVehiculoClienteModal = useCallback(() => setShowVehiculoClienteModal(false), [])
  const openMecanicoModal = useCallback(() => setShowMecanicoModal(true), [])
  const closeMecanicoModal = useCallback(() => setShowMecanicoModal(false), [])

  // Manejador para eliminar productos
  const removeProduct = useCallback(async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      setSelectedProducts((prev) => prev.filter((item) => item.id !== id))
      Swal.fire({
        title: "Eliminado",
        text: "El producto ha sido eliminado",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })
    }
  }, [])

  // Manejador para eliminar servicios
  const removeService = useCallback(async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar servicio?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      setSelectedServices((prev) => prev.filter((item) => item.id !== id))
      Swal.fire({
        title: "Eliminado",
        text: "El servicio ha sido eliminado",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })
    }
  }, [])

  // Manejador para seleccionar cliente
  const selectClient = useCallback(
    async (client) => {
      setSelectedClient(client)
      closeClientModal()

      if (formErrors.client) {
        setFormErrors((prev) => ({ ...prev, client: "" }))
      }

      try {
        // CORREGIDO: Usar endpoint correcto para vehículos por cliente
        const data = await makeRequest(`/vehiculos/cliente/${client.id}`)
        if (data && Array.isArray(data)) {
          setVehiculosCliente(data)
        } else {
          setVehiculosCliente([])
        }
      } catch (error) {
        console.error("Error al cargar vehículos del cliente:", error)
        setVehiculosCliente([])
      }
    },
    [formErrors.client, closeClientModal, makeRequest],
  )

  // Manejador para seleccionar vehículo
  const selectVehiculo = useCallback((vehiculo) => {
    setSelectedVehiculo(vehiculo)
    setFormData((prev) => ({ ...prev, vehiculo_id: vehiculo.id }))
    closeVehiculoClienteModal()
  }, [])

  // Manejador para seleccionar mecánico
  const selectMecanico = useCallback(
    (mecanico) => {
      setSelectedMecanico(mecanico)
      setFormData((prev) => ({ ...prev, mecanico_id: mecanico.id }))
      closeMecanicoModal()

      if (formErrors.mecanico) {
        setFormErrors((prev) => ({ ...prev, mecanico: "" }))
      }
    },
    [formErrors.mecanico],
  )

  // Manejador para cambios en el formulario
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))

      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }))
      }
    },
    [formErrors],
  )

  // CORREGIDO: Función para actualizar cantidad de producto con validación simple
  const updateProductQuantity = useCallback((productId, newQuantity) => {
    // No permitir cantidades menores o iguales a 0
    if (newQuantity <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad inválida",
        text: "La cantidad debe ser mayor a 0",
        confirmButtonColor: "#2563eb",
      })
      return
    }

    setSelectedProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          // Validar que no exceda el stock disponible
          if (newQuantity > item.stockOriginal) {
            Swal.fire({
              icon: "warning",
              title: "Stock insuficiente",
              text: `Solo hay ${item.stockOriginal} unidades disponibles`,
              confirmButtonColor: "#2563eb",
            })
            return item // No actualizar si excede el stock
          }
          return { ...item, quantity: newQuantity }
        }
        return item
      }),
    )
  }, [])

  // Función para actualizar precio de producto
  const updateProductPrice = useCallback((productId, newPrice) => {
    if (newPrice < 0) return

    setSelectedProducts((prev) => prev.map((item) => (item.id === productId ? { ...item, price: newPrice } : item)))
  }, [])

  // Función para recargar mecánicos
  const recargarMecanicos = useCallback(async () => {
    try {
      console.log("Recargando mecánicos...")
      setLoading(true)
      setError(null)

      const data = await makeRequest("/mecanicos/estado/Activo")

      if (data) {
        const mecanicosList = Array.isArray(data) ? data : data.mecanicos || data.data || []

        if (Array.isArray(mecanicosList)) {
          setMecanicos(mecanicosList)
          console.log(`Mecánicos recargados: ${mecanicosList.length}`)

          if (mecanicosList.length > 0) {
            Swal.fire({
              icon: "success",
              title: "Mecánicos actualizados",
              text: `Se cargaron ${mecanicosList.length} mecánicos`,
              timer: 1500,
              showConfirmButton: false,
            })
          } else {
            Swal.fire({
              icon: "info",
              title: "Sin mecánicos",
              text: "No se encontraron mecánicos en el sistema",
              timer: 2000,
              showConfirmButton: false,
            })
          }
        } else {
          throw new Error("Formato de respuesta inválido")
        }
      } else {
        throw new Error("Respuesta vacía del servidor")
      }
    } catch (error) {
      console.error("Error al recargar mecánicos:", error)
      setError(`Error al cargar mecánicos: ${error.message}`)
      Swal.fire({
        icon: "error",
        title: "Error al cargar mecánicos",
        text: "No se pudieron cargar los mecánicos. Verifique la conexión con el servidor.",
      })
    } finally {
      setLoading(false)
    }
  }, [makeRequest, setLoading, setError, setMecanicos])

  // Función para guardar estado del formulario antes de navegar
  const saveFormState = useCallback(() => {
    const formState = {
      selectedClient,
      selectedVehiculo,
      selectedMecanico,
      selectedProducts,
      selectedServices,
      formData,
      total,
    }
    sessionStorage.setItem("crearVentaFormState", JSON.stringify(formState))
  }, [selectedClient, selectedVehiculo, selectedMecanico, selectedProducts, selectedServices, formData, total])

  // Función para restaurar estado del formulario
  const restoreFormState = useCallback(() => {
    // Solo restaurar si viene de una navegación interna (crear cliente, vehículo, etc.)
    const urlParams = new URLSearchParams(window.location.search)
    const fromNavigation = urlParams.get("from") || (window.history.state && window.history.state.from)

    if (!fromNavigation) {
      // Si no viene de navegación interna, limpiar cualquier estado guardado y empezar en blanco
      sessionStorage.removeItem("crearVentaFormState")
      return
    }

    const savedState = sessionStorage.getItem("crearVentaFormState")
    if (savedState) {
      try {
        const formState = JSON.parse(savedState)
        setSelectedClient(formState.selectedClient || null)
        setSelectedVehiculo(formState.selectedVehiculo || null)
        setSelectedMecanico(formState.selectedMecanico || null)
        setSelectedProducts(formState.selectedProducts || [])
        setSelectedServices(formState.selectedServices || [])
        setFormData(
          formState.formData || { fecha: new Date().toISOString().substr(0, 10), mecanico_id: "", vehiculo_id: "" },
        )
        setTotal(formState.total || 0)
      } catch (error) {
        console.error("Error al restaurar estado del formulario:", error)
      }
    }
  }, [])

  // Manejadores de navegación con preservación de estado
  const handleNavigateToCreateService = useCallback(() => {
    saveFormState()
    navigate("/crearservicio", { state: { from: "/crearventa" } })
  }, [saveFormState, navigate])

  const handleNavigateToCreateClient = useCallback(() => {
    saveFormState()
    navigate("/crearclientes", { state: { from: "/crearventa" } })
  }, [saveFormState, navigate])

  const handleNavigateToCreateVehiculo = useCallback(() => {
    saveFormState()
    navigate("/vehiculos/crear", {
      state: {
        from: "/crearventa",
        clienteId: selectedClient?.id,
      },
    })
  }, [saveFormState, navigate, selectedClient])

  const handleNavigateToCreateMecanico = useCallback(() => {
    saveFormState()
    navigate("/crearmecanico", { state: { from: "/crearventa" } })
  }, [saveFormState, navigate])

  // Restaurar estado al cargar el componente
  useEffect(() => {
    restoreFormState()
  }, [restoreFormState])

  // Limpiar estado al desmontar el componente si no es navegación interna
  useEffect(() => {
    return () => {
      // Solo limpiar si no estamos navegando a crear algo
      const isNavigatingToCreate =
        window.location.pathname.includes("/crear") || window.location.pathname.includes("/vehiculos/crear")

      if (!isNavigatingToCreate) {
        sessionStorage.removeItem("crearVentaFormState")
      }
    }
  }, [])

  // Manejadores de navegación con preservación de estado

  // Manejador para envío del formulario
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (!validateForm()) {
        await Swal.fire({
          icon: "warning",
          title: "Formulario incompleto",
          text: "Por favor complete todos los campos requeridos",
          confirmButtonColor: "#2563eb",
        })
        return
      }

      setIsSubmitting(true)

      try {
        const estadoPendiente = estadosVenta.find((estado) => estado.nombre === "Pendiente")
        if (!estadoPendiente) {
          throw new Error("No se encontró el estado 'Pendiente'")
        }

        const ventaData = {
          cliente_id: selectedClient.id,
          estado_venta_id: estadoPendiente.id,
          mecanico_id: selectedMecanico?.id || formData.mecanico_id || null,
          vehiculo_id: selectedVehiculo?.id || formData.vehiculo_id || null,
          servicios: selectedServices.map((service) => ({
            servicio_id: service.id,
          })),
          repuestos: selectedProducts.map((product) => ({
            repuesto_id: product.id,
            cantidad: product.quantity,
          })),
        }

        console.log("Enviando datos de venta:", ventaData)

        await makeRequest("/ventas", {
          method: "POST",
          body: JSON.stringify(ventaData),
        })

        // Limpiar estado guardado después de envío exitoso
        sessionStorage.removeItem("crearVentaFormState")

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "La venta ha sido registrada correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/ListarVentas")
      } catch (error) {
        console.error("Error al crear venta:", error)

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo registrar la venta",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      validateForm,
      selectedClient,
      selectedProducts,
      selectedServices,
      selectedMecanico,
      selectedVehiculo,
      makeRequest,
      navigate,
      estadosVenta,
      formData,
    ],
  )

  // Manejador para cancelar
  const handleCancel = useCallback(async () => {
    if (selectedProducts.length > 0 || selectedServices.length > 0 || selectedClient) {
      const result = await Swal.fire({
        title: "¿Cancelar venta?",
        text: "Se perderán todos los datos ingresados",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Continuar editando",
      })

      if (result.isConfirmed) {
        // Siempre limpiar el estado al cancelar
        sessionStorage.removeItem("crearVentaFormState")
        navigate("/ListarVentas")
      }
    } else {
      // Siempre limpiar el estado al cancelar
      sessionStorage.removeItem("crearVentaFormState")
      navigate("/ListarVentas")
    }
  }, [selectedProducts.length, selectedServices.length, selectedClient, navigate])

  // In the main component, add deselection functions after the selection functions:

  // Manejador para deseleccionar cliente
  const deselectClient = useCallback(() => {
    setSelectedClient(null)
    setVehiculosCliente([])
    setSelectedVehiculo(null)
    setFormData((prev) => ({ ...prev, vehiculo_id: "" }))
  }, [])

  // Manejador para deseleccionar vehículo
  const deselectVehiculo = useCallback(() => {
    setSelectedVehiculo(null)
    setFormData((prev) => ({ ...prev, vehiculo_id: "" }))
  }, [])

  // Manejador para deseleccionar mecánico
  const deselectMecanico = useCallback(() => {
    setSelectedMecanico(null)
    setFormData((prev) => ({ ...prev, mecanico_id: "" }))
  }, [])

  return (
    <div className="crearVenta-container">
      {error && (
        <div className="crearVenta-error-banner">
          <AlertTriangle className="crearVenta-error-icon" />
          <p>Hay problemas de conexión con el servidor. Algunas funciones pueden estar limitadas.</p>
          <button className="crearVenta-retry-button" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      )}
      <div className="crearVenta-header">
        <div className="crearVenta-title-section">
          <h1 className="crearVenta-page-title">
            <ShoppingBag className="crearVenta-title-icon" />
            Crear Venta
          </h1>
          <p className="crearVenta-subtitle">Registra una nueva venta de productos y servicios</p>
        </div>
      </div>

      <form className="crearVenta-form" onSubmit={handleSubmit}>
        <div className="crearVenta-form-section">
          <h3 className="crearVenta-section-title">
            <User className="crearVenta-section-icon" />
            Información General
          </h3>
          <div className="crearVenta-form-grid">
            {/* Update the client input section to include a deselect button: */}
            <div className="crearVenta-form-group">
              <label className="crearVenta-label">
                <i className="icon-user" /> Cliente 
              </label>
              <div className="crearVenta-input-with-actions">
                <input
                  type="text"
                  className="crearVenta-form-input"
                  value={selectedClient ? `${selectedClient.nombre} ${selectedClient.apellido}` : ""}
                  readOnly
                  onClick={openClientModal}
                  placeholder="Seleccione un cliente"
                  required
                />
                {selectedClient && (
                  <button
                    type="button"
                    className="crearVenta-deselect-button"
                    onClick={deselectClient}
                    title="Deseleccionar cliente"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {selectedClient && (
                <div className="crearVenta-client-info">
                  <div>
                    <b>Correo:</b> {selectedClient.correo}
                  </div>
                  <div>
                    <b>Documento:</b> {selectedClient.documento}
                  </div>
                  <div>
                    <b>Teléfono:</b> {selectedClient.telefono}
                  </div>
                </div>
              )}
            </div>

            {/* Vehículo del cliente */}
            {selectedClient && (
              <div className="crearVenta-form-group">
                <label className="crearVenta-label">
                  <i className="icon-car" /> Vehículo del Cliente
                </label>
                <div className="crearVenta-input-with-actions">
                  <input
                    type="text"
                    className="crearVenta-form-input"
                    value={
                      selectedVehiculo
                        ? `${selectedVehiculo.placa} `
                        : ""
                    }
                    readOnly
                    onClick={openVehiculoClienteModal}
                    placeholder="Seleccione un vehículo"
                  />
                  {selectedVehiculo && (
                    <button
                      type="button"
                      className="crearVenta-deselect-button"
                      onClick={deselectVehiculo}
                      title="Deseleccionar vehículo"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Mecánico */}
            <div className="crearVenta-form-group">
              <label className="crearVenta-label">
                <i className="icon-wrench" /> Mecánico
              </label>
              <div className="crearVenta-input-with-actions">
                <input
                  type="text"
                  className="crearVenta-form-input"
                  value={selectedMecanico ? `${selectedMecanico.nombre} ${selectedMecanico.apellido}` : ""}
                  readOnly
                  onClick={openMecanicoModal}
                  placeholder="Seleccione un mecánico"
                />
                {selectedMecanico && (
                  <button
                    type="button"
                    className="crearVenta-deselect-button"
                    onClick={deselectMecanico}
                    title="Deseleccionar mecánico"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="crearVenta-form-section">
          <h3 className="crearVenta-section-title">
            <Package className="crearVenta-section-icon" />
            Productos y Servicios
          </h3>
          <div className="crearVenta-add-items-section">
            <button
              type="button"
              className="crearVenta-create-button"
              onClick={openProductModal}
              disabled={isSubmitting}
            >
              <Plus className="crearVenta-button-icon" />
              Añadir Productos
            </button>
            <button
              type="button"
              className="crearVenta-create-button service"
              onClick={openServiceModal}
              disabled={isSubmitting}
            >
              <Plus className="crearVenta-button-icon" />
              Añadir Servicios
            </button>
            <button
              type="button"
              className="crearVenta-create-button"
              onClick={handleNavigateToCreateService}
              disabled={isSubmitting}
            >
              <Plus className="crearVenta-button-icon" />
              Crear Nuevo Servicio
            </button>
          </div>

          {formErrors.items && (
            <div className="crearVenta-error-message">
              <AlertTriangle size={16} /> {formErrors.items}
            </div>
          )}

          {/* Sección de productos seleccionados */}
          {selectedProducts.length > 0 && (
            <div className="crearVenta-selected-items-section">
              <div className="crearVenta-items-header">
                <h4>
                  <Package size={16} /> Productos Seleccionados
                </h4>
                <span className="crearVenta-items-count">
                  {selectedProducts.length} producto
                  {selectedProducts.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="crearVenta-item-cards">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="crearVenta-item-card-selected">
                    <div className="crearVenta-item-card-header">
                      <h4 className="crearVenta-item-name">{product.nombre}</h4>
                      <div className="crearVenta-item-actions">
                        <button
                          type="button"
                          className="crearVenta-remove-button"
                          onClick={() => removeProduct(product.id)}
                          title="Eliminar producto"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="crearVenta-item-card-details">
                      <div className="crearVenta-item-info-grid">
                        <div className="crearVenta-info-item">
                          <span className="crearVenta-info-label">Precio:</span>
                          <div className="crearVenta-editable-field">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={product.price}
                              onChange={(e) => updateProductPrice(product.id, Number.parseFloat(e.target.value) || 0)}
                              className="crearVenta-inline-input"
                            />
                          </div>
                        </div>
                        <div className="crearVenta-info-item">
                          <span className="crearVenta-info-label">Cantidad:</span>
                          <div className="crearVenta-quantity-controls">
                            <button
                              type="button"
                              className="crearVenta-quantity-btn"
                              onClick={() => updateProductQuantity(product.id, Math.max(1, product.quantity - 1))}
                              disabled={product.quantity <= 1}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={product.stockOriginal}
                              value={product.quantity}
                              onChange={(e) => {
                                const newValue = e.target.value

                                // Permitir campo vacío temporalmente
                                if (newValue === "") {
                                  return
                                }

                                const numValue = Number.parseInt(newValue) || 1

                                // No permitir números negativos o cero
                                if (numValue <= 0) {
                                  return
                                }

                                updateProductQuantity(product.id, numValue)
                              }}
                              onBlur={(e) => {
                                // Si el campo está vacío al perder el foco, establecer 1
                                if (e.target.value === "" || Number.parseInt(e.target.value) <= 0) {
                                  updateProductQuantity(product.id, 1)
                                }
                              }}
                              className="crearVenta-quantity-input-main"
                            />
                            <button
                              type="button"
                              className="crearVenta-quantity-btn"
                              onClick={() =>
                                updateProductQuantity(product.id, Math.min(product.stockOriginal, product.quantity + 1))
                              }
                              disabled={product.quantity >= product.stockOriginal}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="crearVenta-info-item crearVenta-subtotal-item">
                          <span className="crearVenta-info-label">Subtotal:</span>
                          <span className="crearVenta-subtotal">
                            {formatCurrency(product.price * product.quantity)}
                          </span>
                        </div>
                      </div>
                      <div className="crearVenta-stock-info">
                        <small className="text-gray-600">Stock disponible: {product.stockOriginal} unidades</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección de servicios seleccionados */}
          {selectedServices.length > 0 && (
            <div className="crearVenta-selected-items-section">
              <div className="crearVenta-items-header">
                <h4>
                  <Wrench size={16} /> Servicios Seleccionados
                </h4>
                <span className="crearVenta-items-count">
                  {selectedServices.length} servicio
                  {selectedServices.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="crearVenta-item-cards">
                {selectedServices.map((service) => (
                  <div key={service.id} className="crearVenta-item-card-selected service">
                    <div className="crearVenta-item-card-header">
                      <h4 className="crearVenta-item-name">{service.nombre}</h4>
                      <div className="crearVenta-item-actions">
                        <button
                          type="button"
                          className="crearVenta-remove-button"
                          onClick={() => removeService(service.id)}
                          title="Eliminar servicio"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="crearVenta-item-card-details">
                      <div className="crearVenta-item-info-grid">
                        <div className="crearVenta-info-item">
                          <span className="crearVenta-info-label">Descripción:</span>
                          <span className="crearVenta-info-value">{service.descripcion || "Sin descripción"}</span>
                        </div>
                        <div className="crearVenta-info-item crearVenta-subtotal-item">
                          <span className="crearVenta-info-label">Precio:</span>
                          <span className="crearVenta-subtotal">{formatCurrency(service.precio)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          {(selectedProducts.length > 0 || selectedServices.length > 0) && (
            <div className="crearVenta-total-section">
              <div className="crearVenta-total-card">
                <span className="crearVenta-total-label">Total de la Venta:</span>
                <span className="crearVenta-total-amount">{formatCurrency(total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Acciones del formulario */}
        <div className="crearVenta-form-actions">
          <button type="button" className="crearVenta-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <X className="crearVenta-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearVenta-submit-button" disabled={isSubmitting || apiLoading}>
            {isSubmitting ? (
              <>
                <Loader className="crearVenta-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="crearVenta-button-icon" />
                Guardar Venta
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modales */}
      {showProductModal && (
        <ProductModal
          closeModal={closeProductModal}
          addProduct={(products) => {
            if (Array.isArray(products)) {
              setSelectedProducts((prev) => [...prev, ...products])
            } else {
              setSelectedProducts((prev) => [...prev, products])
            }
          }}
          existingProducts={selectedProducts}
        />
      )}

      {showServiceModal && (
        <ServiceModal
          closeModal={closeServiceModal}
          addService={(services) => {
            if (Array.isArray(services)) {
              setSelectedServices((prev) => [...prev, ...services])
            } else {
              setSelectedServices((prev) => [...prev, services])
            }
          }}
          existingServices={selectedServices}
        />
      )}

      {showClientModal && (
        <ClientModal
          closeModal={closeClientModal}
          selectClient={selectClient}
          navigate={handleNavigateToCreateClient}
          clientes={clientes}
        />
      )}

      {showVehiculoClienteModal && selectedClient && (
        <VehiculoClienteModal
          closeModal={closeVehiculoClienteModal}
          clienteId={selectedClient.id}
          selectVehiculo={selectVehiculo}
          navigate={handleNavigateToCreateVehiculo}
          vehiculosCliente={vehiculosCliente}
        />
      )}

      {showMecanicoModal && (
        <MecanicoModal
          closeModal={closeMecanicoModal}
          selectMecanico={selectMecanico}
          navigate={handleNavigateToCreateMecanico}
          mecanicos={mecanicos}
        />
      )}
    </div>
  )
}

// SIMPLIFICADO: Componente Modal de Productos sin sistema de reservas
const ProductModal = ({ closeModal, addProduct, existingProducts }) => {
  const { makeRequest, loading, error } = useApi()
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState(0)

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await makeRequest("/repuestos")
        if (data && Array.isArray(data)) {
          const activeProducts = data.filter((product) => product.cantidad > 0 && product.estado === "Activo")
          setProducts(activeProducts)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchProducts()
  }, [makeRequest])

  // Filtrar productos disponibles
  const availableProducts = products.filter(
    (product) =>
      !existingProducts.some((existing) => existing.id === product.id) &&
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calcular total del carrito
  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotal(newTotal)
  }, [cartItems])

  // SIMPLIFICADO: Agregar al carrito con validación básica
  const handleAddToCart = useCallback(
    (product, quantity) => {
      const existingItem = cartItems.find((item) => item.id === product.id)
      const cantidadEnCarrito = existingItem ? existingItem.quantity : 0
      const nuevaCantidadTotal = cantidadEnCarrito + quantity

      // Validación simple de stock
      if (nuevaCantidadTotal > product.cantidad) {
        Swal.fire({
          icon: "warning",
          title: "Stock insuficiente",
          text: `Solo hay ${product.cantidad} unidades disponibles. Ya tienes ${cantidadEnCarrito} en el carrito.`,
          confirmButtonColor: "#2563eb",
        })
        return
      }

      const finalPrice = product.preciounitario || 0

      if (existingItem) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: nuevaCantidadTotal,
                  price: finalPrice,
                  stockOriginal: product.cantidad, // Guardar stock original
                }
              : item,
          ),
        )
      } else {
        setCartItems((prev) => [
          ...prev,
          {
            ...product,
            quantity: nuevaCantidadTotal,
            price: finalPrice,
            stockOriginal: product.cantidad, // Guardar stock original
          },
        ])
      }

      Swal.fire({
        icon: "success",
        title: "Producto agregado",
        text: `${quantity} unidad(es) de ${product.nombre} agregadas al carrito`,
        timer: 1500,
        showConfirmButton: false,
      })
    },
    [cartItems],
  )

  // Remover del carrito
  const handleRemoveFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  // Actualizar cantidad con validación
  const updateCartItemQuantity = useCallback(
    (productId, newQuantity) => {
      if (newQuantity <= 0) {
        handleRemoveFromCart(productId)
        return
      }

      const cartItem = cartItems.find((item) => item.id === productId)
      if (!cartItem) return

      if (newQuantity > cartItem.stockOriginal) {
        Swal.fire({
          icon: "warning",
          title: "Cantidad excedida",
          text: `Solo hay ${cartItem.stockOriginal} unidades disponibles`,
          confirmButtonColor: "#2563eb",
        })
        return
      }

      setCartItems((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
    },
    [cartItems, handleRemoveFromCart],
  )

  const handleConfirm = useCallback(async () => {
    if (cartItems.length > 0) {
      addProduct(cartItems)
      await Swal.fire({
        icon: "success",
        title: "Productos agregados",
        text: `Se agregaron ${cartItems.length} producto(s) a la venta`,
        timer: 1500,
        showConfirmButton: false,
      })
      closeModal()
    }
  }, [cartItems, addProduct, closeModal])

  if (loading) {
    return (
      <div className="crearVenta-modal-overlay">
        <div className="crearVenta-large-modal">
          <div className="crearVenta-modal-header">
            <h2>
              <Loader className="spinning" /> Cargando productos...
            </h2>
            <button type="button" className="crearVenta-close-modal-button" onClick={closeModal}>
              <X />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="crearVenta-modal-overlay">
        <div className="crearVenta-large-modal">
          <div className="crearVenta-modal-header">
            <h2>
              <AlertTriangle /> Error
            </h2>
            <button type="button" className="crearVenta-close-modal-button" onClick={closeModal}>
              <X />
            </button>
          </div>
          <div className="crearVenta-modal-content">
            <div className="crearVenta-error-message">
              <p>{error}</p>
              <button className="crearVenta-retry-button" onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="crearVenta-modal-overlay">
      <div className="crearVenta-large-modal">
        <div className="crearVenta-modal-header">
          <h2>
            <Package className="crearVenta-modal-icon" />
            Añadir Productos
          </h2>
          <button type="button" className="crearVenta-close-modal-button" onClick={closeModal}>
            <X />
          </button>
        </div>

        <div className="crearVenta-modal-content">
          <div className="crearVenta-left-pane">
            <div className="crearVenta-search-section">
              <h4>Buscar Productos</h4>
              <div className="crearVenta-search-container">
                <Search className="crearVenta-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="crearVenta-search-input"
                />
              </div>
            </div>

            <div className="crearVenta-product-list">
              {availableProducts.length === 0 ? (
                <div className="crearVenta-no-results">
                  <AlertTriangle className="crearVenta-no-results-icon" />
                  <p>{searchTerm ? "No se encontraron productos" : "No hay productos disponibles"}</p>
                </div>
              ) : (
                availableProducts.map((product) => (
                  <div key={product.id} className="crearVenta-product-card">
                    <div className="crearVenta-product-info">
                      <div className="crearVenta-product-main-info">
                        <span className="crearVenta-product-name">{product.nombre}</span>
                        <span className="crearVenta-product-price">{formatCurrency(product.preciounitario || 0)}</span>
                      </div>
                      <span className="crearVenta-product-stock">Stock: {product.cantidad}</span>
                      {product.descripcion && (
                        <span className="crearVenta-product-description">{product.descripcion}</span>
                      )}
                    </div>
                    <div className="crearVenta-product-actions">
                      <div className="crearVenta-input-group">
                        <div className="crearVenta-input-item">
                          <label>Cantidad</label>
                          <input
                            type="number"
                            className="crearVenta-quantity-input"
                            min="0"
                            max={product.cantidad}
                            defaultValue=""
                            placeholder="0"
                            id={`quantity-${product.id}`}
                            onInput={(e) => {
                              const value = e.target.value

                              // Permitir campo vacío para que se pueda borrar
                              if (value === "") {
                                return
                              }

                              // Convertir a número y validar
                              const numValue = Number.parseInt(value) || 0

                              // No permitir números negativos
                              if (numValue < 0) {
                                e.target.value = 0
                                return
                              }

                              // No permitir exceder el stock
                              if (numValue > product.cantidad) {
                                e.target.value = product.cantidad
                                return
                              }

                              e.target.value = numValue
                            }}
                            onBlur={(e) => {
                              // Si el campo está vacío al perder el foco, establecer 0
                              if (e.target.value === "") {
                                e.target.value = "0"
                              }
                            }}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="crearVenta-add-button"
                        disabled={product.cantidad === 0}
                        onClick={() => {
                          const quantityInput = document.getElementById(`quantity-${product.id}`)
                          const quantity = Number.parseInt(quantityInput.value) || 0

                          // Validar que la cantidad sea mayor a 0
                          if (quantity <= 0) {
                            Swal.fire({
                              icon: "warning",
                              title: "Cantidad inválida",
                              text: "La cantidad debe ser mayor a 0",
                              confirmButtonColor: "#2563eb",
                            })
                            quantityInput.focus()
                            return
                          }

                          if (quantity > product.cantidad) {
                            Swal.fire({
                              icon: "warning",
                              title: "Cantidad excedida",
                              text: `Solo hay ${product.cantidad} unidades disponibles`,
                              confirmButtonColor: "#2563eb",
                            })
                            quantityInput.value = product.cantidad
                            return
                          }

                          handleAddToCart(product, quantity)
                        }}
                      >
                        <Plus size={16} /> {product.cantidad === 0 ? "Sin stock" : "Agregar"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="crearVenta-right-pane">
            <div className="crearVenta-cart-header">
              <h4>Productos Seleccionados</h4>
              <span className="crearVenta-cart-count">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="crearVenta-cart-items">
              {cartItems.length === 0 ? (
                <div className="crearVenta-empty-cart-message">
                  <ShoppingBag className="crearVenta-empty-icon" />
                  <p>No hay productos seleccionados</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="crearVenta-cart-item">
                    <div className="crearVenta-cart-item-header">
                      <span className="crearVenta-cart-item-name">{item.nombre}</span>
                      <button
                        type="button"
                        className="crearVenta-remove-cart-item"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="crearVenta-cart-item-details">
                      <div className="crearVenta-cart-controls">
                        <div className="crearVenta-control-group">
                          <label>Cantidad:</label>
                          <input
                            type="number"
                            min="0"
                            max={item.stockOriginal}
                            value={item.quantity}
                            onChange={(e) => {
                              const newValue = e.target.value

                              // Permitir campo vacío temporalmente
                              if (newValue === "") {
                                return
                              }

                              const numValue = Number.parseInt(newValue) || 0

                              // No permitir números negativos
                              if (numValue < 0) {
                                return
                              }

                              if (numValue > item.stockOriginal) {
                                e.target.value = item.stockOriginal
                                return
                              }

                              updateCartItemQuantity(item.id, numValue)
                            }}
                            onBlur={(e) => {
                              // Si el campo está vacío al perder el foco, establecer 1 como mínimo
                              if (e.target.value === "" || Number.parseInt(e.target.value) === 0) {
                                updateCartItemQuantity(item.id, 1)
                              }
                            }}
                            className="crearVenta-control-input"
                          />
                        </div>
                        <div className="crearVenta-control-group">
                          <label>Precio:</label>
                          <span className="crearVenta-control-value">{formatCurrency(item.price)}</span>
                        </div>
                      </div>
                      <div className="crearVenta-cart-item-total">
                        Subtotal: <strong>{formatCurrency(item.price * item.quantity)}</strong>
                      </div>
                      <div className="crearVenta-cart-stock-info">
                        <small className="text-gray-600">Stock disponible: {item.stockOriginal} unidades</small>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="crearVenta-cart-summary">
              <div className="crearVenta-cart-total">
                <span>Total:</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <button
                type="button"
                className="crearVenta-confirm-cart-button"
                onClick={handleConfirm}
                disabled={cartItems.length === 0}
              >
                <CheckCircle className="crearVenta-button-icon" />
                Confirmar Selección ({cartItems.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente Modal de Servicios (sin cambios)
const ServiceModal = ({ closeModal, addService, existingServices }) => {
  const { makeRequest, loading, error } = useApi()
  const [searchTerm, setSearchTerm] = useState("")
  const [services, setServices] = useState([])
  const [selectedServices, setSelectedServices] = useState([])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await makeRequest("/servicios")
        if (data && Array.isArray(data)) {
          const activeServices = data.filter((service) => service.estado === "Activo")
          setServices(activeServices)
        }
      } catch (error) {
        console.error("Error fetching services:", error)
      }
    }

    fetchServices()
  }, [makeRequest])

  const availableServices = services.filter(
    (service) =>
      !existingServices.some((existing) => existing.id === service.id) &&
      service.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleToggleService = useCallback((service) => {
    setSelectedServices((prev) => {
      const isSelected = prev.some((item) => item.id === service.id)
      if (isSelected) {
        return prev.filter((item) => item.id !== service.id)
      } else {
        return [...prev, service]
      }
    })
  }, [])

  const handleConfirm = useCallback(async () => {
    if (selectedServices.length > 0) {
      addService(selectedServices)
      await Swal.fire({
        icon: "success",
        title: "Servicios agregados",
        text: `Se agregaron ${selectedServices.length} servicio(s) a la venta`,
        timer: 1500,
        showConfirmButton: false,
      })
      closeModal()
    }
  }, [selectedServices, addService, closeModal])

  if (loading) {
    return (
      <div className="crearVenta-modal-overlay">
        <div className="crearVenta-large-modal">
          <div className="crearVenta-modal-header">
            <h2>
              <Loader className="spinning" /> Cargando servicios...
            </h2>
            <button type="button" className="crearVenta-close-modal-button" onClick={closeModal}>
              <X />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="crearVenta-modal-overlay">
      <div className="crearVenta-large-modal">
        <div className="crearVenta-modal-header">
          <h2>
            <Wrench className="crearVenta-modal-icon" />
            Añadir Servicios
          </h2>
          <button type="button" className="crearVenta-close-modal-button" onClick={closeModal}>
            <X />
          </button>
        </div>

        <div className="crearVenta-modal-content">
          <div className="crearVenta-left-pane">
            <div className="crearVenta-search-section">
              <h4>Buscar Servicios</h4>
              <div className="crearVenta-search-container">
                <Search className="crearVenta-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="crearVenta-search-input"
                />
              </div>
            </div>

            <div className="crearVenta-service-list">
              {availableServices.length === 0 ? (
                <div className="crearVenta-no-results">
                  <AlertTriangle className="crearVenta-no-results-icon" />
                  <p>{searchTerm ? "No se encontraron servicios" : "No hay servicios disponibles"}</p>
                </div>
              ) : (
                availableServices.map((service) => (
                  <div
                    key={service.id}
                    className={`crearVenta-service-card ${
                      selectedServices.some((item) => item.id === service.id) ? "selected" : ""
                    }`}
                    onClick={() => handleToggleService(service)}
                  >
                    <div className="crearVenta-service-info">
                      <div className="crearVenta-service-main-info">
                        <span className="crearVenta-service-name">{service.nombre}</span>
                        <span className="crearVenta-service-price">{formatCurrency(service.precio || 0)}</span>
                      </div>
                      {service.descripcion && (
                        <span className="crearVenta-service-description">{service.descripcion}</span>
                      )}
                    </div>
                    <div className="crearVenta-service-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedServices.some((item) => item.id === service.id)}
                        onChange={() => handleToggleService(service)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="crearVenta-right-pane">
            <div className="crearVenta-cart-header">
              <h4>Servicios Seleccionados</h4>
              <span className="crearVenta-cart-count">
                {selectedServices.length} servicio
                {selectedServices.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="crearVenta-cart-items">
              {selectedServices.length === 0 ? (
                <div className="crearVenta-empty-cart-message">
                  <Wrench className="crearVenta-empty-icon" />
                  <p>No hay servicios seleccionados</p>
                </div>
              ) : (
                selectedServices.map((service) => (
                  <div key={service.id} className="crearVenta-cart-item service">
                    <div className="crearVenta-cart-item-header">
                      <span className="crearVenta-cart-item-name">{service.nombre}</span>
                      <button
                        type="button"
                        className="crearVenta-remove-cart-item"
                        onClick={() => handleToggleService(service)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="crearVenta-cart-item-details">
                      <div className="crearVenta-service-details">
                        {service.descripcion && <p className="crearVenta-service-description">{service.descripcion}</p>}
                        <div className="crearVenta-service-price-display">
                          <strong>{formatCurrency(service.precio)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="crearVenta-cart-summary">
              <div className="crearVenta-cart-total">
                <span>Total:</span>
                <strong>{formatCurrency(selectedServices.reduce((sum, service) => sum + service.precio, 0))}</strong>
              </div>
              <button
                type="button"
                className="crearVenta-confirm-cart-button"
                onClick={handleConfirm}
                disabled={selectedServices.length === 0}
              >
                <CheckCircle className="crearVenta-button-icon" />
                Confirmar Selección ({selectedServices.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal para seleccionar cliente (usuario)
// Update the ClientModal component to fix the layout:
const ClientModal = ({ closeModal, selectClient, navigate, clientes }) => {
  const [search, setSearch] = useState("")

  return (
    <div className="crearVenta-modal-overlay">
      <div className="crearVenta-modal">
        <div className="crearVenta-modal-header">
          <h2>
            <User className="crearVenta-modal-icon" />
            Seleccionar Cliente
          </h2>
          <button type="button" className="crearVenta-close-modal-button" onClick={closeModal}>
            <X />
          </button>
        </div>
        <div className="crearVenta-modal-content">
          <div className="crearVenta-modal-actions">
            <button type="button" className="crearVenta-create-button" onClick={navigate}>
              <Plus className="crearVenta-button-icon" />
              Registrar nuevo cliente
            </button>
          </div>
          <div className="crearVenta-search-section">
            <div className="crearVenta-search-container">
              <Search className="crearVenta-search-icon" />
              <input
                type="text"
                className="crearVenta-search-input"
                placeholder="Buscar por nombre, documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="crearVenta-client-list">
            {clientes
              .filter(
                (c) =>
                  c.nombre.toLowerCase().includes(search.toLowerCase()) ||
                  c.apellido.toLowerCase().includes(search.toLowerCase()) ||
                  c.documento?.toString().includes(search.toLowerCase()),
                
              )
              .map((cliente) => (
                <div
                  key={cliente.id}
                  className="crearVenta-client-card"
                  onClick={() => selectClient(cliente)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="crearVenta-client-info">
                    <div className="crearVenta-client-name-line">
                      {cliente.nombre} {cliente.apellido}
                    </div>
                    <div className="crearVenta-client-document-line">{cliente.documento || "Sin documento"}</div>
                    <div className="crearVenta-client-contact-line">{cliente.telefono}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal para seleccionar vehículo del cliente
// Update the VehiculoClienteModal component:
const VehiculoClienteModal = ({ closeModal, clienteId, selectVehiculo, navigate, vehiculosCliente }) => {
  const [search, setSearch] = useState("")

  return (
    <div className="crearVenta-modal-overlay">
      <div className="crearVenta-modal">
        <div className="crearVenta-modal-header">
          <h2>
            <Car className="crearVenta-modal-icon" />
            Seleccionar Vehículo
          </h2>
          <button type="button" className="crearVenta-close-modal-button" onClick={closeModal}>
            <X />
          </button>
        </div>
        <div className="crearVenta-modal-content">
          <div className="crearVenta-modal-actions">
            <button type="button" className="crearVenta-create-button" onClick={navigate}>
              <Plus className="crearVenta-button-icon" />
              Registrar nuevo vehículo
            </button>
          </div>
          <div className="crearVenta-search-section">
            <div className="crearVenta-search-container">
              <Search className="crearVenta-search-icon" />
              <input
                type="text"
                className="crearVenta-search-input"
                placeholder="Buscar por placa, marca, modelo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="crearVenta-vehiculo-list">
            {vehiculosCliente
              .filter(
                (v) =>
                  v.placa.toLowerCase().includes(search.toLowerCase())
              )
              .map((vehiculo) => (
                <div
                  key={vehiculo.id}
                  className="crearVenta-vehiculo-card"
                  onClick={() => selectVehiculo(vehiculo)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="crearVenta-vehiculo-info">
                    
                    <div className="crearVenta-vehiculo-document-line">{vehiculo.placa}</div>
                  
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal para seleccionar mecánico
// Update the MecanicoModal component:
const MecanicoModal = ({ closeModal, selectMecanico, navigate, mecanicos }) => {
  const [search, setSearch] = useState("")

  return (
    <div className="crearVenta-modal-overlay">
      <div className="crearVenta-modal">
        <div className="crearVenta-modal-header">
          <h2>
            <Wrench className="crearVenta-modal-icon" />
            Seleccionar Mecánico
          </h2>
          <button type="button" className="crearVenta-close-modal-button" onClick={closeModal}>
            <X />
          </button>
        </div>
        <div className="crearVenta-modal-content">
          <div className="crearVenta-modal-actions">
            <button type="button" className="crearVenta-create-button" onClick={navigate}>
              <Plus className="crearVenta-button-icon" />
              Registrar nuevo mecánico
            </button>
          </div>
          <div className="crearVenta-search-section">
            <div className="crearVenta-search-container">
              <Search className="crearVenta-search-icon" />
              <input
                type="text"
                className="crearVenta-search-input"
                placeholder="Buscar por nombre, documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="crearVenta-mecanico-list">
            {mecanicos
              .filter(
                (m) =>
                  m.nombre.toLowerCase().includes(search.toLowerCase()) ||
                  m.apellido.toLowerCase().includes(search.toLowerCase()) ||
                  m.documento?.toString().includes(search.toLowerCase()),
              )
              .map((mecanico) => (
                <div
                  key={mecanico.id}
                  className="crearVenta-mecanico-card"
                  onClick={() => selectMecanico(mecanico)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="crearVenta-mecanico-info">
                    <div className="crearVenta-mecanico-name-line">
                      {mecanico.nombre} {mecanico.apellido}
                    </div>
                    <div className="crearVenta-mecanico-document-line">{mecanico.documento || "Sin documento"}</div>
                    <div className="crearVenta-mecanico-contact-line">{mecanico.telefono}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrearVenta

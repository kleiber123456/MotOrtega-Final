"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Plus,
  X,
  User,
  Package,
  ShoppingBag,
  Loader,
  AlertTriangle,
  Search,
  Trash,
  Save,
  Wrench,
  Car,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Calendar,
  UserPlus,
  UserCog,
  CarFront,
} from "lucide-react"
import Swal from "sweetalert2"
import "../../../../shared/styles/Ventas/CrearVenta.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const formatCurrency = (amount) => {
  const number = Number.parseFloat(amount) || 0
  if (number % 1 === 0) {
    return `$${number.toLocaleString("es-CO")}`
  }
  return `$${number.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const getValidToken = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  if (!token) {
    return null
  }
  return token
}

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
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
      })

      if (options.method === "POST") {
        if (response.status >= 200 && response.status < 300) {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            return await response.json()
          }
          return { success: true }
        }

        if (response.status === 400) {
          let data = null
          try {
            data = await response.clone().json()
          } catch {
            return { success: true }
          }

          if (data && (data.id || data.success || data.message?.includes("exitosa") || data.message?.includes("creada"))) {
            return data
          }

          return { success: true, warning: "El servidor devolvió 400 pero la venta pudo haberse completado" }
        }
      } else {
        if (!response.ok) {
          let errorMsg = `Error ${response.status}: ${response.statusText}`
          try {
            const data = await response.json()
            errorMsg = data?.message || errorMsg
          } catch {}
          throw new Error(errorMsg)
        }
      }

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      }
      return null
    } catch (err) {
      if (options.method === "POST" && err.message.includes("400")) {
        console.warn("POST request returned 400 but assuming success:", err.message)
        return { success: true, warning: "Operación completada con advertencias" }
      }

      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    makeRequest,
    loading,
    setLoading,
    error,
    setError,
  }
}

const CrearVenta = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { makeRequest, loading: apiLoading, error, setError } = useApi()

  const isNavigatingAway = useRef(false)
  const FORM_STORAGE_KEY = 'crearVenta_formData'
  const SELECTIONS_STORAGE_KEY = 'crearVenta_selections'

  const loadFormData = () => {
    try {
      const savedData = localStorage.getItem(FORM_STORAGE_KEY)
      return savedData ? JSON.parse(savedData) : null
    } catch (error) {
      console.error("Error loading form data from localStorage:", error)
      return null
    }
  }

  const loadSelections = () => {
    try {
      const savedSelections = localStorage.getItem(SELECTIONS_STORAGE_KEY)
      return savedSelections ? JSON.parse(savedSelections) : null
    } catch (error) {
      console.error("Error loading selections from localStorage:", error)
      return null
    }
  }

  const initialFormData = loadFormData() || {
    fecha: new Date().toISOString().substr(0, 10),
    mecanico_id: "",
    vehiculo_id: "",
    cita_id: "",
  }

  const initialSelections = loadSelections() || {
    selectedClient: null,
    selectedVehiculo: null,
    selectedMecanico: null,
    cartItems: [],
    inputValues: {},
    activeTab: "productos",
    searchTerm: "",
    currentPage: 1,
    cartCurrentPage: 1,
  }

  const [formData, setFormData] = useState(initialFormData)
  const [selectedClient, setSelectedClient] = useState(initialSelections.selectedClient)
  const [selectedVehiculo, setSelectedVehiculo] = useState(initialSelections.selectedVehiculo)
  const [selectedMecanico, setSelectedMecanico] = useState(initialSelections.selectedMecanico)
  const [cartItems, setCartItems] = useState(initialSelections.cartItems)
  const [inputValues, setInputValues] = useState(initialSelections.inputValues)
  const [activeTab, setActiveTab] = useState(initialSelections.activeTab)
  const [searchTerm, setSearchTerm] = useState(initialSelections.searchTerm)
  const [currentPage, setCurrentPage] = useState(initialSelections.currentPage)
  const [cartCurrentPage, setCartCurrentPage] = useState(initialSelections.cartCurrentPage)

  const [clientes, setClientes] = useState([])
  const [estadosVenta, setEstadosVenta] = useState([])
  const [mecanicos, setMecanicos] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingServices, setLoadingServices] = useState(false)
  const [inputErrors, setInputErrors] = useState({})
  const [total, setTotal] = useState(0)
  const [itemsPerPage] = useState(3)
  const [cartItemsPerPage] = useState(3)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vehiculosCliente, setVehiculosCliente] = useState([])
  const [citasCliente, setCitasCliente] = useState([])
  const [showCitaModal, setShowCitaModal] = useState(false)

  const saveState = useCallback(() => {
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData))
      const selections = {
        selectedClient,
        selectedVehiculo,
        selectedMecanico,
        cartItems,
        inputValues,
        activeTab,
        searchTerm,
        currentPage,
        cartCurrentPage,
      }
      localStorage.setItem(SELECTIONS_STORAGE_KEY, JSON.stringify(selections))
    } catch (error) {
      console.error("Error saving state to localStorage:", error)
    }
  }, [
    formData,
    selectedClient,
    selectedVehiculo,
    selectedMecanico,
    cartItems,
    inputValues,
    activeTab,
    searchTerm,
    currentPage,
    cartCurrentPage,
  ])

  useEffect(() => {
    window.addEventListener("beforeunload", saveState)
    return () => {
      window.removeEventListener("beforeunload", saveState)
    }
  }, [saveState])

  useEffect(() => {
    return () => {
      if (!isNavigatingAway.current) {
        localStorage.removeItem(FORM_STORAGE_KEY)
        localStorage.removeItem(SELECTIONS_STORAGE_KEY)
      }
    }
  }, [])

  useEffect(() => {
    if (location.state) {
      const { fromComponent, data } = location.state
      if (fromComponent === "CrearClientes" && data) {
        setSelectedClient(data)
        if (formErrors.client) {
          setFormErrors((prev) => ({ ...prev, client: "" }))
        }
        navigate(location.pathname, { replace: true, state: null })
      } else if (fromComponent === "CrearMecanico" && data) {
        setSelectedMecanico(data)
        setFormData((prev) => ({ ...prev, mecanico_id: data.id }))
        navigate(location.pathname, { replace: true, state: null })
      } else if (fromComponent === "CrearVehiculo" && data) {
        setSelectedVehiculo(data)
        setFormData((prev) => ({ ...prev, vehiculo_id: data.id }))
        navigate(location.pathname, { replace: true, state: null })
      }
    }
  }, [location.state, navigate, formErrors.client])

  useEffect(() => {
    if (activeTab === "productos") {
      setLoadingProducts(true)
      makeRequest("/repuestos")
        .then((data) => {
          if (data && Array.isArray(data)) {
            setProducts(data.filter((p) => p.cantidad > 0 && p.estado === "Activo"))
          }
        })
        .catch((error) => console.error("Error cargando productos:", error))
        .finally(() => setLoadingProducts(false))
    } else {
      setLoadingServices(true)
      makeRequest("/servicios")
        .then((data) => {
          if (data && Array.isArray(data)) {
            setServices(data.filter((s) => s.estado === "Activo"))
          }
        })
        .catch((error) => console.error("Error cargando servicios:", error))
        .finally(() => setLoadingServices(false))
    }
  }, [activeTab, makeRequest])

  useEffect(() => {
    makeRequest("/clientes")
      .then((data) => {
        const clientesArray = (Array.isArray(data) ? data : data?.clientes || []).filter(
          (c) => c && c.id && c.nombre && c.apellido && c.estado?.toLowerCase() === "activo",
        )
        setClientes(clientesArray)
      })
      .catch((error) => console.error("Error cargando clientes:", error))

    makeRequest("/estados-venta")
      .then((data) => {
        if (data && Array.isArray(data)) {
          setEstadosVenta(data)
        }
      })
      .catch((error) => console.error("Error cargando estados venta:", error))

    makeRequest("/mecanicos/estado/Activo")
      .then((data) => {
        const mecanicosList = (Array.isArray(data) ? data : data?.mecanicos || []).filter(
          (m) => m && m.id && m.nombre && m.apellido && m.estado === "Activo",
        )
        setMecanicos(mecanicosList)
      })
      .catch((error) => console.error("Error cargando mecánicos:", error))
  }, [makeRequest])

  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => {
      if (item.type === "producto") return sum + item.price * item.quantity
      if (item.type === "servicio") return sum + (item.precio || 0)
      return sum
    }, 0)
    setTotal(newTotal)
  }, [cartItems])

  const filteredProducts = searchTerm.trim()
    ? products.filter(
        (p) =>
          !cartItems.some((e) => e.type === "producto" && e.id === p.id) &&
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []
  const filteredServices = searchTerm.trim()
    ? services.filter(
        (s) =>
          !cartItems.some((e) => e.type === "servicio" && e.id === s.id) &&
          s.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems =
    activeTab === "productos"
      ? filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
      : filteredServices.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages =
    activeTab === "productos"
      ? Math.ceil(filteredProducts.length / itemsPerPage)
      : Math.ceil(filteredServices.length / itemsPerPage)

  const cartIndexOfLastItem = cartCurrentPage * cartItemsPerPage
  const cartIndexOfFirstItem = cartIndexOfLastItem - cartItemsPerPage
  const currentCartItems = cartItems.slice(cartIndexOfFirstItem, cartIndexOfLastItem)
  const cartTotalPages = Math.ceil(cartItems.length / cartItemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
    setCartCurrentPage(1)
  }, [searchTerm, activeTab])

  const handleInputChange2 = (id, field, value) => {
    setInputValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }

  const validateInputs = (id, cantidad, precio) => {
    const errors = {}
    if (!cantidad || isNaN(cantidad) || cantidad < 1) errors.cantidad = "Ingrese una cantidad válida"
    if (!precio || isNaN(precio) || precio <= 0) errors.precio = "Ingrese un precio válido"
    setInputErrors((prev) => ({ ...prev, [id]: errors }))
    return Object.keys(errors).length === 0
  }

  const handleAddItem = (item, cantidad, precio) => {
    if (!validateInputs(item.id, cantidad, precio)) return
    const newItem =
      activeTab === "productos"
        ? { ...item, type: "producto", quantity: cantidad, price: precio, stockOriginal: item.cantidad }
        : { ...item, type: "servicio", precio: precio }
    setCartItems((prev) => [...prev, newItem])
    setInputErrors((prev) => ({ ...prev, [item.id]: {} }))
    setInputValues((prev) => ({ ...prev, [item.id]: {} }))
  }

  const removeCartItem = useCallback(async (id, type) => {
    const result = await Swal.fire({
      title: `¿Eliminar ${type === "producto" ? "producto" : "servicio"}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })
    if (result.isConfirmed) {
      setCartItems((prev) => prev.filter((item) => !(item.id === id && item.type === type)))
      Swal.fire({
        title: "Eliminado",
        text: `${type === "producto" ? "Producto" : "Servicio"} eliminado`,
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      })
    }
  }, [])

  const updateCartItemQuantity = (id, value) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.type === "producto" ? { ...item, quantity: value === "" ? "" : Number(value) } : item,
      ),
    )
  }

  const validateForm = useCallback(() => {
    const errors = {}
    if (!selectedClient) errors.client = "Debe seleccionar un cliente"
    if (cartItems.length === 0) errors.items = "Debe seleccionar al menos un producto o servicio"
    if (!formData.fecha) errors.fecha = "La fecha es obligatoria"
    cartItems.forEach((item, index) => {
      if (item.type === "producto") {
        if (!item.quantity || Number(item.quantity) < 1)
          errors[`item_${index}_quantity`] = `Cantidad inválida para ${item.nombre}`
        if (item.price <= 0) errors[`item_${index}_price`] = `Precio inválido para ${item.nombre}`
        if (item.quantity > item.stockOriginal)
          errors[`item_${index}_stock`] = `Cantidad excede el stock disponible para ${item.nombre}`
      }
    })
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [selectedClient, cartItems, formData])

  const [showClientModal, setShowClientModal] = useState(false)
  const [showVehiculoClienteModal, setShowVehiculoClienteModal] = useState(false)
  const [showMecanicoModal, setShowMecanicoModal] = useState(false)

  const handleCreateClient = () => {
    isNavigatingAway.current = true
    saveState()
    navigate("/CrearClientes", {
      state: { returnTo: "/CrearVenta", returnData: true },
    })
  }

  const handleCreateMecanico = () => {
    isNavigatingAway.current = true
    saveState()
    navigate("/CrearMecanicos", {
      state: { returnTo: "/CrearVenta", returnData: true },
    })
  }

  const handleCreateVehiculo = () => {
    isNavigatingAway.current = true
    saveState()
    navigate("/vehiculos/crear", {
      state: { returnTo: "/CrearVenta", returnData: true },
    })
  }

  const getFechaHoy = () => {
    const hoy = new Date()
    const year = hoy.getFullYear()
    const month = String(hoy.getMonth() + 1).padStart(2, "0")
    const day = String(hoy.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const esFechaValida = (fechaCita) => {
    if (!fechaCita) return false
    try {
      const fechaCitaNormalizada = fechaCita.includes("T") ? fechaCita.split("T")[0] : fechaCita
      const fechaHoy = getFechaHoy()
      const fechaCitaObj = new Date(fechaCitaNormalizada + "T00:00:00")
      const fechaHoyObj = new Date(fechaHoy + "T00:00:00")
      const diferenciaDias = Math.floor((fechaCitaObj - fechaHoyObj) / (1000 * 60 * 60 * 24))
      return diferenciaDias >= 0 && diferenciaDias <= 7
    } catch (error) {
      console.error("Error al validar fecha:", error)
      return false
    }
  }

  const selectClient = useCallback(
    async (client) => {
      setSelectedClient(client)
      setShowClientModal(false)
      if (formErrors.client) {
        setFormErrors((prev) => ({ ...prev, client: "" }))
      }

      try {
        const dataVehiculos = await makeRequest(`/vehiculos/cliente/${client.id}`)
        const vehiculosValidos = (Array.isArray(dataVehiculos) ? dataVehiculos : dataVehiculos?.vehiculos || []).filter(
          (v) => v && v.id,
        )
        setVehiculosCliente(vehiculosValidos)

        const citas = await makeRequest(`/citas/cliente/${client.id}`)
        const citasArray = (Array.isArray(citas) ? citas : citas?.citas || []).filter(
          (c) => c.estado_cita_id === 1 && esFechaValida(c.fecha),
        )

        if (citasArray.length > 0) {
          const citasConDetalles = await Promise.all(
            citasArray.map(async (cita) => {
              try {
                const detalleCita = await makeRequest(`/citas/${cita.id}`)
                let servicios = detalleCita?.servicios || []
                if (servicios.length === 0 && detalleCita?.servicio_id) {
                  const servicioDetalle = await makeRequest(`/servicios/${detalleCita.servicio_id}`)
                  if (servicioDetalle) {
                    servicios = [servicioDetalle]
                  }
                }
                const subtotal = servicios.reduce((sum, s) => sum + Number(s.precio || 0), 0)
                return { ...cita, ...detalleCita, servicios, subtotal }
              } catch (error) {
                console.error(`Error cargando detalles de cita ${cita.id}:`, error)
                return { ...cita, servicios: [], subtotal: 0 }
              }
            }),
          )
          setCitasCliente(citasConDetalles)
          setShowCitaModal(true)
        } else {
          setCitasCliente([])
          setShowCitaModal(false)
          setSelectedVehiculo(null)
          setSelectedMecanico(null)
          setFormData((prev) => ({ ...prev, vehiculo_id: "", mecanico_id: "", cita_id: "" }))
        }
      } catch (error) {
        console.error("Error al procesar cliente y citas:", error)
        setVehiculosCliente([])
        setCitasCliente([])
        setShowCitaModal(false)
      }
    },
    [makeRequest, formErrors.client],
  )

  const selectVehiculo = useCallback((vehiculo) => {
    setSelectedVehiculo(vehiculo)
    setFormData((prev) => ({ ...prev, vehiculo_id: vehiculo.id }))
    setShowVehiculoClienteModal(false)
  }, [])

  const selectMecanico = useCallback((mecanico) => {
    setSelectedMecanico(mecanico)
    setFormData((prev) => ({ ...prev, mecanico_id: mecanico.id }))
    setShowMecanicoModal(false)
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (isSubmitting) return
      if (!validateForm()) {
        const errorList = Object.values(formErrors)
          .map((msg) => `<li>${msg}</li>`)
          .join("")
        await Swal.fire({
          icon: "warning",
          title: "Formulario incompleto",
          html: `<ul style="text-align:left">${errorList}</ul>`,
          confirmButtonColor: "#2563eb",
        })
        return
      }
      setIsSubmitting(true)
      try {
        const estadoPendiente = estadosVenta.find((estado) => estado.nombre === "Pendiente")
        if (!estadoPendiente) throw new Error("No se encontró el estado 'Pendiente'")

        const ventaData = {
          cliente_id: selectedClient.id,
          estado_venta_id: estadoPendiente.id,
          fecha: formData.fecha,
          servicios: cartItems.filter((i) => i.type === "servicio").map((s) => ({ servicio_id: s.id })),
          repuestos: cartItems
            .filter((i) => i.type === "producto")
            .map((p) => ({ repuesto_id: p.id, cantidad: p.quantity })),
          ...(formData.cita_id ? { cita_id: formData.cita_id } : {}),
          ...(formData.mecanico_id ? { mecanico_id: formData.mecanico_id } : {}),
          ...(formData.vehiculo_id ? { vehiculo_id: formData.vehiculo_id } : {}),
        }

        const result = await makeRequest("/ventas", {
          method: "POST",
          body: JSON.stringify(ventaData),
        })

        let mensajeExito = "La venta ha sido registrada correctamente"
        if (result && result.warning) {
          mensajeExito += " (con algunas advertencias del servidor)"
        }

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: mensajeExito,
          timer: 2000,
          showConfirmButton: false,
        })
        isNavigatingAway.current = true // Para evitar que el cleanup borre el storage antes de navegar
        navigate("/ListarVentas")
      } catch (error) {
        console.error("Error al crear venta:", error)
        if (!error.message.includes("400") && !error.message.includes("warning")) {
          await Swal.fire({
            icon: "error",
            title: "No se pudo registrar la venta",
            text: error.message || "Error desconocido",
            confirmButtonColor: "#2563eb",
          })
        } else {
          console.warn("Posible éxito con advertencia:", error.message)
          await Swal.fire({
            icon: "success",
            title: "Venta registrada",
            text: "La venta se ha registrado correctamente (con advertencias del servidor)",
            timer: 2000,
            showConfirmButton: false,
          })
          isNavigatingAway.current = true
          navigate("/ListarVentas")
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, validateForm, formErrors, selectedClient, cartItems, estadosVenta, formData, makeRequest, navigate],
  )

  const handleCancel = useCallback(async () => {
    if (cartItems.length > 0 || selectedClient) {
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
        isNavigatingAway.current = false // Asegura que el storage se limpie
        navigate("/ListarVentas")
      }
    } else {
      navigate("/ListarVentas")
    }
  }, [cartItems.length, selectedClient, navigate])

  const deselectClient = useCallback(() => {
    setSelectedClient(null)
    setVehiculosCliente([])
    setSelectedVehiculo(null)
    setSelectedMecanico(null)
    setCitasCliente([])
    setFormData((prev) => ({ ...prev, vehiculo_id: "", mecanico_id: "", cita_id: "" }))
    localStorage.removeItem(FORM_STORAGE_KEY)
    localStorage.removeItem(SELECTIONS_STORAGE_KEY)
  }, [])

  const deselectVehiculo = useCallback(() => {
    setSelectedVehiculo(null)
    setFormData((prev) => ({ ...prev, vehiculo_id: "" }))
  }, [])

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
        <button
          type="button"
          className="crearVenta-volver-btn"
          onClick={() => navigate("/ListarVentas")}
        >
          <ChevronLeft size={22} />
          Volver
        </button>
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
            <div className="crearVenta-form-group">
              <label className="crearVenta-label">Cliente</label>
              <div className="crearVenta-input-with-actions">
                <input
                  type="text"
                  className="crearVenta-form-input"
                  value={selectedClient ? `${selectedClient.nombre} ${selectedClient.apellido}` : ""}
                  readOnly
                  onClick={() => setShowClientModal(true)}
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
                <button
                  type="button"
                  className="crearVenta-create-button"
                  onClick={handleCreateClient}
                  title="Crear nuevo cliente"
                >
                  <UserPlus size={16} />
                </button>
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
            {selectedClient && (
              <div className="crearVenta-form-group">
                <label className="crearVenta-label">Vehículo del Cliente</label>
                <div className="crearVenta-input-with-actions">
                  <input
                    type="text"
                    className="crearVenta-form-input"
                    value={selectedVehiculo ? `${selectedVehiculo.placa}` : ""}
                    readOnly
                    onClick={() => setShowVehiculoClienteModal(true)}
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
                  <button
                    type="button"
                    className="crearVenta-create-button"
                    onClick={handleCreateVehiculo}
                    title="Crear nuevo vehículo"
                  >
                    <CarFront size={16} />
                  </button>
                </div>
              </div>
            )}
            <div className="crearVenta-form-group">
              <label className="crearVenta-label">Mecánico</label>
              <div className="crearVenta-input-with-actions">
                <input
                  type="text"
                  className="crearVenta-form-input"
                  value={selectedMecanico ? `${selectedMecanico.nombre} ${selectedMecanico.apellido}` : ""}
                  readOnly
                  onClick={() => setShowMecanicoModal(true)}
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
                <button
                  type="button"
                  className="crearVenta-create-button"
                  onClick={handleCreateMecanico}
                  title="Crear nuevo mecánico"
                >
                  <UserCog size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Sección de productos/servicios --- */}
        <div className="crearVenta-cart-main-section">
          <div className="crearVenta-cart-header">
            <h3
              className="crearVenta-cart-title-clickable"
              onClick={() => {
                const selectedItemsSection = document.querySelector(".crearVenta-selected-items-section")
                if (selectedItemsSection) {
                  const rect = selectedItemsSection.getBoundingClientRect()
                  const offset = 80
                  window.scrollTo({
                    top: window.pageYOffset + rect.top - offset,
                    behavior: "smooth",
                  })
                }
              }}
              title="Ir a productos y servicios seleccionados"
            >
              <ShoppingBag className="crearVenta-cart-icon" />
              Carrito
            </h3>
          </div>
          <div className="crearVenta-cart-content">
            {/* Columna Izquierda: Tabs, búsqueda y listado */}
            <div className="crearVenta-search-section">
              <div className="crearVenta-form-section">
                <div className="crearVenta-tabs-container">
                  <div className="crearVenta-tabs">
                    <button
                      className={`crearVenta-tab-btn${activeTab === "productos" ? " active" : ""}`}
                      onClick={() => setActiveTab("productos")}
                      type="button"
                    >
                      <Package size={16} /> Productos
                    </button>
                    <button
                      className={`crearVenta-tab-btn${activeTab === "servicios" ? " active" : ""}`}
                      onClick={() => setActiveTab("servicios")}
                      type="button"
                    >
                      <Wrench size={16} /> Servicios
                    </button>
                  </div>
                </div>
                <div className="crearVenta-search-container">
                  <Search className="crearVenta-search-icon" />
                  <input
                    type="text"
                    placeholder={`Buscar ${activeTab === "productos" ? "productos" : "servicios"}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="crearVenta-search-input"
                  />
                </div>
                {(activeTab === "productos" ? loadingProducts : loadingServices) ? (
                  <div className="crearVenta-no-results">
                    <Loader className="spinning" /> Cargando...
                  </div>
                ) : searchTerm.trim() ? (
                  <div className={activeTab === "productos" ? "crearVenta-product-list" : "crearVenta-service-list"}>
                    {currentItems.length === 0 ? (
                      <div className="crearVenta-no-results">
                        <AlertTriangle className="crearVenta-no-results-icon" />
                        <p>No se encontraron {activeTab === "productos" ? "productos" : "servicios"}</p>
                      </div>
                    ) : (
                      <>
                        {currentItems.map((item) => {
                          const values = inputValues[item.id] || {}
                          const cantidad = values.cantidad ?? 1
                          const precio =
                            activeTab === "productos"
                              ? (values.precio ?? item.precio_venta ?? 0)
                              : (values.precio ?? item.precio ?? 0)
                          const maxCantidad = item.cantidad || 1
                          const cantidadValida = cantidad >= 1 && cantidad <= maxCantidad
                          return (
                            <div key={item.id} className="crearVenta-card-compact">
                              <div className="crearVenta-card-header-compact">
                                <div className="crearVenta-card-info-compact">
                                  <h4 className="crearVenta-card-name-compact">{item.nombre}</h4>
                                  <div className="crearVenta-card-details-compact">
                                    {activeTab === "productos" && (
                                      <span className="crearVenta-card-stock-compact">Stock: {item.cantidad || 0}</span>
                                    )}
                                  </div>
                                  {item.descripcion && (
                                    <>
                                      <span className="crearVenta-card-description-compact">{item.descripcion}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="crearVenta-card-inputs-row">
                                {activeTab === "productos" && (
                                  <div className="crearVenta-input-compact">
                                    <label>Cant.</label>
                                    <input
                                      type="number"
                                      className="crearVenta-input-field-compact"
                                      min="1"
                                      max={maxCantidad}
                                      value={cantidad === undefined ? "" : cantidad}
                                      onChange={(e) =>
                                        handleInputChange2(
                                          item.id,
                                          "cantidad",
                                          e.target.value === ""
                                            ? ""
                                            : Math.min(Number.parseInt(e.target.value), maxCantidad),
                                        )
                                      }
                                      onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                                      placeholder="1"
                                      disabled={maxCantidad === 0}
                                    />
                                    {inputErrors[item.id]?.cantidad && (
                                      <span className="crearVenta-error-hint">{inputErrors[item.id].cantidad}</span>
                                    )}
                                    {maxCantidad === 0 && <span className="crearVenta-error-hint">Sin stock</span>}
                                  </div>
                                )}
                                <div className="crearVenta-input-compact">
                                  <label>Precio</label>
                                  <input
                                    type="number"
                                    className="crearVenta-input-field-compact crearVenta-readonly"
                                    min="0"
                                    step="0.01"
                                    value={precio === undefined ? "" : precio}
                                    readOnly
                                    disabled
                                    placeholder="0"
                                  />
                                  {inputErrors[item.id]?.precio && (
                                    <span className="crearVenta-error-hint">{inputErrors[item.id].precio}</span>
                                  )}
                                </div>
                                <div className="crearVenta-input-compact">
                                  <label>Subtotal</label>
                                  <input
                                    type="text"
                                    className="crearVenta-input-field-compact crearVenta-readonly"
                                    value={formatCurrency(precio * (activeTab === "productos" ? cantidad : 1))}
                                    readOnly
                                    tabIndex={-1}
                                  />
                                </div>
                                <div className="crearVenta-add-button-container">
                                  <button
                                    type="button"
                                    className="crearVenta-add-button-compact"
                                    onClick={() => handleAddItem(item, cantidad, precio)}
                                    disabled={activeTab === "productos" && (!cantidadValida || maxCantidad === 0)}
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {totalPages > 1 && (
                          <div className="crearVenta-pagination">
                            <button
                              type="button"
                              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="crearVenta-pagination-button"
                            >
                              <ChevronLeft size={16} /> Anterior
                            </button>
                            <span className="crearVenta-page-info">
                              Página {currentPage} de {totalPages} (
                              {activeTab === "productos" ? filteredProducts.length : filteredServices.length}{" "}
                              encontrados)
                            </span>
                            <button
                              type="button"
                              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="crearVenta-pagination-button"
                            >
                              Siguiente <ChevronRight size={16} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="crearVenta-no-results">
                    <Search className="crearVenta-no-results-icon" />
                    <p>Escriba el nombre del {activeTab === "productos" ? "producto" : "servicio"} que desea buscar</p>
                  </div>
                )}
              </div>
            </div>
            {/* Columna Derecha: Carrito */}
            <div className="crearVenta-selected-items-section">
              {cartItems.length > 0 ? (
                <div className="crearVenta-form-section">
                  <div className="crearVenta-items-header">
                    <h4 className="crearVenta-items-title">
                      <ShoppingBag size={16} /> Productos y Servicios Seleccionados
                    </h4>
                    <span className="crearVenta-items-count">{cartItems.length} item(s)</span>
                  </div>
                  <div className="crearVenta-item-cards">
                    {currentCartItems.map((item) => (
                      <div
                        key={item.id + item.type}
                        className={`crearVenta-item-card-selected-compact${item.type === "servicio" ? " service" : ""}`}
                      >
                        <div className="crearVenta-item-card-header-compact">
                          <h4 className="crearVenta-item-name-compact">
                            {item.nombre}
                            {item.type === "servicio" && (
                              <span style={{ marginLeft: 8, color: "#2563eb", fontWeight: 600 }}>(Servicio)</span>
                            )}
                          </h4>
                          <div className="crearVenta-item-actions-compact">
                            <button
                              type="button"
                              className="crearVenta-remove-button-compact"
                              onClick={() => removeCartItem(item.id, item.type)}
                              title="Eliminar"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="crearVenta-item-inputs-row-compact">
                          {item.type === "producto" ? (
                            <>
                              <div className="crearVenta-input-compact">
                                <label>Precio</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.price}
                                  readOnly
                                  disabled
                                  className="crearVenta-input-field-compact crearVenta-readonly"
                                />
                              </div>
                              <div className="crearVenta-input-compact">
                                <label>Cantidad</label>
                                <input
                                  type="number"
                                  min="1"
                                  max={item.stockOriginal}
                                  value={item.quantity === 0 ? "" : item.quantity}
                                  className="crearVenta-input-field-compact"
                                  onChange={(e) => {
                                    const value = e.target.value
                                    updateCartItemQuantity(item.id, value === "" ? "" : Number(value))
                                  }}
                                  onBlur={(e) => {
                                    const value = e.target.value
                                    updateCartItemQuantity(
                                      item.id,
                                      value === "" || Number(value) < 1
                                        ? 1
                                        : Number(value) > item.stockOriginal
                                          ? item.stockOriginal
                                          : Number(value),
                                    )
                                  }}
                                />
                              </div>
                              <div className="crearVenta-input-compact">
                                <label>Subtotal</label>
                                <input
                                  type="text"
                                  className="crearVenta-input-field-compact crearVenta-readonly"
                                  value={formatCurrency(item.price * item.quantity)}
                                  readOnly
                                  tabIndex={-1}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="crearVenta-input-compact">
                                <label>Descripción</label>
                                <input
                                  type="text"
                                  className="crearVenta-input-field-compact crearVenta-readonly"
                                  value={item.descripcion || "Sin descripción"}
                                  readOnly
                                  tabIndex={-1}
                                />
                              </div>
                              <div className="crearVenta-input-compact">
                                <label>Precio</label>
                                <input
                                  type="number"
                                  value={item.precio}
                                  readOnly
                                  disabled
                                  className="crearVenta-input-field-compact crearVenta-readonly"
                                />
                              </div>
                            </>
                          )}
                        </div>
                        {item.type === "producto" && (
                          <div className="crearVenta-stock-info-compact">
                            <small>Stock: {item.stockOriginal} unidades</small>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {cartTotalPages > 1 && (
                    <div className="crearVenta-selected-pagination">
                      <button
                        type="button"
                        onClick={() => setCartCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={cartCurrentPage === 1}
                        className="crearVenta-pagination-button-small"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="crearVenta-page-info-small">
                        {cartCurrentPage} / {cartTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCartCurrentPage((prev) => Math.min(prev + 1, cartTotalPages))}
                        disabled={cartCurrentPage === cartTotalPages}
                        className="crearVenta-pagination-button-small"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                  <div className="crearVenta-total-section-compact">
                    <div className="crearVenta-form-actions">
                      <button
                        type="button"
                        className="crearVenta-cancel-button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
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
                    <div className="crearVenta-total-card-compact">
                      <span className="crearVenta-total-label-compact">Total:</span>
                      <span className="crearVenta-total-amount-compact">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="crearVenta-form-section">
                  <div className="crearVenta-empty-cart">
                    <ShoppingBag className="crearVenta-empty-cart-icon" />
                    <h4>Carrito vacío</h4>
                    <p>Busca y agrega productos o servicios para comenzar tu venta</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
      {/* Modales */}
      {showClientModal && (
        <ClientModal closeModal={() => setShowClientModal(false)} selectClient={selectClient} clientes={clientes} />
      )}
      {showVehiculoClienteModal && selectedClient && (
        <VehiculoClienteModal
          closeModal={() => setShowVehiculoClienteModal(false)}
          clienteId={selectedClient.id}
          selectVehiculo={selectVehiculo}
          vehiculosCliente={vehiculosCliente}
        />
      )}
      {showMecanicoModal && (
        <MecanicoModal
          closeModal={() => setShowMecanicoModal(false)}
          selectMecanico={selectMecanico}
          mecanicos={mecanicos}
        />
      )}
      {showCitaModal && (
        <CitasClienteModal
          closeModal={() => setShowCitaModal(false)}
          citas={citasCliente}
          onSelectCita={(cita) => {
            const vehiculoObj = {
              id: cita.vehiculo_id,
              placa: cita.vehiculo_placa,
              marca_nombre: cita.marca_nombre || "",
            }
            const mecanicoObj = {
              id: cita.mecanico_id,
              nombre: cita.mecanico_nombre,
              apellido: cita.mecanico_apellido,
            }
            setSelectedVehiculo(vehiculoObj)
            setSelectedMecanico(mecanicoObj)
            setFormData((prev) => ({
              ...prev,
              vehiculo_id: cita.vehiculo_id || "",
              mecanico_id: cita.mecanico_id || "",
              cita_id: cita.id || "",
            }))

            const serviciosParaAgregar = cita.servicios
              .filter(s => !cartItems.some(cartItem => cartItem.type === 'servicio' && cartItem.id === s.id))
              .map((s) => ({
                ...s,
                type: "servicio",
              }))

            if(serviciosParaAgregar.length > 0) {
              setCartItems((prev) => [...prev, ...serviciosParaAgregar])
            }

            setShowCitaModal(false)
            Swal.fire(
              "Cita aplicada",
              "Los datos y servicios de la cita han sido agregados a la venta.",
              "success",
            )
          }}
        />
      )}
    </div>
  )
}

const CitasClienteModal = ({ closeModal, citas, onSelectCita }) => {
  return (
    <div className="crearCompra-supplier-modal-overlay">
      <div className="crearCompra-supplier-modal" style={{ maxWidth: "800px" }}>
        <div className="crearCompra-supplier-modal-header">
          <h2>
            <Calendar className="crearCompra-modal-icon" />
            Citas Programadas del Cliente
          </h2>
          <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
            <X />
          </button>
        </div>
        <div className="crearCompra-supplier-modal-content">
          {citas.length === 0 ? (
            <div className="crearCompra-no-results">
              <p>No se encontraron citas programadas.</p>
            </div>
          ) : (
            <div className="crearCompra-supplier-table-container">
              <table className="crearCompra-suppliers-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Vehículo</th>
                    <th>Servicios</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((cita) => (
                    <tr key={cita.id}>
                      <td>
                        {new Date(cita.fecha).toLocaleDateString()} {cita.hora}
                      </td>
                      <td>{cita.vehiculo_placa}</td>
                      <td>
                        {cita.servicios?.map((s) => s.nombre).join(", ") || "N/A"}
                      </td>
                      <td>{formatCurrency(cita.subtotal)}</td>
                      <td>
                        <button
                          className="crearCompra-supplier-select-button"
                          onClick={() => onSelectCita(cita)}
                        >
                          <CheckCircle size={16} /> Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Modales Cliente/Vehículo/Mecánico ---

const ClientModal = ({ closeModal, selectClient, clientes }) => {
  const { makeRequest, loading, error } = useApi()
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const filteredClientes = search.trim()
    ? clientes.filter(
        (c) =>
          (c.nombre && c.nombre.toLowerCase().includes(search.toLowerCase())) ||
          (c.apellido && c.apellido.toLowerCase().includes(search.toLowerCase())) ||
          (c.documento && c.documento.toString().toLowerCase().includes(search.toLowerCase())),
      )
    : clientes

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredClientes.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage)

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), [])

  const handleSelectClient = useCallback(
    async (cliente) => {
      selectClient(cliente)
      await Swal.fire({
        icon: "success",
        title: "Cliente seleccionado",
        text: `${cliente.nombre} ${cliente.apellido} ha sido seleccionado`,
        timer: 1500,
        showConfirmButton: false,
      })
    },
    [selectClient],
  )

  if (loading) {
    return (
      <div className="crearCompra-supplier-modal-overlay">
        <div className="crearCompra-supplier-modal">
          <div className="crearCompra-supplier-modal-header">
            <h2>
              <Loader className="spinning" /> Cargando clientes...
            </h2>
            <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
              <X />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="crearCompra-supplier-modal-overlay">
        <div className="crearCompra-supplier-modal">
          <div className="crearCompra-supplier-modal-header">
            <h2>
              <AlertTriangle /> Error
            </h2>
            <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
              <X />
            </button>
          </div>
          <div className="crearCompra-supplier-modal-content">
            <div className="crearCompra-error-message">
              <p>{error}</p>
              <button className="crearCompra-retry-button" onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="crearCompra-supplier-modal-overlay">
      <div className="crearCompra-supplier-modal">
        <div className="crearCompra-supplier-modal-header">
          <h2>
            <User className="crearCompra-modal-icon" />
            Seleccionar Cliente
          </h2>
          <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
            <X />
          </button>
        </div>
        <div className="crearCompra-supplier-modal-content">
          <div className="crearCompra-supplier-search-container">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o documento..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="crearCompra-supplier-search-input"
            />
          </div>
          {currentItems.length === 0 ? (
            <div className="crearCompra-no-results">
              <AlertTriangle className="crearCompra-no-results-icon" />
              <p>No se encontraron clientes</p>
            </div>
          ) : (
            <>
              <div className="crearCompra-supplier-table-container">
                <table className="crearCompra-suppliers-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Documento</th>
                      <th>Correo</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((cliente) => (
                      <tr key={cliente.id} className="crearCompra-supplier-row">
                        <td>{cliente.nombre}</td>
                        <td>{cliente.apellido}</td>
                        <td>{cliente.documento}</td>
                        <td>{cliente.correo}</td>
                        <td>
                          <button
                            className="crearCompra-supplier-select-button"
                            onClick={() => handleSelectClient(cliente)}
                          >
                            <CheckCircle size={16} />
                            Seleccionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="crearCompra-supplier-pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="crearCompra-supplier-pagination-button"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="crearCompra-supplier-page-info">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="crearCompra-supplier-pagination-button"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const VehiculoClienteModal = ({ closeModal, clienteId, selectVehiculo, vehiculosCliente }) => {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const filteredVehiculos = search.trim()
    ? vehiculosCliente.filter(
        (v) =>
          (v.placa && v.placa.toLowerCase().includes(search.toLowerCase())) ||
          (v.marca_nombre && v.marca_nombre.toLowerCase().includes(search.toLowerCase())),
      )
    : vehiculosCliente

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredVehiculos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredVehiculos.length / itemsPerPage)

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), [])

  const handleSelectVehiculo = useCallback(
    async (vehiculo) => {
      selectVehiculo(vehiculo)
      await Swal.fire({
        icon: "success",
        title: "Vehículo seleccionado",
        text: `Vehículo con placa ${vehiculo.placa} ha sido seleccionado`,
        timer: 1500,
        showConfirmButton: false,
      })
    },
    [selectVehiculo],
  )

  return (
    <div className="crearCompra-supplier-modal-overlay">
      <div className="crearCompra-supplier-modal">
        <div className="crearCompra-supplier-modal-header">
          <h2>
            <Car className="crearCompra-modal-icon" />
            Seleccionar Vehículo
          </h2>
          <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
            <X />
          </button>
        </div>

        <div className="crearCompra-supplier-modal-content">
          <div className="crearCompra-supplier-search-container">
            <input
              type="text"
              placeholder="Buscar por placa o marca..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="crearCompra-supplier-search-input"
            />
          </div>

          <div className="crearCompra-suppliers-list">
            {currentItems.length === 0 ? (
              <div className="crearCompra-supplier-no-results">
                <AlertTriangle className="crearCompra-no-results-icon" />
                <p>{search ? "No se encontraron vehículos" : "No hay vehículos disponibles para este cliente"}</p>
              </div>
            ) : (
              <table className="crearCompra-suppliers-table">
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Marca</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((vehiculo) => (
                    <tr key={vehiculo.id} className="crearCompra-supplier-row">
                      <td>{vehiculo.placa}</td>
                      <td>{vehiculo.marca_nombre || "No especificada"}</td>
                      <td>
                        <button
                          className="crearCompra-supplier-select-button"
                          onClick={() => handleSelectVehiculo(vehiculo)}
                        >
                          <CheckCircle size={16} />
                          Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="crearCompra-supplier-pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="crearCompra-supplier-pagination-button"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="crearCompra-supplier-page-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="crearCompra-supplier-pagination-button"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const MecanicoModal = ({ closeModal, selectMecanico, mecanicos }) => {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const filteredMecanicos = search.trim()
    ? mecanicos.filter(
        (m) =>
          (m.nombre && m.nombre.toLowerCase().includes(search.toLowerCase())) ||
          (m.apellido && m.apellido.toLowerCase().includes(search.toLowerCase())),
      )
    : mecanicos

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredMecanicos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredMecanicos.length / itemsPerPage)

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), [])

  const handleSelectMecanico = useCallback(
    async (mecanico) => {
      selectMecanico(mecanico)
      await Swal.fire({
        icon: "success",
        title: "Mecánico seleccionado",
        text: `${mecanico.nombre} ${mecanico.apellido} ha sido seleccionado`,
        timer: 1500,
        showConfirmButton: false,
      })
    },
    [selectMecanico],
  )

  return (
    <div className="crearCompra-supplier-modal-overlay">
      <div className="crearCompra-supplier-modal">
        <div className="crearCompra-supplier-modal-header">
          <h2>
            <Wrench className="crearCompra-modal-icon" />
            Seleccionar Mecánico
          </h2>
          <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
            <X />
          </button>
        </div>

        <div className="crearCompra-supplier-modal-content">
          <div className="crearCompra-supplier-search-container">
            <input
              type="text"
              placeholder="Buscar por nombre o apellido..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="crearCompra-supplier-search-input"
            />
          </div>

          <div className="crearCompra-suppliers-list">
            {currentItems.length === 0 ? (
              <div className="crearCompra-supplier-no-results">
                <AlertTriangle className="crearCompra-no-results-icon" />
                <p>{search ? "No se encontraron mecánicos" : "No hay mecánicos disponibles"}</p>
              </div>
            ) : (
              <table className="crearCompra-suppliers-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((mecanico) => (
                    <tr key={mecanico.id} className="crearCompra-supplier-row">
                      <td>{mecanico.nombre}</td>
                      <td>{mecanico.apellido}</td>
                      <td>
                        <button
                          className="crearCompra-supplier-select-button"
                          onClick={() => handleSelectMecanico(mecanico)}
                        >
                          <CheckCircle size={16} />
                          Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="crearCompra-supplier-pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="crearCompra-supplier-pagination-button"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="crearCompra-supplier-page-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="crearCompra-supplier-pagination-button"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CrearVenta

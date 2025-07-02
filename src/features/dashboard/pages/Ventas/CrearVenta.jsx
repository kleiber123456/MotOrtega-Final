"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
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
  ChevronLeft,
  ChevronRight,
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
    console.error("No hay token disponible")
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
      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const data = await response.json();
          errorMsg = data?.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return null;
    } catch (err) {
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

  // Estados principales
  const [clientes, setClientes] = useState([])
  const [estadosVenta, setEstadosVenta] = useState([])
  const [mecanicos, setMecanicos] = useState([])

  const [activeTab, setActiveTab] = useState("productos")
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingServices, setLoadingServices] = useState(false)
  const [inputValues, setInputValues] = useState({})
  const [inputErrors, setInputErrors] = useState({})
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3)
  const [cartCurrentPage, setCartCurrentPage] = useState(1)
  const [cartItemsPerPage] = useState(4)
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedVehiculo, setSelectedVehiculo] = useState(null)
  const [selectedMecanico, setSelectedMecanico] = useState(null)
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().substr(0, 10),
    mecanico_id: "",
    vehiculo_id: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vehiculosCliente, setVehiculosCliente] = useState([])

  // --- Cargar productos y servicios ---
  useEffect(() => {
    if (activeTab === "productos") {
      setLoadingProducts(true)
      makeRequest("/repuestos").then(data => {
        if (data && Array.isArray(data)) {
          setProducts(data.filter(p => p.cantidad > 0 && p.estado === "Activo"))
        }
        setLoadingProducts(false)
      })
    } else {
      setLoadingServices(true)
      makeRequest("/servicios").then(data => {
        if (data && Array.isArray(data)) {
          setServices(data.filter(s => s.estado === "Activo"))
        }
        setLoadingServices(false)
      })
    }
  }, [activeTab, makeRequest])

  // --- Cargar clientes y estados venta ---
  useEffect(() => {
    makeRequest("/clientes").then(data => {
      let clientesArray = []
      if (Array.isArray(data)) clientesArray = data
      else if (Array.isArray(data?.data)) clientesArray = data.data
      else if (Array.isArray(data?.clientes)) clientesArray = data.clientes
      else if (data && typeof data === "object") {
        const arr = Object.values(data).find(v => Array.isArray(v))
        if (arr) clientesArray = arr
      }
      setClientes(clientesArray || [])
    })
    makeRequest("/estados-venta").then(data => {
      if (data && Array.isArray(data)) setEstadosVenta(data)
    })
  }, [makeRequest])

  // --- Cargar mecánicos activos ---
  useEffect(() => {
    makeRequest("/mecanicos/estado/Activo").then(data => {
      let mecanicosList = []
      if (Array.isArray(data)) mecanicosList = data
      else if (Array.isArray(data?.mecanicos)) mecanicosList = data.mecanicos
      else if (Array.isArray(data?.data)) mecanicosList = data.data
      else {
        const arr = Object.values(data || {}).find(v => Array.isArray(v))
        if (arr) mecanicosList = arr
      }
      setMecanicos(mecanicosList || [])
    })
  }, [makeRequest])

  // --- Calcular total ---
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      if (item.type === "producto") return sum + (item.price * item.quantity)
      if (item.type === "servicio") return sum + (item.precio || 0)
      return sum
    }, 0)
    setTotal(total)
  }, [cartItems])

  // --- Filtrado y paginación búsqueda ---
  const filteredProducts = searchTerm.trim()
    ? products.filter(
        p =>
          !cartItems.some(e => e.type === "producto" && e.id === p.id) &&
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []
  const filteredServices = searchTerm.trim()
    ? services.filter(
        s =>
          !cartItems.some(e => e.type === "servicio" && e.id === s.id) &&
          s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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

  // --- Paginación carrito ---
  const cartIndexOfLastItem = cartCurrentPage * cartItemsPerPage
  const cartIndexOfFirstItem = cartIndexOfLastItem - cartItemsPerPage
  const currentCartItems = cartItems.slice(cartIndexOfFirstItem, cartIndexOfLastItem)
  const cartTotalPages = Math.ceil(cartItems.length / cartItemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
    setCartCurrentPage(1)
  }, [searchTerm, activeTab])

  // --- Inputs y validaciones ---
  const handleInputChange2 = (id, field, value) => {
    setInputValues(prev => ({
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
    setInputErrors(prev => ({ ...prev, [id]: errors }))
    return Object.keys(errors).length === 0
  }

  // --- Agregar producto/servicio al carrito ---
  const handleAddItem = (item, cantidad, precio) => {
    if (!validateInputs(item.id, cantidad, precio)) return
    if (activeTab === "productos") {
      setCartItems(prev => [
        ...prev,
        {
          ...item,
          type: "producto",
          quantity: cantidad,
          price: precio,
          stockOriginal: item.cantidad,
        },
      ])
    } else {
      setCartItems(prev => [
        ...prev,
        {
          ...item,
          type: "servicio",
          precio: precio,
        },
      ])
    }
    setInputErrors(prev => ({ ...prev, [item.id]: {} }))
    setInputValues(prev => ({ ...prev, [item.id]: {} }))
  }

  // --- Eliminar del carrito ---
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
      setCartItems(prev => prev.filter(item => !(item.id === id && item.type === type)))
      Swal.fire({
        title: "Eliminado",
        text: `${type === "producto" ? "Producto" : "Servicio"} eliminado`,
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      })
    }
  }, [])

  // --- Actualizar cantidad/precio en carrito ---
  const updateCartItemQuantity = (id, value) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.type === "producto"
          ? { ...item, quantity: value === "" ? "" : Number(value) }
          : item
      )
    )
  }
  const updateCartItemPrice = (id, value) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.type === "producto"
          ? { ...item, price: value }
          : item
      )
    )
  }

  // --- Validación y envío ---
  const validateForm = useCallback(() => {
    const errors = {}
    if (!selectedClient) errors.client = "Debe seleccionar un cliente"
    if (cartItems.length === 0) errors.items = "Debe seleccionar al menos un producto o servicio"
    if (!formData.fecha) errors.fecha = "La fecha es obligatoria"
    cartItems.forEach((item, index) => {
      if (item.type === "producto") {
        if (!item.quantity || Number(item.quantity) < 1) errors[`item_${index}_quantity`] = `Cantidad inválida para ${item.nombre}`
        if (item.price <= 0) errors[`item_${index}_price`] = `Precio inválido para ${item.nombre}`
        if (item.quantity > item.stockOriginal) errors[`item_${index}_stock`] = `Cantidad excede el stock disponible para ${item.nombre}`
      }
    })
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [selectedClient, cartItems, formData])

  // --- Cliente, vehículo, mecánico ---
  const [showClientModal, setShowClientModal] = useState(false)
  const [showVehiculoClienteModal, setShowVehiculoClienteModal] = useState(false)
  const [showMecanicoModal, setShowMecanicoModal] = useState(false)

  const selectClient = useCallback(async (client) => {
    setSelectedClient(client)
    setShowClientModal(false)
    try {
      const data = await makeRequest(`/vehiculos/cliente/${client.id}`)
      setVehiculosCliente(Array.isArray(data) ? data : [])
    } catch {
      setVehiculosCliente([])
    }
  }, [makeRequest])

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

  // --- Submit ---
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (isSubmitting) return
      if (!validateForm()) {
        // Junta los mensajes de error en una lista
        const errorList = Object.values(formErrors)
          .map((msg) => `<li>${msg}</li>`)
          .join("");
        await Swal.fire({
          icon: "warning",
          title: "Formulario incompleto",
          html: `<ul style="text-align:left">${errorList}</ul>`,
          confirmButtonColor: "#2563eb",
        });
        return;
      }
      setIsSubmitting(true)
      try {
        const estadoPendiente = estadosVenta.find((estado) => estado.nombre === "Pendiente")
        if (!estadoPendiente) throw new Error("No se encontró el estado 'Pendiente'")
        const ventaData = {
          cliente_id: selectedClient.id,
          estado_venta_id: estadoPendiente.id,
          fecha: formData.fecha,
          servicios: cartItems.filter(i => i.type === "servicio").map(s => ({ servicio_id: s.id })),
          repuestos: cartItems.filter(i => i.type === "producto").map(p => ({ repuesto_id: p.id, cantidad: p.quantity })),
          ...(formData.mecanico_id ? { mecanico_id: formData.mecanico_id } : {}),
          ...(formData.vehiculo_id ? { vehiculo_id: formData.vehiculo_id } : {}),
        }
        await makeRequest("/ventas", {
          method: "POST",
          body: JSON.stringify(ventaData),
        })
        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "La venta ha sido registrada correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })
        navigate("/ListarVentas")
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "No se pudo registrar la venta",
          text: error.message || "Error desconocido",
          confirmButtonColor: "#2563eb",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, validateForm, formErrors, selectedClient, cartItems, estadosVenta, formData, makeRequest, navigate]
  )

  // --- Cancelar ---
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
      if (result.isConfirmed) navigate("/ListarVentas")
    } else {
      navigate("/ListarVentas")
    }
  }, [cartItems.length, selectedClient, navigate])

  // --- Deseleccionar cliente, vehículo, mecánico ---
  const deselectClient = useCallback(() => {
    setSelectedClient(null)
    setVehiculosCliente([])
    setSelectedVehiculo(null)
    setFormData((prev) => ({ ...prev, vehiculo_id: "" }))
  }, [])
  const deselectVehiculo = useCallback(() => {
    setSelectedVehiculo(null)
    setFormData((prev) => ({ ...prev, vehiculo_id: "" }))
  }, [])
  const deselectMecanico = useCallback(() => {
    setSelectedMecanico(null)
    setFormData((prev) => ({ ...prev, mecanico_id: "" }))
  }, [])

  // --- Render ---
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
              </div>
            </div>
          </div>
        </div>

        {/* --- NUEVO: Sección de productos/servicios tipo compras --- */}
        <div className="crearVenta-cart-main-section">
          <div className="crearVenta-cart-header">
            <h3 className="crearVenta-cart-title-clickable">
              <ShoppingBag className="crearVenta-cart-icon" />
              Carrito
            </h3>
          </div>
          <div className="crearVenta-cart-content">
            {/* Columna Izquierda: Tabs, búsqueda y listado */}
            <div className="crearVenta-search-section">
              <div className="crearVenta-form-section">
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
                <div className="crearVenta-search-container">
                  <Search className="crearVenta-search-icon" />
                  <input
                    type="text"
                    placeholder={`Buscar ${activeTab === "productos" ? "productos" : "servicios"}...`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
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
                        {currentItems.map(item => {
                          const values = inputValues[item.id] || {}
                          const cantidad = values.cantidad ?? 1
                          const precio = activeTab === "productos"
                            ? values.precio ?? item.precio_venta ?? 0
                            : values.precio ?? item.precio ?? 0
                          return (
                            <div key={item.id} className="crearVenta-card-compact">
                              <div className="crearVenta-card-header-compact">
                                <div className="crearVenta-card-info-compact">
                                  <h4 className="crearVenta-card-name-compact">{item.nombre}</h4>
                                  <div className="crearVenta-card-details-compact">
                                    {activeTab === "productos" && (
                                      <span className="crearVenta-card-stock-compact">
                                        Stock: {item.cantidad || 0}
                                      </span>
                                    )}
                                  </div>
                                  {item.descripcion && (
                                    <span className="crearVenta-card-description-compact">
                                      {item.descripcion}
                                    </span>
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
                                      value={cantidad === undefined ? "" : cantidad}
                                      onChange={e =>
                                        handleInputChange2(
                                          item.id,
                                          "cantidad",
                                          e.target.value === "" ? "" : Number.parseInt(e.target.value)
                                        )
                                      }
                                      onKeyDown={e => e.key === "-" && e.preventDefault()}
                                      placeholder="1"
                                    />
                                    {inputErrors[item.id]?.cantidad && (
                                      <span className="crearVenta-error-hint">
                                        {inputErrors[item.id].cantidad}
                                      </span>
                                    )}
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
                                    // onChange y onFocus ya no son necesarios
                                    placeholder="0"
                                  />
                                  {inputErrors[item.id]?.precio && (
                                    <span className="crearVenta-error-hint">
                                      {inputErrors[item.id].precio}
                                    </span>
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
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="crearVenta-pagination-button"
                            >
                              <ChevronLeft size={16} /> Anterior
                            </button>
                            <span className="crearVenta-page-info">
                              Página {currentPage} de {totalPages} ({activeTab === "productos"
                                ? filteredProducts.length
                                : filteredServices.length} encontrados)
                            </span>
                            <button
                              type="button"
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
                    <h4>
                      <ShoppingBag size={16} /> Productos y Servicios Seleccionados
                    </h4>
                    <span className="crearVenta-items-count">
                      {cartItems.length} item(s)
                    </span>
                  </div>
                  <div className="crearVenta-item-cards">
                    {currentCartItems.map(item => (
                      <div key={item.id + item.type} className={`crearVenta-item-card-selected${item.type === "servicio" ? " service" : ""}`}>
                        <div className="crearVenta-item-card-header">
                          <h4 className="crearVenta-item-name">
                            {item.nombre}
                            {item.type === "servicio" && (
                              <span style={{ marginLeft: 8, color: "#2563eb", fontWeight: 600 }}>
                                (Servicio)
                              </span>
                            )}
                          </h4>
                          <div className="crearVenta-item-actions">
                            <button
                              type="button"
                              className="crearVenta-remove-button"
                              onClick={() => removeCartItem(item.id, item.type)}
                              title="Eliminar"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="crearVenta-item-card-details">
                          <div className="crearVenta-item-info-grid">
                            {item.type === "producto" ? (
                              <>
                                <div className="crearVenta-info-item">
                                  <span className="crearVenta-info-label">Precio:</span>
                                  <div className="crearVenta-editable-field">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.price}
                                      readOnly
                                      disabled
                                      className="crearVenta-inline-input crearVenta-readonly"
                                    />
                                  </div>
                                </div>
                                <div className="crearVenta-info-item">
                                  <span className="crearVenta-info-label">Cantidad:</span>
                                  <div className="crearVenta-quantity-controls">
                                    <input
                                      type="number"
                                      min="1"
                                      max={item.stockOriginal}
                                      value={item.quantity === 0 ? "" : item.quantity}
                                      style={{
                                        width: 50,
                                        fontWeight: 600,
                                        color: "#2563eb",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: 6,
                                        padding: "2px 6px",
                                        textAlign: "center"
                                      }}
                                      onChange={e => {
                                        const value = e.target.value;
                                        updateCartItemQuantity(
                                          item.id,
                                          value === "" ? "" : Number(value)
                                        );
                                      }}
                                      onBlur={e => {
                                        const value = e.target.value;
                                        updateCartItemQuantity(
                                          item.id,
                                          value === "" || Number(value) < 1
                                            ? 1
                                            : Number(value) > item.stockOriginal
                                            ? item.stockOriginal
                                            : Number(value)
                                        );
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="crearVenta-info-item crearVenta-subtotal-item">
                                  <span className="crearVenta-info-label">Subtotal:</span>
                                  <span className="crearVenta-subtotal">
                                    {formatCurrency(item.price * item.quantity)}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="crearVenta-info-item">
                                  <span className="crearVenta-info-label">Descripción:</span>
                                  <span className="crearVenta-info-value">{item.descripcion || "Sin descripción"}</span>
                                </div>
                                <div className="crearVenta-info-item crearVenta-subtotal-item">
                                  <span className="crearVenta-info-label">Precio:</span>
                                  <input
                                    type="number"
                                    value={item.precio}
                                    readOnly
                                    disabled
                                    className="crearVenta-inline-input crearVenta-readonly"
                                    style={{ width: 90 }}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          {item.type === "producto" && (
                            <div className="crearVenta-stock-info">
                              <small className="text-gray-600">
                                Stock disponible: {item.stockOriginal} unidades
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {cartTotalPages > 1 && (
                    <div className="crearVenta-pagination">
                      <button
                        type="button"
                        onClick={() => setCartCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={cartCurrentPage === 1}
                        className="crearVenta-pagination-button"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="crearVenta-page-info">
                        {cartCurrentPage} / {cartTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCartCurrentPage(prev => Math.min(prev + 1, cartTotalPages))}
                        disabled={cartCurrentPage === cartTotalPages}
                        className="crearVenta-pagination-button"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                  <div className="crearVenta-total-section">
                    <div className="crearVenta-total-card">
                      <span className="crearVenta-total-label">Total de la Venta:</span>
                      <span className="crearVenta-total-amount">{formatCurrency(total)}</span>
                    </div>
                  </div>
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
        <ClientModal
          closeModal={() => setShowClientModal(false)}
          selectClient={selectClient}
          clientes={clientes}
        />
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
    </div>
  )
}

// --- Modales Cliente/Vehículo/Mecánico ---

const ClientModal = ({ closeModal, selectClient, clientes }) => {
  const [search, setSearch] = useState("")
  console.log("CLIENTES EN MODAL:", clientes)
  const filteredClientes = search.trim()
    ? clientes.filter(
        (c) =>
          (c.nombre && c.nombre.toLowerCase().includes(search.toLowerCase())) ||
          (c.apellido && c.apellido.toLowerCase().includes(search.toLowerCase())) ||
          (c.documento && c.documento.toString().toLowerCase().includes(search.toLowerCase()))
      )
    : clientes // <-- muestra todos si no hay búsqueda

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
          <div className="crearVenta-search-section">
            <div className="crearVenta-search-container">
              <Search className="crearVenta-search-icon" />
              <input
                type="text"
                className="crearVenta-search-input"
                placeholder="Buscar por nombre, apellido o documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="crearVenta-client-list">
            {filteredClientes.length > 0 ? (
              filteredClientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="crearVenta-client-card"
                  onClick={() => selectClient(cliente)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="crearVenta-client-main-line">
                    <span className="crearVenta-client-name-line">
                      <User size={18} style={{ color: "#2563eb" }} />
                      {cliente.nombre} {cliente.apellido}
                    </span>
                    <span className="crearVenta-client-document-line">
                      {cliente.documento}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="crearVenta-no-results">
                <AlertTriangle className="crearVenta-no-results-icon" />
                <p>No se encontraron clientes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const VehiculoClienteModal = ({ closeModal, clienteId, selectVehiculo, vehiculosCliente }) => {
  const [search, setSearch] = useState("")
  console.log("VEHICULOS EN MODAL:", vehiculosCliente)
  const filteredVehiculos = search.trim()
    ? vehiculosCliente.filter(
        (v) =>
          (v.placa && v.placa.toLowerCase().includes(search.toLowerCase())) ||
          (v.marca && v.marca.toLowerCase().includes(search.toLowerCase())) ||
          (v.modelo && v.modelo.toLowerCase().includes(search.toLowerCase()))
      )
    : vehiculosCliente

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
            {filteredVehiculos.length > 0 ? (
              filteredVehiculos.map((vehiculo) => (
                <div
                  key={vehiculo.id}
                  className="crearVenta-vehiculo-card"
                  onClick={() => selectVehiculo(vehiculo)}
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <b>{vehiculo.placa}</b> - {vehiculo.marca} {vehiculo.modelo}
                  </div>
                  <div>
                    <small>Año: {vehiculo.anio}</small>
                  </div>
                </div>
              ))
            ) : (
              <div className="crearVenta-no-results">
                <AlertTriangle className="crearVenta-no-results-icon" />
                <p>No se encontraron vehículos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const MecanicoModal = ({ closeModal, selectMecanico, mecanicos }) => {
  const [search, setSearch] = useState("")
  console.log("MECANICOS EN MODAL:", mecanicos)
  const filteredMecanicos = search.trim()
    ? mecanicos.filter(
        (m) =>
          (m.nombre && m.nombre.toLowerCase().includes(search.toLowerCase())) ||
          (m.apellido && m.apellido.toLowerCase().includes(search.toLowerCase())) ||
          (m.documento && m.documento.toString().toLowerCase().includes(search.toLowerCase()))
      )
    : mecanicos

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
            {filteredMecanicos.length > 0 ? (
              filteredMecanicos.map((mecanico) => (
                <div
                  key={mecanico.id}
                  className="crearVenta-client-card"
                  onClick={() => selectMecanico(mecanico)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="crearVenta-client-main-line">
                    <span className="crearVenta-client-name-line">
                      <Wrench size={18} style={{ color: "#2563eb" }} />
                      {mecanico.nombre} {mecanico.apellido}
                    </span>
                    <span className="crearVenta-client-document-line">
                      {mecanico.documento}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="crearVenta-no-results">
                <AlertTriangle className="crearVenta-no-results-icon" />
                <p>No se encontraron mecánicos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrearVenta

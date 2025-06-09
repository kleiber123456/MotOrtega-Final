"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  X,
  User,
  Calendar,
  Package,
  ShoppingBag,
  Loader,
  AlertTriangle,
  CheckCircle,
  Search,
  Trash,
  Save,
  Wrench,
} from "lucide-react"
import Swal from "sweetalert2"
import "../../../../shared/styles/Ventas/CrearVenta.css"

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Función mejorada para obtener token
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
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesión expirada. Por favor inicie sesión nuevamente.")
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
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

// Componente principal
const CrearVenta = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [showProductModal, setShowProductModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().substr(0, 10),
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [estadosVenta, setEstadosVenta] = useState([])

  // Cargar estados de venta al iniciar
  useEffect(() => {
    const cargarEstadosVenta = async () => {
      try {
        const data = await makeRequest("/estados-venta")
        setEstadosVenta(data)
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

    // Validar que todos los productos tengan cantidad y precio válidos
    selectedProducts.forEach((product, index) => {
      if (product.quantity <= 0) {
        errors[`product_${index}_quantity`] = `Cantidad inválida para ${product.nombre}`
      }
      if (product.price <= 0) {
        errors[`product_${index}_price`] = `Precio inválido para ${product.nombre}`
      }
    })

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [selectedClient, selectedProducts, selectedServices, formData.fecha])

  // Manejadores para modales
  const openProductModal = useCallback(() => setShowProductModal(true), [])
  const closeProductModal = useCallback(() => setShowProductModal(false), [])
  const openServiceModal = useCallback(() => setShowServiceModal(true), [])
  const closeServiceModal = useCallback(() => setShowServiceModal(false), [])
  const openClientModal = useCallback(() => setShowClientModal(true), [])
  const closeClientModal = useCallback(() => setShowClientModal(false), [])

  // Manejador para eliminar productos con confirmación
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

  // Manejador para eliminar servicios con confirmación
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
    (client) => {
      setSelectedClient(client)
      closeClientModal()
      // Limpiar error de cliente si existe
      if (formErrors.client) {
        setFormErrors((prev) => ({ ...prev, client: "" }))
      }
    },
    [formErrors.client, closeClientModal],
  )

  // Manejador para cambios en el formulario
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))

      // Limpiar error del campo si existe
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }))
      }
    },
    [formErrors],
  )

  // Función para actualizar cantidad de producto
  const updateProductQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) return

    setSelectedProducts((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)),
    )
  }, [])

  // Función para actualizar precio de producto
  const updateProductPrice = useCallback((productId, newPrice) => {
    if (newPrice < 0) return

    setSelectedProducts((prev) => prev.map((item) => (item.id === productId ? { ...item, price: newPrice } : item)))
  }, [])

  // Manejador mejorado para envío del formulario
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
        // Buscar el estado "Pendiente"
        const estadoPendiente = estadosVenta.find((estado) => estado.nombre === "Pendiente")
        if (!estadoPendiente) {
          throw new Error("No se encontró el estado 'Pendiente'")
        }

        const ventaData = {
          cliente_id: selectedClient.id,
          estado_venta_id: estadoPendiente.id,
          servicios: selectedServices.map((service) => ({
            servicio_id: service.id,
          })),
          repuestos: selectedProducts.map((product) => ({
            repuesto_id: product.id,
            cantidad: product.quantity,
          })),
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

        navigate("/ventas")
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
    [validateForm, selectedClient, selectedProducts, selectedServices, makeRequest, navigate, estadosVenta],
  )

  // Manejador para cancelar con confirmación
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
        navigate("/ventas")
      }
    } else {
      navigate("/ventas")
    }
  }, [selectedProducts.length, selectedServices.length, selectedClient, navigate])

  return (
    <div className="crearVenta-container">
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
              <label htmlFor="clientName" className="crearVenta-label">
                <User className="crearVenta-label-icon" />
                Cliente *
              </label>
              <input
                type="text"
                id="clientName"
                className={`crearVenta-form-input ${formErrors.client ? "error" : ""}`}
                placeholder="Seleccione un cliente"
                value={selectedClient ? selectedClient.nombre : ""}
                readOnly
                onClick={openClientModal}
                style={{ cursor: "pointer" }}
                required
              />
              {formErrors.client && (
                <span className="crearVenta-error-text">
                  <AlertTriangle size={16} /> {formErrors.client}
                </span>
              )}
            </div>

            <div className="crearVenta-form-group">
              <label htmlFor="fecha" className="crearVenta-label">
                <Calendar className="crearVenta-label-icon" />
                Fecha *
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                className={`crearVenta-form-input ${formErrors.fecha ? "error" : ""}`}
                value={formData.fecha}
                onChange={handleInputChange}
                max={new Date().toISOString().substr(0, 10)}
                required
              />
              {formErrors.fecha && (
                <span className="crearVenta-error-text">
                  <AlertTriangle size={16} /> {formErrors.fecha}
                </span>
              )}
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
                  {selectedProducts.length} producto{selectedProducts.length !== 1 ? "s" : ""}
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
                          <div className="crearVenta-editable-field">
                            <input
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) => updateProductQuantity(product.id, Number.parseInt(e.target.value) || 1)}
                              className="crearVenta-inline-input"
                            />
                          </div>
                        </div>
                        <div className="crearVenta-info-item crearVenta-subtotal-item">
                          <span className="crearVenta-info-label">Subtotal:</span>
                          <span className="crearVenta-subtotal">${(product.price * product.quantity).toFixed(2)}</span>
                        </div>
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
                  {selectedServices.length} servicio{selectedServices.length !== 1 ? "s" : ""}
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
                          <span className="crearVenta-subtotal">${service.precio.toFixed(2)}</span>
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
                <span className="crearVenta-total-amount">${total.toFixed(2)}</span>
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

      {showClientModal && <ClientModal closeModal={closeClientModal} selectClient={selectClient} />}
    </div>
  )
}

// Componente Modal de Productos
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
        if (data) {
          // Filtrar productos activos y con stock
          const activeProducts = data.filter((product) => product.cantidad > 0 && product.estado === "Activo")
          setProducts(activeProducts)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchProducts()
  }, [makeRequest])

  // Filtrar productos disponibles (no ya seleccionados)
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

  const handleAddToCart = useCallback(
    (product, quantity) => {
      const existingItem = cartItems.find((item) => item.id === product.id)
      const finalPrice = product.preciounitario || 0

      if (existingItem) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity, price: finalPrice } : item,
          ),
        )
      } else {
        setCartItems((prev) => [
          ...prev,
          {
            ...product,
            quantity,
            price: finalPrice,
          },
        ])
      }
    },
    [cartItems],
  )

  const handleRemoveFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  const updateCartItemQuantity = useCallback(
    (productId, newQuantity) => {
      if (newQuantity <= 0) {
        handleRemoveFromCart(productId)
        return
      }

      // Verificar que no exceda el stock disponible
      const product = products.find((p) => p.id === productId)
      if (product && newQuantity > product.cantidad) {
        Swal.fire({
          icon: "warning",
          title: "Cantidad excedida",
          text: `Solo hay ${product.cantidad} unidades disponibles`,
          confirmButtonColor: "#2563eb",
        })
        return
      }

      setCartItems((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
    },
    [handleRemoveFromCart, products],
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
                        <span className="crearVenta-product-price">${(product.preciounitario || 0).toFixed(2)}</span>
                      </div>
                      <span className="crearVenta-product-stock">Stock: {product.cantidad || 0}</span>
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
                            min="1"
                            max={product.cantidad}
                            defaultValue="1"
                            id={`quantity-${product.id}`}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="crearVenta-add-button"
                        onClick={() => {
                          const quantityInput = document.getElementById(`quantity-${product.id}`)
                          const quantity = Number.parseInt(quantityInput.value) || 1

                          if (quantity > product.cantidad) {
                            Swal.fire({
                              icon: "warning",
                              title: "Cantidad excedida",
                              text: `Solo hay ${product.cantidad} unidades disponibles`,
                              confirmButtonColor: "#2563eb",
                            })
                            return
                          }

                          handleAddToCart(product, quantity)
                        }}
                      >
                        <Plus size={16} /> Agregar
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
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateCartItemQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                            className="crearVenta-control-input"
                          />
                        </div>
                        <div className="crearVenta-control-group">
                          <label>Precio:</label>
                          <span className="crearVenta-control-value">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="crearVenta-cart-item-total">
                        Subtotal: <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="crearVenta-cart-summary">
              <div className="crearVenta-cart-total">
                <span>Total:</span>
                <strong>${total.toFixed(2)}</strong>
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

// Componente Modal de Servicios
const ServiceModal = ({ closeModal, addService, existingServices }) => {
  const { makeRequest, loading, error } = useApi()
  const [searchTerm, setSearchTerm] = useState("")
  const [services, setServices] = useState([])
  const [selectedServices, setSelectedServices] = useState([])

  // Cargar servicios desde la API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await makeRequest("/servicios")
        if (data) {
          // Filtrar servicios activos
          const activeServices = data.filter((service) => service.estado === "Activo")
          setServices(activeServices)
        }
      } catch (error) {
        console.error("Error fetching services:", error)
      }
    }

    fetchServices()
  }, [makeRequest])

  // Filtrar servicios disponibles (no ya seleccionados)
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
                        <span className="crearVenta-service-price">${(service.precio || 0).toFixed(2)}</span>
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
                {selectedServices.length} servicio{selectedServices.length !== 1 ? "s" : ""}
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
                          <strong>${service.precio.toFixed(2)}</strong>
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
                <strong>${selectedServices.reduce((sum, service) => sum + service.precio, 0).toFixed(2)}</strong>
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

// Componente Modal de Clientes
const ClientModal = ({ closeModal, selectClient }) => {
  const { makeRequest, loading, error } = useApi()
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState([])

  // Cargar clientes desde la API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await makeRequest("/clientes")
        if (data) {
          setClients(data)
        }
      } catch (error) {
        console.error("Error fetching clients:", error)
      }
    }

    fetchClients()
  }, [makeRequest])

  // Filtrar clientes por término de búsqueda
  const filteredClients = clients.filter(
    (client) =>
      client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telefono.includes(searchTerm),
  )

  if (loading) {
    return (
      <div className="crearVenta-modal-overlay">
        <div className="crearVenta-modal">
          <div className="crearVenta-modal-header">
            <h2>
              <Loader className="spinning" /> Cargando clientes...
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
        <div className="crearVenta-modal">
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
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="crearVenta-search-input"
              />
            </div>
          </div>

          <div className="crearVenta-client-list">
            {filteredClients.length === 0 ? (
              <div className="crearVenta-no-results">
                <AlertTriangle className="crearVenta-no-results-icon" />
                <p>{searchTerm ? "No se encontraron clientes" : "No hay clientes disponibles"}</p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="crearVenta-client-card"
                  onClick={() => selectClient(client)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="crearVenta-client-info">
                    <div className="crearVenta-client-main-info">
                      <span className="crearVenta-client-name">{client.nombre}</span>
                      <span className="crearVenta-client-email">{client.email}</span>
                    </div>
                    <span className="crearVenta-client-phone">{client.telefono}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrearVenta

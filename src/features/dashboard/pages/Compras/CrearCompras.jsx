"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaPlus,
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaBoxes,
  FaShoppingCart,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaTrash,
  FaSave,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/CrearCompras.css"

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

// Componente principal mejorado
const CrearCompra = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [showProductModal, setShowProductModal] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().substr(0, 10),
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calcular el total cuando cambian los productos seleccionados
  useEffect(() => {
    const productsTotal = selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotal(productsTotal)
  }, [selectedProducts])

  // Validaciones del formulario
  const validateForm = useCallback(() => {
    const errors = {}

    if (!selectedSupplier) {
      errors.supplier = "Debe seleccionar un proveedor"
    }

    if (selectedProducts.length === 0) {
      errors.products = "Debe seleccionar al menos un producto"
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
  }, [selectedSupplier, selectedProducts, formData.fecha])

  // Manejadores para modales
  const openProductModal = useCallback(() => setShowProductModal(true), [])
  const closeProductModal = useCallback(() => setShowProductModal(false), [])
  const openSupplierModal = useCallback(() => setShowSupplierModal(true), [])
  const closeSupplierModal = useCallback(() => setShowSupplierModal(false), [])

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

  // Manejador para seleccionar proveedor
  const selectSupplier = useCallback(
    (supplier) => {
      setSelectedSupplier(supplier)
      closeSupplierModal()
      // Limpiar error de proveedor si existe
      if (formErrors.supplier) {
        setFormErrors((prev) => ({ ...prev, supplier: "" }))
      }
    },
    [formErrors.supplier, closeSupplierModal],
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
        const compraData = {
          proveedor_id: selectedSupplier.id,
          detalles: selectedProducts.map((product) => ({
            repuesto_id: product.id,
            cantidad: product.quantity,
            precio_compra: product.price,
          })),
          estado: "Pendiente",
        }

        await makeRequest("/compras", {
          method: "POST",
          body: JSON.stringify(compraData),
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "La compra ha sido registrada correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/ListarCompras")
      } catch (error) {
        console.error("Error al crear compra:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo registrar la compra",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [validateForm, selectedSupplier, selectedProducts, makeRequest, navigate],
  )

  // Manejador para cancelar con confirmación
  const handleCancel = useCallback(async () => {
    if (selectedProducts.length > 0 || selectedSupplier) {
      const result = await Swal.fire({
        title: "¿Cancelar compra?",
        text: "Se perderán todos los datos ingresados",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Continuar editando",
      })

      if (result.isConfirmed) {
        navigate("/ListarCompras")
      }
    } else {
      navigate("/ListarCompras")
    }
  }, [selectedProducts.length, selectedSupplier, navigate])

  return (
    <div className="crearCompra-container">
      <div className="crearCompra-header">
        <div className="crearCompra-title-section">
          <h1 className="crearCompra-page-title">
            <FaShoppingCart className="crearCompra-title-icon" />
            Crear Compra
          </h1>
          <p className="crearCompra-subtitle">Registra una nueva compra de productos</p>
        </div>
      </div>

      <form className="crearCompra-form" onSubmit={handleSubmit}>
        <div className="crearCompra-form-section">
          <h3 className="crearCompra-section-title">
            <FaUser className="crearCompra-section-icon" />
            Información General
          </h3>
          <div className="crearCompra-form-grid">
            <div className="crearCompra-form-group">
              <label htmlFor="supplierName" className="crearCompra-label">
                <FaUser className="crearCompra-label-icon" />
                Proveedor *
              </label>
              <input
                type="text"
                id="supplierName"
                className={`crearCompra-form-input ${formErrors.supplier ? "error" : ""}`}
                placeholder="Seleccione un proveedor"
                value={selectedSupplier ? selectedSupplier.nombre : ""}
                readOnly
                onClick={openSupplierModal}
                style={{ cursor: "pointer" }}
                required
              />
              {formErrors.supplier && (
                <span className="crearCompra-error-text">
                  <FaExclamationTriangle /> {formErrors.supplier}
                </span>
              )}
            </div>

            <div className="crearCompra-form-group">
              <label htmlFor="fecha" className="crearCompra-label">
                <FaCalendarAlt className="crearCompra-label-icon" />
                Fecha *
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                className={`crearCompra-form-input ${formErrors.fecha ? "error" : ""}`}
                value={formData.fecha}
                onChange={handleInputChange}
                max={new Date().toISOString().substr(0, 10)}
                required
              />
              {formErrors.fecha && (
                <span className="crearCompra-error-text">
                  <FaExclamationTriangle /> {formErrors.fecha}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="crearCompra-form-section">
          <h3 className="crearCompra-section-title">
            <FaBoxes className="crearCompra-section-icon" />
            Productos
          </h3>
          <div className="crearCompra-add-products-section">
            <button
              type="button"
              className="crearCompra-create-button"
              onClick={openProductModal}
              disabled={isSubmitting}
            >
              <FaPlus className="crearCompra-button-icon" />
              Añadir Productos
            </button>
          </div>

          {formErrors.products && (
            <div className="crearCompra-error-message">
              <FaExclamationTriangle /> {formErrors.products}
            </div>
          )}

          {/* Sección de productos seleccionados mejorada */}
          {selectedProducts.length > 0 && (
            <div className="crearCompra-selected-products-section">
              <div className="crearCompra-products-header">
                <h4>Productos Seleccionados</h4>
                <span className="crearCompra-products-count">
                  {selectedProducts.length} producto{selectedProducts.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="crearCompra-product-cards">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="crearCompra-product-card-selected">
                    <div className="crearCompra-product-card-header">
                      <h4 className="crearCompra-product-name">{product.nombre}</h4>
                      <div className="crearCompra-product-actions">
                        <button
                          type="button"
                          className="crearCompra-remove-button"
                          onClick={() => removeProduct(product.id)}
                          title="Eliminar producto"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div className="crearCompra-product-card-details">
                      <div className="crearCompra-product-info-grid">
                        <div className="crearCompra-info-item">
                          <span className="crearCompra-info-label">Precio:</span>
                          <div className="crearCompra-editable-field">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={product.price}
                              onChange={(e) => updateProductPrice(product.id, Number.parseFloat(e.target.value) || 0)}
                              className="crearCompra-inline-input"
                            />
                          </div>
                        </div>
                        <div className="crearCompra-info-item">
                          <span className="crearCompra-info-label">Cantidad:</span>
                          <div className="crearCompra-editable-field">
                            <input
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) => updateProductQuantity(product.id, Number.parseInt(e.target.value) || 1)}
                              className="crearCompra-inline-input"
                            />
                          </div>
                        </div>
                        <div className="crearCompra-info-item crearCompra-subtotal-item">
                          <span className="crearCompra-info-label">Subtotal:</span>
                          <span className="crearCompra-subtotal">${(product.price * product.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="crearCompra-total-section">
                <div className="crearCompra-total-card">
                  <span className="crearCompra-total-label">Total de la Compra:</span>
                  <span className="crearCompra-total-amount">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acciones del formulario mejoradas */}
        <div className="crearCompra-form-actions">
          <button type="button" className="crearCompra-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="crearCompra-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearCompra-submit-button" disabled={isSubmitting || apiLoading}>
            {isSubmitting ? (
              <>
                <FaSpinner className="crearCompra-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="crearCompra-button-icon" />
                Guardar Compra
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

      {showSupplierModal && <SupplierModal closeModal={closeSupplierModal} selectSupplier={selectSupplier} />}
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
          const activeProducts = data.filter((product) => product.cantidad > 0 && product.nombre)
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
    (product, quantity, customPrice) => {
      const existingItem = cartItems.find((item) => item.id === product.id)
      const finalPrice = customPrice || product.preciounitario || 0

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

      setCartItems((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
    },
    [handleRemoveFromCart],
  )

  const updateCartItemPrice = useCallback((productId, newPrice) => {
    const numericPrice = Math.max(0, newPrice)
    setCartItems((prev) => prev.map((item) => (item.id === productId ? { ...item, price: numericPrice } : item)))
  }, [])

  const handleConfirm = useCallback(async () => {
    if (cartItems.length > 0) {
      addProduct(cartItems)
      await Swal.fire({
        icon: "success",
        title: "Productos agregados",
        text: `Se agregaron ${cartItems.length} producto(s) a la compra`,
        timer: 1500,
        showConfirmButton: false,
      })
      closeModal()
    }
  }, [cartItems, addProduct, closeModal])

  if (loading) {
    return (
      <div className="crearCompra-modal-overlay">
        <div className="crearCompra-large-modal">
          <div className="crearCompra-modal-header">
            <h2>
              <FaSpinner className="spinning" /> Cargando productos...
            </h2>
            <button type="button" className="crearCompra-close-modal-button" onClick={closeModal}>
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="crearCompra-modal-overlay">
        <div className="crearCompra-large-modal">
          <div className="crearCompra-modal-header">
            <h2>
              <FaExclamationTriangle /> Error
            </h2>
            <button type="button" className="crearCompra-close-modal-button" onClick={closeModal}>
              <FaTimes />
            </button>
          </div>
          <div className="crearCompra-modal-content">
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
    <div className="crearCompra-modal-overlay">
      <div className="crearCompra-large-modal">
        <div className="crearCompra-modal-header">
          <h2>
            <FaBoxes className="crearCompra-modal-icon" />
            Añadir Productos
          </h2>
          <button type="button" className="crearCompra-close-modal-button" onClick={closeModal}>
            <FaTimes />
          </button>
        </div>

        <div className="crearCompra-modal-content">
          <div className="crearCompra-left-pane">
            <div className="crearCompra-search-section">
              <h4>Buscar Productos</h4>
              <div className="crearCompra-search-container">
                <FaSearch className="crearCompra-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="crearCompra-search-input"
                />
              </div>
            </div>

            <div className="crearCompra-product-list">
              {availableProducts.length === 0 ? (
                <div className="crearCompra-no-results">
                  <FaExclamationTriangle className="crearCompra-no-results-icon" />
                  <p>{searchTerm ? "No se encontraron productos" : "No hay productos disponibles"}</p>
                </div>
              ) : (
                availableProducts.map((product) => (
                  <div key={product.id} className="crearCompra-product-card">
                    <div className="crearCompra-product-info">
                      <div className="crearCompra-product-main-info">
                        <span className="crearCompra-product-name">{product.nombre}</span>
                        <span className="crearCompra-product-price">${(product.preciounitario || 0).toFixed(2)}</span>
                      </div>
                      <span className="crearCompra-product-stock">Stock: {product.cantidad || 0}</span>
                      {product.descripcion && (
                        <span className="crearCompra-product-description">{product.descripcion}</span>
                      )}
                    </div>
                    <div className="crearCompra-product-actions">
                      <div className="crearCompra-input-group">
                        <div className="crearCompra-input-item">
                          <label>Cantidad</label>
                          <input
                            type="number"
                            className="crearCompra-quantity-input"
                            min="1"
                            max={product.cantidad}
                            defaultValue="1"
                            id={`quantity-${product.id}`}
                          />
                        </div>
                        <div className="crearCompra-input-item">
                          <label>Precio</label>
                          <input
                            type="number"
                            className="crearCompra-quantity-input"
                            min="0"
                            step="0.01"
                            defaultValue={product.preciounitario || 0}
                            id={`price-${product.id}`}
                            onFocus={(e) => e.target.select()}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="crearCompra-add-button"
                        onClick={() => {
                          const quantityInput = document.getElementById(`quantity-${product.id}`)
                          const priceInput = document.getElementById(`price-${product.id}`)
                          const quantity = Number.parseInt(quantityInput.value) || 1
                          const customPrice = Number.parseFloat(priceInput.value) || product.preciounitario || 0

                          if (quantity > product.cantidad) {
                            Swal.fire({
                              icon: "warning",
                              title: "Cantidad excedida",
                              text: `Solo hay ${product.cantidad} unidades disponibles`,
                              confirmButtonColor: "#2563eb",
                            })
                            return
                          }

                          handleAddToCart(product, quantity, customPrice)
                        }}
                      >
                        <FaPlus /> Agregar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="crearCompra-right-pane">
            <div className="crearCompra-cart-header">
              <h4>Productos Seleccionados</h4>
              <span className="crearCompra-cart-count">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="crearCompra-cart-items">
              {cartItems.length === 0 ? (
                <div className="crearCompra-empty-cart-message">
                  <FaShoppingCart className="crearCompra-empty-icon" />
                  <p>No hay productos seleccionados</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="crearCompra-cart-item">
                    <div className="crearCompra-cart-item-header">
                      <span className="crearCompra-cart-item-name">{item.nombre}</span>
                      <button
                        type="button"
                        className="crearCompra-remove-cart-item"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="crearCompra-cart-item-details">
                      <div className="crearCompra-cart-controls">
                        <div className="crearCompra-control-group">
                          <label>Cantidad:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateCartItemQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                            className="crearCompra-control-input"
                          />
                        </div>
                        <div className="crearCompra-control-group">
                          <label>Precio:</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price || 0}
                            onChange={(e) => updateCartItemPrice(item.id, Number.parseFloat(e.target.value) || 0)}
                            className="crearCompra-control-input"
                            onFocus={(e) => e.target.select()}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="crearCompra-cart-item-total">
                        Subtotal: <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="crearCompra-cart-summary">
              <div className="crearCompra-cart-total">
                <span>Total:</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <button
                type="button"
                className="crearCompra-confirm-cart-button"
                onClick={handleConfirm}
                disabled={cartItems.length === 0}
              >
                <FaCheckCircle className="crearCompra-button-icon" />
                Confirmar Selección ({cartItems.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente Modal de Proveedores
const SupplierModal = ({ closeModal, selectSupplier }) => {
  const { makeRequest, loading, error } = useApi()
  const [searchTerm, setSearchTerm] = useState("")
  const [suppliers, setSuppliers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // Cargar proveedores desde la API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await makeRequest("/proveedores")
        if (data) {
          setSuppliers(data)
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error)
      }
    }

    fetchSuppliers()
  }, [makeRequest])

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      (supplier.nombre && supplier.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.documento && supplier.documento.includes(searchTerm)),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), [])

  const handleSelectSupplier = useCallback(
    async (supplier) => {
      selectSupplier(supplier)
      await Swal.fire({
        icon: "success",
        title: "Proveedor seleccionado",
        text: `${supplier.nombre} ha sido seleccionado`,
        timer: 1500,
        showConfirmButton: false,
      })
    },
    [selectSupplier],
  )

  if (loading) {
    return (
      <div className="crearCompra-supplier-modal-overlay">
        <div className="crearCompra-supplier-modal">
          <div className="crearCompra-supplier-modal-header">
            <h2>
              <FaSpinner className="spinning" /> Cargando proveedores...
            </h2>
            <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
              <FaTimes />
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
              <FaExclamationTriangle /> Error
            </h2>
            <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
              <FaTimes />
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
            <FaUser className="crearCompra-modal-icon" />
            Seleccionar Proveedor
          </h2>
          <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
            <FaTimes />
          </button>
        </div>

        <div className="crearCompra-supplier-modal-content">
          <div className="crearCompra-supplier-search-container">
            <FaSearch className="crearCompra-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o documento..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page when searching
              }}
              className="crearCompra-supplier-search-input"
            />
          </div>

          <div className="crearCompra-suppliers-list">
            {currentItems.length === 0 ? (
              <div className="crearCompra-supplier-no-results">
                <FaExclamationTriangle className="crearCompra-no-results-icon" />
                <p>{searchTerm ? "No se encontraron proveedores" : "No hay proveedores disponibles"}</p>
              </div>
            ) : (
              <table className="crearCompra-suppliers-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Contacto</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((supplier) => (
                    <tr key={supplier.id} className="crearCompra-supplier-row">
                      <td>
                        <div className="crearCompra-supplier-name">{supplier.nombre || "N/A"}</div>
                      </td>
                      <td>{supplier.documento || "N/A"}</td>
                      <td>
                        <div className="crearCompra-supplier-contact">
                          <div>{supplier.email || "N/A"}</div>
                          <div>{supplier.telefono || "N/A"}</div>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="crearCompra-supplier-select-button"
                          onClick={() => handleSelectSupplier(supplier)}
                        >
                          <FaCheckCircle /> Seleccionar
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
                onClick={() => paginate(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="crearCompra-supplier-pagination-button"
              >
                Anterior
              </button>

              <span className="crearCompra-supplier-page-info">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="crearCompra-supplier-pagination-button"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CrearCompra

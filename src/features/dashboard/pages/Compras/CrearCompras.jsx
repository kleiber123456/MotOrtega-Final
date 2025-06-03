"use client"

import { useState, useEffect } from "react"
import { FaPlus, FaTimes, FaUser, FaCalendarAlt, FaBoxes, FaShoppingCart } from "react-icons/fa"
import "../../../../shared/styles/CrearCompras.css"


// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Actualizar la función getValidToken para buscar el token en localStorage y sessionStorage
const getValidToken = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  if (!token) {
    console.error("No hay token en localStorage ni en sessionStorage")
    return null
  }
  return token
}

// Componente principal
const ComprasForm = () => {
  const [showProductModal, setShowProductModal] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().substr(0, 10),
  })

  // Calcular el total cuando cambian los productos seleccionados
  useEffect(() => {
    const productsTotal = selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotal(productsTotal)
  }, [selectedProducts])

  // Manejadores para abrir/cerrar modales
  const openProductModal = () => setShowProductModal(true)
  const closeProductModal = () => setShowProductModal(false)
  const openSupplierModal = () => setShowSupplierModal(true)
  const closeSupplierModal = () => setShowSupplierModal(false)

  // Manejador para eliminar productos
  const removeProduct = (id) => {
    setSelectedProducts(selectedProducts.filter((item) => item.id !== id))
  }

  // Manejador para seleccionar proveedor
  const selectSupplier = (supplier) => {
    setSelectedSupplier(supplier)
    closeSupplierModal()
  }

  // Manejador para cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Modificar la función handleSubmit para redirigir al listado
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones
    if (!selectedSupplier) {
      alert("Por favor seleccione un proveedor")
      return
    }

    if (selectedProducts.length === 0) {
      alert("Por favor seleccione al menos un producto")
      return
    }

    // Validar token antes de hacer la petición
    const token = getValidToken()
    if (!token) {
      alert("Error de autenticación. Por favor inicie sesión nuevamente.")
      return
    }

    try {
      const compraData = {
        proveedor_id: selectedSupplier.id,
        detalles: selectedProducts.map((product) => ({
          repuesto_id: product.id,
          cantidad: product.quantity,
        })),
        estado: "Pendiente",
      }

      const response = await fetch(`${API_BASE_URL}/compras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(compraData),
      })

      if (response.ok) {
        const result = await response.json()
        alert("Compra guardada exitosamente")

        // Redirigir al listado de compras
        window.location.href = "/ListarCompras"
      } else if (response.status === 401) {
        alert("Error de autenticación. Por favor inicie sesión nuevamente.")
      } else {
        const error = await response.json()
        alert(`Error al guardar la compra: ${error.message || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión al guardar la compra")
    }
  }

  return (
    <div className="crearCompras-container">
      <div className="crearCompras-header">
        <h1 className="crearCompras-page-title">
          <FaShoppingCart className="crearCompras-title-icon" />
          Nueva Compra
        </h1>
        <p className="crearCompras-subtitle">Registra una nueva compra de productos</p>
      </div>

      <form className="crearCompras-form" onSubmit={handleSubmit}>
        <div className="crearCompras-form-section">
          <h3 className="crearCompras-section-title">Información General</h3>
          <div className="crearCompras-form-grid">
            <div className="crearCompras-form-group">
              <label htmlFor="supplierName" className="crearCompras-label">
                <FaUser className="crearCompras-label-icon" />
                Proveedor
              </label>
              <input
                type="text"
                id="supplierName"
                className="crearCompras-form-input"
                placeholder="Seleccione un proveedor"
                value={selectedSupplier ? selectedSupplier.nombre : ""}
                readOnly
                onClick={openSupplierModal}
                style={{ cursor: "pointer" }}
                required
              />
            </div>

            <div className="crearCompras-form-group">
              <label htmlFor="fecha" className="crearCompras-label">
                <FaCalendarAlt className="crearCompras-label-icon" />
                Fecha
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                className="crearCompras-form-input"
                value={formData.fecha}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="crearCompras-form-section">
          <h3 className="crearCompras-section-title">
            <FaBoxes className="crearCompras-section-icon" />
            Productos
          </h3>
          <div className="crearCompras-add-products-section">
            <button type="button" className="crearCompras-create-button" onClick={openProductModal}>
              <FaPlus className="crearCompras-button-icon" /> Añadir Producto
            </button>
          </div>

          {/* Sección de productos seleccionados */}
          {selectedProducts.length > 0 && (
            <div className="crearCompras-selected-products-section">
              <div className="crearCompras-products-header">
                <h4>Productos Seleccionados</h4>
                <span className="crearCompras-products-count">
                  {selectedProducts.length} producto{selectedProducts.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="crearCompras-product-cards">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="crearCompras-product-card-selected">
                    <div className="crearCompras-product-card-header">
                      <h4 className="crearCompras-product-name">{product.nombre}</h4>
                      <button
                        type="button"
                        className="crearCompras-remove-button"
                        onClick={() => removeProduct(product.id)}
                        title="Eliminar producto"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="crearCompras-product-card-details">
                      <div className="crearCompras-product-info-grid">
                        <div className="crearCompras-info-item">
                          <span className="crearCompras-info-label">Precio:</span>
                          <span className="crearCompras-info-value">${product.price.toFixed(2)}</span>
                        </div>
                        <div className="crearCompras-info-item">
                          <span className="crearCompras-info-label">Cantidad:</span>
                          <span className="crearCompras-info-value">{product.quantity}</span>
                        </div>
                        <div className="crearCompras-info-item crearCompras-subtotal-item">
                          <span className="crearCompras-info-label">Subtotal:</span>
                          <span className="crearCompras-subtotal">
                            ${(product.price * product.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="crearCompras-total-section">
                <div className="crearCompras-total-card">
                  <span className="crearCompras-total-label">Total de la Compra:</span>
                  <span className="crearCompras-total-amount">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acciones del formulario */}
        <div className="crearCompras-form-actions">
          {/* Mejorar el botón cancelar para también redirigir */}
          <button
            type="button"
            className="crearCompras-cancel-button"
            onClick={() => (window.location.href = "/ListarCompras")}
          >
            <FaTimes className="crearCompras-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearCompras-submit-button">
            <FaPlus className="crearCompras-button-icon" />
            Guardar Compra
          </button>
        </div>
      </form>

      {/* Modal de productos */}
      {showProductModal && (
        <ProductModal
          closeModal={closeProductModal}
          addProduct={(products) => {
            if (Array.isArray(products)) {
              setSelectedProducts([...selectedProducts, ...products])
            } else {
              setSelectedProducts([...selectedProducts, products])
            }
          }}
        />
      )}

      {/* Modal de proveedores */}
      {showSupplierModal && <SupplierModal closeModal={closeSupplierModal} selectSupplier={selectSupplier} />}
    </div>
  )
}

// Componente Modal de Productos
const ProductModal = ({ closeModal, addProduct }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Validar token antes de hacer la petición
        const token = getValidToken()
        if (!token) {
          setError("Error de autenticación. Por favor inicie sesión nuevamente.")
          setLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/repuestos`, {
          headers: {
            Authorization: token,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        } else if (response.status === 401) {
          setError("Error de autenticación. Por favor inicie sesión nuevamente.")
        } else {
          throw new Error("Error al cargar productos")
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Error al cargar los productos")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(
    (product) => product.nombre && product.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // En la función handleAddToCart, mejorar el manejo de precios
  const handleAddToCart = (product, quantity, customPrice) => {
    const existingItem = cartItems.find((item) => item.id === product.id)
    // Asegurar que el precio sea un número válido
    const finalPrice = Number.parseFloat(customPrice) || Number.parseFloat(product.precio) || 0

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity, price: finalPrice } : item,
        ),
      )
    } else {
      setCartItems([
        ...cartItems,
        {
          ...product,
          quantity,
          price: finalPrice,
        },
      ])
    }
  }

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.id !== productId))
  }

  // Función para actualizar cantidad en el carrito
  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId)
      return
    }

    setCartItems(cartItems.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
  }

  // Función mejorada para actualizar precio en el carrito
  const updateCartItemPrice = (productId, newPrice) => {
    // Limpiar el valor y convertir a número
    const cleanPrice = newPrice.toString().replace(/[^\d.]/g, "")
    const numericPrice = Number.parseFloat(cleanPrice) || 0

    setCartItems(cartItems.map((item) => (item.id === productId ? { ...item, price: numericPrice } : item)))
  }

  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotal(newTotal)
  }, [cartItems])

  const handleConfirm = () => {
    if (cartItems.length > 0) {
      addProduct(cartItems)
      closeModal()
    }
  }

  if (loading) {
    return (
      <div className="crearCompras-modal-overlay">
        <div className="crearCompras-large-modal">
          <div className="crearCompras-modal-header">
            <h2>Cargando productos...</h2>
            <button type="button" className="crearCompras-close-modal-button" onClick={closeModal}>
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="crearCompras-modal-overlay">
        <div className="crearCompras-large-modal">
          <div className="crearCompras-modal-header">
            <h2>Error</h2>
            <button type="button" className="crearCompras-close-modal-button" onClick={closeModal}>
              <FaTimes />
            </button>
          </div>
          <div className="crearCompras-modal-content">
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="crearCompras-modal-overlay">
      <div className="crearCompras-large-modal">
        <div className="crearCompras-modal-header">
          <h2>
            <FaBoxes className="crearCompras-modal-icon" />
            Añadir Productos
          </h2>
          <button type="button" className="crearCompras-close-modal-button" onClick={closeModal}>
            <FaTimes />
          </button>
        </div>

        <div className="crearCompras-modal-content">
          <div className="crearCompras-left-pane">
            <div className="crearCompras-search-section">
              <h4>Buscar Productos</h4>
              <div className="crearCompras-search-bar">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="crearCompras-product-list">
              {filteredProducts.length === 0 ? (
                <div className="crearCompras-no-results">No se encontraron productos</div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="crearCompras-product-card">
                    <div className="crearCompras-product-info">
                      <div className="crearCompras-product-main-info">
                        <span className="crearCompras-product-name">{product.nombre}</span>
                        <span className="crearCompras-product-price">${(product.precio || 0).toFixed(2)}</span>
                      </div>
                      <span className="crearCompras-product-stock">Stock: {product.stock || 0}</span>
                    </div>
                    <div className="crearCompras-product-actions">
                      <div className="crearCompras-input-group">
                        <div className="crearCompras-input-item">
                          <label>Cantidad</label>
                          <input
                            type="number"
                            className="crearCompras-quantity-input"
                            min="1"
                            defaultValue="1"
                            id={`quantity-${product.id}`}
                          />
                        </div>
                        {/* En el JSX del modal de productos, mejorar los inputs de precio */}
                        <div className="crearCompras-input-item">
                          <label>Precio</label>
                          <input
                            type="number"
                            className="crearCompras-quantity-input"
                            min="0"
                            step="0.01"
                            defaultValue={product.precio || 0}
                            id={`price-${product.id}`}
                            onFocus={(e) => e.target.select()}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="crearCompras-add-button"
                        onClick={() => {
                          const quantityInput = document.getElementById(`quantity-${product.id}`)
                          const priceInput = document.getElementById(`price-${product.id}`)
                          const quantity = Number.parseInt(quantityInput.value, 10) || 1
                          const customPrice = Number.parseFloat(priceInput.value) || product.precio || 0
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

          <div className="crearCompras-right-pane">
            <div className="crearCompras-cart-header">
              <h4>Productos Seleccionados</h4>
              <span className="crearCompras-cart-count">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="crearCompras-cart-items">
              {cartItems.length === 0 ? (
                <div className="crearCompras-empty-cart-message">
                  <FaShoppingCart className="crearCompras-empty-icon" />
                  <p>No hay productos seleccionados</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="crearCompras-cart-item">
                    <div className="crearCompras-cart-item-header">
                      <span className="crearCompras-cart-item-name">{item.nombre}</span>
                      <button
                        type="button"
                        className="crearCompras-remove-cart-item"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="crearCompras-cart-item-details">
                      <div className="crearCompras-cart-controls">
                        <div className="crearCompras-control-group">
                          <label>Cantidad:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateCartItemQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                            className="crearCompras-control-input"
                          />
                        </div>
                        <div className="crearCompras-control-group">
                          <label>Precio:</label>
                          {/* En el JSX del carrito, mejorar el input de precio */}
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price || 0}
                            onChange={(e) => updateCartItemPrice(item.id, e.target.value)}
                            className="crearCompras-control-input"
                            onFocus={(e) => e.target.select()}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="crearCompras-cart-item-total">
                        Subtotal: <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="crearCompras-cart-summary">
              <div className="crearCompras-cart-total">
                <span>Total:</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <button
                type="button"
                className="crearCompras-confirm-cart-button"
                onClick={handleConfirm}
                disabled={cartItems.length === 0}
              >
                <FaPlus className="crearCompras-button-icon" />
                Confirmar Selección
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
  const [searchTerm, setSearchTerm] = useState("")
  const [suppliers, setSuppliers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar proveedores desde la API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true)
        setError(null)

        // Validar token antes de hacer la petición
        const token = getValidToken()
        if (!token) {
          setError("Error de autenticación. Por favor inicie sesión nuevamente.")
          setLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/proveedores`, {
          headers: {
            Authorization: token,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setSuppliers(data)
        } else if (response.status === 401) {
          setError("Error de autenticación. Por favor inicie sesión nuevamente.")
        } else {
          throw new Error("Error al cargar proveedores")
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error)
        setError("Error al cargar los proveedores")
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      (supplier.nombre && supplier.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.documento && supplier.documento.includes(searchTerm)),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <div className="crearCompras-supplier-modal-overlay">
        <div className="crearCompras-supplier-modal">
          <div className="crearCompras-supplier-modal-header">
            <h2>Cargando proveedores...</h2>
            <button type="button" className="crearCompras-supplier-close-button" onClick={closeModal}>
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="crearCompras-supplier-modal-overlay">
        <div className="crearCompras-supplier-modal">
          <div className="crearCompras-supplier-modal-header">
            <h2>Error</h2>
            <button type="button" className="crearCompras-supplier-close-button" onClick={closeModal}>
              <FaTimes />
            </button>
          </div>
          <div className="crearCompras-supplier-modal-content">
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="crearCompras-supplier-modal-overlay">
      <div className="crearCompras-supplier-modal">
        <div className="crearCompras-supplier-modal-header">
          <h2>
            <FaUser className="crearCompras-modal-icon" />
            Seleccionar Proveedor
          </h2>
          <button type="button" className="crearCompras-supplier-close-button" onClick={closeModal}>
            <FaTimes />
          </button>
        </div>

        <div className="crearCompras-supplier-modal-content">
          <div className="crearCompras-supplier-search-bar">
            <input
              type="text"
              placeholder="Buscar por nombre o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crearCompras-suppliers-list">
            {currentItems.length === 0 ? (
              <div className="crearCompras-supplier-no-results">No se encontraron proveedores</div>
            ) : (
              <table className="crearCompras-suppliers-table">
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
                    <tr key={supplier.id} className="crearCompras-supplier-row">
                      <td>
                        <div className="crearCompras-supplier-name">{supplier.nombre || "N/A"}</div>
                      </td>
                      <td>{supplier.documento || "N/A"}</td>
                      <td>
                        <div className="crearCompras-supplier-contact">
                          <div>{supplier.email || "N/A"}</div>
                          <div>{supplier.telefono || "N/A"}</div>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="crearCompras-supplier-select-button"
                          onClick={() => selectSupplier(supplier)}
                        >
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
            <div className="crearCompras-supplier-pagination">
              <button
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className="crearCompras-supplier-pagination-button"
              >
                Anterior
              </button>

              <span className="crearCompras-supplier-page-info">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
                className="crearCompras-supplier-pagination-button"
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

export default ComprasForm

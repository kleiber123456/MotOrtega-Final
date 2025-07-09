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
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Compras/CrearCompras.css"

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

// Formatear números solo con separador de miles, sin decimales
const formatNumber = (num) =>
  Number(num).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

// Función para calcular días hábiles hacia atrás
const calcularFechaMinima = () => {
  const hoy = new Date()
  let diasHabiles = 0
  const fechaActual = new Date(hoy)

  while (diasHabiles < 3) {
    fechaActual.setDate(fechaActual.getDate() - 1)
    const diaSemana = fechaActual.getDay()
    // Si no es sábado (6) ni domingo (0), es día hábil
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasHabiles++
    }
  }

  return fechaActual.toISOString().substr(0, 10)
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

// Componente principal simplificado
const CrearCompra = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().substr(0, 10),
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estados para la búsqueda de productos
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [inputValues, setInputValues] = useState({})
  const [inputErrors, setInputErrors] = useState({})

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3)

  // Estados para la paginación de productos seleccionados
  const [selectedProductsCurrentPage, setSelectedProductsCurrentPage] = useState(1)
  const [selectedProductsItemsPerPage] = useState(4) // Configurable desde aquí

  // Función para guardar el estado actual de la compra
  const saveCurrentState = useCallback(() => {
    const currentState = {
      selectedProducts,
      selectedSupplier,
      formData,
      searchTerm,
      inputValues,
      timestamp: Date.now(),
    }
    localStorage.setItem("compra_temp_state", JSON.stringify(currentState))
  }, [selectedProducts, selectedSupplier, formData, searchTerm, inputValues])

  // Función para restaurar el estado guardado
  const restoreState = useCallback(() => {
    try {
      const savedState = localStorage.getItem("compra_temp_state")
      if (savedState) {
        const state = JSON.parse(savedState)
        // Solo restaurar si no ha pasado más de 1 hora
        if (Date.now() - state.timestamp < 3600000) {
          setSelectedProducts(state.selectedProducts || [])
          setSelectedSupplier(state.selectedSupplier || null)
          setFormData(state.formData || { fecha: new Date().toISOString().substr(0, 10) })
          setSearchTerm(state.searchTerm || "")
          setInputValues(state.inputValues || {})
        }
        localStorage.removeItem("compra_temp_state")
      }
    } catch (error) {
      console.error("Error al restaurar estado:", error)
    }
  }, [])

  // Restaurar estado al cargar el componente
  useEffect(() => {
    restoreState()
  }, [restoreState])

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        const data = await makeRequest("/repuestos")
        if (data) {
          const activeProducts = data.filter((product) => product.nombre)
          setProducts(activeProducts)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [makeRequest])

  // Calcular el total cuando cambian los productos seleccionados
  useEffect(() => {
    const productsTotal = selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotal(productsTotal)
  }, [selectedProducts])

  // Filtrar productos disponibles solo si hay término de búsqueda
  const filteredProducts = searchTerm.trim()
    ? products.filter(
        (product) =>
          !selectedProducts.some((existing) => existing.id === product.id) &&
          product.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  // Calcular paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  // Calcular paginación para productos seleccionados
  const selectedProductsIndexOfLastItem = selectedProductsCurrentPage * selectedProductsItemsPerPage
  const selectedProductsIndexOfFirstItem = selectedProductsIndexOfLastItem - selectedProductsItemsPerPage
  const currentSelectedProducts = selectedProducts.slice(
    selectedProductsIndexOfFirstItem,
    selectedProductsIndexOfLastItem,
  )
  const selectedProductsTotalPages = Math.ceil(selectedProducts.length / selectedProductsItemsPerPage)

  // Reset página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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
  const openSupplierModal = useCallback(() => setShowSupplierModal(true), [])
  const closeSupplierModal = useCallback(() => setShowSupplierModal(false), [])

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

  // Manejador para seleccionar proveedor
  const selectSupplier = useCallback(
    (supplier) => {
      setSelectedSupplier(supplier)
      closeSupplierModal()
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

  // Actualiza el porcentaje y recalcula el precio venta
  const updateProductPorcentaje = useCallback((productId, newPorcentaje) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              porcentaje: newPorcentaje,
              precioVenta: Number(item.price) + (Number(item.price) * Number(newPorcentaje)) / 100,
            }
          : item,
      ),
    )
  }, [])

  // Cuando cambias el precio compra, también recalcula el precio venta
  const updateProductPrice = useCallback((productId, newPrice) => {
    if (newPrice < 0) return
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              price: newPrice,
              precioVenta: Number(newPrice) + (Number(newPrice) * Number(item.porcentaje || 40)) / 100,
            }
          : item,
      ),
    )
  }, [])

  // Manejar cambios en los inputs de cada producto
  const handleInputChange2 = (productId, field, value) => {
    setInputValues((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }))
  }

  // Calcular precio venta
  const getPrecioVenta = (precioCompra, porcentaje) => {
    const pc = Number(precioCompra) || 0
    const por = Number(porcentaje) || 0
    return pc + (pc * por) / 100
  }

  // Validar campos antes de agregar al carrito
  const validateInputs = (productId, cantidad, precioCompra, porcentaje) => {
    const errors = {}
    if (!cantidad || isNaN(cantidad) || cantidad < 1) {
      errors.cantidad = "Ingrese una cantidad válida (mayor o igual a 1)"
    }
    if (!precioCompra || isNaN(precioCompra) || precioCompra <= 0) {
      errors.precioCompra = "Ingrese el precio de compra (mayor a 0)"
    }
    if (porcentaje === "" || porcentaje === null || isNaN(porcentaje) || porcentaje < 0) {
      errors.porcentaje = "Ingrese el porcentaje (0 o mayor)"
    }
    setInputErrors((prev) => ({ ...prev, [productId]: errors }))
    return Object.keys(errors).length === 0
  }

  // Función para agregar productos directamente
  const handleAddProduct = (product, cantidad, precioCompra, porcentaje) => {
    if (!validateInputs(product.id, cantidad, precioCompra, porcentaje)) return

    const precioVenta = Number(precioCompra) + (Number(precioCompra) * Number(porcentaje)) / 100

    setSelectedProducts((prev) => [
      ...prev,
      {
        ...product,
        quantity: cantidad,
        price: precioCompra,
        porcentaje: porcentaje,
        precioVenta: precioVenta,
      },
    ])

    // Limpiar errores y valores temporales
    setInputErrors((prev) => ({ ...prev, [product.id]: {} }))
    setInputValues((prev) => ({ ...prev, [product.id]: {} }))

    // Mostrar confirmación
  }

  // Manejadores de paginación
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  // Manejadores de paginación para productos seleccionados
  const handleSelectedPreviousPage = () => {
    setSelectedProductsCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleSelectedNextPage = () => {
    setSelectedProductsCurrentPage((prev) => Math.min(prev + 1, selectedProductsTotalPages))
  }

  // Reset página cuando cambian los productos seleccionados
  useEffect(() => {
    if (selectedProductsCurrentPage > selectedProductsTotalPages && selectedProductsTotalPages > 0) {
      setSelectedProductsCurrentPage(selectedProductsTotalPages)
    }
  }, [selectedProducts.length, selectedProductsCurrentPage, selectedProductsTotalPages])

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
        const compraData = {
          proveedor_id: selectedSupplier.id,
          detalles: selectedProducts.map((product) => ({
            repuesto_id: product.id,
            cantidad: product.quantity,
            precio_compra: product.price,
            porcentaje_ganancia: product.porcentaje || 40,
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

        localStorage.removeItem("compra_temp_state")

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

  // Manejador para cancelar
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
        localStorage.removeItem("compra_temp_state")
        navigate("/ListarCompras")
      }
    } else {
      navigate("/ListarCompras")
    }
  }, [selectedProducts.length, selectedSupplier, navigate])

  return (
    <div className="crearCompra-container">
      <div className="editarUsuario-header">
        <div className="editarUsuario-header-left">
          <button className="editarUsuario-btn-back" onClick={() => navigate("/ListarCompras")} type="button">
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarUsuario-title-section">
            <h1 className="crearCompra-page-title">
              <FaShoppingCart className="crearCompra-title-icon" />
              Crear Compra
            </h1>
            <p className="crearCompra-subtitle">Registra una nueva compra de productos</p>
          </div>
        </div>
      </div>

      <form className="crearCompra-form" onSubmit={handleSubmit}>
        {/* Información General */}
        <div className="crearCompra-form-section">
          <h3 className="crearCompra-section-title">
            <FaUser className="crearCompra-section-icon" />
            Información General
          </h3>
          <div className="crearCompra-form-grid">
            <div className="crearCompra-form-group crearCompra-proveedor-row">
              <label htmlFor="supplierName" className="crearCompra-label">
                <FaUser className="crearCompra-label-icon" />
                Proveedor *
              </label>
              <div className="crearCompra-proveedor-input-btn">
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
                <button
                  type="button"
                  className="crearCompra-create-button crearCompra-nuevo-proveedor-btn"
                  title="Crear nuevo proveedor"
                  onClick={() => {
                    saveCurrentState()
                    navigate("/CrearProveedor")
                  }}
                >
                  <FaPlus /> Nuevo
                </button>
              </div>
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
                min={calcularFechaMinima()}
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

        {/* Sección del Carrito */}
        <div className="crearCompra-cart-main-section">
          <div className="crearCompra-cart-header">
            <h3
              className="crearCompra-cart-title-clickable"
              onClick={() => {
                const selectedProductsSection = document.querySelector(".crearCompra-selected-products-section")
                if (selectedProductsSection) {
                  const rect = selectedProductsSection.getBoundingClientRect()
                  const offset = 80 // Ajusta este valor para controlar qué tan arriba quieres que aparezca
                  window.scrollTo({
                    top: window.pageYOffset + rect.top - offset,
                    behavior: "smooth",
                  })
                }
              }}
              title="Ir a productos seleccionados"
            >
              <FaShoppingCart className="crearCompra-cart-icon" />
              Carrito
            </h3>
          </div>

          <div className="crearCompra-cart-content">
            {/* Columna Izquierda: Búsqueda y Selección de Productos */}
            <div className="crearCompra-search-section">
              <div className="crearCompra-form-section">
                <h3 className="crearCompra-section-title">
                  <FaBoxes className="crearCompra-section-icon" />
                  Buscar y Agregar Productos
                </h3>

                <div className="crearCompra-search-container">
                  <FaSearch className="crearCompra-search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar productos por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="crearCompra-search-input"
                  />
                </div>

                {loadingProducts ? (
                  <div className="crearCompra-loading-products">
                    <FaSpinner className="spinning" /> Cargando productos...
                  </div>
                ) : searchTerm.trim() ? (
                  <div className="crearCompra-product-list">
                    {currentProducts.length === 0 ? (
                      <div className="crearCompra-no-results">
                        <FaExclamationTriangle className="crearCompra-no-results-icon" />
                        <p>No se encontraron productos que coincidan con "{searchTerm}"</p>
                      </div>
                    ) : (
                      <>
                        <div className="crearCompra-search-products-container">
                          {currentProducts.map((product) => {
                            const values = inputValues[product.id] || {}
                            const cantidad = values.cantidad ?? 1
                            const precioCompra = values.precioCompra ?? product.preciounitario ?? 0
                            const porcentaje = values.porcentaje ?? 40
                            const precioVenta = getPrecioVenta(precioCompra, porcentaje)

                            return (
                              <div key={product.id} className="crearCompra-search-product-card-compact">
                                <div className="crearCompra-search-product-header-compact">
                                  <div className="crearCompra-search-product-info-compact">
                                    <h4 className="crearCompra-search-product-name-compact">{product.nombre}</h4>
                                    <div className="crearCompra-search-product-details-compact">
                                      <span className="crearCompra-search-product-stock-compact">
                                        Stock: {product.cantidad || 0}
                                      </span>
                                    </div>
                                    {product.descripcion && (
                                      <span className="crearCompra-search-product-description-compact">
                                        {product.descripcion}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="crearCompra-search-product-inputs-row">
                                  <div className="crearCompra-search-input-compact">
                                    <label>Cant.</label>
                                    <input
                                      type="number"
                                      className="crearCompra-search-input-field-compact"
                                      min="1"
                                      value={cantidad === undefined ? "" : cantidad}
                                      onChange={(e) =>
                                        handleInputChange2(
                                          product.id,
                                          "cantidad",
                                          e.target.value === "" ? "" : Number.parseInt(e.target.value),
                                        )
                                      }
                                      onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                                      placeholder="1"
                                    />
                                    {inputErrors[product.id]?.cantidad && (
                                      <span className="crearCompra-search-error-hint">
                                        {inputErrors[product.id].cantidad}
                                      </span>
                                    )}
                                  </div>
                                  <div className="crearCompra-search-input-compact">
                                    <label>P. Compra</label>
                                    <input
                                      type="number"
                                      className="crearCompra-search-input-field-compact"
                                      min="0"
                                      step="0.01"
                                      value={precioCompra === undefined ? "" : precioCompra}
                                      onChange={(e) =>
                                        handleInputChange2(
                                          product.id,
                                          "precioCompra",
                                          e.target.value === "" ? "" : Number.parseFloat(e.target.value),
                                        )
                                      }
                                      onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                                      onFocus={(e) => e.target.select()}
                                      placeholder="0"
                                    />
                                    {inputErrors[product.id]?.precioCompra && (
                                      <span className="crearCompra-search-error-hint">
                                        {inputErrors[product.id].precioCompra}
                                      </span>
                                    )}
                                  </div>
                                  <div className="crearCompra-search-input-compact">
                                    <label>%</label>
                                    <input
                                      type="number"
                                      className="crearCompra-search-input-field-compact"
                                      min="0"
                                      step="0.01"
                                      value={porcentaje === undefined ? "" : porcentaje}
                                      onChange={(e) =>
                                        handleInputChange2(
                                          product.id,
                                          "porcentaje",
                                          e.target.value === "" ? "" : Number.parseFloat(e.target.value),
                                        )
                                      }
                                      onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                                      placeholder="40"
                                    />
                                    {inputErrors[product.id]?.porcentaje && (
                                      <span className="crearCompra-search-error-hint">
                                        {inputErrors[product.id].porcentaje}
                                      </span>
                                    )}
                                  </div>
                                  <div className="crearCompra-search-input-compact">
                                    <label>P. Unitario</label>
                                    <input
                                      type="text"
                                      className="crearCompra-search-input-field-compact crearCompra-search-readonly"
                                      value={formatNumber(precioVenta)}
                                      readOnly
                                      tabIndex={-1}
                                    />
                                  </div>
                                  <div className="crearCompra-search-add-button-container">
                                    <button
                                      type="button"
                                      className="crearCompra-search-add-button-compact"
                                      onClick={() => {
                                        handleAddProduct(product, cantidad, precioCompra, porcentaje)
                                      }}
                                    >
                                      <FaPlus />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                          <div className="crearCompra-pagination">
                            <button
                              type="button"
                              onClick={handlePreviousPage}
                              disabled={currentPage === 1}
                              className="crearCompra-pagination-button"
                            >
                              <FaChevronLeft /> Anterior
                            </button>

                            <span className="crearCompra-page-info">
                              Página {currentPage} de {totalPages} ({filteredProducts.length} productos encontrados)
                            </span>

                            <button
                              type="button"
                              onClick={handleNextPage}
                              disabled={currentPage === totalPages}
                              className="crearCompra-pagination-button"
                            >
                              Siguiente <FaChevronRight />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="crearCompra-search-placeholder">
                    <FaSearch className="crearCompra-search-placeholder-icon" />
                    <p>Escriba el nombre del producto que desea buscar</p>
                  </div>
                )}

                {formErrors.products && (
                  <div className="crearCompra-error-message">
                    <FaExclamationTriangle /> {formErrors.products}
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Productos Seleccionados */}
            <div className="crearCompra-selected-products-section">
              {selectedProducts.length > 0 ? (
                <div className="crearCompra-form-section">
                  <div className="crearCompra-products-header">
                    <h4 className="crearCompra-form-section-h4">Productos Seleccionados</h4>
                    <span className="crearCompra-products-count">
                      {selectedProducts.length} producto{selectedProducts.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="crearCompra-selected-products-container">
                    {currentSelectedProducts.map((product) => (
                      <div key={product.id} className="crearCompra-product-card-selected-compact">
                        <div className="crearCompra-product-card-header-compact">
                          <h4 className="crearCompra-product-name-compact">{product.nombre}</h4>
                          <button
                            type="button"
                            className="crearCompra-remove-button-compact"
                            onClick={() => removeProduct(product.id)}
                            title="Eliminar producto"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <div className="crearCompra-product-inputs-row">
                          <div className="crearCompra-input-compact">
                            <label>Cantidad</label>
                            <input
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) => updateProductQuantity(product.id, Number.parseInt(e.target.value) || "")}
                              onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                              className="crearCompra-input-field-compact"
                            />
                          </div>
                          <div className="crearCompra-input-compact">
                            <label>P. Compra</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={product.price}
                              onChange={(e) => updateProductPrice(product.id, Number.parseFloat(e.target.value) || "")}
                              onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                              className="crearCompra-input-field-compact"
                            />
                          </div>
                          <div className="crearCompra-input-compact">
                            <label>Margen</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={product.porcentaje ?? 40}
                              onChange={(e) =>
                                updateProductPorcentaje(product.id, Number.parseFloat(e.target.value) || "")
                              }
                              onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                              className="crearCompra-input-field-compact"
                            />
                          </div>
                          <div className="crearCompra-input-compact">
                            <label>P. Unitario</label>
                            <input
                              type="text"
                              value={formatNumber(
                                product.precioVenta ??
                                  Number(product.price) +
                                    (Number(product.price) * Number(product.porcentaje ?? 40)) / 100,
                              )}
                              className="crearCompra-input-field-compact crearCompra-readonly"
                              readOnly
                              tabIndex={-1}
                            />
                          </div>
                          <div className="crearCompra-subtotal-compact">
                            <span>${formatNumber(product.price * product.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paginación para productos seleccionados */}
                  {selectedProductsTotalPages > 1 && (
                    <div className="crearCompra-selected-pagination">
                      <button
                        type="button"
                        onClick={handleSelectedPreviousPage}
                        disabled={selectedProductsCurrentPage === 1}
                        className="crearCompra-pagination-button-small"
                      >
                        <FaChevronLeft />
                      </button>

                      <span className="crearCompra-page-info-small">
                        {selectedProductsCurrentPage} / {selectedProductsTotalPages}
                      </span>

                      <button
                        type="button"
                        onClick={handleSelectedNextPage}
                        disabled={selectedProductsCurrentPage === selectedProductsTotalPages}
                        className="crearCompra-pagination-button-small"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  )}

                  <div className="crearCompra-total-section-compact">
                    {/* Acciones del formulario */}
                    <div className="crearCompra-form-actions">
                      <button
                        type="button"
                        className="crearCompra-cancel-button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
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
                    <div className="crearCompra-total-card-compact">
                      <span className="crearCompra-total-label-compact">Total:</span>
                      <span className="crearCompra-total-amount-compact">${formatNumber(total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="crearCompra-form-section">
                  <div className="crearCompra-empty-cart">
                    <FaShoppingCart className="crearCompra-empty-cart-icon" />
                    <h4>Carrito vacío</h4>
                    <p>Busca y agrega productos para comenzar tu compra</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Proveedores */}
      {showSupplierModal && <SupplierModal closeModal={closeSupplierModal} selectSupplier={selectSupplier} />}
    </div>
  )
}

// Componente Modal de Proveedores (mantenido)
const SupplierModal = ({ closeModal, selectSupplier }) => {
  const { makeRequest, loading, error } = useApi()
  const [searchTerm, setSearchTerm] = useState("")
  const [suppliers, setSuppliers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

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
                setCurrentPage(1)
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
                    <th>Nit</th>
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
                      <td>{supplier.nit || "N/A"}</td>
                      <td>
                        <div className="crearCompra-supplier-contact">
                          <div>{supplier.correo || "N/A"}</div>
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

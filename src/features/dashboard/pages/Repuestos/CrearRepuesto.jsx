"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaTimes,
  FaTag,
  FaFileAlt,
  FaBox,
  FaDollarSign,
  FaCheckCircle,
  FaSearch,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaArrowLeft,
  FaPlus,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/crearRepuesto.css"

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

// Componente del modal para categorías
const CategoriaModal = ({ show, onClose, categorias, onSelect, categoriaActual }) => {
  const [busquedaCategoria, setBusquedaCategoria] = useState("")
  const [categoriasPorPagina] = useState(5)
  const [paginaActualCategorias, setPaginaActualCategorias] = useState(1)
  const modalRef = useRef(null)

  useEffect(() => {
    if (show) {
      setBusquedaCategoria("")
      setPaginaActualCategorias(1)
    }
  }, [show])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (show) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [show, onClose])

  const categoriasFiltradas = categorias.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase()),
  )

  const indiceUltimaCategoria = paginaActualCategorias * categoriasPorPagina
  const indicePrimeraCategoria = indiceUltimaCategoria - categoriasPorPagina
  const categoriasActuales = categoriasFiltradas.slice(indicePrimeraCategoria, indiceUltimaCategoria)
  const totalPaginasCategorias = Math.ceil(categoriasFiltradas.length / categoriasPorPagina)

  if (!show) return null

  return (
    <div className="crearRepuesto-modal-overlay">
      <div className="crearRepuesto-modal-container" ref={modalRef}>
        <div className="crearRepuesto-modal-header">
          <h2 className="crearRepuesto-modal-title">
            <FaTag className="crearRepuesto-modal-title-icon" />
            Seleccionar Categoría
          </h2>
          <button className="crearRepuesto-modal-close-button" onClick={onClose} aria-label="Cerrar">
            <FaTimes />
          </button>
        </div>

        <div className="crearRepuesto-modal-body">
          <div className="crearRepuesto-modal-search-container">
            <div className="crearRepuesto-modal-search-input-wrapper">
              <FaSearch className="crearRepuesto-modal-search-icon" />
              <input
                type="text"
                placeholder="Buscar categoría..."
                value={busquedaCategoria}
                onChange={(e) => {
                  setBusquedaCategoria(e.target.value)
                  setPaginaActualCategorias(1)
                }}
                className="crearRepuesto-modal-search-input"
                autoFocus
              />
            </div>
          </div>

          <div className="crearRepuesto-modal-list-container">
            {categoriasActuales.length > 0 ? (
              categoriasActuales.map((categoria) => (
                <div
                  key={categoria.id}
                  className={`crearRepuesto-modal-list-item ${
                    categoriaActual === categoria.id.toString() ? "crearRepuesto-modal-list-item-selected" : ""
                  }`}
                  onClick={() => onSelect(categoria)}
                >
                  <span className="crearRepuesto-modal-list-item-text">{categoria.nombre}</span>
                  <FaCheckCircle className="crearRepuesto-modal-list-item-check" />
                </div>
              ))
            ) : (
              <div className="crearRepuesto-modal-no-results">
                <FaExclamationTriangle className="crearRepuesto-modal-no-results-icon" />
                <span>No se encontraron categorías</span>
              </div>
            )}
          </div>

          {categoriasFiltradas.length > categoriasPorPagina && (
            <div className="crearRepuesto-modal-pagination">
              <button
                onClick={() => setPaginaActualCategorias((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActualCategorias === 1}
                className="crearRepuesto-modal-pagination-button"
              >
                <FaArrowLeft className="crearRepuesto-modal-pagination-icon" />
                Anterior
              </button>

              <div className="crearRepuesto-modal-pagination-info">
                Página {paginaActualCategorias} de {totalPaginasCategorias}
              </div>

              <button
                onClick={() => setPaginaActualCategorias((prev) => Math.min(prev + 1, totalPaginasCategorias))}
                disabled={paginaActualCategorias === totalPaginasCategorias}
                className="crearRepuesto-modal-pagination-button"
              >
                Siguiente
                <FaArrowLeft className="crearRepuesto-modal-pagination-icon crearRepuesto-modal-pagination-icon-right" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CrearRepuesto() {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [repuesto, setRepuesto] = useState({
    nombre: "",
    descripcion: "",
    cantidad: 0,
    preciounitario: 0,
    estado: "Activo",
    categoria_repuesto_id: "",
  })

  const [categorias, setCategorias] = useState([])
  const [errores, setErrores] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mostrarModalCategorias, setMostrarModalCategorias] = useState(false)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)

  // Cargar categorías al montar el componente
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await makeRequest("/categorias-repuestos")
        if (data) {
          const categoriasActivas = data.filter((cat) => cat.estado === "Activo")
          setCategorias(categoriasActivas)
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar las categorías de repuestos",
          confirmButtonColor: "#ef4444",
        })
      }
    }

    cargarCategorias()
  }, [makeRequest])

  // Validaciones del formulario
  const validateForm = useCallback(() => {
    const errors = {}

    if (!repuesto.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio"
    } else if (repuesto.nombre.trim().length < 3) {
      errors.nombre = "El nombre debe tener al menos 3 caracteres"
    }

    if (repuesto.descripcion.trim().length > 200) {
      errors.descripcion = "La descripción no puede exceder los 200 caracteres"
    }

    if (repuesto.cantidad === "" || isNaN(repuesto.cantidad)) {
      errors.cantidad = "La cantidad es obligatoria y debe ser un número"
    } else if (Number.parseInt(repuesto.cantidad) < 0) {
      errors.cantidad = "La cantidad debe ser un número positivo"
    }

    if (repuesto.preciounitario === "" || isNaN(repuesto.preciounitario)) {
      errors.preciounitario = "El precio unitario es obligatorio y debe ser un número"
    } else if (Number.parseFloat(repuesto.preciounitario) < 0) {
      errors.preciounitario = "El precio unitario debe ser un número positivo"
    }

    if (!repuesto.categoria_repuesto_id) {
      errors.categoria_repuesto_id = "Debe seleccionar una categoría"
    }

    if (!repuesto.estado) {
      errors.estado = "Debe seleccionar un estado"
    }

    setErrores(errors)
    return Object.keys(errors).length === 0
  }, [repuesto])

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setRepuesto((prev) => ({ ...prev, [name]: value }))

      // Limpiar error del campo si existe
      if (errores[name]) {
        setErrores((prev) => ({ ...prev, [name]: "" }))
      }
    },
    [errores],
  )

  const handleSeleccionarCategoria = useCallback(
    (categoria) => {
      setCategoriaSeleccionada(categoria)
      setRepuesto((prev) => ({
        ...prev,
        categoria_repuesto_id: categoria.id.toString(),
      }))
      setMostrarModalCategorias(false)

      // Limpiar error de categoría si existe
      if (errores.categoria_repuesto_id) {
        setErrores((prev) => ({ ...prev, categoria_repuesto_id: "" }))
      }
    },
    [errores.categoria_repuesto_id],
  )

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
        const datosRepuesto = {
          ...repuesto,
          cantidad: Number.parseInt(repuesto.cantidad),
          preciounitario: Number.parseFloat(repuesto.preciounitario),
          categoria_repuesto_id: Number.parseInt(repuesto.categoria_repuesto_id),
          total: Number.parseFloat(repuesto.cantidad) * Number.parseFloat(repuesto.preciounitario),
        }

        await makeRequest("/repuestos", {
          method: "POST",
          body: JSON.stringify(datosRepuesto),
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "El repuesto ha sido creado correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/repuestos")
      } catch (error) {
        console.error("Error al crear repuesto:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo crear el repuesto",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [validateForm, repuesto, makeRequest, navigate],
  )

  const handleCancel = useCallback(async () => {
    const hasData =
      repuesto.nombre ||
      repuesto.descripcion ||
      repuesto.cantidad > 0 ||
      repuesto.preciounitario > 0 ||
      categoriaSeleccionada

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
        navigate("/repuestos")
      }
    } else {
      navigate("/repuestos")
    }
  }, [repuesto, categoriaSeleccionada, navigate])

  const formatearPrecio = useCallback((precio) => {
    if (!precio) return "$0.00"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(precio)
  }, [])

  const totalCalculado = Number.parseFloat(repuesto.cantidad || 0) * Number.parseFloat(repuesto.preciounitario || 0)

  return (
    <div className="crearRepuesto-container">
      <div className="crearRepuesto-header">
        <h1 className="crearRepuesto-page-title">
          <FaPlus className="crearRepuesto-title-icon" />
          Crear Repuesto
        </h1>
        <p className="crearRepuesto-subtitle">Registra un nuevo repuesto en el inventario</p>
      </div>

      <form className="crearRepuesto-form" onSubmit={handleSubmit}>
        <div className="crearRepuesto-form-section">
          <h3 className="crearRepuesto-section-title">
            <FaFileAlt className="crearRepuesto-section-icon" />
            Información General
          </h3>

          <div className="crearRepuesto-form-grid">
            <div className="crearRepuesto-form-group">
              <label htmlFor="nombre" className="crearRepuesto-label">
                <FaBox className="crearRepuesto-label-icon" />
                Nombre del Repuesto *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={repuesto.nombre}
                onChange={handleChange}
                maxLength={45}
                className={`crearRepuesto-form-input ${errores.nombre ? "error" : ""}`}
                placeholder="Ingrese el nombre del repuesto"
                required
              />
              {errores.nombre && (
                <span className="crearRepuesto-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="crearRepuesto-form-group">
              <label htmlFor="categoria" className="crearRepuesto-label">
                <FaTag className="crearRepuesto-label-icon" />
                Categoría *
              </label>
              <input
                type="text"
                id="categoria"
                placeholder="Seleccione una categoría..."
                value={categoriaSeleccionada ? categoriaSeleccionada.nombre : ""}
                onClick={() => setMostrarModalCategorias(true)}
                readOnly
                className={`crearRepuesto-form-input ${errores.categoria_repuesto_id ? "error" : ""}`}
                style={{ cursor: "pointer" }}
                required
              />
              {errores.categoria_repuesto_id && (
                <span className="crearRepuesto-error-text">
                  <FaExclamationTriangle /> {errores.categoria_repuesto_id}
                </span>
              )}
            </div>
          </div>

          <div className="crearRepuesto-form-group">
            <label htmlFor="descripcion" className="crearRepuesto-label">
              <FaFileAlt className="crearRepuesto-label-icon" />
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={repuesto.descripcion}
              onChange={handleChange}
              maxLength={200}
              rows={3}
              className={`crearRepuesto-form-textarea ${errores.descripcion ? "error" : ""}`}
              placeholder="Descripción del repuesto (opcional)"
            />
            <div className="crearRepuesto-char-count">{repuesto.descripcion.length}/200 caracteres</div>
            {errores.descripcion && (
              <span className="crearRepuesto-error-text">
                <FaExclamationTriangle /> {errores.descripcion}
              </span>
            )}
          </div>

          <div className="crearRepuesto-form-grid">
            <div className="crearRepuesto-form-group">
              <label htmlFor="cantidad" className="crearRepuesto-label">
                <FaBox className="crearRepuesto-label-icon" />
                Cantidad *
              </label>
              <input
                type="number"
                id="cantidad"
                name="cantidad"
                value={repuesto.cantidad}
                onChange={handleChange}
                min="0"
                className={`crearRepuesto-form-input ${errores.cantidad ? "error" : ""}`}
                required
              />
              {errores.cantidad && (
                <span className="crearRepuesto-error-text">
                  <FaExclamationTriangle /> {errores.cantidad}
                </span>
              )}
            </div>

            <div className="crearRepuesto-form-group">
              <label htmlFor="preciounitario" className="crearRepuesto-label">
                <FaDollarSign className="crearRepuesto-label-icon" />
                Precio Unitario *
              </label>
              <input
                type="number"
                id="preciounitario"
                name="preciounitario"
                value={repuesto.preciounitario}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`crearRepuesto-form-input ${errores.preciounitario ? "error" : ""}`}
                required
              />
              {errores.preciounitario && (
                <span className="crearRepuesto-error-text">
                  <FaExclamationTriangle /> {errores.preciounitario}
                </span>
              )}
            </div>
          </div>

          <div className="crearRepuesto-form-grid">
            <div className="crearRepuesto-form-group">
              <label htmlFor="estado" className="crearRepuesto-label">
                <FaCheckCircle className="crearRepuesto-label-icon" />
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={repuesto.estado}
                onChange={handleChange}
                className={`crearRepuesto-form-input ${errores.estado ? "error" : ""}`}
                required
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errores.estado && (
                <span className="crearRepuesto-error-text">
                  <FaExclamationTriangle /> {errores.estado}
                </span>
              )}
            </div>

            <div className="crearRepuesto-form-group">
              <label className="crearRepuesto-label">
                <FaDollarSign className="crearRepuesto-label-icon" />
                Total Calculado
              </label>
              <div className="crearRepuesto-total-display">{formatearPrecio(totalCalculado)}</div>
            </div>
          </div>
        </div>

        <div className="crearRepuesto-form-actions">
          <button type="button" className="crearRepuesto-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaArrowLeft className="crearRepuesto-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="crearRepuesto-submit-button" disabled={isSubmitting || apiLoading}>
            {isSubmitting ? (
              <>
                <FaSpinner className="crearRepuesto-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="crearRepuesto-button-icon" />
                Crear Repuesto
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal de categorías */}
      {mostrarModalCategorias && (
        <CategoriaModal
          show={mostrarModalCategorias}
          onClose={() => setMostrarModalCategorias(false)}
          categorias={categorias}
          onSelect={handleSeleccionarCategoria}
          categoriaActual={repuesto.categoria_repuesto_id}
        />
      )}
    </div>
  )
}

export default CrearRepuesto

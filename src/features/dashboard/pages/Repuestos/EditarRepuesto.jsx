"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  FaEdit,
  FaTimes,
  FaTag,
  FaBox,
  FaCheckCircle,
  FaSearch,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaArrowLeft,
  FaFileAlt,
  FaPlus,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Repuestos/EditarRepuesto.css"

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
        if (response.status === 404) {
          throw new Error("Repuesto no encontrado.")
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
  const [categoriasPorPagina] = useState(5) // Ya configurado para 5 categorías por página
  const [paginaActualCategorias, setPaginaActualCategorias] = useState(1)
  const modalRef = useRef(null)

  useEffect(() => {
    if (show) {
      setBusquedaCategoria("")
      setPaginaActualCategorias(1)
    }
  }, [show])

  // Cerrar modal al hacer clic afuera
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

  // Filtrar categorías basado en la búsqueda
  const categoriasFiltradas = categorias.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase()),
  )

  // Calcular índices para la paginación
  const indiceUltimaCategoria = paginaActualCategorias * categoriasPorPagina
  const indicePrimeraCategoria = indiceUltimaCategoria - categoriasPorPagina
  const categoriasActuales = categoriasFiltradas.slice(indicePrimeraCategoria, indiceUltimaCategoria)
  const totalPaginasCategorias = Math.ceil(categoriasFiltradas.length / categoriasPorPagina)

  // Función para ir a la página anterior
  const irPaginaAnterior = () => {
    setPaginaActualCategorias((prev) => Math.max(prev - 1, 1))
  }

  // Función para ir a la página siguiente
  const irPaginaSiguiente = () => {
    setPaginaActualCategorias((prev) => Math.min(prev + 1, totalPaginasCategorias))
  }

  // Función para manejar el cambio de búsqueda
  const handleBusquedaChange = (e) => {
    setBusquedaCategoria(e.target.value)
    setPaginaActualCategorias(1) // Resetear a la primera página cuando se busca
  }

  if (!show) return null

  return (
    <div className="crearRepuesto-modal-overlay">
      <div className="crearRepuesto-categoria-modal" ref={modalRef}>
        <div className="crearRepuesto-categoria-modal-header">
          <h2>
            <FaTag className="crearRepuesto-modal-header-icon" />
            Seleccionar Categoría
          </h2>
          <button type="button" className="crearRepuesto-categoria-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="crearRepuesto-categoria-modal-content">
          {/* Buscador centrado */}
          <div className="crearRepuesto-categoria-search-container">
            <div className="crearRepuesto-categoria-search-wrapper">
              <FaSearch className="crearRepuesto-categoria-search-icon" />
              <input
                type="text"
                placeholder="Buscar categoría..."
                value={busquedaCategoria}
                onChange={handleBusquedaChange}
                className="crearRepuesto-categoria-search-input"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de categorías con paginación */}
          <div className="crearRepuesto-categoria-list">
            {categoriasActuales.length === 0 ? (
              <div className="crearRepuesto-categoria-no-results">
                <FaExclamationTriangle className="crearRepuesto-categoria-no-results-icon" />
                <p>{busquedaCategoria ? "No se encontraron categorías" : "No hay categorías disponibles"}</p>
              </div>
            ) : (
              <table className="crearRepuesto-categoria-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasActuales.map((categoria) => (
                    <tr key={categoria.id} className="crearRepuesto-categoria-row">
                      <td>
                        <div className="crearRepuesto-categoria-name">{categoria.nombre || "N/A"}</div>
                      </td>
                      <td>
                        <span
                          className={`crearRepuesto-categoria-status ${categoria.estado === "Activo" ? "active" : "inactive"}`}
                        >
                          {categoria.estado || "N/A"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="crearRepuesto-categoria-select-button"
                          onClick={() => onSelect(categoria)}
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

          {/* Controles de paginación - Solo se muestran si hay más de una página */}
          {totalPaginasCategorias > 1 && (
            <div className="crearRepuesto-categoria-pagination">
              <button
                onClick={irPaginaAnterior}
                disabled={paginaActualCategorias === 1}
                className="crearRepuesto-categoria-pagination-button"
                type="button"
              >
                Anterior
              </button>

              <span className="crearRepuesto-categoria-page-info">
                Página {paginaActualCategorias} de {totalPaginasCategorias}
                {categoriasFiltradas.length > 0 && (
                  <span className="crearRepuesto-categoria-total-info">
                    {" "}
                    ({categoriasFiltradas.length} categoría{categoriasFiltradas.length !== 1 ? "s" : ""})
                  </span>
                )}
              </span>

              <button
                onClick={irPaginaSiguiente}
                disabled={paginaActualCategorias === totalPaginasCategorias}
                className="crearRepuesto-categoria-pagination-button"
                type="button"
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

function EditarRepuesto() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { makeRequest, loading: apiLoading } = useApi()

  // Estado inicial igual al de crear repuesto
  const [repuesto, setRepuesto] = useState({
    nombre: "",
    descripcion: "",
    categoria_repuesto_id: "",
    precio_venta: "",
    cantidad: "",
    precio_compra: "",
  })

  const [categorias, setCategorias] = useState([])
  const [errores, setErrores] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mostrarModalCategorias, setMostrarModalCategorias] = useState(false)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)

  // Cargar datos del repuesto y categorías
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true)

        // Cargar categorías
        const dataCategorias = await makeRequest("/categorias-repuestos")
        if (dataCategorias) {
          const categoriasActivas = dataCategorias.filter((cat) => cat.estado === "Activo")
          setCategorias(categoriasActivas)
        }

        // Cargar datos del repuesto
        const dataRepuesto = await makeRequest(`/repuestos/${id}`)
        if (dataRepuesto) {
          setRepuesto({
            nombre: dataRepuesto.nombre || "",
            descripcion: dataRepuesto.descripcion || "",
            categoria_repuesto_id: dataRepuesto.categoria_repuesto_id?.toString() || "",
            precio_venta: dataRepuesto.precio_venta !== undefined ? dataRepuesto.precio_venta.toString() : "",
            cantidad: dataRepuesto.cantidad !== undefined ? dataRepuesto.cantidad.toString() : "",
            precio_compra: dataRepuesto.precio_compra !== undefined ? dataRepuesto.precio_compra.toString() : "",
          })

          // Establecer la categoría seleccionada
          if (dataCategorias && dataRepuesto.categoria_repuesto_id) {
            const categoriaActual = dataCategorias.find(
              (cat) => cat.id.toString() === dataRepuesto.categoria_repuesto_id.toString(),
            )
            if (categoriaActual) {
              setCategoriaSeleccionada(categoriaActual)
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudieron cargar los datos del repuesto",
          confirmButtonColor: "#ef4444",
        })
        navigate("/repuestos")
      } finally {
        setIsLoading(false)
      }
    }

    cargarDatos()
  }, [id, makeRequest, navigate])

  // Validaciones del formulario igual al de crear
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

    if (!repuesto.categoria_repuesto_id) {
      errors.categoria_repuesto_id = "Debe seleccionar una categoría"
    }

    if (!repuesto.precio_venta || isNaN(Number(repuesto.precio_venta)) || Number(repuesto.precio_venta) <= 0) {
      errors.precio_venta = "El precio debe ser mayor que 0"
    }
    setErrores(errors)
    return Object.keys(errors).length === 0
  }, [repuesto])

  // HandleChange igual al de crear
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setRepuesto((prev) => ({ ...prev, [name]: value }))
      setErrores((prev) => ({ ...prev, [name]: undefined }))
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

  // Submit del formulario modificado para editar
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
          categoria_repuesto_id: Number.parseInt(repuesto.categoria_repuesto_id),
          precio_venta: Number(repuesto.precio_venta),
          cantidad: Number(repuesto.cantidad),
          precio_compra: Number(repuesto.precio_compra),
        }

        await makeRequest(`/repuestos/${id}`, {
          method: "PUT",
          body: JSON.stringify(datosRepuesto),
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "El repuesto ha sido actualizado correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/repuestos")
      } catch (error) {
        console.error("Error al actualizar repuesto:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo actualizar el repuesto",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [validateForm, repuesto, id, makeRequest, navigate],
  )

  const handleCancel = useCallback(async () => {
    const hasData = repuesto.nombre || repuesto.descripcion || categoriaSeleccionada

    if (hasData) {
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
        navigate("/repuestos")
      }
    } else {
      navigate("/repuestos")
    }
  }, [repuesto, categoriaSeleccionada, navigate])

  if (isLoading) {
    return (
      <div className="listarRepuesto-container">
        <div className="listarRepuesto-loading">
          <div className="listarRepuesto-spinner"></div>
          <p>Cargando datos del repuesto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="crearRepuesto-container">
      <div className="editarUsuario-header">
        <div className="editarUsuario-header-left">
          <button className="editarUsuario-btn-back" onClick={() => navigate("/repuestos")} type="button">
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarUsuario-title-section">
            <h1 className="crearRepuesto-page-title">
              <FaEdit className="crearRepuesto-title-icon" />
              Editar Repuesto
            </h1>
            <p className="crearRepuesto-subtitle">Modifica la información del repuesto</p>
          </div>
        </div>
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
              <div className="crearRepuesto-input-with-button">
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
                <button
                  type="button"
                  className="crearRepuesto-create-category-button"
                  onClick={() => navigate("/categorias-repuesto")}
                >
                  <FaPlus className="crearRepuesto-button-icon" />
                  Crear Categoría
                </button>
              </div>
              {errores.categoria_repuesto_id && (
                <span className="crearRepuesto-error-text">
                  <FaExclamationTriangle /> {errores.categoria_repuesto_id}
                </span>
              )}
            </div>

            <div className="crearRepuesto-form-group">
              <label htmlFor="precio_venta" className="crearRepuesto-label">
                <FaTag className="crearRepuesto-label-icon" />
                Precio del Repuesto *
              </label>
              <input
                type="number"
                id="precio_venta"
                name="precio_venta"
                value={repuesto.precio_venta}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`crearRepuesto-form-input ${errores.precio_venta ? "error" : ""}`}
                placeholder="Ingrese el precio del repuesto"
                required
              />
              {errores.precio_venta && (
                <span className="crearRepuesto-error-text">
                  <FaExclamationTriangle /> {errores.precio_venta}
                </span>
              )}
            </div>
            <div className="crearRepuesto-form-group">
              <label htmlFor="cantidad" className="crearRepuesto-label">
                <FaBox className="crearRepuesto-label-icon" />
                Cantidad en Stock
              </label>
              <input
                type="number"
                id="cantidad"
                name="cantidad"
                value={repuesto.cantidad}
                readOnly
                className="crearRepuesto-form-input"
                placeholder="Cantidad en stock"
                style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
              />
            </div>
            <div className="crearRepuesto-form-group">
              <label htmlFor="precio_compra" className="crearRepuesto-label">
                <FaTag className="crearRepuesto-label-icon" />
                Precio de Compra
              </label>
              <input
                type="number"
                id="precio_compra"
                name="precio_compra"
                value={repuesto.precio_compra}
                readOnly
                className="crearRepuesto-form-input"
                placeholder="Precio de compra"
                style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
              />
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
                Actualizando...
              </>
            ) : (
              <>
                <FaSave className="crearRepuesto-button-icon" />
                Actualizar Repuesto
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

export default EditarRepuesto

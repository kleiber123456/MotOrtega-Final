"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaTag,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaExclamationTriangle,
  FaPlus,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Categorias/ListarCategoriaRepuesto.css"

const ListarCategoriasRepuesto = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [categorias, setCategorias] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [categoriasPorPagina] = useState(4)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    fetchCategorias()
    return () => {
      document.body.style.background = ""
    }
  }, [])

  const fetchCategorias = async () => {
    try {
      setCargando(true)
      const res = await fetch("https://api-final-8rw7.onrender.com/api/categorias-repuestos", {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error("Error al obtener categorías")

      const data = await res.json()
      setCategorias(data)
    } catch (err) {
      console.error("Error al obtener categorías:", err)
      setCategorias([])
      Swal.fire("Error", "No se pudieron cargar las categorías", "error")
    } finally {
      setCargando(false)
    }
  }

  const cambiarEstadoCategoria = useCallback(
    async (id, estadoActual) => {
      try {
        const nuevoEstado = estadoActual?.toLowerCase() === "activo" ? "Inactivo" : "Activo"

        const result = await Swal.fire({
          title: `¿Cambiar estado a ${nuevoEstado}?`,
          text: `La categoría será marcada como ${nuevoEstado.toLowerCase()}`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Sí, cambiar",
          cancelButtonText: "Cancelar",
        })

        if (!result.isConfirmed) return

        const res = await fetch(`https://api-final-8rw7.onrender.com/api/categorias-repuestos/${id}/cambiar-estado`, {
          method: "PUT",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Error al cambiar el estado")

        setCategorias((prev) => prev.map((cat) => (cat.id === id ? { ...cat, estado: nuevoEstado } : cat)))

        Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          text: `La categoría ahora está ${nuevoEstado.toLowerCase()}`,
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (err) {
        console.error("Error al cambiar el estado:", err)
        Swal.fire("Error", "No se pudo cambiar el estado de la categoría", "error")
      }
    },
    [token],
  )

  const eliminarCategoria = useCallback(
    async (id) => {
      if (!id) {
        Swal.fire("Error", "ID de categoría inválido", "error")
        return
      }

      const result = await Swal.fire({
        title: "¿Eliminar categoría?",
        text: "Esta acción eliminará la categoría permanentemente y no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) return

      try {
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/categorias-repuestos/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Error al eliminar la categoría")

        setCategorias((prev) => prev.filter((c) => c.id !== id))

        Swal.fire({
          icon: "success",
          title: "Categoría eliminada",
          text: "La categoría ha sido eliminada correctamente",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (err) {
        console.error("Error al eliminar la categoría:", err)
        Swal.fire("Error", "No se pudo eliminar la categoría", "error")
      }
    },
    [token],
  )

  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }, [])

  // Filtrar categorías
  const categoriasFiltradas = categorias.filter((categoria) => {
    const matchBusqueda = Object.values(categoria).some((val) => String(val).toLowerCase().includes(busqueda))
    const matchEstado = estadoFiltro === "" || categoria.estado === estadoFiltro

    return matchBusqueda && matchEstado
  })

  // Paginación
  const indiceUltimaCategoria = paginaActual * categoriasPorPagina
  const indicePrimeraCategoria = indiceUltimaCategoria - categoriasPorPagina
  const categoriasActuales = categoriasFiltradas.slice(indicePrimeraCategoria, indiceUltimaCategoria)
  const totalPaginas = Math.ceil(categoriasFiltradas.length / categoriasPorPagina)

  if (cargando) {
    return (
      <div className="listarCategoriaRepuesto-container">
        <div className="listarCategoriaRepuesto-loading">
          <div className="listarCategoriaRepuesto-spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarCategoriaRepuesto-container">
      <div className="listarCategoriaRepuesto-header">
        <div className="listarCategoriaRepuesto-title-section">
          <h1 className="listarCategoriaRepuesto-page-title">
            <FaTag className="listarCategoriaRepuesto-title-icon" />
            Gestión de Categorías de Repuestos
          </h1>
          <p className="listarCategoriaRepuesto-subtitle">Administra las categorías de repuestos del sistema</p>
        </div>
        <button className="listarCategoriaRepuesto-create-button" onClick={() => navigate("/crearCategoriaRepuesto")}>
          <FaPlus className="listarCategoriaRepuesto-button-icon" />
          Crear Categoría
        </button>
      </div>

      {/* Filtros */}
      <div className="listarCategoriaRepuesto-filters-container">
        <div className="listarCategoriaRepuesto-filter-item">
          <label className="listarCategoriaRepuesto-filter-label">Buscar:</label>
          <div className="listarCategoriaRepuesto-search-container">
            <FaSearch className="listarCategoriaRepuesto-search-icon" />
            <input
              type="text"
              className="listarCategoriaRepuesto-search-input"
              placeholder="Buscar por cualquier campo..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarCategoriaRepuesto-filter-item">
          <label className="listarCategoriaRepuesto-filter-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarCategoriaRepuesto-filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="listarCategoriaRepuesto-table-container">
        <table className="listarCategoriaRepuesto-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasActuales.map((categoria) => (
              <tr key={categoria.id}>
                <td>
                  <div className="listarCategoriaRepuesto-categoria-info">
                    <span className="listarCategoriaRepuesto-categoria-name">{categoria.nombre}</span>
                  </div>
                </td>
                <td>
                  <button
                    className={`listarCategoriaRepuesto-estado-toggle ${
                      categoria.estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
                    }`}
                    onClick={() => cambiarEstadoCategoria(categoria.id, categoria.estado)}
                    title={`Estado: ${categoria.estado} - Click para cambiar`}
                  >
                    {categoria.estado?.toLowerCase() === "activo" ? (
                      <FaToggleOn className="listarCategoriaRepuesto-toggle-icon" />
                    ) : (
                      <FaToggleOff className="listarCategoriaRepuesto-toggle-icon" />
                    )}
                    <span className="listarCategoriaRepuesto-estado-text">{categoria.estado}</span>
                  </button>
                </td>
                <td className="listarCategoriaRepuesto-actions">
                  <button
                    className="listarCategoriaRepuesto-action-button edit"
                    onClick={() => navigate(`/categorias-repuesto/editar/${categoria.id}`)}
                    title="Editar categoría"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="listarCategoriaRepuesto-action-button delete"
                    onClick={() => eliminarCategoria(categoria.id)}
                    title="Eliminar categoría"
                  >
                    <FaTrash />
                  </button>
                  <button
                    className="listarCategoriaRepuesto-action-button detail"
                    onClick={() => navigate(`/categorias-repuesto/detalle/${categoria.id}`)}
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categoriasFiltradas.length === 0 && (
          <div className="listarCategoriaRepuesto-no-results">
            <FaExclamationTriangle className="listarCategoriaRepuesto-no-results-icon" />
            <p>No se encontraron categorías con los criterios de búsqueda.</p>
          </div>
        )}

        {/* Paginación */}
        {categoriasFiltradas.length > categoriasPorPagina && (
          <div className="listarCategoriaRepuesto-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarCategoriaRepuesto-pagination-button"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listarCategoriaRepuesto-pagination-button ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="listarCategoriaRepuesto-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarCategoriasRepuesto

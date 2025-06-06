"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaBuilding,
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
import "../../../../shared/styles/listarProveedor.css"

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

const ListarProveedor = () => {
  const navigate = useNavigate()

  const [proveedores, setProveedores] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [proveedoresPorPagina] = useState(4)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    fetchProveedores()
    return () => {
      document.body.style.background = ""
    }
  }, [])

  const fetchProveedores = async () => {
    try {
      setCargando(true)
      const token = getValidToken()
      if (!token) {
        Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
        return
      }

      const response = await fetch(`${API_BASE_URL}/proveedores`, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener proveedores")
      }

      const data = await response.json()
      setProveedores(data)
    } catch (error) {
      console.error("Error al obtener proveedores:", error)
      setProveedores([])
      Swal.fire("Error", "Error al obtener la lista de proveedores.", "error")
    } finally {
      setCargando(false)
    }
  }

  const eliminarProveedor = useCallback(async (id) => {
    if (!id) {
      Swal.fire("Error", "ID de proveedor inválido", "error")
      return
    }

    const result = await Swal.fire({
      title: "¿Eliminar proveedor?",
      text: "Esta acción eliminará al proveedor permanentemente y no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) return

    try {
      const token = getValidToken()
      if (!token) {
        Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
        return
      }

      const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el proveedor")
      }

      setProveedores((prev) => prev.filter((proveedor) => proveedor._id !== id))

      Swal.fire({
        icon: "success",
        title: "Proveedor eliminado",
        text: "El proveedor ha sido eliminado correctamente",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error al eliminar proveedor:", error)
      Swal.fire("Error", "No se pudo eliminar el proveedor", "error")
    }
  }, [])

  const cambiarEstado = useCallback(async (id, estadoActual) => {
    try {
      const nuevoEstado = estadoActual?.toLowerCase() === "activo" ? "Inactivo" : "Activo"

      const result = await Swal.fire({
        title: `¿Cambiar estado a ${nuevoEstado}?`,
        text: `El proveedor será marcado como ${nuevoEstado.toLowerCase()}`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) return

      const token = getValidToken()
      if (!token) {
        Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
        return
      }

      const response = await fetch(`${API_BASE_URL}/proveedores/${id}/cambiar-estado`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al cambiar el estado")
      }

      setProveedores((prev) => prev.map((p) => (p._id === id ? { ...p, estado: nuevoEstado } : p)))

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `El proveedor ahora está ${nuevoEstado.toLowerCase()}`,
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      Swal.fire("Error", "No se pudo cambiar el estado del proveedor", "error")
    }
  }, [])

  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }, [])

  // Filtrar proveedores
  const proveedoresFiltrados = proveedores.filter((proveedor) => {
    const matchBusqueda = Object.values(proveedor).some((val) => String(val).toLowerCase().includes(busqueda))
    const matchEstado = estadoFiltro === "" || proveedor.estado === estadoFiltro

    return matchBusqueda && matchEstado
  })

  // Paginación
  const indiceUltimoProveedor = paginaActual * proveedoresPorPagina
  const indicePrimerProveedor = indiceUltimoProveedor - proveedoresPorPagina
  const proveedoresActuales = proveedoresFiltrados.slice(indicePrimerProveedor, indiceUltimoProveedor)
  const totalPaginas = Math.ceil(proveedoresFiltrados.length / proveedoresPorPagina)

  if (cargando) {
    return (
      <div className="listarProveedor-container">
        <div className="listarProveedor-loading">
          <div className="listarProveedor-spinner"></div>
          <p>Cargando proveedores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarProveedor-container">
      <div className="listarProveedor-header">
        <div className="listarProveedor-title-section">
          <h1 className="listarProveedor-page-title">
            <FaBuilding className="listarProveedor-title-icon" />
            Gestión de Proveedores
          </h1>
          <p className="listarProveedor-subtitle">Administra los proveedores del sistema</p>
        </div>
        <button className="listarProveedor-create-button" onClick={() => navigate("/CrearProveedor")}>
          <FaPlus className="listarProveedor-button-icon" />
          Crear Proveedor
        </button>
      </div>

      {/* Filtros */}
      <div className="listarProveedor-filters-container">
        <div className="listarProveedor-filter-item">
          <label className="listarProveedor-filter-label">Buscar:</label>
          <div className="listarProveedor-search-container">
            <FaSearch className="listarProveedor-search-icon" />
            <input
              type="text"
              className="listarProveedor-search-input"
              placeholder="Buscar por cualquier campo..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarProveedor-filter-item">
          <label className="listarProveedor-filter-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarProveedor-filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="listarProveedor-table-container">
        <table className="listarProveedor-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Empresa</th>
              <th>Teléfono Empresa</th>
              <th>NIT</th>
              <th>Dirección</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresActuales.map((proveedor) => (
              <tr key={proveedor.id}>
                <td>
                  <div className="listarProveedor-proveedor-info">
                    <span className="listarProveedor-proveedor-name">{proveedor.nombre}</span>
                  </div>
                </td>
                <td>{proveedor.telefono}</td>
                <td>{proveedor.nombre_empresa}</td>
                <td>{proveedor.telefono_empresa}</td>
                <td>{proveedor.nit}</td>
                <td>{proveedor.direccion}</td>
                <td>{proveedor.correo}</td>
                <td>
                  <button
                    className={`listarProveedor-estado-toggle ${
                      proveedor.estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
                    }`}
                    onClick={() => cambiarEstado(proveedor._id, proveedor.estado)}
                    title={`Estado: ${proveedor.estado} - Click para cambiar`}
                  >
                    {proveedor.estado?.toLowerCase() === "activo" ? (
                      <FaToggleOn className="listarProveedor-toggle-icon" />
                    ) : (
                      <FaToggleOff className="listarProveedor-toggle-icon" />
                    )}
                    <span className="listarProveedor-estado-text">{proveedor.estado}</span>
                  </button>
                </td>
                <td className="listarProveedor-actions">
                  <button
                    className="listarProveedor-action-button edit"
                    onClick={() => navigate(`/EditarProveedor/editar/${proveedor._id}`)}
                    title="Editar proveedor"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="listarProveedor-action-button delete"
                    onClick={() => eliminarProveedor(proveedor._id)}
                    title="Eliminar proveedor"
                  >
                    <FaTrash />
                  </button>
                  <button
                    className="listarProveedor-action-button detail"
                    onClick={() => navigate(`/DetalleProveedor/${proveedor._id}`)}
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {proveedoresFiltrados.length === 0 && (
          <div className="listarProveedor-no-results">
            <FaExclamationTriangle className="listarProveedor-no-results-icon" />
            <p>No se encontraron proveedores con los criterios de búsqueda.</p>
          </div>
        )}

        {/* Paginación */}
        {proveedoresFiltrados.length > proveedoresPorPagina && (
          <div className="listarProveedor-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarProveedor-pagination-button"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listarProveedor-pagination-button ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="listarProveedor-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarProveedor

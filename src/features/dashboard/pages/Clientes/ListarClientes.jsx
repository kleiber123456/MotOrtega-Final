"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaExclamationTriangle,
  FaPlus,
  FaToggleOn,
  FaToggleOff,
  FaUsers,
  FaSortAlphaDown,
  FaSortAlphaUp,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Clientes/ListarClientes.css"

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

const ListarClientes = () => {
  const navigate = useNavigate()
  const { makeRequest, loading: apiLoading } = useApi()

  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [tipoDocumentoFiltro, setTipoDocumentoFiltro] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [clientesPorPagina] = useState(4)
  const [cargando, setCargando] = useState(true)
  const [ordenAscendente, setOrdenAscendente] = useState(true)
  const toggleOrden = useCallback(() => {
    setOrdenAscendente((prev) => !prev)
    setPaginaActual(1)
  }, [])

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    cargarClientes()
    return () => {
      document.body.style.background = ""
    }
  }, [])

  const cargarClientes = async () => {
    try {
      setCargando(true)
      const data = await makeRequest("/clientes")
      if (data) {
        setClientes(data)
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error)
      Swal.fire("Error", "No se pudieron cargar los clientes", "error")
    } finally {
      setCargando(false)
    }
  }

  const eliminarCliente = useCallback(
    async (id, nombreCliente) => {
      if (!id) {
        Swal.fire("Error", "ID de cliente inválido", "error")
        return
      }

      const result = await Swal.fire({
        title: "¿Eliminar cliente?",
        text: `Esta acción eliminará al cliente "${nombreCliente}" permanentemente y no se puede deshacer.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) return

      try {
        await makeRequest(`/clientes/${id}`, {
          method: "DELETE",
        })

        setClientes((prev) => prev.filter((cliente) => cliente.id !== id))

        Swal.fire({
          icon: "success",
          title: "Cliente eliminado",
          text: "El cliente ha sido eliminado correctamente",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error al eliminar cliente:", error)
        Swal.fire("Error", "No se pudo eliminar el cliente", "error")
      }
    },
    [makeRequest],
  )

  const cambiarEstado = useCallback(
    async (id, estadoActual, nombreCliente) => {
      // Si está activo y se quiere desactivar, primero consultar si tiene citas, vehículos o ventas asociadas
      if (estadoActual?.toLowerCase() === "activo") {
        try {
          const [citas, vehiculos, ventas] = await Promise.all([
            makeRequest(`/citas?cliente_id=${id}`),
            makeRequest(`/vehiculos/cliente/${id}`),
            makeRequest(`/ventas?cliente_id=${id}`)
          ])
          if ((Array.isArray(citas) && citas.length > 0) ||
              (Array.isArray(vehiculos) && vehiculos.length > 0) ||
              (Array.isArray(ventas) && ventas.length > 0)) {
            await Swal.fire({
              icon: 'warning',
              title: 'No se puede desactivar',
              text: 'El cliente "' + nombreCliente + '" tiene información asociada (citas, vehículos o ventas) y no puede ser desactivado.',
              confirmButtonColor: '#ef4444'
            })
            return
          }
        } catch (error) {
          await Swal.fire({
            icon: 'error',
            title: 'Error al verificar información asociada',
            text: 'No se pudo verificar si el cliente tiene información asociada.',
            confirmButtonColor: '#ef4444'
          })
          return
        }
      }

      try {
        const nuevoEstado = estadoActual?.toLowerCase() === 'activo' ? 'Inactivo' : 'Activo'

        const result = await Swal.fire({
          title: '¿Cambiar estado a ' + nuevoEstado + '?',
          text: 'El cliente "' + nombreCliente + '" será marcado como ' + nuevoEstado.toLowerCase(),
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#2563eb',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Sí, cambiar',
          cancelButtonText: 'Cancelar'
        })

        if (!result.isConfirmed) return

        await makeRequest(`/clientes/${id}/cambiar-estado`, {
          method: 'PUT',
          body: JSON.stringify({ estado: nuevoEstado })
        })

        setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c)))

        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          text: 'El cliente ahora está ' + nuevoEstado.toLowerCase(),
          timer: 2000,
          showConfirmButton: false
        })
      } catch (error) {
        console.error('Error al cambiar estado:', error)
        Swal.fire('Error', 'No se pudo cambiar el estado del cliente', 'error')
      }
    },
    [makeRequest],
  )

  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }, [])

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    const nombreCompleto = `${cliente.nombre || ""} ${cliente.apellido || ""}`.toLowerCase()
    const matchNombre = nombreCompleto.includes(busqueda)
    const matchDocumento = cliente.documento && cliente.documento.toLowerCase().includes(busqueda)
    const matchCorreo = cliente.correo && cliente.correo.toLowerCase().includes(busqueda)
    const matchTelefono = cliente.telefono && cliente.telefono.includes(busqueda)

    const matchBusqueda = matchNombre || matchDocumento || matchCorreo || matchTelefono
    const matchEstado = estadoFiltro === "" || cliente.estado === estadoFiltro
    const matchTipoDocumento = tipoDocumentoFiltro === "" || cliente.tipo_documento === tipoDocumentoFiltro

    return matchBusqueda && matchEstado && matchTipoDocumento
  })

  // Ordenar clientes
  const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
    const nombreA = `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase()
    const nombreB = `${b.nombre || ""} ${b.apellido || ""}`.toLowerCase()
    if (ordenAscendente) {
      return nombreA.localeCompare(nombreB)
    } else {
      return nombreB.localeCompare(nombreA)
    }
  })

  // Paginación
  const indiceUltimoCliente = paginaActual * clientesPorPagina
  const indicePrimerCliente = indiceUltimoCliente - clientesPorPagina
  const clientesActuales = clientesOrdenados.slice(indicePrimerCliente, indiceUltimoCliente)
  const totalPaginas = Math.ceil(clientesOrdenados.length / clientesPorPagina)

  // Obtener tipos de documento únicos para el filtro
  const tiposDocumentoUnicos = [...new Set(clientes.map((c) => c.tipo_documento).filter(Boolean))]

  if (cargando) {
    return (
      <div className="listarClientes-container">
        <div className="listarClientes-loading">
          <div className="listarClientes-spinner"></div>
          <p>Cargando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarClientes-container">
      <div className="listarClientes-header">
        <div className="listarClientes-title-section">
          <h1 className="listarClientes-page-title">
            <FaUsers className="listarClientes-title-icon" />
            Gestión de Clientes
          </h1>
          <p className="listarClientes-subtitle">Administra los clientes del sistema</p>
        </div>
        <button className="listarClientes-create-button" onClick={() => navigate("/CrearClientes")}>
          <FaPlus className="listarClientes-button-icon" />
          Crear Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="listarClientes-filters-container">
        <div className="listarClientes-filter-item">
          <label className="listarClientes-filter-label">Buscar:</label>
          <div className="listarClientes-search-container">
            <FaSearch className="listarClientes-search-icon" />
            <input
              type="text"
              className="listarClientes-search-input"
              placeholder="Buscar por cualquier campo..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarClientes-filter-item">
          <label className="listarClientes-filter-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarClientes-filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <div className="listarClientes-filter-item">
          <label className="listarClientes-filter-label">Tipo de Documento:</label>
          <select
            value={tipoDocumentoFiltro}
            onChange={(e) => {
              setTipoDocumentoFiltro(e.target.value)
              setPaginaActual(1)
            }}
            className="listarClientes-filter-select"
          >
            <option value="">Todos los tipos</option>
            {tiposDocumentoUnicos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div className="listarClientes-filter-item">
          <label className="listarClientes-filter-label">Ordenar:</label>
          <button
            onClick={toggleOrden}
            className="listarClientes-sort-button"
            title={`Ordenar ${ordenAscendente ? "descendente" : "ascendente"}`}
          >
            {ordenAscendente ? (
              <>
                <FaSortAlphaDown className="listarClientes-sort-icon" />
                Ascendente
              </>
            ) : (
              <>
                <FaSortAlphaUp className="listarClientes-sort-icon" />
                Descendente
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="listarClientes-table-container">
        <table className="listarClientes-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Documento</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesActuales.map((cliente) => (
              <tr key={cliente.id}>
                <td>
                  <div className="listarClientes-user-info">
                    <span className="listarClientes-user-name">
                      {`${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "Sin nombre"}
                    </span>
                    <span className="listarClientes-user-doc-type">{cliente.tipo_documento}</span>
                  </div>
                </td>
                <td>{cliente.documento || "Sin documento"}</td>
                <td>{cliente.correo || "Sin correo"}</td>
                <td>{cliente.telefono || "Sin teléfono"}</td>
                <td>
                  <div className="listarClientes-direccion" title={cliente.direccion || "Sin dirección"}>
                    {cliente.direccion || "Sin dirección"}
                  </div>
                </td>
                <td>
                  <button
                    className={`listarClientes-estado-toggle ${
                      cliente.estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
                    }`}
                    onClick={() => cambiarEstado(cliente.id, cliente.estado, `${cliente.nombre} ${cliente.apellido}`)}
                    title={`Estado: ${cliente.estado} - Click para cambiar`}
                  >
                    {cliente.estado?.toLowerCase() === "activo" ? (
                      <FaToggleOn className="listarClientes-toggle-icon" />
                    ) : (
                      <FaToggleOff className="listarClientes-toggle-icon" />
                    )}
                    <span className="listarClientes-estado-text">{cliente.estado}</span>
                  </button>
                </td>
                <td className="listarClientes-actions">
                  <button
                    className="listarClientes-action-button detail"
                    onClick={() => navigate(`/DetalleCliente/${cliente.id}`)}
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="listarClientes-action-button edit"
                    onClick={() => navigate(`/EditarCliente/${cliente.id}`)}
                    title="Editar cliente"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="listarClientes-action-button delete"
                    onClick={() => eliminarCliente(cliente.id, `${cliente.nombre} ${cliente.apellido}`)}
                    title="Eliminar cliente"
                  >
                    <FaTrash />
                  </button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clientesOrdenados.length === 0 && (
          <div className="listarClientes-no-results">
            <FaExclamationTriangle className="listarClientes-no-results-icon" />
            <p>No se encontraron clientes con los criterios de búsqueda.</p>
          </div>
        )}

        {/* Paginación */}
        {clientesOrdenados.length > clientesPorPagina && (
          <div className="listarClientes-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarClientes-pagination-button"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listarClientes-pagination-button ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="listarClientes-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarClientes

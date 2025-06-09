"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Edit, Trash2, Power, Plus, Users, Eye } from "lucide-react"
import Swal from "sweetalert2"
import "../../../../shared/styles/Clientes/ListarClientes.css"

function ListarClientes() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [tipoDocumentoFiltro, setTipoDocumentoFiltro] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [clientesPorPagina] = useState(4)

  useEffect(() => {
    document.body.style.backgroundColor = "#2d3748"
    cargarClientes()
    return () => {
      document.body.style.background = ""
    }
  }, [token])

  const cargarClientes = async () => {
    try {
      setCargando(true)

      const response = await fetch("https://api-final-8rw7.onrender.com/api/clientes", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (!response.ok) throw new Error("Error al cargar los clientes")

      const data = await response.json()
      setClientes(data)
    } catch (error) {
      console.error("Error al cargar clientes:", error)
      Swal.fire("Error", "No se pudieron cargar los clientes", "error")
    } finally {
      setCargando(false)
    }
  }

  const handleSearch = (e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }

  // Función para editar cliente
  const handleEditarCliente = (clienteId) => {
    navigate(`/EditarCliente/${clienteId}`)
  }

  // Función para ver detalle del cliente
  const handleVerDetalle = (clienteId) => {
    navigate(`/DetalleCliente/${clienteId}`)
  }

  // Función para eliminar cliente
  const handleEliminarCliente = async (clienteId, nombreCliente) => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: "Eliminar Cliente",
        text: `¿Está seguro de que desea eliminar al cliente "${nombreCliente}"? Esta acción no se puede deshacer.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (!isConfirmed) return

      const response = await fetch(`https://api-final-8rw7.onrender.com/api/clientes/${clienteId}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el cliente")
      }

      // Actualizar la lista de clientes
      setClientes(clientes.filter((cliente) => cliente.id !== clienteId))

      Swal.fire("¡Éxito!", "El cliente ha sido eliminado exitosamente", "success")
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
      Swal.fire("Error", "No se pudo eliminar el cliente", "error")
    }
  }

  // Función para cambiar estado del cliente
  const handleCambiarEstado = async (clienteId, estadoActual, nombreCliente) => {
    try {
      const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo"
      const accion = nuevoEstado === "Activo" ? "activar" : "desactivar"

      const { isConfirmed } = await Swal.fire({
        title: `${accion.charAt(0).toUpperCase() + accion.slice(1)} Cliente`,
        text: `¿Está seguro de que desea ${accion} al cliente "${nombreCliente}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: nuevoEstado === "Activo" ? "#10b981" : "#f59e0b",
        cancelButtonColor: "#d33",
        confirmButtonText: `Sí, ${accion}`,
        cancelButtonText: "Cancelar",
      })

      if (!isConfirmed) return

      // Usar el endpoint correcto
      const response = await fetch(`https://api-final-8rw7.onrender.com/api/clientes/${clienteId}/cambiar-estado`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (!response.ok) {
        throw new Error("Error al cambiar el estado del cliente")
      }

      // Actualizar la lista de clientes
      setClientes(clientes.map((cliente) => (cliente.id === clienteId ? { ...cliente, estado: nuevoEstado } : cliente)))

      Swal.fire("¡Éxito!", `El cliente ha sido ${accion}do exitosamente`, "success")
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      Swal.fire("Error", "No se pudo cambiar el estado del cliente", "error")
    }
  }

  // Filtrar clientes por búsqueda, estado y tipo de documento
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

  // Paginación
  const indiceUltimoCliente = paginaActual * clientesPorPagina
  const indicePrimerCliente = indiceUltimoCliente - clientesPorPagina
  const clientesActuales = clientesFiltrados.slice(indicePrimerCliente, indiceUltimoCliente)
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina)

  // Función para obtener la clase de color según el estado
  const getEstadoClass = (estado) => {
    switch (estado) {
      case "Activo":
        return "estado-activo"
      case "Inactivo":
        return "estado-inactivo"
      default:
        return ""
    }
  }

  if (cargando) {
    return (
      <div className="listarClientes-contenedor">
        <div className="listarClientes-loading">
          <div className="listarClientes-spinner"></div>
          <p>Cargando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarClientes-contenedor">
      <div className="listarClientes-header">
        <h2 className="listarClientes-titulo">
          <Users className="listarClientes-titulo-icon" />
          Listado de Clientes
        </h2>
        <button className="listarClientes-boton-crear" onClick={() => navigate("/CrearClientes")}>
          <Plus size={18} />
          Crear Cliente
        </button>
      </div>

      {/* Filtros organizados horizontalmente */}
      <div className="listarClientes-filtros-container-horizontal">
        <div className="listarClientes-filtro-item">
          <label className="listarClientes-filtro-label">Buscar:</label>
          <input
            type="text"
            className="listarClientes-input listarClientes-filtro-input"
            placeholder="Buscar por nombre, documento, correo o teléfono..."
            value={busqueda}
            onChange={handleSearch}
          />
        </div>

        <div className="listarClientes-filtro-item">
          <label className="listarClientes-filtro-label">Tipo de Documento:</label>
          <select
            value={tipoDocumentoFiltro}
            onChange={(e) => setTipoDocumentoFiltro(e.target.value)}
            className="listarClientes-input listarClientes-filtro-select"
          >
            <option value="">Todos los tipos</option>
            <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
            <option value="Tarjeta de identidad">Tarjeta de identidad</option>
          </select>
        </div>

        <div className="listarClientes-filtro-item">
          <label className="listarClientes-filtro-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="listarClientes-input listarClientes-filtro-select"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="listarClientes-tabla-container" style={{ overflowX: "auto" }}>
        <table className="listarClientes-tabla">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Contacto</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesActuales.map((cliente) => (
              <tr key={cliente.id}>
                <td>
                  <div className="listarClientes-cliente-info">
                    <span className="listarClientes-cliente-nombre">
                      {`${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "Sin nombre"}
                    </span>
                    <span className="listarClientes-cliente-documento">ID: {cliente.id}</span>
                  </div>
                </td>
                <td>
                  <div className="listarClientes-cliente-info">
                    <span className="listarClientes-tipo-documento">
                      {cliente.tipo_documento === "Cédula de ciudadanía" ? "C.C." : "T.I."}
                    </span>
                    <span>{cliente.documento || "Sin documento"}</span>
                  </div>
                </td>
                <td>
                  <div className="listarClientes-contacto">
                    <span className="listarClientes-contacto-item">📧 {cliente.correo || "Sin correo"}</span>
                    <span className="listarClientes-contacto-item">📞 {cliente.telefono || "Sin teléfono"}</span>
                  </div>
                </td>
                <td>
                  <div className="listarClientes-direccion" title={cliente.direccion || "Sin dirección"}>
                    {cliente.direccion || "Sin dirección"}
                  </div>
                </td>
                <td>
                  <span className={`listarClientes-estado ${getEstadoClass(cliente.estado)}`}>
                    {cliente.estado || "Sin estado"}
                  </span>
                </td>
                <td className="listarClientes-acciones">
                  {/* Botón Ver Detalle */}
                  <button
                    className="listarClientes-icon-button detalle"
                    onClick={() => handleVerDetalle(cliente.id)}
                    title="Ver detalle"
                  >
                    <Eye size={18} />
                  </button>

                  {/* Botón Editar */}
                  <button
                    className="listarClientes-icon-button editar"
                    onClick={() => handleEditarCliente(cliente.id)}
                    title="Editar cliente"
                  >
                    <Edit size={18} />
                  </button>

                  {/* Botón Cambiar Estado */}
                  <button
                    className="listarClientes-icon-button cambiar-estado"
                    onClick={() =>
                      handleCambiarEstado(cliente.id, cliente.estado, `${cliente.nombre} ${cliente.apellido}`)
                    }
                    title={cliente.estado === "Activo" ? "Desactivar cliente" : "Activar cliente"}
                  >
                    <Power size={18} />
                  </button>

                  {/* Botón Eliminar */}
                  <button
                    className="listarClientes-icon-button eliminar"
                    onClick={() => handleEliminarCliente(cliente.id, `${cliente.nombre} ${cliente.apellido}`)}
                    title="Eliminar cliente"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clientesFiltrados.length === 0 && (
          <p className="listarClientes-sin-resultados">No se encontraron clientes con los criterios de búsqueda.</p>
        )}

        {clientesFiltrados.length > clientesPorPagina && (
          <div className="listarClientes-paginacion">
            <button
              onClick={() => setPaginaActual((prev) => prev - 1)}
              disabled={paginaActual === 1}
              className="listarClientes-boton-paginacion"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listarClientes-boton-paginacion ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => prev + 1)}
              disabled={paginaActual === totalPaginas}
              className="listarClientes-boton-paginacion"
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

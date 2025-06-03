"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, FileText, CheckCircle, XCircle } from "lucide-react"
import Swal from "sweetalert2"
import { generarFacturaPDF, cargarDatosCompletosCompra } from "../../utils/pdf-generator"
import "../../../../shared/styles/listarCompras.css"

function ListarCompras() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const [compras, setCompras] = useState([])
  const [proveedores, setProveedores] = useState({})
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [proveedorFiltro, setProveedorFiltro] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [comprasPorPagina] = useState(4)

  useEffect(() => {
    document.body.style.backgroundColor = "#2d3748"
    cargarDatos()
    return () => {
      document.body.style.background = ""
    }
  }, [token])

  const cargarDatos = async () => {
    try {
      setCargando(true)

      // Cargar proveedores
      const resProveedores = await fetch("https://api-final-8rw7.onrender.com/api/proveedores", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (!resProveedores.ok) throw new Error("Error al cargar los proveedores")

      const dataProveedores = await resProveedores.json()
      const proveedoresMap = {}
      dataProveedores.forEach((prov) => {
        proveedoresMap[prov.id] = prov.nombre
      })
      setProveedores(proveedoresMap)

      // Cargar compras
      const resCompras = await fetch("https://api-final-8rw7.onrender.com/api/compras", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })

      if (!resCompras.ok) throw new Error("Error al cargar las compras")

      const dataCompras = await resCompras.json()
      setCompras(dataCompras)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      Swal.fire("Error", "No se pudieron cargar los datos", "error")
    } finally {
      setCargando(false)
    }
  }

  const handleSearch = (e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }

  // Función para confirmar una compra (cambiar a Completado)
  const handleConfirmarCompra = async (compraId, estadoActual) => {
    try {
      // Validar que solo se puedan confirmar compras pendientes
      if (estadoActual !== "Pendiente") {
        Swal.fire("Información", "Solo se pueden confirmar compras en estado Pendiente", "info")
        return
      }

      // Mostrar confirmación
      const { isConfirmed } = await Swal.fire({
        title: "Confirmar Compra",
        text: "¿Está seguro de que desea confirmar esta compra? Esta acción no se puede deshacer.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "Cancelar",
      })

      if (!isConfirmed) return

      // Realizar la petición usando el endpoint correcto
      const response = await fetch(`https://api-final-8rw7.onrender.com/api/compras/${compraId}/cambiar-estado`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "Completado" }),
      })

      if (!response.ok) {
        throw new Error("Error al confirmar la compra")
      }

      // Actualizar la lista de compras
      setCompras(compras.map((compra) => (compra.id === compraId ? { ...compra, estado: "Completado" } : compra)))

      Swal.fire("¡Éxito!", "La compra ha sido confirmada exitosamente", "success")
    } catch (error) {
      console.error("Error al confirmar compra:", error)
      Swal.fire("Error", "No se pudo confirmar la compra", "error")
    }
  }

  // Función para anular una compra (cambiar a Cancelado)
  const handleAnularCompra = async (compraId, estadoActual) => {
    try {
      // Validar que solo se puedan anular compras pendientes
      if (estadoActual !== "Pendiente") {
        Swal.fire("Información", "Solo se pueden anular compras en estado Pendiente", "info")
        return
      }

      // Mostrar confirmación
      const { isConfirmed } = await Swal.fire({
        title: "Anular Compra",
        text: "¿Está seguro de que desea anular esta compra? Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, anular",
        cancelButtonText: "Cancelar",
      })

      if (!isConfirmed) return

      // Realizar la petición usando el endpoint correcto
      const response = await fetch(`https://api-final-8rw7.onrender.com/api/compras/${compraId}/cambiar-estado`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "Cancelado" }),
      })

      if (!response.ok) {
        throw new Error("Error al anular la compra")
      }

      // Actualizar la lista de compras
      setCompras(compras.map((compra) => (compra.id === compraId ? { ...compra, estado: "Cancelado" } : compra)))

      Swal.fire("¡Éxito!", "La compra ha sido anulada exitosamente", "success")
    } catch (error) {
      console.error("Error al anular compra:", error)
      Swal.fire("Error", "No se pudo anular la compra", "error")
    }
  }

  // Función para generar PDF usando el nuevo generador
  const handleGenerarPDF = async (compraId) => {
    try {
      // Mostrar loading
      Swal.fire({
        title: "Generando PDF...",
        text: "Por favor espere mientras se genera el documento",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Cargar datos completos de la compra
      const { compra, proveedor, detallesConProductos } = await cargarDatosCompletosCompra(compraId, token)

      // Generar el PDF
      await generarFacturaPDF(compra, proveedor, detallesConProductos, token)

      // Cerrar loading y mostrar éxito
      Swal.close()
      Swal.fire("¡Éxito!", "El PDF se ha generado correctamente", "success")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      Swal.close()
      Swal.fire("Error", "No se pudo generar el PDF de la compra", "error")
    }
  }

  // Filtrar compras por búsqueda, proveedor y estado
  const comprasFiltradas = compras.filter((compra) => {
    const fechaFormateada = new Date(compra.fecha).toLocaleDateString("es-CO").toLowerCase()
    const matchFecha = fechaFormateada.includes(busqueda)
    const matchProveedor = proveedorFiltro === "" || compra.proveedor_id.toString() === proveedorFiltro
    const matchEstado = estadoFiltro === "" || compra.estado === estadoFiltro
    return matchFecha && matchProveedor && matchEstado
  })

  // Paginación
  const indiceUltimaCompra = paginaActual * comprasPorPagina
  const indicePrimeraCompra = indiceUltimaCompra - comprasPorPagina
  const comprasActuales = comprasFiltradas.slice(indicePrimeraCompra, indiceUltimaCompra)
  const totalPaginas = Math.ceil(comprasFiltradas.length / comprasPorPagina)

  // Función para formatear el precio
  const formatearPrecio = (precio) => {
    if (!precio) return "$0.00"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(precio)
  }

  // Función para obtener la clase de color según el estado
  const getEstadoClass = (estado) => {
    switch (estado) {
      case "Completado":
        return "estado-completado"
      case "Pendiente":
        return "estado-pendiente"
      case "Cancelado":
        return "estado-cancelado"
      default:
        return ""
    }
  }

  if (cargando) {
    return (
      <div className="listar_compras_contenedor">
        <div className="listar_compras_loading">
          <div className="listar_compras_spinner"></div>
          <p>Cargando compras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listar_compras_contenedor">
      <div className="listar_compras_header">
        <h2 className="listar_compras_titulo">Listado de Compras</h2>
        <button className="listar_compras_boton-crear" onClick={() => navigate("/CrearCompras")}>
          Crear Compra
        </button>
      </div>

      {/* Filtros organizados horizontalmente */}
      <div className="listar_compras_filtros-container-horizontal">
        <div className="listar_compras_filtro-item">
          <label className="listar_compras_filtro-label">Buscar:</label>
          <input
            type="text"
            className="listar_compras_input listar_compras_filtro-input"
            placeholder="Buscar por fecha..."
            value={busqueda}
            onChange={handleSearch}
          />
        </div>

        <div className="listar_compras_filtro-item">
          <label className="listar_compras_filtro-label">Proveedor:</label>
          <select
            value={proveedorFiltro}
            onChange={(e) => setProveedorFiltro(e.target.value)}
            className="listar_compras_input listar_compras_filtro-select"
          >
            <option value="">Todos los proveedores</option>
            {Object.keys(proveedores).map((id) => (
              <option key={id} value={id}>
                {proveedores[id]}
              </option>
            ))}
          </select>
        </div>

        <div className="listar_compras_filtro-item">
          <label className="listar_compras_filtro-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="listar_compras_input listar_compras_filtro-select"
          >
            <option value="">Todos los estados</option>
            <option value="Completado">Completado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="listar_compras_tabla-container" style={{ overflowX: "auto" }}>
        <table className="listar_compras_tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comprasActuales.map((compra) => (
              <tr key={compra.id}>
                <td>{new Date(compra.fecha).toLocaleDateString("es-CO")}</td>
                <td>{proveedores[compra.proveedor_id] || "Sin proveedor"}</td>
                <td>{formatearPrecio(compra.total)}</td>
                <td>
                  <span className={`listar_compras_estado ${getEstadoClass(compra.estado)}`}>{compra.estado}</span>
                </td>
                <td className="listar_compras_acciones">
                  {/* Solo mostrar botones de acción si la compra está en estado Pendiente */}
                  {compra.estado === "Pendiente" && (
                    <>
                      {/* Botón Confirmar */}
                      <button
                        className="listar_compras_icon-button confirmar"
                        onClick={() => handleConfirmarCompra(compra.id, compra.estado)}
                        title="Confirmar compra"
                      >
                        <CheckCircle size={18} />
                      </button>

                      {/* Botón Anular */}
                      <button
                        className="listar_compras_icon-button anular"
                        onClick={() => handleAnularCompra(compra.id, compra.estado)}
                        title="Anular compra"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}

                  {/* Botón Ver Detalle - Siempre visible */}
                  <button
                    className="listar_compras_icon-button detalle"
                    onClick={() => navigate(`/DetalleCompra/${compra.id}`)}
                    title="Ver detalle"
                  >
                    <Eye size={18} />
                  </button>

                  {/* Botón Generar PDF - Siempre visible */}
                  <button
                    className="listar_compras_icon-button pdf"
                    onClick={() => handleGenerarPDF(compra.id)}
                    title="Generar PDF"
                  >
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {comprasFiltradas.length === 0 && (
          <p className="listar_compras_sin-resultados">No se encontraron compras con los criterios de búsqueda.</p>
        )}

        {comprasFiltradas.length > comprasPorPagina && (
          <div className="listar_compras_paginacion">
            <button
              onClick={() => setPaginaActual((prev) => prev - 1)}
              disabled={paginaActual === 1}
              className="listar_compras_boton-paginacion"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`listar_compras_boton-paginacion ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => prev + 1)}
              disabled={paginaActual === totalPaginas}
              className="listar_compras_boton-paginacion"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarCompras

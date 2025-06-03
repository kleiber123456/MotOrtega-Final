"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { Pencil, Trash2, Eye } from "lucide-react"
import "../../../../shared/styles/ListarProveedor.css"

const ListarServicios = () => {
  const [servicios, setServicios] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const serviciosPorPagina = 10
  const navigate = useNavigate()

  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  useEffect(() => {
    fetchServicios()
  }, [])

  // Función para obtener servicios
  const fetchServicios = async () => {
    try {
      if (!token) {
        Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
        return
      }

      const res = await axios.get("https://api-final-8rw7.onrender.com/api/servicios", {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      })

      setServicios(res.data)
    } catch (err) {
      console.error("Error al obtener servicios:", err)
      setServicios([])
      Swal.fire("Error", "Error al obtener la lista de servicios.", "error")
    }
  }

  // Función para eliminar un servicio
  const eliminarServicio = async (id) => {
    if (!id) {
      Swal.fire("Error", "ID de servicio inválido", "error")
      return
    }

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el servicio permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (!confirmacion.isConfirmed) return

    try {
      const res = await axios.delete(`https://api-final-8rw7.onrender.com/api/servicios/${id}`, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      })

      if (res.status === 200 || res.status === 204) {
        setServicios((prev) => prev.filter((servicio) => servicio.id !== id))
        Swal.fire("Eliminado", "Servicio eliminado correctamente", "success")
      } else {
        throw new Error(`Error al eliminar el servicio: ${res.status}`)
      }
    } catch (err) {
      console.error("Error al eliminar el servicio:", err)
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "No se pudo eliminar el servicio"
      Swal.fire("Error", errorMessage, "error")
    }
  }

  // Función para cambiar el estado de un servicio
  const cambiarEstado = async (id) => {
    try {
      if (!token) {
        Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
        return
      }
      const res = await axios.put(
        `https://api-final-8rw7.onrender.com/api/servicios/${id}/cambiar-estado`,
        {},
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setServicios((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                estado: s.estado.toLowerCase() === "activo" ? "Inactivo" : "Activo",
              }
            : s,
        ),
      )
      Swal.fire("Éxito", "Estado del servicio cambiado correctamente", "success")
    } catch (err) {
      console.error("Error al cambiar el estado:", err)
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "No se pudo cambiar el estado del servicio"
      Swal.fire("Error", errorMessage, "error")
    }
  }

  const handleBuscar = (e) => {
    setBusqueda(e.target.value)
    setPaginaActual(1)
  }

  const serviciosFiltrados = Array.isArray(servicios)
    ? servicios.filter((serv) => {
        const textoBusqueda = busqueda.toLowerCase()
        return (
          serv.nombre.toLowerCase().includes(textoBusqueda) ||
          serv.descripcion.toLowerCase().includes(textoBusqueda) ||
          String(serv.precio || "")
            .toLowerCase()
            .includes(textoBusqueda) ||
          serv.estado.toLowerCase().includes(textoBusqueda)
        )
      })
    : []

  const indexUltimo = paginaActual * serviciosPorPagina
  const indexPrimero = indexUltimo - serviciosPorPagina
  const serviciosPaginados = serviciosFiltrados.slice(indexPrimero, indexUltimo)
  const totalPaginas = Math.ceil(serviciosFiltrados.length / serviciosPorPagina)

  const cambiarPagina = (numero) => {
    setPaginaActual(numero)
  }

  const handleEditar = (id) => {
    navigate(`/servicios/editar/${id}`)
  }

  const handleEliminar = (id) => {
    eliminarServicio(id)
  }

  const handleDetalle = (id) => {
    navigate(`/servicios/detalle/${id}`)
  }

  return (
    <div className="LiUs-contenedor">
      <div className="LiUs-header">
        <h2 className="LiUs-titulo">Lista de Servicios</h2>
        <button className="LiUs-boton-crear" onClick={() => navigate("/crearServicios")}>
          Crear Servicio
        </button>
      </div>

      <input
        className="LiUs-input-busqueda"
        type="text"
        placeholder="Buscar por nombre, descripción, precio, etc."
        value={busqueda}
        onChange={handleBuscar}
      />

      <div className="LiUs-tabla-container">
        <table className="LiUs-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {serviciosPaginados.length > 0 ? (
              serviciosPaginados.map((serv) => (
                <tr key={serv.id}>
                  <td>{serv.nombre}</td>
                  <td>{serv.descripcion}</td>
                  <td>${serv.precio?.toLocaleString()}</td>
                  <td>
                    <div
                      className={`estado-switch ${serv.estado === "Activo" ? "activo" : "inactivo"}`}
                      title={serv.estado}
                      onClick={() => cambiarEstado(serv.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="switch-bola"></div>
                    </div>
                  </td>
                  <td>
                    <div className="LiUs-acciones">
                      <button className="icon-button edit" title="Editar" onClick={() => handleEditar(serv.id)}>
                        <Pencil size={18} />
                      </button>
                      <button className="icon-button delete" title="Eliminar" onClick={() => handleEliminar(serv.id)}>
                        <Trash2 size={18} />
                      </button>
                      <button className="icon-button detail" title="Detalle" onClick={() => handleDetalle(serv.id)}>
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No se encontraron servicios.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {serviciosFiltrados.length > serviciosPorPagina && (
        <div className="LiUs-paginacion">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="LiUs-boton-paginacion"
          >
            Anterior
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => cambiarPagina(i + 1)}
              className={`LiUs-boton-paginacion ${paginaActual === i + 1 ? "active" : ""}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="LiUs-boton-paginacion"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}

export default ListarServicios

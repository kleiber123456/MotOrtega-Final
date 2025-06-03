"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { Pencil, Trash2, Eye } from "lucide-react"
import "../../../../shared/styles/ListarProveedor.css"

const ListarVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const vehiculosPorPagina = 10
  const navigate = useNavigate()

  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  useEffect(() => {
    fetchVehiculos()
  }, [])

  // Función para obtener vehículos
  const fetchVehiculos = async () => {
    try {
      if (!token) {
        Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
        return
      }

      const res = await axios.get("https://api-final-8rw7.onrender.com/api/vehiculos", {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      })

      setVehiculos(res.data)
    } catch (err) {
      console.error("Error al obtener vehículos:", err)
      setVehiculos([])
      Swal.fire("Error", "Error al obtener la lista de vehículos.", "error")
    }
  }

  // Función para eliminar un vehículo
  const eliminarVehiculo = async (id) => {
    if (!id) {
      Swal.fire("Error", "ID de vehículo inválido", "error")
      return
    }

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el vehículo permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (!confirmacion.isConfirmed) return

    try {
      const res = await axios.delete(`https://api-final-8rw7.onrender.com/api/vehiculos/${id}`, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      })

      if (res.status === 200 || res.status === 204) {
        setVehiculos((prev) => prev.filter((vehiculo) => vehiculo.id !== id))
        Swal.fire("Eliminado", "Vehículo eliminado correctamente", "success")
      } else {
        throw new Error(`Error al eliminar el vehículo: ${res.status}`)
      }
    } catch (err) {
      console.error("Error al eliminar el vehículo:", err)
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "No se pudo eliminar el vehículo"
      Swal.fire("Error", errorMessage, "error")
    }
  }

  // Función para cambiar el estado de un vehículo
  const cambiarEstado = async (id) => {
    try {
      if (!token) {
        Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
        return
      }
      const res = await axios.put(
        `https://api-final-8rw7.onrender.com/api/vehiculos/${id}/cambiar-estado`,
        {},
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setVehiculos((prev) =>
        prev.map((v) =>
          v.id === id
            ? {
                ...v,
                estado: v.estado.toLowerCase() === "activo" ? "Inactivo" : "Activo",
              }
            : v,
        ),
      )
      Swal.fire("Éxito", "Estado del vehículo cambiado correctamente", "success")
    } catch (err) {
      console.error("Error al cambiar el estado:", err)
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "No se pudo cambiar el estado del vehículo"
      Swal.fire("Error", errorMessage, "error")
    }
  }

  const handleBuscar = (e) => {
    setBusqueda(e.target.value)
    setPaginaActual(1)
  }

  const vehiculosFiltrados = Array.isArray(vehiculos)
    ? vehiculos.filter((vehiculo) => {
        const textoBusqueda = busqueda.toLowerCase()
        return (
          vehiculo.placa?.toLowerCase().includes(textoBusqueda) ||
          vehiculo.color?.toLowerCase().includes(textoBusqueda) ||
          vehiculo.tipo_vehiculo?.toLowerCase().includes(textoBusqueda) ||
          vehiculo.marca_nombre?.toLowerCase().includes(textoBusqueda) ||
          vehiculo.cliente_nombre?.toLowerCase().includes(textoBusqueda) ||
          vehiculo.referencia_nombre?.toLowerCase().includes(textoBusqueda) ||
          vehiculo.estado?.toLowerCase().includes(textoBusqueda)
        )
      })
    : []

  const indexUltimo = paginaActual * vehiculosPorPagina
  const indexPrimero = indexUltimo - vehiculosPorPagina
  const vehiculosPaginados = vehiculosFiltrados.slice(indexPrimero, indexUltimo)
  const totalPaginas = Math.ceil(vehiculosFiltrados.length / vehiculosPorPagina)

  const cambiarPagina = (numero) => {
    setPaginaActual(numero)
  }

  const handleEditar = (id) => {
    navigate(`/vehiculos/editar/${id}`)
  }

  const handleEliminar = (id) => {
    eliminarVehiculo(id)
  }

  const handleDetalle = (id) => {
    navigate(`/vehiculos/detalle/${id}`)
  }

  return (
    <div className="LiUs-contenedor">
      <div className="LiUs-header">
        <h2 className="LiUs-titulo">Lista de Vehículos</h2>
        <button className="LiUs-boton-crear" onClick={() => navigate("/vehiculos/crear")}>
          Crear Vehículo
        </button>
      </div>

      <input
        className="LiUs-input-busqueda"
        type="text"
        placeholder="Buscar por placa, color, tipo, marca, cliente, etc."
        value={busqueda}
        onChange={handleBuscar}
      />

      <div className="LiUs-tabla-container">
        <table className="LiUs-tabla">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Color</th>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Cliente</th>
              <th>Referencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosPaginados.length > 0 ? (
              vehiculosPaginados.map((vehiculo) => (
                <tr key={vehiculo.id}>
                  <td>{vehiculo.placa}</td>
                  <td>{vehiculo.color}</td>
                  <td>{vehiculo.tipo_vehiculo}</td>
                  <td>{vehiculo.marca_nombre || "N/A"}</td>
                  <td>{vehiculo.cliente_nombre || "N/A"}</td>
                  <td>{vehiculo.referencia_nombre || "N/A"}</td>
                  <td>
                    <div
                      className={`estado-switch ${vehiculo.estado === "Activo" ? "activo" : "inactivo"}`}
                      title={vehiculo.estado}
                      onClick={() => cambiarEstado(vehiculo.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="switch-bola"></div>
                    </div>
                  </td>
                  <td>
                    <div className="LiUs-acciones">
                      <button className="icon-button edit" title="Editar" onClick={() => handleEditar(vehiculo.id)}>
                        <Pencil size={18} />
                      </button>
                      <button
                        className="icon-button delete"
                        title="Eliminar"
                        onClick={() => handleEliminar(vehiculo.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="icon-button detail" title="Detalle" onClick={() => handleDetalle(vehiculo.id)}>
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No se encontraron vehículos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {vehiculosFiltrados.length > vehiculosPorPagina && (
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

export default ListarVehiculos

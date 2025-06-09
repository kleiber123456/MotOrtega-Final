"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Edit, Trash2, Plus, Clock } from "lucide-react"
import Swal from "sweetalert2"
import "../../../../shared/styles/Horarios/ListarHorarios.css"

function ListarHorarios() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const [horarios, setHorarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [paginaActual, setPaginaActual] = useState(1)
  const [horariosPorPagina] = useState(5)

  useEffect(() => {
    cargarHorarios()
  }, [token])

  const cargarHorarios = async () => {
    try {
      setCargando(true)
      const response = await fetch("https://api-final-8rw7.onrender.com/api/horarios", {
        headers: {
          Authorization: token,
        },
      })

      if (!response.ok) throw new Error("Error al cargar los horarios")

      const data = await response.json()
      setHorarios(data)
    } catch (error) {
      console.error("Error:", error)
      Swal.fire("Error", "No se pudieron cargar los horarios", "error")
    } finally {
      setCargando(false)
    }
  }

  const handleEliminarHorario = async (id) => {
    try {
      const result = await Swal.fire({
        title: "¿Eliminar horario?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (result.isConfirmed) {
        const response = await fetch(`https://api-final-8rw7.onrender.com/api/horarios/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        })

        if (!response.ok) throw new Error("Error al eliminar el horario")

        setHorarios(horarios.filter((horario) => horario.id !== id))
        Swal.fire("Eliminado", "El horario ha sido eliminado", "success")
      }
    } catch (error) {
      console.error("Error:", error)
      Swal.fire("Error", "No se pudo eliminar el horario", "error")
    }
  }

  const indexUltimoHorario = paginaActual * horariosPorPagina
  const indexPrimerHorario = indexUltimoHorario - horariosPorPagina
  const horariosActuales = horarios.slice(indexPrimerHorario, indexUltimoHorario)

  if (cargando) {
    return (
      <div className="listarHorarios-container">
        <div className="listarHorarios-loading">Cargando horarios...</div>
      </div>
    )
  }

  return (
    <div className="listarHorarios-container">
      <div className="listarHorarios-header">
        <h2 className="listarHorarios-title">
          <Clock className="listarHorarios-icon" /> Horarios
        </h2>
        <button className="listarHorarios-button-crear" onClick={() => navigate("/CrearHorario")}>
          <Plus size={20} /> Crear Horario
        </button>
      </div>

      <div className="listarHorarios-table-container">
        <table className="listarHorarios-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora Inicio</th>
              <th>Hora Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {horariosActuales.map((horario) => (
              <tr key={horario.id}>
                <td>{new Date(horario.fecha).toLocaleDateString()}</td>
                <td>{horario.hora_inicio}</td>
                <td>{horario.hora_fin}</td>
                <td className="listarHorarios-actions">
                  <button
                    className="listarHorarios-button edit"
                    onClick={() => navigate(`/EditarHorario/${horario.id}`)}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="listarHorarios-button delete"
                    onClick={() => handleEliminarHorario(horario.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {horarios.length === 0 && (
          <div className="listarHorarios-no-data">No hay horarios registrados</div>
        )}
      </div>

      {horarios.length > horariosPorPagina && (
        <div className="listarHorarios-pagination">
          <button
            onClick={() => setPaginaActual(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="listarHorarios-pagination-button"
          >
            Anterior
          </button>
          <span className="listarHorarios-pagination-info">
            Página {paginaActual} de {Math.ceil(horarios.length / horariosPorPagina)}
          </span>
          <button
            onClick={() => setPaginaActual(paginaActual + 1)}
            disabled={indexUltimoHorario >= horarios.length}
            className="listarHorarios-pagination-button"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}

export default ListarHorarios
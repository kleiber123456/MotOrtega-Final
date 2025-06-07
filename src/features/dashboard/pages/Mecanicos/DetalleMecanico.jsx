"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FaArrowLeft, FaEdit, FaUser, FaMapMarkerAlt, FaClock, FaCalendarAlt } from "react-icons/fa"
import "../../../../shared/styles/Mecanicos/DetalleMecanicos.css"

const DetalleMecanico = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [mecanico, setMecanico] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMecanico = async () => {
      try {
        // Datos mock del mecánico
        const mecanicoMock = {
          id: 1,
          nombre: "Juan Carlos",
          apellido: "Pérez García",
          tipo_documento: "Cédula de ciudadanía",
          documento: "12345678",
          direccion: "Calle 123 #45-67, Barrio Centro",
          telefono: "3001234567",
          telefono_emergencia: "3007654321",
          estado: "Activo",
          horario: {
            descripcion: "Lunes a Viernes 8:00 AM - 5:00 PM",
            fecha: "2024-01-15",
            hora_inicio: "08:00",
            hora_fin: "17:00",
          },
          fecha_ingreso: "2023-06-15",
          citas_completadas: 45,
          citas_pendientes: 3,
        }

        setMecanico(mecanicoMock)
        setLoading(false)
      } catch (error) {
        console.error("Error al cargar mecánico:", error)
        setLoading(false)
      }
    }

    loadMecanico()
  }, [id])

  if (loading) {
    return (
      <div className="detalleMecanicos-container">
        <div className="detalleMecanicos-loading">Cargando información del mecánico...</div>
      </div>
    )
  }

  if (!mecanico) {
    return (
      <div className="detalleMecanicos-container">
        <div className="detalleMecanicos-error">No se encontró el mecánico solicitado</div>
      </div>
    )
  }

  return (
    <div className="detalleMecanicos-container">
      <div className="detalleMecanicos-header">
        <button className="detalleMecanicos-backButton" onClick={() => navigate("/dashboard/mecanicos")}>
          <FaArrowLeft /> Volver
        </button>
        <div className="detalleMecanicos-headerInfo">
          <h1 className="detalleMecanicos-title">
            {mecanico.nombre} {mecanico.apellido}
          </h1>
          <span className={`detalleMecanicos-status ${mecanico.estado.toLowerCase()}`}>{mecanico.estado}</span>
        </div>
        <button
          className="detalleMecanicos-editButton"
          onClick={() => navigate(`/dashboard/mecanicos/editar/${mecanico.id}`)}
        >
          <FaEdit /> Editar
        </button>
      </div>

      <div className="detalleMecanicos-content">
        <div className="detalleMecanicos-mainInfo">
          <div className="detalleMecanicos-section">
            <h2 className="detalleMecanicos-sectionTitle">
              <FaUser /> Información Personal
            </h2>
            <div className="detalleMecanicos-infoGrid">
              <div className="detalleMecanicos-infoItem">
                <label>Nombre Completo:</label>
                <span>
                  {mecanico.nombre} {mecanico.apellido}
                </span>
              </div>
              <div className="detalleMecanicos-infoItem">
                <label>Tipo de Documento:</label>
                <span>{mecanico.tipo_documento}</span>
              </div>
              <div className="detalleMecanicos-infoItem">
                <label>Número de Documento:</label>
                <span>{mecanico.documento}</span>
              </div>
              <div className="detalleMecanicos-infoItem">
                <label>Estado:</label>
                <span className={`detalleMecanicos-statusBadge ${mecanico.estado.toLowerCase()}`}>
                  {mecanico.estado}
                </span>
              </div>
            </div>
          </div>

          <div className="detalleMecanicos-section">
            <h2 className="detalleMecanicos-sectionTitle">
              <FaMapMarkerAlt /> Información de Contacto
            </h2>
            <div className="detalleMecanicos-infoGrid">
              <div className="detalleMecanicos-infoItem">
                <label>Dirección:</label>
                <span>{mecanico.direccion}</span>
              </div>
              <div className="detalleMecanicos-infoItem">
                <label>Teléfono:</label>
                <span>{mecanico.telefono}</span>
              </div>
              <div className="detalleMecanicos-infoItem">
                <label>Teléfono de Emergencia:</label>
                <span>{mecanico.telefono_emergencia}</span>
              </div>
            </div>
          </div>

          <div className="detalleMecanicos-section">
            <h2 className="detalleMecanicos-sectionTitle">
              <FaClock /> Información Laboral
            </h2>
            <div className="detalleMecanicos-infoGrid">
              <div className="detalleMecanicos-infoItem">
                <label>Horario de Trabajo:</label>
                <span>{mecanico.horario.descripcion}</span>
              </div>
              <div className="detalleMecanicos-infoItem">
                <label>Hora de Inicio:</label>
                <span>{mecanico.horario.hora_inicio}</span>
              </div>
              <div className="detalleMecanicos-infoItem">
                <label>Hora de Fin:</label>
                <span>{mecanico.horario.hora_fin}</span>
              </div>
              <div className="detalleMecanicos-infoItem">
                <label>Fecha de Ingreso:</label>
                <span>{new Date(mecanico.fecha_ingreso).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detalleMecanicos-sidebar">
          <div className="detalleMecanicos-statsCard">
            <h3 className="detalleMecanicos-statsTitle">Estadísticas</h3>
            <div className="detalleMecanicos-stat">
              <div className="detalleMecanicos-statNumber">{mecanico.citas_completadas}</div>
              <div className="detalleMecanicos-statLabel">Citas Completadas</div>
            </div>
            <div className="detalleMecanicos-stat">
              <div className="detalleMecanicos-statNumber">{mecanico.citas_pendientes}</div>
              <div className="detalleMecanicos-statLabel">Citas Pendientes</div>
            </div>
          </div>

          <div className="detalleMecanicos-actionsCard">
            <h3 className="detalleMecanicos-actionsTitle">Acciones Rápidas</h3>
            <button
              className="detalleMecanicos-actionButton"
              onClick={() => navigate(`/dashboard/citas/crear?mecanico=${mecanico.id}`)}
            >
              <FaCalendarAlt /> Asignar Cita
            </button>
            <button
              className="detalleMecanicos-actionButton"
              onClick={() => navigate(`/dashboard/mecanicos/editar/${mecanico.id}`)}
            >
              <FaEdit /> Editar Información
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleMecanico

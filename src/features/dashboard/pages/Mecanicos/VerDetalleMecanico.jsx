"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTools,
  FaClock,
  FaArrowLeft,
  FaPen,
  FaCircle,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Mecanicos/VerDetalleMecanico.css"

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

  const makeRequest = async (url, options = {}) => {
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
  }

  return { makeRequest, loading, error }
}

const VerDetalleMecanico = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { makeRequest, loading } = useApi()

  const [mecanico, setMecanico] = useState(null)
  const [horario, setHorario] = useState(null)

  useEffect(() => {
    const cargarMecanico = async () => {
      try {
        const data = await makeRequest(`/mecanicos/${id}`)
        if (data) {
          setMecanico(data)
          // Cargar el horario del mecánico, pero maneja errores aparte
          try {
            const horarioData = await makeRequest(`/horarios/${data.horario_id}`)
            if (horarioData) {
              setHorario(horarioData)
            }
          } catch (error) {
            setHorario(null)
            Swal.fire("Advertencia", "No se pudo cargar el horario asignado", "warning")
          }
        }
      } catch (error) {
        console.error("Error al cargar mecánico:", error)
        Swal.fire("Error", "No se pudo cargar la información del mecánico", "error")
        navigate("/ListarMecanicos")
      }
    }
    cargarMecanico()
  }, [id, makeRequest, navigate])

  if (loading || !mecanico) {
    return (
      <div className="verDetalleMecanico-loading">
        <div className="verDetalleMecanico-spinner"></div>
        <p>Cargando información del mecánico...</p>
      </div>
    )
  }

  return (
    <div className="verDetalleMecanico-container">
      <div className="verDetalleMecanico-header">
        <button className="verDetalleMecanico-back-button" onClick={() => navigate("/ListarMecanicos")}>
          <FaArrowLeft /> Volver
        </button>
        <button className="verDetalleMecanico-edit-button" onClick={() => navigate(`/EditarMecanico/${id}`)}>
          <FaPen /> Editar
        </button>
      </div>

      <div className="verDetalleMecanico-content">
        <div className="verDetalleMecanico-title-section">
          <FaTools className="verDetalleMecanico-title-icon" />
          <div>
            <h1 className="verDetalleMecanico-title">
              {mecanico.nombre} {mecanico.apellido}
            </h1>
            <div className="verDetalleMecanico-status">
              <FaCircle className={`status-icon ${mecanico.estado.toLowerCase()}`} />
              {mecanico.estado}
            </div>
          </div>
        </div>

        <div className="verDetalleMecanico-info-grid">
          <div className="verDetalleMecanico-info-section">
            <h2>
              <FaUser /> Información Personal
            </h2>
            <div className="verDetalleMecanico-info-content">
              <div className="info-item">
                <span className="info-label">
                  <FaIdCard /> Tipo de Documento:
                </span>
                <span className="info-value">{mecanico.tipo_documento}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FaIdCard /> Número de Documento:
                </span>
                <span className="info-value">{mecanico.documento}</span>
              </div>
            </div>
          </div>

          <div className="verDetalleMecanico-info-section">
            <h2>
              <FaEnvelope /> Contacto
            </h2>
            <div className="verDetalleMecanico-info-content">
              <div className="info-item">
                <span className="info-label">
                  <FaEnvelope /> Correo Electrónico:
                </span>
                <span className="info-value">{mecanico.correo}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FaPhone /> Teléfono:
                </span>
                <span className="info-value">{mecanico.telefono}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FaPhone /> Teléfono de Emergencia:
                </span>
                <span className="info-value">{mecanico.telefono_emergencia}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FaMapMarkerAlt /> Dirección:
                </span>
                <span className="info-value">{mecanico.direccion}</span>
              </div>
            </div>
          </div>

          <div className="verDetalleMecanico-info-section">
            <h2>
              <FaClock /> Horario
            </h2>
            <div className="verDetalleMecanico-info-content">
              {horario && (
                <div className="info-item">
                  <span className="info-label">
                    <FaClock /> Horario Asignado:
                  </span>
                  <span className="info-value">
                    {horario.dia} - {horario.hora_inicio} a {horario.hora_fin}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerDetalleMecanico
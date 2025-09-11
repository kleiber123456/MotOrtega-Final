"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSignOutAlt,
} from "react-icons/fa"
import "../../../shared/styles/Client/MisCitas.css"
import "../../../shared/components/layout/dashclient.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const MisCitas = () => {
  const navigate = useNavigate()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const makeRequest = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token disponible")
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error)
      throw error
    }
  }

  const fetchCitas = async () => {
    try {
      setLoading(true)
      const response = await makeRequest("/citas/cliente/mis-citas")
      const citasData = Array.isArray(response) ? response : response?.data || []
      
      setCitas(citasData.map((cita) => ({
        id: cita.id,
        fecha: cita.fecha,
        hora: cita.hora,
        servicio: cita.observaciones || "Servicio de mantenimiento",
        vehiculo: `${cita.marca_nombre || ""} ${cita.referencia_nombre || ""} ${cita.vehiculo_placa || ""}`.trim(),
        estado: cita.estado_nombre || "Pendiente",
      })))
    } catch (error) {
      console.error("Error cargando las citas:", error)
      setError("No se pudieron cargar las citas. Inténtalo de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCitas()
  }, [])

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatearHora = (hora) => {
    return new Date(`1970-01-01T${hora}`).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("usuario")
    navigate("/")
  }

  if (loading) {
    return (
      <div className="dashC-body">
        <div className="dashC-header">
          <div className="dashC-header-content">
            <img className="dashC-logo" src="/perfil.jpg" alt="Logo" />
            <div className="dashC-title-container">
              <h1 className="dashC-title">Mis Citas</h1>
            </div>
          </div>
        </div>
        <div className="dashC-Section1">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "1.2rem", color: "#666" }}>Cargando citas...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashC-body">
        <div className="dashC-header">
          <div className="dashC-header-content">
            <img className="dashC-logo" src="/perfil.jpg" alt="Logo" />
            <div className="dashC-title-container">
              <h1 className="dashC-title">Mis Citas</h1>
            </div>
          </div>
        </div>
        <div className="dashC-Section1">
          <p className="lcc-error">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashC-body">
      <div className="dashC-header">
        <div className="dashC-header-content">
          <img className="dashC-logo" src="/perfil.jpg" alt="Logo" />
          <div className="dashC-title-container">
            <h1 className="dashC-title">Mis Citas</h1>
          </div>
          <button className="layC-nav-btn-S" onClick={handleLogout} aria-label="Cerrar sesión">
            <FaSignOutAlt />
            <span className="layC-nav-label">Salir</span>
          </button>
        </div>
      </div>
      <div className="dashC-Section1">
        <div className="dashC-content">
          {citas.length > 0 ? (
            <div className="lcc-citas-list">
              {citas.map((cita) => (
                <div key={cita.id} className="lcc-cita-card">
                  <div className="lcc-cita-header">
                    <span className="lcc-cita-fecha">{formatearFecha(cita.fecha)}</span>
                    <span className="lcc-cita-hora">
                      <FaClock /> {formatearHora(cita.hora)}
                    </span>
                  </div>
                  <div className="lcc-cita-info">
                    <h4>{cita.servicio}</h4>
                    <p className="lcc-vehiculo">{cita.vehiculo}</p>
                    <div className="lcc-cita-detalles">
                      <span className={`lcc-cita-estado ${cita.estado.toLowerCase()}`}>
                        {cita.estado === "Confirmada" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        {cita.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="lcc-empty-state">
              <FaCalendarAlt />
              <p>No tienes citas programadas.</p>
              <button className="lcc-agendar-btn" onClick={() => navigate("/client/citas/agendar")}>
                Agendar una cita
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MisCitas

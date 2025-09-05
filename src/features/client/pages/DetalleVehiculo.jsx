"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  FaCar,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaTools,
  FaInfoCircle,
  FaCogs,
  FaSpinner,
  FaExclamationTriangle,
  FaHistory,
  FaIdCard,
  FaPalette,
} from "react-icons/fa"
import "../../../shared/styles/Dashboard.css"
import "../../../shared/components/layout/clientlayout.css"
import "../../../shared/components/layout/dashclient.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const DetalleVehiculo = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [vehiculo, setVehiculo] = useState(null)
  const [historialServicios, setHistorialServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)

  // Datos mock para el vehículo
  const MOCK_VEHICULO = {
    id: Number.parseInt(id),
    placa: "ABC123",
    color: "Blanco",
    tipo_vehiculo: "Automóvil",
    referencia_id: 1,
    cliente_id: 1,
    estado: "Activo",
    referencia_nombre: "Corolla",
    marca_nombre: "Toyota",
  }

  // Datos mock para historial de servicios
  const MOCK_HISTORIAL = [
    {
      id: 1,
      fecha: "2024-01-10T09:00:00Z",
      observaciones: "Cambio de aceite y filtros",
      estado_cita: { nombre: "Completada" },
      mecanico: { nombre: "Carlos Rodríguez" },
      servicios_realizados: "Cambio de aceite, filtro de aire, revisión general",
    },
    {
      id: 2,
      fecha: "2023-10-15T14:30:00Z",
      observaciones: "Mantenimiento preventivo",
      estado_cita: { nombre: "Completada" },
      mecanico: { nombre: "Ana García" },
      servicios_realizados: "Revisión de frenos, alineación, balanceo",
    },
    {
      id: 3,
      fecha: "2023-07-20T11:00:00Z",
      observaciones: "Reparación sistema eléctrico",
      estado_cita: { nombre: "Completada" },
      mecanico: { nombre: "Luis Martínez" },
      servicios_realizados: "Reparación alternador, cambio batería",
    },
  ]

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

  const loadMockData = () => {
    console.log("[v0] Cargando datos simulados para detalle de vehículo")
    setUsingMockData(true)
    setVehiculo(MOCK_VEHICULO)
    setHistorialServicios(MOCK_HISTORIAL)
  }

  const fetchVehiculoData = async () => {
    try {
      setLoading(true)

      // Cargar datos del vehículo
      const vehiculoResponse = await makeRequest(`/vehiculos/cliente/detalle/${id}`)
      const vehiculoData = vehiculoResponse?.data || vehiculoResponse
      setVehiculo(vehiculoData)

      // Cargar historial de servicios/citas del vehículo
      try {
        const historialResponse = await makeRequest(`/citas/historial/vehiculo/${id}`)
        const historialData = Array.isArray(historialResponse) ? historialResponse : historialResponse?.data || []
        setHistorialServicios(historialData)
      } catch (error) {
        console.error("Error cargando historial:", error)
        setHistorialServicios([])
      }
    } catch (error) {
      console.error("Error cargando datos del vehículo:", error)
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVehiculo = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      if (!usingMockData) {
        await makeRequest(`/vehiculos/cliente/eliminar/${id}`, {
          method: "DELETE",
        })
      }

      alert("Vehículo eliminado exitosamente")
      navigate("/client/vehiculos")
    } catch (error) {
      console.error("Error eliminando vehículo:", error)
      alert("Error al eliminar el vehículo. Inténtalo de nuevo.")
    }
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatearFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calcularAntiguedad = (año) => {
    const añoActual = new Date().getFullYear()
    const antiguedad = añoActual - año
    return antiguedad === 0 ? "Nuevo" : `${antiguedad} año${antiguedad > 1 ? "s" : ""}`
  }

  const getEstadoKilometraje = (km) => {
    if (!km) return { texto: "No especificado", color: "#6b7280" }
    if (km < 30000) return { texto: "Bajo", color: "#10b981" }
    if (km < 80000) return { texto: "Moderado", color: "#f59e0b" }
    return { texto: "Alto", color: "#ef4444" }
  }

  useEffect(() => {
    if (id) {
      fetchVehiculoData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="dashC-body">
        <div className="dashC-header">
          <div className="dashC-header-content">
            <img className="dashC-logo" src="/perfil.jpg" alt="Logo" />
            <div className="dashC-title-container">
              <span className="dashC-subtitle">Cargando...</span>
              <h1 className="dashC-title">Detalle del Vehículo</h1>
            </div>
          </div>
        </div>
        <div className="dashC-Section1">
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <FaSpinner className="spinning" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#0ea5e9" }} />
            <p>Cargando información del vehículo...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!vehiculo) {
    return (
      <div className="dashC-body">
        <div className="dashC-header">
          <div className="dashC-header-content">
            <img className="dashC-logo" src="/perfil.jpg" alt="Logo" />
            <div className="dashC-title-container">
              <span className="dashC-subtitle">Error</span>
              <h1 className="dashC-title">Vehículo no encontrado</h1>
            </div>
          </div>
          <button className="layC-nav-btn-S" onClick={() => navigate("/client/vehiculos")} aria-label="Volver">
            <FaArrowLeft />
            <span className="layC-nav-label">Volver</span>
          </button>
        </div>
        <div className="dashC-Section1">
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <FaExclamationTriangle style={{ fontSize: "3rem", marginBottom: "1rem", color: "#ef4444" }} />
            <h3>No se pudo cargar el vehículo</h3>
            <p>El vehículo solicitado no existe o no tienes permisos para verlo.</p>
            <button
              onClick={() => navigate("/client/vehiculos")}
              style={{
                marginTop: "1rem",
                background: "#0ea5e9",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "0.75rem 1.5rem",
                cursor: "pointer",
              }}
            >
              Volver a Mis Vehículos
            </button>
          </div>
        </div>
      </div>
    )
  }

  const estadoKm = getEstadoKilometraje(vehiculo.kilometraje)

  return (
    <div className="dashC-body">
      <div className="dashC-header">
        <div className="dashC-header-content">
          <img className="dashC-logo" src="/perfil.jpg" alt="Logo" />
          <div className="dashC-title-container">
            <span className="dashC-subtitle">Detalle del vehículo</span>
            <h1 className="dashC-title">
              {vehiculo?.marca_nombre} {vehiculo?.referencia_nombre}
            </h1>
            <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              Placa: {vehiculo?.placa} • {vehiculo?.tipo_vehiculo}
            </span>
            {usingMockData && (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#ff9800",
                  fontStyle: "italic",
                  display: "block",
                }}
              >
                (Mostrando datos de demostración)
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="layC-nav-btn-S"
              onClick={() => navigate(`/client/vehiculos/editar/${id}`)}
              aria-label="Editar"
              style={{ background: "#f59e0b" }}
            >
              <FaEdit />
              <span className="layC-nav-label">Editar</span>
            </button>
            <button className="layC-nav-btn-S" onClick={() => navigate("/client/vehiculos")} aria-label="Volver">
              <FaArrowLeft />
              <span className="layC-nav-label">Volver</span>
            </button>
          </div>
        </div>
      </div>

      <div className="dashC-Section1">
        {/* Información principal del vehículo */}
        <div className="dashC-content">
          <div className="dashC-section">
            <div className="dashC-section-header">
              <h2 className="dashC-section-title">
                <FaInfoCircle className="dashC-section-icon" />
                Información General
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              {/* Tarjeta principal */}
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                  <FaCar style={{ fontSize: "1.5rem", color: "#0ea5e9", marginRight: "0.5rem" }} />
                  <h3 style={{ margin: 0, color: "#1f2937" }}>Datos del Vehículo</h3>
                </div>

                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FaIdCard style={{ color: "#6b7280" }} />
                    <span>
                      <strong>Placa:</strong> {vehiculo?.placa}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FaCar style={{ color: "#6b7280" }} />
                    <span>
                      <strong>Tipo:</strong> {vehiculo?.tipo_vehiculo}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FaPalette style={{ color: "#6b7280" }} />
                    <span>
                      <strong>Color:</strong> {vehiculo?.color}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FaTools style={{ color: "#6b7280" }} />
                    <span>
                      <strong>Estado:</strong>{" "}
                    </span>
                    <span
                      style={{
                        color: vehiculo?.estado === "Activo" ? "#10b981" : "#ef4444",
                        fontWeight: "500",
                      }}
                    >
                      {vehiculo?.estado}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta de marca y modelo */}
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                  <FaCogs style={{ fontSize: "1.5rem", color: "#10b981", marginRight: "0.5rem" }} />
                  <h3 style={{ margin: 0, color: "#1f2937" }}>Marca y Modelo</h3>
                </div>

                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div>
                    <strong style={{ color: "#374151" }}>Marca:</strong>
                    <p style={{ margin: "0.25rem 0 0 0", color: "#6b7280", fontSize: "1.1rem" }}>
                      {vehiculo?.marca_nombre}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: "#374151" }}>Modelo:</strong>
                    <p style={{ margin: "0.25rem 0 0 0", color: "#6b7280", fontSize: "1.1rem" }}>
                      {vehiculo?.referencia_nombre}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: "#374151" }}>ID Referencia:</strong>
                    <p style={{ margin: "0.25rem 0 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
                      #{vehiculo?.referencia_id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de servicios */}
          <div className="dashC-section">
            <div className="dashC-section-header">
              <h2 className="dashC-section-title">
                <FaHistory className="dashC-section-icon" />
                Historial de Servicios ({historialServicios.length})
              </h2>
            </div>

            {historialServicios.length > 0 ? (
              <div style={{ display: "grid", gap: "1rem" }}>
                {historialServicios.map((servicio, index) => (
                  <div
                    key={servicio.id}
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      padding: "1.25rem",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                      border: "1px solid #e5e7eb",
                      borderLeft: `4px solid ${index === 0 ? "#10b981" : "#0ea5e9"}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div>
                        <h4 style={{ margin: "0 0 0.25rem 0", color: "#1f2937" }}>
                          {servicio.observaciones || "Servicio de mantenimiento"}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            fontSize: "0.9rem",
                            color: "#6b7280",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <FaCalendarAlt />
                            {formatearFechaCorta(servicio.fecha)}
                          </span>
                          {servicio.mecanico && (
                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                              <FaTools />
                              {servicio.mecanico.nombre}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#166534",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: "500",
                        }}
                      >
                        {servicio.estado_cita?.nombre || "Completada"}
                      </span>
                    </div>

                    {servicio.servicios_realizados && (
                      <div
                        style={{
                          background: "#f8fafc",
                          padding: "0.75rem",
                          borderRadius: "6px",
                          fontSize: "0.9rem",
                          color: "#475569",
                        }}
                      >
                        <strong>Servicios realizados:</strong>
                        <p style={{ margin: "0.25rem 0 0 0" }}>{servicio.servicios_realizados}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  color: "#6b7280",
                  background: "white",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <FaHistory style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }} />
                <h3>Sin historial de servicios</h3>
                <p>Este vehículo aún no tiene servicios registrados.</p>
                <button
                  onClick={() => navigate("/client/agendar-cita")}
                  style={{
                    marginTop: "1rem",
                    background: "#0ea5e9",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.75rem 1.5rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    margin: "1rem auto 0",
                  }}
                >
                  <FaCalendarAlt />
                  Agendar Primera Cita
                </button>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="dashC-section">
            <div
              style={{
                background: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                border: "1px solid #e5e7eb",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => navigate(`/client/vehiculos/editar/${id}`)}
                style={{
                  background: "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.75rem 1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: "500",
                }}
              >
                <FaEdit />
                Editar Vehículo
              </button>

              <button
                onClick={() => navigate("/client/agendar-cita")}
                style={{
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.75rem 1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: "500",
                }}
              >
                <FaCalendarAlt />
                Agendar Cita
              </button>

              <button
                onClick={handleDeleteVehiculo}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.75rem 1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: "500",
                }}
              >
                <FaTrash />
                Eliminar Vehículo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleVehiculo

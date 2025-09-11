"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaCalendarAlt,
  FaCar,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSignOutAlt,
} from "react-icons/fa"
import "../../../shared/styles/Dashboard.css"
import "../../../shared/components/layout/clientlayout.css"
import "../../../shared/components/layout/dashclient.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const ClientDashboard = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({})
  const [stats, setStats] = useState({
    citasPendientes: 0,
    vehiculosRegistrados: 0,
    serviciosCompletados: 0,
    facturasPendientes: 0,
  })
  const [proximasCitas, setProximasCitas] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)

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
    setUsingMockData(true)

    const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")
    if (storedUser) {
      setUserData(JSON.parse(storedUser))
    } else {
      setUserData({
        id: 24,
        nombre: "Juan Pérez",
        email: "juan.perez@email.com",
      })
    }

    const citasData = MOCK_DATA.citas
    const vehiculosData = MOCK_DATA.vehiculos
    const facturasData = MOCK_DATA.facturas

    const now = new Date()
    const citasFuturas = citasData.filter((cita) => new Date(cita.fecha) >= now)

    const citasPendientes = citasData.filter(
      (cita) =>
        cita.estado_cita?.nombre?.toLowerCase().includes("pendiente") ||
        cita.estado_cita?.nombre?.toLowerCase().includes("confirmada"),
    )

    const citasCompletadas = citasData.filter(
      (cita) =>
        cita.estado_cita?.nombre?.toLowerCase().includes("completada") ||
        cita.estado_cita?.nombre?.toLowerCase().includes("finalizada"),
    )

    setStats({
      citasPendientes: citasPendientes.length,
      vehiculosRegistrados: vehiculosData.length,
      serviciosCompletados: citasCompletadas.length,
      facturasPendientes: facturasData.length,
    })

    setProximasCitas(
      citasFuturas.slice(0, 5).map((cita) => ({
        id: cita.id,
        fecha: cita.fecha,
        hora: cita.hora,
        servicio: cita.observaciones || "Servicio de mantenimiento",
        vehiculo: cita.vehiculo
          ? `${cita.vehiculo.referencia?.marca?.nombre || ""} ${cita.vehiculo.referencia?.nombre || ""} ${cita.vehiculo.placa}`.trim()
          : "Vehículo no especificado",
        estado: cita.estado_cita?.nombre || "Pendiente",
      })),
    )

    setVehiculos(
      vehiculosData.map((vehiculo) => ({
        id: vehiculo.id,
        marca: vehiculo.marca_nombre || vehiculo.referencia?.marca?.nombre || "N/A",
        modelo: vehiculo.referencia_nombre || vehiculo.referencia?.nombre || "N/A",
        placa: vehiculo.placa || "N/A",
        color: vehiculo.color || "N/A",
        tipo: vehiculo.tipo_vehiculo || "N/A",
        estado: vehiculo.estado || "Activo",
      })),
    )
  }

  const fetchClientData = async () => {
    try {
      setLoading(true)
      const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")

      if (storedUser) {
        const user = JSON.parse(storedUser)
        setUserData(user)

        const citasResponse = await makeRequest(`/citas?cliente_id=${user.id}`)
        const citasData = Array.isArray(citasResponse) ? citasResponse : citasResponse?.data || []

        const now = new Date()
        const citasFuturas = citasData.filter((cita) => new Date(cita.fecha) >= now)

        const citasPendientes = citasData.filter(
          (cita) =>
            cita.estado_cita?.nombre?.toLowerCase().includes("pendiente") ||
            cita.estado_cita?.nombre?.toLowerCase().includes("confirmada"),
        )

        const citasCompletadas = citasData.filter(
          (cita) =>
            cita.estado_cita?.nombre?.toLowerCase().includes("completada") ||
            cita.estado_cita?.nombre?.toLowerCase().includes("finalizada"),
        )

        const vehiculosResponse = await makeRequest(`/vehiculos/cliente/${user.id}`)
        const vehiculosData = Array.isArray(vehiculosResponse) ? vehiculosResponse : vehiculosResponse?.data || []

        let facturasPendientes = 0
        try {
          const facturasResponse = await makeRequest(`/facturas?cliente_id=${user.id}&estado=pendiente`)
          const facturasData = Array.isArray(facturasResponse) ? facturasResponse : facturasResponse?.data || []
          facturasPendientes = facturasData.length
        } catch (error) {
          console.log("No se pudieron cargar las facturas:", error)
        }

        setStats({
          citasPendientes: citasPendientes.length,
          vehiculosRegistrados: vehiculosData.length,
          serviciosCompletados: citasCompletadas.length,
          facturasPendientes: facturasPendientes,
        })

        setProximasCitas(
          citasFuturas.slice(0, 5).map((cita) => ({
            id: cita.id,
            fecha: cita.fecha,
            hora: cita.hora,
            servicio: cita.observaciones || "Servicio de mantenimiento",
            vehiculo: `${cita.marca_nombre || ""} ${cita.referencia_nombre || ""} ${cita.vehiculo_placa || ""}`.trim(),
            estado: cita.estado_nombre || "Pendiente",
          })),
        )

        setVehiculos(
          vehiculosData.map((vehiculo) => ({
            id: vehiculo.id,
            marca: vehiculo.marca_nombre || vehiculo.referencia?.marca?.nombre || "N/A",
            modelo: vehiculo.referencia_nombre || vehiculo.referencia?.nombre || "N/A",
            año: vehiculo.año || new Date().getFullYear(),
            placa: vehiculo.placa || "N/A",
            color: vehiculo.color || "N/A",
            tipo: vehiculo.tipo_vehiculo || "N/A",
            estado: vehiculo.estado || "Activo",
            ultimoServicio: vehiculo.ultimo_servicio || vehiculo.created_at || new Date().toISOString(),
          })),
        )
      }
    } catch (error) {
      console.error("Error cargando datos del cliente:", error)
      loadMockData()
      return
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientData()
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
              <span className="dashC-subtitle">Cargando...</span>
              <h1 className="dashC-title">Dashboard</h1>
            </div>
          </div>
        </div>
        <div className="dashC-Section1">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "1.2rem", color: "#666" }}>Cargando datos...</div>
          </div>
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
            <span className="dashC-subtitle">Bienvenido</span>
            <h1 className="dashC-title">{userData.nombre || "Cliente"}</h1>
            {usingMockData && (
              <span style={{ fontSize: "0.8rem", color: "#ff9800", fontStyle: "italic", display: "block" }}>
                (Mostrando datos de demostración)
              </span>
            )}
          </div>
          <button className="layC-nav-btn-S" onClick={handleLogout} aria-label="Cerrar sesión">
            <FaSignOutAlt />
            <span className="layC-nav-label">Salir</span>
          </button>
        </div>
      </div>

      <div className="dashC-Section1">
        <div className="dashC-content">
          {/* Próximas citas */}
          <div className="dashC-section">
            <div className="dashC-section-header">
              <h2 className="dashC-section-title">
                <FaCalendarAlt className="dashC-section-icon" /> Próximas Citas
              </h2>
            </div>
            <div className="dashC-citas-list">
              {proximasCitas.length > 0 ? (
                proximasCitas.map((cita) => (
                  <div key={cita.id} className="dashC-cita-card">
                    <div className="dashC-cita-header">
                      <span className="dashC-cita-fecha-top">{formatearFecha(cita.fecha)}</span>
                      <span className="dashC-cita-hora-top">
                        <FaClock /> {formatearHora(cita.hora)}
                      </span>
                    </div>

                    <div className="dashC-cita-info">
                      <h4>{cita.servicio}</h4>

                      <div className="dashC-placa">
                        {cita.vehiculo.split(" ").pop()}
                      </div>

                      <p className="dashC-vehiculo-nombre">
                        {cita.vehiculo.replace(/\s[A-Z0-9-]+$/, "")}
                      </p>

                      <div className="dashC-cita-detalles">
                        <span className={`dashC-cita-estado ${cita.estado.toLowerCase()}`}>
                          {cita.estado === "Confirmada" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                          {cita.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashC-empty-state">
                  <FaCalendarAlt />
                  <p>No tienes citas programadas</p>
                </div>
              )}
            </div>
          </div>

          {/* Mis vehículos */}
          <div className="dashC-section">
            <div className="dashC-section-header">
              <h2 className="dashC-section-title">
                <FaCar className="dashC-section-icon" /> Mis Vehículos
              </h2>
              <button className="dashC-view-all-btn" onClick={() => navigate("/client/vehiculos")}>
                Ver todos
              </button>
            </div>
            <div className="dashC-vehiculos-grid">
              {vehiculos.length > 0 ? (
                vehiculos.slice(0, 3).map((vehiculo) => (
                  <div key={vehiculo.id} className="dashC-vehiculo-card">
                    <div className="dashC-vehiculo-header">
                      <h4>
                        {vehiculo.marca} {vehiculo.modelo}
                      </h4>
                    </div>
                    <div className="dashC-vehiculo-info">
                      <p>
                        <strong>Placa:</strong>{" "}
                        <span className="dashC-placa">{vehiculo.placa}</span>
                      </p>
                      <p>
                        <strong>Tipo:</strong> {vehiculo.tipo}
                      </p>
                      <p>
                        <strong>Color:</strong> {vehiculo.color}
                      </p>
                      <p>
                        <strong>Último servicio:</strong> {formatearFecha(vehiculo.ultimoServicio)}
                      </p>
                    </div>
                    <div className="dashC-vehiculo-actions">
                      <button
                        className="dashC-view-all-btn"
                        onClick={() => navigate(`/client/vehiculos/detalle/${vehiculo.id}`)}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashC-empty-state">
                  <FaCar />
                  <p>No tienes vehículos registrados</p>
                  <button className="dashC-empty-action-btn" onClick={() => navigate("/client/vehiculos/crear")}>
                    Registrar mi primer vehículo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard

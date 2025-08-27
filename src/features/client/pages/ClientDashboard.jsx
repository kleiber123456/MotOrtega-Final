"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaCalendarAlt,
  FaCar,
  FaTools,
  FaFileInvoice,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSignOutAlt,
} from "react-icons/fa"
import "../../../shared/styles/Dashboard.css"
import "../../../shared/components/layout/clientlayout.css"
import "../../../shared/components/layout/dashclient.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const MOCK_DATA = {
  citas: [
    {
      id: 1,
      fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // En 2 días
      hora: "10:00",
      observaciones: "Cambio de aceite y filtros",
      estado_cita: { nombre: "Confirmada" },
      vehiculo: {
        placa: "ABC123",
        referencia: {
          marca: { nombre: "Toyota" },
          nombre: "Corolla",
        },
      },
    },
    {
      id: 2,
      fecha: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // En 5 días
      hora: "14:30",
      observaciones: "Revisión general",
      estado_cita: { nombre: "Pendiente" },
      vehiculo: {
        placa: "XYZ789",
        referencia: {
          marca: { nombre: "Honda" },
          nombre: "Civic",
        },
      },
    },
    {
      id: 3,
      fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Hace 10 días
      hora: "09:00",
      observaciones: "Mantenimiento preventivo",
      estado_cita: { nombre: "Completada" },
      vehiculo: {
        placa: "ABC123",
        referencia: {
          marca: { nombre: "Toyota" },
          nombre: "Corolla",
        },
      },
    },
  ],
  vehiculos: [
    {
      id: 1,
      placa: "ABC123",
      año: 2020,
      referencia: {
        marca: { nombre: "Toyota" },
        nombre: "Corolla",
      },
      ultimo_servicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Hace 30 días
    },
    {
      id: 2,
      placa: "XYZ789",
      año: 2019,
      referencia: {
        marca: { nombre: "Honda" },
        nombre: "Civic",
      },
      ultimo_servicio: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // Hace 45 días
    },
  ],
  facturas: [
    { id: 1, estado: "pendiente", monto: 150000 },
    { id: 2, estado: "pendiente", monto: 85000 },
  ],
}

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
          Authorization: token, // Sin prefijo "Bearer"
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
    console.log("[v0] Cargando datos simulados debido a falta de conexión con el backend")
    setUsingMockData(true)

    const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
    } else {
      // Usuario simulado si no hay datos almacenados
      setUserData({
        id: 24,
        nombre: "Juan Pérez",
        email: "juan.perez@email.com",
      })
    }

    const citasData = MOCK_DATA.citas
    const vehiculosData = MOCK_DATA.vehiculos
    const facturasData = MOCK_DATA.facturas

    // Filtrar citas futuras y pendientes
    const now = new Date()
    const citasFuturas = citasData.filter((cita) => {
      const fechaCita = new Date(cita.fecha)
      return fechaCita >= now
    })

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

    // Actualizar estadísticas con datos simulados
    setStats({
      citasPendientes: citasPendientes.length,
      vehiculosRegistrados: vehiculosData.length,
      serviciosCompletados: citasCompletadas.length,
      facturasPendientes: facturasData.length,
    })

    // Formatear próximas citas
    const proximasCitasFormateadas = citasFuturas.slice(0, 5).map((cita) => ({
      id: cita.id,
      fecha: cita.fecha,
      hora: cita.hora,
      servicio: cita.observaciones || "Servicio de mantenimiento",
      vehiculo: cita.vehiculo
        ? `${cita.vehiculo.referencia?.marca?.nombre || ""} ${cita.vehiculo.referencia?.nombre || ""} ${cita.vehiculo.placa}`.trim()
        : "Vehículo no especificado",
      estado: cita.estado_cita?.nombre || "Pendiente",
    }))

    setProximasCitas(proximasCitasFormateadas)

    // Formatear vehículos
    const vehiculosFormateados = vehiculosData.map((vehiculo) => ({
      id: vehiculo.id,
      marca: vehiculo.referencia?.marca?.nombre || vehiculo.marca_nombre || "N/A",
      modelo: vehiculo.referencia?.nombre || vehiculo.referencia_nombre || "N/A",
      año: vehiculo.año || new Date().getFullYear(),
      placa: vehiculo.placa || "N/A",
      ultimoServicio: vehiculo.ultimo_servicio || vehiculo.created_at || new Date().toISOString(),
    }))

    setVehiculos(vehiculosFormateados)
  }

  const fetchClientData = async () => {
    try {
      setLoading(true)
      const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")

      if (storedUser) {
        const user = JSON.parse(storedUser)
        setUserData(user)

        // Obtener citas del cliente
        const citasResponse = await makeRequest(`/citas?cliente_id=${user.id}`)
        const citasData = Array.isArray(citasResponse) ? citasResponse : citasResponse?.data || []

        // Filtrar citas futuras y pendientes
        const now = new Date()
        const citasFuturas = citasData.filter((cita) => {
          const fechaCita = new Date(cita.fecha)
          return fechaCita >= now
        })

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

        // Obtener vehículos del cliente
        const vehiculosResponse = await makeRequest(`/vehiculos?cliente_id=${user.id}`)
        const vehiculosData = Array.isArray(vehiculosResponse) ? vehiculosResponse : vehiculosResponse?.data || []

        // Obtener facturas pendientes (si existe el endpoint)
        let facturasPendientes = 0
        try {
          const facturasResponse = await makeRequest(`/facturas?cliente_id=${user.id}&estado=pendiente`)
          const facturasData = Array.isArray(facturasResponse) ? facturasResponse : facturasResponse?.data || []
          facturasPendientes = facturasData.length
        } catch (error) {
          console.log("No se pudieron cargar las facturas:", error)
        }

        // Actualizar estadísticas con datos reales
        setStats({
          citasPendientes: citasPendientes.length,
          vehiculosRegistrados: vehiculosData.length,
          serviciosCompletados: citasCompletadas.length,
          facturasPendientes: facturasPendientes,
        })

        // Formatear próximas citas
        const proximasCitasFormateadas = citasFuturas.slice(0, 5).map((cita) => ({
          id: cita.id,
          fecha: cita.fecha,
          hora: cita.hora,
          servicio: cita.observaciones || "Servicio de mantenimiento",
          vehiculo: cita.vehiculo
            ? `${cita.vehiculo.referencia?.marca?.nombre || ""} ${cita.vehiculo.referencia?.nombre || ""} ${cita.vehiculo.placa}`.trim()
            : "Vehículo no especificado",
          estado: cita.estado_cita?.nombre || "Pendiente",
        }))

        setProximasCitas(proximasCitasFormateadas)

        // Formatear vehículos
        const vehiculosFormateados = vehiculosData.map((vehiculo) => ({
          id: vehiculo.id,
          marca: vehiculo.referencia?.marca?.nombre || vehiculo.marca_nombre || "N/A",
          modelo: vehiculo.referencia?.nombre || vehiculo.referencia_nombre || "N/A",
          año: vehiculo.año || new Date().getFullYear(),
          placa: vehiculo.placa || "N/A",
          ultimoServicio: vehiculo.ultimo_servicio || vehiculo.created_at || new Date().toISOString(),
        }))

        setVehiculos(vehiculosFormateados)
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
          <button className="layC-nav-btn-S" onClick={handleLogout} aria-label="Cerrar sesión">
            <FaSignOutAlt />
            <span className="layC-nav-label">Salir</span>
          </button>
        </div>
      </div>
      <div className="dashC-Section1">
        <div className="dashC-stats">
          <div className="dashC-stat-card dashC-pending">
            <div className="dashC-stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="dashC-stat-content">
              <h3>{stats.citasPendientes}</h3>
              <p>Citas Pendientes</p>
            </div>
          </div>
          <div className="dashC-stat-card dashC-info">
            <div className="dashC-stat-icon">
              <FaCar />
            </div>
            <div className="dashC-stat-content">
              <h3>{stats.vehiculosRegistrados}</h3>
              <p>Vehículos Registrados</p>
            </div>
          </div>
          <div className="dashC-stat-card dashC-success">
            <div className="dashC-stat-icon">
              <FaTools />
            </div>
            <div className="dashC-stat-content">
              <h3>{stats.serviciosCompletados}</h3>
              <p>Servicios Completados</p>
            </div>
          </div>
          <div className="dashC-stat-card dashC-warning">
            <div className="dashC-stat-icon">
              <FaFileInvoice />
            </div>
            <div className="dashC-stat-content">
              <h3>{stats.facturasPendientes}</h3>
              <p>Facturas Pendientes</p>
            </div>
          </div>
        </div>

        <div className="dashC-content">
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
                    <div className="dashC-cita-fecha">
                      <div className="dashC-fecha-dia">{new Date(cita.fecha).getDate()}</div>
                      <div className="dashC-fecha-mes">
                        {new Date(cita.fecha).toLocaleDateString("es-ES", { month: "short" })}
                      </div>
                    </div>
                    <div className="dashC-cita-info">
                      <h4>{cita.servicio}</h4>
                      <p>{cita.vehiculo}</p>
                      <div className="dashC-cita-detalles">
                        <span className="dashC-cita-hora">
                          <FaClock /> {cita.hora}
                        </span>
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

          <div className="dashC-section">
            <div className="dashC-section-header">
              <h2 className="dashC-section-title">
                <FaCar className="dashC-section-icon" /> Mis Vehículos
              </h2>
            </div>
            <div className="dashC-vehiculos-grid">
              {vehiculos.length > 0 ? (
                vehiculos.map((vehiculo) => (
                  <div key={vehiculo.id} className="dashC-vehiculo-card">
                    <div className="dashC-vehiculo-header">
                      <h4>
                        {vehiculo.marca} {vehiculo.modelo}
                      </h4>
                      <span className="dashC-vehiculo-año">{vehiculo.año}</span>
                    </div>
                    <div className="dashC-vehiculo-info">
                      <p>
                        <strong>Placa:</strong> {vehiculo.placa}
                      </p>
                      <p>
                        <strong>Último servicio:</strong> {formatearFecha(vehiculo.ultimoServicio)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashC-empty-state">
                  <FaCar />
                  <p>No tienes vehículos registrados</p>
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

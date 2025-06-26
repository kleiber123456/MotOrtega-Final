"use client"

import { useState, useEffect } from "react"
import {
  FaCalendarAlt,
  FaCar,
  FaTools,
  FaFileInvoice,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import "../../../shared/styles/Dashboard.css"

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

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")
    if (storedUser) {
      setUserData(JSON.parse(storedUser))
    }

    // Simular datos para el dashboard del cliente
    setStats({
      citasPendientes: 2,
      vehiculosRegistrados: 1,
      serviciosCompletados: 5,
      facturasPendientes: 1,
    })

    setProximasCitas([
      {
        id: 1,
        fecha: "2024-01-15",
        hora: "10:00",
        servicio: "Cambio de aceite",
        vehiculo: "Toyota Corolla 2020",
        estado: "Confirmada",
      },
      {
        id: 2,
        fecha: "2024-01-20",
        hora: "14:30",
        servicio: "Revisión general",
        vehiculo: "Toyota Corolla 2020",
        estado: "Pendiente",
      },
    ])

    setVehiculos([
      {
        id: 1,
        marca: "Toyota",
        modelo: "Corolla",
        año: 2020,
        placa: "ABC123",
        ultimoServicio: "2024-01-01",
      },
    ])
  }, [])

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Bienvenido, {userData.nombre || "Cliente"}</h1>
          <p>Gestiona tus vehículos y servicios desde tu panel personal</p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon pending">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.citasPendientes}</h3>
            <p>Citas Pendientes</p>
          </div>
          <button className="stat-action" onClick={() => navigate("/client/citas")}>
            Ver todas
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <FaCar />
          </div>
          <div className="stat-content">
            <h3>{stats.vehiculosRegistrados}</h3>
            <p>Vehículos Registrados</p>
          </div>
          <button className="stat-action" onClick={() => navigate("/client/vehiculos")}>
            Ver todos
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <FaTools />
          </div>
          <div className="stat-content">
            <h3>{stats.serviciosCompletados}</h3>
            <p>Servicios Completados</p>
          </div>
          <button className="stat-action" onClick={() => navigate("/client/historial")}>
            Ver historial
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <FaFileInvoice />
          </div>
          <div className="stat-content">
            <h3>{stats.facturasPendientes}</h3>
            <p>Facturas Pendientes</p>
          </div>
          <button className="stat-action" onClick={() => navigate("/client/facturas")}>
            Ver facturas
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Próximas citas */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <FaCalendarAlt className="section-icon" />
              Próximas Citas
            </h2>
            <button className="section-action" onClick={() => navigate("/client/citas/crear")}>
              <FaPlus />
              Agendar Cita
            </button>
          </div>
          <div className="citas-list">
            {proximasCitas.length > 0 ? (
              proximasCitas.map((cita) => (
                <div key={cita.id} className="cita-card">
                  <div className="cita-fecha">
                    <div className="fecha-dia">{new Date(cita.fecha).getDate()}</div>
                    <div className="fecha-mes">
                      {new Date(cita.fecha).toLocaleDateString("es-ES", { month: "short" })}
                    </div>
                  </div>
                  <div className="cita-info">
                    <h4>{cita.servicio}</h4>
                    <p>{cita.vehiculo}</p>
                    <div className="cita-detalles">
                      <span className="cita-hora">
                        <FaClock /> {cita.hora}
                      </span>
                      <span className={`cita-estado ${cita.estado.toLowerCase()}`}>
                        {cita.estado === "Confirmada" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        {cita.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaCalendarAlt />
                <p>No tienes citas programadas</p>
                <button className="btn-primary" onClick={() => navigate("/client/citas/crear")}>
                  Agendar Primera Cita
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mis vehículos */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <FaCar className="section-icon" />
              Mis Vehículos
            </h2>
            <button className="section-action" onClick={() => navigate("/client/vehiculos/crear")}>
              <FaPlus />
              Agregar Vehículo
            </button>
          </div>
          <div className="vehiculos-grid">
            {vehiculos.length > 0 ? (
              vehiculos.map((vehiculo) => (
                <div key={vehiculo.id} className="vehiculo-card">
                  <div className="vehiculo-header">
                    <h4>
                      {vehiculo.marca} {vehiculo.modelo}
                    </h4>
                    <span className="vehiculo-año">{vehiculo.año}</span>
                  </div>
                  <div className="vehiculo-info">
                    <p>
                      <strong>Placa:</strong> {vehiculo.placa}
                    </p>
                    <p>
                      <strong>Último servicio:</strong> {formatearFecha(vehiculo.ultimoServicio)}
                    </p>
                  </div>
                  <div className="vehiculo-actions">
                    <button className="btn-secondary" onClick={() => navigate(`/client/vehiculos/${vehiculo.id}`)}>
                      Ver detalles
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/client/citas/crear?vehiculo=${vehiculo.id}`)}
                    >
                      Agendar servicio
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaCar />
                <p>No tienes vehículos registrados</p>
                <button className="btn-primary" onClick={() => navigate("/client/vehiculos/crear")}>
                  Registrar Primer Vehículo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard

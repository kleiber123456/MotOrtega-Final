"use client"

import { useState, useEffect } from "react"
import { FaCalendarAlt, FaTools, FaClock, FaCheckCircle, FaExclamationTriangle, FaUser, FaCar } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import "../../../shared/styles/Dashboard.css"

const MechanicDashboard = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({})
  const [stats, setStats] = useState({
    citasHoy: 0,
    trabajosEnProceso: 0,
    trabajosCompletados: 0,
    horasDisponibles: 0,
  })
  const [citasHoy, setCitasHoy] = useState([])
  const [trabajosActivos, setTrabajosActivos] = useState([])

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")
    if (storedUser) {
      setUserData(JSON.parse(storedUser))
    }

    // Simular datos para el dashboard del mecánico
    setStats({
      citasHoy: 4,
      trabajosEnProceso: 2,
      trabajosCompletados: 15,
      horasDisponibles: 6,
    })

    setCitasHoy([
      {
        id: 1,
        hora: "09:00",
        cliente: "Juan Pérez",
        vehiculo: "Toyota Corolla 2020",
        servicio: "Cambio de aceite",
        estado: "Pendiente",
      },
      {
        id: 2,
        hora: "11:30",
        cliente: "María García",
        vehiculo: "Honda Civic 2019",
        servicio: "Revisión de frenos",
        estado: "En proceso",
      },
      {
        id: 3,
        hora: "14:00",
        cliente: "Carlos López",
        vehiculo: "Chevrolet Spark 2021",
        servicio: "Cambio de filtros",
        estado: "Completado",
      },
      {
        id: 4,
        hora: "16:30",
        cliente: "Ana Rodríguez",
        vehiculo: "Nissan Sentra 2018",
        servicio: "Diagnóstico general",
        estado: "Pendiente",
      },
    ])

    setTrabajosActivos([
      {
        id: 1,
        cliente: "María García",
        vehiculo: "Honda Civic 2019",
        servicio: "Revisión de frenos",
        progreso: 60,
        tiempoEstimado: "2 horas",
      },
      {
        id: 2,
        cliente: "Pedro Martínez",
        vehiculo: "Ford Focus 2020",
        servicio: "Reparación de motor",
        progreso: 30,
        tiempoEstimado: "4 horas",
      },
    ])
  }, [])

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "Completado":
        return <FaCheckCircle className="estado-completado" />
      case "En proceso":
        return <FaClock className="estado-proceso" />
      default:
        return <FaExclamationTriangle className="estado-pendiente" />
    }
  }

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "Completado":
        return "completado"
      case "En proceso":
        return "proceso"
      default:
        return "pendiente"
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Bienvenido, {userData.nombre || "Mecánico"}</h1>
          <p>Gestiona tus citas y trabajos asignados</p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon info">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.citasHoy}</h3>
            <p>Citas Hoy</p>
          </div>
          <button className="stat-action" onClick={() => navigate("/mechanic/citas")}>
            Ver agenda
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <FaTools />
          </div>
          <div className="stat-content">
            <h3>{stats.trabajosEnProceso}</h3>
            <p>Trabajos en Proceso</p>
          </div>
          <button className="stat-action" onClick={() => navigate("/mechanic/trabajos")}>
            Ver trabajos
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.trabajosCompletados}</h3>
            <p>Trabajos Completados</p>
          </div>
          <button className="stat-action" onClick={() => navigate("/mechanic/historial")}>
            Ver historial
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.horasDisponibles}</h3>
            <p>Horas Disponibles</p>
          </div>
          <button className="stat-action" onClick={() => navigate("/mechanic/horarios")}>
            Ver horario
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Citas de hoy */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <FaCalendarAlt className="section-icon" />
              Citas de Hoy
            </h2>
          </div>
          <div className="citas-list">
            {citasHoy.length > 0 ? (
              citasHoy.map((cita) => (
                <div key={cita.id} className={`cita-card mechanic ${getEstadoClass(cita.estado)}`}>
                  <div className="cita-hora-mechanic">
                    <FaClock />
                    {cita.hora}
                  </div>
                  <div className="cita-info">
                    <div className="cita-cliente">
                      <FaUser />
                      <strong>{cita.cliente}</strong>
                    </div>
                    <div className="cita-vehiculo">
                      <FaCar />
                      {cita.vehiculo}
                    </div>
                    <div className="cita-servicio">
                      <FaTools />
                      {cita.servicio}
                    </div>
                  </div>
                  <div className="cita-estado-mechanic">
                    {getEstadoIcon(cita.estado)}
                    <span>{cita.estado}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaCalendarAlt />
                <p>No tienes citas programadas para hoy</p>
              </div>
            )}
          </div>
        </div>

        {/* Trabajos activos */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <FaTools className="section-icon" />
              Trabajos en Proceso
            </h2>
          </div>
          <div className="trabajos-grid">
            {trabajosActivos.length > 0 ? (
              trabajosActivos.map((trabajo) => (
                <div key={trabajo.id} className="trabajo-card">
                  <div className="trabajo-header">
                    <h4>{trabajo.servicio}</h4>
                    <span className="trabajo-tiempo">{trabajo.tiempoEstimado}</span>
                  </div>
                  <div className="trabajo-info">
                    <p>
                      <strong>Cliente:</strong> {trabajo.cliente}
                    </p>
                    <p>
                      <strong>Vehículo:</strong> {trabajo.vehiculo}
                    </p>
                  </div>
                  <div className="trabajo-progreso">
                    <div className="progreso-label">
                      <span>Progreso</span>
                      <span>{trabajo.progreso}%</span>
                    </div>
                    <div className="progreso-bar">
                      <div className="progreso-fill" style={{ width: `${trabajo.progreso}%` }}></div>
                    </div>
                  </div>
                  <div className="trabajo-actions">
                    <button className="btn-secondary" onClick={() => navigate(`/mechanic/trabajos/${trabajo.id}`)}>
                      Ver detalles
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/mechanic/trabajos/${trabajo.id}/actualizar`)}
                    >
                      Actualizar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaTools />
                <p>No tienes trabajos en proceso</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MechanicDashboard

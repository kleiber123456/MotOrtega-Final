"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaHome, FaHistory, FaFileInvoiceDollar, FaBars } from "react-icons/fa"
import "../../../../shared/components/layout/clientlayout.css"

const ClientLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("usuario")
    navigate("/")
  }

  const handleAgendarCita = () => {
    navigate("/client/agendar-cita")
  }

  return (
    <div className="layC-layout">
      <main className="layC-main">{children}</main>
      {/* Botón flotante + */}
      <button
        className="layC-float-button"
        aria-label="Agendar Cita"
        onClick={handleAgendarCita}
        title="Agendar Nueva Cita"
      >
        <span style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "-2px" }}>+</span>
      </button>
      <nav className="layC-nav">
        <Link to="/client/dashboard" className="layC-nav-btn" aria-label="Panel">
          <FaHome />
          <span className="layC-nav-label">Inicio</span>
        </Link>
        <Link to="/client/historial" className="layC-nav-btn" aria-label="Historial">
          <FaHistory />
          <span className="layC-nav-label">Historial</span>
        </Link>
        <span className="layC-nav-label-C">Citas</span>
        <Link to="/client/facturas" className="layC-nav-btn" aria-label="Facturas">
          <FaFileInvoiceDollar />
          <span className="layC-nav-label">Facturas</span>
        </Link>
        <Link to="/client/vehiculos" className="layC-nav-btn" aria-label="Vehículos">
          <FaBars />
          <span className="layC-nav-label">Mas</span>
        </Link>
      </nav>
    </div>
  )
}

export default ClientLayout

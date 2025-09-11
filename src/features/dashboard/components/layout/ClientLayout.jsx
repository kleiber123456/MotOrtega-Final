"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaHome, FaHistory, FaFileInvoiceDollar, FaCar } from "react-icons/fa"
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
        <Link to="/client/citas" className="layC-nav-btn" aria-label="Citas">
          <FaHistory />
          <span className="layC-nav-label">Citas</span>
        </Link>
        <span className="layC-nav-label-C"></span>
        <Link to="/client/facturas" className="layC-nav-btn" aria-label="Facturas">
          <FaFileInvoiceDollar />
          <span className="layC-nav-label">Facturas</span>
        </Link>
        <Link to="/client/vehiculos" className="layC-nav-btn" aria-label="Vehículos">
          <FaCar />
          <span className="layC-nav-label">Vehículos</span>
        </Link>
      </nav>
    </div>
  )
}

export default ClientLayout

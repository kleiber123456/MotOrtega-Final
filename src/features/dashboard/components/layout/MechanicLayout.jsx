"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaCalendarAlt, FaBox } from "react-icons/fa"
import "../../../../shared/components/layout/clientlayout.css"

const MechanicLayout = ({ children }) => {
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

  return (
    <div className="layC-layout">
      <main className="layC-main">{children}</main>
      <nav className="layC-nav">
        <Link to="/mechanic/citas" className="layC-nav-btn" aria-label="Citas">
          <FaCalendarAlt />
          <span className="layC-nav-label">Citas</span>
        </Link>
        <Link to="/mechanic/repuestos" className="layC-nav-btn" aria-label="Repuestos">
          <FaBox />
          <span className="layC-nav-label">Repuestos</span>
        </Link>
      </nav>
    </div>
  )
}

export default MechanicLayout
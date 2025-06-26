"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  FaCar,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaCalendarAlt,
  FaTachometerAlt,
  FaHistory,
  FaTools,
  FaFileInvoice,
} from "react-icons/fa"
import "../../../../shared/components/layout/sidebar.css"
import "../../../../shared/components/layout/header.css"
import "../../../../shared/components/layout/layout.css"

const ClientSidebar = ({ collapsed, toggleSidebar }) => {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activePath, setActivePath] = useState("")
  const sidebarRef = useRef(null)
  const location = window.location.pathname

  useEffect(() => {
    setActivePath(location)
  }, [location])

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        mobileOpen &&
        !event.target.classList.contains("mo-sidebar-mobile-toggle")
      ) {
        setMobileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [mobileOpen])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("usuario")
    navigate("/")
  }

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(false)
    }
  }

  const isLinkActive = (path) => {
    return activePath === path
  }

  return (
    <>
      <button
        className="mo-sidebar-mobile-toggle"
        onClick={toggleMobileSidebar}
        aria-label="Toggle sidebar"
        aria-expanded={mobileOpen}
      >
        <FaBars />
      </button>

      <aside
        className={`mo-sidebar ${collapsed ? "mo-sidebar--collapsed" : ""} ${mobileOpen ? "mo-sidebar--mobile-open" : ""}`}
        ref={sidebarRef}
      >
        <div className="mo-sidebar__header">
          <div className="mo-sidebar__toggle-container">
            <button
              className="mo-sidebar__toggle"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <FaBars /> : <FaTimes />}
            </button>
          </div>

          <div className="mo-sidebar__logo">
            {!collapsed && <img className="mo-sidebar-logo" src="/Logo.png" alt="MotOrtega Logo" />}
          </div>

          <button className="mo-sidebar__mobile-close" onClick={toggleMobileSidebar} aria-label="Close sidebar">
            <FaTimes />
          </button>
        </div>

        <div className="mo-sidebar__menu">
          <a
            href="/client/dashboard"
            className={`mo-dashboard-btn ${activePath === "/client/dashboard" ? "mo-dashboard-btn--active" : ""} ${collapsed ? "mo-dashboard-btn--collapsed" : ""}`}
            onClick={handleLinkClick}
            aria-current={activePath === "/client/dashboard" ? "page" : undefined}
          >
            <span className="mo-dashboard-btn__icon">
              <FaTachometerAlt />
            </span>
            {!collapsed && <span className="mo-dashboard-btn__title">Mi Panel</span>}
          </a>

          <div className="mo-simple-link">
            <Link
              to="/client/citas"
              className={`mo-simple-link__btn ${isLinkActive("/client/citas") ? "mo-simple-link__btn--active" : ""}`}
              onClick={handleLinkClick}
              aria-current={isLinkActive("/client/citas") ? "page" : undefined}
            >
              <span className="mo-simple-link__icon">
                <FaCalendarAlt />
              </span>
              {!collapsed && <span className="mo-simple-link__title">Mis Citas</span>}
            </Link>
          </div>

          <div className="mo-simple-link">
            <Link
              to="/client/vehiculos"
              className={`mo-simple-link__btn ${isLinkActive("/client/vehiculos") ? "mo-simple-link__btn--active" : ""}`}
              onClick={handleLinkClick}
              aria-current={isLinkActive("/client/vehiculos") ? "page" : undefined}
            >
              <span className="mo-simple-link__icon">
                <FaCar />
              </span>
              {!collapsed && <span className="mo-simple-link__title">Mis Vehículos</span>}
            </Link>
          </div>

          <div className="mo-simple-link">
            <Link
              to="/client/servicios"
              className={`mo-simple-link__btn ${isLinkActive("/client/servicios") ? "mo-simple-link__btn--active" : ""}`}
              onClick={handleLinkClick}
              aria-current={isLinkActive("/client/servicios") ? "page" : undefined}
            >
              <span className="mo-simple-link__icon">
                <FaTools />
              </span>
              {!collapsed && <span className="mo-simple-link__title">Servicios</span>}
            </Link>
          </div>

          <div className="mo-simple-link">
            <Link
              to="/client/historial"
              className={`mo-simple-link__btn ${isLinkActive("/client/historial") ? "mo-simple-link__btn--active" : ""}`}
              onClick={handleLinkClick}
              aria-current={isLinkActive("/client/historial") ? "page" : undefined}
            >
              <span className="mo-simple-link__icon">
                <FaHistory />
              </span>
              {!collapsed && <span className="mo-simple-link__title">Historial</span>}
            </Link>
          </div>

          <div className="mo-simple-link">
            <Link
              to="/client/facturas"
              className={`mo-simple-link__btn ${isLinkActive("/client/facturas") ? "mo-simple-link__btn--active" : ""}`}
              onClick={handleLinkClick}
              aria-current={isLinkActive("/client/facturas") ? "page" : undefined}
            >
              <span className="mo-simple-link__icon">
                <FaFileInvoice />
              </span>
              {!collapsed && <span className="mo-simple-link__title">Facturas</span>}
            </Link>
          </div>
        </div>

        <div className="mo-sidebar__footer">
          <button
            className={`mo-sidebar__logout ${collapsed ? "mo-sidebar__logout--collapsed" : ""}`}
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <FaSignOutAlt />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

const ClientHeader = ({ sidebarCollapsed, onToggleSidebar }) => {
  const [userData, setUserData] = useState({
    name: "",
    role: "",
    avatar: "https://i.pravatar.cc/150",
  })
  const [isMobile, setIsMobile] = useState(false)
  const [notifications, setNotifications] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")
    const user = storedUser ? JSON.parse(storedUser) : { nombre: "Cliente", rol: "Cliente" }

    setUserData({
      name: user.nombre || "Cliente",
      role: user.rol || "Cliente",
      avatar: user.avatar || "https://i.pravatar.cc/150",
    })

    setNotifications(Math.floor(Math.random() * 3))
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("usuario")
    navigate("/")
  }

  return (
    <header className={`mo-header ${sidebarCollapsed ? "mo-header--sidebar-collapsed" : ""}`}>
      <div className="mo-header__title">
        <h2>Portal del Cliente</h2>
      </div>

      <div className="mo-header__actions">
        <div className="mo-header__notifications">
          <button
            className={`mo-header__icon-btn mo-header__icon-btn--notification ${notifications > 0 ? "has-notifications" : ""}`}
            aria-label={`${notifications} notificaciones`}
          >
            <FaBell />
          </button>
          <button className="mo-header__icon-btn" aria-label="Calendario" onClick={() => navigate("/client/citas")}>
            <FaCalendarAlt />
          </button>
          <button
            className="mo-header__icon-btn mo-header__icon-btn--logout"
            onClick={handleLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <FaSignOutAlt />
          </button>
        </div>
        <div className="mo-header__user">
          {!isMobile && (
            <div className="mo-header__welcome">
              <p>Bienvenido, {userData.name}</p>
              <span className="mo-header__role">{userData.role}</span>
            </div>
          )}
          <div className="mo-header__avatar" style={{ cursor: "pointer" }} onClick={() => navigate("/client/perfil")}>
            <img src={userData.avatar || "/placeholder.svg"} alt="Avatar de usuario" />
          </div>
        </div>
      </div>
    </header>
  )
}

const ClientLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [sidebarCollapsed])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="mo-layout">
      <ClientSidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`mo-layout__main ${sidebarCollapsed ? "mo-layout__main--sidebar-collapsed" : ""}`}>
        <ClientHeader sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />
        <main className="mo-layout__content">{children}</main>
      </div>
    </div>
  )
}

export default ClientLayout

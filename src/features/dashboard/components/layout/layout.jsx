"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  FaTools,
  FaCar,
  FaUserCog,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaBell,
  FaCalendarAlt,
  FaTachometerAlt,
} from "react-icons/fa"
import "../../../../shared/components/layout/sidebar.css"
import "../../../../shared/components/layout/header.css"
import "../../../../shared/components/layout/layout.css"

// Mejora 1: Optimizar el componente Dropdown para mejor consistencia visual
// Actualizar el componente Dropdown para que tenga un estilo más coherente con el resto de la aplicación
const Dropdown = ({ title, icon, options, isOpen, toggleDropdown, id, collapsed }) => {
  const dropdownRef = useRef(null)

  // Efecto para cerrar el menú cuando se haga clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && isOpen) {
        toggleDropdown(id)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [id, isOpen, toggleDropdown])

  return (
    <div className="mo-dropdown" ref={dropdownRef}>
      <button
        className={`mo-dropdown__btn ${isOpen ? "mo-dropdown__btn--active" : ""}`}
        onClick={() => toggleDropdown(id)}
        aria-expanded={isOpen}
        aria-controls={`dropdown-${id}`}
      >
        <span className="mo-dropdown__icon">{icon}</span>
        {!collapsed && (
          <>
            <span className="mo-dropdown__title">{title}</span>
            <span className="mo-dropdown__arrow">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
          </>
        )}
      </button>
      <div
        id={`dropdown-${id}`}
        className={`mo-dropdown__content ${isOpen ? "mo-dropdown__content--show" : ""} ${collapsed ? "mo-dropdown__content--collapsed" : ""}`}
      >
        {options.map((opt, idx) => (
          <Link key={idx} to={opt.link} className="mo-dropdown__option" onClick={() => toggleDropdown(id)}>
            {opt.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Mejora 2: Optimizar el componente SimpleLink para mejor consistencia visual
// Actualizar el componente SimpleLink para que tenga un estilo más coherente con el resto de la aplicación
const SimpleLink = ({ title, icon, link, collapsed, onClick, isActive = false, isDashboard = false }) => {
  return (
    <div className="mo-simple-link">
      <Link
        to={link}
        className={`mo-simple-link__btn ${isActive ? "mo-simple-link__btn--active" : ""} ${isDashboard ? "mo-simple-link__btn--dashboard" : ""}`}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="mo-simple-link__icon">{icon}</span>
        {!collapsed && <span className="mo-simple-link__title">{title}</span>}
      </Link>
    </div>
  )
}

// Mejora 3: Optimizar el componente Sidebar para mejor consistencia visual
// Actualizar el componente Sidebar para que tenga un estilo más coherente con el resto de la aplicación
const Sidebar = ({ collapsed, toggleSidebar }) => {
  const navigate = useNavigate()
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activePath, setActivePath] = useState("")
  const sidebarRef = useRef(null)
  const location = window.location.pathname

  useEffect(() => {
    setActivePath(location)
  }, [location])

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  // Efecto para cerrar el sidebar móvil cuando se hace clic fuera
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

  // Cerrar también los dropdowns al hacer clic en un enlace
  const handleLinkClick = () => {
    setActiveDropdown(null)
    if (window.innerWidth < 768) {
      setMobileOpen(false)
    }
  }

  // Función para verificar si un enlace está activo
  const isLinkActive = (path) => {
    return activePath === path
  }

  return (
    <>
      {/* Botón móvil del sidebar (visible solo en móvil) */}
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
          {/* Botón de toggle ahora está centrado encima del logo */}
          <div className="mo-sidebar__toggle-container">
            <button
              className="mo-sidebar__toggle"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <FaBars /> : <FaTimes />}
            </button>
          </div>

          {/* Logo ahora está en un contenedor separado */}
          <div className="mo-sidebar__logo">
            {!collapsed && <img className="mo-sidebar-logo" src="/Logo.png" alt="MotOrtega Logo" />}
          </div>

          {/* Botón para cerrar en móvil */}
          <button className="mo-sidebar__mobile-close" onClick={toggleMobileSidebar} aria-label="Close sidebar">
            <FaTimes />
          </button>
        </div>

        <div className="mo-sidebar__menu">
          {/* NUEVO: Dropdown de Inicio con Dashboard y Perfil */}
          <Dropdown
            id="inicio"
            title="Inicio"
            icon={<FaTachometerAlt />}
            options={[
              { label: "Dashboard", link: "/dashboard" },
              { label: "Perfil", link: "/Perfil" },
            ]}
            isOpen={activeDropdown === "inicio"}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="configuracion"
            title="Configuración"
            icon={<FaUserCog />}
            options={[
              { label: "Usuarios", link: "/listarUsuarios" },
              { label: "Clientes", link: "/ListarClientes" },
              { label: "Mecánicos", link: "/ListarMecanicos" },
              { label: "Roles", link: "/ListarRoles" },
            ]}
            isOpen={activeDropdown === "configuracion"}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="servicios"
            title="Servicios & Repuestos"
            icon={<FaTools />}
            options={[
              { label: "Servicios", link: "/ListarServicios" },
              { label: "Repuestos", link: "/Repuestos" },
              { label: "Categorías", link: "/categorias-repuesto" },
              { label: "Novedades", link: "/Horarios" },
            ]}
            isOpen={activeDropdown === "servicios"}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="vehiculos"
            title="Vehículos"
            icon={<FaCar />}
            options={[
              { label: "Vehículos", link: "/vehiculos" },
            ]}
            isOpen={activeDropdown === "vehiculos"}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="operaciones"
            title="Operaciones"
            icon={<FaShoppingCart />}
            options={[
              { label: "Compras", link: "/ListarCompras" },
              { label: "Proveedores", link: "/ListarProveedores" },
              { label: "Ventas", link: "/ListarVentas" },
              { label: "Citas", link: "/citas" },
            ]}
            isOpen={activeDropdown === "operaciones"}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />
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

// Mejora 4: Optimizar el componente Header para mejor consistencia visual
// Actualizar el componente Header para que tenga un estilo más coherente con el resto de la aplicación
const Header = ({ sidebarCollapsed, onToggleSidebar }) => {
  const [welcomeMessage, setWelcomeMessage] = useState("")
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
    const user = storedUser ? JSON.parse(storedUser) : { nombre: "Usuario", rol: "Rol" }

    setUserData({
      name: user.nombre || "Usuario",
      role: user.rol || "Rol",
      avatar: user.avatar || "https://i.pravatar.cc/150",
    })

    // Simulación de notificaciones para demostración
    setNotifications(Math.floor(Math.random() * 5))

    const clientMessages = [
      `¡Hola ${user.nombre}! Qué bueno verte de vuelta`,
      `Bienvenido ${user.nombre}, ¿cómo podemos ayudarte hoy?`,
      `¡Hola ${user.nombre}! ¿Listo para agendar una cita?`,
      `${user.nombre}, ¡qué gusto tenerte nuevamente!`,
      `Bienvenido otra vez ${user.nombre}, ¿en qué podemos servirte?`,
    ]

    const adminMessages = [
      `Bienvenido administrador ${user.nombre}`,
      `Panel de control listo, ${user.nombre}`,
      `${user.nombre}, tienes nuevas notificaciones`,
      `¡Hola ${user.nombre}! El sistema está actualizado`,
    ]

    const messages = user.rol === "admin" ? adminMessages : clientMessages
    const randomIndex = Math.floor(Math.random() * messages.length)
    setWelcomeMessage(messages[randomIndex])
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
      <div className="mo-header__title">{/* Espacio para título de página si se necesita */}</div>

      <div className="mo-header__actions">
        <div className="mo-header__notifications">
          <button
            className={`mo-header__icon-btn mo-header__icon-btn--notification ${notifications > 0 ? "has-notifications" : ""}`}
            aria-label={`${notifications} notificaciones`}
          >
            <FaBell />
          </button>
          <button className="mo-header__icon-btn" aria-label="Calendario">
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
              <p>{welcomeMessage}</p>
              <span className="mo-header__role">{userData.role}</span>
            </div>
          )}
          <div className="mo-header__avatar">
            <img src={userData.avatar || "/placeholder.svg"} alt="Avatar de usuario" />
          </div>
        </div>
      </div>
    </header>
  )
}

// Mejora 5: Optimizar el componente Layout principal para mejor consistencia visual
// Actualizar el componente Layout para que tenga un estilo más coherente con el resto de la aplicación
const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si estamos en móvil
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      // Auto colapsar en móvil
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true)
      }
    }

    // Comprobar al inicio
    handleResize()

    // Listener para cambios de tamaño
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
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`mo-layout__main ${sidebarCollapsed ? "mo-layout__main--sidebar-collapsed" : ""}`}>
        <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />
        <main className="mo-layout__content">{children}</main>
      </div>
    </div>
  )
}

export default Layout

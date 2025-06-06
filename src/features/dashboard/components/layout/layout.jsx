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
  FaChartBar,
  FaBars,
  FaTimes,
  FaBell,
  FaCalendarAlt,
  FaTachometerAlt,
} from "react-icons/fa"
import "../../../../shared/components/layout/sidebar.css"
import "../../../../shared/components/layout/header.css"
import "../../../../shared/components/layout/layout.css"

// Componente Dropdown para el Sidebar (SIN TOOLTIPS)
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

// Componente para enlaces simples (SIN TOOLTIPS)
const SimpleLink = ({ title, icon, link, collapsed, onClick, isActive = false }) => {
  return (
    <div className="mo-simple-link">
      <Link
        to={link}
        className={`mo-simple-link__btn ${isActive ? "mo-simple-link__btn--active" : ""}`}
        onClick={onClick}
      >
        <span className="mo-simple-link__icon">{icon}</span>
        {!collapsed && <span className="mo-simple-link__title">{title}</span>}
      </Link>
    </div>
  )
}

// Componente Sidebar
const Sidebar = ({ collapsed, toggleSidebar }) => {
  const navigate = useNavigate()
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef(null)

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

  return (
    <>
      {/* Botón móvil del sidebar (visible solo en móvil) */}
      <button className="mo-sidebar-mobile-toggle" onClick={toggleMobileSidebar} aria-label="Toggle sidebar">
        <FaBars />
      </button>

      <aside
        className={`mo-sidebar ${collapsed ? "mo-sidebar--collapsed" : ""} ${mobileOpen ? "mo-sidebar--mobile-open" : ""}`}
        ref={sidebarRef}
      >
        <div className="mo-sidebar__header">
          {/* Botón de toggle ahora está centrado encima del logo */}
          <div className="mo-sidebar__toggle-container">
            <button className="mo-sidebar__toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
              {collapsed ? <FaBars /> : <FaTimes />}
            </button>
          </div>

          {/* Logo ahora está en un contenedor separado */}
          <div className="mo-sidebar__logo">
            {!collapsed && <img className="mo-sidebar-logo" src="/Logo.png" alt="Logo" />}
          </div>

          {/* Botón para cerrar en móvil */}
          <button className="mo-sidebar__mobile-close" onClick={toggleMobileSidebar} aria-label="Close sidebar">
            <FaTimes />
          </button>
        </div>

        <div className="mo-sidebar__menu">
          {/* Dashboard como primera opción */}
          <SimpleLink
            title="Dashboard"
            icon={<FaTachometerAlt />}
            link="/dashboard"
            collapsed={collapsed}
            onClick={handleLinkClick}
          />

          <Dropdown
            id="configuracion"
            title="Configuración"
            icon={<FaUserCog />}
            options={[
              { label: "Usuarios", link: "/listarUsuarios" },
              { label: "Clientes", link: "/ListarClientes" },
              { label: "Roles", link: "/Roles" },
              { label: "Mecánicos", link: "/Mecanicos" },
            ]}
            isOpen={activeDropdown === "configuracion"}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="servicios"
            title="Servicios"
            icon={<FaTools />}
            options={[
              { label: "Servicios", link: "/ListarServicios" },
              { label: "Repuestos", link: "/Repuestos" },
              { label: "Categorías", link: "/categorias-repuesto" },
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
              { label: "Referencias", link: "/referencias" },
              { label: "Marcas", link: "/marcas" },
            ]}
            isOpen={activeDropdown === "vehiculos"}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="compras"
            title="Compras"
            icon={<FaShoppingCart />}
            options={[
              { label: "Compras", link: "/ListarCompras" },
              { label: "Proveedores", link: "/ListarProveedores" },
            ]}
            isOpen={activeDropdown === "compras"}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="ventas"
            title="Ventas"
            icon={<FaChartBar />}
            options={[
              { label: "Ventas", link: "/ventas" },
              { label: "Pedidos", link: "/pedidos" },
              { label: "Citas", link: "/citas" },
            ]}
            isOpen={activeDropdown === "ventas"}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="cuenta"
            title="Tu Cuenta"
            icon={<FaUser />}
            options={[{ label: "Cuenta", link: "/Perfil" }]}
            isOpen={activeDropdown === "cuenta"}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />
        </div>

        <div className="mo-sidebar__footer">
          {/* Botón de logout SIN TOOLTIP */}
          <button className="mo-sidebar__logout" onClick={handleLogout}>
            <FaSignOutAlt />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

// Componente Header
const Header = ({ sidebarCollapsed, onToggleSidebar }) => {
  const [welcomeMessage, setWelcomeMessage] = useState("")
  const [userData, setUserData] = useState({
    name: "",
    role: "",
    avatar: "https://i.pravatar.cc/150",
  })
  const [isMobile, setIsMobile] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")
    const user = storedUser ? JSON.parse(storedUser) : { nombre: "Usuario", rol: "Rol" }

    setUserData({
      name: user.nombre || "Usuario",
      role: user.rol || "Rol",
      avatar: user.avatar || "https://i.pravatar.cc/150",
    })

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
      <div className="mo-header__title">{/* Se eliminó el botón que desplegaba el menú */}</div>

      <div className="mo-header__actions">
        <div className="mo-header__notifications">
          <button className="mo-header__icon-btn mo-header__icon-btn--notification">
            <FaBell />
          </button>
          <button className="mo-header__icon-btn">
            <FaCalendarAlt />
          </button>
          <button
            className="mo-header__icon-btn mo-header__icon-btn--logout"
            onClick={handleLogout}
            title="Cerrar sesión"
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

// Componente Layout principal que integra Sidebar y Header
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

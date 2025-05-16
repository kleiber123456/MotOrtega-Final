import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTools, FaCar, FaWrench, FaUserCog, FaUser, FaSignOutAlt, FaChevronDown, FaChevronUp,
  FaShoppingCart, FaChartBar, FaBars, FaTimes, FaBell, FaCalendarAlt
} from 'react-icons/fa';
import '../../../../shared/components/layout/sidebar.css';
import '../../../../shared/components/layout/header.css';
import '../../../../shared/components/layout/layout.css';

// Componente Dropdown para el Sidebar
const Dropdown = ({ title, icon, options, isOpen, toggleDropdown, id, collapsed }) => (
  <div className="mo-dropdown">
    <button
      className={`mo-dropdown__btn ${isOpen ? 'mo-dropdown__btn--active' : ''}`}
      onClick={() => toggleDropdown(id)}
    >
      <span className="mo-dropdown__icon">{icon}</span>
      {!collapsed && (
        <>
          <span className="mo-dropdown__title">{title}</span>
          <span className="mo-dropdown__arrow">
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </>
      )}
    </button>
    <div className={`mo-dropdown__content ${isOpen ? 'mo-dropdown__content--show' : ''} ${collapsed ? 'mo-dropdown__content--collapsed' : ''}`}>
      {options.map((opt, idx) => (
        <Link key={idx} to={opt.link} className="mo-dropdown__option">
          {opt.label}
        </Link>
      ))}
    </div>
  </div>
);

// Componente Sidebar
const Sidebar = ({ collapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };
  
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <>
      {/* Botón móvil del sidebar (visible solo en móvil) */}
      <button 
        className="mo-sidebar-mobile-toggle" 
        onClick={toggleMobileSidebar}
        aria-label="Toggle sidebar"
      >
        <FaBars />
      </button>
      
      <aside className={`mo-sidebar ${collapsed ? 'mo-sidebar--collapsed' : ''} ${mobileOpen ? 'mo-sidebar--mobile-open' : ''}`}>
        <div className="mo-sidebar__header">
          <div className="mo-sidebar__logo">
            {!collapsed && <img className="mo-sidebar-logo" src="/Logo.png" alt="Logo" />}
          </div>
          <button 
            className="mo-sidebar__toggle" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <FaBars /> : <FaTimes />}
          </button>
          
          {/* Botón para cerrar en móvil */}
          <button 
            className="mo-sidebar__mobile-close" 
            onClick={toggleMobileSidebar}
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mo-sidebar__menu">
          <Dropdown
            id="configuracion"
            title="Configuracion"
            icon={<FaUserCog />}
            options={[
              { label: 'Usuarios', link: '/listarUsuarios' },
              { label: 'Clientes', link: '/Clientes' },
              { label: 'Roles', link: '/Roles' },
              { label: 'Mecanicos', link: '/Mecanicos' }
            ]}
            isOpen={activeDropdown === 'configuracion'}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="servicios"
            title="Servicios"
            icon={<FaTools />}
            options={[
              { label: 'Servicios', link: '/Servicios' },
              { label: 'Productos', link: '/Productos' },
              { label: 'Categorias', link: '/Categorias' }
            ]}
            isOpen={activeDropdown === 'servicios'}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="vehiculos"
            title="Vehículos"
            icon={<FaCar />}
            options={[
              { label: 'Vehículos', link: '/vehiculos' },
              { label: 'Referencias', link: '/referencias' },
              { label: 'Marcas', link: '/marcas' }
            ]}
            isOpen={activeDropdown === 'vehiculos'}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="compras"
            title="Compras"
            icon={<FaShoppingCart />}
            options={[
              { label: 'Compras', link: '/compras' },
              { label: 'Proveedores', link: '/proveedores' }
            ]}
            isOpen={activeDropdown === 'compras'}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="ventas"
            title="Ventas"
            icon={<FaChartBar />}
            options={[
              { label: 'Ventas', link: '/ventas' },
              { label: 'Pedidos', link: '/pedidos' },
              { label: 'Citas', link: '/citas' }
            ]}
            isOpen={activeDropdown === 'ventas'}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />

          <Dropdown
            id="cuenta"
            title="Tu Cuenta"
            icon={<FaUser />}
            options={[{ label: 'Cuenta', link: '/Perfil' }]}
            isOpen={activeDropdown === 'cuenta'}
            toggleDropdown={toggleDropdown}
            collapsed={collapsed}
          />
        </div>

        <div className="mo-sidebar__footer">
          <button className="mo-sidebar__logout" onClick={handleLogout}>
            <FaSignOutAlt />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

// Componente Header
const Header = ({ sidebarCollapsed, onToggleSidebar }) => {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    avatar: 'https://i.pravatar.cc/150'
  });
  const [isMobile, setIsMobile] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    const user = storedUser ? JSON.parse(storedUser) : { nombre: 'Usuario', rol: 'Rol' };

    setUserData({
      name: user.nombre || 'Usuario',
      role: user.rol || 'Rol',
      avatar: user.avatar || 'https://i.pravatar.cc/150'
    });

    const clientMessages = [
      `¡Hola ${user.nombre}! Qué bueno verte de vuelta`,
      `Bienvenido ${user.nombre}, ¿cómo podemos ayudarte hoy?`,
      `¡Hola ${user.nombre}! ¿Listo para agendar una cita?`,
      `${user.nombre}, ¡qué gusto tenerte nuevamente!`,
      `Bienvenido otra vez ${user.nombre}, ¿en qué podemos servirte?`
    ];

    const adminMessages = [
      `Bienvenido administrador ${user.nombre}`,
      `Panel de control listo, ${user.nombre}`,
      `${user.nombre}, tienes nuevas notificaciones`,
      `¡Hola ${user.nombre}! El sistema está actualizado`
    ];

    const messages = (user.rol === 'admin' ? adminMessages : clientMessages);
    const randomIndex = Math.floor(Math.random() * messages.length);
    setWelcomeMessage(messages[randomIndex]);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <header className={`mo-header ${sidebarCollapsed ? 'mo-header--sidebar-collapsed' : ''}`}>
      <div className="mo-header__title">
        {!isMobile && (
          <button 
            className="mo-header__sidebar-toggle" 
            onClick={onToggleSidebar} 
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
        )}
      </div>
      
      <div className="mo-header__actions">
        <div className="mo-header__notifications">
          <button className="mo-header__icon-btn">
            <FaBell />
          </button>
          <button className="mo-header__icon-btn">
            <FaCalendarAlt />
          </button>
          <button className="mo-header__icon-btn" onClick={handleLogout} title="Cerrar sesión">
            <FaSignOutAlt />
          </button>
        </div>
        <div className="mo-header__user">
          {!isMobile && (
            <div className="mo-header__welcome">
              <p>{welcomeMessage}</p>
              <span className="mo-header__role">
                {userData.role}
              </span>
            </div>
          )}
          <div className="mo-header__avatar">
            <img src={userData.avatar} alt="Avatar de usuario" />
          </div>
        </div>
      </div>
    </header>
  );
};

// Componente Layout principal que integra Sidebar y Header
const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar si estamos en móvil
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto colapsar en móvil
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };
    
    // Comprobar al inicio
    handleResize();
    
    // Listener para cambios de tamaño
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarCollapsed]);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="mo-layout">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`mo-layout__main ${sidebarCollapsed ? 'mo-layout__main--sidebar-collapsed' : ''}`}>
        <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />
        <main className="mo-layout__content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
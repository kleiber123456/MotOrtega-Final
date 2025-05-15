// components/Sidebar.jsx
import { useState } from 'react';
import { FaTools, FaCar, FaWrench, FaUserCog, FaUser, FaSignOutAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../../../../shared/components/layout/sidebar.css';


const Dropdown = ({ title, icon, options, isOpen, toggleDropdown, id }) => {
  return (
    <div className="mo-dropdown">
      <button 
        className={`mo-dropdown__btn ${isOpen ? 'mo-dropdown__btn--active' : ''}`} 
        onClick={() => toggleDropdown(id)}
      >
        <span className="mo-dropdown__icon">{icon}</span>
        <span className="mo-dropdown__title">{title}</span>
        <span className="mo-dropdown__arrow">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>
      <div className={`mo-dropdown__content ${isOpen ? 'mo-dropdown__content--show' : ''}`}>
        {options.map((opt, idx) => (
          <Link key={idx} to={opt.link} className="mo-dropdown__option">
            {opt.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <aside className="mo-sidebar">
      <div className="mo-sidebar__logo">
        <h2>MotOrtega</h2>
      </div>

      <div className="mo-sidebar__menu">
         <Dropdown
          id="usuarios"
          title="Usuarios"
          icon={<FaUserCog />}
          options={[
            { label: 'Usuarios', link: '/Usuarios' },
            { label: 'Clientes', link: '/Clientes' },
            { label: 'Roles', link: '/Roles' },
            { label: 'Mecanicos', link: '/Mecanicos' },
          ]}
          isOpen={activeDropdown === 'usuarios'}
          toggleDropdown={toggleDropdown}
        />
        <Dropdown
          id="servicios"
          title="Servicios"
          icon={<FaTools />}
          options={[
            { label: 'Servicios', link: '/Servicios' },
            { label: 'Productos', link: '/Productos' },
            { label: 'Categorias', link: '/Categorias' },

          ]}
          isOpen={activeDropdown === 'servicios'}
          toggleDropdown={toggleDropdown}
        />
        <Dropdown
          id="vehiculos"
          title="Vehículos"
          icon={<FaCar />}
          options={[
            { label: 'Registro', link: '/vehiculos' },
            { label: 'Marcas', link: '/vehiculos/marcas' },
            { label: 'Buscar', link: '/vehiculos/buscar' },
          ]}
          isOpen={activeDropdown === 'vehiculos'}
          toggleDropdown={toggleDropdown}
        />
        <Dropdown
          id="cuenta"
          title="Tu Cuenta"
          icon={<FaUser />}
          options={[
            { label: 'Cuenta', link: '/Cuenta' },
          ]}
          isOpen={activeDropdown === 'cuenta'}
          toggleDropdown={toggleDropdown}
        />
      </div>

      <div className="mo-sidebar__footer">
        <button className="mo-sidebar__logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
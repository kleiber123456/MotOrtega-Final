// components/Sidebar.jsx
import { useState } from 'react';
import { FaTools, FaCar, FaWrench, FaUserCog, FaSignOutAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
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
          id="servicios"
          title="Servicios"
          icon={<FaTools />}
          options={[
            { label: 'Cambio de aceite', link: '/servicios/aceite' },
            { label: 'Alineación', link: '/servicios/alineacion' },
            { label: 'Revisión general', link: '/servicios/revision' },
          ]}
          isOpen={activeDropdown === 'servicios'}
          toggleDropdown={toggleDropdown}
        />
        <Dropdown
          id="repuestos"
          title="Repuestos"
          icon={<FaWrench />}
          options={[
            { label: 'Catálogo', link: '/repuestos/catalogo' },
            { label: 'Agregar', link: '/repuestos/nuevo' },
            { label: 'Pedidos', link: '/repuestos/pedidos' },
          ]}
          isOpen={activeDropdown === 'repuestos'}
          toggleDropdown={toggleDropdown}
        />
        <Dropdown
          id="clientes"
          title="Clientes"
          icon={<FaUserCog />}
          options={[
            { label: 'Listado', link: '/clientes' },
            { label: 'Agregar nuevo', link: '/clientes/nuevo' },
            { label: 'Historial', link: '/clientes/historial' },
          ]}
          isOpen={activeDropdown === 'clientes'}
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
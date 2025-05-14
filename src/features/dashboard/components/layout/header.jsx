// components/Header.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';
import '../../../../shared/components/layout/header.css';

const Header = () => {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    avatar: 'https://i.pravatar.cc/150'
  });

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <header className="mo-header">
      <div className="mo-header__title">
        <h1>Taller MotOrtega</h1>
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
          <div className="mo-header__welcome">
            <p>{welcomeMessage}</p>
            <span className="mo-header__role">
              {userData.role}
            </span>
          </div>
          <div className="mo-header__avatar">
            <img src={userData.avatar} alt="Avatar de usuario" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

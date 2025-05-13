// components/Header.jsx
import { useState, useEffect } from 'react';
import { FaBell, FaCalendarAlt } from 'react-icons/fa';
import '../../../../shared/components/layout/header.css';

  
const Header = () => {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    avatar: 'https://i.pravatar.cc/150'
  });

  useEffect(() => {
    // Aquí obtendrías los datos del usuario del localStorage o una API
    const user = JSON.parse(localStorage.getItem('usuario')) || { nombre: 'Usuario', role: 'cliente' };
    
    setUserData({
      name: user.nombre || 'Usuario',
      role: user.role || 'cliente',
      avatar: user.avatar || 'https://i.pravatar.cc/150'
    });
    
    // Mensajes de bienvenida aleatorios basados en el rol
    const clientMessages = [
      `¡Hola ${user.nombre}! Que bueno verte de vuelta`,
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
    
    const messages = user.role === 'admin' ? adminMessages : clientMessages;
    const randomIndex = Math.floor(Math.random() * messages.length);
    setWelcomeMessage(messages[randomIndex]);
  }, []);

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
        </div>
        <div className="mo-header__user">
          <div className="mo-header__welcome">
            <p>{welcomeMessage}</p>
            <span className="mo-header__role">{userData.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
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
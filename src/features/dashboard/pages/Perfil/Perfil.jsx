import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../../shared/styles/Perfil.css';

const Perfil = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: '',
    documento: '',
    direccion: '',
    correo: '',
    password: '',
    telefono: ''
  });

  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      console.log('No se encontró el token');
      setLoading(false);
      return;
    } else {
      console.log('Token cargado:', token);
    }

    const obtenerPerfil = async () => {
      try {
        const res = await axios.get('https://api-final-8rw7.onrender.com/api/usuarios/mi-perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPerfil(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          console.warn('Token inválido:', token);
          setMensaje('Token inválido. No se pudo cargar el perfil.');
        } else {
          console.error('Error al obtener perfil:', err.response?.data || err.message);
          setMensaje('Error al cargar el perfil');
        }
      } finally {
        setLoading(false);
      }
    };

    obtenerPerfil();
  }, [token]);

  const handleChange = (e) => {
    setPerfil({
      ...perfil,
      [e.target.name]: e.target.value,
    });
  };

  const actualizarPerfil = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('https://api-final-8rw7.onrender.com/api/usuarios/mi-perfil', perfil, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje('Perfil actualizado correctamente');
      setPerfil(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        console.warn('Token inválido al actualizar:', token);
        setMensaje('Token inválido. No se pudo actualizar el perfil.');
      } else {
        console.error('Error al actualizar perfil:', err.response?.data || err.message);
        setMensaje('No se pudo actualizar el perfil');
      }
    }
  };

  if (loading) return <div className="perfil__loading">Cargando...</div>;

  return (
    <div className="perfil__container">
      <form className="perfil__form" onSubmit={actualizarPerfil}>
        <div className="perfil__title-container">
          <h2 className="perfil__title">Mi Perfil</h2>
        </div>
        <div className="perfil__token">
          <strong>Token:</strong> {token || 'No disponible'}
        </div>

        {[
          { label: 'Nombre', name: 'nombre' },
          { label: 'Apellido', name: 'apellido' },
          { label: 'Tipo de Documento', name: 'tipo_documento' },
          { label: 'Número de Documento', name: 'documento' },
          { label: 'Dirección', name: 'direccion' },
          { label: 'Correo', name: 'correo', type: 'email' },
          { label: 'Contraseña', name: 'password', type: 'password' },
          { label: 'Teléfono', name: 'telefono' },
        ].map(({ label, name, type = 'text' }) => (
          <div className="perfil__field" key={name}>
            <label>{label}</label>
            <input
              type={type}
              name={name}
              value={perfil[name] || ''}
              onChange={handleChange}
            />
          </div>
        ))}

        <button type="submit" className="perfil__btn">Guardar cambios</button>
        {mensaje && <p className="perfil__mensaje">{mensaje}</p>}
      </form>
    </div>
  );
};

export default Perfil;

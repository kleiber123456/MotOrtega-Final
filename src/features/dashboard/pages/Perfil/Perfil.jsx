import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
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
    const obtenerPerfil = async () => {
      try {
        const res = await axios.get('https://api-final-8rw7.onrender.com/api/usuarios/mi-perfil', {
          headers: { Authorization: `${token}` }
        });
        setPerfil(res.data);
      } catch (err) {
        // ... error handling
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
        headers: { Authorization: `${token}` }
      });
      
      // Mostrar alerta de éxito con SweetAlert2
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Perfil actualizado correctamente',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Redireccionar al dashboard
          navigate('/dashboard');
        } else {
          // Si el usuario cierra la alerta con el botón X también redirigir
          navigate('/dashboard');
        }
      });
      
      setPerfil(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        console.warn('Token inválido al actualizar:', token);
        setMensaje('Token inválido. No se pudo actualizar el perfil.');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Token inválido. No se pudo actualizar el perfil.'
        });
      } else {
        console.error('Error al actualizar perfil:', err.response?.data || err.message);
        setMensaje('No se pudo actualizar el perfil');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el perfil'
        });
      }
    }
  };

  const handleCambiarPassword = () => {
    navigate('/CambiarContraseña');
  };

  if (loading) return <div className="perfil__loading">Cargando...</div>;

  return (
    <div className="perfil__container">
      <form className="perfil__form" onSubmit={actualizarPerfil}>
        <div className="perfil__title-container">
          <h2 className="perfil__title">Mi Perfil</h2>
        </div>

        {[
          { label: 'Nombre', name: 'nombre' },
          { label: 'Apellido', name: 'apellido' },
          { label: 'Tipo de Documento', name: 'tipo_documento' },
          { label: 'Número de Documento', name: 'documento' },
          { label: 'Dirección', name: 'direccion' },
          { label: 'Correo', name: 'correo', type: 'email' },
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

        {/* Campo de contraseña separado para mejor control */}
        <div className="perfil__field password-container">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={perfil.password || ''}
            readOnly
          />
          <button type="button" onClick={handleCambiarPassword}>
            Cambiar contraseña
          </button>
        </div>

        <button type="submit" className="perfil__btn">Guardar cambios</button>
        {mensaje && <p className="perfil__mensaje">{mensaje}</p>}
      </form>
    </div>
  );
};

export default Perfil;
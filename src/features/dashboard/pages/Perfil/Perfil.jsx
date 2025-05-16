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
  const tiposDocumento = ['Cédula de ciudadanía', 'Tarjeta de identidad', 'Cédula de Extranjería', 'Pasaporte', 'Otro'];

useEffect(() => {
  const obtenerPerfil = async () => {
     try {
      const res = await axios.get('https://api-final-8rw7.onrender.com/api/usuarios/mi-perfil', {
         headers: { Authorization: `${token}` }
      });
      setPerfil(res.data);
     } catch (err) {
       console.error('Error al obtener perfil:', err.response?.data || err.message);
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

 const soloNumeros = (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
  };

  const soloLetras = (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
  };


const actualizarPerfil = async (e) => {
   e.preventDefault();
   try {
     const res = await axios.put('https://api-final-8rw7.onrender.com/api/usuarios/mi-perfil', perfil, {
      headers: { Authorization: `${token}` }
     });

   Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: 'Perfil actualizado correctamente',
    confirmButtonColor: '#3085d6',
    confirmButtonText: 'Aceptar'
   }).then((result) => {
     if (result.isConfirmed) {
       navigate('/dashboard');
     } else {
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

<div className="perfil__grid-container">
        <div className="perfil__field">
          <label>Nombres</label>
          <input autoComplete="off" maxLength={30} onInput={soloLetras} type="text" name="nombre" value={perfil.nombre || ''} onChange={handleChange} />
        </div>
        <div className="perfil__field" >
          <label>Apellidos</label>
          <input autoComplete="off" maxLength={35} onInput={soloLetras} type="text" name="apellido" value={perfil.apellido || ''} onChange={handleChange} />
        </div>

        <div className="perfil__field">
          <label>Teléfono</label>
          <input autoComplete="off" maxLength={15} onInput={soloNumeros} type="text" name="telefono" value={perfil.telefono || ''} onChange={handleChange} />
        </div>
        <div className="perfil__field">
          <label>Tipo de Documento</label>
          <select disabled={true} name="tipo_documento" value={perfil.tipo_documento || ''} onChange={handleChange}>
           <option value="">Seleccionar</option>
            {tiposDocumento.map((option) => (
            <option key={option} value={option}>{option}</option>
           ))}
          </select>
        </div>
        <div className="perfil__field">
          <label>Documento</label>
          <input maxLength={15} disabled={true} onInput={soloNumeros} type="text" name="documento" value={perfil.documento || ''} onChange={handleChange} />
        </div>
          <div className="perfil__field">
          <label>Dirección</label>
          <input autoComplete="off" maxLength={100}  type="text" name="direccion" value={perfil.direccion || ''} onChange={handleChange} />
        </div>
        <div className="perfil__field">
          <label>Correo</label>
          <input maxLength={254} disabled={true} type="email" name="correo" value={perfil.correo || ''} onChange={handleChange} />
        </div>


        <div className="perfil__field ">
          <label>Contraseña</label>
          <div className="password-input-wrapper">
            <input
              type="password"
              name="password"
              value={".................."}
              readOnly
              className='perfil-input'
            />
          </div>
        </div>
          <button className='perfil__btn' type="button" onClick={handleCambiarPassword}>
            Cambiar contraseña
          </button>

        <div>
          {/* Espacio vacío para alinear */}
        </div>
      </div>

        <button type="submit" className="perfil__btn">Guardar cambios</button>
          {mensaje && <p className="perfil__mensaje">{mensaje}</p>}
        </form>
    </div>
  );
};

export default Perfil;
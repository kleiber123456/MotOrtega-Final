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

  const [errores, setErrores] = useState({});
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
    const { name, value } = e.target;
    setPerfil({ ...perfil, [name]: value });
    validarCampo(name, value);
  };

  const validarCampo = (name, value) => {
    let nuevoError = '';

    if (name === 'nombre' && value.trim().length < 3) {
      nuevoError = 'El nombre debe de tener al menos 3 caracteres.';
    } else if (name === 'apellido' && value.trim().length < 3) {
      nuevoError = 'El apellido debe de tener al menos 3 caracteres.';
    } else if (name === 'telefono' && value.trim().length < 10) {
      nuevoError = 'El teléfono debe tener al menos 10 números.';
    } else if (name === 'direccion' && value.trim().length<1){
      nuevoError = 'La direccion no puede estar vacia.';
    }

    setErrores((prevErrores) => ({
      ...prevErrores,
      [name]: nuevoError
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!perfil.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    } else if (perfil.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe de tener al menos 3 caracteres.';
    }

    if (!perfil.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es obligatorio.';
    } else if (perfil.apellido.trim().length < 3) {
      nuevosErrores.apellido = 'El apellido debe de tener al menos 3 caracteres.';
    }

    if (!perfil.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio.';
    } else if (perfil.telefono.trim().length < 10) {
      nuevosErrores.telefono = 'El teléfono debe tener al menos 10 números.';
    }
    if (!perfil.direccion.trim()){
      nuevosErrores.direccion = 'La direccion es obligatoria.';
    }else if (perfil.telefono.trim().length<1){
      nuevosErrores.direccion = 'La direccion es obligatoria'
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const soloNumeros = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  };

  const soloLetras = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
  };

  const actualizarPerfil = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos inválidos',
        text: 'Por favor corrige los errores antes de continuar.',
      });
      return;
    }

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
      }).then(() => navigate('/dashboard'));

      setPerfil(res.data);
    } catch (err) {
      const errorMsg = err.response?.status === 401
        ? 'Token inválido. No se pudo actualizar el perfil.'
        : 'No se pudo actualizar el perfil';
      setMensaje(errorMsg);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg
      });
    }
  };

  const handleCambiarPassword = () => navigate('/CambiarContraseña');

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
            <input
              autoComplete="off"
              maxLength={30}
              onInput={soloLetras}
              type="text"
              name="nombre"
              value={perfil.nombre || ''}
              onChange={handleChange}
              className={errores.nombre ? 'input-error' : ''}
              required/>
            {errores.nombre && <span className="perfil-validacion">{errores.nombre}</span>}
          </div>

          <div className="perfil__field">
            <label>Apellidos</label>
            <input
              autoComplete="off"
              maxLength={35}
              onInput={soloLetras}
              type="text"
              name="apellido"
              value={perfil.apellido || ''}
              onChange={handleChange}
              className={errores.apellido ? 'input-error' : ''}
            />
            {errores.apellido && <span className="perfil-validacion">{errores.apellido}</span>}
          </div>

          <div className="perfil__field">
            <label>Teléfono</label>
            <input
              autoComplete="off"
              maxLength={15}
              onInput={soloNumeros}
              type="text"
              name="telefono"
              value={perfil.telefono || ''}
              onChange={handleChange}
              className={errores.telefono ? 'input-error' : ''}
            />
            {errores.telefono && <span className="perfil-validacion">{errores.telefono}</span>}
          </div>

          <div className="perfil__field">
            <label>Tipo de Documento</label>
            <select disabled name="tipo_documento" value={perfil.tipo_documento || ''}>
              <option value="">Seleccionar</option>
              {tiposDocumento.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="perfil__field">
            <label>Documento</label>
            <input
              maxLength={15}
              disabled
              onInput={soloNumeros}
              type="text"
              name="documento"
              value={perfil.documento || ''}
              onChange={handleChange}
            />
          </div>

          <div className="perfil__field">
            <label>Dirección</label>
            <input
              autoComplete="off"
              maxLength={100}
              type="text"
              name="direccion"
              value={perfil.direccion || ''}
              onChange={handleChange}
            />
            {errores.direccion && <span className="perfil-validacion">{errores.direccion}</span>}
          </div>

          <div className="perfil__field">
            <label>Correo</label>
            <input
              maxLength={254}
              disabled
              type="email"
              name="correo"
              value={perfil.correo || ''}
              onChange={handleChange}
            />
          </div>

          <div className="perfil__field">
            <label>Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type="password"
                name="password"
                value={".................."}
                readOnly
                disabled
                className="perfil-input"
              />
            </div>
          </div>

          <button className="perfil__btn" type="button" onClick={handleCambiarPassword}>
            Cambiar contraseña
          </button>

          <div />
        </div>

        <button type="submit" className="perfil__btn">Guardar cambios</button>
        {mensaje && <p className="perfil__mensaje">{mensaje}</p>}
      </form>
    </div>
  );
};

export default Perfil;

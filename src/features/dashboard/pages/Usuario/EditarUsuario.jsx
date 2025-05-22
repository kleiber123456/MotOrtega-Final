import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../../../shared/styles/editarusuario.css';

function EditarUsuario() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const [usuario, setUsuario] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: '',
    documento: '',
    correo: '',
    telefono: '',
    direccion: '',
    estado: '',
    rol_id: '',
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/usuarios/${id}`, {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Error al obtener el usuario');
        const data = await res.json();
        setUsuario({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          tipo_documento: data.tipo_documento || '',
          documento: data.documento || '',
          correo: data.correo || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          estado: data.estado || '',
          rol_id: data.rol_id || '',
        });
        setCargando(false);
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };

    fetchUsuario();
  }, [id, token]);

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://api-final-8rw7.onrender.com/api/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
      });

      if (!res.ok) throw new Error('Error al actualizar usuario');

      Swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: 'El usuario ha sido actualizado correctamente',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/listarUsuarios');
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message
      });
    }
  };

  if (cargando) {
    return (
      <div className="contenedor">
        <h2 className="titulo">Cargando usuario...</h2>
        <div className="linea-decorativa"></div>
        <p style={{ textAlign: 'center' }}>Por favor, espera.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contenedor">
        <h2 className="titulo">Error</h2>
        <div className="linea-decorativa"></div>
        <p style={{ textAlign: 'center', color: '#721c24' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="contenedor">
      <h2 className="titulo">Editar Usuario</h2>
      <div className="linea-decorativa"></div>
      
      <form onSubmit={handleSubmit} className="formulario">
        <div className="grid">
          <div className="columna">
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={usuario.nombre}
              onChange={handleChange}
              className="input"
              required
            />

            <label>Apellido:</label>
            <input
              type="text"
              name="apellido"
              value={usuario.apellido}
              onChange={handleChange}
              className="input"
              required
            />

            <label>Tipo Documento:</label>
            <select
              name="tipo_documento"
              value={usuario.tipo_documento}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="Cedula de Ciudadania">Cédula de Ciudadanía</option>
              <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
            </select>

            <label>Documento:</label>
            <input
              type="text"
              name="documento"
              value={usuario.documento}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="columna">
            <label>Correo:</label>
            <input
              type="email"
              name="correo"
              value={usuario.correo}
              onChange={handleChange}
              className="input"
              required
            />

            <label>Teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={usuario.telefono}
              onChange={handleChange}
              className="input"
            />

            <label>Dirección:</label>
            <input
              type="text"
              name="direccion"
              value={usuario.direccion}
              onChange={handleChange}
              className="input"
            />

            <label>Estado:</label>
            <select
              name="estado"
              value={usuario.estado}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Seleccionar estado</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="botones">
          <button type="submit" className="btn-primario">
            <i className="fas fa-save"></i>
            Guardar Cambios
          </button>
          <button
            type="button"
            onClick={() => navigate('/listarUsuarios')}
            className="btn-secundario"
          >
            <i className="fas fa-arrow-left"></i>
            Volver a la Lista
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarUsuario;
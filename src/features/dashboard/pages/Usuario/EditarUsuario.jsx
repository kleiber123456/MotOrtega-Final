import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

      alert('Usuario actualizado correctamente');
      navigate('/listarUsuarios');
    } catch (err) {
      alert(err.message);
    }
  };

  if (cargando) return <p>Cargando usuario...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="ReUs-contenedor">
      <h2 className="ReUs-titulo">Editar Usuario</h2>
      <form onSubmit={handleSubmit} className="ReUs-formulario">
        <div className="ReUs-grid">
          <div className="ReUs-columna">
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={usuario.nombre}
              onChange={handleChange}
              className="ReUs-input"
              required
            />

            <label>Apellido:</label>
            <input
              type="text"
              name="apellido"
              value={usuario.apellido}
              onChange={handleChange}
              className="ReUs-input"
              required
            />

            <label>Tipo Documento:</label>
            <input
              type="text"
              name="tipo_documento"
              value={usuario.tipo_documento}
              onChange={handleChange}
              className="ReUs-input"
              required
            />

            <label>Documento:</label>
            <input
              type="text"
              name="documento"
              value={usuario.documento}
              onChange={handleChange}
              className="ReUs-input"
              required
            />
          </div>

          <div className="ReUs-columna">
            <label>Correo:</label>
            <input
              type="email"
              name="correo"
              value={usuario.correo}
              onChange={handleChange}
              className="ReUs-input"
              required
            />

            <label>Teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={usuario.telefono}
              onChange={handleChange}
              className="ReUs-input"
            />

            <label>Dirección:</label>
            <input
              type="text"
              name="direccion"
              value={usuario.direccion}
              onChange={handleChange}
              className="ReUs-input"
            />

            <label>Estado:</label>
            <input
              type="text"
              name="estado"
              value={usuario.estado}
              onChange={handleChange}
              className="ReUs-input"
              required
            />

            <label>Rol ID:</label>
            <input
              type="text"
              name="rol_id"
              value={usuario.rol_id}
              onChange={handleChange}
              className="ReUs-input"
              required
            />
          </div>
        </div>

        <button type="submit" className="ReUs-boton">Guardar Cambios</button>
        <button
          type="button"
          onClick={() => navigate('/listarUsuarios')}
          className="ReUs-boton"
          style={{ backgroundColor: '#888', marginLeft: '10px' }}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default EditarUsuario;

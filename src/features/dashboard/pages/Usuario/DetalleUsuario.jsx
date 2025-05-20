import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../../../shared/styles/editarusuario.css'; // Importa el CSS compartido

function DetalleUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const [usuario, setUsuario] = useState(null);
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
        setUsuario(data);
        setCargando(false);
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };

    fetchUsuario();
  }, [id, token]);

  if (cargando) return <p className="ReUs-titulo">Cargando detalles del usuario...</p>;
  if (error) return <p className="ReUs-titulo">Error: {error}</p>;
  if (!usuario) return <p className="ReUs-titulo">No se encontró el usuario.</p>;

  return (
    <div className="ReUs-contenedor">
      <h2 className="ReUs-titulo">Detalle del Usuario</h2>
      <div className="ReUs-formulario">
        <div className="ReUs-grid">
          <div className="ReUs-columna">
            <p><strong>Nombre completo:</strong> {usuario.nombre} {usuario.apellido}</p>
            <p><strong>Tipo documento:</strong> {usuario.tipo_documento}</p>
            <p><strong>Documento:</strong> {usuario.documento}</p>
            <p><strong>Correo:</strong> {usuario.correo}</p>
          </div>
          <div className="ReUs-columna">
            <p><strong>Teléfono:</strong> {usuario.telefono}</p>
            <p><strong>Dirección:</strong> {usuario.direccion}</p>
            <p><strong>Estado:</strong> {usuario.estado}</p>
          </div>
        </div>

        <button
          className="ReUs-boton"
          onClick={() => navigate('/listarUsuarios')}
        >
          Volver al listado
        </button>
      </div>
    </div>
  );
}

export default DetalleUsuario;

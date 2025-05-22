import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../../../shared/styles/DetalleUsuario.css';

function DetalleUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      setCargando(true);
      setError(null);

      try {
        if (!token) {
          setError("No autorizado: Token no encontrado.");
          return;
        }

        const res = await fetch(`https://api-final-8rw7.onrender.com/api/usuarios/${id}`, {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("No autorizado: Sesión expirada o sin permisos.");
          } else if (res.status === 404) {
            throw new Error("Usuario no encontrado.");
          } else {
            throw new Error("Error al obtener los detalles del usuario.");
          }
        }

        const data = await res.json();
        setUsuario(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchUsuario();
  }, [id, token]);

  if (cargando) {
    return (
      <div className="detalle-contenedor">
        <h2 className="titulo">Cargando detalles del usuario...</h2>
        <div className="detalle-linea"></div>
        <p className="detalle-usuario-mensaje">Por favor, espera.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalle-contenedor">
        <h2 className="titulo">Error</h2>
        <div className="detalle-linea"></div>
        <p className="detalle-usuario-mensaje error">{error}</p>
        <div className="botones">
          <button className="btn-secundario" onClick={() => navigate('/listarUsuarios')}>
            <i className="fas fa-arrow-left"></i>
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="detalle-contenedor">
        <h2 className="titulo">Usuario no disponible</h2>
        <div className="detalle-linea"></div>
        <p className="detalle-usuario-mensaje">No se pudo cargar la información del usuario.</p>
        <div className="botones">
          <button className="btn-secundario" onClick={() => navigate('/listarUsuarios')}>
            <i className="fas fa-arrow-left"></i>
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-contenedor">
      <h2 className="titulo">Detalle del Usuario</h2>
      <div className="detalle-linea"></div>

      <div className="info-grid">
        <div className="columna">
          <p>
            <i className="fas fa-user icono"></i>
            <strong>Nombre completo:</strong> {usuario.nombre} {usuario.apellido}
          </p>
          <p>
            <i className="fas fa-id-card icono"></i>
            <strong>Tipo documento:</strong> {usuario.tipo_documento}
          </p>
          <p>
            <i className="fas fa-address-card icono"></i>
            <strong>Documento:</strong> {usuario.documento}
          </p>
          <p>
            <i className="fas fa-envelope icono"></i>
            <strong>Correo:</strong> {usuario.correo}
          </p>
        </div>
        <div className="columna">
          <p>
            <i className="fas fa-phone icono"></i>
            <strong>Teléfono:</strong> {usuario.telefono}
          </p>
          <p>
            <i className="fas fa-map-marker-alt icono"></i>
            <strong>Dirección:</strong> {usuario.direccion}
          </p>
          <p>
            <i className="fas fa-toggle-on icono"></i>
            <strong>Estado:</strong> {usuario.estado}
          </p>
        </div>
      </div>

      <div className="botones">
        <button className="btn-primario" onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}>
          <i className="fas fa-edit"></i>
          Editar Usuario
        </button>
        <button className="btn-secundario" onClick={() => navigate('/listarUsuarios')}>
          <i className="fas fa-arrow-left"></i>
          Volver al listado
        </button>
      </div>
    </div>
  );
}

export default DetalleUsuario;
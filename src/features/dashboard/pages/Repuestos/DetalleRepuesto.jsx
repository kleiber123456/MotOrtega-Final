import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../../../shared/styles/DetalleUsuario.css';

function DetalleRepuesto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const [repuesto, setRepuesto] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepuesto = async () => {
      setCargando(true);
      setError(null);

      try {
        if (!token) {
          setError("No autorizado: Token no encontrado.");
          return;
        }

        // Obtener datos del repuesto
        const resRepuesto = await fetch(`https://api-final-8rw7.onrender.com/api/repuestos/${id}`, {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });

        if (!resRepuesto.ok) {
          if (resRepuesto.status === 401) {
            throw new Error("No autorizado: Sesión expirada o sin permisos.");
          } else if (resRepuesto.status === 404) {
            throw new Error("Repuesto no encontrado.");
          } else {
            throw new Error("Error al obtener los detalles del repuesto.");
          }
        }

        const dataRepuesto = await resRepuesto.json();
        setRepuesto(dataRepuesto);

        // Obtener categorías para mostrar el nombre de la categoría
        if (dataRepuesto.categoria_repuesto_id) {
          const resCategorias = await fetch("https://api-final-8rw7.onrender.com/api/categorias-repuestos", {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          });

          if (resCategorias.ok) {
            const dataCategorias = await resCategorias.json();
            const categoriaEncontrada = dataCategorias.find(cat => cat.id === dataRepuesto.categoria_repuesto_id);
            setCategoria(categoriaEncontrada ? categoriaEncontrada.nombre : 'Sin categoría');
          } else {
            setCategoria('Sin categoría');
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchRepuesto();
  }, [id, token]);

  // Función para formatear el precio
  const formatearPrecio = (precio) => {
    if (!precio) return "$0.00";
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(precio);
  };

  if (cargando) {
    return (
      <div className="detalle-contenedor">
        <h2 className="titulo">Cargando detalles del repuesto...</h2>
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
          <button className="btn-secundario" onClick={() => navigate('/Repuestos')}>
            <i className="fas fa-arrow-left"></i>
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  if (!repuesto) {
    return (
      <div className="detalle-contenedor">
        <h2 className="titulo">Repuesto no disponible</h2>
        <div className="detalle-linea"></div>
        <p className="detalle-usuario-mensaje">No se pudo cargar la información del repuesto.</p>
        <div className="botones">
          <button className="btn-secundario" onClick={() => navigate('/Repuestos')}>
            <i className="fas fa-arrow-left"></i>
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-contenedor">
      <h2 className="titulo">Detalle del Repuesto</h2>
      <div className="detalle-linea"></div>

      <div className="info-grid">
        <div className="columna">
          <p>
            <i className="fas fa-cog icono"></i>
            <strong>Nombre:</strong> {repuesto.nombre}
          </p>
          <p>
            <i className="fas fa-file-alt icono"></i>
            <strong>Descripción:</strong> {repuesto.descripcion || 'Sin descripción'}
          </p>
          <p>
            <i className="fas fa-tags icono"></i>
            <strong>Categoría:</strong> {categoria}
          </p>
          <p>
            <i className="fas fa-cubes icono"></i>
            <strong>Cantidad:</strong> {repuesto.cantidad || 0}
          </p>
        </div>
        <div className="columna">
          <p>
            <i className="fas fa-dollar-sign icono"></i>
            <strong>Precio Unitario:</strong> {formatearPrecio(repuesto.preciounitario)}
          </p>
          <p>
            <i className="fas fa-calculator icono"></i>
            <strong>Total:</strong> {formatearPrecio(repuesto.total)}
          </p>
          <p>
            <i className="fas fa-toggle-on icono"></i>
            <strong>Estado:</strong> {repuesto.estado}
          </p>
          <p>
            <i className="fas fa-calendar icono"></i>
            <strong>Fecha creación:</strong> {repuesto.created_at ? new Date(repuesto.created_at).toLocaleDateString('es-CO') : 'N/A'}
          </p>
        </div>
      </div>

      <div className="botones">
        <button className="btn-primario" onClick={() => navigate(`/repuestos/editar/${repuesto.id}`)}>
          <i className="fas fa-edit"></i>
          Editar Repuesto
        </button>
        <button className="btn-secundario" onClick={() => navigate('/Repuestos')}>
          <i className="fas fa-arrow-left"></i>
          Volver al listado
        </button>
      </div>
    </div>
  );
}

export default DetalleRepuesto;
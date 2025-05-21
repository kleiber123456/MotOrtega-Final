import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import '../../../../shared/styles/DetalleProveedor.css';

const DetalleProveedor = () => {
  const { id } = useParams();
  const [proveedor, setProveedor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    const fetchProveedor = async () => {
      setCargando(true);
      setError(null);
      try {
        if (!token) {
          setError("No autorizado: Token de autenticación no encontrado.");
          return;
        }

        const response = await axios.get(
          `https://api-final-8rw7.onrender.com/api/proveedores/${id}`,
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          }
        );

        setProveedor(response.data);
      } catch (err) {
        console.error("Error al obtener proveedor:", err);
        if (err.response && err.response.status === 401) {
          setError("No autorizado: La sesión ha expirado o no tienes permisos.");
        } else if (err.response && err.response.status === 404) {
          setError("Proveedor no encontrado.");
        } else {
          setError(err.message || "Error al cargar los detalles del proveedor.");
        }
      } finally {
        setCargando(false);
      }
    };

    fetchProveedor();
  }, [id, token]);

  if (cargando) {
    return (
      <div className="detalle-proveedor-contenedor">
        <h2 className="detalle-proveedor-titulo">Cargando detalles...</h2>
        <p className="detalle-proveedor-mensaje">Por favor, espera.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalle-proveedor-contenedor">
        <h2 className="detalle-proveedor-titulo">Error</h2>
        <p className="detalle-proveedor-mensaje error">{error}</p>
        <div className="detalle-proveedor-boton-contenedor">
          <Link to="/ListarProveedores" className="detalle-proveedor-boton secondary">
            Volver a la Lista
          </Link>
        </div>
      </div>
    );
  }

  if (!proveedor) {
    return (
      <div className="detalle-proveedor-contenedor">
        <h2 className="detalle-proveedor-titulo">Proveedor no disponible</h2>
        <p className="detalle-proveedor-mensaje">No se pudo cargar la información del proveedor.</p>
        <div className="detalle-proveedor-boton-contenedor">
          <Link to="/ListarProveedores" className="detalle-proveedor-boton secondary">
            Volver a la Lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-proveedor-contenedor">
      <h1 className="detalle-proveedor-titulo">Detalle del Proveedor</h1>

      <div className="detalle-proveedor-info-grid">
        <p className="detalle-proveedor-campo">
          <i className="fas fa-user-tie"></i> <strong>Nombre:</strong> {proveedor.nombre}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-phone"></i> <strong>Teléfono:</strong> {proveedor.telefono}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-building"></i> <strong>Empresa:</strong> {proveedor.nombre_empresa}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-id-card"></i> <strong>NIT:</strong> {proveedor.nit}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-map-marker-alt"></i> <strong>Dirección:</strong> {proveedor.direccion}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-toggle-on"></i> <strong>Estado:</strong> {proveedor.estado}
        </p>
      </div>

      <div className="detalle-proveedor-boton-contenedor">
        <Link to={`/EditarProveedor/editar/${id}`} className="detalle-proveedor-boton">
          <i className="fas fa-edit"></i> Editar Proveedor
        </Link>
        <Link to="/ListarProveedores" className="detalle-proveedor-boton secondary">
          <i className="fas fa-arrow-left"></i> Volver a la Lista
        </Link>
      </div>
    </div>
  );
};

export default DetalleProveedor;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../../../shared/styles/listarUsuarios.css';

function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    document.body.style.backgroundColor = "#2d3748";
    fetchUsuarios();
    return () => { document.body.style.background = ""; };
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("https://api-final-8rw7.onrender.com/api/usuarios", {
        headers: {
          "Authorization": `${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error("Error al obtener usuarios");

      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setUsuarios([]); // evita el error en .filter
    }
  };

  const handleSearch = (e) => {
    setBusqueda(e.target.value.toLowerCase());
  };

  const usuariosFiltrados = Array.isArray(usuarios) ? usuarios.filter(u =>
    Object.values(u).some(val =>
      String(val).toLowerCase().includes(busqueda)
    )
  ) : [];

  return (
    <div className="LiUs-contenedor">
      <div className="LiUs-header">
        <h2 className="LiUs-titulo">Listado de Usuarios</h2>
        <button className="LiUs-boton-crear" onClick={() => navigate("/crearUsuarios")}>
          Crear Usuario
        </button>
      </div>

      <input
        type="text"
        className="LiUs-input-busqueda"
        placeholder="Buscar por cualquier campo..."
        value={busqueda}
        onChange={handleSearch}
      />

      <div className="LiUs-tabla-container">
        <table className="LiUs-tabla">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Tipo documento</th>
              <th>Documento</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.nombre} {usuario.apellido}</td>
                <td>{usuario.tipo_documento}</td>
                <td>{usuario.documento}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.telefono}</td>
                <td>{usuario.rol_nombre}</td>
                <td>{usuario.estado}</td>
                <td>
                  <button
                    className="LiUs-boton-accion LiUs-editar"
                    onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="LiUs-boton-accion LiUs-eliminar"
                    onClick={() => navigate(`/usuarios/eliminar/${usuario.id}`)}
                  >
                    Eliminar
                  </button>
                  <button
                    className="LiUs-boton-accion LiUs-detalle"
                    onClick={() => navigate(`/usuarios/detalle/${usuario.id}`)}
                  >
                    Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {usuariosFiltrados.length === 0 && <p className="LiUs-sin-resultados">No se encontraron usuarios.</p>}
      </div>
    </div>
  );
}

export default ListarUsuarios;

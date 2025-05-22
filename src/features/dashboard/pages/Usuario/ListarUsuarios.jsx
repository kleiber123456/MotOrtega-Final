import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import '../../../../shared/styles/listarUsuarios.css';

function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuariosPorPagina] = useState(5);
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
      console.log("Usuarios obtenidos de la API:", data);
      setUsuarios(data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setUsuarios([]);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!id) {
      Swal.fire("Error", "ID de usuario inválido", "error");
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará al usuario permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`https://api-final-8rw7.onrender.com/api/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al eliminar el usuario: ${res.status} - ${errorText}`);
      }

      setUsuarios(prev => prev.filter(usuario => usuario.id !== id));

      Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");

    } catch (err) {
      console.error("Error al eliminar el usuario:", err);
      Swal.fire("Error", "No se pudo eliminar el usuario", "error");
    }
  };

  const cambiarEstado = async (id) => {
    try {
      console.log("Cambiando estado del usuario con ID:", id);
      
      const res = await fetch(`https://api-final-8rw7.onrender.com/api/usuarios/${id}/cambiar-estado`, {
        method: "PUT",
        headers: {
          "Authorization": `${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);
        throw new Error("Error al cambiar el estado");
      }

      const responseData = await res.json();
      console.log("Respuesta del servidor:", responseData);

      // Actualizar estado localmente
      setUsuarios(prev =>
        prev.map(u =>
          u.id === id
            ? { ...u, estado: u.estado?.toLowerCase() === "activo" ? "Inactivo" : "Activo" }
            : u
        )
      );

      Swal.fire("Éxito", "Estado cambiado correctamente", "success");
      
    } catch (err) {
      console.error("Error al cambiar el estado:", err);
      Swal.fire("Error", "No se pudo cambiar el estado del usuario", "error");
    }
  };

  const handleSearch = (e) => {
    setBusqueda(e.target.value.toLowerCase());
    setPaginaActual(1);
  };

  const usuariosFiltrados = Array.isArray(usuarios) ? usuarios.filter(u =>
    Object.values(u).some(val =>
      String(val).toLowerCase().includes(busqueda)
    )
  ) : [];

  const indiceUltimoUsuario = paginaActual * usuariosPorPagina;
  const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina;
  const usuariosActuales = usuariosFiltrados.slice(indicePrimerUsuario, indiceUltimoUsuario);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

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
            {usuariosActuales.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.nombre} {usuario.apellido}</td>
                <td>{usuario.tipo_documento}</td>
                <td>{usuario.documento}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.telefono}</td>
                <td>{usuario.rol_nombre}</td>
                <td>
                  <div
                    className={`estado-switch ${usuario.estado?.toLowerCase() === "activo" ? "activo" : "inactivo"}`}
                    onClick={() => cambiarEstado(usuario.id)}
                    title={`Estado: ${usuario.estado}`}
                  >
                    <div className="switch-bola"></div>
                  </div>
                  <small style={{display: 'block', marginTop: '4px', fontSize: '10px', color: '#666'}}>
          
                  </small>
                </td>
                <td className="LiUs-acciones">
                  <button
                    className="icon-button edit"
                    onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    className="icon-button delete"
                    onClick={() => eliminarUsuario(usuario.id)}
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    className="icon-button detail"
                    onClick={() => navigate(`/usuarios/detalle/${usuario.id}`)}
                    title="Detalle"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuariosFiltrados.length === 0 && (
          <p className="LiUs-sin-resultados">No se encontraron usuarios.</p>
        )}

        {usuariosFiltrados.length > usuariosPorPagina && (
          <div className="LiUs-paginacion">
            <button 
              onClick={() => cambiarPagina(paginaActual - 1)} 
              disabled={paginaActual === 1}
              className="LiUs-boton-paginacion"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => cambiarPagina(i + 1)}
                className={`LiUs-boton-paginacion ${paginaActual === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => cambiarPagina(paginaActual + 1)} 
              disabled={paginaActual === totalPaginas}
              className="LiUs-boton-paginacion"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListarUsuarios;
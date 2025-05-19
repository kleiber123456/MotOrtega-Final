import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import '../../../../shared/styles/listarCategoriaRepuesto.css';

function ListarCategoriasRepuesto() {
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [categoriasPorPagina] = useState(5);
  const navigate = useNavigate();

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    document.body.style.backgroundColor = "#2d3748";
    fetchCategorias();
    return () => { document.body.style.background = ""; };
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await fetch("https://api-final-8rw7.onrender.com/api/categorias-repuestos", {
        headers: {
          "Authorization": `${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error("Error al obtener categorías");

      const data = await res.json();
      setCategorias(data);
    } catch (err) {
      console.error("Error al obtener categorías:", err);
      setCategorias([]);
    }
  };

  const cambiarEstadoCategoria = async (id) => {
    try {
      const res = await fetch(`https://api-final-8rw7.onrender.com/api/categorias-repuestos/${id}/cambiar-estado`, {
        method: "PUT",
        headers: {
          "Authorization": `${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error("Error al cambiar el estado");

      // Actualizar estado localmente
      setCategorias(prev =>
        prev.map(cat =>
          cat.id === id
            ? { ...cat, estado: cat.estado === "Activo" ? "Inactivo" : "Activo" }
            : cat
        )
      );
    } catch (err) {
      console.error("Error al cambiar el estado:", err);
      Swal.fire("Error", "No se pudo cambiar el estado", "error");
    }
  };

  const eliminarCategoria = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la categoría permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`https://api-final-8rw7.onrender.com/api/categorias-repuestos/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error("Error al eliminar la categoría");

      setCategorias(prev => prev.filter(c => c.id !== id));
      Swal.fire("Eliminado", "Categoría eliminada correctamente", "success");

    } catch (err) {
      console.error("Error al eliminar la categoría:", err);
      Swal.fire("Error", "No se pudo eliminar la categoría", "error");
    }
  };

  const handleSearch = (e) => {
    setBusqueda(e.target.value.toLowerCase());
    setPaginaActual(1);
  };

  const categoriasFiltradas = categorias.filter(c =>
    c.nombre.toLowerCase().includes(busqueda) || 
    c.estado.toLowerCase().includes(busqueda)
  );

  const indiceUltimaCategoria = paginaActual * categoriasPorPagina;
  const indicePrimeraCategoria = indiceUltimaCategoria - categoriasPorPagina;
  const categoriasActuales = categoriasFiltradas.slice(indicePrimeraCategoria, indiceUltimaCategoria);
  const totalPaginas = Math.ceil(categoriasFiltradas.length / categoriasPorPagina);

  return (
    <div className="LiUs-contenedor">
      <div className="LiUs-header">
        <h2 className="LiUs-titulo">Listado de Categorías de Repuestos</h2>
        <button className="LiUs-boton-crear" onClick={() => navigate("/crearCategoriaRepuesto")}>
          Crear Categoría
        </button>
      </div>

      <input
        type="text"
        className="LiUs-input-busqueda"
        placeholder="Buscar por nombre o estado..."
        value={busqueda}
        onChange={handleSearch}
      />

      <div className="LiUs-tabla-container">
        <table className="LiUs-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasActuales.map(categoria => (
              <tr key={categoria.id}>
                <td>{categoria.nombre}</td>
                <td>
                  <button
                    onClick={() => cambiarEstadoCategoria(categoria.id)}
                    className={`estado-toggle ${categoria.estado === "Activo" ? "activo" : "inactivo"}`}
                    title="Cambiar estado"
                  >
                    {categoria.estado === "Activo" ? "🟢 Activo" : "🔴 Inactivo"}
                  </button>
                </td>
                <td className="LiUs-acciones">
                  <button
                    className="icon-button edit"
                    onClick={() => navigate(`/categorias-repuesto/editar/${categoria.id}`)}
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    className="icon-button delete"
                    onClick={() => eliminarCategoria(categoria.id)}
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categoriasFiltradas.length === 0 && (
          <p className="LiUs-sin-resultados">No se encontraron categorías.</p>
        )}

        {categoriasFiltradas.length > categoriasPorPagina && (
          <div className="LiUs-paginacion">
            <button 
              onClick={() => setPaginaActual(paginaActual - 1)} 
              disabled={paginaActual === 1}
              className="LiUs-boton-paginacion"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`LiUs-boton-paginacion ${paginaActual === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => setPaginaActual(paginaActual + 1)} 
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

export default ListarCategoriasRepuesto;

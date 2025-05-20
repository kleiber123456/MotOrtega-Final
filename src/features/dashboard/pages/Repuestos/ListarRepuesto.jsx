import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import "../../../../shared/styles/listarCategoriaRepuesto.css";

function ListarRepuestos() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const [repuestos, setRepuestos] = useState([]);
  const [categorias, setCategorias] = useState({});
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [listaCategoriasCompleta, setListaCategoriasCompleta] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [repuestosPorPagina] = useState(5);

  useEffect(() => {
    document.body.style.backgroundColor = "#2d3748";
    cargarDatos();
    return () => {
      document.body.style.background = "";
    };
  }, [token]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar categorías
      const resCategorias = await fetch("https://api-final-8rw7.onrender.com/api/categorias-repuestos", {
        method: "GET",
        headers: {
          "Authorization": token,
        },
      });

      if (!resCategorias.ok) throw new Error("Error al cargar las categorías");
      
      const dataCategorias = await resCategorias.json();
      setListaCategoriasCompleta(dataCategorias);
      
      // Crear un objeto para buscar categorías rápidamente por ID
      const categoriasMap = {};
      dataCategorias.forEach(cat => {
        categoriasMap[cat.id] = cat.nombre;
      });
      setCategorias(categoriasMap);
      
      // Cargar repuestos
      const resRepuestos = await fetch("https://api-final-8rw7.onrender.com/api/repuestos", {
        method: "GET",
        headers: {
          "Authorization": token,
        },
      });

      if (!resRepuestos.ok) throw new Error("Error al cargar los repuestos");
      
      const dataRepuestos = await resRepuestos.json();
      setRepuestos(dataRepuestos);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`https://api-final-8rw7.onrender.com/api/repuestos/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": token,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar el repuesto");

      setRepuestos(prev => prev.filter(rep => rep.id !== id));
      Swal.fire("Eliminado", "El repuesto ha sido eliminado", "success");
    } catch (error) {
      console.error("Error al eliminar el repuesto:", error);
      Swal.fire("Error", "No se pudo eliminar el repuesto", "error");
    }
  };

  const handleSearch = (e) => {
    setBusqueda(e.target.value.toLowerCase());
    setPaginaActual(1);
  };

  // Filtrar repuestos por búsqueda y categoría
  const repuestosFiltrados = repuestos.filter(rep => {
    const matchNombre = rep.nombre.toLowerCase().includes(busqueda);
    const matchCategoria = categoriaFiltro === "" || rep.categoria_repuesto_id.toString() === categoriaFiltro;
    return matchNombre && matchCategoria;
  });

  // Paginación
  const indiceUltimoRepuesto = paginaActual * repuestosPorPagina;
  const indicePrimerRepuesto = indiceUltimoRepuesto - repuestosPorPagina;
  const repuestosActuales = repuestosFiltrados.slice(indicePrimerRepuesto, indiceUltimoRepuesto);
  const totalPaginas = Math.ceil(repuestosFiltrados.length / repuestosPorPagina);

  if (cargando) {
    return (
      <div className="LiUs-contenedor">
        <p>Cargando repuestos...</p>
      </div>
    );
  }

  return (
    <div className="LiUs-contenedor">
      <div className="LiUs-header">
        <h2 className="LiUs-titulo">Listado de Repuestos</h2>
        <button className="LiUs-boton-crear" onClick={() => navigate("/crearRepuestos")}>
          Crear Repuesto
        </button>
      </div>

      <div className="filtros-container">
        <input
          type="text"
          className="LiUs-input-busqueda"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={handleSearch}
        />

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="LiUs-input-busqueda"
        >
          <option value="">Todas las categorías</option>
          {listaCategoriasCompleta.map((cat) => (
            <option key={cat.id} value={cat.id.toString()}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="LiUs-tabla-container">
        <table className="LiUs-tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {repuestosActuales.map((repuesto) => (
              <tr key={repuesto.id}>
                <td>{repuesto.id}</td>
                <td>{repuesto.nombre}</td>
                <td>{repuesto.cantidad}</td>
                <td>{categorias[repuesto.categoria_repuesto_id] || "Sin categoría"}</td>
                <td className="LiUs-acciones">
                  <button
                    className="icon-button edit"
                    onClick={() => navigate(`/editar-repuesto/${repuesto.id}`)}
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    className="icon-button delete"
                    onClick={() => handleEliminar(repuesto.id)}
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {repuestosFiltrados.length === 0 && (
          <p className="LiUs-sin-resultados">No se encontraron repuestos con los criterios de búsqueda.</p>
        )}

        {repuestosFiltrados.length > repuestosPorPagina && (
          <div className="LiUs-paginacion">
            <button
              onClick={() => setPaginaActual((prev) => prev - 1)}
              disabled={paginaActual === 1}
              className="LiUs-boton-paginacion"
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                className={`LiUs-boton-paginacion ${paginaActual === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((prev) => prev + 1)}
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

export default ListarRepuestos;
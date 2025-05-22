import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Eye } from "lucide-react";
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
  const [estadoFiltro, setEstadoFiltro] = useState("");
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

  const handleCambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    
    try {
      const res = await fetch(`https://api-final-8rw7.onrender.com/api/repuestos/estado/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) throw new Error("Error al actualizar el estado");

      // Actualizar el estado local
      setRepuestos(prev => prev.map(rep => 
        rep.id === id ? { ...rep, estado: nuevoEstado } : rep
      ));

      Swal.fire({
        title: "Estado actualizado",
        text: `El repuesto ahora está ${nuevoEstado.toLowerCase()}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
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

  // Filtrar repuestos por búsqueda, categoría y estado
  const repuestosFiltrados = repuestos.filter(rep => {
    const matchNombre = rep.nombre.toLowerCase().includes(busqueda);
    const matchDescripcion = rep.descripcion ? rep.descripcion.toLowerCase().includes(busqueda) : false;
    const matchBusqueda = matchNombre || matchDescripcion;
    const matchCategoria = categoriaFiltro === "" || rep.categoria_repuesto_id.toString() === categoriaFiltro;
    const matchEstado = estadoFiltro === "" || rep.estado === estadoFiltro;
    return matchBusqueda && matchCategoria && matchEstado;
  });

  // Paginación
  const indiceUltimoRepuesto = paginaActual * repuestosPorPagina;
  const indicePrimerRepuesto = indiceUltimoRepuesto - repuestosPorPagina;
  const repuestosActuales = repuestosFiltrados.slice(indicePrimerRepuesto, indiceUltimoRepuesto);
  const totalPaginas = Math.ceil(repuestosFiltrados.length / repuestosPorPagina);

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

      {/* Filtros organizados horizontalmente */}
      <div className="filtros-container-horizontal">
        <div className="filtro-item">
          <label className="filtro-label">Buscar:</label>
          <input
            type="text"
            className="LiUs-input-busqueda filtro-input"
            placeholder="Buscar por nombre o descripción..."
            value={busqueda}
            onChange={handleSearch}
          />
        </div>

        <div className="filtro-item">
          <label className="filtro-label">Categoría:</label>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="LiUs-input-busqueda filtro-select"
          >
            <option value="">Todas las categorías</option>
            {listaCategoriasCompleta.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-item">
          <label className="filtro-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="LiUs-input-busqueda filtro-select"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="LiUs-tabla-container" style={{ overflowX: 'auto' }}>
        <table className="LiUs-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {repuestosActuales.map((repuesto) => (
              <tr key={repuesto.id}>
                <td>{repuesto.nombre}</td>
                <td title={repuesto.descripcion || "Sin descripción"}>
                  {repuesto.descripcion ? 
                    (repuesto.descripcion.length > 50 ? 
                      repuesto.descripcion.substring(0, 50) + "..." : 
                      repuesto.descripcion) : 
                    "Sin descripción"
                  }
                </td>
                <td>{categorias[repuesto.categoria_repuesto_id] || "Sin categoría"}</td>
                <td>{repuesto.cantidad || 0}</td>
                <td>{formatearPrecio(repuesto.preciounitario)}</td>
                <td>{formatearPrecio(repuesto.total)}</td>
                <td>
                  <div 
                    className={`estado-switch ${repuesto.estado === 'Activo' ? 'activo' : 'inactivo'}`}
                    onClick={() => handleCambiarEstado(repuesto.id, repuesto.estado)}
                    title={`Cambiar a ${repuesto.estado === 'Activo' ? 'Inactivo' : 'Activo'}`}
                    data-estado={repuesto.estado || 'Sin estado'}
                  >
                    <div className="switch-bola"></div>
                  </div>
                </td>
                <td className="LiUs-acciones">
                  <button
                    className="icon-button edit"
                    onClick={() => navigate(`/repuestos/editar/${repuesto.id}`)}
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
                  <button
                    className="icon-button detail"
                    onClick={() => navigate(`/DetalleRepuesto/${repuesto.id}`)}
                    title="Detalle"
                  >
                    <Eye size={18} />
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
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import Swal from "sweetalert2";
import '../../../../shared/styles/crearCategoriaRepuesto.css';

// Componente del modal para categorías - separado del formulario principal
const CategoriaModal = ({ 
  show, 
  onClose, 
  categorias, 
  onSelect, 
  categoriaActual,
  posicionRef 
}) => {
  const [busquedaCategoria, setBusquedaCategoria] = useState("");
  const [categoriasPorPagina] = useState(5);
  const [paginaActualCategorias, setPaginaActualCategorias] = useState(1);
  const modalRef = useRef(null);

  // Reiniciar la búsqueda y página cuando se abre el modal
  useEffect(() => {
    if (show) {
      setBusquedaCategoria("");
      setPaginaActualCategorias(1);
    }
  }, [show]);

  // Manejar clic fuera del modal para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, onClose]);

  // Filtrar categorías según el texto de búsqueda
  const categoriasFiltradas = categorias.filter(categoria =>
    categoria.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase())
  );
  
  // Paginación para categorías
  const indiceUltimaCategoria = paginaActualCategorias * categoriasPorPagina;
  const indicePrimeraCategoria = indiceUltimaCategoria - categoriasPorPagina;
  const categoriasActuales = categoriasFiltradas.slice(indicePrimeraCategoria, indiceUltimaCategoria);
  const totalPaginasCategorias = Math.ceil(categoriasFiltradas.length / categoriasPorPagina);

  // Si no se debe mostrar, no renderizar nada
  if (!show) return null;

  // Calcular posición basada en el elemento de referencia
  const calcularEstilosPosicion = () => {
    if (!posicionRef.current) return {};
    
    const rect = posicionRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      top: `${rect.bottom + window.scrollY + 8}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      maxHeight: '350px',
      zIndex: 9999
    };
  };

  return (
    <div className="categoria-modal-overlay">
      <div 
        className="categoria-listado-dropdown" 
        ref={modalRef}
        style={calcularEstilosPosicion()}
      >
        <div className="categoria-busqueda">
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={busquedaCategoria}
            onChange={(e) => {
              setBusquedaCategoria(e.target.value);
              setPaginaActualCategorias(1);
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <Search size={18} className="search-icon" />
        </div>
        
        <div className="categoria-listado">
          {categoriasActuales.length > 0 ? (
            categoriasActuales.map((categoria) => (
              <div
                key={categoria.id}
                className={`categoria-item ${
                  categoriaActual === categoria.id.toString() ? "selected" : ""
                }`}
                onClick={() => onSelect(categoria)}
              >
                {categoria.nombre}
              </div>
            ))
          ) : (
            <div className="no-resultados">No se encontraron categorías</div>
          )}
        </div>
        
        {categoriasFiltradas.length > categoriasPorPagina && (
          <div className="categoria-paginacion">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPaginaActualCategorias((prev) => Math.max(prev - 1, 1));
              }}
              disabled={paginaActualCategorias === 1}
              className="boton-paginacion"
            >
              Anterior
            </button>
            
            <div className="pagina-info">
              {paginaActualCategorias} de {totalPaginasCategorias}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPaginaActualCategorias((prev) => Math.min(prev + 1, totalPaginasCategorias));
              }}
              disabled={paginaActualCategorias === totalPaginasCategorias}
              className="boton-paginacion"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function EditarRepuesto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [repuesto, setRepuesto] = useState({
    nombre: "",
    cantidad: 0,
    categoria_repuesto_id: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  
  // Estado para controlar el modal de categorías
  const [mostrarModalCategorias, setMostrarModalCategorias] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  
  // Ref para el input de categoría (para posicionar el modal)
  const categoriaInputRef = useRef(null);

  // Cargar datos del repuesto y categorías al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargandoInicial(true);
        
        // Cargar las categorías
        const resCategorias = await fetch("https://api-final-8rw7.onrender.com/api/categorias-repuestos", {
          method: "GET",
          headers: {
            "Authorization": token,
          },
        });

        if (!resCategorias.ok) throw new Error("Error al cargar las categorías");

        const dataCategorias = await resCategorias.json();
        // Filtrar solo las categorías activas
        const categoriasActivas = dataCategorias.filter(cat => cat.estado === "Activo");
        setCategorias(categoriasActivas);
        
        // Cargar los datos del repuesto a editar
        const resRepuesto = await fetch(`https://api-final-8rw7.onrender.com/api/repuestos/${id}`, {
          method: "GET",
          headers: {
            "Authorization": token,
          },
        });

        if (!resRepuesto.ok) {
          if (resRepuesto.status === 404) {
            Swal.fire("Error", "Repuesto no encontrado", "error");
            navigate("/repuestos");
            return;
          }
          throw new Error("Error al cargar el repuesto");
        }

        const dataRepuesto = await resRepuesto.json();
        setRepuesto({
          nombre: dataRepuesto.nombre,
          cantidad: dataRepuesto.cantidad,
          categoria_repuesto_id: dataRepuesto.categoria_repuesto_id.toString(),
        });
        
        // Establecer la categoría seleccionada para mostrarla en el input
        const categoriaActual = categoriasActivas.find(
          cat => cat.id.toString() === dataRepuesto.categoria_repuesto_id.toString()
        );
        if (categoriaActual) {
          setCategoriaSeleccionada(categoriaActual);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Swal.fire("Error", "No se pudieron cargar los datos del repuesto", "error");
        navigate("/repuestos");
      } finally {
        setCargandoInicial(false);
      }
    };

    cargarDatos();
  }, [token, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRepuesto((prev) => ({ ...prev, [name]: value }));
    validarCampo(name, value);
  };
  
  // Manejar la selección de una categoría
  const handleSeleccionarCategoria = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setRepuesto(prev => ({
      ...prev,
      categoria_repuesto_id: categoria.id.toString()
    }));
    setMostrarModalCategorias(false);
    validarCampo("categoria_repuesto_id", categoria.id.toString());
  };

  const validarCampo = (name, value) => {
    let error = "";

    if (name === "nombre") {
      if (!value.trim()) {
        error = "El nombre es obligatorio.";
      } else if (value.trim().length < 3) {
        error = "El nombre debe tener al menos 3 caracteres.";
      }
    }

    if (name === "cantidad") {
      if (value === "") {
        error = "La cantidad es obligatoria.";
      } else if (isNaN(value) || parseInt(value) < 0) {
        error = "La cantidad debe ser un número positivo.";
      }
    }

    if (name === "categoria_repuesto_id") {
      if (!value) {
        error = "Debe seleccionar una categoría.";
      }
    }

    setErrores((prev) => ({ ...prev, [name]: error }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!repuesto.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (repuesto.nombre.trim().length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres.";
    }

    if (repuesto.cantidad === "" || isNaN(repuesto.cantidad)) {
      nuevosErrores.cantidad = "La cantidad es obligatoria y debe ser un número.";
    } else if (parseInt(repuesto.cantidad) < 0) {
      nuevosErrores.cantidad = "La cantidad debe ser un número positivo.";
    }

    if (!repuesto.categoria_repuesto_id) {
      nuevosErrores.categoria_repuesto_id = "Debe seleccionar una categoría.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      Swal.fire({
        icon: "warning",
        title: "Campos inválidos",
        text: "Por favor corrige los errores antes de continuar.",
      });
      return;
    }

    try {
      setCargando(true);
      const res = await fetch(`https://api-final-8rw7.onrender.com/api/repuestos/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(repuesto),
      });

      if (!res.ok) throw new Error("Error al actualizar el repuesto");

      Swal.fire("Éxito", "Repuesto actualizado correctamente", "success");
      navigate("/repuestos");
    } catch (error) {
      console.error("Error al actualizar el repuesto:", error);
      Swal.fire("Error", "No se pudo actualizar el repuesto", "error");
    } finally {
      setCargando(false);
    }
  };

  if (cargandoInicial) {
    return (
      <div className="categoria-container">
        <div className="categoria-form">
          <h2>Cargando datos...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="categoria-container">
        <form className="categoria-form" onSubmit={handleSubmit}>
          <h2>Editar Repuesto</h2>

          <div className="campo">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={repuesto.nombre}
              onChange={handleChange}
              maxLength={45}
              className={errores.nombre ? "input-error" : ""}
              required
            />
            {errores.nombre && <span className="error-text">{errores.nombre}</span>}
          </div>

          <div className="campo">
            <label>Cantidad</label>
            <input
              type="number"
              name="cantidad"
              value={repuesto.cantidad}
              onChange={handleChange}
              min="0"
              className={errores.cantidad ? "input-error" : ""}
              required
            />
            {errores.cantidad && <span className="error-text">{errores.cantidad}</span>}
          </div>

          <div className="campo">
            <label>Categoría</label>
            <div className="categoria-selector">
              <input
                type="text"
                placeholder="Seleccione una categoría..."
                value={categoriaSeleccionada ? categoriaSeleccionada.nombre : ""}
                onClick={() => setMostrarModalCategorias(!mostrarModalCategorias)}
                readOnly
                className={errores.categoria_repuesto_id ? "input-error" : ""}
                ref={categoriaInputRef}
              />
              {errores.categoria_repuesto_id && (
                <span className="error-text">{errores.categoria_repuesto_id}</span>
              )}
            </div>
          </div>

          <button type="submit" disabled={cargando}>
            {cargando ? "Guardando..." : "Actualizar Repuesto"}
          </button>
        </form>
      </div>
      
      {/* Modal de categorías - Fuera del formulario */}
      <CategoriaModal
        show={mostrarModalCategorias}
        onClose={() => setMostrarModalCategorias(false)}
        categorias={categorias}
        onSelect={handleSeleccionarCategoria}
        categoriaActual={repuesto.categoria_repuesto_id}
        posicionRef={categoriaInputRef}
      />
    </>
  );
}

export default EditarRepuesto;
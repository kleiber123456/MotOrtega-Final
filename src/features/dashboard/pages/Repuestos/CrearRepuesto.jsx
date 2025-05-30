import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Swal from "sweetalert2";
import '../../../../shared/styles/crearCategoriaRepuesto.css';
import '../../../../shared/styles/Repuesto.css';

// Componente del modal para categorías
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
    <div className={`modal-categoria-overlay ${show ? 'modal-categoria-show' : 'modal-categoria-hide'}`}>
      <div 
        className="modal-categoria-dropdown" 
        ref={modalRef}
        style={calcularEstilosPosicion()}
      >
        <div className="modal-categoria-busqueda">
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
          <Search size={18} className="modal-categoria-search-icon" />
        </div>
        
        <div className="modal-categoria-listado">
          {categoriasActuales.length > 0 ? (
            categoriasActuales.map((categoria) => (
              <div
                key={categoria.id}
                className={`modal-categoria-item ${
                  categoriaActual === categoria.id.toString() ? "modal-categoria-selected" : ""
                }`}
                onClick={() => onSelect(categoria)}
              >
                {categoria.nombre}
              </div>
            ))
          ) : (
            <div className="modal-categoria-no-resultados">No se encontraron categorías</div>
          )}
        </div>
        
        {categoriasFiltradas.length > categoriasPorPagina && (
          <div className="modal-categoria-paginacion">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPaginaActualCategorias((prev) => Math.max(prev - 1, 1));
              }}
              disabled={paginaActualCategorias === 1}
              className="modal-categoria-boton-paginacion"
            >
              Anterior
            </button>
            
            <div className="modal-categoria-pagina-info">
              {paginaActualCategorias} de {totalPaginasCategorias}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPaginaActualCategorias((prev) => Math.min(prev + 1, totalPaginasCategorias));
              }}
              disabled={paginaActualCategorias === totalPaginasCategorias}
              className="modal-categoria-boton-paginacion"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function CrearRepuesto() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [repuesto, setRepuesto] = useState({
    nombre: "",
    descripcion: "",
    cantidad: 0,
    preciounitario: 0,
    estado: "Activo",
    categoria_repuesto_id: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  
  // Estado para controlar el modal de categorías
  const [mostrarModalCategorias, setMostrarModalCategorias] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  
  // Ref para el input de categoría (para posicionar el modal)
  const categoriaInputRef = useRef(null);

  // Cargar categorías de repuestos al montar el componente
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setCargando(true);
        const res = await fetch("https://api-final-8rw7.onrender.com/api/categorias-repuestos", {
          method: "GET",
          headers: {
            "Authorization": token,
          },
        });

        if (!res.ok) throw new Error("Error al cargar las categorías");

        const data = await res.json();
        // Filtrar solo las categorías activas
        const categoriasActivas = data.filter(cat => cat.estado === "Activo");
        setCategorias(categoriasActivas);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        Swal.fire("Error", "No se pudieron cargar las categorías de repuestos", "error");
      } finally {
        setCargando(false);
      }
    };

    cargarCategorias();
  }, [token]);

  // Calcular el total automáticamente cuando cambian cantidad o precio unitario
  useEffect(() => {
    const cantidad = parseFloat(repuesto.cantidad) || 0;
    const precioUnitario = parseFloat(repuesto.preciounitario) || 0;
    const total = cantidad * precioUnitario;
    
    // Solo actualizar si el total calculado es diferente al actual
    if (total !== parseFloat(repuesto.total)) {
      setRepuesto(prev => ({ ...prev, total: total.toFixed(2) }));
    }
  }, [repuesto.cantidad, repuesto.preciounitario]);

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

    if (name === "descripcion") {
      if (value.trim().length > 200) {
        error = "La descripción no puede exceder los 200 caracteres.";
      }
    }

    if (name === "cantidad") {
      if (value === "") {
        error = "La cantidad es obligatoria.";
      } else if (isNaN(value) || parseInt(value) < 0) {
        error = "La cantidad debe ser un número positivo.";
      }
    }

    if (name === "preciounitario") {
      if (value === "") {
        error = "El precio unitario es obligatorio.";
      } else if (isNaN(value) || parseFloat(value) < 0) {
        error = "El precio unitario debe ser un número positivo.";
      }
    }

    if (name === "categoria_repuesto_id") {
      if (!value) {
        error = "Debe seleccionar una categoría.";
      }
    }

    if (name === "estado") {
      if (!value) {
        error = "Debe seleccionar un estado.";
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

    if (repuesto.descripcion.trim().length > 200) {
      nuevosErrores.descripcion = "La descripción no puede exceder los 200 caracteres.";
    }

    if (repuesto.cantidad === "" || isNaN(repuesto.cantidad)) {
      nuevosErrores.cantidad = "La cantidad es obligatoria y debe ser un número.";
    } else if (parseInt(repuesto.cantidad) < 0) {
      nuevosErrores.cantidad = "La cantidad debe ser un número positivo.";
    }

    if (repuesto.preciounitario === "" || isNaN(repuesto.preciounitario)) {
      nuevosErrores.preciounitario = "El precio unitario es obligatorio y debe ser un número.";
    } else if (parseFloat(repuesto.preciounitario) < 0) {
      nuevosErrores.preciounitario = "El precio unitario debe ser un número positivo.";
    }

    if (!repuesto.categoria_repuesto_id) {
      nuevosErrores.categoria_repuesto_id = "Debe seleccionar una categoría.";
    }

    if (!repuesto.estado) {
      nuevosErrores.estado = "Debe seleccionar un estado.";
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
      
      // Preparar los datos para enviar
      const datosRepuesto = {
        ...repuesto,
        cantidad: parseInt(repuesto.cantidad),
        preciounitario: parseFloat(repuesto.preciounitario),
        categoria_repuesto_id: parseInt(repuesto.categoria_repuesto_id),
        total: parseFloat(repuesto.cantidad) * parseFloat(repuesto.preciounitario)
      };
      
      const res = await fetch("https://api-final-8rw7.onrender.com/api/repuestos", {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosRepuesto),
      });

      if (!res.ok) throw new Error("Error al crear el repuesto");

      Swal.fire("Éxito", "Repuesto creado correctamente", "success");
      navigate("/repuestos");
    } catch (error) {
      console.error("Error al crear el repuesto:", error);
      Swal.fire("Error", "No se pudo crear el repuesto", "error");
    } finally {
      setCargando(false);
    }
  };

  // Función para formatear el precio
  const formatearPrecio = (precio) => {
    if (!precio) return "$0.00";
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(precio);
  };

  return (
    <>
      <div className="categoria-container">
        <form className="categoria-form" onSubmit={handleSubmit}>
          <h2>Crear Repuesto</h2>

          <div className="perfil__field">
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={repuesto.nombre}
              onChange={handleChange}
              maxLength={45}
              className={errores.nombre ? "input-error" : ""}
              required
            />
            {errores.nombre && <span className="perfil-validacion">{errores.nombre}</span>}
          </div>

          <div className="perfil__field">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={repuesto.descripcion}
              onChange={handleChange}
              maxLength={200}
              rows={3}
              className={errores.descripcion ? "input-error" : ""}
              placeholder="Descripción del repuesto (opcional)"
              style={{ resize: 'vertical', minHeight: '60px' }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              {repuesto.descripcion.length}/200 caracteres
            </small>
            {errores.descripcion && <span className="perfil-validacion">{errores.descripcion}</span>}
          </div>

          <div className="perfil__field">
            <label>Categoría *</label>
            <div className="perfil__field">
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

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="perfil__field" style={{ flex: 1 }}>
              <label>Cantidad *</label>
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

            <div className="perfil__field" style={{ flex: 1 }}>
              <label>Precio Unitario *</label>
              <input
                type="number"
                name="preciounitario"
                value={repuesto.preciounitario}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={errores.preciounitario ? "input-error" : ""}
                required
              />
              {errores.preciounitario && <span className="error-text">{errores.preciounitario}</span>}
            </div>
          </div>

          <div className="perfil__field">
            <label>Estado *</label>
              <select
                name="estado"
                value={repuesto.estado}
                onChange={handleChange}
                className={errores.estado ? "input-error" : ""}
                required
                >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errores.estado && <span className="error-text">{errores.estado}</span>}
          </div>

          {/* Mostrar el total calculado */}
          <div className="perfil__field">
            <label>Total Calculado</label>
            <div className="perfil__field" style={{ 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              fontSize: '16px',
              fontWeight: 'bold',
            }}>
              {formatearPrecio(parseFloat(repuesto.cantidad || 0) * parseFloat(repuesto.preciounitario || 0))}
            </div>
          </div>

          <button type="submit" disabled={cargando}>
            {cargando ? "Guardando..." : "Crear Repuesto"}
          </button>
        </form>
      </div>
      
      {/* Modal de categorías */}
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

export default CrearRepuesto;
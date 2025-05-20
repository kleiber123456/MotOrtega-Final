import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import '../../../../shared/styles/EditarCategoriaRepuesto.css';


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
  const [cargando, setCargando] = useState(true);

  // Cargar datos del repuesto y categorías
  useEffect(() => {
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
        // Filtrar solo las categorías activas
        const categoriasActivas = dataCategorias.filter(cat => cat.estado === "Activo");
        setCategorias(categoriasActivas);
        
        // Cargar datos del repuesto específico
        const resRepuesto = await fetch(`https://api-final-8rw7.onrender.com/api/repuestos/${id}`, {
          method: "GET",
          headers: {
            "Authorization": token,
          },
        });

        if (!resRepuesto.ok) {
          if (resRepuesto.status === 404) {
            Swal.fire("Error", "El repuesto no existe", "error");
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
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Swal.fire("Error", "No se pudieron cargar los datos", "error");
        navigate("/repuestos");
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      cargarDatos();
    }
  }, [id, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRepuesto((prev) => ({ ...prev, [name]: value }));
    validarCampo(name, value);
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

  if (cargando) {
    return (
      <div className="cargando-container">
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="repuesto-container">
      <form className="repuesto-form" onSubmit={handleSubmit}>
        <h2>Editar Repuesto</h2>

        <div className="campo">
          <label>Nombre</label>
          <input
            name="nombre"
            value={repuesto.nombre}
            onChange={handleChange}
            maxLength={45} // Según la definición de la tabla
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
          <select
            name="categoria_repuesto_id"
            value={repuesto.categoria_repuesto_id}
            onChange={handleChange}
            className={errores.categoria_repuesto_id ? "input-error" : ""}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.nombre}
              </option>
            ))}
          </select>
          {errores.categoria_repuesto_id && (
            <span className="error-text">{errores.categoria_repuesto_id}</span>
          )}
        </div>

        <div className="botones">
          <button type="button" onClick={() => navigate("/repuestos")} className="btn-cancelar">
            Cancelar
          </button>
          <button type="submit" disabled={cargando} className="btn-guardar">
            {cargando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarRepuesto;
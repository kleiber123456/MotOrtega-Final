import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../../../../shared/styles/crearCategoriaRepuesto.css';

function CrearRepuesto() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [repuesto, setRepuesto] = useState({
    nombre: "",
    cantidad: 0,
    categoria_repuesto_id: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

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
      const res = await fetch("https://api-final-8rw7.onrender.com/api/repuestos", {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(repuesto),
      });

      if (!res.ok) throw new Error("Error al crear el repuesto");

      Swal.fire("Éxito", "Repuesto creado correctamente", "success");
      navigate("/repuestos"); // Ajusta esta ruta a la que tengas para listar repuestos
    } catch (error) {
      console.error("Error al crear el repuesto:", error);
      Swal.fire("Error", "No se pudo crear el repuesto", "error");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="categoria-container">
      <form className="categoria-form" onSubmit={handleSubmit}>
        <h2>Crear Repuesto</h2>

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
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          {errores.categoria_repuesto_id && (
            <span className="error-text">{errores.categoria_repuesto_id}</span>
          )}
        </div>

        <button type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : "Crear Repuesto"}
        </button>
      </form>
    </div>
  );
}

export default CrearRepuesto;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../../../../shared/styles/crearCategoriaRepuesto.css';

function CrearCategoriaRepuesto() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [categoria, setCategoria] = useState({
    nombre: "",
    estado: "Activo",
  });

  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoria((prev) => ({ ...prev, [name]: value }));
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

    if (name === "descripcion") {
      if (!value.trim()) {
        error = "La descripción es obligatoria.";
      } else if (value.trim().length < 5) {
        error = "La descripción debe tener al menos 5 caracteres.";
      }
    }

    setErrores((prev) => ({ ...prev, [name]: error }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!categoria.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (categoria.nombre.trim().length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres.";
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
      const res = await fetch("https://api-final-8rw7.onrender.com/api/categorias-repuestos", {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoria),
      });

      if (!res.ok) throw new Error("Error al crear la categoría");

      Swal.fire("Éxito", "Categoría creada correctamente", "success");
      navigate("/categorias-repuesto"); // Ajusta esta ruta a la que tengas para listar categorías
    } catch (error) {
      console.error("Error al crear la categoría:", error);
      Swal.fire("Error", "No se pudo crear la categoría", "error");
    }
  };

  return (
    <div className="categoria-container">
      <form className="categoria-form" onSubmit={handleSubmit}>
        <h2>Crear Categoría de Repuesto</h2>

        <div className="campo">
          <label>Nombre</label>
          <input
            name="nombre"
            value={categoria.nombre}
            onChange={handleChange}
            maxLength={50}
            className={errores.nombre ? "input-error" : ""}
            required
          />
          {errores.nombre && <span className="error-text">{errores.nombre}</span>}
        </div>
        <div className="campo">
          <label>Estado</label>
          <select
            name="estado"
            value={categoria.estado}
            onChange={handleChange}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <button type="submit">Crear Categoría</button>
      </form>
    </div>
  );
}

export default CrearCategoriaRepuesto;

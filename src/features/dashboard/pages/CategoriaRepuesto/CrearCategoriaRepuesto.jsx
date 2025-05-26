import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../../../../shared/styles/crearUsuarios.css';

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

  // Función para permitir solo letras en los campos
  const soloLetras = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
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
      navigate("/categorias-repuesto");
    } catch (error) {
      console.error("Error al crear la categoría:", error);
      Swal.fire("Error", "No se pudo crear la categoría", "error");
    }
  };

  return (
    <div className="perfil__container">
      <form className="perfil__form" onSubmit={handleSubmit}>
        <div className="perfil__title-container">
          <h2 className="perfil__title">Crear Categoría de Repuesto</h2>
        </div>

        <div className="perfil__grid-container">
          {/* Nombre */}
          <div className="perfil__field">
            <label>Nombre</label>
            <input
              name="nombre"
              value={categoria.nombre}
              onChange={handleChange}
              onInput={soloLetras}
              maxLength={50}
              autoComplete="off"
              className={errores.nombre ? "input-error" : ""}
              required
            />
            {errores.nombre && <span className="perfil-validacion">{errores.nombre}</span>}
          </div>

          {/* Estado */}
          <div className="perfil__field">
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
        </div>

        <button type="submit" className="perfil__btn">Crear Categoría</button>
      </form>
    </div>
  );
}

export default CrearCategoriaRepuesto;
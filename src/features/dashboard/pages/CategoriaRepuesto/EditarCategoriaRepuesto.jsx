// EditarCategoriaRepuesto.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../../../../shared/styles/EditarCategoriaRepuesto.css';

function EditarCategoriaRepuesto() {
  const { id } = useParams(); // id de la categoría a editar
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [categoria, setCategoria] = useState({
    nombre: "",
    estado: "Activo",
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/categorias-repuestos/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Error al obtener la categoría");

        const data = await res.json();
        setCategoria({
          nombre: data.nombre || "",
          estado: data.estado || "Activo",
        });
        setCargando(false);
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };

    fetchCategoria();
  }, [id, token]);

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
      const res = await fetch(`https://api-final-8rw7.onrender.com/api/categorias-repuestos/${id}`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoria),
      });

      if (!res.ok) throw new Error("Error al actualizar la categoría");

      Swal.fire("Éxito", "Categoría actualizada correctamente", "success");
      navigate("/listarCategoriasRepuesto");
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
      Swal.fire("Error", "No se pudo actualizar la categoría", "error");
    }
  };

  if (cargando) return <p>Cargando categoría...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="categoria-container">
      <form className="categoria-form" onSubmit={handleSubmit}>
        <h2>Editar Categoría de Repuesto</h2>

        <div className="campo">
          <label>Nombre</label>
          <input
            type="text"
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

        <div className="botones-container">
          <button type="submit">Guardar Cambios</button>
          <button
            type="button"
            onClick={() => navigate("/listarCategoriasRepuesto")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarCategoriaRepuesto;
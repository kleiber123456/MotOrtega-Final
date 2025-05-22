import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../../../../shared/styles/EditarCategoriaRepuesto.css'; // Cambiar por el archivo unificado

function EditarCategoriaRepuesto() {
  const { id } = useParams();
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

      await Swal.fire("Éxito", "Categoría actualizada correctamente", "success");
      navigate("/categorias-repuesto");
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
      Swal.fire("Error", "No se pudo actualizar la categoría", "error");
    }
  };

  if (cargando) {
    return (
      <div className="contenedor">
        <h2 className="titulo">Cargando categoría...</h2>
        <div className="linea-decorativa"></div>
        <p style={{ textAlign: 'center' }}>Por favor, espera.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contenedor">
        <h2 className="titulo">Error</h2>
        <div className="linea-decorativa"></div>
        <p style={{ textAlign: 'center', color: '#721c24' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="contenedor">
      <h2 className="titulo">Editar Categoría de Repuesto</h2>
      <div className="linea-decorativa"></div>
      
      <form className="formulario" onSubmit={handleSubmit}>
        <div className="grid">
          <div className="columna">
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={categoria.nombre}
              onChange={handleChange}
              maxLength={50}
              className={`input ${errores.nombre ? "input-error" : ""}`}
              required
            />
            {errores.nombre && <span className="error-text">{errores.nombre}</span>}
          </div>

          <div className="columna">
            <label>Estado:</label>
            <select
              name="estado"
              value={categoria.estado}
              onChange={handleChange}
              className="input"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="botones">
          <button className="btn-primario" type="submit">
            <i className="fas fa-save"></i>
            Guardar Cambios
          </button>
          <button
            className="btn-secundario"
            type="button"
            onClick={() => navigate("/categorias-repuesto")}
          >
            <i className="fas fa-arrow-left"></i>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarCategoriaRepuesto;
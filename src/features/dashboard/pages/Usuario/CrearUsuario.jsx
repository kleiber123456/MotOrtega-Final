import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../../../../shared/styles/crearUsuarios.css';


function CrearUsuario() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "Cédula de ciudadanía",
    documento: "",
    direccion: "",
    correo: "",
    telefono: "",
    rol_id: "",
    estado: "Activo",
    password: "",
    confirmPassword: ""
  });

  const [roles, setRoles] = useState([]);
  const [errores, setErrores] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetch("https://api-final-8rw7.onrender.com/api/roles", {
      headers: {
        "Authorization": token,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => setRoles(data))
      .catch(err => console.error("Error al obtener roles:", err));
  }, [token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
    validarCampo(name, value);
  };

  const validarCampo = (name, value) => {
    let nuevoError = '';

    if (name === 'nombre') {
      if (!value.trim()) {
        nuevoError = 'El nombre es obligatorio.';
      } else if (value.trim().length < 3) {
        nuevoError = 'El nombre debe de tener al menos 3 caracteres.';
      }
    } else if (name === 'apellido') {
      if (!value.trim()) {
        nuevoError = 'El apellido es obligatorio.';
      } else if (value.trim().length < 3) {
        nuevoError = 'El apellido debe de tener al menos 3 caracteres.';
      }
    } else if (name === 'documento') {
      if (!value.trim()) {
        nuevoError = 'El documento es obligatorio.';
      }
    } else if (name === 'tipo_documento') {
      if (!value) {
        nuevoError = 'Selecciona un tipo de documento.';
      }
    } else if (name === 'direccion') {
      if (!value.trim()) {
        nuevoError = 'La dirección es obligatoria.';
      } else if (value.trim().length < 5) {
        nuevoError = 'La dirección debe tener al menos 5 caracteres.';
      }
    } else if (name === 'correo') {
      if (!value.trim()) {
        nuevoError = 'El correo es obligatorio.';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        nuevoError = 'Ingresa un correo electrónico válido.';
      }
    } else if (name === 'telefono') {
      if (!value.trim()) {
        nuevoError = 'El teléfono es obligatorio.';
      } else if (value.trim().length < 10) {
        nuevoError = 'El teléfono debe tener al menos 10 números.';
      }
    } else if (name === 'rol_id') {
      if (!value) {
        nuevoError = 'Selecciona un rol.';
      }
    } else if (name === 'password') {
      if (!value) {
        nuevoError = 'La contraseña es obligatoria.';
      } else {
        const errores = [];
        if (value.length < 8) {
          errores.push('al menos 8 caracteres');
        }
        if (!/[A-Z]/.test(value)) {
          errores.push('una letra mayúscula');
        }
        if (!/[0-9]/.test(value)) {
          errores.push('un número');
        }
        
        if (errores.length > 0) {
          nuevoError = 'La contraseña debe contener: ' + errores.join(', ') + '.';
        }
      }
    } else if (name === 'confirmPassword') {
      if (value !== formulario.password) {
        nuevoError = 'Las contraseñas no coinciden.';
      }
    }

    setErrores(prev => ({ ...prev, [name]: nuevoError }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    } else if (formulario.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe de tener al menos 3 caracteres.';
    }

    if (!formulario.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es obligatorio.';
    } else if (formulario.apellido.trim().length < 3) {
      nuevosErrores.apellido = 'El apellido debe de tener al menos 3 caracteres.';
    }

    if (!formulario.tipo_documento) {
      nuevosErrores.tipo_documento = 'Selecciona un tipo de documento.';
    }

    if (!formulario.documento.trim()) {
      nuevosErrores.documento = 'El documento es obligatorio.';
    }

    if (!formulario.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es obligatoria.';
    } else if (formulario.direccion.trim().length < 5) {
      nuevosErrores.direccion = 'La dirección debe tener al menos 5 caracteres.';
    }

    if (!formulario.correo.trim()) {
      nuevosErrores.correo = 'El correo es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formulario.correo)) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido.';
    }

    if (!formulario.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio.';
    } else if (formulario.telefono.trim().length < 10) {
      nuevosErrores.telefono = 'El teléfono debe tener al menos 10 números.';
    }

    if (!formulario.rol_id) {
      nuevosErrores.rol_id = 'Selecciona un rol.';
    }

    if (!formulario.password) {
      nuevosErrores.password = 'La contraseña es obligatoria.';
    } else {
      const errores = [];
      if (formulario.password.length < 8) {
        errores.push('al menos 8 caracteres');
      }
      if (!/[A-Z]/.test(formulario.password)) {
        errores.push('una letra mayúscula');
      }
      if (!/[0-9]/.test(formulario.password)) {
        errores.push('un número');
      }
        
      if (errores.length > 0) {
        nuevosErrores.password = 'La contraseña debe contener: ' + errores.join(', ') + '.';
      }
    }

    if (formulario.password !== formulario.confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Función para permitir solo números en los campos
  const soloNumeros = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  };

  // Función para permitir solo letras en los campos
  const soloLetras = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validarFormulario()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos inválidos',
        text: 'Por favor corrige los errores antes de continuar.',
      });
      return;
    }

    const nuevoUsuario = { ...formulario };
    delete nuevoUsuario.confirmPassword;

    try {
      const res = await fetch("https://api-final-8rw7.onrender.com/api/usuarios", {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevoUsuario)
      });

      if (!res.ok) throw new Error("Error al crear el usuario");

      Swal.fire("Éxito", "Usuario creado correctamente", "success");
      navigate("/listarUsuarios");
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      Swal.fire("Error", "No se pudo crear el usuario", "error");
    }
  };

  return (
    <div className="perfil__container">
      <form className="perfil__form" onSubmit={handleSubmit}>
        <div className="perfil__title-container">
          <h2 className="perfil__title">Crear Usuario</h2>
        </div>

        <div className="perfil__grid-container">
          {/* Nombre */}
          <div className="perfil__field">
            <label>Nombre</label>
            <input
              name="nombre"
              value={formulario.nombre}
              onChange={handleChange}
              onInput={soloLetras}
              maxLength={30}
              autoComplete="off"
              className={errores.nombre ? "input-error" : ""}
              required
            />
            {errores.nombre && <span className="perfil-validacion">{errores.nombre}</span>}
          </div>

          {/* Apellido */}
          <div className="perfil__field">
            <label>Apellido</label>
            <input
              name="apellido"
              value={formulario.apellido}
              onChange={handleChange}
              onInput={soloLetras}
              maxLength={35}
              autoComplete="off"
              className={errores.apellido ? "input-error" : ""}
              required
            />
            {errores.apellido && <span className="perfil-validacion">{errores.apellido}</span>}
          </div>

          {/* Tipo Documento */}
          <div className="perfil__field">
            <label>Tipo Documento</label>
            <select
              name="tipo_documento"
              value={formulario.tipo_documento}
              onChange={handleChange}
              className={errores.tipo_documento ? "input-error" : ""}
              required
            >
              <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
              <option value="Tarjeta de identidad">Tarjeta de identidad</option>
            </select>
            {errores.tipo_documento && <span className="perfil-validacion">{errores.tipo_documento}</span>}
          </div>

          {/* Documento */}
          <div className="perfil__field">
            <label>Documento</label>
            <input
              name="documento"
              value={formulario.documento}
              onChange={handleChange}
              onInput={soloNumeros}
              maxLength={15}
              autoComplete="off"
              className={errores.documento ? "input-error" : ""}
              required
            />
            {errores.documento && <span className="perfil-validacion">{errores.documento}</span>}
          </div>

          {/* Dirección */}
          <div className="perfil__field">
            <label>Dirección</label>
            <input
              name="direccion"
              value={formulario.direccion}
              onChange={handleChange}
              maxLength={100}
              autoComplete="off"
              className={errores.direccion ? "input-error" : ""}
              required
            />
            {errores.direccion && <span className="perfil-validacion">{errores.direccion}</span>}
          </div>

          {/* Correo */}
          <div className="perfil__field">
            <label>Correo</label>
            <input
              name="correo"
              type="email"
              value={formulario.correo}
              onChange={handleChange}
              maxLength={254}
              autoComplete="off"
              className={errores.correo ? "input-error" : ""}
              required
            />
            {errores.correo && <span className="perfil-validacion">{errores.correo}</span>}
          </div>

          {/* Teléfono */}
          <div className="perfil__field">
            <label>Teléfono</label>
            <input
              name="telefono"
              value={formulario.telefono}
              onChange={handleChange}
              onInput={soloNumeros}
              maxLength={15}
              autoComplete="off"
              className={errores.telefono ? "input-error" : ""}
              required
            />
            {errores.telefono && <span className="perfil-validacion">{errores.telefono}</span>}
          </div>

          {/* Rol */}
          <div className="perfil__field">
            <label>Rol</label>
            <select
              name="rol_id"
              value={formulario.rol_id}
              onChange={handleChange}
              className={errores.rol_id ? "input-error" : ""}
              required
            >
              <option value="">Seleccione...</option>
              {roles.map(rol => (
                <option key={rol.id} value={rol.id}>{rol.nombre}</option>
              ))}
            </select>
            {errores.rol_id && <span className="perfil-validacion">{errores.rol_id}</span>}
          </div>

          {/* Estado */}
          <div className="perfil__field">
            <label>Estado</label>
            <select
              name="estado"
              value={formulario.estado}
              onChange={handleChange}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {/* Contraseña */}
          <div className="perfil__field password-field">
            <label>Contraseña</label>
            <div className="password-container">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formulario.password}
                onChange={handleChange}
                maxLength={30}
                autoComplete="new-password"
                className={errores.password ? "input-error" : ""}
                required
              />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </span>
            </div>
            {errores.password && <span className="perfil-validacion">{errores.password}</span>}
          </div>

          {/* Confirmar contraseña */}
          <div className="perfil__field password-field">
            <label>Confirmar contraseña</label>
            <div className="password-container">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formulario.confirmPassword}
                onChange={handleChange}
                maxLength={30}
                autoComplete="new-password"
                className={errores.confirmPassword ? "input-error" : ""}
                required
              />
              <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </span>
            </div>
            {errores.confirmPassword && <span className="perfil-validacion">{errores.confirmPassword}</span>}
          </div>
        </div>

        <button type="submit" className="perfil__btn">Guardar Usuario</button>
      </form>
    </div>
  );
  
}
export default CrearUsuario;
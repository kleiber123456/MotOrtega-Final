// src/pages/auth/Login.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../../../shared/styles/login.css';

function Login() {
  useEffect(() => {
    document.body.style.backgroundColor = "Black";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errores, setErrores] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    validarCampo(name, value);
  }, []);

  const validarCampo = (name, value) => {
    let nuevoError = '';

    if (name === 'correo') {
      if (!value.trim()) {
        nuevoError = 'El correo electrónico es obligatorio.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        nuevoError = 'Por favor ingrese un correo electrónico válido.';
      }
    } else if (name === 'password') {
      if (!value.trim()) {
        nuevoError = 'La contraseña es obligatoria.';
      } else if (value.length < 6) {
        nuevoError = 'La contraseña debe tener al menos 6 caracteres.';
      }
    }

    setErrores(prev => ({ ...prev, [name]: nuevoError }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.correo.trim()) {
      nuevosErrores.correo = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      nuevosErrores.correo = 'Por favor ingrese un correo electrónico válido.';
    }

    if (!formData.password.trim()) {
      nuevosErrores.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api-final-8rw7.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejo específico de errores según el código de estado o mensaje
        if (response.status === 404) {
          throw new Error("Correo electrónico no registrado en el sistema");
        } else if (response.status === 401) {
          throw new Error("Correo o contraseña incorrectos.");
        } else if (data.message && data.message.includes("correo")) {
          throw new Error("Correo electrónico no encontrado");
        } else if (data.message && data.message.includes("contraseña")) {
          throw new Error("Contraseña incorrecta");
        } else {
          throw new Error(data.message || "Error al iniciar sesión");
        }
      }

      const usuario = data.usuario || {};
      const usuarioFinal = {
        nombre: `${usuario.nombre} ${usuario.apellido}`,
        rol: usuario.rol
      };

      // ✅ Guardar SIEMPRE en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(usuarioFinal));

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error en la conexión");
    } finally {
      setLoading(false);
    }
  }, [formData, navigate]);

  const handleForgotPassword = () => {
    navigate("/recuperarContraseña");
  };

  const renderInput = (type, name, placeholder) => (
    <div className="Login-input-container">
      <input 
        type={type}
        className={`register-input ${errores[name] ? 'input-error' : ''}`}
        placeholder={placeholder}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required
      />
      {errores[name] && <span className="perfil-validacion">{errores[name]}</span>}
    </div>
  );

  return (
    <div className='bodyLogin' transition-style="in:circle:hesitate">
      <div className="login-contendor">
        <div className='ca-login'>
          <div className="contenedor-login">
            <div className="Login-form-box">
              <form className="Login-form" onSubmit={handleSubmit} autoComplete="off">
                <div className="Login-logo-container">
                  <img src="/Logo.png" alt="Logo" className="Login-logo" />
                </div>
                <span className="Login-title">Iniciar Sesión</span>
                <span className="Login-subtitle">Ingresa tus credenciales para acceder</span>

                <div className="Login-form-container">
                  {renderInput("email", "correo", "Correo electrónico*")}
                  
                  <div className="Login-input-container password-field">
                    <div className="password-container">
                      <input 
                        type={showPassword ? "text" : "password"}
                        className={`register-input ${errores.password ? 'input-error' : ''}`}
                        placeholder="Contraseña*" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                      />
                      <span 
                        className="password-toggle" 
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <i className="fas fa-eye-slash"></i>
                        ) : (
                          <i className="fas fa-eye"></i>
                        )}
                      </span>
                    </div>
                    {errores.password && <span className="perfil-validacion">{errores.password}</span>}
                  </div>
                </div>

                {error && (
                  <span className="Perfil-validacion">
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </span>
                )}

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="Login-button"
                >
                  {loading ? (
                    <>
                      <span className="Login-spinner"></span>
                      Verificando...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </button>

                <div className="Login-options">
                  <div className="Login-forgot-password">
                    <span onClick={handleForgotPassword}>¿Olvidaste tu contraseña?</span>
                  </div>
                </div>
              </form>

              <div className="Login-form-section">
                <p>¿No tienes una cuenta? <a href="/register">Regístrate</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
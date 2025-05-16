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

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
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

  return (
    <div className='bodyLogin' transition-style="in:circle:hesitate">
      <div className="login-contendor">
        <div className='ca-login'>
          <div className="contenedor-login">
            <div className="Login-form-box">
              <form className="Login-form" onSubmit={handleSubmit}>
                <div className="Login-logo-container">
                  <img src="/Logo.png" alt="Logo" className="Login-logo" />
                </div>
                <span className="Login-title">Iniciar Sesión</span>
                <span className="Login-subtitle">Ingresa tus credenciales para acceder</span>

                <div className="Login-form-container">
                  <input 
                    type="email" 
                    className="Login-input" 
                    placeholder="Correo electrónico*" 
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                  <div className="Login-password-container">
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="Login-input" 
                      placeholder="Contraseña*" 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                    />
                    <span 
                      className="Login-password-toggle" 
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <i className="fas fa-eye-slash"></i>
                      ) : (
                        <i className="fas fa-eye"></i>
                      )}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="Login-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </div>
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
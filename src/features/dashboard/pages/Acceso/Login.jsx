import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../../../shared/styles/login.css'; // Asumiendo que tienes un archivo CSS similar para login

function Login() {
  useEffect(()=> {
    document.body.style.backgroundColor = "Black";
    return()=>{
      document.body.style.background = ""
    }
  })
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Manejar cambios en los campos del formulario
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }, []);

  // Alternar visibilidad de la contraseña
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Manejar el cambio en "Recordarme"
  const handleRememberMeChange = useCallback(() => {
    setRememberMe(prev => !prev);
  }, []);

  // Manejar envío del formulario
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
        throw new Error(data.message || "Correo o contraseña incorrectos");
      }

      // Si las credenciales son correctas, guardar el token en localStorage o sessionStorage
      if (rememberMe) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario || {}));
      } else {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("usuario", JSON.stringify(data.usuario || {}));
      }

      // Redireccionar al dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error en la conexión");
    } finally {
      setLoading(false);
    }
  }, [formData, navigate, rememberMe]);

  // Manejar solicitud de recuperación de contraseña
  const handleForgotPassword = () => {
    navigate("/recuperarContraseña");
  };

  return (
    <div className='bodyLogin' transition-style="in:circle:hesitate">
      <div className="login-contendor">
      <div  className='ca-login'>
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
             
              
              {error && <div className="Login-error">{error}</div>}
              
              <button 
                type="submit" 
                disabled={loading} 
                className="Login-button"
              >
                {loading ? "Ingresando..." : "Iniciar Sesión"}
              </button>
              <div className="Login-options">
                <div className="Login-forgot-password">
                  <span onClick={handleForgotPassword}>¿Olvidaste tu contraseña?</span>
                </div>
              </div>
            </form>
            
            <div className="Login-form-section">
              <p>¿No tienes una cuenta? <a href="/register">Registrate</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Login;
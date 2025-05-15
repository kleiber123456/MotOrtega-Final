// ... (importaciones)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../../../../shared/styles/register.css';

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "Cédula de ciudadanía",
    documento: "",
    telefono: "",
    direccion: "",
    correo: "",
    password: "",
    confirmPassword: "",
    estado: "activo"
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [error, setError] = useState(null);
  const totalSteps = 3;

  useEffect(() => {
    document.body.style.backgroundColor = "Black";
    return () => { document.body.style.background = ""; };
  }, []);

  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validarCamposPaso = () => {
    let mensaje = "";

   if (step === 1) {
      if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,}$/.test(formData.nombre)) {
        mensaje = "Nombre inválido. El nombre solo debe de tener letras y al menos 2 caracteres.";
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,}$/.test(formData.apellido)) {
        mensaje = "Apellido inválido. El apellido solo debe de tener letras y al menos 2 caracteres.";
      } else if (!/^\d{6,}$/.test(formData.documento)) {
        mensaje += "Documento inválido. El documento debe de tener solo numeros y almenos 6 digitos.";
      }
    }

    if (step === 2) {
      if (!/^\d{7,}$/.test(formData.telefono)) {
        mensaje = "Teléfono inválido. El telefono debe de tener solo numeros y al menos 6 digitos.";
      } else if (!formData.direccion.trim()) {
        mensaje = "Dirección requerida";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
        mensaje = "Correo electrónico inválido";
      }
    }

     if (step === 3) {
      if (!/(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}/.test(formData.password)) {
        mensaje = "Contraseña débil. La contraseña debe de tener al menos 8 caracteres, 1 mayúscula, 1 número.";
      }
    }

    if (mensaje) {
      Swal.fire({
        icon: 'warning',
        title: 'Validación',
        text: mensaje,
        confirmButtonColor: '#0066ff'
      });
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (validarCamposPaso()) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCamposPaso()) return;

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        confirmButtonColor: '#0066ff'
      });
      return;
    }

    const dataToSend = { ...formData };
    delete dataToSend.confirmPassword;

    try {
      Swal.fire({
        title: 'Procesando...',
        text: 'Estamos registrando tu cuenta',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const res = await fetch("https://api-final-8rw7.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al registrar");

      Swal.fire({
        icon: 'success',
        title: '¡Registro Exitoso!',
        text: '¡Tu cuenta ha sido creada correctamente!',
        confirmButtonColor: '#0066ff',
        timer: 2000,
        timerProgressBar: true
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Ocurrió un error al registrar tu cuenta',
        confirmButtonColor: '#0066ff'
      });
      setError(err.message);
    }
  };

  const renderProgress = () => (
    <div className="register-progress-container" data-step={step}>
      {["Datos Personales", "Información de Contacto", "Seguridad"].map((label, index) => (
        <div key={index} className="register-progress-step">
          <div className={`register-progress-indicator ${step > index ? "register-progress-completed" : ""}`}>
            {index + 1}
          </div>
          <div className="register-progress-label">{label}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="register-reset">
      <div className="register-page">
        <div className="register-bodyLogin" transition-style="in:circle:hesitate">
          <div className="register-login-contendor">
            <div className="register-ca-login">
              <div className="register-contenedor-login">
                <div className="register-form-box">
                  <form className="register-form" onSubmit={handleSubmit}>
                    <div className="register-logo-container">
                      <img src="/Logo.png" alt="Logo" className="register-logo" />
                    </div>
                    <h1 className="register-title">Registro</h1>
                    <p className="register-subtitle">Paso {step} de {totalSteps}</p>
                    {renderProgress()}
                    <div className="register-form-container">
                      {step === 1 && (
                        <>
                          <div className="register-section-title"><i className="fas fa-user-circle"></i> Datos Personales</div>
                          <input type="text" className="register-input" placeholder="Nombre*" name="nombre" value={formData.nombre} onChange={handleChange} required />
                          <input type="text" className="register-input" placeholder="Apellido*" name="apellido" value={formData.apellido} onChange={handleChange} required />
                          <select className="register-input" name="tipo_documento" value={formData.tipo_documento} onChange={handleChange}>
                            <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                            <option value="Targeta identidad">Targeta identidad</option>
                            <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                            <option value="Pasaporte">Pasaporte</option>
                          </select>
                          <input type="text" className="register-input" placeholder="Número de Documento*" name="documento" value={formData.documento} onChange={handleChange} required />
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <div className="register-section-title"><i className="fas fa-address-book"></i> Información de Contacto</div>
                          <div className="register-input-with-icon">
                            <i className="fas fa-phone"></i>
                            <input type="tel" className="register-input" placeholder="Teléfono*" name="telefono" value={formData.telefono} onChange={handleChange} required />
                          </div>
                          <div className="register-input-with-icon">
                            <i className="fas fa-map-marker-alt"></i>
                            <input type="text" className="register-input" placeholder="Dirección*" name="direccion" value={formData.direccion} onChange={handleChange} required />
                          </div>
                          <div className="register-input-with-icon">
                            <i className="fas fa-envelope"></i>
                            <input type="email" className="register-input" placeholder="Correo electrónico*" name="correo" value={formData.correo} onChange={handleChange} required />
                          </div>
                        </>
                      )}

                      {step === 3 && (
                        <>
                          <div className="register-section-title"><i className="fas fa-lock"></i> Seguridad</div>
                          <div className="register-password-container">
                            <input type={showPassword ? "text" : "password"} className="register-input" placeholder="Contraseña*" name="password" value={formData.password} onChange={handleChange} required />
                            <span className="register-password-toggle" onClick={() => setShowPassword(p => !p)}>
                              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                            </span>
                          </div>
                          <div className="register-password-container">
                            <input type={showConfirmPassword ? "text" : "password"} className={`register-input ${!passwordMatch && formData.confirmPassword ? 'register-input-error' : ''}`} placeholder="Confirmar Contraseña*" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                            <span className="register-password-toggle" onClick={() => setShowConfirmPassword(p => !p)}>
                              <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                            </span>
                          </div>
                          {!passwordMatch && <div className="register-password-mismatch">Las contraseñas no coinciden</div>}
                        </>
                      )}
                    </div>

                    {error && <div className="register-error">{error}</div>}

                    <div className="register-buttons-container">
                      {step > 1 && (
                        <button type="button" onClick={prevStep} className="register-button register-button-secondary">
                          <i className="fas fa-arrow-left"></i> Anterior
                        </button>
                      )}
                      {step < totalSteps ? (
                        <button type="button" onClick={nextStep} className="register-button">
                          Siguiente <i className="fas fa-arrow-right"></i>
                        </button>
                      ) : (
                        <button type="submit" className="register-button register-button-primary" disabled={formData.confirmPassword && !passwordMatch}>
                          <i className="fas fa-user-plus"></i> Crear Cuenta
                        </button>
                      )}
                    </div>
                  </form>
                  <div className="register-form-section">
                    <p>¿Ya tienes una cuenta? <a href="/login">Iniciar sesión</a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

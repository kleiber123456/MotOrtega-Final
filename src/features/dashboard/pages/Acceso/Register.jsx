// ... (importaciones)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../../../../shared/styles/register.css';

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

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

  const [touched, setTouched] = useState({});
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = "black";
    return () => {
      document.body.style.overflow = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocus = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const getValidationMessage = (name) => {
    const value = formData[name];

    switch (name) {
      case "nombre":
      case "apellido":
        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,}$/.test(value)) {
          return `El ${name} debe contener solo letras y mínimo 2 caracteres.`;
        }
        break;
      case "documento":
        if (!/^\d{6,}$/.test(value)) {
          return "Documento inválido. Debe tener al menos 6 números.";
        }
        break;
      case "telefono":
        if (!/^\d{7,}$/.test(value)) {
          return "Teléfono inválido. Debe tener al menos 7 dígitos.";
        }
        break;
      case "direccion":
        if (!value.trim()) {
          return "Dirección requerida.";
        }
        break;
      case "correo":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Correo electrónico inválido.";
        }
        break;
      case "password":
        if (!/(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}/.test(value)) {
          return "Contraseña débil. Mínimo 8 caracteres, una mayúscula y un número.";
        }
        break;
      default:
        return null;
    }

    return null;
  };

  const validarCamposPaso = () => {
    const campos = step === 1 ? ["nombre", "apellido", "documento"] :
                   step === 2 ? ["telefono", "direccion", "correo"] :
                                ["password"];
    for (const campo of campos) {
      const msg = getValidationMessage(campo);
      if (msg) {
        Swal.fire({ icon: 'warning', title: 'Validación', text: msg, confirmButtonColor: '#0066ff' });
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validarCamposPaso()) setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCamposPaso()) return;
    if (!passwordMatch) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden', confirmButtonColor: '#0066ff' });
      return;
    }
    const dataToSend = { ...formData };
    delete dataToSend.confirmPassword;

    try {
      Swal.fire({
        title: 'Procesando...',
        text: 'Estamos registrando tu cuenta',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      const res = await fetch("https://api-final-8rw7.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al registrar");

      Swal.fire({ icon: 'success', title: '¡Registro Exitoso!', text: '¡Tu cuenta ha sido creada correctamente!', confirmButtonColor: '#0066ff', timer: 2000 });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Ocurrió un error al registrar tu cuenta', confirmButtonColor: '#0066ff' });
      setError(err.message);
    }
  };

  const renderInput = (type, name, placeholder) => (
    <div>
      <input
        type={type}
        className={`register-input ${touched[name] && getValidationMessage(name) ? 'register-input-error' : ''}`}
        placeholder={placeholder}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        onFocus={handleFocus}
        required
      />
      {touched[name] && getValidationMessage(name) && (
        <div className="register-validation-message">{getValidationMessage(name)}</div>
      )}
    </div>
  );

  const renderProgress = () => (
    <div className="register-progress-container" data-step={step}>
      {["Datos Personales", "Información de Contacto", "Seguridad"].map((label, index) => (
        <div key={index} className="register-progress-step">
          <div className={`register-progress-indicator ${step > index ? "register-progress-completed" : ""}`}>{index + 1}</div>
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
                  <form className="register-form" onSubmit={handleSubmit} autoComplete="off">
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
                          {renderInput("text", "nombre", "Nombres*")}
                          {renderInput("text", "apellido", "Apellidos*")}
                          <select className="register-input" name="tipo_documento" value={formData.tipo_documento} onChange={handleChange}>
                            <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                            <option value="Targeta identidad">Targeta identidad</option>
                            <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                            <option value="Pasaporte">Pasaporte</option>
                          </select>
                          {renderInput("text", "documento", "Número de Documento*")}
                        </>
                      )}
                      {step === 2 && (
                        <>
                          <div className="register-section-title"><i className="fas fa-address-book"></i> Información de Contacto</div>
                          {renderInput("tel", "telefono", "Teléfono*")}
                          {renderInput("text", "direccion", "Dirección*")}
                          {renderInput("email", "correo", "Correo electrónico*")}
                        </>
                      )}
                      {step === 3 && (
                        <>
                          <div className="register-section-title"><i className="fas fa-lock"></i> Seguridad</div>
                          <div className="register-password-container">
                            {renderInput(showPassword ? "text" : "password", "password", "Contraseña*")}
                            <span className="register-password-toggle" onClick={() => setShowPassword(p => !p)}>
                              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                            </span>
                          </div>
                          <div className="register-password-container">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              className={`register-input ${!passwordMatch && formData.confirmPassword ? 'register-input-error' : ''}`}
                              placeholder="Confirmar Contraseña*"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              onFocus={handleFocus}
                              required
                            />
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

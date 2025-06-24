import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../../../../shared/styles/forgotPassword.css';

function RecuperarPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Solicitar código, 2: Verificar código, 3: Nueva contraseña
  const [formData, setFormData] = useState({
    correo: "",
    codigo: "",
    nuevaPassword: "",
    confirmarPassword: ""
  });
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const codeInputsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [touched, setTouched] = useState({});
  
  // Contador para expiración del código
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutos en segundos
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = "Black";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  // Inicializar refs para los inputs de código
  useEffect(() => {
    codeInputsRef.current = codeInputsRef.current.slice(0, 6);
  }, []);
  
  // Efecto para iniciar el contador cuando estamos en el paso 2
  useEffect(() => {
    if (step === 2) {
      setTimeLeft(10 * 60); // Reiniciar a 10 minutos
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  }, [step]);
  
  // Efecto para manejar el contador
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // El código ha expirado
      Swal.fire({ 
        icon: 'warning', 
        title: 'Código expirado', 
        text: 'El código ha expirado. Por favor, solicita uno nuevo.',
        confirmButtonColor: '#0066ff'
      });
      setError("El código ha expirado. Por favor, solicita uno nuevo.");
      setTimerActive(false);
      // Opcional: redirigir al paso 1 después de un tiempo
      setTimeout(() => {
        setStep(1);
      }, 3000);
    }
    
    return () => {
      clearInterval(timer);
    };
  }, [timerActive, timeLeft]);
  
  // Función para formatear el tiempo (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Validaciones similares al componente Register
  const getValidationMessage = (name) => {
    const value = formData[name];

    switch (name) {
      case "correo":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Correo electrónico inválido.";
        }
        break;
      case "nuevaPassword":
        if (!/(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}/.test(value)) {
          return "Contraseña débil. Mínimo 8 caracteres, una mayúscula y un número.";
        }
        break;
      default:
        return null;
    }

    return null;
  };

  const handleFocus = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Verificar si las contraseñas coinciden cuando se cambia alguna de ellas
    if (name === "nuevaPassword" || name === "confirmarPassword") {
      if (name === "nuevaPassword") {
        setPasswordMatch(value === formData.confirmarPassword || formData.confirmarPassword === "");
      } else {
        setPasswordMatch(value === formData.nuevaPassword);
      }
    }
  };

  // Manejar cambios en los inputs de código de verificación
  const handleVerificationCodeChange = useCallback((index, value) => {
    // Asegurarse de que solo se ingresen números
    if (value !== "" && !/^\d+$/.test(value)) return;

    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value;
    setVerificationCode(newVerificationCode);

    // Actualizar el código completo en formData
    setFormData(prevData => ({
      ...prevData,
      codigo: newVerificationCode.join("")
    }));

    // Mover al siguiente input si es posible
    if (value !== "" && index < 5) {
      codeInputsRef.current[index + 1].focus();
    }
  }, [verificationCode]);

  // Manejar el pegado de código de verificación
  const handleVerificationCodePaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (pastedData.length <= 6 && /^\d+$/.test(pastedData)) {
      const newVerificationCode = [...verificationCode];
      
      for (let i = 0; i < 6; i++) {
        newVerificationCode[i] = i < pastedData.length ? pastedData[i] : "";
      }
      
      setVerificationCode(newVerificationCode);
      
      // Actualizar el código completo en formData
      setFormData(prevData => ({
        ...prevData,
        codigo: newVerificationCode.join("")
      }));
      
      // Enfocar el último input si se completó todo el código
      if (pastedData.length === 6) {
        codeInputsRef.current[5].focus();
      } else if (pastedData.length > 0) {
        codeInputsRef.current[pastedData.length - 1].focus();
      }
    }
  }, [verificationCode]);

  // Manejar la tecla Backspace en los inputs de código
  const handleVerificationCodeKeyDown = useCallback((index, e) => {
    if (e.key === "Backspace" && verificationCode[index] === "" && index > 0) {
      codeInputsRef.current[index - 1].focus();
    }
  }, [verificationCode]);

  // Validar campos antes de avanzar
  const validarCamposPaso = () => {
    const campos = step === 1 ? ["correo"] :
                 step === 2 ? ["codigo"] :
                 ["nuevaPassword", "confirmarPassword"];
                 
    for (const campo of campos) {
      const msg = getValidationMessage(campo);
      if (msg) {
        Swal.fire({ 
          icon: 'warning', 
          title: 'Validación', 
          text: msg, 
          confirmButtonColor: '#0066ff' 
        });
        return false;
      }
    }
    
    // Validación adicional para paso 3 (contraseñas deben coincidir)
    if (step === 3 && formData.nuevaPassword !== formData.confirmarPassword) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Las contraseñas no coinciden', 
        confirmButtonColor: '#0066ff' 
      });
      return false;
    }
    
    return true;
  };

  // Solicitar código de verificación
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    if (!validarCamposPaso()) return;
    
    setLoading(true);
    setError(null);

    try {
      Swal.fire({
        title: 'Procesando...',
        text: 'Enviando código de verificación',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      
      const response = await fetch("https://api-final-8rw7.onrender.com/api/auth/solicitar-codigo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo: formData.correo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Correo no encontrado");
      }

      Swal.fire({ 
        icon: 'success', 
        title: 'Código enviado', 
        text: 'Se ha enviado un código de verificación a tu correo', 
        confirmButtonColor: '#0066ff',
        timer: 2000
      });
      
      setSuccess(true);
      setStep(2); // Avanzar al paso de verificación de código
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message || "Error en la conexión", 
        confirmButtonColor: '#0066ff' 
      });
      setError(err.message || "Error en la conexión");
    } finally {
      setLoading(false);
    }
  };

  // Verificar código
  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    if (timeLeft === 0) {
      Swal.fire({ 
        icon: 'warning', 
        title: 'Código expirado', 
        text: 'El código ha expirado. Por favor, solicita uno nuevo.', 
        confirmButtonColor: '#0066ff' 
      });
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      Swal.fire({
        title: 'Verificando...',
        text: 'Comprobando el código de verificación',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      
      const response = await fetch("https://api-final-8rw7.onrender.com/api/auth/verificar-codigo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          correo: formData.correo,
          codigo: formData.codigo 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Código inválido");
      }

      Swal.fire({ 
        icon: 'success', 
        title: 'Código verificado', 
        text: 'El código es correcto', 
        confirmButtonColor: '#0066ff',
        timer: 2000
      });
      
      setSuccess(true);
      setTimerActive(false); // Detener el contador cuando el código es verificado
      setStep(3); // Avanzar al paso de nueva contraseña
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message || "Error en la verificación", 
        confirmButtonColor: '#0066ff' 
      });
      setError(err.message || "Error en la verificación");
    } finally {
      setLoading(false);
    }
  };

  // Establecer nueva contraseña
  const handleNuevaPassword = async (e) => {
    e.preventDefault();
    if (!validarCamposPaso()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false); // Resetear el estado de éxito al iniciar la solicitud

    try {
      Swal.fire({
        title: 'Procesando...',
        text: 'Actualizando tu contraseña',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      
      const response = await fetch("https://api-final-8rw7.onrender.com/api/auth/nueva-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: formData.correo,
          nuevaPassword: formData.nuevaPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al cambiar la contraseña");
      }

      // Solo establecer éxito si la respuesta fue correcta
      setSuccess(true);
      
      Swal.fire({ 
        icon: 'success', 
        title: '¡Contraseña actualizada!', 
        text: 'Tu contraseña ha sido actualizada correctamente', 
        confirmButtonColor: '#0066ff',
        timer: 2000
      });
      
      // Redireccionar al login después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message || "Error al actualizar la contraseña", 
        confirmButtonColor: '#0066ff' 
      });
      setError(err.message || "Error al actualizar la contraseña");
      setSuccess(false); // Asegurarse de que success sea false en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Ir a la página de login
  const goToLogin = () => {
    navigate("/login");
  };

  // Solicitar un nuevo código cuando el anterior ha expirado
  const handleRequestNewCode = () => {
    // Resetear contador y volver al paso 1
    setTimeLeft(10 * 60);
    setTimerActive(false);
    setStep(1);
  };

  // Función para renderizar un input con validación similar a Register.js
  const renderInput = (type, name, placeholder, max = null, oniput = null) => (
    <div>
      <input
        type={type}
        className={`register-input ${touched[name] && getValidationMessage(name) ? 'register-input-error' : ''}`}
        placeholder={placeholder}
        name={name}
        value={formData[name]}
        maxLength={max}
        onInput={oniput}
        onChange={handleChange}
        onFocus={handleFocus}
        required
      />
      {touched[name] && getValidationMessage(name) && (
        <div className="register-validation-message">{getValidationMessage(name)}</div>
      )}
    </div>
  );

  // Renderizar formulario según el paso actual
  const renderForm = () => {
    switch (step) {
      case 1: // Solicitar código
        return (
          <div className="rp-contenedor">
            <form className="fp-Login-form" onSubmit={handleSolicitarCodigo} autoComplete="off">
              <div className="fp-Login-logo-container">
                <img src="/Logo.png" alt="Logo" className="fp-Login-logo" />
              </div>
              <span className="fp-Login-title">Cambiar Contraseña</span>
              <span className="fp-Login-subtitle">Ingresa tu correo electrónico para recibir un código de verificación</span>
              
              <div className="fp-Login-form-container">
                {renderInput("email", "correo", "Correo electrónico*", 254)}
              </div>
              
              {error && <div className="fp-Login-error">{error}</div>}
              
              <button 
                type="submit" 
                disabled={loading} 
                className="fp-Login-button"
              >
                {loading ? "Enviando..." : "Enviar Código"}
              </button>
            </form>
          </div>
        );
      
      case 2: // Verificar código
        return (
          <form className="fp-Login-form" onSubmit={handleVerificarCodigo} autoComplete="off">
            <div className="fp-Login-logo-container">
              <img src="/Logo.png" alt="Logo" className="fp-Login-logo" />
            </div>
            <span className="fp-Login-title">Verificar Código</span>
            <span className="fp-Login-subtitle">Ingresa el código de 6 dígitos enviado a tu correo electrónico</span>
            
            {/* Contador de tiempo */}
            <div className="fp-timer-container">
              <span className="fp-timer-text">
                El código expira en: <span className={timeLeft < 60 ? "fp-timer-expiring" : ""}>{formatTime(timeLeft)}</span>
              </span>
            </div>
            
            <div className="fp-verification-code-container">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={(el) => (codeInputsRef.current[index] = el)}
                  type="text"
                  maxLength="1"
                  className="fp-verification-code-input"
                  value={verificationCode[index]}
                  onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleVerificationCodeKeyDown(index, e)}
                  onPaste={index === 0 ? handleVerificationCodePaste : undefined}
                  required
                  autoComplete="off"
                  autoFocus={index === 0}
                  disabled={timeLeft === 0}
                />
              ))}
            </div>
            
            {error && <div className="fp-Login-error">{error}</div>}
            
            {timeLeft === 0 ? (
              <button 
                type="button"
                onClick={handleRequestNewCode}
                className="fp-Login-button"
              >
                Solicitar nuevo código
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={loading || verificationCode.join("").length !== 6} 
                className="fp-Login-button"
              >
                {loading ? "Verificando..." : "Verificar Código"}
              </button>
            )}
            
            <div className="fp-Login-back-option">
              <span onClick={goToLogin}>Volver al inicio de sesión</span>
            </div>
          </form>
        );
      
      case 3: // Nueva contraseña
        return (
          <form className="fp-Login-form" onSubmit={handleNuevaPassword} autoComplete="off">
            <div className="fp-Login-logo-container">
              <img src="/Logo.png" alt="Logo" className="fp-Login-logo" />
            </div>
            <span className="fp-Login-title">Nueva Contraseña</span>
            <span className="fp-Login-subtitle">Establece tu nueva contraseña</span>
            
            <div className="fp-Login-form-container">
              <div className="register-password-container">
                <input 
                  type={showPassword ? "text" : "password"}
                  className={`register-input ${touched["nuevaPassword"] && getValidationMessage("nuevaPassword") ? 'register-input-error' : ''}`}
                  placeholder="Nueva contraseña*" 
                  name="nuevaPassword"
                  maxLength={128}
                  value={formData.nuevaPassword}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  required
                />
                <span 
                  className="register-password-toggle" 
                  onClick={() => setShowPassword(p => !p)}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
              
              {touched["nuevaPassword"] && getValidationMessage("nuevaPassword") && (
                <div className="register-validation-message">{getValidationMessage("nuevaPassword")}</div>
              )}
              
              <div className="register-password-container">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  className={`register-input ${!passwordMatch && formData.confirmarPassword ? 'register-input-error' : ''}`}
                  placeholder="Confirmar contraseña*" 
                  name="confirmarPassword"
                  maxLength={128}
                  value={formData.confirmarPassword}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  required
                />
                <span 
                  className="register-password-toggle" 
                  onClick={() => setShowConfirmPassword(p => !p)}
                >
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
              
              {!passwordMatch && formData.confirmarPassword && (
                <div className="register-password-mismatch">Las contraseñas no coinciden</div>
              )}
            </div>
            
            {error && <div className="fp-Login-error">{error}</div>}
            
            <button 
              type="submit" 
              disabled={loading || !passwordMatch} 
              className="fp-Login-button"
            >
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
            
            <div className="fp-Login-back-option">
              <span onClick={goToLogin}>Volver al inicio de sesión</span>
            </div>
          </form>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className='fp-bodyLogin'>
      <div className='fp-ca-login'>
        <div className="fp-contenedor-login">
          <div className="fp-Login-form-box">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecuperarPassword;
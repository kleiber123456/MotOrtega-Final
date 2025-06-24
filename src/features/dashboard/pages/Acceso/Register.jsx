"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import "../../../../shared/styles/register.css"

function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const totalSteps = 3

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
    estado: "activo",
  })

  const [errores, setErrores] = useState({})
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    document.body.style.backgroundColor = "black"
    return () => {
      document.body.style.overflow = ""
      document.body.style.backgroundColor = ""
    }
  }, [])

  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword)
    }
  }, [formData.password, formData.confirmPassword])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validarCampo(name, value)
  }

  const validarCampo = (name, value) => {
    let nuevoError = ""

    if (name === "nombre") {
      if (!value.trim()) {
        nuevoError = "El nombre es obligatorio."
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,}$/.test(value)) {
        nuevoError = "El nombre debe contener solo letras y tener al menos 2 caracteres."
      }
    } else if (name === "apellido") {
      if (!value.trim()) {
        nuevoError = "El apellido es obligatorio."
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,}$/.test(value)) {
        nuevoError = "El apellido debe contener solo letras y tener al menos 2 caracteres."
      }
    } else if (name === "documento") {
      if (!value.trim()) {
        nuevoError = "El número de documento es obligatorio."
      } else if (!/^\d{6,}$/.test(value)) {
        nuevoError = "El documento debe contener al menos 6 dígitos."
      }
    } else if (name === "telefono") {
      if (!value.trim()) {
        nuevoError = "El teléfono es obligatorio."
      } else if (!/^\d{7,}$/.test(value)) {
        nuevoError = "El teléfono debe contener al menos 7 dígitos."
      }
    } else if (name === "direccion") {
      if (!value.trim()) {
        nuevoError = "La dirección es obligatoria."
      } else if (value.length < 5) {
        nuevoError = "Por favor ingrese una dirección válida."
      }
    } else if (name === "correo") {
      if (!value.trim()) {
        nuevoError = "El correo electrónico es obligatorio."
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        nuevoError = "Por favor ingrese un correo electrónico válido."
      }
    } else if (name === "password") {
      if (!value.trim()) {
        nuevoError = "La contraseña es obligatoria."
      } else {
        const erroresPassword = []
        if (value.length < 8) {
          erroresPassword.push("al menos 8 caracteres")
        }
        if (!/(?=.*[A-Z])/.test(value)) {
          erroresPassword.push("una letra mayúscula")
        }
        if (!/(?=.*\d)/.test(value)) {
          erroresPassword.push("un número")
        }

        if (erroresPassword.length > 0) {
          nuevoError = "La contraseña debe contener: " + erroresPassword.join(", ") + "."
        }
      }
    } else if (name === "confirmPassword") {
      if (!value.trim()) {
        nuevoError = "Debe confirmar la contraseña."
      } else if (value !== formData.password) {
        nuevoError = "Las contraseñas no coinciden."
      }
    }

    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
  }

  const validarCamposPaso = () => {
    const campos =
      step === 1
        ? ["nombre", "apellido", "documento"]
        : step === 2
          ? ["telefono", "direccion", "correo"]
          : ["password", "confirmPassword"]

    const nuevosErrores = {}

    // Validar cada campo del paso actual
    for (const campo of campos) {
      const value = formData[campo]
      let nuevoError = ""

      if (campo === "nombre") {
        if (!value.trim()) {
          nuevoError = "El nombre es obligatorio."
        } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,}$/.test(value)) {
          nuevoError = "El nombre debe contener solo letras y tener al menos 2 caracteres."
        }
      } else if (campo === "apellido") {
        if (!value.trim()) {
          nuevoError = "El apellido es obligatorio."
        } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,}$/.test(value)) {
          nuevoError = "El apellido debe contener solo letras y tener al menos 2 caracteres."
        }
      } else if (campo === "documento") {
        if (!value.trim()) {
          nuevoError = "El número de documento es obligatorio."
        } else if (!/^\d{6,}$/.test(value)) {
          nuevoError = "El documento debe contener al menos 6 dígitos."
        }
      } else if (campo === "telefono") {
        if (!value.trim()) {
          nuevoError = "El teléfono es obligatorio."
        } else if (!/^\d{7,}$/.test(value)) {
          nuevoError = "El teléfono debe contener al menos 7 dígitos."
        }
      } else if (campo === "direccion") {
        if (!value.trim()) {
          nuevoError = "La dirección es obligatoria."
        } else if (value.length < 5) {
          nuevoError = "Por favor ingrese una dirección válida."
        }
      } else if (campo === "correo") {
        if (!value.trim()) {
          nuevoError = "El correo electrónico es obligatorio."
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          nuevoError = "Por favor ingrese un correo electrónico válido."
        }
      } else if (campo === "password") {
        if (!value.trim()) {
          nuevoError = "La contraseña es obligatoria."
        } else {
          const erroresPassword = []
          if (value.length < 8) {
            erroresPassword.push("al menos 8 caracteres")
          }
          if (!/(?=.*[A-Z])/.test(value)) {
            erroresPassword.push("una letra mayúscula")
          }
          if (!/(?=.*\d)/.test(value)) {
            erroresPassword.push("un número")
          }

          if (erroresPassword.length > 0) {
            nuevoError = "La contraseña debe contener: " + erroresPassword.join(", ") + "."
          }
        }
      } else if (campo === "confirmPassword") {
        if (!value.trim()) {
          nuevoError = "Debe confirmar la contraseña."
        } else if (value !== formData.password) {
          nuevoError = "Las contraseñas no coinciden."
        }
      }

      if (nuevoError) {
        nuevosErrores[campo] = nuevoError
      }
    }

    setErrores((prev) => ({ ...prev, ...nuevosErrores }))

    if (Object.keys(nuevosErrores).length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos o inválidos",
        text: "Por favor complete correctamente todos los campos requeridos",
        confirmButtonColor: "#0066ff",
      })
      return false
    }
    return true
  }

  const nextStep = () => {
    if (validarCamposPaso()) setStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validarCamposPaso()) return

    const dataToSend = { ...formData }
    delete dataToSend.confirmPassword

    try {
      Swal.fire({
        title: "Procesando...",
        text: "Estamos registrando tu cuenta",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })
      const res = await fetch("https://api-final-8rw7.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Error al registrar")

      Swal.fire({
        icon: "success",
        title: "¡Registro Exitoso!",
        text: "¡Tu cuenta ha sido creada correctamente!",
        confirmButtonColor: "#0066ff",
        timer: 2000,
      })
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Ocurrió un error al registrar tu cuenta",
        confirmButtonColor: "#0066ff",
      })
      setError(err.message)
    }
  }

  const renderInput = (type, name, placeholder, max, onInput) => (
    <div className="register-input-container">
      <input
        type={type}
        className={`register-input ${errores[name] ? "register-input-error" : ""}`}
        placeholder={placeholder}
        name={name}
        value={formData[name]}
        maxLength={max}
        onInput={onInput}
        onChange={handleChange}
        required
      />
      {errores[name] && <span className="perfil-validacion">{errores[name]}</span>}
    </div>
  )

  const soloNumeros = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "")
  }

  const soloLetras = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "")
  }

  const renderProgress = () => (
    <div className="register-progress-container" data-step={step}>
      {["Datos Personales", "Información de Contacto", "Seguridad"].map((label, index) => (
        <div key={index} className="register-progress-step">
          <div
            className={`register-progress-indicator ${step > index ? "register-progress-completed" : ""} ${step === index + 1 ? "register-progress-current" : ""}`}
          >
            {index + 1}
          </div>
          <div className="register-progress-label">{label}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="register-reset">
      <div className="register-page">
        <div className="register-bodyLogin">
          <div className="register-login-contendor">
            <div className="register-ca-login">
              <div className="register-contenedor-login">
                <div className="register-form-box">
                  <form className="register-form" onSubmit={handleSubmit} autoComplete="off">
                    <div className="register-logo-container">
                      <img src="/Logo.png" alt="Logo" className="register-logo" />
                    </div>
                    <h1 className="register-title">Registro</h1>
                    {renderProgress()}
                    <div className="register-form-container">
                      {step === 1 && (
                        <>
                          <div className="register-form-group">
                            <label className="register-label" htmlFor="nombre">
                              Nombres *
                            </label>
                            <input
                              type="text"
                              id="nombre"
                              name="nombre"
                              value={formData.nombre}
                              onChange={handleChange}
                              onBlur={(e) => validarCampo("nombre", e.target.value)}
                              className={`register-form-input ${errores.nombre ? "error" : ""}`}
                              placeholder="Juan"
                              autoComplete="off"
                            />
                            {errores.nombre && <span className="register-error-text">{errores.nombre}</span>}
                          </div>
                          <div className="register-form-group">
                            <label className="register-label" htmlFor="apellido">
                              Apellidos *
                            </label>
                            <input
                              type="text"
                              id="apellido"
                              name="apellido"
                              value={formData.apellido}
                              onChange={handleChange}
                              onBlur={(e) => validarCampo("apellido", e.target.value)}
                              className={`register-form-input ${errores.apellido ? "error" : ""}`}
                              placeholder="Perez"
                              autoComplete="off"
                            />
                            {errores.apellido && <span className="register-error-text">{errores.apellido}</span>}
                          </div>
                          <div className="register-form-group">
                            <label className="register-label" htmlFor="tipo_documento">
                              Tipo de documento *
                            </label>
                            <select
                              id="tipo_documento"
                              name="tipo_documento"
                              value={formData.tipo_documento}
                              onChange={handleChange}
                              onBlur={(e) => validarCampo("tipo_documento", e.target.value)}
                              className="register-form-input"
                            >
                              <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                              <option value="Tarjeta de identidad">Tarjeta de identidad</option>
                              <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                              <option value="Pasaporte">Pasaporte</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                          <div className="register-form-group">
                            <label className="register-label" htmlFor="documento">
                              Número de documento *
                            </label>
                            <input
                              type="text"
                              id="documento"
                              name="documento"
                              value={formData.documento}
                              onChange={handleChange}
                              onBlur={(e) => validarCampo("documento", e.target.value)}
                              className={`register-form-input ${errores.documento ? "error" : ""}`}
                              placeholder="00000000"
                              autoComplete="off"
                            />
                            {errores.documento && <span className="register-error-text">{errores.documento}</span>}
                          </div>
                        </>
                      )}
                      {step === 2 && (
                        <>
                          <div className="register-form-group">
                            <label className="register-label" htmlFor="telefono">
                              Teléfono *
                            </label>
                            <input
                              type="tel"
                              id="telefono"
                              name="telefono"
                              value={formData.telefono}
                              onChange={handleChange}
                              onBlur={(e) => validarCampo("telefono", e.target.value)}
                              className={`register-form-input ${errores.telefono ? "error" : ""}`}
                              placeholder="3003003030"
                              maxLength={15}
                              onInput={soloNumeros}
                              autoComplete="off"
                              required
                            />
                            {errores.telefono && <span className="register-error-text">{errores.telefono}</span>}
                          </div>
                          <div className="register-form-group">
                            <label className="register-label" htmlFor="direccion">
                              Dirección *
                            </label>
                            <input
                              type="text"
                              id="direccion"
                              name="direccion"
                              value={formData.direccion}
                              onChange={handleChange}
                              onBlur={(e) => validarCampo("direccion", e.target.value)}
                              className={`register-form-input ${errores.direccion ? "error" : ""}`}
                              placeholder="Dirección*"
                              maxLength={100}
                              autoComplete="off"
                              required
                            />
                            {errores.direccion && <span className="register-error-text">{errores.direccion}</span>}
                          </div>
                          <div className="register-form-group">
                            <label className="register-label" htmlFor="correo">
                              Correo *
                            </label>
                            <input
                              type="email"
                              id="correo"
                              name="correo"
                              value={formData.correo}
                              onChange={handleChange}
                              onBlur={(e) => validarCampo("correo", e.target.value)}
                              className={`register-form-input ${errores.correo ? "error" : ""}`}
                              placeholder="Correo electrónico*"
                              maxLength={254}
                              autoComplete="off"
                              required
                            />
                            {errores.correo && <span className="register-error-text">{errores.correo}</span>}
                          </div>
                        </>
                      )}
                      {step === 3 && (
                        <>
                          <div className="register-form-group">
                            <label className="register-label" htmlFor="password">
                              Contraseña *
                            </label>
                            <div className="register-password-container">
                              <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                maxLength={128}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={(e) => validarCampo("password", e.target.value)}
                                className={`register-form-input ${errores.password ? "error" : ""}`}
                                placeholder="Contraseña*"
                                autoComplete="off"
                                required
                              />
                              <span className="register-password-toggle" onClick={() => setShowPassword((p) => !p)}>
                                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                              </span>
                            </div>
                            {errores.password && <span className="register-error-text">{errores.password}</span>}
                          </div>
                          <div className="register-form-group">
                            <label className="register-label" htmlFor="confirmPassword">
                              Confirmar Contraseña *
                            </label>
                            <div className="register-password-container">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                maxLength={128}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={(e) => validarCampo("confirmPassword", e.target.value)}
                                className={`register-form-input ${errores.confirmPassword ? "error" : ""}`}
                                placeholder="Confirmar Contraseña*"
                                autoComplete="off"
                                required
                              />
                              <span
                                className="register-password-toggle"
                                onClick={() => setShowConfirmPassword((p) => !p)}
                              >
                                <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                              </span>
                            </div>
                            {errores.confirmPassword && (
                              <span className="register-error-text">{errores.confirmPassword}</span>
                            )}
                          </div>
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
                        <button type="submit" className="register-button register-button-primary">
                          <i className="fas fa-user-plus"></i> Crear Cuenta
                        </button>
                      )}
                    </div>
                  </form>
                  <div className="register-form-section">
                    <p>
                      ¿Ya tienes una cuenta? <a href="/login">Iniciar sesión</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

"use client"

// src/pages/auth/Login.jsx
import { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaExclamationTriangle,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa"
import "../../../../shared/styles/login.css"

function Login() {
  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    return () => {
      document.body.style.background = ""
    }
  }, [])

  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    correo: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [errores, setErrores] = useState({})

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
    validarCampo(name, value)
  }, [])

  const validarCampo = (name, value) => {
    let nuevoError = ""

    if (name === "correo") {
      if (!value.trim()) {
        nuevoError = "El correo electrónico es obligatorio."
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        nuevoError = "Por favor ingrese un correo electrónico válido."
      }
    } else if (name === "password") {
      if (!value.trim()) {
        nuevoError = "La contraseña es obligatoria."
      } else if (value.length < 6) {
        nuevoError = "La contraseña debe tener al menos 6 caracteres."
      }
    }

    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.correo.trim()) {
      nuevosErrores.correo = "El correo electrónico es obligatorio."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      nuevosErrores.correo = "Por favor ingrese un correo electrónico válido."
    }

    if (!formData.password.trim()) {
      nuevosErrores.password = "La contraseña es obligatoria."
    } else if (formData.password.length < 6) {
      nuevosErrores.password = "La contraseña debe tener al menos 6 caracteres."
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (!validarFormulario()) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch("https://api-final-8rw7.onrender.com/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Correo electrónico no registrado en el sistema")
          } else if (response.status === 401) {
            throw new Error("Correo o contraseña incorrectos.")
          } else if (data.message && data.message.includes("correo")) {
            throw new Error("Correo electrónico no encontrado")
          } else if (data.message && data.message.includes("contraseña")) {
            throw new Error("Contraseña incorrecta")
          } else {
            throw new Error(data.message || "Error al iniciar sesión")
          }
        }

        const usuario = data.usuario || {}
        const usuarioFinal = {
          nombre: `${usuario.nombre} ${usuario.apellido}`,
          rol: usuario.rol,
        }

        localStorage.setItem("token", data.token)
        localStorage.setItem("usuario", JSON.stringify(usuarioFinal))

        navigate("/dashboard")
      } catch (err) {
        setError(err.message || "Error en la conexión")
      } finally {
        setLoading(false)
      }
    },
    [formData, navigate],
  )

  const handleForgotPassword = () => {
    navigate("/recuperarContraseña")
  }

  const handleRegister = () => {
    navigate("/register")
  }

  return (
    <div className="login-body">
      <div className="login-container">
        <div className="login-wrapper">
          <div className="login-form-box">
            <div className="login-header">
              <div className="login-logo-container">
                <img src="/Logo.png" alt="Logo" className="login-logo" />
              </div>
              <h1 className="login-title">Iniciar Sesión</h1>
            </div>

            <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
              <div className="login-form-section">
                <div className="login-form-grid">
                  <div className="login-form-group">
                    <label htmlFor="correo" className="login-label">
                      <FaEnvelope className="login-label-icon" />
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      id="correo"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      className={`login-form-input ${errores.correo ? "error" : ""}`}
                      placeholder="ejemplo@correo.com"
                      required
                      autoComplete="email"
                    />
                    {errores.correo && (
                      <span className="login-error-text">
                        <FaExclamationTriangle /> {errores.correo}
                      </span>
                    )}
                  </div>

                  <div className="login-form-group">
                    <label htmlFor="password" className="login-label">
                      <FaLock className="login-label-icon" />
                      Contraseña *
                    </label>
                    <div className="login-password-container">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`login-form-input ${errores.password ? "error" : ""}`}
                        placeholder="Ingresa tu contraseña"
                        required
                        autoComplete="current-password"
                      />
                      <button type="button" className="login-password-toggle" onClick={togglePasswordVisibility}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errores.password && (
                      <span className="login-error-text">
                        <FaExclamationTriangle /> {errores.password}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="login-error-message">
                  <FaExclamationTriangle className="login-error-icon" />
                  {error}
                </div>
              )}
              <div className="">
                <center>
                   <button type="submit" disabled={loading} className="login-submit-button">
                  {loading ? (
                    <>
                      <FaSpinner className="login-button-icon spinning" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="login-button-icon" />
                      Iniciar Sesión
                    </>
                  )}
                </button>
                </center>
                <div className="login-options">
                  <button type="button" className="login-forgot-password" onClick={handleForgotPassword}>
                    ¿Olvidaste tu contraseña?
                  </button>
                   <p></p>
              <button type="button" className="login-register-button" onClick={handleRegister}>
                <FaUserPlus className="login-button-icon" />
                Crear cuenta
              </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

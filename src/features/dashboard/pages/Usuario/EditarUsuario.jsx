"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserTag,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa"

import Swal from "sweetalert2"
import "../../../../shared/styles/Usuarios/EditarUsuario.css"
import { validateField, commonValidationRules } from "../../../../shared/utils/validationUtils"

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Función para obtener token
const getValidToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token")
}

function EditarUsuario() {
  // ...existing hooks and logic...
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true)
        const usuarioData = await makeRequest(`/usuarios/${id}`)
        const rolesData = await makeRequest(`/roles`)
        if (usuarioData) {
          setUsuario({
            nombre: usuarioData.nombre || "",
            apellido: usuarioData.apellido || "",
            documento: usuarioData.documento || "",
            correo: usuarioData.correo || "",
            telefono: usuarioData.telefono || "",
            direccion: usuarioData.direccion || "",
            estado: usuarioData.estado || "",
            rol_id: usuarioData.rol_id || "",
          })
        }
        if (rolesData) {
          setRoles(rolesData)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        Swal.fire("Error", "No se pudieron cargar los datos del usuario", "error")
      } finally {
        setCargando(false)
      }
    }
    if (id) {
      cargarDatos()
    }
  }, [id, makeRequest])

        // ...existing code...

  const validarCampo = useCallback(
    (name, value) => {
      let rules = {}
      switch (name) {
        case "nombre":
          rules = commonValidationRules.nombre
          break
        case "apellido":
          rules = commonValidationRules.apellido
          break
        case "documento":
          rules = commonValidationRules.cedula
          break
        case "correo":
          rules = commonValidationRules.email
          break
        case "telefono":
          rules = commonValidationRules.phone
          break
        case "password":
          rules = commonValidationRules.password
          break
        default:
          rules = { required: true, fieldName: name }
      }
      if (name === "telefono_emergencia" && Number.parseInt(usuario.rol_id) === 3) {
        rules = { required: true, minLength: 10, onlyNumbers: true, fieldName: "Teléfono de emergencia" }
      }
      const error = validateField(value, rules)
      setErrores((prev) => ({ ...prev, [name]: error }))
    },
    [usuario.rol_id],
  )

  // Función para permitir solo números
  const soloNumeros = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "")
  }, [])

  // Función para permitir solo letras
  const soloLetras = useCallback((e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "")
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (!validarFormulario()) {
        await Swal.fire({
          icon: "warning",
          title: "Campos inválidos",
          text: "Por favor corrige los errores antes de continuar.",
          confirmButtonColor: "#2563eb",
        })
        return
      }

      setIsSubmitting(true)

      try {
        await makeRequest(`/usuarios/${id}`, {
          method: "PUT",
          body: JSON.stringify(usuario),
        })

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Usuario actualizado correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })

        navigate("/listarUsuarios")
      } catch (error) {
        console.error("Error al actualizar usuario:", error)
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "No se pudo actualizar el usuario",
          confirmButtonColor: "#ef4444",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [usuario, validarFormulario, makeRequest, id, navigate],
  )

  const handleCancel = useCallback(async () => {
    const result = await Swal.fire({
      title: "¿Cancelar edición?",
      text: "Se perderán todos los cambios realizados",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Continuar editando",
    })

    if (result.isConfirmed) {
      navigate("/listarUsuarios")
    }
  }, [navigate])

  if (cargando) {
    return (
      <div className="editarUsuario-container">
        <div className="editarUsuario-loading">
          <div className="editarUsuario-spinner"></div>
          <p>Cargando datos del usuario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editarUsuario-container">
      <div className="editarUsuario-header">
        <div className="editarUsuario-header-left">
          <button className="editarUsuario-btn-back" onClick={() => navigate("/listarUsuarios")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarUsuario-title-section">
            <h1 className="editarUsuario-page-title">
              <FaUser className="editarUsuario-title-icon" />
              Editar Usuario
            </h1>
            <p className="editarUsuario-subtitle">Modifica la información del usuario</p>
          </div>
        </div>
      </div>

      <form className="editarUsuario-form" onSubmit={handleSubmit}>
        <div className="editarUsuario-form-section">
          <h3 className="editarUsuario-section-title">
            <FaUser className="editarUsuario-section-icon" />
            Información Personal
          </h3>
          <div className="editarUsuario-form-grid">
            <div className="editarUsuario-form-group">
              <label htmlFor="nombre" className="editarUsuario-label">
                <FaUser className="editarUsuario-label-icon" />
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={usuario.nombre}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={30}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.nombre ? "error" : ""}`}
                required
              />
              {errores.nombre && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.nombre}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="apellido" className="editarUsuario-label">
                <FaUser className="editarUsuario-label-icon" />
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={usuario.apellido}
                onChange={handleChange}
                onInput={soloLetras}
                maxLength={35}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.apellido ? "error" : ""}`}
                required
              />
              {errores.apellido && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.apellido}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="tipo_documento" className="editarUsuario-label">
                <FaIdCard className="editarUsuario-label-icon" />
                Tipo Documento *
              </label>
              <select
                id="tipo_documento"
                name="tipo_documento"
                value={usuario.tipo_documento}
                onChange={handleChange}
                className={`editarUsuario-form-input ${errores.tipo_documento ? "error" : ""}`}
                required
                disabled // <-- Campo deshabilitado
              >
                <option>{usuario.tipo_documento}</option>
              </select>
              {errores.tipo_documento && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.tipo_documento}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="documento" className="editarUsuario-label">
                <FaIdCard className="editarUsuario-label-icon" />
                Documento *
              </label>
              <input
                type="text"
                id="documento"
                name="documento"
                value={usuario.documento}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={15}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.documento ? "error" : ""}`}
                required
                disabled // <-- Campo deshabilitado
              />
              {errores.documento && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.documento}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="correo" className="editarUsuario-label">
                <FaEnvelope className="editarUsuario-label-icon" />
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={usuario.correo}
                onChange={handleChange}
                maxLength={254}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.correo ? "error" : ""}`}
                required
              />
              {errores.correo && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.correo}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="telefono" className="editarUsuario-label">
                <FaPhone className="editarUsuario-label-icon" />
                Teléfono *
              </label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={usuario.telefono}
                onChange={handleChange}
                onInput={soloNumeros}
                maxLength={15}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.telefono ? "error" : ""}`}
                required
              />
              {errores.telefono && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.telefono}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group">
              <label htmlFor="direccion" className="editarUsuario-label">
                <FaMapMarkerAlt className="editarUsuario-label-icon" />
                Dirección *
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={usuario.direccion}
                onChange={handleChange}
                maxLength={100}
                autoComplete="off"
                className={`editarUsuario-form-input ${errores.direccion ? "error" : ""}`}
                required
              />
              {errores.direccion && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.direccion}
                </span>
              )}
            </div>

            <div className="editarUsuario-form-group" style={{ display: "none" }}>
              <label htmlFor="estado" className="editarUsuario-label">
                <FaUserTag className="editarUsuario-label-icon" />
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={usuario.estado}
                onChange={handleChange}
                className={`editarUsuario-form-input ${errores.estado ? "error" : ""}`}
                required
              >
                <option value="">Seleccionar estado</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              {errores.estado && (
                <span className="editarUsuario-error-text">
                  <FaExclamationTriangle /> {errores.estado}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="editarUsuario-form-actions">
          <button type="button" className="editarUsuario-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            <FaTimes className="editarUsuario-button-icon" />
            Cancelar
          </button>
          <button type="submit" className="editarUsuario-submit-button" disabled={isSubmitting || apiLoading}>
            {isSubmitting ? (
              <>
                <FaSpinner className="editarUsuario-button-icon spinning" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="editarUsuario-button-icon" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
export default EditarUsuario

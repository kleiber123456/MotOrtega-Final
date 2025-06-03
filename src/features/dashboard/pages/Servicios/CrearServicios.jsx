"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import "../../../../shared/styles/crearUsuarios.css"

const CrearServicio = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    estado: "Activo",
  })

  const [errores, setErrores] = useState({})

  const soloNumeros = (e) => {
    e.target.value = e.target.value.replace(/[^0-9.]/g, "")
  }

  const validarCampo = (name, value) => {
    let nuevoError = ""

    if (name === "nombre") {
      if (!value.trim()) {
        nuevoError = "El nombre es obligatorio."
      }
    } else if (name === "descripcion") {
      if (!value.trim()) {
        nuevoError = "La descripción es obligatoria."
      }
    } else if (name === "precio") {
      if (!value.trim()) {
        nuevoError = "El precio es obligatorio."
      } else if (isNaN(value) || Number.parseFloat(value) <= 0) {
        nuevoError = "El precio debe ser un número mayor a 0."
      }
    } else if (name === "estado") {
      if (!["Activo", "Inactivo"].includes(value)) {
        nuevoError = "Estado inválido."
      }
    }

    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio."
    }

    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria."
    }

    if (!formData.precio.trim()) {
      nuevosErrores.precio = "El precio es obligatorio."
    } else if (isNaN(formData.precio) || Number.parseFloat(formData.precio) <= 0) {
      nuevosErrores.precio = "El precio debe ser un número mayor a 0."
    }

    if (!["Activo", "Inactivo"].includes(formData.estado)) {
      nuevosErrores.estado = "Estado inválido."
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validarCampo(name, value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      Swal.fire({
        icon: "warning",
        title: "Campos inválidos",
        text: "Por favor corrige los errores antes de continuar.",
      })
      return
    }

    try {
      // Verificar duplicados
      const checkResponse = await fetch("https://api-final-8rw7.onrender.com/api/servicios", {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      })

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json()
        throw new Error(errorData.message || "Error al verificar duplicados.")
      }

      const servicios = await checkResponse.json()

      const servicioDuplicado = servicios.find((s) => s.nombre.toLowerCase() === formData.nombre.toLowerCase())

      if (servicioDuplicado) {
        Swal.fire("Duplicado detectado", "Ya existe un servicio con el mismo nombre.", "warning")
        return
      }

      const response = await fetch("https://api-final-8rw7.onrender.com/api/servicios", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          precio: Number.parseFloat(formData.precio),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear servicio.")
      }

      Swal.fire("Éxito", "Servicio creado exitosamente.", "success")
      navigate("/listarServicios")
    } catch (err) {
      console.error("Error en la creación/verificación:", err)
      Swal.fire("Error", err.message || "No se pudo crear el servicio.", "error")
    }
  }

  return (
    <div className="perfil__container">
      <form onSubmit={handleSubmit} className="perfil__form">
        <div className="perfil__title-container">
          <h2 className="perfil__title">Crear Servicio</h2>
        </div>

        <div className="perfil__grid-container">
          {/* Nombre */}
          <div className="perfil__field">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              maxLength={45}
              autoComplete="off"
              className={errores.nombre ? "input-error" : ""}
              required
            />
            {errores.nombre && <span className="perfil-validacion">{errores.nombre}</span>}
          </div>

          {/* Descripción */}
          <div className="perfil__field">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              maxLength={200}
              autoComplete="off"
              className={errores.descripcion ? "input-error" : ""}
              rows={3}
              required
            />
            {errores.descripcion && <span className="perfil-validacion">{errores.descripcion}</span>}
          </div>

          {/* Precio */}
          <div className="perfil__field">
            <label>Precio</label>
            <input
              type="text"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              onInput={soloNumeros}
              autoComplete="off"
              className={errores.precio ? "input-error" : ""}
              placeholder="0.00"
              required
            />
            {errores.precio && <span className="perfil-validacion">{errores.precio}</span>}
          </div>

          {/* Estado */}
          <div className="perfil__field">
            <label>Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className={errores.estado ? "input-error" : ""}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            {errores.estado && <span className="perfil-validacion">{errores.estado}</span>}
          </div>
        </div>

        <button type="submit" className="perfil__btn">
          Crear Servicio
        </button>
      </form>
    </div>
  )
}

export default CrearServicio

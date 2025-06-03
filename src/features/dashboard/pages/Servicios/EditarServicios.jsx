"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"
import "../../../../shared/styles/editarProveedor.css"

const EditarServicio = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    estado: "Activo",
  })

  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(true)

  const soloNumeros = (e) => {
    e.target.value = e.target.value.replace(/[^0-9.]/g, "")
  }

  // Validación individual de campo
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
    return nuevoError === ""
  }

  // Validación completa del formulario
  const validarFormulario = () => {
    let esValido = true

    if (!validarCampo("nombre", formulario.nombre)) esValido = false
    if (!validarCampo("descripcion", formulario.descripcion)) esValido = false
    if (!validarCampo("precio", formulario.precio)) esValido = false
    if (!validarCampo("estado", formulario.estado)) esValido = false

    return esValido
  }

  useEffect(() => {
    const obtenerServicio = async () => {
      setCargando(true)
      try {
        if (!token) {
          Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
          navigate("/login")
          return
        }
        const response = await axios.get(`https://api-final-8rw7.onrender.com/api/servicios/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })
        const data = response.data
        setFormulario({
          ...data,
          precio: data.precio.toString(),
          estado: data.estado.charAt(0).toUpperCase() + data.estado.slice(1),
        })
      } catch (error) {
        console.error("Error al obtener servicio:", error)
        Swal.fire("Error", "Error al cargar los datos del servicio.", "error")
        navigate("/listarServicios")
      } finally {
        setCargando(false)
      }
    }

    obtenerServicio()
  }, [id, navigate, token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
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
      if (!token) {
        Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
        navigate("/login")
        return
      }

      // Verificar duplicados excluyendo el servicio actual
      const checkResponse = await axios.get("https://api-final-8rw7.onrender.com/api/servicios", {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      })

      const servicios = checkResponse.data
      const servicioDuplicado = servicios.find(
        (s) => s.id !== Number.parseInt(id) && s.nombre.toLowerCase() === formulario.nombre.toLowerCase(),
      )

      if (servicioDuplicado) {
        Swal.fire("Duplicado detectado", "Ya existe otro servicio con el mismo nombre.", "warning")
        return
      }

      const estadoParaAPI = formulario.estado.toLowerCase()

      await axios.put(
        `https://api-final-8rw7.onrender.com/api/servicios/${id}`,
        {
          ...formulario,
          precio: Number.parseFloat(formulario.precio),
          estado: estadoParaAPI,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      )
      Swal.fire("Éxito", "Servicio actualizado exitosamente.", "success")
      navigate("/listarServicios")
    } catch (error) {
      console.error("Error al actualizar servicio:", error)
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "No se pudo actualizar el servicio."
      Swal.fire("Error", errorMessage, "error")
    }
  }

  if (cargando) {
    return (
      <div className="perfil__container">
        <div className="perfil__form">
          <div className="perfil__title-container">
            <h2 className="perfil__title">Cargando Servicio...</h2>
          </div>
          <p style={{ textAlign: "center", color: "#555" }}>Por favor, espere mientras cargamos la información.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="perfil__container">
      <form onSubmit={handleSubmit} className="perfil__form">
        <div className="perfil__title-container">
          <h2 className="perfil__title">Editar Servicio</h2>
        </div>

        <div className="perfil__grid-container">
          {/* Nombre */}
          <div className="perfil__field">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
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
              value={formulario.descripcion}
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
              value={formulario.precio}
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
              value={formulario.estado}
              onChange={handleChange}
              className={errores.estado ? "input-error" : ""}
              required
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            {errores.estado && <span className="perfil-validacion">{errores.estado}</span>}
          </div>
        </div>

        <button type="submit" className="perfil__btn">
          Actualizar Servicio
        </button>
      </form>
    </div>
  )
}

export default EditarServicio

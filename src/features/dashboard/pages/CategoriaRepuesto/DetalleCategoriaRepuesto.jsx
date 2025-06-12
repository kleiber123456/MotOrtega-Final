"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaTag, FaArrowLeft, FaEdit, FaToggleOn, FaToggleOff } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Categorias/DetalleCategoriaRepuesto.css"

const DetalleCategoriaRepuesto = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [categoria, setCategoria] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        setCargando(true)
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/categorias-repuestos/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Error al obtener la categoría")

        const data = await res.json()
        setCategoria(data)
      } catch (err) {
        setError(err.message)
        console.error("Error al cargar datos:", err)
        Swal.fire("Error", "No se pudieron cargar los datos de la categoría", "error")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      fetchCategoria()
    }
  }, [id, token])

  if (cargando) {
    return (
      <div className="detalleCategoriaRepuesto-container">
        <div className="detalleCategoriaRepuesto-loading">
          <div className="detalleCategoriaRepuesto-spinner"></div>
          <p>Cargando datos de la categoría...</p>
        </div>
      </div>
    )
  }

  if (error || !categoria) {
    return (
      <div className="detalleCategoriaRepuesto-container">
        <div className="detalleCategoriaRepuesto-error">
          <h2>Error al cargar la categoría</h2>
          <p>{error || "No se encontró la categoría"}</p>
          <button className="detalleCategoriaRepuesto-btn-back" onClick={() => navigate("/categorias-repuesto")}>
            <FaArrowLeft />
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleCategoriaRepuesto-container">
      <div className="detalleCategoriaRepuesto-header">
        <div className="detalleCategoriaRepuesto-header-left">
          <button className="detalleCategoriaRepuesto-btn-back" onClick={() => navigate("/categorias-repuesto")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="detalleCategoriaRepuesto-title-section">
            <h1 className="detalleCategoriaRepuesto-page-title">
              <FaTag className="detalleCategoriaRepuesto-title-icon" />
              Detalle de Categoría
            </h1>
            <p className="detalleCategoriaRepuesto-subtitle">Información completa de la categoría de repuesto</p>
          </div>
        </div>
        <button
          className="detalleCategoriaRepuesto-edit-button"
          onClick={() => navigate(`/categorias-repuesto/editar/${categoria.id}`)}
        >
          <FaEdit className="detalleCategoriaRepuesto-button-icon" />
          Editar Categoría
        </button>
      </div>

      <div className="detalleCategoriaRepuesto-content">
        <div className="detalleCategoriaRepuesto-card">
          <div className="detalleCategoriaRepuesto-card-header">
            <h3 className="detalleCategoriaRepuesto-card-title">
              <FaTag className="detalleCategoriaRepuesto-card-icon" />
              Información General
            </h3>
          </div>
          <div className="detalleCategoriaRepuesto-card-body">
            <div className="detalleCategoriaRepuesto-info-grid">
              <div className="detalleCategoriaRepuesto-info-item">
                <label className="detalleCategoriaRepuesto-info-label">
                  <FaTag className="detalleCategoriaRepuesto-info-icon" />
                  Nombre de la Categoría
                </label>
                <div className="detalleCategoriaRepuesto-info-value">{categoria.nombre}</div>
              </div>

              <div className="detalleCategoriaRepuesto-info-item">
                <label className="detalleCategoriaRepuesto-info-label">
                  {categoria.estado?.toLowerCase() === "activo" ? (
                    <FaToggleOn className="detalleCategoriaRepuesto-info-icon activo" />
                  ) : (
                    <FaToggleOff className="detalleCategoriaRepuesto-info-icon inactivo" />
                  )}
                  Estado
                </label>
                <div className="detalleCategoriaRepuesto-info-value">
                  <span
                    className={`detalleCategoriaRepuesto-estado-badge ${
                      categoria.estado?.toLowerCase() === "activo" ? "activo" : "inactivo"
                    }`}
                  >
                    {categoria.estado}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleCategoriaRepuesto

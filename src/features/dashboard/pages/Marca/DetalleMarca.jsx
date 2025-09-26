"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaTag, FaArrowLeft, FaEdit } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Marca/DetalleMarca.css"

const DetalleMarca = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [marca, setMarca] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMarca = async () => {
      try {
        setCargando(true)
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/marcas/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Error al obtener la marca")

        const data = await res.json()
        setMarca(data)
      } catch (err) {
        setError(err.message)
        console.error("Error al cargar datos:", err)
        Swal.fire("Error", "No se pudieron cargar los datos de la marca", "error")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      fetchMarca()
    }
  }, [id, token])

  if (cargando) {
    return (
      <div className="detalleMarca-container">
        <div className="detalleMarca-loading">
          <div className="detalleMarca-spinner"></div>
          <p>Cargando datos de la marca...</p>
        </div>
      </div>
    )
  }

  if (error || !marca) {
    return (
      <div className="detalleMarca-container">
        <div className="detalleMarca-error">
          <h2>Error al cargar la marca</h2>
          <p>{error || "No se encontró la marca"}</p>
          <button className="detalleMarca-btn-back" onClick={() => navigate("/marcas")}>
            <FaArrowLeft />
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleMarca-container">
      <div className="detalleMarca-header">
        <div className="detalleMarca-header-left">
          <button className="detalleMarca-btn-back" onClick={() => navigate("/marcas")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="detalleMarca-title-section">
            <h1 className="detalleMarca-page-title">
              <FaTag className="detalleMarca-title-icon" />
              Detalle de Marca
            </h1>
            <p className="detalleMarca-subtitle">Información completa de la marca</p>
          </div>
        </div>
        <button
          className="detalleMarca-edit-button"
          onClick={() => navigate(`/marcas/editar/${marca.id}`)}
        >
          <FaEdit className="detalleMarca-button-icon" />
          Editar Marca
        </button>
      </div>

      <div className="detalleMarca-content">
        <div className="detalleMarca-card">
          <div className="detalleMarca-card-header">
            <h3 className="detalleMarca-card-title">
              <FaTag className="detalleMarca-card-icon" />
              Información General
            </h3>
          </div>
          <div className="detalleMarca-card-body">
            <div className="detalleMarca-info-grid">
              <div className="detalleMarca-info-item">
                <label className="detalleMarca-info-label">
                  <FaTag className="detalleMarca-info-icon" />
                  Nombre de la Marca
                </label>
                <div className="detalleMarca-info-value">{marca.nombre}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleMarca

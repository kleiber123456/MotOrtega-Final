"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaTag, FaArrowLeft, FaEdit } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Referencia/DetalleReferencia.css"

const DetalleReferencia = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [referencia, setReferencia] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReferencia = async () => {
      try {
        setCargando(true)
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/referencias/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Error al obtener la referencia")

        const data = await res.json()
        setReferencia(data)
      } catch (err) {
        setError(err.message)
        console.error("Error al cargar datos:", err)
        Swal.fire("Error", "No se pudieron cargar los datos de la referencia", "error")
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      fetchReferencia()
    }
  }, [id, token])

  if (cargando) {
    return (
      <div className="detalleReferencia-container">
        <div className="detalleReferencia-loading">
          <div className="detalleReferencia-spinner"></div>
          <p>Cargando datos de la referencia...</p>
        </div>
      </div>
    )
  }

  if (error || !referencia) {
    return (
      <div className="detalleReferencia-container">
        <div className="detalleReferencia-error">
          <h2>Error al cargar la referencia</h2>
          <p>{error || "No se encontró la referencia"}</p>
          <button className="detalleReferencia-btn-back" onClick={() => navigate("/referencias")}>
            <FaArrowLeft />
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalleReferencia-container">
      <div className="detalleReferencia-header">
        <div className="detalleReferencia-header-left">
          <button className="detalleReferencia-btn-back" onClick={() => navigate("/referencias")}>
            <FaArrowLeft />
            Volver
          </button>
          <div className="detalleReferencia-title-section">
            <h1 className="detalleReferencia-page-title">
              <FaTag className="detalleReferencia-title-icon" />
              Detalle de Referencia
            </h1>
            <p className="detalleReferencia-subtitle">Información completa de la referencia</p>
          </div>
        </div>
        <button
          className="detalleReferencia-edit-button"
          onClick={() => navigate(`/referencias/editar/${referencia.id}`)}
        >
          <FaEdit className="detalleReferencia-button-icon" />
          Editar Referencia
        </button>
      </div>

      <div className="detalleReferencia-content">
        <div className="detalleReferencia-card">
          <div className="detalleReferencia-card-header">
            <h3 className="detalleReferencia-card-title">
              <FaTag className="detalleReferencia-card-icon" />
              Información General
            </h3>
          </div>
          <div className="detalleReferencia-card-body">
            <div className="detalleReferencia-info-grid">
              <div className="detalleReferencia-info-item">
                <label className="detalleReferencia-info-label">
                  <FaTag className="detalleReferencia-info-icon" />
                  Nombre de la Referencia
                </label>
                <div className="detalleReferencia-info-value">{referencia.nombre}</div>
              </div>
              <div className="detalleReferencia-info-item">
                <label className="detalleReferencia-info-label">
                  <FaTag className="detalleReferencia-info-icon" />
                  Descripción
                </label>
                <div className="detalleReferencia-info-value">{referencia.descripcion}</div>
              </div>
              <div className="detalleReferencia-info-item">
                <label className="detalleReferencia-info-label">
                  <FaTag className="detalleReferencia-info-icon" />
                  Marca
                </label>
                <div className="detalleReferencia-info-value">{referencia.marca_id}</div>
              </div>
              <div className="detalleReferencia-info-item">
                <label className="detalleReferencia-info-label">
                  <FaTag className="detalleReferencia-info-icon" />
                  Tipo de Vehículo
                </label>
                <div className="detalleReferencia-info-value">{referencia.tipo_vehiculo}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleReferencia

"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import "../../../../shared/styles/DetalleProveedor.css"

const DetalleServicio = () => {
  const { id } = useParams()
  const [servicio, setServicio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  useEffect(() => {
    const fetchServicio = async () => {
      setCargando(true)
      setError(null)
      try {
        if (!token) {
          setError("No autorizado: Token de autenticación no encontrado.")
          return
        }

        const response = await axios.get(`https://api-final-8rw7.onrender.com/api/servicios/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        setServicio(response.data)
      } catch (err) {
        console.error("Error al obtener servicio:", err)
        if (err.response && err.response.status === 401) {
          setError("No autorizado: La sesión ha expirado o no tienes permisos.")
        } else if (err.response && err.response.status === 404) {
          setError("Servicio no encontrado.")
        } else {
          setError(err.message || "Error al cargar los detalles del servicio.")
        }
      } finally {
        setCargando(false)
      }
    }

    fetchServicio()
  }, [id, token])

  if (cargando) {
    return (
      <div className="detalle-proveedor-contenedor">
        <h2 className="detalle-proveedor-titulo">Cargando detalles...</h2>
        <p className="detalle-proveedor-mensaje">Por favor, espera.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="detalle-proveedor-contenedor">
        <h2 className="detalle-proveedor-titulo">Error</h2>
        <p className="detalle-proveedor-mensaje error">{error}</p>
        <div className="detalle-proveedor-boton-contenedor">
          <Link to="/listarServicios" className="detalle-proveedor-boton secondary">
            Volver a la Lista
          </Link>
        </div>
      </div>
    )
  }

  if (!servicio) {
    return (
      <div className="detalle-proveedor-contenedor">
        <h2 className="detalle-proveedor-titulo">Servicio no disponible</h2>
        <p className="detalle-proveedor-mensaje">No se pudo cargar la información del servicio.</p>
        <div className="detalle-proveedor-boton-contenedor">
          <Link to="/listarServicios" className="detalle-proveedor-boton secondary">
            Volver a la Lista
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="detalle-proveedor-contenedor">
      <h1 className="detalle-proveedor-titulo">Detalle del Servicio</h1>

      <div className="detalle-proveedor-info-grid">
        <p className="detalle-proveedor-campo">
          <i className="fas fa-cog"></i> <strong>Nombre:</strong> {servicio.nombre}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-file-text"></i> <strong>Descripción:</strong> {servicio.descripcion}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-dollar-sign"></i> <strong>Precio:</strong> ${servicio.precio?.toLocaleString()}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-toggle-on"></i> <strong>Estado:</strong> {servicio.estado}
        </p>
      </div>

      <div className="detalle-proveedor-boton-contenedor">
        <Link to={`/servicios/editar/${id}`} className="detalle-proveedor-boton">
          <i className="fas fa-edit"></i> Editar Servicio
        </Link>
        <Link to="/listarServicios" className="detalle-proveedor-boton secondary">
          <i className="fas fa-arrow-left"></i> Volver a la Lista
        </Link>
      </div>
    </div>
  )
}

export default DetalleServicio

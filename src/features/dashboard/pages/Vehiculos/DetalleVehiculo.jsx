"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import "../../../../shared/styles/DetalleProveedor.css"

const DetalleVehiculo = () => {
  const { id } = useParams()
  const [vehiculo, setVehiculo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  useEffect(() => {
    const fetchVehiculo = async () => {
      setCargando(true)
      setError(null)
      try {
        if (!token) {
          setError("No autorizado: Token de autenticación no encontrado.")
          return
        }

        const response = await axios.get(`https://api-final-8rw7.onrender.com/api/vehiculos/${id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        setVehiculo(response.data)
      } catch (err) {
        console.error("Error al obtener vehículo:", err)
        if (err.response && err.response.status === 401) {
          setError("No autorizado: La sesión ha expirado o no tienes permisos.")
        } else if (err.response && err.response.status === 404) {
          setError("Vehículo no encontrado.")
        } else {
          setError(err.message || "Error al cargar los detalles del vehículo.")
        }
      } finally {
        setCargando(false)
      }
    }

    fetchVehiculo()
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
          <Link to="/vehiculos" className="detalle-proveedor-boton secondary">
            Volver a la Lista
          </Link>
        </div>
      </div>
    )
  }

  if (!vehiculo) {
    return (
      <div className="detalle-proveedor-contenedor">
        <h2 className="detalle-proveedor-titulo">Vehículo no disponible</h2>
        <p className="detalle-proveedor-mensaje">No se pudo cargar la información del vehículo.</p>
        <div className="detalle-proveedor-boton-contenedor">
          <Link to="/vehiculos" className="detalle-proveedor-boton secondary">
            Volver a la Lista
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="detalle-proveedor-contenedor">
      <h1 className="detalle-proveedor-titulo">Detalle del Vehículo</h1>

      <div className="detalle-proveedor-info-grid">
        <p className="detalle-proveedor-campo">
          <i className="fas fa-id-card"></i> <strong>Placa:</strong> {vehiculo.placa}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-palette"></i> <strong>Color:</strong> {vehiculo.color}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-car"></i> <strong>Tipo:</strong> {vehiculo.tipo_vehiculo}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-tag"></i> <strong>Marca:</strong> {vehiculo.marca_nombre || "N/A"}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-user"></i> <strong>Cliente:</strong> {vehiculo.cliente_nombre || "N/A"}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-cogs"></i> <strong>Referencia:</strong> {vehiculo.referencia_nombre || "N/A"}
        </p>
        <p className="detalle-proveedor-campo">
          <i className="fas fa-toggle-on"></i> <strong>Estado:</strong> {vehiculo.estado}
        </p>
      </div>

      <div className="detalle-proveedor-boton-contenedor">
        <Link to={`/vehiculos/editar/${id}`} className="detalle-proveedor-boton">
          <i className="fas fa-edit"></i> Editar Vehículo
        </Link>
        <Link to="/vehiculos" className="detalle-proveedor-boton secondary">
          <i className="fas fa-arrow-left"></i> Volver a la Lista
        </Link>
      </div>
    </div>
  )
}

export default DetalleVehiculo

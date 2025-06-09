"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FaArrowLeft, FaEdit, FaUser, FaMapMarkerAlt, FaEnvelope, FaPhone, FaIdCard } from "react-icons/fa"
import "../../../../shared/styles/Clientes/DetalleCliente.css"

const DetalleCliente = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        const response = await fetch(`https://api-final-8rw7.onrender.com/api/clientes/${id}`, {
          headers: {
            Authorization: token,
          },
        })

        if (!response.ok) throw new Error("Error al cargar el cliente")

        const data = await response.json()
        setCliente(data)
        setLoading(false)
      } catch (error) {
        console.error("Error al cargar cliente:", error)
        setLoading(false)
      }
    }

    cargarCliente()
  }, [id, token])

  if (loading) {
    return (
      <div className="detalleCliente-container">
        <div className="detalleCliente-loading">Cargando información del cliente...</div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="detalleCliente-container">
        <div className="detalleCliente-error">No se encontró el cliente solicitado</div>
      </div>
    )
  }

  return (
    <div className="detalleCliente-container">
      <div className="detalleCliente-header">
        <button className="detalleCliente-backButton" onClick={() => navigate("/dashboard/clientes")}>
          <FaArrowLeft /> Volver
        </button>
        <div className="detalleCliente-headerInfo">
          <h1 className="detalleCliente-title">
            {cliente.nombre} {cliente.apellido}
          </h1>
          <span className={`detalleCliente-status ${cliente.estado.toLowerCase()}`}>{cliente.estado}</span>
        </div>
        <button
          className="detalleCliente-editButton"
          onClick={() => navigate(`/dashboard/clientes/editar/${cliente.id}`)}
        >
          <FaEdit /> Editar
        </button>
      </div>

      <div className="detalleCliente-content">
        <div className="detalleCliente-mainInfo">
          <div className="detalleCliente-section">
            <h2 className="detalleCliente-sectionTitle">
              <FaUser /> Información Personal
            </h2>
            <div className="detalleCliente-infoGrid">
              <div className="detalleCliente-infoItem">
                <label>Nombre Completo:</label>
                <span>
                  {cliente.nombre} {cliente.apellido}
                </span>
              </div>
              <div className="detalleCliente-infoItem">
                <label>Tipo de Documento:</label>
                <span>{cliente.tipo_documento}</span>
              </div>
              <div className="detalleCliente-infoItem">
                <label>Número de Documento:</label>
                <span>{cliente.documento}</span>
              </div>
              <div className="detalleCliente-infoItem">
                <label>Dirección:</label>
                <span>{cliente.direccion}</span>
              </div>
              <div className="detalleCliente-infoItem">
                <label>Teléfono:</label>
                <span>{cliente.telefono}</span>
              </div>
              <div className="detalleCliente-infoItem">
                <label>Correo:</label>
                <span>{cliente.correo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleCliente
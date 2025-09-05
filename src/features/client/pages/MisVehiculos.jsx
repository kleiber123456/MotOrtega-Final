"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaCar, FaPlus, FaEdit, FaEye, FaTrash, FaTools, FaGasPump, FaSearch, FaHistory } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../shared/styles/Client/MisVehiculos.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const MisVehiculos = () => {
  const navigate = useNavigate()
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [userData, setUserData] = useState({})

  const makeRequest = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token disponible")
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error)
      throw error
    }
  }

  const fetchVehiculos = async () => {
    try {
      setLoading(true)
      const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")

      if (storedUser) {
        const user = JSON.parse(storedUser)
        setUserData(user)

        const response = await makeRequest(`/vehiculos/cliente/${user.id}`)
        const vehiculosData = Array.isArray(response) ? response : response?.data || []

        setVehiculos(vehiculosData)
      }
    } catch (error) {
      console.error("Error cargando vehículos:", error)
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los vehículos. Intenta nuevamente.",
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVehiculo = async (vehiculoId) => {
    const result = await Swal.fire({
      title: "¿Eliminar vehículo?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) return

    try {
      await makeRequest(`/vehiculos/cliente/eliminar/${vehiculoId}`, {
        method: "DELETE",
      })

      // Update local list
      setVehiculos(vehiculos.filter((v) => v.id !== vehiculoId))

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Vehículo eliminado exitosamente",
        confirmButtonColor: "#10b981",
        timer: 2000,
      })
    } catch (error) {
      console.error("Error eliminando vehículo:", error)
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al eliminar el vehículo. Inténtalo de nuevo.",
        confirmButtonColor: "#ef4444",
      })
    }
  }

  const filteredVehiculos = vehiculos.filter((vehiculo) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      vehiculo.placa?.toLowerCase().includes(searchLower) ||
      vehiculo.marca_nombre?.toLowerCase().includes(searchLower) ||
      vehiculo.referencia_nombre?.toLowerCase().includes(searchLower) ||
      vehiculo.color?.toLowerCase().includes(searchLower) ||
      vehiculo.tipo_vehiculo?.toLowerCase().includes(searchLower)
    )
  })

  useEffect(() => {
    fetchVehiculos()
  }, [])

  if (loading) {
    return (
      <div className="cvc-lista-body">
        <div className="cvc-lista-header">
          <div className="cvc-lista-header-content">
            <img className="cvc-lista-logo" src="/perfil.jpg" alt="Logo" />
            <div className="cvc-lista-title-container">
              <span className="cvc-lista-subtitle">Cargando...</span>
              <h1>Mis Vehículos</h1>
            </div>
          </div>
        </div>
        <div className="cvc-lista-section">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "1.2rem", color: "#666" }}>Cargando vehículos...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cvc-lista-body">
      <div className="cvc-lista-header">
        <div className="cvc-lista-header-content">
          <img className="cvc-lista-logo" src="/perfil.jpg" alt="Logo" />
          <div className="cvc-lista-title-container">
            <span className="cvc-lista-subtitle">Gestión de</span>
            <h1>Mis Vehículos</h1>
          </div>
          <button
            className="cvc-lista-add-btn"
            onClick={() => navigate("/client/vehiculos/crear")}
            aria-label="Agregar vehículo"
          >
            <FaPlus />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      <div className="cvc-lista-section">
        {/* Quick stats */}
        <div className="cvc-lista-stats">
          <div className="cvc-lista-stat-card info">
            <div className="cvc-lista-stat-icon">
              <FaCar />
            </div>
            <div className="cvc-lista-stat-content">
              <h3>{vehiculos.length}</h3>
              <p>Total Vehículos</p>
            </div>
          </div>
          <div className="cvc-lista-stat-card success">
            <div className="cvc-lista-stat-icon">
              <FaTools />
            </div>
            <div className="cvc-lista-stat-content">
              <h3>{vehiculos.filter((v) => v.tipo_vehiculo === "Automóvil").length}</h3>
              <p>Automóviles</p>
            </div>
          </div>
          <div className="cvc-lista-stat-card warning">
            <div className="cvc-lista-stat-icon">
              <FaGasPump />
            </div>
            <div className="cvc-lista-stat-content">
              <h3>{vehiculos.filter((v) => v.tipo_vehiculo === "Moto").length}</h3>
              <p>Motocicletas</p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="cvc-lista-search-container">
          <div className="cvc-lista-search-box">
            <FaSearch style={{ color: "#666", marginRight: "0.5rem" }} />
            <input
              type="text"
              placeholder="Buscar por placa, marca, modelo, color o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Vehicle list */}
      <div className="cvc-lista-section">
        <div className="cvc-lista-section-header">
          <h2 className="cvc-lista-section-title">
            <FaCar className="cvc-lista-section-icon" />
            Mis Vehículos ({filteredVehiculos.length})
          </h2>
        </div>

        {filteredVehiculos.length > 0 ? (
          <div className="cvc-lista-vehiculos-grid">
            {filteredVehiculos.map((vehiculo) => (
              <div key={vehiculo.id} className="cvc-lista-vehiculo-card">
                <div className="cvc-lista-vehiculo-header">
                  <div>
                    <h4>
                      {vehiculo.marca_nombre} {vehiculo.referencia_nombre}
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.9rem",
                        color: "#6b7280",
                      }}
                    >
                      <span className="cvc-lista-vehiculo-placa">{vehiculo.placa}</span>
                      <span>{vehiculo.tipo_vehiculo}</span>
                    </div>
                  </div>
                  <div className="cvc-lista-vehiculo-actions">
                    <button
                      onClick={() => navigate(`/client/vehiculos/detalle/${vehiculo.id}`)}
                      className="cvc-lista-action-btn view"
                      title="Ver detalle"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => navigate(`/client/vehiculos/editar/${vehiculo.id}`)}
                      className="cvc-lista-action-btn edit"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteVehiculo(vehiculo.id)}
                      className="cvc-lista-action-btn delete"
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => navigate(`/client/vehiculos/historial/${vehiculo.id}`)}
                      className="cvc-lista-action-btn history"
                      title="Ver historial"
                    >
                      <FaHistory />
                    </button>
                  </div>
                </div>

                <div className="cvc-lista-vehiculo-info">
                  <div>
                    <strong>Color:</strong>
                    <span>{vehiculo.color || "N/A"}</span>
                  </div>
                  <div>
                    <strong>Tipo:</strong>
                    <span>{vehiculo.tipo_vehiculo || "N/A"}</span>
                  </div>
                  <div>
                    <strong>Estado:</strong>
                    <span style={{ color: vehiculo.estado === "Activo" ? "#10b981" : "#ef4444", fontWeight: "500" }}>
                      {vehiculo.estado || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cvc-lista-empty-state">
            {searchTerm ? (
              <>
                <FaSearch />
                <h3>No se encontraron vehículos</h3>
                <p>No hay vehículos que coincidan con "{searchTerm}"</p>
                <button onClick={() => setSearchTerm("")} className="cvc-lista-empty-btn">
                  Limpiar búsqueda
                </button>
              </>
            ) : (
              <>
                <FaCar />
                <h3>No tienes vehículos registrados</h3>
                <p>Agrega tu primer vehículo para comenzar a gestionar tus servicios</p>
                <button onClick={() => navigate("/client/vehiculos/crear")} className="cvc-lista-empty-btn">
                  <FaPlus />
                  Agregar Vehículo
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MisVehiculos

"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaCar, FaPlus, FaEdit, FaEye, FaTrash, FaTools, FaGasPump, FaSearch, FaHistory, FaSignOutAlt } from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../shared/styles/Client/MisVehiculos.css"
import "../../../shared/components/layout/dashclient.css"

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

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("usuario")
    navigate("/")
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
      <div className="dashC-body">
        <div className="dashC-header">
          <div className="dashC-header-content">
            <img className="dashC-logo" src="/perfil.jpg" alt="Logo" />
            <div className="dashC-title-container">
              <h1 className="dashC-title">Mis Vehículos</h1>
            </div>
          </div>
        </div>
        <div className="dashC-Section1">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "1.2rem", color: "#666" }}>Cargando vehículos...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashC-body">
      <div className="dashC-header">
        <div className="dashC-header-content">
          <img className="dashC-logo" src="/perfil.jpg" alt="Logo" />
          <div className="dashC-title-container">
            <h1 className="dashC-title">Mis Vehículos</h1>
          </div>
          <button className="layC-nav-btn-S" onClick={handleLogout} aria-label="Cerrar sesión">
            <FaSignOutAlt />
            <span className="layC-nav-label">Salir</span>
          </button>
        </div>
      </div>

      {/* Vehicle list */}
      <div className="dashC-Section1">
        <div className="dashC-content">
          <div className="cvc-lista-section-header">
            <h2 className="cvc-lista-section-title">
            </h2>
          </div>
          <div className="cvc-lista-search-container">
            <div className="cvc-lista-search-box">
              <FaSearch style={{ color: "#666", marginRight: "0.5rem" }} />
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <button
              className="cvc-lista-add-btn"
              onClick={() => navigate("/client/vehiculos/crear")}
              aria-label="Agregar vehículo"
            >
              <FaPlus />
            </button>
          </div>

          {filteredVehiculos.length > 0 ? (
            <div className="cvc-lista-vehiculos-grid">
              {filteredVehiculos.map((vehiculo) => (
                <div key={vehiculo.id} className="cvc-lista-vehiculo-card">
                  <div className="cvc-lista-vehiculo-header">
                    <div className="cvc-lista-vehiculo-main-info">
                      <div className="cvc-lista-vehiculo-icon-container">
                        <FaCar />
                      </div>
                      <div>
                        <h4>
                          {vehiculo.marca_nombre} {vehiculo.referencia_nombre}
                        </h4>
                        <div className="cvc-lista-vehiculo-sub-info">
                          <div>
                          <span className="cvc-lista-vehiculo-placa">{vehiculo.placa}</span>
                          </div>
                          <span>{vehiculo.tipo_vehiculo}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="cvc-lista-vehiculo-details">
                    <div className="cvc-lista-detail-item">
                      <strong>Color:</strong>
                      <span>{vehiculo.color || "N/A"}</span>
                    </div>
                    <div className="cvc-lista-detail-item">
                      <strong>Estado:</strong>
                      <span className={`cvc-lista-status ${vehiculo.estado === "Activo" ? "active" : "inactive"}`}>
                        {vehiculo.estado || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="cvc-lista-vehiculo-actions">
                    <button
                      onClick={() => navigate(`/client/vehiculos/detalle/${vehiculo.id}`)}
                      className="cvc-lista-action-btn"
                      title="Ver detalle"
                    >
                      <FaEye />
                      <span>Ver</span>
                    </button>
                    <button
                      onClick={() => navigate(`/client/vehiculos/editar/${vehiculo.id}`)}
                      className="cvc-lista-action-btn"
                      title="Editar"
                    >
                      <FaEdit />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteVehiculo(vehiculo.id)}
                      className="cvc-lista-action-btn delete"
                      title="Eliminar"
                    >
                      <FaTrash />
                      <span>Eliminar</span>
                    </button>
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
    </div>
  )
}

export default MisVehiculos

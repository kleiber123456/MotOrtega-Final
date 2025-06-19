"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import "../../../../shared/styles/Citas/CrearCita.css"
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCar,
  FaTools,
  FaClipboardList,
  FaArrowLeft,
  FaSearch,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa"
import { CheckCircle } from "lucide-react"
import { FaPlus } from "react-icons/fa"

// URL base de la API
const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Componente del modal para clientes
const ClienteModal = ({ show, onClose, clientes, onSelect, clienteActual }) => {
  const [busquedaCliente, setBusquedaCliente] = useState("")
  const [clientesPorPagina] = useState(5)
  const [paginaActualClientes, setPaginaActualClientes] = useState(1)
  const modalRef = useRef(null)

  useEffect(() => {
    if (show) {
      setBusquedaCliente("")
      setPaginaActualClientes(1)
    }
  }, [show])

  // Cerrar modal al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (show) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [show, onClose])

  // Filtrar clientes basado en la búsqueda
  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      cliente.apellido?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      cliente.documento?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      cliente.correo?.toLowerCase().includes(busquedaCliente.toLowerCase()),
  )

  // Calcular índices para la paginación
  const indiceUltimoCliente = paginaActualClientes * clientesPorPagina
  const indicePrimerCliente = indiceUltimoCliente - clientesPorPagina
  const clientesActuales = clientesFiltrados.slice(indicePrimerCliente, indiceUltimoCliente)
  const totalPaginasClientes = Math.ceil(clientesFiltrados.length / clientesPorPagina)

  // Función para ir a la página anterior
  const irPaginaAnterior = () => {
    setPaginaActualClientes((prev) => Math.max(prev - 1, 1))
  }

  // Función para ir a la página siguiente
  const irPaginaSiguiente = () => {
    setPaginaActualClientes((prev) => Math.min(prev + 1, totalPaginasClientes))
  }

  // Función para manejar el cambio de búsqueda
  const handleBusquedaChange = (e) => {
    setBusquedaCliente(e.target.value)
    setPaginaActualClientes(1)
  }

  if (!show) return null

  return (
    <div className="listarCompra-modal-overlay">
      <div className="listarCompra-proveedor-modal" ref={modalRef}>
        <div className="listarCompra-proveedor-modal-header">
          <h2>
            <FaUser className="listarCompra-modal-header-icon" />
            Seleccionar Cliente
          </h2>
          <button type="button" className="listarCompra-proveedor-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="listarCompra-proveedor-modal-content">
          {/* Buscador centrado */}
          <div className="listarCompra-proveedor-search-container">
            <div className="listarCompra-proveedor-search-wrapper">
              <FaSearch className="listarCompra-proveedor-search-icon" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={busquedaCliente}
                onChange={handleBusquedaChange}
                className="listarCompra-proveedor-search-input"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de clientes con paginación */}
          <div className="listarCompra-proveedor-list">
            {clientesActuales.length === 0 ? (
              <div className="listarCompra-proveedor-no-results">
                <FaExclamationTriangle className="listarCompra-proveedor-no-results-icon" />
                <p>{busquedaCliente ? "No se encontraron clientes" : "No hay clientes disponibles"}</p>
              </div>
            ) : (
              <table className="listarCompra-proveedor-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesActuales.map((cliente) => (
                    <tr key={cliente.id} className="listarCompra-proveedor-row">
                      <td>
                        <div className="listarCompra-proveedor-name">
                          {cliente.nombre} {cliente.apellido}
                        </div>
                      </td>
                      <td>{cliente.documento || "N/A"}</td>
                      <td>
                        <button
                          type="button"
                          className="listarCompra-proveedor-select-button"
                          onClick={() => onSelect(cliente)}
                        >
                          <CheckCircle /> Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Controles de paginación */}
          {totalPaginasClientes > 1 && (
            <div className="listarCompra-proveedor-pagination">
              <button
                onClick={irPaginaAnterior}
                disabled={paginaActualClientes === 1}
                className="listarCompra-proveedor-pagination-button"
                type="button"
              >
                Anterior
              </button>

              <span className="listarCompra-proveedor-page-info">
                Página {paginaActualClientes} de {totalPaginasClientes}
                {clientesFiltrados.length > 0 && (
                  <span className="listarCompra-proveedor-total-info">
                    {" "}
                    ({clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? "s" : ""})
                  </span>
                )}
              </span>

              <button
                onClick={irPaginaSiguiente}
                disabled={paginaActualClientes === totalPaginasClientes}
                className="listarCompra-proveedor-pagination-button"
                type="button"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente del modal para mecánicos, filtrando por ausencia
const MecanicoModal = ({ show, onClose, mecanicos, onSelect, mecanicoActual, fechaSeleccionada, novedades }) => {
  const [busquedaMecanico, setBusquedaMecanico] = useState("")
  const [mecanicosPorPagina] = useState(5)
  const [paginaActualMecanicos, setPaginaActualMecanicos] = useState(1)
  const modalRef = useRef(null)

  useEffect(() => {
    if (show) {
      setBusquedaMecanico("")
      setPaginaActualMecanicos(1)
    }
  }, [show])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }
    if (show) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [show, onClose])

  // Filtrar mecánicos basado en la búsqueda y AUSENCIA en la fecha seleccionada
  const mecanicosFiltrados = mecanicos.filter((mecanico) => {
    const coincideBusqueda =
      mecanico.nombre?.toLowerCase().includes(busquedaMecanico.toLowerCase()) ||
      mecanico.apellido?.toLowerCase().includes(busquedaMecanico.toLowerCase()) ||
      mecanico.documento?.toLowerCase().includes(busquedaMecanico.toLowerCase()) ||
      mecanico.correo?.toLowerCase().includes(busquedaMecanico.toLowerCase())

    // Si hay fecha seleccionada y novedades, filtra ausencias
    if (fechaSeleccionada && novedades && novedades.length > 0) {
      const tieneAusencia = novedades.some(
        (n) =>
          n.mecanico_id === mecanico.id &&
          n.tipo_novedad === "Ausencia" &&
          (n.fecha && n.fecha.split("T")[0]) === fechaSeleccionada, // <-- CORRECCIÓN AQUÍ
      )
      return coincideBusqueda && !tieneAusencia
    }
    return coincideBusqueda
  })

  // Paginación
  const indiceUltimoMecanico = paginaActualMecanicos * mecanicosPorPagina
  const indicePrimerMecanico = indiceUltimoMecanico - mecanicosPorPagina
  const mecanicosActuales = mecanicosFiltrados.slice(indicePrimerMecanico, indiceUltimoMecanico)
  const totalPaginasMecanicos = Math.ceil(mecanicosFiltrados.length / mecanicosPorPagina)

  const irPaginaAnterior = () => setPaginaActualMecanicos((prev) => Math.max(prev - 1, 1))
  const irPaginaSiguiente = () => setPaginaActualMecanicos((prev) => Math.min(prev + 1, totalPaginasMecanicos))
  const handleBusquedaChange = (e) => {
    setBusquedaMecanico(e.target.value)
    setPaginaActualMecanicos(1)
  }

  if (!show) return null

  return (
    <div className="listarCompra-modal-overlay">
      <div className="listarCompra-proveedor-modal" ref={modalRef}>
        <div className="listarCompra-proveedor-modal-header">
          <h2>
            <FaTools className="listarCompra-modal-header-icon" />
            Seleccionar Mecánico
          </h2>
          <button type="button" className="listarCompra-proveedor-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="listarCompra-proveedor-modal-content">
          <div className="listarCompra-proveedor-search-container">
            <div className="listarCompra-proveedor-search-wrapper">
              <FaSearch className="listarCompra-proveedor-search-icon" />
              <input
                type="text"
                placeholder="Buscar mecánico..."
                value={busquedaMecanico}
                onChange={handleBusquedaChange}
                className="listarCompra-proveedor-search-input"
                autoFocus
              />
            </div>
          </div>
          <div className="listarCompra-proveedor-list">
            {mecanicosActuales.length === 0 ? (
              <div className="listarCompra-proveedor-no-results">
                <FaExclamationTriangle className="listarCompra-proveedor-no-results-icon" />
                <p>{busquedaMecanico ? "No se encontraron mecánicos" : "No hay mecánicos disponibles"}</p>
              </div>
            ) : (
              <table className="listarCompra-proveedor-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Correo</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {mecanicosActuales.map((mecanico) => (
                    <tr key={mecanico.id} className="listarCompra-proveedor-row">
                      <td>
                        <div className="listarCompra-proveedor-name">
                          {mecanico.nombre} {mecanico.apellido}
                        </div>
                      </td>
                      <td>{mecanico.documento || "N/A"}</td>
                      <td>{mecanico.correo || "N/A"}</td>
                      <td>
                        <button
                          type="button"
                          className="listarCompra-proveedor-select-button"
                          onClick={() => onSelect(mecanico)}
                        >
                          <CheckCircle /> Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {totalPaginasMecanicos > 1 && (
            <div className="listarCompra-proveedor-pagination">
              <button
                onClick={irPaginaAnterior}
                disabled={paginaActualMecanicos === 1}
                className="listarCompra-proveedor-pagination-button"
                type="button"
              >
                Anterior
              </button>
              <span className="listarCompra-proveedor-page-info">
                Página {paginaActualMecanicos} de {totalPaginasMecanicos}
                {mecanicosFiltrados.length > 0 && (
                  <span className="listarCompra-proveedor-total-info">
                    {" "}
                    ({mecanicosFiltrados.length} mecánico{mecanicosFiltrados.length !== 1 ? "s" : ""})
                  </span>
                )}
              </span>
              <button
                onClick={irPaginaSiguiente}
                disabled={paginaActualMecanicos === totalPaginasMecanicos}
                className="listarCompra-proveedor-pagination-button"
                type="button"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente del modal para vehículos
const VehiculoModal = ({ show, onClose, vehiculos, onSelect, vehiculoActual }) => {
  const [busquedaVehiculo, setBusquedaVehiculo] = useState("")
  const [vehiculosPorPagina] = useState(5)
  const [paginaActualVehiculos, setPaginaActualVehiculos] = useState(1)
  const modalRef = useRef(null)

  useEffect(() => {
    if (show) {
      setBusquedaVehiculo("")
      setPaginaActualVehiculos(1)
    }
  }, [show])

  // Cerrar modal al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (show) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [show, onClose])

  // Filtrar vehículos basado en la búsqueda
  const vehiculosFiltrados = vehiculos.filter(
    (vehiculo) =>
      vehiculo.placa?.toLowerCase().includes(busquedaVehiculo.toLowerCase()) ||
      vehiculo.color?.toLowerCase().includes(busquedaVehiculo.toLowerCase()) ||
      vehiculo.tipo_vehiculo?.toLowerCase().includes(busquedaVehiculo.toLowerCase()) ||
      vehiculo.referencia?.nombre?.toLowerCase().includes(busquedaVehiculo.toLowerCase()) ||
      vehiculo.referencia?.marca?.nombre?.toLowerCase().includes(busquedaVehiculo.toLowerCase()) ||
      vehiculo.marca_nombre?.toLowerCase().includes(busquedaVehiculo.toLowerCase()) ||
      vehiculo.referencia_nombre?.toLowerCase().includes(busquedaVehiculo.toLowerCase()),
  )

  // Calcular índices para la paginación
  const indiceUltimoVehiculo = paginaActualVehiculos * vehiculosPorPagina
  const indicePrimerVehiculo = indiceUltimoVehiculo - vehiculosPorPagina
  const vehiculosActuales = vehiculosFiltrados.slice(indicePrimerVehiculo, indiceUltimoVehiculo)
  const totalPaginasVehiculos = Math.ceil(vehiculosFiltrados.length / vehiculosPorPagina)

  // Función para ir a la página anterior
  const irPaginaAnterior = () => {
    setPaginaActualVehiculos((prev) => Math.max(prev - 1, 1))
  }

  // Función para ir a la página siguiente
  const irPaginaSiguiente = () => {
    setPaginaActualVehiculos((prev) => Math.min(prev + 1, totalPaginasVehiculos))
  }

  // Función para manejar el cambio de búsqueda
  const handleBusquedaChange = (e) => {
    setBusquedaVehiculo(e.target.value)
    setPaginaActualVehiculos(1)
  }

  if (!show) return null

  return (
    <div className="listarCompra-modal-overlay">
      <div className="listarCompra-proveedor-modal" ref={modalRef}>
        <div className="listarCompra-proveedor-modal-header">
          <h2>
            <FaCar className="listarCompra-modal-header-icon" />
            Seleccionar Vehículo
          </h2>
          <button type="button" className="listarCompra-proveedor-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="listarCompra-proveedor-modal-content">
          {/* Buscador centrado */}
          <div className="listarCompra-proveedor-search-container">
            <div className="listarCompra-proveedor-search-wrapper">
              <FaSearch className="listarCompra-proveedor-search-icon" />
              <input
                type="text"
                placeholder="Buscar vehículo..."
                value={busquedaVehiculo}
                onChange={handleBusquedaChange}
                className="listarCompra-proveedor-search-input"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de vehículos con paginación */}
          <div className="listarCompra-proveedor-list">
            {vehiculosActuales.length === 0 ? (
              <div className="listarCompra-proveedor-no-results">
                <FaExclamationTriangle className="listarCompra-proveedor-no-results-icon" />
                <p>{busquedaVehiculo ? "No se encontraron vehículos" : "No hay vehículos disponibles"}</p>
              </div>
            ) : (
              <table className="listarCompra-proveedor-table">
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Marca/Modelo</th>
                    <th>Color</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiculosActuales.map((vehiculo) => (
                    <tr key={vehiculo.id} className="listarCompra-proveedor-row">
                      <td>
                        <div className="listarCompra-proveedor-name">{vehiculo.placa || "N/A"}</div>
                      </td>
                      <td>
                        {vehiculo.referencia?.marca?.nombre || vehiculo.marca_nombre || ""}{" "}
                        {vehiculo.referencia?.nombre || vehiculo.referencia_nombre || "N/A"}
                      </td>
                      <td>{vehiculo.color || "N/A"}</td>
                      <td>
                        <button
                          type="button"
                          className="listarCompra-proveedor-select-button"
                          onClick={() => onSelect(vehiculo)}
                        >
                          <CheckCircle /> Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Controles de paginación */}
          {totalPaginasVehiculos > 1 && (
            <div className="listarCompra-proveedor-pagination">
              <button
                onClick={irPaginaAnterior}
                disabled={paginaActualVehiculos === 1}
                className="listarCompra-proveedor-pagination-button"
                type="button"
              >
                Anterior
              </button>

              <span className="listarCompra-proveedor-page-info">
                Página {paginaActualVehiculos} de {totalPaginasVehiculos}
                {vehiculosFiltrados.length > 0 && (
                  <span className="listarCompra-proveedor-total-info">
                    {" "}
                    ({vehiculosFiltrados.length} vehículo{vehiculosFiltrados.length !== 1 ? "s" : ""})
                  </span>
                )}
              </span>

              <button
                onClick={irPaginaSiguiente}
                disabled={paginaActualVehiculos === totalPaginasVehiculos}
                className="listarCompra-proveedor-pagination-button"
                type="button"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente del modal para horas con filtrado correcto por mecánico y fecha
const HoraModal = ({
  show,
  onClose,
  onSelect,
  horaActual,
  horariosMecanico = [],
  citasMecanico = [],
  formData = {},
}) => {
  const modalRef = useRef(null)
  useEffect(() => {
    if (show) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) onClose()
    }
  }, [show, onClose])

  // Generar horas disponibles
  const generarHoras = () => {
    const horas = []
    for (let i = 8; i < 18; i++) {
      const hora = `${i.toString().padStart(2, "0")}:00`
      horas.push({
        id: hora,
        hora: hora,
        descripcion: `${hora} - ${(i + 1).toString().padStart(2, "0")}:00`,
      })
    }
    return horas
  }

  // Filtrar solo novedades del mecánico y la fecha seleccionada
  const fechaSeleccionada = formData?.fecha
  const mecanicoId = Number(formData?.mecanico_id)
  const novedadesFiltradas = horariosMecanico.filter(
    (n) => n.mecanico_id === mecanicoId && n.fecha && n.fecha.split("T")[0] === fechaSeleccionada,
  )

  // Si hay una novedad de tipo Ausencia, no mostrar horas
  const tieneAusencia = novedadesFiltradas.some((n) => n.tipo_novedad === "Ausencia")

  // Filtrar horas según novedades (horarios) y citas
  const todasLasHoras = generarHoras()
  const horasBloqueadas = []
  novedadesFiltradas.forEach((novedad) => {
    if (novedad.tipo_novedad === "Ausencia") {
      todasLasHoras.forEach((h) => horasBloqueadas.push(h.hora))
      console.log(
        `[NOVEDAD] Ausencia - Fecha: ${novedad.fecha} | Mecánico: ${novedad.mecanico_id} | Bloquea todas las horas`,
      )
    } else if (novedad.hora_inicio && novedad.hora_fin) {
      const inicio = Number.parseInt(novedad.hora_inicio.split(":")[0])
      const fin = Number.parseInt(novedad.hora_fin.split(":")[0])
      for (let h = inicio; h < fin; h++) {
        horasBloqueadas.push(`${h.toString().padStart(2, "0")}:00`)
        console.log(
          `[NOVEDAD] ${novedad.tipo_novedad} - Fecha: ${novedad.fecha} | Mecánico: ${novedad.mecanico_id} | Bloquea: ${h.toString().padStart(2, "0")}:00`,
        )
      }
    }
  })
  // Normaliza las horas ocupadas por citas SOLO si la fecha y el mecánico coinciden
  const horasOcupadas = citasMecanico
    .filter((cita) => {
      // Normaliza la fecha de la cita a formato YYYY-MM-DD
      if (!cita.fecha) return false
      const fechaCita = cita.fecha.includes("T") ? cita.fecha.split("T")[0] : cita.fecha
      // Solo bloquea si el mecánico y la fecha coinciden
      return fechaCita === fechaSeleccionada && Number(cita.mecanico_id) === mecanicoId
    })
    .map((cita) => {
      // Normaliza la hora a "HH:MM"
      if (typeof cita.hora === "string" && cita.hora.length >= 5) {
        return cita.hora.slice(0, 5)
      }
      return cita.hora
    })

  const horasNoDisponibles = Array.from(new Set([...horasBloqueadas, ...horasOcupadas]))
  const horasFiltradas = todasLasHoras.filter((hora) => !horasNoDisponibles.includes(hora.hora))

  // Logs para depuración
  console.log(
    "Todas las horas:",
    todasLasHoras.map((h) => h.hora),
  )
  console.log("Horas bloqueadas por novedades:", horasBloqueadas)
  console.log("Horas ocupadas por citas:", horasOcupadas)
  console.log(
    "Horas filtradas (disponibles):",
    horasFiltradas.map((h) => h.hora),
  )

  if (!show) return null

  return (
    <div className="crearCita-modal-overlay">
      <div className="crearCita-hora-modal" ref={modalRef}>
        <div className="crearCita-modal-header">
          <h2>
            <FaClock className="crearCita-modal-header-icon" />
            Seleccionar Hora
          </h2>
          <button type="button" className="crearCita-modal-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="crearCita-modal-content">
          <div className="crearCita-horas-grid">
            {tieneAusencia ? (
              <div className="crearCita-no-results">
                <FaExclamationTriangle className="crearCita-no-results-icon" />
                <p>El mecánico no está disponible este día por ausencia.</p>
              </div>
            ) : horasFiltradas.length === 0 ? (
              <div className="crearCita-no-results">
                <FaExclamationTriangle className="crearCita-no-results-icon" />
                <p>No hay horas disponibles</p>
              </div>
            ) : (
              horasFiltradas.map((hora) => (
                <div
                  key={hora.id}
                  className={`crearCita-hora-card ${horaActual === hora.hora ? "selected" : ""}`}
                  onClick={() => onSelect(hora)}
                >
                  <div className="crearCita-hora-time">
                    <FaClock className="crearCita-hora-icon" />
                    {hora.hora}
                  </div>
                  <div className="crearCita-hora-description">{hora.descripcion}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CrearCita() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    observaciones: "",
    estado_cita_id: 1,
    vehiculo_id: "",
    mecanico_id: "",
  })

  const [clientes, setClientes] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [mecanicos, setMecanicos] = useState([])
  const [estados, setEstados] = useState([])
  const [selectedCliente, setSelectedCliente] = useState("")
  const [vehiculosFiltrados, setVehiculosFiltrados] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Estados para modales
  const [mostrarModalClientes, setMostrarModalClientes] = useState(false)
  const [mostrarModalMecanicos, setMostrarModalMecanicos] = useState(false)
  const [mostrarModalVehiculos, setMostrarModalVehiculos] = useState(false)
  const [mostrarModalHoras, setMostrarModalHoras] = useState(false)

  // Estados para selecciones
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [mecanicoSeleccionado, setMecanicoSeleccionado] = useState(null)
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState(null)
  const [novedadesDia, setNovedadesDia] = useState([]) // Nuevo estado
  const [horariosMecanico, setHorariosMecanico] = useState([]) // Novedades del mecánico
  const [citasMecanico, setCitasMecanico] = useState([]) // Citas del mecánico

  // Función para realizar peticiones a la API con el token de autenticación
  const makeRequest = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token disponible")
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
        ...options,
      }

      const response = await axios(`${API_BASE_URL}${endpoint}`, config)
      return response
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error)
      throw error
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedCliente) {
      fetchVehiculosPorCliente(selectedCliente)
    } else {
      setVehiculosFiltrados([])
    }
  }, [selectedCliente])

  // Consultar horarios (novedades) y citas cuando cambia fecha o mecánico
  useEffect(() => {
    const fetchHorariosYCitas = async () => {
      if (formData.fecha && formData.mecanico_id) {
        try {
          // Solo citas del mecánico y fecha seleccionados
          const horariosRes = await makeRequest(`/horarios?fecha=${formData.fecha}&mecanico_id=${formData.mecanico_id}`)
          setHorariosMecanico(Array.isArray(horariosRes.data) ? horariosRes.data : horariosRes.data?.data || [])

          const citasRes = await makeRequest(`/citas?fecha=${formData.fecha}&mecanico_id=${formData.mecanico_id}`)
          setCitasMecanico(Array.isArray(citasRes.data) ? citasRes.data : citasRes.data?.data || [])
        } catch {
          setHorariosMecanico([])
          setCitasMecanico([])
        }
      } else {
        setHorariosMecanico([])
        setCitasMecanico([])
      }
    }
    fetchHorariosYCitas()
  }, [formData.fecha, formData.mecanico_id])

  // Nueva función para obtener novedades del día
  useEffect(() => {
    const fetchNovedadesDia = async () => {
      if (formData.fecha) {
        try {
          const res = await makeRequest(`/horarios?fecha=${formData.fecha}`)
          setNovedadesDia(Array.isArray(res.data) ? res.data : res.data?.data || [])
        } catch {
          setNovedadesDia([])
        }
      } else {
        setNovedadesDia([])
      }
    }
    fetchNovedadesDia()
  }, [formData.fecha])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Obtener clientes activos solamente
      const clientesRes = await makeRequest("/clientes")
      if (clientesRes.data && Array.isArray(clientesRes.data)) {
        setClientes(clientesRes.data.filter((cliente) => cliente.estado?.toLowerCase() === "activo"))
      } else if (clientesRes.data && Array.isArray(clientesRes.data.data)) {
        setClientes(clientesRes.data.data.filter((cliente) => cliente.estado?.toLowerCase() === "activo"))
      } else {
        console.error("La respuesta de clientes no es un array:", clientesRes.data)
        setClientes([])
      }

      // Obtener vehículos activos solamente
      const vehiculosRes = await makeRequest("/vehiculos")
      if (vehiculosRes.data && Array.isArray(vehiculosRes.data)) {
        setVehiculos(vehiculosRes.data.filter((vehiculo) => vehiculo.estado?.toLowerCase() === "activo"))
      } else if (vehiculosRes.data && Array.isArray(vehiculosRes.data.data)) {
        setVehiculos(vehiculosRes.data.data.filter((vehiculo) => vehiculo.estado?.toLowerCase() === "activo"))
      } else {
        console.error("La respuesta de vehículos no es un array:", vehiculosRes.data)
        setVehiculos([])
      }

      // Obtener mecánicos activos solamente
      const mecanicosRes = await makeRequest("/mecanicos")
      if (mecanicosRes.data && Array.isArray(mecanicosRes.data)) {
        setMecanicos(mecanicosRes.data.filter((mecanico) => mecanico.estado?.toLowerCase() === "activo"))
      } else if (mecanicosRes.data && Array.isArray(mecanicosRes.data.data)) {
        setMecanicos(mecanicosRes.data.data.filter((mecanico) => mecanico.estado?.toLowerCase() === "activo"))
      } else {
        console.error("La respuesta de mecánicos no es un array:", mecanicosRes.data)
        setMecanicos([])
      }

      // Obtener estados de cita
      const estadosRes = await makeRequest("/estados-cita")
      if (estadosRes.data && Array.isArray(estadosRes.data)) {
        setEstados(estadosRes.data)
      } else if (estadosRes.data && Array.isArray(estadosRes.data.data)) {
        setEstados(estadosRes.data.data)
      } else {
        console.error("La respuesta de estados no es un array:", estadosRes.data)
        setEstados([])
      }

      setLoading(false)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar los datos necesarios")
      setClientes([])
      setVehiculos([])
      setMecanicos([])
      setEstados([])
      setLoading(false)
    }
  }

  const fetchVehiculosPorCliente = async (clienteId) => {
    try {
      const response = await makeRequest(`/vehiculos/cliente/${clienteId}`)
      if (response.data && Array.isArray(response.data)) {
        setVehiculosFiltrados(response.data.filter((vehiculo) => vehiculo.estado?.toLowerCase() === "activo"))
      } else if (response.data && Array.isArray(response.data.data)) {
        setVehiculosFiltrados(response.data.data.filter((vehiculo) => vehiculo.estado?.toLowerCase() === "activo"))
      } else {
        console.error("La respuesta de vehículos por cliente no es un array:", response.data)
        setVehiculosFiltrados([])
        toast.error("Error al cargar los vehículos del cliente")
      }
    } catch (error) {
      console.error("Error al cargar vehículos del cliente:", error)
      toast.error("Error al cargar los vehículos del cliente")
      setVehiculosFiltrados([])
    }
  }

  // Nueva función para manejar el cambio de fecha SIN restricción de fecha mínima
  const handleFechaChange = (e) => {
    const { value } = e.target
    let errorMsg = ""

    if (value) {
      const fechaSeleccionada = new Date(value + "T12:00:00")
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0) // Reset time to start of day

      if (fechaSeleccionada <= hoy) {
        errorMsg = "Solo se pueden programar citas para fechas futuras"
      } else if (fechaSeleccionada.getDay() === 0) {
        errorMsg = "No se pueden programar citas los domingos (día no laborable)"
      }
    }

    // Limpiar mecánico y hora cuando cambia la fecha
    setMecanicoSeleccionado(null)
    setHoraSeleccionada(null)

    setFormData({
      ...formData,
      fecha: value,
      mecanico_id: "",
      hora: "",
    })
    setErrors({
      ...errors,
      fecha: errorMsg,
    })
  }

  // También actualizar la función validateForm
  const validateForm = () => {
    const newErrors = {}

    if (!formData.fecha) {
      newErrors.fecha = "La fecha es requerida"
    } else {
      const fechaSeleccionada = new Date(formData.fecha + "T12:00:00")
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      if (fechaSeleccionada <= hoy) {
        newErrors.fecha = "Solo se pueden programar citas para fechas futuras"
      } else if (fechaSeleccionada.getDay() === 0) {
        newErrors.fecha = "No se pueden programar citas los domingos"
      }
    }

    if (!formData.hora) {
      newErrors.hora = "La hora es requerida"
    }

    if (!formData.vehiculo_id) {
      newErrors.vehiculo_id = "Debe seleccionar un vehículo"
    }

    if (!formData.mecanico_id) {
      newErrors.mecanico_id = "Debe seleccionar un mecánico"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Por favor corrija los errores en el formulario")
      return
    }

    try {
      setLoading(true)
      // Corrección: construye el payload asegurando que los ids sean números
      const datosCita = {
        fecha: formData.fecha,
        hora: formData.hora,
        observaciones: formData.observaciones,
        estado_cita_id: Number(formData.estado_cita_id),
        vehiculo_id: Number(formData.vehiculo_id),
        mecanico_id: Number(formData.mecanico_id),
      }

      console.log("Enviando datos de cita:", datosCita)

      const response = await makeRequest("/citas", {
        method: "POST",
        data: datosCita,
      })

      console.log("Respuesta de creación de cita:", response.data)
      toast.success("Cita creada correctamente")
      navigate("/citas")
    } catch (error) {
      console.error("Error al crear la cita:", error)

      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`)
      } else if (error.response && typeof error.response.data === "string") {
        toast.error(`Error: ${error.response.data}`)
      } else if (error.message) {
        toast.error(`Error: ${error.message}`)
      } else {
        toast.error("Error al crear la cita")
      }

      setLoading(false)
    }
  }

  // Funciones para manejar selecciones de modales
  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente)
    setSelectedCliente(cliente.id)
    setMostrarModalClientes(false)
    setVehiculoSeleccionado(null)
    setFormData({
      ...formData,
      vehiculo_id: "",
    })
  }

  const handleSeleccionarMecanico = (mecanico) => {
    setMecanicoSeleccionado(mecanico)
    setHoraSeleccionada(null) // Limpiar hora cuando cambia mecánico
    setFormData({
      ...formData,
      mecanico_id: mecanico.id,
      hora: "", // Limpiar hora
    })
    setMostrarModalMecanicos(false)
  }

  const handleSeleccionarVehiculo = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo)
    setFormData({
      ...formData,
      vehiculo_id: vehiculo.id,
    })
    setMostrarModalVehiculos(false)
  }

  const handleSeleccionarHora = (hora) => {
    setHoraSeleccionada(hora)
    setFormData({
      ...formData,
      hora: hora.hora,
    })
    setMostrarModalHoras(false)
  }

  const limpiarCliente = () => {
    setClienteSeleccionado(null)
    setSelectedCliente("")
    setVehiculoSeleccionado(null)
    setFormData({
      ...formData,
      vehiculo_id: "",
    })
  }

  const limpiarMecanico = () => {
    setMecanicoSeleccionado(null)
    setFormData({
      ...formData,
      mecanico_id: "",
    })
  }

  const limpiarVehiculo = () => {
    setVehiculoSeleccionado(null)
    setFormData({
      ...formData,
      vehiculo_id: "",
    })
  }

  const limpiarHora = () => {
    setHoraSeleccionada(null)
    setFormData({
      ...formData,
      hora: "",
    })
  }

  return (
    <div className="crearCita-container">
      {/* Header */}
      <div className="crearCita-header">
        <div className="crearCita-headerContent">
          <div className="crearCita-iconContainer">
            <FaCalendarAlt className="crearCita-icon" />
          </div>
          <div className="crearCita-titleSection">
            <h1 className="crearCita-title">Crear Nueva Cita</h1>
            <p className="crearCita-subtitle">Programa una nueva cita para el cliente</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate("/citas")} className="crearCita-backButton">
          <FaArrowLeft /> Volver
        </button>
      </div>

      {/* Contenido principal */}
      <div className="crearCita-content">
        {/* Formulario principal */}
        <div className="crearCita-mainCard">
          {loading ? (
            <div className="crearCita-loading">
              <div className="crearCita-spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="crearCita-form">
              {/* Primera parte: Fecha, Mecánico, Hora */}
              <div className="crearCita-form-section">
                <h2 className="crearCita-section-title">
                  <FaCalendarAlt className="crearCita-section-icon" />
                  Información de la Cita
                </h2>

                <div className="crearCita-form-grid">
                  <div className="crearCita-form-group">
                    <label className="crearCita-label">
                      <FaCalendarAlt className="crearCita-label-icon" />
                      Fecha *
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleFechaChange}
                      min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} // Tomorrow's date
                      className={`crearCita-form-input ${errors.fecha ? "error" : ""}`}
                    />
                    {errors.fecha && (
                      <span className="crearCita-error-text">
                        <FaExclamationTriangle />
                        {errors.fecha}
                      </span>
                    )}
                  </div>

                  {formData.fecha && (
                    <div className="crearCita-form-group">
                      <label className="crearCita-label">
                        <FaTools className="crearCita-label-icon" />
                        Mecánico *
                      </label>
                      <div className="crearCita-form-group">
                        <div className="crearCita-mecanico-input-btn">
                          <input
                            type="text"
                            placeholder="Seleccione un mecánico..."
                            value={
                              mecanicoSeleccionado
                                ? `${mecanicoSeleccionado.nombre} ${mecanicoSeleccionado.apellido}`
                                : ""
                            }
                            onClick={() => setMostrarModalMecanicos(true)}
                            readOnly
                            className={`crearCita-form-input ${errors.mecanico_id ? "error" : ""}`}
                            style={{ cursor: "pointer" }}
                          />
                          <button
                            type="button"
                            className="crearCita-create-button crearCita-nuevo-mecanico-btn"
                            title="Crear nuevo mecánico"
                            onClick={() => navigate("/CrearMecanicos")}
                          >
                            <FaPlus /> Nuevo
                          </button>
                        </div>
                        {mecanicoSeleccionado && (
                          <button
                            type="button"
                            className="crearCita-clear-button"
                            onClick={limpiarMecanico}
                            title="Limpiar selección"
                            style={{ position: "absolute", right: "80px", top: "50%", transform: "translateY(-50%)" }}
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                      {!formData.fecha && (
                        <span className="crearCita-info-text">Primero debe seleccionar una fecha</span>
                      )}
                    </div>
                  )}

                  {mecanicoSeleccionado && (
                    <div className="crearCita-form-group">
                      <label className="crearCita-label">
                        <FaClock className="crearCita-label-icon" />
                        Hora *
                      </label>
                      <div className="crearCita-input-container">
                        <input
                          type="text"
                          placeholder="Seleccione una hora..."
                          value={horaSeleccionada ? horaSeleccionada.hora : ""}
                          onClick={() => mecanicoSeleccionado && setMostrarModalHoras(true)}
                          readOnly
                          className={`crearCita-form-input ${errors.hora ? "error" : ""}`}
                          style={{ cursor: "pointer" }}
                        />
                        {horaSeleccionada && (
                          <button
                            type="button"
                            className="crearCita-clear-button"
                            onClick={limpiarHora}
                            title="Limpiar selección"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                      {errors.hora && (
                        <span className="crearCita-error-text">
                          <FaExclamationTriangle />
                          {errors.hora}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Segunda parte: Cliente y Vehículo */}
              <div className="crearCita-form-section">
                <h2 className="crearCita-section-title">
                  <FaUser className="crearCita-section-icon" />
                  Cliente y Vehículo
                </h2>
                <div className="crearCita-form-grid">
                  <div className="crearCita-form-group">
                    <label className="crearCita-label">
                      <FaUser className="crearCita-label-icon" />
                      Cliente *
                    </label>
                    <div className="crearCita-cliente-input-btn">
                      <input
                        type="text"
                        placeholder="Seleccione un cliente..."
                        value={
                          clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` : ""
                        }
                        onClick={() => setMostrarModalClientes(true)}
                        readOnly
                        className="crearCita-form-input"
                        style={{ cursor: "pointer" }}
                      />
                      <button
                        type="button"
                        className="crearCita-create-button crearCita-nuevo-cliente-btn"
                        title="Crear nuevo cliente"
                        onClick={() => navigate("/CrearClientes")}
                      >
                        <FaPlus /> Nuevo
                      </button>
                    </div>
                    {clienteSeleccionado && (
                      <button
                        type="button"
                        className="crearCita-clear-button"
                        onClick={limpiarCliente}
                        title="Limpiar selección"
                        style={{ position: "absolute", right: "80px", top: "50%", transform: "translateY(-50%)" }}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  <div className="crearCita-form-group">
                    <label className="crearCita-label">
                      <FaCar className="crearCita-label-icon" />
                      Vehículo *
                    </label>
                    <div className="crearCita-vehiculo-input-btn">
                      <input
                        type="text"
                        placeholder="Seleccione un vehículo..."
                        value={
                          vehiculoSeleccionado
                            ? `${vehiculoSeleccionado.placa} - ${vehiculoSeleccionado.referencia?.marca?.nombre || vehiculoSeleccionado.marca_nombre || ""} ${vehiculoSeleccionado.referencia?.nombre || vehiculoSeleccionado.referencia_nombre || ""}`
                            : ""
                        }
                        onClick={() => selectedCliente && setMostrarModalVehiculos(true)}
                        readOnly
                        disabled={!selectedCliente}
                        className={`crearCita-form-input ${errors.vehiculo_id ? "error" : ""} ${!selectedCliente ? "disabled" : ""}`}
                        style={{ cursor: selectedCliente ? "pointer" : "not-allowed" }}
                      />
                      <button
                        type="button"
                        className="crearCita-create-button crearCita-nuevo-vehiculo-btn"
                        title="Crear nuevo vehículo"
                        onClick={() => navigate("/vehiculos/crear")}
                        disabled={!selectedCliente}
                      >
                        <FaPlus /> Nuevo
                      </button>
                    </div>
                    {vehiculoSeleccionado && (
                      <button
                        type="button"
                        className="crearCita-clear-button"
                        onClick={limpiarVehiculo}
                        title="Limpiar selección"
                        style={{ position: "absolute", right: "80px", top: "50%", transform: "translateY(-50%)" }}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tercera parte: Observaciones */}
              <div className="crearCita-form-section">
                <h2 className="crearCita-section-title">
                  <FaClipboardList className="crearCita-section-icon" />
                  Observaciones
                </h2>

                <div className="crearCita-form-group">
                  <label className="crearCita-label">
                    <FaClipboardList className="crearCita-label-icon" />
                    Observaciones
                  </label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Ingrese observaciones o detalles adicionales sobre la cita"
                    className="crearCita-form-input crearCita-textarea"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="crearCita-form-actions">
                <button type="button" onClick={() => navigate("/citas")} className="crearCita-cancel-button">
                  <FaArrowLeft className="crearCita-button-icon" />
                  Cancelar
                </button>
                <button type="submit" className="crearCita-submit-button" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="crearCita-spinner spinning"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaCalendarAlt className="crearCita-button-icon" />
                      Crear Cita
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Card de información lateral */}
        <div className="crearCita-infoCard">
          <div className="crearCita-infoHeader">
            <FaCalendarAlt className="crearCita-infoIcon" />
            <h3 className="crearCita-infoTitle">Información de la Cita</h3>
          </div>
          <div className="crearCita-infoContent">
            <div className="crearCita-infoItem">
              <strong>Horario Laboral:</strong>
              <p>Lunes a Sábado</p>
              <p>8:00 AM - 6:00 PM</p>
            </div>
            <div className="crearCita-infoItem">
              <strong>No laborable:</strong>
              <p>Domingos</p>
            </div>
            <div className="crearCita-infoItem">
              <strong>Nota:</strong>
              <p className="crearCita-infoNote">
                Las citas se programan por horas completas. Asegúrese de que el cliente y vehículo estén registrados
                antes de crear la cita.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de clientes */}
      {mostrarModalClientes && (
        <ClienteModal
          show={mostrarModalClientes}
          onClose={() => setMostrarModalClientes(false)}
          clientes={clientes}
          onSelect={handleSeleccionarCliente}
          clienteActual={selectedCliente}
        />
      )}

      {/* Modal de mecánicos con filtrado por ausencia */}
      {mostrarModalMecanicos && (
        <MecanicoModal
          show={mostrarModalMecanicos}
          onClose={() => setMostrarModalMecanicos(false)}
          mecanicos={mecanicos}
          onSelect={handleSeleccionarMecanico}
          mecanicoActual={formData.mecanico_id}
          fechaSeleccionada={formData.fecha}
          novedades={novedadesDia}
        />
      )}

      {/* Modal de vehículos */}
      {mostrarModalVehiculos && (
        <VehiculoModal
          show={mostrarModalVehiculos}
          onClose={() => setMostrarModalVehiculos(false)}
          vehiculos={vehiculosFiltrados}
          onSelect={handleSeleccionarVehiculo}
          vehiculoActual={formData.vehiculo_id}
        />
      )}

      {/* Modal de horas */}
      {mostrarModalHoras && (
        <HoraModal
          show={mostrarModalHoras}
          onClose={() => setMostrarModalHoras(false)}
          onSelect={handleSeleccionarHora}
          horaActual={formData.hora}
          horariosMecanico={horariosMecanico}
          citasMecanico={citasMecanico}
          formData={formData}
        />
      )}
    </div>
  )
}

export default CrearCita

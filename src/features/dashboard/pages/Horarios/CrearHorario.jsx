"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaClock,
  FaCalendarAlt,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaUser,
  FaInfoCircle,
  FaSearch,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Horarios/CrearHorario.css"
import { getFechaBogota, calcularDiaSemana, getFechaMinima } from "../../../../shared/utils/dateUtils"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

// Componente del modal para mecánicos
const MecanicoModal = ({ show, onClose, mecanicos, onSelect, mecanicoActual }) => {
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

  // Filtrar mecánicos basado en la búsqueda
  const mecanicosFiltrados = mecanicos.filter(
    (mecanico) =>
      `${mecanico.nombre} ${mecanico.apellido}`.toLowerCase().includes(busquedaMecanico.toLowerCase()) ||
      mecanico.documento.toLowerCase().includes(busquedaMecanico.toLowerCase()),
  )

  // Calcular índices para la paginación
  const indiceUltimoMecanico = paginaActualMecanicos * mecanicosPorPagina
  const indicePrimerMecanico = indiceUltimoMecanico - mecanicosPorPagina
  const mecanicosActuales = mecanicosFiltrados.slice(indicePrimerMecanico, indiceUltimoMecanico)
  const totalPaginasMecanicos = Math.ceil(mecanicosFiltrados.length / mecanicosPorPagina)

  // Función para ir a la página anterior
  const irPaginaAnterior = () => {
    setPaginaActualMecanicos((prev) => Math.max(prev - 1, 1))
  }

  // Función para ir a la página siguiente
  const irPaginaSiguiente = () => {
    setPaginaActualMecanicos((prev) => Math.min(prev + 1, totalPaginasMecanicos))
  }

  // Función para manejar el cambio de búsqueda
  const handleBusquedaChange = (e) => {
    setBusquedaMecanico(e.target.value)
    setPaginaActualMecanicos(1)
  }

  if (!show) return null

  return (
    <div className="crearHorario-modal-overlay">
      <div className="crearHorario-mecanico-modal" ref={modalRef}>
        <div className="crearHorario-mecanico-modal-header">
          <h2>
            <FaUser className="crearHorario-modal-header-icon" />
            Seleccionar Mecánico
          </h2>
          <button type="button" className="crearHorario-mecanico-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="crearHorario-mecanico-modal-content">
          {/* Buscador centrado */}
          <div className="crearHorario-mecanico-search-container">
            <div className="crearHorario-mecanico-search-wrapper">
              <FaSearch className="crearHorario-mecanico-search-icon" />
              <input
                type="text"
                placeholder="Buscar mecánico..."
                value={busquedaMecanico}
                onChange={handleBusquedaChange}
                className="crearHorario-mecanico-search-input"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de mecánicos con paginación */}
          <div className="crearHorario-mecanico-list">
            {mecanicosActuales.length === 0 ? (
              <div className="crearHorario-mecanico-no-results">
                <FaExclamationTriangle className="crearHorario-mecanico-no-results-icon" />
                <p>{busquedaMecanico ? "No se encontraron mecánicos" : "No hay mecánicos disponibles"}</p>
              </div>
            ) : (
              <table className="crearHorario-mecanico-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {mecanicosActuales.map((mecanico) => (
                    <tr key={mecanico.id} className="crearHorario-mecanico-row">
                      <td>
                        <div className="crearHorario-mecanico-name">
                          {mecanico.nombre} {mecanico.apellido}
                        </div>
                      </td>
                      <td>{mecanico.documento}</td>
                      <td>
                        <span className={`crearHorario-mecanico-estado ${mecanico.estado?.toLowerCase()}`}>
                          {mecanico.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="crearHorario-mecanico-select-button"
                          onClick={() => onSelect(mecanico)}
                        >
                          Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Controles de paginación */}
          {totalPaginasMecanicos > 1 && (
            <div className="crearHorario-mecanico-pagination">
              <button
                onClick={irPaginaAnterior}
                disabled={paginaActualMecanicos === 1}
                className="crearHorario-mecanico-pagination-button"
                type="button"
              >
                Anterior
              </button>

              <span className="crearHorario-mecanico-page-info">
                Página {paginaActualMecanicos} de {totalPaginasMecanicos}
                {mecanicosFiltrados.length > 0 && (
                  <span className="crearHorario-mecanico-total-info">
                    {" "}
                    ({mecanicosFiltrados.length} mecánico{mecanicosFiltrados.length !== 1 ? "s" : ""})
                  </span>
                )}
              </span>

              <button
                onClick={irPaginaSiguiente}
                disabled={paginaActualMecanicos === totalPaginasMecanicos}
                className="crearHorario-mecanico-pagination-button"
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

const CrearHorario = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [mecanicos, setMecanicos] = useState([])
  const [mostrarModalMecanicos, setMostrarModalMecanicos] = useState(false)
  const [mecanicoSeleccionado, setMecanicoSeleccionado] = useState(null)

  const [horario, setHorario] = useState({
    fecha: "",
    dia: "",
    hora_inicio: "",
    hora_fin: "",
    motivo: "",
    tipo_novedad: "",
    mecanico_id: "",
  })

  const tiposNovedad = [
    { value: "Ausencia", label: "Ausencia", description: "El mecánico no estará disponible todo el día" },
    { value: "Llegada Tarde", label: "Llegada Tarde", description: "El mecánico llegará más tarde de lo normal" },
    { value: "Salida Temprana", label: "Salida Temprana", description: "El mecánico saldrá antes de lo normal" },
    { value: "Horario Especial", label: "Horario Especial", description: "Horario diferente al habitual" },
  ]

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

      // Agregar este log para debug
      if (options.method === "POST") {
        console.log("Enviando datos:", options.body)
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

      if (!response.ok) {
        // Mejorar el manejo de errores para obtener más información
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error)
      throw error
    }
  }

  useEffect(() => {
    cargarMecanicos()
  }, [])

  const cargarMecanicos = async () => {
    try {
      const response = await makeRequest("/mecanicos")
      const mecanicosData = Array.isArray(response) ? response : response.data || []
      const mecanicosActivos = mecanicosData.filter((m) => m.estado === "Activo")
      setMecanicos(mecanicosActivos)
    } catch (error) {
      console.error("Error al cargar mecánicos:", error)
      Swal.fire("Error", "No se pudieron cargar los mecánicos", "error")
    }
  }

  const validarFecha = (fechaString) => {
    console.log("=== VALIDANDO FECHA ===")
    console.log("Fecha recibida:", fechaString)

    if (!fechaString) return ""

    const fechaSeleccionada = new Date(fechaString + "T12:00:00")
    const hoyBogota = getFechaBogota()

    console.log("Fecha seleccionada:", fechaSeleccionada)
    console.log("Fecha hoy Bogotá:", hoyBogota)

    // Normalizar fechas a medianoche para comparar solo días
    const fechaSeleccionadaNormalizada = new Date(
      fechaSeleccionada.getFullYear(),
      fechaSeleccionada.getMonth(),
      fechaSeleccionada.getDate(),
    )
    const hoyNormalizada = new Date(hoyBogota.getFullYear(), hoyBogota.getMonth(), hoyBogota.getDate())

    console.log("Fecha seleccionada normalizada:", fechaSeleccionadaNormalizada)
    console.log("Fecha hoy normalizada:", hoyNormalizada)

    // Calcular diferencia en días
    const diferenciaMilisegundos = fechaSeleccionadaNormalizada.getTime() - hoyNormalizada.getTime()
    const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24))

    console.log("Diferencia en días:", diferenciaDias)

    // Validar día de la semana
    const dia = calcularDiaSemana(fechaString)
    console.log("Día de la semana:", dia)

    if (dia === "Domingo") {
      console.log("ERROR: Es domingo")
      return "No se pueden crear novedades para domingos (día no laboral)"
    }

    // Permitir crear novedades hasta 3 días antes del día actual
    if (diferenciaDias < -3) {
      console.log("ERROR: Más de 3 días en el pasado")
      return "No se pueden crear novedades para fechas con más de 3 días de antigüedad"
    }

    console.log("Fecha válida")
    return ""
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    // Elimina espacios al inicio para todos los campos
    const cleanValue = typeof value === "string" ? value.replace(/^\s+/, "") : value

    const newHorario = { ...horario, [name]: cleanValue }

    if (name === "fecha") {
      if (cleanValue) {
        const dia = calcularDiaSemana(cleanValue)
        newHorario.dia = dia

        const errorFecha = validarFecha(cleanValue)
        setErrors((prev) => ({ ...prev, fecha: errorFecha }))
      } else {
        newHorario.dia = ""
        setErrors((prev) => ({ ...prev, fecha: "" }))
      }
    }

    // Auto-seleccionar "Ausencia" si hora inicio es 6:00 AM y fin es 8:00 PM
    if (name === "hora_inicio" || name === "hora_fin") {
      const horaInicio = name === "hora_inicio" ? cleanValue : newHorario.hora_inicio
      const horaFin = name === "hora_fin" ? cleanValue : newHorario.hora_fin

      if (horaInicio === "06:00" && horaFin === "20:00") {
        newHorario.tipo_novedad = "Ausencia"
      }
    }

    if (name === "tipo_novedad" && cleanValue === "Ausencia") {
      newHorario.hora_inicio = ""
      newHorario.hora_fin = ""
    }

    setHorario(newHorario)

    // Limpiar otros errores cuando el usuario modifica el campo
    if (name !== "fecha" && errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSeleccionarMecanico = (mecanico) => {
    setMecanicoSeleccionado(mecanico)
    setHorario((prev) => ({ ...prev, mecanico_id: mecanico.id }))
    setMostrarModalMecanicos(false)
    // Limpiar error si existe
    if (errors.mecanico_id) {
      setErrors((prev) => ({ ...prev, mecanico_id: "" }))
    }
  }

  const limpiarMecanico = () => {
    setMecanicoSeleccionado(null)
    setHorario((prev) => ({ ...prev, mecanico_id: "" }))
  }

  const validarHorario = () => {
    const newErrors = {}

    if (!horario.fecha) {
      newErrors.fecha = "La fecha es requerida"
    } else {
      const errorFecha = validarFecha(horario.fecha)
      if (errorFecha) {
        newErrors.fecha = errorFecha
      }
    }

    if (!horario.mecanico_id) {
      newErrors.mecanico_id = "Debe seleccionar un mecánico"
    }

    if (!horario.tipo_novedad) {
      newErrors.tipo_novedad = "Debe seleccionar un tipo de novedad"
    }

    if (!horario.motivo.trim()) {
      newErrors.motivo = "El motivo es requerido"
    }

    if (horario.tipo_novedad && horario.tipo_novedad !== "Ausencia") {
      if (!horario.hora_inicio) {
        newErrors.hora_inicio = "La hora de inicio es requerida"
      }
      if (!horario.hora_fin) {
        newErrors.hora_fin = "La hora de fin es requerida"
      }

      if (horario.hora_inicio && horario.hora_fin) {
        const [horaInicio, minutoInicio] = horario.hora_inicio.split(":").map(Number)
        const [horaFin, minutoFin] = horario.hora_fin.split(":").map(Number)

        const minutosInicio = horaInicio * 60 + minutoInicio
        const minutosFin = horaFin * 60 + minutoFin

        if (minutosFin <= minutosInicio) {
          newErrors.hora_fin = "La hora de fin debe ser mayor que la hora de inicio"
        }

        // Agregar esta nueva validación
        if (minutosInicio === minutosFin) {
          newErrors.hora_fin = "La hora de inicio no puede ser igual a la hora de fin"
        }

        if (minutosInicio < 360) {
          // 6:00 AM
          newErrors.hora_inicio = "La hora de inicio no puede ser antes de las 6:00 AM"
        }

        if (minutosFin > 1200) {
          // 8:00 PM
          newErrors.hora_fin = "La hora de fin no puede ser después de las 8:00 PM"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarHorario()) return

    try {
      setLoading(true)

      // Cambiar el formato de la fecha - enviar solo la fecha sin hora
      const horarioParaEnviar = {
        ...horario,
        fecha: horario.fecha, // Enviar solo YYYY-MM-DD
      }

      console.log("Datos a enviar:", horarioParaEnviar)

      await makeRequest("/horarios", {
        method: "POST",
        body: JSON.stringify(horarioParaEnviar),
      })

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Novedad de horario creada correctamente",
        confirmButtonColor: "#2d3748",
      }).then(() => {
        navigate("/Horarios")
      })
    } catch (error) {
      console.error("Error al crear novedad:", error)

      // Mejorar el manejo de errores para mostrar más información
      let errorMessage = "No se pudo crear la novedad de horario"

      if (error.message.includes("400")) {
        errorMessage = "Datos inválidos. Verifique que todos los campos estén correctos."
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#dc3545",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/Horarios")
  }

  const tipoNovedadSeleccionado = tiposNovedad.find((t) => t.value === horario.tipo_novedad)

  return (
    <div className="crearHorarios-container">
      <div className="editarUsuario-header">
        <div className="editarUsuario-header-left">
          <button
            className="editarUsuario-btn-back"
            onClick={handleCancel}
            type="button"
            disabled={loading}
          >
            <FaArrowLeft />
            Volver
          </button>
          <div className="editarUsuario-title-section">
            <h1 className="editarUsuario-page-title">
              <FaClock className="editarUsuario-title-icon" />
              Crear Novedad de Horario
            </h1>
            <p className="editarUsuario-subtitle">Registrar excepciones al horario laboral normal</p>
          </div>
        </div>
      </div>

      <div className="crearHorarios-content">
        <div className="crearHorarios-formCard">
          <form onSubmit={handleSubmit}>
            <div className="crearHorarios-formSection">
              <h3 className="crearHorarios-sectionTitle">
                <FaCalendarAlt /> Información de la Novedad
              </h3>

              <div className="crearHorarios-formRow">
                <div className="crearHorarios-formGroup">
                  <label className="crearHorarios-label">
                    <FaCalendarAlt /> Fecha *
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={horario.fecha}
                    onChange={handleInputChange}
                    min={getFechaMinima()}
                    className={`crearHorarios-input ${errors.fecha ? "error" : ""}`}
                    disabled={loading}
                  />
                  {errors.fecha && <span className="crearHorarios-errorMessage">⚠️ {errors.fecha}</span>}
                </div>

                <div className="crearHorarios-formGroup">
                  <label className="crearHorarios-label">
                    <FaCalendarAlt /> Día de la Semana
                  </label>
                  <input
                    type="text"
                    value={horario.dia}
                    readOnly
                    className="crearHorarios-input crearHorarios-inputReadonly"
                    placeholder="Se calcula automáticamente"
                  />
                </div>
              </div>

              <div className="crearHorarios-formGroup">
                <label className="crearHorarios-label">
                  <FaUser /> Mecánico *
                </label>
                <div className="crearHorarios-mecanico-filter-container">
                  <input
                    type="text"
                    placeholder="Seleccione un mecánico..."
                    value={
                      mecanicoSeleccionado
                        ? `${mecanicoSeleccionado.nombre} ${mecanicoSeleccionado.apellido} - ${mecanicoSeleccionado.documento}`
                        : ""
                    }
                    onClick={() => setMostrarModalMecanicos(true)}
                    readOnly
                    className={`crearHorarios-mecanico-filter-input ${errors.mecanico_id ? "error" : ""}`}
                    style={{ cursor: "pointer" }}
                  />
                  {mecanicoSeleccionado && (
                    <button
                      type="button"
                      className="crearHorarios-clear-mecanico-button"
                      onClick={limpiarMecanico}
                      title="Limpiar selección"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                {errors.mecanico_id && <span className="crearHorarios-errorMessage">{errors.mecanico_id}</span>}
              </div>

              <div className="crearHorarios-formGroup">
                <label className="crearHorarios-label">
                  <FaExclamationTriangle /> Tipo de Novedad *
                </label>
                <select
                  name="tipo_novedad"
                  value={horario.tipo_novedad}
                  onChange={handleInputChange}
                  className={`crearHorarios-select ${errors.tipo_novedad ? "error" : ""}`}
                  disabled={loading}
                >
                  <option value="">Seleccione un tipo...</option>
                  {tiposNovedad.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
                {errors.tipo_novedad && <span className="crearHorarios-errorMessage">{errors.tipo_novedad}</span>}
                {tipoNovedadSeleccionado && (
                  <div className="crearHorarios-descriptionText">
                    <FaInfoCircle /> {tipoNovedadSeleccionado.description}
                  </div>
                )}
              </div>

              {horario.tipo_novedad && horario.tipo_novedad !== "Ausencia" && (
                <div className="crearHorarios-formRow">
                  <div className="crearHorarios-formGroup">
                    <label className="crearHorarios-label">
                      <FaClock /> Hora de Inicio *
                    </label>
                    <select
                      name="hora_inicio"
                      value={horario.hora_inicio}
                      onChange={handleInputChange}
                      className={`crearHorarios-select ${errors.hora_inicio ? "error" : ""}`}
                      disabled={loading}
                    >
                      <option value="">Seleccione hora...</option>
                      <option value="08:00">08:00 AM</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                    </select>
                    {errors.hora_inicio && <span className="crearHorarios-errorMessage">{errors.hora_inicio}</span>}
                  </div>

                  <div className="crearHorarios-formGroup">
                    <label className="crearHorarios-label">
                      <FaClock /> Hora de Fin *
                    </label>
                    <select
                      name="hora_fin"
                      value={horario.hora_fin}
                      onChange={handleInputChange}
                      className={`crearHorarios-select ${errors.hora_fin ? "error" : ""}`}
                      disabled={loading}
                    >
                      <option value="">Seleccione hora...</option>
                      <option value="08:00">08:00 AM</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                    </select>
                    {errors.hora_fin && <span className="crearHorarios-errorMessage">{errors.hora_fin}</span>}
                  </div>
                </div>
              )}

              <div className="crearHorarios-formGroup">
                <label className="crearHorarios-label">
                  <FaExclamationTriangle /> Motivo *
                </label>
                <textarea
                  name="motivo"
                  value={horario.motivo}
                  onChange={handleInputChange}
                  placeholder="Describa el motivo de la novedad (ej: Cita médica, emergencia familiar, etc.)"
                  rows="3"
                  className={`crearHorarios-textarea ${errors.motivo ? "error" : ""}`}
                  disabled={loading}
                />
                {errors.motivo && <span className="crearHorarios-errorMessage">{errors.motivo}</span>}
              </div>
            </div>

            <div className="crearHorarios-formActions">
              <button type="button" className="crearHorarios-btnCancelar" onClick={handleCancel} disabled={loading}>
                <FaTimes /> Cancelar
              </button>
              <button type="submit" className="crearHorarios-btnGuardar" disabled={loading}>
                {loading ? (
                  <>
                    <div className="crearHorarios-loadingSpinner"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <FaSave /> Crear Novedad
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="crearHorarios-infoCard">
          <h3>
            <FaInfoCircle /> Información Importante
          </h3>
          <div className="crearHorarios-horarioNormal">
            <h4>Horario Laboral Normal:</h4>
            <p>
              <strong>Días:</strong> Lunes a Sábado
            </p>
            <p>
              <strong>Horario:</strong> 8:00 AM - 6:00 PM
            </p>
            <p>
              <strong>No laborable:</strong> Domingos
            </p>
          </div>
          <div className="crearHorarios-horarioNormal">
            <h4>Novedades de Horario:</h4>
            <p>
              <strong>Rango permitido:</strong> 6:00 AM - 8:00 PM
            </p>
            <p>
              <strong>Fechas:</strong> Hasta 3 días antes de hoy
            </p>
          </div>
          <p>Las novedades de horario son excepciones al horario normal de trabajo.</p>
        </div>
      </div>

      {/* Modal de mecánicos */}
      {mostrarModalMecanicos && (
        <MecanicoModal
          show={mostrarModalMecanicos}
          onClose={() => setMostrarModalMecanicos(false)}
          mecanicos={mecanicos}
          onSelect={handleSeleccionarMecanico}
          mecanicoActual={horario.mecanico_id}
        />
      )}
    </div>
  )
}

export default CrearHorario

"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"
import { Search, X, User } from "lucide-react"
import "../../../../shared/styles/editarProveedor.css"
import "../../../../shared/styles/Modal.css"

const EditarVehiculo = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [formulario, setFormulario] = useState({
    placa: "",
    color: "",
    tipo_vehiculo: "Carro",
    referencia_id: "",
    cliente_id: "",
    estado: "Activo",
  })

  // Estados para modales
  const [referenciaSeleccionada, setReferenciaSeleccionada] = useState(null)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [modalReferencia, setModalReferencia] = useState(false)
  const [modalCliente, setModalCliente] = useState(false)
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(true)

  // Estados para el modal de referencias
  const [referencias, setReferencias] = useState([])
  const [busquedaReferencia, setBusquedaReferencia] = useState("")
  const [paginaActualReferencia, setPaginaActualReferencia] = useState(1)
  const [cargandoReferencias, setCargandoReferencias] = useState(false)
  const referenciasPorPagina = 8

  // Estados para el modal de clientes
  const [clientes, setClientes] = useState([])
  const [busquedaCliente, setBusquedaCliente] = useState("")
  const [paginaActualCliente, setPaginaActualCliente] = useState(1)
  const [cargandoClientes, setCargandoClientes] = useState(false)
  const clientesPorPagina = 8

  useEffect(() => {
    obtenerVehiculo()
  }, [id])

  // Cargar referencias cuando se abre el modal
  useEffect(() => {
    if (modalReferencia) {
      fetchReferencias()
      setBusquedaReferencia("")
      setPaginaActualReferencia(1)
    }
  }, [modalReferencia, formulario.tipo_vehiculo])

  // Cargar clientes cuando se abre el modal
  useEffect(() => {
    if (modalCliente) {
      fetchClientes()
      setBusquedaCliente("")
      setPaginaActualCliente(1)
    }
  }, [modalCliente])

  const fetchReferencias = async () => {
    setCargandoReferencias(true)
    try {
      const response = await axios.get("https://api-final-8rw7.onrender.com/api/referencias", {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      })

      // Filtrar por tipo de vehículo
      const referenciasFiltradas = response.data.filter(
        (ref) => ref.tipo_vehiculo === formulario.tipo_vehiculo || ref.categoria === formulario.tipo_vehiculo,
      )

      setReferencias(referenciasFiltradas)
    } catch (error) {
      console.error("Error al obtener referencias:", error)
      setReferencias([])
    } finally {
      setCargandoReferencias(false)
    }
  }

  const fetchClientes = async () => {
    setCargandoClientes(true)
    try {
      const response = await axios.get("https://api-final-8rw7.onrender.com/api/clientes", {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      })
      setClientes(response.data)
    } catch (error) {
      console.error("Error al obtener clientes:", error)
      setClientes([])
    } finally {
      setCargandoClientes(false)
    }
  }

  const soloLetrasYNumeros = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
  }

  const soloLetras = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "")
  }

  const validarCampo = (name, value) => {
    let nuevoError = ""

    if (name === "placa") {
      if (!value.trim()) {
        nuevoError = "La placa es obligatoria."
      } else if (!/^[A-Z0-9]{6}$/.test(value)) {
        nuevoError = "La placa debe tener exactamente 6 caracteres alfanuméricos."
      }
    } else if (name === "color") {
      if (!value.trim()) {
        nuevoError = "El color es obligatorio."
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        nuevoError = "El color solo debe contener letras."
      }
    } else if (name === "tipo_vehiculo") {
      if (!["Carro", "Moto", "Camioneta"].includes(value)) {
        nuevoError = "Tipo de vehículo inválido."
      }
    } else if (name === "referencia_id") {
      if (!value) {
        nuevoError = "Debe seleccionar una referencia."
      }
    } else if (name === "cliente_id") {
      if (!value) {
        nuevoError = "Debe seleccionar un cliente."
      }
    } else if (name === "estado") {
      if (!["Activo", "Inactivo"].includes(value)) {
        nuevoError = "Estado inválido."
      }
    }

    setErrores((prev) => ({ ...prev, [name]: nuevoError }))
    return nuevoError === ""
  }

  const validarFormulario = () => {
    let esValido = true

    if (!validarCampo("placa", formulario.placa)) esValido = false
    if (!validarCampo("color", formulario.color)) esValido = false
    if (!validarCampo("tipo_vehiculo", formulario.tipo_vehiculo)) esValido = false
    if (!validarCampo("referencia_id", formulario.referencia_id)) esValido = false
    if (!validarCampo("cliente_id", formulario.cliente_id)) esValido = false
    if (!validarCampo("estado", formulario.estado)) esValido = false

    return esValido
  }

  // Limpiar referencia cuando cambie el tipo de vehículo
  useEffect(() => {
    if (!cargando) {
      setReferenciaSeleccionada(null)
      setFormulario((prev) => ({ ...prev, referencia_id: "" }))
    }
  }, [formulario.tipo_vehiculo, cargando])

  const obtenerVehiculo = async () => {
    setCargando(true)
    try {
      if (!token) {
        Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
        navigate("/login")
        return
      }
      const response = await axios.get(`https://api-final-8rw7.onrender.com/api/vehiculos/${id}`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      })
      const data = response.data
      setFormulario({
        ...data,
        estado: data.estado.charAt(0).toUpperCase() + data.estado.slice(1),
      })

      // Establecer referencia y cliente seleccionados
      if (data.referencia_id) {
        setReferenciaSeleccionada({
          id: data.referencia_id,
          nombre: data.referencia_nombre,
          marca_nombre: data.marca_nombre,
        })
      }

      if (data.cliente_id) {
        setClienteSeleccionado({
          id: data.cliente_id,
          nombre: data.cliente_nombre?.split(" ")[0] || "",
          apellido: data.cliente_nombre?.split(" ").slice(1).join(" ") || "",
        })
      }
    } catch (error) {
      console.error("Error al obtener vehículo:", error)
      Swal.fire("Error", "Error al cargar los datos del vehículo.", "error")
      navigate("/vehiculos")
    } finally {
      setCargando(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
    validarCampo(name, value)
  }

  const handleSeleccionarReferencia = (referencia) => {
    setReferenciaSeleccionada(referencia)
    setFormulario((prev) => ({ ...prev, referencia_id: referencia.id }))
    validarCampo("referencia_id", referencia.id)
    setModalReferencia(false)
  }

  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente)
    setFormulario((prev) => ({ ...prev, cliente_id: cliente.id }))
    validarCampo("cliente_id", cliente.id)
    setModalCliente(false)
  }

  const handleBuscarReferencia = (e) => {
    setBusquedaReferencia(e.target.value)
    setPaginaActualReferencia(1)
  }

  const handleBuscarCliente = (e) => {
    setBusquedaCliente(e.target.value)
    setPaginaActualCliente(1)
  }

  // Filtrar y paginar referencias
  const referenciasFiltradas = referencias.filter((ref) => {
    const textoBusqueda = busquedaReferencia.toLowerCase()
    return (
      ref.nombre?.toLowerCase().includes(textoBusqueda) ||
      ref.marca_nombre?.toLowerCase().includes(textoBusqueda) ||
      ref.descripcion?.toLowerCase().includes(textoBusqueda)
    )
  })

  const indexUltimoReferencia = paginaActualReferencia * referenciasPorPagina
  const indexPrimeroReferencia = indexUltimoReferencia - referenciasPorPagina
  const referenciasPaginadas = referenciasFiltradas.slice(indexPrimeroReferencia, indexUltimoReferencia)
  const totalPaginasReferencia = Math.ceil(referenciasFiltradas.length / referenciasPorPagina)

  // Filtrar y paginar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    const textoBusqueda = busquedaCliente.toLowerCase()
    return (
      cliente.nombre?.toLowerCase().includes(textoBusqueda) ||
      cliente.apellido?.toLowerCase().includes(textoBusqueda) ||
      cliente.documento?.toLowerCase().includes(textoBusqueda) ||
      cliente.telefono?.toLowerCase().includes(textoBusqueda) ||
      cliente.correo?.toLowerCase().includes(textoBusqueda)
    )
  })

  const indexUltimoCliente = paginaActualCliente * clientesPorPagina
  const indexPrimeroCliente = indexUltimoCliente - clientesPorPagina
  const clientesPaginados = clientesFiltrados.slice(indexPrimeroCliente, indexUltimoCliente)
  const totalPaginasCliente = Math.ceil(clientesFiltrados.length / clientesPorPagina)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      Swal.fire({
        icon: "warning",
        title: "Campos inválidos",
        text: "Por favor corrige los errores antes de continuar.",
      })
      return
    }

    try {
      if (!token) {
        Swal.fire("Error", "No autorizado: Token no encontrado.", "error")
        navigate("/login")
        return
      }

      // Verificar si la placa ya existe en otro vehículo
      const checkResponse = await axios.get("https://api-final-8rw7.onrender.com/api/vehiculos", {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      })

      const vehiculos = checkResponse.data
      const vehiculoDuplicado = vehiculos.find((v) => v.id !== Number.parseInt(id) && v.placa === formulario.placa)

      if (vehiculoDuplicado) {
        Swal.fire("Placa duplicada", "Ya existe otro vehículo con esta placa.", "warning")
        return
      }

      const estadoParaAPI = formulario.estado.toLowerCase()

      await axios.put(
        `https://api-final-8rw7.onrender.com/api/vehiculos/${id}`,
        { ...formulario, estado: estadoParaAPI },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      )
      Swal.fire("Éxito", "Vehículo actualizado exitosamente.", "success")
      navigate("/vehiculos")
    } catch (error) {
      console.error("Error al actualizar vehículo:", error)
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "No se pudo actualizar el vehículo."
      Swal.fire("Error", errorMessage, "error")
    }
  }

  if (cargando) {
    return (
      <div className="perfil__container">
        <div className="perfil__form">
          <div className="perfil__title-container">
            <h2 className="perfil__title">Cargando Vehículo...</h2>
          </div>
          <p style={{ textAlign: "center", color: "#555" }}>Por favor, espere mientras cargamos la información.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="perfil__container">
      <form onSubmit={handleSubmit} className="perfil__form">
        <div className="perfil__title-container">
          <h2 className="perfil__title">Editar Vehículo</h2>
        </div>

        <div className="perfil__grid-container">
          {/* Placa */}
          <div className="perfil__field">
            <label>Placa</label>
            <input
              type="text"
              name="placa"
              value={formulario.placa}
              onChange={handleChange}
              onInput={soloLetrasYNumeros}
              maxLength={6}
              autoComplete="off"
              className={errores.placa ? "input-error" : ""}
              required
            />
            {errores.placa && <span className="perfil-validacion">{errores.placa}</span>}
          </div>

          {/* Color */}
          <div className="perfil__field">
            <label>Color</label>
            <input
              type="text"
              name="color"
              value={formulario.color}
              onChange={handleChange}
              onInput={soloLetras}
              maxLength={45}
              autoComplete="off"
              className={errores.color ? "input-error" : ""}
              required
            />
            {errores.color && <span className="perfil-validacion">{errores.color}</span>}
          </div>

          {/* Tipo de Vehículo */}
          <div className="perfil__field">
            <label>Tipo de Vehículo</label>
            <select
              name="tipo_vehiculo"
              value={formulario.tipo_vehiculo}
              onChange={handleChange}
              className={errores.tipo_vehiculo ? "input-error" : ""}
              required
            >
              <option value="Carro">Carro</option>
              <option value="Moto">Moto</option>
              <option value="Camioneta">Camioneta</option>
            </select>
            {errores.tipo_vehiculo && <span className="perfil-validacion">{errores.tipo_vehiculo}</span>}
          </div>

          {/* Referencia con Modal */}
          <div className="perfil__field">
            <label>Referencia</label>
            <div className="input-with-button">
              <input
                type="text"
                value={
                  referenciaSeleccionada
                    ? `${referenciaSeleccionada.marca_nombre ? referenciaSeleccionada.marca_nombre + " - " : ""}${referenciaSeleccionada.nombre}`
                    : ""
                }
                placeholder={`Seleccionar referencia de ${formulario.tipo_vehiculo.toLowerCase()}`}
                readOnly
                className={errores.referencia_id ? "input-error" : ""}
                required
              />
              <button type="button" className="search-button" onClick={() => setModalReferencia(true)}>
                <Search size={18} />
              </button>
            </div>
            {errores.referencia_id && <span className="perfil-validacion">{errores.referencia_id}</span>}
          </div>

          {/* Cliente con Modal */}
          <div className="perfil__field">
            <label>Cliente</label>
            <div className="input-with-button">
              <input
                type="text"
                value={clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` : ""}
                placeholder="Seleccionar cliente"
                readOnly
                className={errores.cliente_id ? "input-error" : ""}
                required
              />
              <button type="button" className="search-button" onClick={() => setModalCliente(true)}>
                <Search size={18} />
              </button>
            </div>
            {errores.cliente_id && <span className="perfil-validacion">{errores.cliente_id}</span>}
          </div>

          {/* Estado */}
          <div className="perfil__field">
            <label>Estado</label>
            <select
              name="estado"
              value={formulario.estado}
              onChange={handleChange}
              className={errores.estado ? "input-error" : ""}
              required
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            {errores.estado && <span className="perfil-validacion">{errores.estado}</span>}
          </div>
        </div>

        <button type="submit" className="perfil__btn">
          Actualizar Vehículo
        </button>
      </form>

      {/* Modal de Referencias */}
      {modalReferencia && (
        <div className="modal-overlay">
          <div className="modal-container modal-large">
            <div className="modal-header">
              <h3>Seleccionar Referencia - {formulario.tipo_vehiculo}</h3>
              <button className="modal-close-btn" onClick={() => setModalReferencia(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              {/* Búsqueda */}
              <div className="modal-search">
                <div className="search-input-container">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, marca o descripción..."
                    value={busquedaReferencia}
                    onChange={handleBuscarReferencia}
                    className="search-input"
                  />
                </div>
              </div>

              {/* Lista de referencias */}
              <div className="modal-list">
                {cargandoReferencias ? (
                  <div className="modal-loading">Cargando referencias...</div>
                ) : referenciasPaginadas.length > 0 ? (
                  <div className="referencias-grid">
                    {referenciasPaginadas.map((ref) => (
                      <div
                        key={ref.id}
                        className={`referencia-card ${referenciaSeleccionada?.id === ref.id ? "selected" : ""}`}
                        onClick={() => handleSeleccionarReferencia(ref)}
                      >
                        <div className="referencia-info">
                          <h4>{ref.nombre}</h4>
                          {ref.marca_nombre && <p className="marca">Marca: {ref.marca_nombre}</p>}
                          {ref.descripcion && <p className="descripcion">{ref.descripcion}</p>}
                          <span className="tipo-badge">{ref.tipo_vehiculo || ref.categoria}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="modal-empty">
                    {busquedaReferencia
                      ? `No se encontraron referencias que coincidan con "${busquedaReferencia}"`
                      : `No hay referencias disponibles para ${formulario.tipo_vehiculo}`}
                  </div>
                )}
              </div>

              {/* Paginación */}
              {totalPaginasReferencia > 1 && (
                <div className="modal-pagination">
                  <button
                    onClick={() => setPaginaActualReferencia(paginaActualReferencia - 1)}
                    disabled={paginaActualReferencia === 1}
                    className="pagination-btn"
                  >
                    Anterior
                  </button>

                  <span className="pagination-info">
                    Página {paginaActualReferencia} de {totalPaginasReferencia}
                  </span>

                  <button
                    onClick={() => setPaginaActualReferencia(paginaActualReferencia + 1)}
                    disabled={paginaActualReferencia === totalPaginasReferencia}
                    className="pagination-btn"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalReferencia(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Clientes */}
      {modalCliente && (
        <div className="modal-overlay">
          <div className="modal-container modal-large">
            <div className="modal-header">
              <h3>Seleccionar Cliente</h3>
              <button className="modal-close-btn" onClick={() => setModalCliente(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              {/* Búsqueda */}
              <div className="modal-search">
                <div className="search-input-container">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, documento, teléfono o correo..."
                    value={busquedaCliente}
                    onChange={handleBuscarCliente}
                    className="search-input"
                  />
                </div>
              </div>

              {/* Lista de clientes */}
              <div className="modal-list">
                {cargandoClientes ? (
                  <div className="modal-loading">Cargando clientes...</div>
                ) : clientesPaginados.length > 0 ? (
                  <div className="clientes-grid">
                    {clientesPaginados.map((cliente) => (
                      <div
                        key={cliente.id}
                        className={`cliente-card ${clienteSeleccionado?.id === cliente.id ? "selected" : ""}`}
                        onClick={() => handleSeleccionarCliente(cliente)}
                      >
                        <div className="cliente-info">
                          <div className="cliente-avatar">
                            <User size={24} />
                          </div>
                          <div className="cliente-details">
                            <h4>
                              {cliente.nombre} {cliente.apellido}
                            </h4>
                            <p className="documento">Doc: {cliente.documento}</p>
                            {cliente.telefono && <p className="telefono">Tel: {cliente.telefono}</p>}
                            {cliente.correo && <p className="correo">{cliente.correo}</p>}
                            <span className={`estado-badge ${cliente.estado?.toLowerCase()}`}>{cliente.estado}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="modal-empty">
                    {busquedaCliente
                      ? `No se encontraron clientes que coincidan con "${busquedaCliente}"`
                      : "No hay clientes disponibles"}
                  </div>
                )}
              </div>

              {/* Paginación */}
              {totalPaginasCliente > 1 && (
                <div className="modal-pagination">
                  <button
                    onClick={() => setPaginaActualCliente(paginaActualCliente - 1)}
                    disabled={paginaActualCliente === 1}
                    className="pagination-btn"
                  >
                    Anterior
                  </button>

                  <span className="pagination-info">
                    Página {paginaActualCliente} de {totalPaginasCliente}
                  </span>

                  <button
                    onClick={() => setPaginaActualCliente(paginaActualCliente + 1)}
                    disabled={paginaActualCliente === totalPaginasCliente}
                    className="pagination-btn"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModalCliente(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditarVehiculo

"use client"

import { useState, useEffect } from "react"
import { FaEdit, FaEye, FaTrash, FaPlus, FaSearch } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import "../../../../shared/styles/Mecanicos/ListarMecanicos.css"

const ListarMecanicos = () => {
  const navigate = useNavigate()
  const [mecanicos, setMecanicos] = useState([])
  const [filteredMecanicos, setFilteredMecanicos] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("Todos")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [mecanicoToDelete, setMecanicoToDelete] = useState(null)

  // Datos de ejemplo - reemplazar con llamada a API
  useEffect(() => {
    const mecanicosMock = [
      {
        id: 1,
        nombre: "Juan Carlos",
        apellido: "Pérez García",
        tipo_documento: "Cédula de ciudadanía",
        documento: "12345678",
        direccion: "Calle 123 #45-67",
        telefono: "3001234567",
        telefono_emergencia: "3007654321",
        estado: "Activo",
        horario: "Lunes a Viernes 8:00 AM - 5:00 PM",
      },
      {
        id: 2,
        nombre: "María Elena",
        apellido: "González López",
        tipo_documento: "Cédula de ciudadanía",
        documento: "87654321",
        direccion: "Carrera 45 #12-34",
        telefono: "3109876543",
        telefono_emergencia: "3101234567",
        estado: "Activo",
        horario: "Lunes a Sábado 7:00 AM - 4:00 PM",
      },
      {
        id: 3,
        nombre: "Carlos Alberto",
        apellido: "Rodríguez Martín",
        tipo_documento: "Cédula de ciudadanía",
        documento: "11223344",
        direccion: "Avenida 30 #78-90",
        telefono: "3201122334",
        telefono_emergencia: "3204433221",
        estado: "Inactivo",
        horario: "Martes a Sábado 9:00 AM - 6:00 PM",
      },
    ]
    setMecanicos(mecanicosMock)
    setFilteredMecanicos(mecanicosMock)
  }, [])

  // Filtrar mecánicos
  useEffect(() => {
    let filtered = mecanicos

    if (searchTerm) {
      filtered = filtered.filter(
        (mecanico) =>
          mecanico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mecanico.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mecanico.documento.includes(searchTerm),
      )
    }

    if (filterEstado !== "Todos") {
      filtered = filtered.filter((mecanico) => mecanico.estado === filterEstado)
    }

    setFilteredMecanicos(filtered)
    setCurrentPage(1)
  }, [searchTerm, filterEstado, mecanicos])

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredMecanicos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredMecanicos.length / itemsPerPage)

  const handleDelete = (mecanico) => {
    setMecanicoToDelete(mecanico)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setMecanicos(mecanicos.filter((m) => m.id !== mecanicoToDelete.id))
    setShowDeleteModal(false)
    setMecanicoToDelete(null)
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setMecanicoToDelete(null)
  }

  return (
    <div className="listarMecanicos-container">
      <div className="listarMecanicos-header">
        <h1 className="listarMecanicos-title">Gestión de Mecánicos</h1>
        <button className="listarMecanicos-addButton" onClick={() => navigate("/dashboard/mecanicos/crear")}>
          <FaPlus /> Agregar Mecánico
        </button>
      </div>

      <div className="listarMecanicos-filters">
        <div className="listarMecanicos-searchContainer">
          <FaSearch className="listarMecanicos-searchIcon" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="listarMecanicos-searchInput"
          />
        </div>

        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="listarMecanicos-filterSelect"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      <div className="listarMecanicos-tableContainer">
        <table className="listarMecanicos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((mecanico) => (
              <tr key={mecanico.id}>
                <td>{mecanico.id}</td>
                <td>{`${mecanico.nombre} ${mecanico.apellido}`}</td>
                <td>{mecanico.documento}</td>
                <td>{mecanico.telefono}</td>
                <td>
                  <span className={`listarMecanicos-status ${mecanico.estado.toLowerCase()}`}>{mecanico.estado}</span>
                </td>
                <td>
                  <div className="listarMecanicos-actions">
                    <button
                      className="listarMecanicos-actionButton view"
                      onClick={() => navigate(`/dashboard/mecanicos/detalle/${mecanico.id}`)}
                      title="Ver detalles"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="listarMecanicos-actionButton edit"
                      onClick={() => navigate(`/dashboard/mecanicos/editar/${mecanico.id}`)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="listarMecanicos-actionButton delete"
                      onClick={() => handleDelete(mecanico)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="listarMecanicos-pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="listarMecanicos-paginationButton"
          >
            Anterior
          </button>

          <span className="listarMecanicos-paginationInfo">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="listarMecanicos-paginationButton"
          >
            Siguiente
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div className="listarMecanicos-modal">
          <div className="listarMecanicos-modalContent">
            <h3>Confirmar Eliminación</h3>
            <p>
              ¿Está seguro que desea eliminar al mecánico{" "}
              <strong>
                {mecanicoToDelete?.nombre} {mecanicoToDelete?.apellido}
              </strong>
              ?
            </p>
            <div className="listarMecanicos-modalActions">
              <button onClick={cancelDelete} className="listarMecanicos-cancelButton">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="listarMecanicos-confirmButton">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListarMecanicos

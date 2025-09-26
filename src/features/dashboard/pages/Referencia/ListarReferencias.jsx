"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaTag,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaExclamationTriangle,
  FaPlus,
  FaSortAlphaDown,
  FaSortAlphaUp,
} from "react-icons/fa"
import Swal from "sweetalert2"
import "../../../../shared/styles/Referencia/ListarReferencias.css"

const ListarReferencias = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [referencias, setReferencias] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [ordenAscendente, setOrdenAscendente] = useState(true)
  const [paginaActual, setPaginaActual] = useState(1)
  const [referenciasPorPagina] = useState(4)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    fetchReferencias()
    return () => {
      document.body.style.background = ""
    }
  }, [])

  const fetchReferencias = async () => {
    try {
      setCargando(true)
      const res = await fetch("https://api-final-8rw7.onrender.com/api/referencias", {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error("Error al obtener referencias")

      const data = await res.json()
      setReferencias(data)
    } catch (err) {
      console.error("Error al obtener referencias:", err)
      setReferencias([])
      Swal.fire("Error", "No se pudieron cargar las referencias", "error")
    } finally {
      setCargando(false)
    }
  }

  const eliminarReferencia = useCallback(
    async (id) => {
      if (!id) {
        Swal.fire("Error", "ID de referencia inválido", "error")
        return
      }

      const result = await Swal.fire({
        title: "¿Eliminar referencia?",
        text: "Esta acción eliminará la referencia permanentemente y no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) return

      try {
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/referencias/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Error al eliminar la referencia")

        setReferencias((prev) => prev.filter((r) => r.id !== id))

        Swal.fire({
          icon: "success",
          title: "Referencia eliminada",
          text: "La referencia ha sido eliminada correctamente",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (err) {
        console.error("Error al eliminar la referencia:", err)
        Swal.fire("Error", "No se pudo eliminar la referencia", "error")
      }
    },
    [token],
  )

  const handleSearch = useCallback((e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }, [])

  const toggleOrden = useCallback(() => {
    setOrdenAscendente((prev) => !prev)
    setPaginaActual(1)
  }, [])

  const referenciasFiltradas = referencias.filter((referencia) => {
    const matchBusqueda = Object.values(referencia).some((val) => String(val).toLowerCase().includes(busqueda))
    return matchBusqueda
  })

  const referenciasOrdenadas = [...referenciasFiltradas].sort((a, b) => {
    const nombreA = a.nombre.toLowerCase()
    const nombreB = b.nombre.toLowerCase()

    if (ordenAscendente) {
      return nombreA.localeCompare(nombreB)
    } else {
      return nombreB.localeCompare(nombreA)
    }
  })

  const indiceUltimaReferencia = paginaActual * referenciasPorPagina
  const indicePrimeraReferencia = indiceUltimaReferencia - referenciasPorPagina
  const referenciasActuales = referenciasOrdenadas.slice(indicePrimeraReferencia, indiceUltimaReferencia)
  const totalPaginas = Math.ceil(referenciasOrdenadas.length / referenciasPorPagina) || 1; // Ensure at least 1 page

  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

  if (cargando) {
    return (
      <div className="listarReferencias-container">
        <div className="listarReferencias-loading">
          <div className="listarReferencias-spinner"></div>
          <p>Cargando referencias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarReferencias-container">
      <div className="listarReferencias-header">
        <div className="listarReferencias-title-section">
          <h1 className="listarReferencias-page-title">
            <FaTag className="listarReferencias-title-icon" />
            Gestión de Referencias
          </h1>
          <p className="listarReferencias-subtitle">Administra las referencias del sistema</p>
        </div>
        <button className="listarReferencias-create-button" onClick={() => navigate("/referencias/crear")}>
          <FaPlus className="listarReferencias-button-icon" />
          Crear Referencia
        </button>
      </div>

      <div className="listarReferencias-filters-container">
        <div className="listarReferencias-filter-item">
          <label className="listarReferencias-filter-label">Buscar:</label>
          <div className="listarReferencias-search-container">
            <FaSearch className="listarReferencias-search-icon" />
            <input
              type="text"
              className="listarReferencias-search-input"
              placeholder="Buscar por cualquier campo..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarReferencias-filter-item">
          <label className="listarReferencias-filter-label">Ordenar:</label>
          <button
            onClick={toggleOrden}
            className="listarReferencias-sort-button"
            title={`Ordenar ${ordenAscendente ? "descendente" : "ascendente"}`}
          >
            {ordenAscendente ? (
              <>
                <FaSortAlphaDown className="listarReferencias-sort-icon" />
                Ascendente
              </>
            ) : (
              <>
                <FaSortAlphaUp className="listarReferencias-sort-icon" />
                Descendente
              </>
            )}
          </button>
        </div>
      </div>

      <div className="listarReferencias-table-container">
        <table className="listarReferencias-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Tipo Vehículo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {referenciasActuales.map((referencia) => (
              <tr key={referencia.id}>
                <td>
                  <div className="listarReferencias-referencia-info">
                    <span className="listarReferencias-referencia-name">{referencia.nombre}</span>
                  </div>
                </td>
                <td>{referencia.descripcion}</td>
                <td>{referencia.tipo_vehiculo}</td>
                <td className="listarReferencias-actions">
                  <button
                    className="listarReferencias-action-button detail"
                    onClick={() => navigate(`/referencias/detalle/${referencia.id}`)}
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="listarReferencias-action-button edit"
                    onClick={() => navigate(`/referencias/editar/${referencia.id}`)}
                    title="Editar referencia"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="listarReferencias-action-button delete"
                    onClick={() => eliminarReferencia(referencia.id)}
                    title="Eliminar referencia"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {referenciasOrdenadas.length === 0 && (
          <div className="listarReferencias-no-results">
            <FaExclamationTriangle className="listarReferencias-no-results-icon" />
            <p>No se encontraron referencias con los criterios de búsqueda.</p>
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="listarReferencias-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarReferencias-pagination-button"
            >
              Anterior
            </button>

            {/* Renderizar botones de paginación */}
            {(() => {
              const pageButtons = [];
              const maxPageButtons = 5; // Número máximo de botones de página a mostrar
              const startPage = Math.max(1, paginaActual - Math.floor(maxPageButtons / 2));
              const endPage = Math.min(totalPaginas, startPage + maxPageButtons - 1);

              if (startPage > 1) {
                pageButtons.push(
                  <button
                    key={1}
                    onClick={() => setPaginaActual(1)}
                    className={`listarReferencias-pagination-button ${paginaActual === 1 ? "active" : ""}`}
                  >
                    1
                  </button>
                );
                if (startPage > 2) {
                  pageButtons.push(<span key="ellipsis-start" className="listarReferencias-pagination-ellipsis">...</span>);
                }
              }

              for (let i = startPage; i <= endPage; i++) {
                pageButtons.push(
                  <button
                    key={i}
                    onClick={() => setPaginaActual(i)}
                    className={`listarReferencias-pagination-button ${paginaActual === i ? "active" : ""}`}
                  >
                    {i}
                  </button>
                );
              }

              if (endPage < totalPaginas) {
                if (endPage < totalPaginas - 1) {
                  pageButtons.push(<span key="ellipsis-end" className="listarReferencias-pagination-ellipsis">...</span>);
                }
                pageButtons.push(
                  <button
                    key={totalPaginas}
                    onClick={() => setPaginaActual(totalPaginas)}
                    className={`listarReferencias-pagination-button ${paginaActual === totalPaginas ? "active" : ""}`}
                  >
                    {totalPaginas}
                  </button>
                );
              }
              return pageButtons;
            })()}

            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="listarReferencias-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarReferencias

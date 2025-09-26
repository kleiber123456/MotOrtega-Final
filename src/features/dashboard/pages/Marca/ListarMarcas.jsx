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
import "../../../../shared/styles/Marca/ListarMarcas.css"

const ListarMarcas = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  const [marcas, setMarcas] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [ordenAscendente, setOrdenAscendente] = useState(true)
  const [paginaActual, setPaginaActual] = useState(1)
  const [marcasPorPagina] = useState(4)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"
    fetchMarcas()
    return () => {
      document.body.style.background = ""
    }
  }, [])

  const fetchMarcas = async () => {
    try {
      setCargando(true)
      const res = await fetch("https://api-final-8rw7.onrender.com/api/marcas", {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error("Error al obtener marcas")

      const data = await res.json()
      setMarcas(data)
    } catch (err) {
      console.error("Error al obtener marcas:", err)
      setMarcas([])
      Swal.fire("Error", "No se pudieron cargar las marcas", "error")
    } finally {
      setCargando(false)
    }
  }

  const eliminarMarca = useCallback(
    async (id) => {
      if (!id) {
        Swal.fire("Error", "ID de marca inválido", "error")
        return
      }

      const result = await Swal.fire({
        title: "¿Eliminar marca?",
        text: "Esta acción eliminará la marca permanentemente y no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) return

      try {
        const res = await fetch(`https://api-final-8rw7.onrender.com/api/marcas/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) throw new Error("Error al eliminar la marca")

        setMarcas((prev) => prev.filter((m) => m.id !== id))

        Swal.fire({
          icon: "success",
          title: "Marca eliminada",
          text: "La marca ha sido eliminada correctamente",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (err) {
        console.error("Error al eliminar la marca:", err)
        Swal.fire("Error", "No se pudo eliminar la marca", "error")
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

  const marcasFiltradas = marcas.filter((marca) => {
    const matchBusqueda = Object.values(marca).some((val) => String(val).toLowerCase().includes(busqueda))
    return matchBusqueda
  })

  const marcasOrdenadas = [...marcasFiltradas].sort((a, b) => {
    const nombreA = a.nombre.toLowerCase()
    const nombreB = b.nombre.toLowerCase()

    if (ordenAscendente) {
      return nombreA.localeCompare(nombreB)
    } else {
      return nombreB.localeCompare(nombreA)
    }
  })

  const indiceUltimaMarca = paginaActual * marcasPorPagina
  const indicePrimeraMarca = indiceUltimaMarca - marcasPorPagina
  const marcasActuales = marcasOrdenadas.slice(indicePrimeraMarca, indiceUltimaMarca)
  const totalPaginas = Math.ceil(marcasOrdenadas.length / marcasPorPagina) || 1; // Ensure at least 1 page

  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

  if (cargando) {
    return (
      <div className="listarMarcas-container">
        <div className="listarMarcas-loading">
          <div className="listarMarcas-spinner"></div>
          <p>Cargando marcas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="listarMarcas-container">
      <div className="listarMarcas-header">
        <div className="listarMarcas-title-section">
          <h1 className="listarMarcas-page-title">
            <FaTag className="listarMarcas-title-icon" />
            Gestión de Marcas
          </h1>
          <p className="listarMarcas-subtitle">Administra las marcas del sistema</p>
        </div>
        <button className="listarMarcas-create-button" onClick={() => navigate("/crearMarca")}>
          <FaPlus className="listarMarcas-button-icon" />
          Crear Marca
        </button>
      </div>

      <div className="listarMarcas-filters-container">
        <div className="listarMarcas-filter-item">
          <label className="listarMarcas-filter-label">Buscar:</label>
          <div className="listarMarcas-search-container">
            <FaSearch className="listarMarcas-search-icon" />
            <input
              type="text"
              className="listarMarcas-search-input"
              placeholder="Buscar por cualquier campo..."
              value={busqueda}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="listarMarcas-filter-item">
          <label className="listarMarcas-filter-label">Ordenar:</label>
          <button
            onClick={toggleOrden}
            className="listarMarcas-sort-button"
            title={`Ordenar ${ordenAscendente ? "descendente" : "ascendente"}`}
          >
            {ordenAscendente ? (
              <>
                <FaSortAlphaDown className="listarMarcas-sort-icon" />
                Ascendente
              </>
            ) : (
              <>
                <FaSortAlphaUp className="listarMarcas-sort-icon" />
                Descendente
              </>
            )}
          </button>
        </div>
      </div>

      <div className="listarMarcas-table-container">
        <table className="listarMarcas-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {marcasActuales.map((marca) => (
              <tr key={marca.id}>
                <td>
                  <div className="listarMarcas-marca-info">
                    <span className="listarMarcas-marca-name">{marca.nombre}</span>
                  </div>
                </td>
                <td className="listarMarcas-actions">
                  <button
                    className="listarMarcas-action-button detail"
                    onClick={() => navigate(`/marcas/detalle/${marca.id}`)}
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="listarMarcas-action-button edit"
                    onClick={() => navigate(`/marcas/editar/${marca.id}`)}
                    title="Editar marca"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="listarMarcas-action-button delete"
                    onClick={() => eliminarMarca(marca.id)}
                    title="Eliminar marca"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {marcasOrdenadas.length === 0 && (
          <div className="listarMarcas-no-results">
            <FaExclamationTriangle className="listarMarcas-no-results-icon" />
            <p>No se encontraron marcas con los criterios de búsqueda.</p>
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="listarMarcas-pagination">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="listarMarcas-pagination-button"
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
                    className={`listarMarcas-pagination-button ${paginaActual === 1 ? "active" : ""}`}
                  >
                    1
                  </button>
                );
                if (startPage > 2) {
                  pageButtons.push(<span key="ellipsis-start" className="listarMarcas-pagination-ellipsis">...</span>);
                }
              }

              for (let i = startPage; i <= endPage; i++) {
                pageButtons.push(
                  <button
                    key={i}
                    onClick={() => setPaginaActual(i)}
                    className={`listarMarcas-pagination-button ${paginaActual === i ? "active" : ""}`}
                  >
                    {i}
                  </button>
                );
              }

              if (endPage < totalPaginas) {
                if (endPage < totalPaginas - 1) {
                  pageButtons.push(<span key="ellipsis-end" className="listarMarcas-pagination-ellipsis">...</span>);
                }
                pageButtons.push(
                  <button
                    key={totalPaginas}
                    onClick={() => setPaginaActual(totalPaginas)}
                    className={`listarMarcas-pagination-button ${paginaActual === totalPaginas ? "active" : ""}`}
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
              className="listarMarcas-pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListarMarcas

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaSortAlphaDown, FaSortAlphaUp, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import '../../../shared/styles/mechanic/MecanicoRepuestos.css'; // Import the new CSS

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api";

const MecanicoRepuestos = () => {
  const [repuestos, setRepuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [categoriasList, setCategoriasList] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // You can adjust this value

  // API Request Helper
  const makeRequest = useCallback(async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error("No hay token disponible");
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`Error en petición a ${endpoint}:`, err);
      throw err;
    }
  }, []);

  // Fetch Repuestos and Categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [repuestosData, categoriasData] = await Promise.all([
          makeRequest("/repuestos"),
          makeRequest("/categorias-repuestos"),
        ]);
        setRepuestos(repuestosData);
        setCategoriasList(categoriasData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [makeRequest]);

  // Filtering and Sorting Logic
  const filteredAndSortedRepuestos = React.useMemo(() => {
    let currentRepuestos = [...repuestos];

    // Apply search filter
    if (searchTerm) {
      currentRepuestos = currentRepuestos.filter(repuesto =>
        repuesto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repuesto.descripcion && repuesto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoriaFiltro) {
      currentRepuestos = currentRepuestos.filter(repuesto =>
        repuesto.categoria_repuesto_id.toString() === categoriaFiltro
      );
    }

    // Apply status filter
    if (estadoFiltro) {
      currentRepuestos = currentRepuestos.filter(repuesto =>
        repuesto.estado === estadoFiltro
      );
    }

    // Apply sorting
    currentRepuestos.sort((a, b) => {
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();
      if (ordenAscendente) {
        return nombreA.localeCompare(nombreB);
      } else {
        return nombreB.localeCompare(nombreA);
      }
    });

    return currentRepuestos;
  }, [repuestos, searchTerm, categoriaFiltro, estadoFiltro, ordenAscendente]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedRepuestos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedRepuestos.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoriaFiltro(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setEstadoFiltro(e.target.value);
    setCurrentPage(1);
  };

  const toggleOrden = () => {
    setOrdenAscendente(prev => !prev);
    setCurrentPage(1);
  };

  const formatearPrecio = useCallback((precio) => {
    if (!precio) return "$0.00";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(precio);
  }, []);

  if (loading) {
    return (
      <div className="lrm-container">
        <div className="lrm-loading-container">
          <div className="lrm-spinner"></div>
          <p className="lrm-loading-text">Cargando repuestos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lrm-container">
        <div className="lrm-empty-state">
          <p>Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lrm-container">
      <div className="lrm-header">
        <div className="lrm-header-content">
          <h1 className="lrm-title">Listado de Repuestos</h1>
          <p className="lrm-subtitle">Gestiona los repuestos disponibles en el inventario.</p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="lrm-filters-container">
        <div className="lrm-filter-item">
          <label className="lrm-filter-label">Buscar:</label>
          <div className="lrm-search-wrapper">
            <FaSearch className="lrm-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="lrm-search-input"
            />
          </div>
        </div>

        <div className="lrm-filter-item">
          <label className="lrm-filter-label">Estado:</label>
          <select
            value={estadoFiltro}
            onChange={handleStatusFilterChange}
            className="lrm-filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <div className="lrm-filter-item">
          <label className="lrm-filter-label">Ordenar:</label>
          <button
            onClick={toggleOrden}
            className="lrm-sort-button"
            title={`Ordenar ${ordenAscendente ? "descendente" : "ascendente"}`}
          >
            {ordenAscendente ? (
              <><FaSortAlphaDown className="lrm-sort-icon" /> Ascendente</>
            ) : (
              <><FaSortAlphaUp className="lrm-sort-icon" /> Descendente</>
            )}
          </button>
        </div>
      </div>

      {/* Repuestos List (Card-like) */}
      <div className="lrm-repuestos-list">
        {currentItems.length > 0 ? (
          currentItems.map(repuesto => (
            <div key={repuesto.id} className="lrm-repuesto-card">
              <h2 className="lrm-card-title">{repuesto.nombre}</h2>
              <p className="lrm-card-info"><strong>Cantidad:</strong> {repuesto.cantidad || 0}</p>
              <p className="lrm-card-info"><strong>Precio Unitario:</strong> {formatearPrecio(repuesto.precio_venta)}</p>
              {/* You can add more details here if needed, but keep it concise for mobile */}
            </div>
          ))
        ) : (
          <div className="lrm-empty-state">
            <FaExclamationTriangle className="lrm-no-results-icon" />
            <p>No se encontraron repuestos con los criterios seleccionados.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="lrm-pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="lrm-pagination-button"
          >
            Anterior
          </button>
          {(() => {
            const pageNumbers = [];
            const maxPagesToShow = 3; // Max 3 page numbers
            let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            // Adjust startPage if we are at the end
            if (endPage - startPage + 1 < maxPagesToShow) {
              startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            // Add first page and ellipsis if necessary
            if (startPage > 1) {
              pageNumbers.push(
                <button key={1} onClick={() => paginate(1)} className="lrm-pagination-button">
                  1
                </button>
              );
              if (startPage > 2) {
                pageNumbers.push(<span key="ellipsis-start" className="lrm-pagination-ellipsis">...</span>);
              }
            }

            // Add pages in the calculated range
            for (let i = startPage; i <= endPage; i++) {
              pageNumbers.push(
                <button
                  key={i}
                  onClick={() => paginate(i)}
                  className={`lrm-pagination-button ${currentPage === i ? 'active' : ''}`}
                >
                  {i}
                </button>
              );
            }

            // Add last page and ellipsis if necessary
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pageNumbers.push(<span key="ellipsis-end" className="lrm-pagination-ellipsis">...</span>);
              }
              pageNumbers.push(
                <button key={totalPages} onClick={() => paginate(totalPages)} className="lrm-pagination-button">
                  {totalPages}
                </button>
              );
            }

            return pageNumbers;
          })()}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="lrm-pagination-button"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default MecanicoRepuestos;


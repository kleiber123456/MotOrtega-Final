'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFileInvoiceDollar, FaSignOutAlt, FaEye } from 'react-icons/fa'
import '../../../shared/styles/Client/MisFacturas.css'
import '../../../shared/components/layout/dashclient.css'

const API_BASE_URL = 'https://api-final-8rw7.onrender.com/api'

const MisFacturas = () => {
  const navigate = useNavigate()
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const makeRequest = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (!token) throw new Error('No hay token disponible')

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
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

  const fetchFacturas = async () => {
    try {
      setLoading(true)
      const response = await makeRequest('/ventas/mis-ventas')
      const facturasData = Array.isArray(response) ? response : response?.data || []
      setFacturas(facturasData)
    } catch (err) {
      setError('No se pudieron cargar las facturas. Inténtalo de nuevo más tarde.')
      console.error('Error cargando facturas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacturas()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('usuario')
    navigate('/')
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor)
  }

  if (loading) {
    return (
      <div className='dashC-body'>
        <div className='dashC-header'>
          <div className='dashC-header-content'>
            <img className='dashC-logo' src='/perfil.jpg' alt='Logo' />
            <div className='dashC-title-container'>
              <h1 className='dashC-title'>Mis Facturas</h1>
            </div>
          </div>
        </div>
        <div className='dashC-Section1'>
          <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando facturas...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='dashC-body'>
        <div className='dashC-header'>
            <h1 className='dashC-title'>Mis Facturas</h1>
        </div>
        <div className='dashC-Section1'>
          <p className='dvc-error'>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='dashC-body'>
      <div className='dashC-header'>
        <div className='dashC-header-content'>
          <img className='dashC-logo' src='/perfil.jpg' alt='Logo' />
          <div className='dashC-title-container'>
            <h1 className='dashC-title'>Mis Facturas</h1>
          </div>
          <button className='layC-nav-btn-S' onClick={handleLogout} aria-label='Cerrar sesión'>
            <FaSignOutAlt />
            <span className='layC-nav-label'>Salir</span>
          </button>
        </div>
      </div>

      <div className='dashC-Section1'>
        <div className='dashC-content'>
          {facturas.length > 0 ? (
            <div className='dvc-facturas-list'>
              {facturas.map((factura) => (
                <div key={factura.id} className='dvc-factura-card'>
                  <div className='dvc-factura-header'>
                    <span>Factura #{factura.id}</span>
                    <span className={`dvc-estado ${factura.estado?.toLowerCase()}`}>
                      {factura.estado}
                    </span>
                  </div>
                  <div className='dvc-factura-body'>
                    <p><strong>Fecha:</strong> {formatearFecha(factura.fecha)}</p>
                    <p><strong>Total:</strong> {formatearMoneda(factura.total)}</p>
                    <p><strong>Vehículo:</strong> {factura.vehiculo_placa}</p>
                  </div>
                  <div className='dvc-factura-footer'>
                    <button 
                      className='dvc-detalle-btn'
                      onClick={() => navigate(`/client/facturas/detalle/${factura.id}`)}
                    >
                      <FaEye /> Ver Detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='dvc-empty-state'>
              <FaFileInvoiceDollar />
              <p>No tienes facturas disponibles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MisFacturas

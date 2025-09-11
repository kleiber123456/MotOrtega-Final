import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaFileInvoiceDollar, FaUser, FaCar, FaCalendarAlt, FaDownload, FaSpinner, FaExclamationCircle, FaSignOutAlt, FaShareAlt } from 'react-icons/fa'
import { cargarDatosCompletosVenta, generarFacturaPDF } from '../../dashboard/utils/pdf-generator'
import '../../../shared/styles/Client/DetalleFactura.css'
import '../../../shared/components/layout/dashclient.css'

const DetalleFactura = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [factura, setFactura] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const fetchFactura = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')
        if (!token) {
          throw new Error('No hay token de autenticación')
        }

        const data = await cargarDatosCompletosVenta(id, token)
        setFactura(data)
      } catch (err) {
        console.error('Error al cargar la factura:', err)
        setError('No se pudo cargar la información de la factura. Por favor, inténtalo de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    fetchFactura()
  }, [id])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('usuario')
    navigate('/')
  }

  const handleDownloadPdf = async () => {
    if (!factura) return
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      await generarFacturaPDF(factura.venta, factura.cliente, factura.detallesConProductos, token)
    } catch (error) {
      console.error('Error al generar el PDF:', error)
      alert('Hubo un error al generar el PDF.')
    }
  }

  const handleSharePdf = async () => {
    if (!factura || isSharing) return;
    setIsSharing(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const pdfBlob = await generarFacturaPDF(factura.venta, factura.cliente, factura.detallesConProductos, token, { outputType: 'blob' });
      const pdfFile = new File([pdfBlob], `FV-${factura.venta.id.toString().padStart(6, '0')}.pdf`, { type: 'application/pdf' });

      if (navigator.share) {
        await navigator.share({
          title: `Factura FV-${factura.venta.id.toString().padStart(6, '0')}`,
          text: `Adjunto encontrarás la factura de tu servicio en MotOrtega.`,
          files: [pdfFile],
        });
      } else {
        alert('La función de compartir no es compatible con tu navegador. El archivo se descargará.');
        handleDownloadPdf();
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error al compartir el PDF:', error);
        alert('No se pudo compartir el archivo. Se descargará en su lugar.');
        handleDownloadPdf();
      }
    } finally {
      setIsSharing(false);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor)
  }

  if (loading) {
    return (
      <div className='dvc-loading-container'>
        <FaSpinner className='dvc-spinner' />
        <p>Cargando factura...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='dvc-error-container'>
        <FaExclamationCircle />
        <p>{error}</p>
        <button onClick={() => navigate('/client/facturas')}>Volver a Mis Facturas</button>
      </div>
    )
  }

  return (
    <div className='dashC-body'>
      <div className='dashC-header'>
        <div className='dashC-header-content'>
          <img className='dashC-logo' src='/perfil.jpg' alt='Logo' />
          <div className='dashC-title-container'>
            <h1 className='dashC-title'>Detalle de Factura</h1>
          </div>
          <button className='layC-nav-btn-S' onClick={handleLogout} aria-label='Cerrar sesión'>
            <FaSignOutAlt />
            <span className='layC-nav-label'>Salir</span>
          </button>
        </div>
      </div>

      <div className='dashC-Section1'>
        <div className='dvc-detalle-factura-container'>
          <div className='dvc-factura-header-actions'>
            <h2>Factura FV-{factura.venta.id.toString().padStart(6, '0')}</h2>
            <div className='dvc-header-buttons'>
              <button onClick={handleDownloadPdf} className='dvc-download-btn' disabled={isSharing}>
                <FaDownload />
                {isSharing ? 'Compartiendo...' : 'Descargar PDF'}
              </button>
              <button onClick={handleSharePdf} className='dvc-share-btn' disabled={isSharing}>
                <FaShareAlt />
                Compartir
              </button>
            </div>
          </div>

          <div className='dvc-info-grid'>
            <div className='dvc-info-card'>
              <div className='dvc-card-header'>
                <FaUser />
                <h3>Cliente</h3>
              </div>
              <p><strong>Nombre:</strong> {factura.cliente?.nombre || 'N/A'}</p>
              <p><strong>Email:</strong> {factura.cliente?.correo || 'N/A'}</p>
              <p><strong>Teléfono:</strong> {factura.cliente?.telefono || 'N/A'}</p>
            </div>
            <div className='dvc-info-card'>
              <div className='dvc-card-header'>
                <FaCar />
                <h3>Vehículo</h3>
              </div>
              <p><strong>Placa:</strong> {factura.venta.vehiculo_placa || 'N/A'}</p>
              <p><strong>Marca:</strong> {factura.venta.marca_nombre || 'N/A'}</p>
              <p><strong>Modelo:</strong> {factura.venta.referencia_nombre || 'N/A'}</p>
            </div>
          </div>

          <div className='dvc-items-section'>
            <h3>Detalles de la Factura</h3>
            <table className='dvc-items-table'>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {factura.detallesConProductos.map((item, index) => (
                  <tr key={index}>
                    <td data-label="Descripción">{item.repuesto_nombre || item.nombre || item.servicio_nombre || 'Descripción no disponible'}</td>
                    <td data-label="Cantidad">{item.cantidad || 1}</td>
                    <td data-label="Precio Unitario">{formatearMoneda(item.repuesto_precio || item.precio_unitario || item.subtotal || 0)}</td>
                    <td data-label="Subtotal">{formatearMoneda(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='dvc-total-section'>
            <div className='dvc-total-line'>
              <span>Subtotal:</span>
              <span>{formatearMoneda(factura.venta.total)}</span>
            </div>
            <div className='dvc-total-line grand-total'>
              <span>TOTAL:</span>
              <span>{formatearMoneda(factura.venta.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleFactura
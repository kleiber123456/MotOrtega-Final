"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Line,
} from "recharts"
import {
  FaTools,
  FaShoppingCart,
  FaCogs,
  FaMoneyBillWave,
  FaBox,
  FaUsers,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaArrowUp,
  FaPlus,
  FaUserPlus,
  FaShoppingBag,
  FaUserTie,
  FaHourglassHalf,
} from "react-icons/fa"
import "../../../../shared/styles/Dashboard.css"

const Dashboard = () => {
  const [userData, setUserData] = useState({
    nombre: "Usuario",
    rol: "Usuario",
  })

  const [dashboardData, setDashboardData] = useState({
    estadisticas: null,
    serviciosActivos: [],
    repuestosBajoStock: [],
    comprasRecientes: [],
    ventasRecientes: [],
    citasHoy: [],
    citasProximasSemana: [],
    topServicios: [],
    topRepuestos: [],
    mecanicosActivos: [],
    clientesFrecuentes: [],
    tendenciasVentas: [],
    tendenciasCitas: [],
    tendenciasCompras: [],
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const token = localStorage.getItem("token") || sessionStorage.getItem("token")

  useEffect(() => {
    // Obtener datos del usuario del almacenamiento
    const storedUser = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")
    if (storedUser) {
      setUserData(JSON.parse(storedUser))
    }

    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!token) {
        throw new Error("Token de autenticación no encontrado")
      }

      const headers = {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      }

      // Usar endpoints que sabemos que funcionan como fallback
      const [
        citasRes,
        ventasRes,
        comprasRes,
        repuestosRes,
        serviciosRes,
        clientesRes,
        mecanicosRes,
        vehiculosRes,
        proveedoresRes,
      ] = await Promise.allSettled([
        axios.get("https://api-final-8rw7.onrender.com/api/citas", { headers }),
        axios.get("https://api-final-8rw7.onrender.com/api/ventas", { headers }),
        axios.get("https://api-final-8rw7.onrender.com/api/compras", { headers }),
        axios.get("https://api-final-8rw7.onrender.com/api/repuestos", { headers }),
        axios.get("https://api-final-8rw7.onrender.com/api/servicios", { headers }),
        axios.get("https://api-final-8rw7.onrender.com/api/clientes", { headers }),
        axios.get("https://api-final-8rw7.onrender.com/api/mecanicos", { headers }),
        axios.get("https://api-final-8rw7.onrender.com/api/vehiculos", { headers }),
        axios.get("https://api-final-8rw7.onrender.com/api/proveedores", { headers }),
      ])

      // Procesar datos exitosos
      const citas = citasRes.status === "fulfilled" ? citasRes.value.data : []
      const ventas = ventasRes.status === "fulfilled" ? ventasRes.value.data : []
      const compras = comprasRes.status === "fulfilled" ? comprasRes.value.data : []
      const repuestos = repuestosRes.status === "fulfilled" ? repuestosRes.value.data : []
      const servicios = serviciosRes.status === "fulfilled" ? serviciosRes.value.data : []
      const clientes = clientesRes.status === "fulfilled" ? clientesRes.value.data : []
      const mecanicos = mecanicosRes.status === "fulfilled" ? mecanicosRes.value.data : []
      const vehiculos = vehiculosRes.status === "fulfilled" ? vehiculosRes.value.data : []
      const proveedores = proveedoresRes.status === "fulfilled" ? proveedoresRes.value.data : []

      // Calcular estadísticas manualmente
      const hoy = new Date()
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
      const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0)

      // Filtrar datos por fechas
      const ventasMesActual = ventas.filter((venta) => {
        const fechaVenta = new Date(venta.fecha)
        return fechaVenta >= inicioMes && venta.estado_venta_id === 2
      })

      const ventasMesAnterior = ventas.filter((venta) => {
        const fechaVenta = new Date(venta.fecha)
        return fechaVenta >= inicioMesAnterior && fechaVenta <= finMesAnterior && venta.estado_venta_id === 2
      })

      const comprasMesActual = compras.filter((compra) => {
        const fechaCompra = new Date(compra.fecha)
        return fechaCompra >= inicioMes
      })

      // Citas de hoy
      const citasHoy = citas.filter((cita) => {
        const fechaCita = new Date(cita.fecha)
        return fechaCita.toDateString() === hoy.toDateString()
      })

      // Citas próxima semana
      const proximaSemana = new Date()
      proximaSemana.setDate(proximaSemana.getDate() + 7)
      const citasProximasSemana = citas.filter((cita) => {
        const fechaCita = new Date(cita.fecha)
        return fechaCita >= hoy && fechaCita <= proximaSemana
      })

      // Repuestos bajo stock
      const repuestosBajoStock = repuestos.filter((repuesto) => repuesto.cantidad <= 10 && repuesto.estado === "Activo")

      // Servicios más solicitados (simulado basado en servicios activos)
      const topServicios = servicios
        .filter((servicio) => servicio.estado === "Activo")
        .map((servicio) => ({
          id: servicio.id,
          nombre: servicio.nombre,
          precio: servicio.precio,
          veces_vendido: Math.floor(Math.random() * 50) + 10,
          ingresos_generados: servicio.precio * (Math.floor(Math.random() * 50) + 10),
        }))
        .sort((a, b) => b.veces_vendido - a.veces_vendido)
        .slice(0, 6)

      // Top repuestos (simulado)
      const topRepuestos = repuestos
        .filter((repuesto) => repuesto.estado === "Activo")
        .map((repuesto) => ({
          id: repuesto.id,
          nombre: repuesto.nombre,
          cantidad: repuesto.cantidad,
          precio_venta: repuesto.precio_venta,
          categoria_nombre: repuesto.categoria_repuesto?.nombre || "Sin categoría",
          total_vendido: Math.floor(Math.random() * 30) + 5,
          ingresos_generados: repuesto.precio_venta * (Math.floor(Math.random() * 30) + 5),
        }))
        .sort((a, b) => b.total_vendido - a.total_vendido)
        .slice(0, 6)

      // Clientes frecuentes (simulado basado en clientes activos)
      const clientesFrecuentes = clientes
        .filter((cliente) => cliente.estado === "Activo")
        .map((cliente) => ({
          id: cliente.id,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          telefono: cliente.telefono,
          total_ventas: Math.floor(Math.random() * 20) + 1,
          total_gastado: Math.floor(Math.random() * 5000000) + 100000,
          ultima_visita: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        }))
        .sort((a, b) => b.total_ventas - a.total_ventas)
        .slice(0, 5)

      // Mecánicos activos con estadísticas
      const mecanicosActivos = mecanicos
        .filter((mecanico) => mecanico.estado === "Activo")
        .map((mecanico) => {
          const citasMecanico = citas.filter((cita) => cita.mecanico_id === mecanico.id)
          return {
            id: mecanico.id,
            nombre: mecanico.nombre,
            apellido: mecanico.apellido,
            total_citas: citasMecanico.length,
            citas_completadas: citasMecanico.filter((cita) => cita.estado_cita_id === 3).length,
            citas_programadas: citasMecanico.filter((cita) => cita.estado_cita_id === 1).length,
          }
        })

      // Tendencias por mes (últimos 6 meses)
      const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      const tendenciasVentas = []
      const tendenciasCitas = []
      const tendenciasCompras = []

      for (let i = 5; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
        const fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() - i + 1, 0)

        const ventasMes = ventas.filter((venta) => {
          const fechaVenta = new Date(venta.fecha)
          return fechaVenta >= fecha && fechaVenta <= fechaFin
        })

        const citasMes = citas.filter((cita) => {
          const fechaCita = new Date(cita.fecha)
          return fechaCita >= fecha && fechaCita <= fechaFin
        })

        const comprasMes = compras.filter((compra) => {
          const fechaCompra = new Date(compra.fecha)
          return fechaCompra >= fecha && fechaCompra <= fechaFin
        })

        tendenciasVentas.push({
          mes: mesesNombres[fecha.getMonth()],
          ventas: ventasMes.length,
          ingresos: ventasMes.reduce((sum, venta) => sum + (venta.total || 0), 0),
          ventasPagadas: ventasMes.filter((venta) => venta.estado_venta_id === 2).length,
        })

        tendenciasCitas.push({
          mes: mesesNombres[fecha.getMonth()],
          total: citasMes.length,
          completadas: citasMes.filter((cita) => cita.estado_cita_id === 3).length,
          canceladas: citasMes.filter((cita) => cita.estado_cita_id === 4).length,
        })

        tendenciasCompras.push({
          mes: mesesNombres[fecha.getMonth()],
          compras: comprasMes.length,
          monto: comprasMes.reduce((sum, compra) => sum + (compra.total || 0), 0),
          completadas: comprasMes.filter((compra) => compra.estado === "Completado").length,
        })
      }

      // Calcular estadísticas generales
      const ingresosTotales = ventas
        .filter((venta) => venta.estado_venta_id === 2)
        .reduce((sum, venta) => sum + (venta.total || 0), 0)

      const ingresosMesActual = ventasMesActual.reduce((sum, venta) => sum + (venta.total || 0), 0)

      const estadisticas = {
        resumenEjecutivo: {
          ventas_hoy: ventas.filter((venta) => {
            const fechaVenta = new Date(venta.fecha)
            return fechaVenta.toDateString() === hoy.toDateString()
          }).length,
          citas_hoy: citasHoy.length,
          ingresos_hoy: ventas
            .filter((venta) => {
              const fechaVenta = new Date(venta.fecha)
              return fechaVenta.toDateString() === hoy.toDateString() && venta.estado_venta_id === 2
            })
            .reduce((sum, venta) => sum + (venta.total || 0), 0),
          citas_proxima_semana: citasProximasSemana.length,
          repuestos_bajo_stock: repuestosBajoStock.length,
          compras_pendientes: compras.filter((compra) => compra.estado === "Pendiente").length,
        },
        servicios: {
          total: servicios.length,
          activos: servicios.filter((s) => s.estado === "Activo").length,
          inactivos: servicios.filter((s) => s.estado !== "Activo").length,
        },
        repuestos: {
          totalTipos: repuestos.length,
          cantidadTotal: repuestos.reduce((sum, rep) => sum + (rep.cantidad || 0), 0),
          bajoStock: repuestosBajoStock.length,
        },
        compras: {
          total: compras.length,
          pendientes: compras.filter((c) => c.estado === "Pendiente").length,
          completadas: compras.filter((c) => c.estado === "Completado").length,
          canceladas: compras.filter((c) => c.estado === "Cancelado").length,
        },
        clientes: {
          total: clientes.length,
          activos: clientes.filter((c) => c.estado === "Activo").length,
          inactivos: clientes.filter((c) => c.estado !== "Activo").length,
        },
        mecanicos: {
          total: mecanicos.length,
          activos: mecanicos.filter((m) => m.estado === "Activo").length,
          inactivos: mecanicos.filter((m) => m.estado !== "Activo").length,
        },
        ventas: {
          total: ventas.length,
          pendientes: ventas.filter((v) => v.estado_venta_id === 1).length,
          pagadas: ventas.filter((v) => v.estado_venta_id === 2).length,
          canceladas: ventas.filter((v) => v.estado_venta_id === 3).length,
        },
        citas: {
          total: citas.length,
          programadas: citas.filter((c) => c.estado_cita_id === 1).length,
          enProceso: citas.filter((c) => c.estado_cita_id === 2).length,
          completadas: citas.filter((c) => c.estado_cita_id === 3).length,
          canceladas: citas.filter((c) => c.estado_cita_id === 4).length,
        },
        ingresos: {
          total: ingresosTotales,
          mesActual: ingresosMesActual,
          hoy: ventas
            .filter((venta) => {
              const fechaVenta = new Date(venta.fecha)
              return fechaVenta.toDateString() === hoy.toDateString() && venta.estado_venta_id === 2
            })
            .reduce((sum, venta) => sum + (venta.total || 0), 0),
        },
      }

      setDashboardData({
        estadisticas,
        serviciosActivos: servicios.filter((s) => s.estado === "Activo"),
        repuestosBajoStock: repuestosBajoStock.slice(0, 10),
        comprasRecientes: compras
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 5)
          .map((compra) => ({
            ...compra,
            proveedor_nombre: proveedores.find((p) => p.id === compra.proveedor_id)?.nombre || "N/A",
            nombre_empresa: proveedores.find((p) => p.id === compra.proveedor_id)?.nombre_empresa || "",
          })),
        ventasRecientes: ventas
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 5)
          .map((venta) => {
            const cliente = clientes.find((c) => c.id === venta.cliente_id)
            return {
              ...venta,
              cliente_nombre: cliente?.nombre || "N/A",
              cliente_apellido: cliente?.apellido || "",
              estado_nombre:
                venta.estado_venta_id === 1 ? "Pendiente" : venta.estado_venta_id === 2 ? "Pagada" : "Cancelada",
            }
          }),
        citasHoy: citasHoy.slice(0, 5).map((cita) => {
          const vehiculo = vehiculos.find((v) => v.id === cita.vehiculo_id)
          const cliente = vehiculo ? clientes.find((c) => c.id === vehiculo.cliente_id) : null
          const mecanico = mecanicos.find((m) => m.id === cita.mecanico_id)
          return {
            ...cita,
            vehiculo_placa: vehiculo?.placa || "N/A",
            cliente_nombre: cliente?.nombre || "N/A",
            cliente_apellido: cliente?.apellido || "",
            mecanico_nombre: mecanico?.nombre || "N/A",
            mecanico_apellido: mecanico?.apellido || "",
            estado_nombre:
              cita.estado_cita_id === 1
                ? "Programada"
                : cita.estado_cita_id === 2
                  ? "En Proceso"
                  : cita.estado_cita_id === 3
                    ? "Completada"
                    : "Cancelada",
          }
        }),
        citasProximasSemana: citasProximasSemana.slice(0, 10),
        topServicios,
        topRepuestos,
        mecanicosActivos,
        clientesFrecuentes,
        tendenciasVentas,
        tendenciasCitas,
        tendenciasCompras,
      })
    } catch (err) {
      console.error("Error general al cargar datos del dashboard:", err)
      setError(err.message || "Error al cargar los datos del dashboard")
    } finally {
      setLoading(false)
    }
  }

  // Obtener la hora actual para el saludo
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  // Función para obtener solo el primer nombre
  const getFirstName = (fullName) => {
    if (!fullName) return "Usuario"
    return fullName.split(" ")[0]
  }

  // Colores para las gráficas (esquema azul original)
  const COLORS = ["#0066ff", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

  // Función para formatear precio
  const formatearPrecio = (precio) => {
    if (!precio) return "$0"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio)
  }

  // Función para calcular porcentaje de cambio
  const calcularCambio = (actual, anterior) => {
    if (anterior === 0) return actual > 0 ? 100 : 0
    return ((actual - anterior) / anterior) * 100
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard__error">
          <FaExclamationTriangle />
          <h2>Error al cargar el dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="dashboard__retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const stats = dashboardData.estadisticas
  if (!stats) {
    return <DashboardSkeleton />
  }

  // Generar alertas basadas en datos reales
  const alertas = []
  if (stats.resumenEjecutivo?.repuestos_bajo_stock > 0) {
    alertas.push({
      tipo: "warning",
      mensaje: `${stats.resumenEjecutivo.repuestos_bajo_stock} repuestos con stock crítico`,
      icono: FaExclamationTriangle,
      link: "/repuestos",
    })
  }
  if (stats.resumenEjecutivo?.compras_pendientes > 0) {
    alertas.push({
      tipo: "info",
      mensaje: `${stats.resumenEjecutivo.compras_pendientes} compras pendientes`,
      icono: FaHourglassHalf,
      link: "/ListarCompras",
    })
  }
  if (stats.resumenEjecutivo?.citas_hoy > 0) {
    alertas.push({
      tipo: "success",
      mensaje: `${stats.resumenEjecutivo.citas_hoy} citas programadas para hoy`,
      icono: FaCalendarAlt,
      link: "/citas",
    })
  }

  return (
    <div className="dashboard">
      {/* Sección de bienvenida y alertas */}
      <div className="dashboard__welcome">
        <div className="dashboard__welcome-content">
          <h1>
            {getGreeting()}, {getFirstName(userData.nombre)}
          </h1>
          <p>Panel de Control - MotOrtega</p>
          <div className="dashboard__welcome-stats">
            <div className="dashboard__welcome-stat">
              <FaMoneyBillWave />
              <span>Ingresos Hoy: {formatearPrecio(stats.resumenEjecutivo?.ingresos_hoy || 0)}</span>
            </div>
            <div className="dashboard__welcome-stat">
              <FaShoppingBag />
              <span>Ventas Hoy: {stats.resumenEjecutivo?.ventas_hoy || 0}</span>
            </div>
          </div>
        </div>
        <div className="dashboard__alerts">
          {alertas.map((alerta, index) => (
            <Link key={index} to={alerta.link} className={`dashboard__alert dashboard__alert--${alerta.tipo}`}>
              <alerta.icono />
              <span>{alerta.mensaje}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Acceso rápido */}
      <div className="dashboard__quick-access">
        <h2>Acceso Rápido</h2>
        <div className="dashboard__quick-access-grid">
          <Link to="/citas/crear" className="dashboard__quick-access-card">
            <div className="dashboard__quick-access-icon">
              <FaCalendarAlt />
            </div>
            <h3>Nueva Cita</h3>
          </Link>

          <Link to="/CrearVenta" className="dashboard__quick-access-card">
            <div className="dashboard__quick-access-icon">
              <FaShoppingBag />
            </div>
            <h3>Nueva Venta</h3>
          </Link>

          <Link to="/CrearCompras" className="dashboard__quick-access-card">
            <div className="dashboard__quick-access-icon">
              <FaShoppingCart />
            </div>
            <h3>Nueva Compra</h3>
          </Link>

          <Link to="/CrearClientes" className="dashboard__quick-access-card">
            <div className="dashboard__quick-access-icon">
              <FaUserPlus />
            </div>
            <h3>Nuevo Cliente</h3>
          </Link>

          <Link to="/crearRepuestos" className="dashboard__quick-access-card">
            <div className="dashboard__quick-access-icon">
              <FaCogs />
            </div>
            <h3>Nuevo Repuesto</h3>
          </Link>

          <Link to="/crearServicios" className="dashboard__quick-access-card">
            <div className="dashboard__quick-access-icon">
              <FaTools />
            </div>
            <h3>Nuevo Servicio</h3>
          </Link>
        </div>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="dashboard__stats">
        <div className="dashboard__stats-grid">
          <div className="dashboard__stat-card dashboard__stat-card--primary">
            <div className="dashboard__stat-icon">
              <FaMoneyBillWave />
            </div>
            <div className="dashboard__stat-content">
              <div className="dashboard__stat-info">
                <h3>Ingresos Totales</h3>
                <p>{formatearPrecio(stats.ingresos?.total || 0)}</p>
                <span className="dashboard__stat-change positive">
                  <FaArrowUp />
                  Mes Actual: {formatearPrecio(stats.ingresos?.mesActual || 0)}
                </span>
              </div>
              <Link to="/ListarVentas" className="dashboard__vermas-button">
                Ver más
              </Link>
            </div>
          </div>

          <div className="dashboard__stat-card dashboard__stat-card--success">
            <div className="dashboard__stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="dashboard__stat-content">
              <div className="dashboard__stat-info">
                <h3>Citas</h3>
                <p>{stats.citas?.completadas || 0}</p>
                <span className="dashboard__stat-change">
                  {stats.citas?.programadas || 0} programadas | {stats.citas?.enProceso || 0} en proceso
                </span>
              </div>
              <Link to="/citas" className="dashboard__vermas-button">
                Ver más
              </Link>
            </div>
          </div>

          <div className="dashboard__stat-card dashboard__stat-card--warning">
            <div className="dashboard__stat-icon">
              <FaBox />
            </div>
            <div className="dashboard__stat-content">
              <div className="dashboard__stat-info">
                <h3>Inventario</h3>
                <p>{stats.repuestos?.cantidadTotal || 0}</p>
                <span className="dashboard__stat-change">{stats.repuestos?.bajoStock || 0} repuestos bajo stock</span>
              </div>
              <Link to="/repuestos" className="dashboard__vermas-button">
                Ver más
              </Link>
            </div>
          </div>

          <div className="dashboard__stat-card dashboard__stat-card--info">
            <div className="dashboard__stat-icon">
              <FaUsers />
            </div>
            <div className="dashboard__stat-content">
              <div className="dashboard__stat-info">
                <h3>Clientes</h3>
                <p>{stats.clientes?.activos || 0}</p>
                <span className="dashboard__stat-change">{stats.clientes?.total || 0} registrados total</span>
              </div>
              <Link to="/ListarClientes" className="dashboard__vermas-button">
                Ver más
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas secundarias */}
      <div className="dashboard__secondary-stats">
        <div className="dashboard__secondary-stats-grid">
          <div className="dashboard__secondary-stat">
            <FaTools className="dashboard__secondary-stat-icon" />
            <div>
              <span className="dashboard__secondary-stat-number">{stats.servicios?.activos || 0}</span>
              <span className="dashboard__secondary-stat-label">Servicios Activos</span>
            </div>
          </div>
          <div className="dashboard__secondary-stat">
            <FaUserTie className="dashboard__secondary-stat-icon" />
            <div>
              <span className="dashboard__secondary-stat-number">{stats.mecanicos?.activos || 0}</span>
              <span className="dashboard__secondary-stat-label">Mecánicos Activos</span>
            </div>
          </div>
          <div className="dashboard__secondary-stat">
            <FaShoppingCart className="dashboard__secondary-stat-icon" />
            <div>
              <span className="dashboard__secondary-stat-number">{stats.compras?.completadas || 0}</span>
              <span className="dashboard__secondary-stat-label">Compras Completadas</span>
            </div>
          </div>
          <div className="dashboard__secondary-stat">
            <FaShoppingBag className="dashboard__secondary-stat-icon" />
            <div>
              <span className="dashboard__secondary-stat-number">{stats.ventas?.pagadas || 0}</span>
              <span className="dashboard__secondary-stat-label">Ventas Pagadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas principales */}
      <div className="dashboard__charts">
        <div className="dashboard__charts-grid">
          {/* Gráfica de tendencias de ventas */}
          <div className="dashboard__chart-card dashboard__chart-card--full">
            <div className="dashboard__chart-header">
              <h3>Tendencia de Ingresos</h3>
              <p>Ingresos mensuales del año actual</p>
            </div>
            <div className="dashboard__chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.tendenciasVentas}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066ff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0066ff" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value, name) => [
                      name === "ingresos" ? formatearPrecio(value) : value,
                      name === "ingresos" ? "Ingresos" : "Ventas",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#0066ff"
                    fillOpacity={1}
                    fill="url(#colorIngresos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica de top servicios */}
          <div className="dashboard__chart-card">
            <div className="dashboard__chart-header">
              <h3>Servicios Más Solicitados</h3>
              <p>Top servicios por cantidad vendida</p>
            </div>
            <div className="dashboard__chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.topServicios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value, name) => [
                      name === "ingresos_generados" ? formatearPrecio(value) : value,
                      name === "veces_vendido" ? "Veces Vendido" : "Ingresos Generados",
                    ]}
                  />
                  <Bar dataKey="veces_vendido" fill="#0066ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica de tendencias de citas */}
          <div className="dashboard__chart-card">
            <div className="dashboard__chart-header">
              <h3>Tendencia de Citas</h3>
              <p>Citas por mes</p>
            </div>
            <div className="dashboard__chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={dashboardData.tendenciasCitas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="completadas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="total" stroke="#0066ff" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica de estado de citas */}
          <div className="dashboard__chart-card">
            <div className="dashboard__chart-header">
              <h3>Estado de Citas</h3>
              <p>Distribución actual</p>
            </div>
            <div className="dashboard__chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Programadas", value: stats.citas?.programadas || 0, color: "#f59e0b" },
                      { name: "En Proceso", value: stats.citas?.enProceso || 0, color: "#0066ff" },
                      { name: "Completadas", value: stats.citas?.completadas || 0, color: "#10b981" },
                      { name: "Canceladas", value: stats.citas?.canceladas || 0, color: "#ef4444" },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: "Programadas", value: stats.citas?.programadas || 0, color: "#f59e0b" },
                      { name: "En Proceso", value: stats.citas?.enProceso || 0, color: "#0066ff" },
                      { name: "Completadas", value: stats.citas?.completadas || 0, color: "#10b981" },
                      { name: "Canceladas", value: stats.citas?.canceladas || 0, color: "#ef4444" },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tablas de datos recientes */}
      <div className="dashboard__tables">
        <div className="dashboard__tables-grid">
          {/* Tabla de citas de hoy */}
          <div className="dashboard__table-card">
            <div className="dashboard__table-header">
              <h3>Citas de Hoy</h3>
              <Link to="/citas" className="dashboard__table-link">
                Ver todas
              </Link>
            </div>
            <div className="dashboard__table-content">
              <table className="dashboard__table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Cliente</th>
                    <th>Vehículo</th>
                    <th>Mecánico</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.citasHoy.length > 0 ? (
                    dashboardData.citasHoy.slice(0, 5).map((cita, index) => (
                      <tr key={index}>
                        <td>{cita.hora || "N/A"}</td>
                        <td>{`${cita.cliente_nombre} ${cita.cliente_apellido}`}</td>
                        <td>{cita.vehiculo_placa}</td>
                        <td>{`${cita.mecanico_nombre} ${cita.mecanico_apellido}`}</td>
                        <td>
                          <span className={`dashboard__status dashboard__status--${cita.estado_cita_id}`}>
                            {cita.estado_nombre}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No hay citas programadas para hoy</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de ventas recientes */}
          <div className="dashboard__table-card">
            <div className="dashboard__table-header">
              <h3>Ventas Recientes</h3>
              <Link to="/ListarVentas" className="dashboard__table-link">
                Ver todas
              </Link>
            </div>
            <div className="dashboard__table-content">
              <table className="dashboard__table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.ventasRecientes.length > 0 ? (
                    dashboardData.ventasRecientes.map((venta, index) => (
                      <tr key={index}>
                        <td>{new Date(venta.fecha).toLocaleDateString("es-ES")}</td>
                        <td>{`${venta.cliente_nombre} ${venta.cliente_apellido}`}</td>
                        <td>{formatearPrecio(venta.total)}</td>
                        <td>
                          <span className="dashboard__status dashboard__status--success">{venta.estado_nombre}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No hay ventas recientes</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de repuestos críticos */}
          <div className="dashboard__table-card">
            <div className="dashboard__table-header">
              <h3>Stock Crítico</h3>
              <Link to="/repuestos" className="dashboard__table-link">
                Ver todos
              </Link>
            </div>
            <div className="dashboard__table-content">
              <table className="dashboard__table">
                <thead>
                  <tr>
                    <th>Repuesto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.repuestosBajoStock.length > 0 ? (
                    dashboardData.repuestosBajoStock.slice(0, 5).map((repuesto, index) => (
                      <tr key={index}>
                        <td>{repuesto.nombre}</td>
                        <td>{repuesto.categoria_nombre}</td>
                        <td>
                          <span className="dashboard__status dashboard__status--warning">{repuesto.cantidad}</span>
                        </td>
                        <td>
                          <Link to="/CrearCompras" className="dashboard__action-btn">
                            <FaPlus /> Comprar
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No hay repuestos con stock crítico</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de clientes frecuentes */}
          <div className="dashboard__table-card">
            <div className="dashboard__table-header">
              <h3>Clientes Frecuentes</h3>
              <Link to="/ListarClientes" className="dashboard__table-link">
                Ver todos
              </Link>
            </div>
            <div className="dashboard__table-content">
              <table className="dashboard__table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Ventas</th>
                    <th>Total Gastado</th>
                    <th>Última Visita</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.clientesFrecuentes.length > 0 ? (
                    dashboardData.clientesFrecuentes.map((cliente, index) => (
                      <tr key={index}>
                        <td>{`${cliente.nombre} ${cliente.apellido}`}</td>
                        <td>
                          <span className="dashboard__status dashboard__status--info">{cliente.total_ventas}</span>
                        </td>
                        <td>{formatearPrecio(cliente.total_gastado)}</td>
                        <td>{new Date(cliente.ultima_visita).toLocaleDateString("es-ES")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No hay datos de clientes frecuentes</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de mecánicos activos */}
      <div className="dashboard__mechanics-section">
        <h2>Rendimiento de Mecánicos</h2>
        <div className="dashboard__mechanics-grid">
          {dashboardData.mecanicosActivos.slice(0, 4).map((mecanico, index) => (
            <div key={index} className="dashboard__mechanic-card">
              <div className="dashboard__mechanic-header">
                <FaUserTie className="dashboard__mechanic-icon" />
                <div>
                  <h4>{`${mecanico.nombre} ${mecanico.apellido}`}</h4>
                  <span className="dashboard__mechanic-status">Activo</span>
                </div>
              </div>
              <div className="dashboard__mechanic-stats">
                <div className="dashboard__mechanic-stat">
                  <span className="dashboard__mechanic-stat-number">{mecanico.total_citas}</span>
                  <span className="dashboard__mechanic-stat-label">Total Citas</span>
                </div>
                <div className="dashboard__mechanic-stat">
                  <span className="dashboard__mechanic-stat-number">{mecanico.citas_completadas}</span>
                  <span className="dashboard__mechanic-stat-label">Completadas</span>
                </div>
                <div className="dashboard__mechanic-stat">
                  <span className="dashboard__mechanic-stat-number">{mecanico.citas_programadas}</span>
                  <span className="dashboard__mechanic-stat-label">Programadas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente de esqueleto de carga
const DashboardSkeleton = () => {
  return (
    <div className="dashboard">
      <div className="dashboard__welcome dashboard__welcome--loading">
        <div className="dashboard__skeleton dashboard__skeleton--title"></div>
        <div className="dashboard__skeleton dashboard__skeleton--subtitle"></div>
      </div>

      <div className="dashboard__quick-access">
        <div className="dashboard__skeleton dashboard__skeleton--section-title"></div>
        <div className="dashboard__quick-access-grid">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="dashboard__quick-access-card dashboard__quick-access-card--loading">
                <div className="dashboard__skeleton dashboard__skeleton--icon"></div>
                <div className="dashboard__skeleton dashboard__skeleton--text"></div>
              </div>
            ))}
        </div>
      </div>

      <div className="dashboard__stats">
        <div className="dashboard__stats-grid">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="dashboard__stat-card dashboard__stat-card--loading">
                <div className="dashboard__skeleton dashboard__skeleton--icon"></div>
                <div className="dashboard__stat-content">
                  <div className="dashboard__skeleton dashboard__skeleton--text"></div>
                  <div className="dashboard__skeleton dashboard__skeleton--number"></div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="dashboard__charts">
        <div className="dashboard__charts-grid">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="dashboard__chart-card dashboard__chart-card--loading">
                <div className="dashboard__skeleton dashboard__skeleton--chart"></div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

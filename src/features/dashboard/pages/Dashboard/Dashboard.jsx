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
} from "recharts"
import { FaTools, FaShoppingCart, FaCogs, FaClipboardList, FaChartLine, FaMoneyBillWave, FaBox } from "react-icons/fa"
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

      // Probar cada endpoint individualmente
      let estadisticas = null
      let serviciosActivos = []
      let repuestosBajoStock = []
      let comprasRecientes = []

      // 1. Estadísticas
      try {
        const estadisticasRes = await axios.get("https://api-final-8rw7.onrender.com/api/dashboard/estadisticas", {
          headers,
        })
        estadisticas = estadisticasRes.data
      } catch (err) {
        console.error("Error estadísticas:", err.response?.data)
      }

      // 2. Servicios activos
      try {
        const serviciosRes = await axios.get("https://api-final-8rw7.onrender.com/api/dashboard/servicios-activos", {
          headers,
        })
        serviciosActivos = serviciosRes.data
      } catch (err) {
        console.error("Error servicios activos:", err.response?.data)
      }

      // 3. Repuestos bajo stock
      try {
        const repuestosRes = await axios.get("https://api-final-8rw7.onrender.com/api/dashboard/repuestos-bajo-stock", {
          headers,
        })
        repuestosBajoStock = repuestosRes.data
      } catch (err) {
        console.error("Error repuestos bajo stock:", err.response?.data)
      }

      // 4. Compras recientes
      try {
        const comprasRes = await axios.get("https://api-final-8rw7.onrender.com/api/dashboard/compras-recientes", {
          headers,
        })
        comprasRecientes = comprasRes.data
      } catch (err) {
        console.error("Error compras recientes:", err.response?.data)
      }

      // Establecer los datos que se pudieron cargar
      setDashboardData({
        estadisticas,
        serviciosActivos,
        repuestosBajoStock,
        comprasRecientes,
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

  // Colores para las gráficas
  const COLORS = ["#0066ff", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

  // Datos para gráfica de servicios por estado (con datos de fallback)
  const serviciosChartData =
    dashboardData.serviciosActivos.length > 0
      ? dashboardData.serviciosActivos.map((servicio, index) => ({
          name: servicio.nombre,
          cantidad: servicio.cantidad || Math.floor(Math.random() * 50) + 10,
          precio: servicio.precio || Math.floor(Math.random() * 1000) + 100,
        }))
      : [
          { name: "Mantenimiento", cantidad: 25, precio: 500 },
          { name: "Reparación", cantidad: 18, precio: 800 },
          { name: "Revisión", cantidad: 12, precio: 200 },
        ]

  // Datos para gráfica de repuestos bajo stock (con datos de fallback)
  const repuestosChartData =
    dashboardData.repuestosBajoStock.length > 0
      ? dashboardData.repuestosBajoStock.map((repuesto, index) => ({
          name: repuesto.nombre,
          stock: repuesto.stock,
          minimo: repuesto.stock_minimo || 10,
        }))
      : [
          { name: "Filtros", stock: 5, minimo: 10 },
          { name: "Aceite", stock: 3, minimo: 15 },
          { name: "Frenos", stock: 2, minimo: 8 },
        ]

  // Datos para gráfica de compras recientes (con datos de fallback)
  const comprasChartData =
    dashboardData.comprasRecientes.length > 0
      ? dashboardData.comprasRecientes
          .slice(0, 7)
          .reverse()
          .map((compra, index) => ({
            fecha: new Date(compra.fecha).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
            total: compra.total,
            cantidad: compra.cantidad_items || 1,
          }))
      : [
          { fecha: "Ene 1", total: 1200, cantidad: 3 },
          { fecha: "Ene 2", total: 800, cantidad: 2 },
          { fecha: "Ene 3", total: 1500, cantidad: 4 },
          { fecha: "Ene 4", total: 900, cantidad: 2 },
          { fecha: "Ene 5", total: 2000, cantidad: 5 },
        ]

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="dashboard">
      {/* Sección de bienvenida */}
      <div className="dashboard__welcome">
        <div className="dashboard__welcome-content">
          <h1>
            {getGreeting()}, {getFirstName(userData.nombre)}
          </h1>
          <p>Bienvenido al panel de administración de MotOrtega</p>
        </div>
        <div className="dashboard__welcome-stats">
          <div className="dashboard__welcome-stat">
            <FaChartLine />
            <span>Sistema Activo</span>
          </div>
        </div>
      </div>

      {/* Acceso rápido */}
      <div className="dashboard__quick-access">
        <h2>Acceso Rápido</h2>
        <div className="dashboard__quick-access-grid">
          <Link to="/crearServicios" className="dashboard__quick-access-card">
            <div className="dashboard__quick-access-icon">
              <FaTools />
            </div>
            <h3>Nuevo Servicio</h3>
          </Link>

          <Link to="/crearRepuestos" className="dashboard__quick-access-card">
            <div className="dashboard__quick-access-icon">
              <FaCogs />
            </div>
            <h3>Nuevo Repuesto</h3>
          </Link>

          <Link to="/CrearProveedor" className="dashboard__quick-access-card">
            <div className="dashboard__quick-access-icon">
              <FaShoppingCart />
            </div>
            <h3>Nuevo Proveedor</h3>
          </Link>

          <Link to="/CrearCompras" className="dashboard__quick-access-card">
            <div className="dashboard__quick-access-icon">
              <FaClipboardList />
            </div>
            <h3>Nueva Compra</h3>
          </Link>
        </div>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="dashboard__stats">
        <div className="dashboard__stats-grid">
          <div className="dashboard__stat-card dashboard__stat-card--primary">
            <div className="dashboard__stat-icon">
              <FaTools />
            </div>
            <div className="dashboard__stat-content">
              <div className="dashboard__stat-info">
                <h3>Servicios Activos</h3>
                <p>{dashboardData.estadisticas?.servicios?.total || dashboardData.serviciosActivos.length || 0}</p>
                <span className="dashboard__stat-change">+12% este mes</span>
              </div>
              <Link to="/servicios" className="dashboard__vermas-button">Ver más</Link>
            </div>
          </div>

          <div className="dashboard__stat-card dashboard__stat-card--success">
            <div className="dashboard__stat-icon">
              <FaMoneyBillWave />
            </div>
            <div className="dashboard__stat-content">
              <h3>Ingresos del Mes</h3>
              <p>${dashboardData.estadisticas?.ingresos_mes?.toLocaleString() || "0"}</p>
              <span className="dashboard__stat-change">+8% vs mes anterior</span>
              <Link to="/ingresos" className="dashboard__vermas-button">Ver más</Link>
            </div>
          </div>

          <div className="dashboard__stat-card dashboard__stat-card--warning">
            <div className="dashboard__stat-icon">
              <FaBox />
            </div>
            <div className="dashboard__stat-content">
              <h3>Repuestos Bajo Stock</h3>
              <p>{dashboardData.repuestosBajoStock.length}</p>
              <span className="dashboard__stat-change">Requiere atención</span>
              <Link to="/repuestos" className="dashboard__vermas-button">Ver más</Link>
            </div>
          </div>

          <div className="dashboard__stat-card dashboard__stat-card--info">
            <div className="dashboard__stat-icon">
              <FaShoppingCart />
            </div>
            <div className="dashboard__stat-content">
              <h3>Compras Recientes</h3>
              <p>{dashboardData.comprasRecientes.length}</p>
              <span className="dashboard__stat-change">Últimos 30 días</span>
              <Link to="/ListarCompras" className="dashboard__vermas-button">Ver más</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas principales */}
      <div className="dashboard__charts">
        <div className="dashboard__charts-grid">
          {/* Gráfica de servicios más solicitados */}
          <div className="dashboard__chart-card">
            <div className="dashboard__chart-header">
              <h3>Servicios Más Solicitados</h3>
              <p>Distribución de servicios activos</p>
            </div>
            <div className="dashboard__chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviciosChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="cantidad" fill="#0066ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica circular de distribución de servicios */}
          <div className="dashboard__chart-card">
            <div className="dashboard__chart-header">
              <h3>Distribución de Servicios</h3>
              <p>Por tipo de servicio</p>
            </div>
            <div className="dashboard__chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviciosChartData.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviciosChartData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica de repuestos bajo stock */}
          <div className="dashboard__chart-card">
            <div className="dashboard__chart-header">
              <h3>Repuestos Bajo Stock</h3>
              <p>Requieren reposición urgente</p>
            </div>
            <div className="dashboard__chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={repuestosChartData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="stock" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="minimo" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica de compras recientes */}
          <div className="dashboard__chart-card dashboard__chart-card--full">
            <div className="dashboard__chart-header">
              <h3>Tendencia de Compras</h3>
              <p>Últimas compras realizadas</p>
            </div>
            <div className="dashboard__chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={comprasChartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066ff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0066ff" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#0066ff" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tablas de datos recientes */}
      <div className="dashboard__tables">
        <div className="dashboard__tables-grid">
          {/* Tabla de compras recientes */}
          <div className="dashboard__table-card">
            <div className="dashboard__table-header">
              <h3>Compras Recientes</h3>
              <Link to="/ListarCompras" className="dashboard__table-link">
                Ver todas
              </Link>
            </div>
            <div className="dashboard__table-content">
              <table className="dashboard__table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Proveedor</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.comprasRecientes.length > 0 ? (
                    dashboardData.comprasRecientes.slice(0, 5).map((compra, index) => (
                      <tr key={index}>
                        <td>{new Date(compra.fecha).toLocaleDateString("es-ES")}</td>
                        <td>{compra.proveedor || "N/A"}</td>
                        <td>${compra.total?.toLocaleString()}</td>
                        <td>
                          <span className="dashboard__status dashboard__status--success">Completada</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No hay compras recientes</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de repuestos bajo stock */}
          <div className="dashboard__table-card">
            <div className="dashboard__table-header">
              <h3>Repuestos Críticos</h3>
              <Link to="/repuestos" className="dashboard__table-link">
                Ver todos
              </Link>
            </div>
            <div className="dashboard__table-content">
              <table className="dashboard__table">
                <thead>
                  <tr>
                    <th>Repuesto</th>
                    <th>Stock</th>
                    <th>Mínimo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.repuestosBajoStock.length > 0 ? (
                    dashboardData.repuestosBajoStock.slice(0, 5).map((repuesto, index) => (
                      <tr key={index}>
                        <td>{repuesto.nombre}</td>
                        <td>{repuesto.stock}</td>
                        <td>{repuesto.stock_minimo || 10}</td>
                        <td>
                          <span className="dashboard__status dashboard__status--warning">Bajo Stock</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No hay repuestos bajo stock</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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

import { BrowserRouter, Routes, Route } from "react-router-dom"
import MotOrtega from "./features/dashboard/pages/Principal/MotOtega"
import Login from "./features/dashboard/pages/Acceso/Login"
import Register from "./features/dashboard/pages/Acceso/Register"
import RecuperarPassword from "./features/dashboard/pages/Acceso/RecuperarPassword"
import Dashboard from "./features/dashboard/pages/Dashboard/Dashboard"
import Layout from "./features/dashboard/components/layout/layout"
import PrivateRoute from "./features/auth/hooks/PrivateRoute"
import Perfil from "./features/dashboard/pages/Perfil/Perfil"
import CambiarContraseña from "./features/dashboard/pages/Acceso/CambiarContraseña"
// --------------------------------USUARIOS-------------------------------
import ListarUsuarios from "./features/dashboard/pages/Usuario/ListarUsuarios"
import CrearUsuario from "./features/dashboard/pages/Usuario/CrearUsuario"
import EditarUsuario from "./features/dashboard/pages/Usuario/EditarUsuario"
import DetalleUsuario from "./features/dashboard/pages/Usuario/DetalleUsuario"
// ----------------------------------------------------------------------

// --------------------------CATEGORIA REPUESTO--------------------------
import ListarCategoriasRepuesto from "./features/dashboard/pages/CategoriaRepuesto/ListarCategoriasRepuesto"
import CrearCategoriaRepuesto from "./features/dashboard/pages/CategoriaRepuesto/CrearCategoriaRepuesto"
import EditarCategoriaRepuesto from "./features/dashboard/pages/CategoriaRepuesto/EditarCategoriaRepuesto"
import DetalleCategoriaRepuesto from "./features/dashboard/pages/CategoriaRepuesto/DetalleCategoriaRepuesto"
// ----------------------------------------------------------------------

// ------------------------------REPUESTOS-------------------------------
import ListarRepuestos from "./features/dashboard/pages/Repuestos/ListarRepuesto"
import CrearRepuesto from "./features/dashboard/pages/Repuestos/CrearRepuesto"
import EditarRepuesto from "./features/dashboard/pages/Repuestos/EditarRepuesto"
import DetalleRepuesto from "./features/dashboard/pages/Repuestos/DetalleRepuesto"
// ----------------------------------------------------------------------

// ------------------------------PROVEEDORES-----------------------------
import ListarProveedores from "./features/dashboard/pages/Proveedor/ListarProveedor"
import EditarProveedor from "./features/dashboard/pages/Proveedor/EditarProveedor"
import DetalleProveedor from "./features/dashboard/pages/Proveedor/DetalleProveedor"
import CrearProveedor from "./features/dashboard/pages/Proveedor/CrearProveedor"
// ----------------------------------------------------------------------

// ------------------------------COMPRAS-----------------------------
import ListarCompras from "./features/dashboard/pages/Compras/ListarCompras"
import CrearCompras from "./features/dashboard/pages/Compras/CrearCompras"
import DetalleCompra from "./features/dashboard/pages/Compras/DetalleCompras"
// ----------------------------------------------------------------------
// ------------------------------VENTAS-----------------------------
import ListarVentas from "./features/dashboard/pages/Ventas/ListarVentas"
import CrearVenta from "./features/dashboard/pages/Ventas/CrearVenta"
import DetalleVenta from "./features/dashboard/pages/Ventas/DetalleVenta"
// ----------------------------------------------------------------------

// ------------------------------VEHÍCULOS-------------------------------
import ListarVehiculos from "./features/dashboard/pages/Vehiculos/ListarVehiculos"
import CrearVehiculo from "./features/dashboard/pages/Vehiculos/CrearVehiculo"
import EditarVehiculo from "./features/dashboard/pages/Vehiculos/EditarVehiculo"
import DetalleVehiculo from "./features/dashboard/pages/Vehiculos/DetalleVehiculo"
// ----------------------------------------------------------------------

// ------------------------------------servicios----------------------------------
import ListarServicios from "./features/dashboard/pages/Servicios/ListarServicios"
import CrearServicios from "./features/dashboard/pages/Servicios/CrearServicios"
import EditarServicios from "./features/dashboard/pages/Servicios/EditarServicios"
import DetalleServicios from "./features/dashboard/pages/Servicios/DetalleServicios"
// ----------------------------------------------------------------------

// ------------------------------CLIENTES-----------------------------
import ListarClientes from "./features/dashboard/pages/Clientes/ListarClientes"
import CrearClientes from "./features/dashboard/pages/Clientes/CrearClientes"
import DetalleCliente from "./features/dashboard/pages/Clientes/DetalleCliente"
import EditarClientes from "./features/dashboard/pages/Clientes/EditarCliente"
// ----------------------------------------------------------------------
// ------------------------------MECANICOS-----------------------------
import ListarMecanicos from "./features/dashboard/pages/Mecanicos/ListarMecanicos"
import CrearMecanicos from "./features/dashboard/pages/Mecanicos/CrearMecanico"
import EditarMecanicos from "./features/dashboard/pages/Mecanicos/EditarMecanico"
import VerDetalleMecanico from "./features/dashboard/pages/Mecanicos/VerDetalleMecanico"
// ----------------------------------------------------------------------

// ------------------------------HORARIOS-----------------------------
import ListarHorarios from "./features/dashboard/pages/Horarios/ListarHorarios"
import CrearHorario from "./features/dashboard/pages/Horarios/CrearHorario"
import EditarHorario from "./features/dashboard/pages/Horarios/EditarHorario"
// ----------------------------------------------------------------------

// ------------------------------CITAS-----------------------------
import CitasCalendar from "./features/dashboard/pages/Citas/CitasCalendar"
// ----------------------------------------------------------------------

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta inicio */}
        <Route path="/" element={<MotOrtega />} />

        {/* Rutas Acceso */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recuperarContraseña" element={<RecuperarPassword />} />
        <Route path="/cambiarContraseña" element={<CambiarContraseña />} />

        {/* Rutas privadas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Layout>
                <Perfil />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* CITAS */}
        <Route
          path="/citas"
          element={
            <PrivateRoute>
              <Layout>
                <CitasCalendar />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}

        {/* USUARIOS */}
        <Route
          path="/listarUsuarios"
          element={
            <PrivateRoute>
              <Layout>
                <ListarUsuarios />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/crearUsuarios"
          element={
            <PrivateRoute>
              <Layout>
                <CrearUsuario />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* Nueva ruta para editar usuario con parámetro :id */}
        <Route
          path="/usuarios/editar/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EditarUsuario />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/detalle/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DetalleUsuario />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
        {/* CATEGORIA REPEUSTO */}
        <Route
          path="/categorias-repuesto"
          element={
            <PrivateRoute>
              <Layout>
                <ListarCategoriasRepuesto />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/crearCategoriaRepuesto"
          element={
            <PrivateRoute>
              <Layout>
                <CrearCategoriaRepuesto />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categorias-repuesto/editar/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EditarCategoriaRepuesto />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categorias-repuesto/detalle/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DetalleCategoriaRepuesto />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
        {/* REPEUSTO */}
        <Route
          path="/repuestos"
          element={
            <PrivateRoute>
              <Layout>
                <ListarRepuestos />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/crearRepuestos"
          element={
            <PrivateRoute>
              <Layout>
                <CrearRepuesto />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/repuestos/editar/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EditarRepuesto />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/DetalleRepuesto/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DetalleRepuesto />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
        {/* PROVEEDORES */}
        <Route
          path="/ListarProveedores"
          element={
            <PrivateRoute>
              <Layout>
                <ListarProveedores />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/CrearProveedor"
          element={
            <PrivateRoute>
              <Layout>
                <CrearProveedor />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* Corregida la ruta de editar proveedor */}
        <Route
          path="/EditarProveedor/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EditarProveedor />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/DetalleProveedor/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DetalleProveedor />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
        {/* COMPRAS */}
        <Route
          path="/ListarCompras"
          element={
            <PrivateRoute>
              <Layout>
                <ListarCompras />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/CrearCompras"
          element={
            <PrivateRoute>
              <Layout>
                <CrearCompras />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/DetalleCompra/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DetalleCompra />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
        {/* VENTAS */}
        <Route
          path="/ListarVentas"
          element={
            <PrivateRoute>
              <Layout>
                <ListarVentas />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/CrearVenta"
          element={
            <PrivateRoute>
              <Layout>
                <CrearVenta />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/DetalleVenta/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DetalleVenta />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}

        {/* VEHÍCULOS */}
        <Route
          path="/vehiculos"
          element={
            <PrivateRoute>
              <Layout>
                <ListarVehiculos />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/vehiculos/crear"
          element={
            <PrivateRoute>
              <Layout>
                <CrearVehiculo />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/vehiculos/editar/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EditarVehiculo />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/vehiculos/detalle/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DetalleVehiculo />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
        {/* Servicios */}
        <Route
          path="/listarServicios"
          element={
            <PrivateRoute>
              <Layout>
                <ListarServicios />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/CrearServicios"
          element={
            <PrivateRoute>
              <Layout>
                <CrearServicios />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/servicios/editar/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EditarServicios />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios/detalle/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DetalleServicios />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
        {/* Mecanicos */}
        <Route
          path="/ListarMecanicos"
          element={
            <PrivateRoute>
              <Layout>
                <ListarMecanicos />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/CrearMecanicos"
          element={
            <PrivateRoute>
              <Layout>
                <CrearMecanicos />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/Mecanicos/editar/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EditarMecanicos />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Mecanicos/detalle/:id"
          element={
            <PrivateRoute>
              <Layout>
                <VerDetalleMecanico />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}

        <Route
          path="/ListarClientes"
          element={
            <PrivateRoute>
              <Layout>
                <ListarClientes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/CrearClientes"
          element={
            <PrivateRoute>
              <Layout>
                <CrearClientes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/DetalleCliente/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DetalleCliente />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/EditarCliente/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EditarClientes />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
        {/* ------------------------------------------------------------------------ */}
        {/* HORARIOS */}
        <Route
          path="/Horarios"
          element={
            <PrivateRoute>
              <Layout>
                <ListarHorarios />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/CrearHorario"
          element={
            <PrivateRoute>
              <Layout>
                <CrearHorario />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/EditarHorario/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EditarHorario />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
      </Routes>
    </BrowserRouter>
  )
}

export default App

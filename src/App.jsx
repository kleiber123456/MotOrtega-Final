import { Routes, Route } from "react-router-dom"
import MotOrtega from "./features/dashboard/pages/Principal/MotOtega"
import Login from "./features/dashboard/pages/Acceso/Login"
import Register from "./features/dashboard/pages/Acceso/Register"
import RecuperarPassword from "./features/dashboard/pages/Acceso/RecuperarPassword"
import Dashboard from "./features/dashboard/pages/Dashboard/Dashboard"
import Layout from "./features/dashboard/components/layout/layout"
import ClientLayout from "./features/dashboard/components/layout/ClientLayout"
import MechanicLayout from "./features/dashboard/components/layout/MechanicLayout"
import PrivateRoute from "./features/auth/hooks/PrivateRoute"
import RoleBasedRoute from "./features/auth/hooks/RoleBasedRoute"
import Perfil from "./features/dashboard/pages/Perfil/Perfil"
import CambiarContraseña from "./features/dashboard/pages/Acceso/CambiarContraseña"

// Dashboards específicos por rol
import ClientDashboard from "./features/client/pages/ClientDashboard"
import MechanicDashboard from "./features/mechanic/pages/MechanicDashboard"

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
import DetalleHorario from "./features/dashboard/pages/Horarios/DetalleHorario"
// ----------------------------------------------------------------------

// ------------------------------CITAS-----------------------------
import ListarCitas from "./features/dashboard/pages/Citas/ListarCitas"
import CrearCita from "./features/dashboard/pages/Citas/CrearCita"
import EditarCita from "./features/dashboard/pages/Citas/EditarCita"
import DetalleCita from "./features/dashboard/pages/Citas/DetalleCita"
// --------------------------------ROLES-------------------------------
import ListarRoles from "./features/dashboard/pages/Roles/ListarRoles"
import CrearRoles from "./features/dashboard/pages/Roles/CrearRoles"
import EditarRol from "./features/dashboard/pages/Roles/EditarRol"
import DetalleRol from "./features/dashboard/pages/Roles/DetalleRol"
// ----------------------------------------------------------------------

import AgendarCita from "./features/client/pages/AgendarCita"

function App() {
  return (
    <Routes>
      {/* Ruta inicio */}
      <Route path="/" element={<MotOrtega />} />

      {/* Rutas Acceso */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/recuperarContraseña" element={<RecuperarPassword />} />
      <Route path="/cambiarContraseña" element={<CambiarContraseña />} />

      {/* RUTA ÚNICA DEL CLIENTE */}
      <Route
        path="/client/dashboard"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["cliente"]}>
              <ClientLayout>
                <ClientDashboard />
              </ClientLayout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/client/agendar-cita"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["cliente"]}>
              <ClientLayout>
                <AgendarCita />
              </ClientLayout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* RUTAS ESPECÍFICAS PARA MECÁNICOS */}
      <Route
        path="/mechanic/dashboard"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["mecánico", "mecanico"]}>
              <MechanicLayout>
                <MechanicDashboard />
              </MechanicLayout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/mechanic/perfil"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["mecánico", "mecanico"]}>
              <MechanicLayout>
                <Perfil />
              </MechanicLayout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* RUTAS ADMINISTRATIVAS (Solo admin y recepcionista) */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <Dashboard />
              </Layout>
            </RoleBasedRoute>
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
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <ListarCitas />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/citas/crear"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <CrearCita />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/citas/editar/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <EditarCita />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/citas/detalle/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <DetalleCita />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* USUARIOS - Solo admin */}
      <Route
        path="/listarUsuarios"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <ListarUsuarios />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/crearUsuarios"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <CrearUsuario />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios/editar/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <EditarUsuario />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios/detalle/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <DetalleUsuario />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* CATEGORIA REPUESTO */}
      <Route
        path="/categorias-repuesto"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <ListarCategoriasRepuesto />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/crearCategoriaRepuesto"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <CrearCategoriaRepuesto />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/categorias-repuesto/editar/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <EditarCategoriaRepuesto />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/categorias-repuesto/detalle/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <DetalleCategoriaRepuesto />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* REPUESTOS */}
      <Route
        path="/repuestos"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <ListarRepuestos />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/crearRepuestos"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <CrearRepuesto />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/repuestos/editar/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <EditarRepuesto />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/DetalleRepuesto/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <DetalleRepuesto />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* PROVEEDORES */}
      <Route
        path="/ListarProveedores"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <ListarProveedores />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/CrearProveedor"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <CrearProveedor />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/EditarProveedor/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <EditarProveedor />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/DetalleProveedor/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <DetalleProveedor />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* COMPRAS */}
      <Route
        path="/ListarCompras"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <ListarCompras />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/CrearCompras"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <CrearCompras />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/DetalleCompra/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <DetalleCompra />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* VENTAS */}
      <Route
        path="/ListarVentas"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <ListarVentas />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/CrearVenta"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <CrearVenta />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/DetalleVenta/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <DetalleVenta />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* VEHÍCULOS */}
      <Route
        path="/vehiculos"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <ListarVehiculos />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/vehiculos/crear"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <CrearVehiculo />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/vehiculos/editar/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <EditarVehiculo />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/vehiculos/detalle/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <DetalleVehiculo />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* Servicios */}
      <Route
        path="/listarServicios"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <ListarServicios />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/CrearServicios"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <CrearServicios />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/servicios/editar/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <EditarServicios />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/servicios/detalle/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <DetalleServicios />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* Mecanicos */}
      <Route
        path="/ListarMecanicos"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <ListarMecanicos />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/CrearMecanicos"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <CrearMecanicos />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/Mecanicos/editar/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <EditarMecanicos />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/Mecanicos/detalle/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <VerDetalleMecanico />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/ListarClientes"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <ListarClientes />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/CrearClientes"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <CrearClientes />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/DetalleCliente/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <DetalleCliente />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/EditarCliente/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <EditarClientes />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* HORARIOS */}
      <Route
        path="/Horarios"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <ListarHorarios />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/CrearHorario"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <CrearHorario />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/EditarHorario/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <EditarHorario />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/DetalleHorario/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin", "recepcionista"]}>
              <Layout>
                <DetalleHorario />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* ROLES */}
      <Route
        path="/ListarRoles"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <ListarRoles />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/CrearRoles"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <CrearRoles />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/EditarRol/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <EditarRol />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/DetalleRol/:id"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Layout>
                <DetalleRol />
              </Layout>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default App

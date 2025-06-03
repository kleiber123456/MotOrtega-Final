import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MotOrtega from './features/dashboard/pages/Principal/MotOtega';
import Login from './features/dashboard/pages/Acceso/Login';
import Register from './features/dashboard/pages/Acceso/Register';
import RecuperarPassword from './features/dashboard/pages/Acceso/RecuperarPassword';
import Dashboard from './features/dashboard/pages/Dashboard/Dashboard';
import Layout from './features/dashboard/components/layout/layout';
import PrivateRoute from './features/auth/hooks/PrivateRoute';
import Perfil from './features/dashboard/pages/Perfil/Perfil';
import CambiarContraseña from './features/dashboard/pages/Acceso/CambiarContraseña';
// --------------------------------USUARIOS-------------------------------
import ListarUsuarios from './features/dashboard/pages/Usuario/ListarUsuarios';
import CrearUsuario from './features/dashboard/pages/Usuario/CrearUsuario';
import EditarUsuario from './features/dashboard/pages/Usuario/EditarUsuario';
import DetalleUsuario from './features/dashboard/pages/Usuario/DetalleUsuario';
// ----------------------------------------------------------------------

// --------------------------CATEGORIA REPUESTO--------------------------
import ListarCategoriasRepuesto from './features/dashboard/pages/CategoriaRepuesto/ListarCategoriasRepuesto';
import CrearCategoriaRepuesto from './features/dashboard/pages/CategoriaRepuesto/CrearCategoriaRepuesto';
import EditarCategoriaRepuesto from './features/dashboard/pages/CategoriaRepuesto/EditarCategoriaRepuesto';
// ----------------------------------------------------------------------

// ------------------------------REPUESTOS-------------------------------
import ListarRepuestos from './features/dashboard/pages/Repuestos/ListarRepuesto';
import CrearRepuesto from './features/dashboard/pages/Repuestos/CrearRepuesto';
import EditarRepuesto from './features/dashboard/pages/Repuestos/EditarRepuesto';
import DetalleRepuesto from './features/dashboard/pages/Repuestos/DetalleRepuesto';
// ----------------------------------------------------------------------

// ------------------------------PROVEEDORES-----------------------------
import ListarProveedores from './features/dashboard/pages/Proveedor/ListarProveedor';
import EditarProveedor from './features/dashboard/pages/Proveedor/EditarProveedor';
import DetalleProveedor from './features/dashboard/pages/Proveedor/DetalleProveedor';
import CrearProveedor from './features/dashboard/pages/Proveedor/CrearProveedor';
// ----------------------------------------------------------------------

// ------------------------------COMPRAS-----------------------------
import ListarCompras from './features/dashboard/pages/Compras/ListarCompras';
import CrearCompras from './features/dashboard/pages/Compras/CrearCompras';
import DetalleCompra from './features/dashboard/pages/Compras/DetalleCompras';
// ----------------------------------------------------------------------

// ------------------------------VEHÍCULOS-------------------------------
import ListarVehiculos from "./features/dashboard/pages/Vehiculos/ListarVehiculos";
import CrearVehiculo from "./features/dashboard/pages/Vehiculos/CrearVehiculo";
import EditarVehiculo from "./features/dashboard/pages/Vehiculos/EditarVehiculo";
import DetalleVehiculo from "./features/dashboard/pages/Vehiculos/DetalleVehiculo";
// ------------------------------------servicios----------------------------------
import ListarServicios from './features/dashboard/pages/Servicios/ListarServicios';
import CrearServicio from './features/dashboard/pages/Servicios/CrearServicios';
import EditarServicio from './features/dashboard/pages/Servicios/EditarServicios';
import DetalleServicio from './features/dashboard/pages/Servicios/DetalleServicios';

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
              <Layout><Dashboard /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Layout><Perfil /></Layout>
            </PrivateRoute>
          }
        />
        {/* USUARIOS */}
        <Route
          path="/listarUsuarios"
          element={
            <PrivateRoute>
              <Layout><ListarUsuarios /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/crearUsuarios"
          element={
            <PrivateRoute>
              <Layout><CrearUsuario /></Layout>
            </PrivateRoute>
          }
        />
        {/* Nueva ruta para editar usuario con parámetro :id */}
        <Route
          path="/usuarios/editar/:id"
          element={
            <PrivateRoute>
              <Layout><EditarUsuario /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/detalle/:id"
          element={
            <PrivateRoute>
              <Layout><DetalleUsuario /></Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
        {/* CATEGORIA REPEUSTO */}
        <Route
          path="/categorias-repuesto"
          element={
            <PrivateRoute>
              <Layout><ListarCategoriasRepuesto /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/crearCategoriaRepuesto"
          element={
            <PrivateRoute>
              <Layout><CrearCategoriaRepuesto /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categorias-repuesto/editar/:id"
          element={
            <PrivateRoute>
              <Layout><EditarCategoriaRepuesto /></Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
        {/* REPEUSTO */}
        <Route
          path="/repuestos"
          element={
            <PrivateRoute>
              <Layout><ListarRepuestos /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/crearRepuestos"
          element={
            <PrivateRoute>
              <Layout><CrearRepuesto /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/repuestos/editar/:id"
          element={
            <PrivateRoute>
              <Layout><EditarRepuesto /></Layout>
            </PrivateRoute>
          }
        />
         <Route
          path="/DetalleRepuesto/:id"
          element={
            <PrivateRoute>
              <Layout><DetalleRepuesto /></Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
        {/* PROVEEDORES */}
        <Route
          path="/ListarProveedores"
          element={
            <PrivateRoute>
              <Layout><ListarProveedores /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/EditarProveedor/editar/:id"
          element={
            <PrivateRoute>
              <Layout><EditarProveedor /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/CrearProveedor"
          element={
            <PrivateRoute>
              <Layout><CrearProveedor  /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/DetalleProveedor/:id"
          element={
            <PrivateRoute>
              <Layout><DetalleProveedor /></Layout>
            </PrivateRoute>
          }
        />
        {/* ------------------------------------------------------------------------ */}
        {/* COMPRAS */}
          <Route
          path="/ListarCompras"
          element={
            <PrivateRoute>
              <Layout><ListarCompras /></Layout>
            </PrivateRoute>
          }
        />    
        <Route
          path="/CrearCompras"
          element={
            <PrivateRoute>
              <Layout><CrearCompras  /></Layout>
            </PrivateRoute>
          }
        />    
        <Route
          path="/DetalleCompra/:id"
          element={
            <PrivateRoute>
              <Layout><DetalleCompra /></Layout>
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
              <Layout><ListarServicios/></Layout>
            </PrivateRoute>
          }
        />
      <Route
          path="/CrearServicios"
          element={
            <PrivateRoute>
              <Layout>
                <CrearServicio/>
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/servicios/editar/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EditarServicio />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios/detalle/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DetalleServicio/>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



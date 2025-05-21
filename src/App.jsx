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
import ListarUsuarios from './features/dashboard/pages/Usuario/ListarUsuarios';
import CrearUsuario from './features/dashboard/pages/Usuario/CrearUsuario';
import EditarUsuario from './features/dashboard/pages/Usuario/EditarUsuario';
import DetalleUsuario from './features/dashboard/pages/Usuario/DetalleUsuario';
import ListarCategoriasRepuesto from './features/dashboard/pages/CategoriaRepuesto/ListarCategoriasRepuesto';
import CrearCategoriaRepuesto from './features/dashboard/pages/CategoriaRepuesto/CrearCategoriaRepuesto';
import EditarCategoriaRepuesto from './features/dashboard/pages/CategoriaRepuesto/EditarCategoriaRepuesto';
import ListarRepuestos from './features/dashboard/pages/Repuestos/ListarRepuesto';
import CrearRepuesto from './features/dashboard/pages/Repuestos/CrearRepuesto';
import EditarRepuesto from './features/dashboard/pages/Repuestos/EditarRepuesto';
import ListarProveedores from './features/dashboard/pages/Proveedor/ListarProveedor';
import EditarProveedor from './features/dashboard/pages/Proveedor/EditarProveedor';
import DetalleProveedor from './features/dashboard/pages/Proveedor/DetalleProveedor';
import CrearProveedor from './features/dashboard/pages/Proveedor/CrearProveedor';

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
      </Routes>

    </BrowserRouter>
  );
}

export default App;



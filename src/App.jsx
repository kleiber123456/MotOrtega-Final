import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MotOrtega from './features/dashboard/pages/Principal/MotOtega';
import Login from './features/dashboard/pages/Acceso/Login';
import Register from './features/dashboard/pages/Acceso/Register';
import RecuperarPassword from './features/dashboard/pages/Acceso/RecuperarPassword';
import Dashboard from './features/dashboard/pages/Dashboard/Dashboard';
import Layout from './features/dashboard/components/layout/layout';
import PrivateRoute from './features/auth/hooks/PrivateRoute';

function App() {
    return (
      <BrowserRouter>
        <Routes>
          {/* Ruta incio */}
          <Route path="/" element={<MotOrtega />} />
          {/* Rutas Acceso */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recuperarContraseña" element={<RecuperarPassword />} />

          {/* Rutas privadas */}
          <Route
            path="/dashboard"
            element={
            <PrivateRoute>
              <Layout><Dashboard /></Layout>
            </PrivateRoute>
            }
          />

          {/* Rutas  */}


        </Routes>
      </BrowserRouter>
    );
  }
  
  export default App;
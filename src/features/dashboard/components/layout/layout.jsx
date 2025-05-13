// components/Layout.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './sidebar';
import Header from './header';
import 'animate.css';
import '../../../../shared/components/layout/layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = () => {
      const isLeavingDashboard = !window.location.pathname.startsWith('/dashboard');
      if (isLeavingDashboard) {
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  return (
    <div className="mo-layout">
      <div className="mo-layout__container animate__animated animate__fadeIn">
        <Sidebar />
        <div className="mo-layout__main">
          <Header />
          <main className="mo-layout__content">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
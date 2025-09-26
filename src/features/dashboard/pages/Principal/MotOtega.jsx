"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "../../../../shared/styles/MotOrtega.css"
import { MdLocalCarWash } from "react-icons/md"

function MotOrtega() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || sessionStorage.getItem("usuario"))
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)

  const getDashboardPath = () => {
    if (!usuario) return "/login"
    const role = usuario.rol?.toLowerCase() || usuario.rol_nombre?.toLowerCase()
    if (role?.includes("cliente")) {
      return "/client/dashboard"
    } else if (role?.includes("mecánico") || role?.includes("mecanico")) {
      return "/mechanic/citas"
    } else if (role?.includes("admin") || role?.includes("recepcionista")) {
      return "/dashboard"
    }
    return "/dashboard"
  }

  const [scrollPosition, setScrollPosition] = useState(0)
  const [activeSection, setActiveSection] = useState("inicio")
  const [navVisible, setNavVisible] = useState(true)
  const [navBackground, setNavBackground] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Control de scroll para efectos visuales
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollPosition(currentScrollY)

      // Show/hide navigation based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide nav
        setNavVisible(false)
      } else {
        // Scrolling up - show nav
        setNavVisible(true)
      }

      // Add background to nav when scrolled
      if (currentScrollY > 50) {
        setNavBackground(true)
      } else {
        setNavBackground(false)
      }

      setLastScrollY(currentScrollY)

      // Detectar sección activa para cambios de color
      const sections = document.querySelectorAll(".ini-section")
      sections.forEach((section) => {
        const top = section.offsetTop - 100
        const height = section.offsetHeight
        if (currentScrollY >= top && currentScrollY < top + height) {
          setActiveSection(section.id)
        }
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offsetTop = element.offsetTop - 80 // Account for fixed nav height
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="contenedor-MotOrtega">
      {/* Sección Hero */}
      <section id="inicio" className="ini-section ini-section1">
        <div className="imgF">
          <nav
            className={`menu animate__animated animate__fadeInDown ${
              navVisible ? "nav-visible" : "nav-hidden"
            } ${navBackground ? "nav-background" : ""} ${activeSection !== "inicio" ? "nav-scrolled" : ""}`}
          >
            {isMobile ? (
              usuario ? (
                <>
                  <Link
                    className={`opc ${activeSection === "galeria" ? "active" : ""}`}
                    to="#galeria"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("galeria")
                    }}
                  >
                    Galería
                  </Link>
                  <Link className="alogo" to="/">
                    <img className="logoMotOrtega" src="/Logo.png" alt="Logo de MotOrtega" />
                  </Link>
                  <Link className="opcR" to={getDashboardPath()}>
                    Ir al Panel
                  </Link>
                </>
              ) : (
                <>
                  <Link className="opcR" to="/register">
                    Registrarse
                  </Link>
                  <Link className="alogo" to="/">
                    <img className="logoMotOrtega" src="/Logo.png" alt="Logo de MotOrtega" />
                  </Link>
                  <Link className="opcR" to="/login">
                    Iniciar sesión
                  </Link>
                </>
              )
            ) : (
              <>
                <Link
                  className={`opc ${activeSection === "servicios" ? "active" : ""}`}
                  to="#servicios"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("servicios")
                  }}
                >
                  Servicios
                </Link>
                <Link
                  className={`opc ${activeSection === "nosotros" ? "active" : ""}`}
                  to="#nosotros"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("nosotros")
                  }}
                >
                  Nosotros
                </Link>
                <Link
                  className={`opc ${activeSection === "galeria" ? "active" : ""}`}
                  to="#galeria"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("galeria")
                  }}
                >
                  Galería
                </Link>
                <Link className="alogo" to="/">
                  <img className="logoMotOrtega" src="/Logo.png" alt="Logo de MotOrtega" />
                </Link>
                <Link
                  className={`opc ${activeSection === "testimonios" ? "active" : ""}`}
                  to="#testimonios"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("testimonios")
                  }}
                >
                  Testimonios
                </Link>
                {usuario ? (
                  <>
                    <Link className="opcR" to="/agendar-cita">
                      Agendar Citas
                    </Link>
                    <Link className="opcR" to={getDashboardPath()}>
                      Ir al Panel
                    </Link>
                  </>
                ) : (
                  <>
                    <Link className="opcR" to="/register">
                      Registrarse
                    </Link>
                    <Link className="opcR" to="/login">
                      Iniciar sesión
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          <header className="encabezado">
            <img className="ini-llanta" src="/llantamto.png" alt="Llanta MotOrtega" />
            <div className="ch animate__animated animate__bounceInUp">
              <h1>MotOrtega</h1>
              <h2>Tu taller de confianza</h2>
              <p className="trabaja-con-nosotros">
                {usuario ? "Agenda tu cita en línea fácilmente" : "¿Quieres agendar tu cita? Registrate Ahora"}
              </p>
              {usuario ? (
                <Link to="/agendar-cita" className="btn-unete creativo">
                  Agendar Cita
                </Link>
              ) : (
                <Link to="/register" className="btn-unete creativo">
                  ¡Registrate Ahora!
                </Link>
              )}
            </div>
            <div className="ini-scroll-indicator">
              <div className="ini-scroll-arrow"></div>
            </div>
          </header>
        </div>
      </section>

      {/* Sección Servicios */}
      <section id="servicios" className="ini-section ini-section-servicios">
        <div className="ini-container">
          <h2 className="ini-section-title">Nuestros Servicios</h2>
          <p className="ini-section-subtitle">Soluciones completas para tu vehículo</p>

          <div className="ini-servicios-grid">
            <div className="ini-servicio-card">
              <div className="ini-servicio-icon">
                <i className="fas fa-wrench"></i>
              </div>
              <h3>Mecánica General</h3>
              <p>Diagnóstico computarizado, reparación y mantenimiento completo para todo tipo de vehículos.</p>
            </div>

            <div className="ini-servicio-card">
              <div className="ini-servicio-icon">
                <i className="fas fa-paint-roller"></i>
              </div>
              <h3>Latonería y Pintura</h3>
              <p>Reparación de abolladuras, pintura profesional y restauración completa de carrocería.</p>
            </div>

            <div className="ini-servicio-card">
              <div className="ini-servicio-icon">
                <i className="fas fa-car-wash">
                  <MdLocalCarWash />
                </i>
              </div>
              <h3>Lavadero</h3>
              <p>Servicio de lavado profesional para todo tipo de vehículos con productos de alta calidad.</p>
            </div>

            <div className="ini-servicio-card">
              <div className="ini-servicio-icon">
                <i className="fas fa-cogs"></i>
              </div>
              <h3>Repuestos</h3>
              <p>Venta de repuestos originales y alternativos para todas las marcas y modelos.</p>
            </div>

            <div className="ini-servicio-card">
              <div className="ini-servicio-icon">
                <i className="fas fa-truck-pickup"></i>
              </div>
              <h3>Grúa 24/7</h3>
              <p>Servicio de grúa disponible las 24 horas para asistencia en cualquier momento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Sobre Nosotros */}
      <section id="nosotros" className="ini-section ini-section-nosotros">
        <div className="ini-container">
          <div className="ini-nosotros-content">
            <div className="ini-nosotros-text">
              <h2 className="ini-section-title">Sobre MotOrtega</h2>
              <p>
                Somos un taller especializado ubicado en Pedregal, Medellín (Cra 72 #101‑5), con años de experiencia
                brindando servicios de calidad para todo tipo de vehículos.
              </p>
              <p>
                Nuestro equipo de profesionales está comprometido con ofrecer soluciones efectivas y un servicio de
                excelencia para mantener tu vehículo en óptimas condiciones.
              </p>

              <div className="ini-nosotros-info">
                <div className="ini-info-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Cra 72 #101‑5, Pedregal, Medellín</span>
                </div>
                <div className="ini-info-item">
                  <i className="fas fa-phone"></i>
                  <span>313 806 0710</span>
                </div>
                <div className="ini-info-item">
                  <i className="fas fa-clock"></i>
                  <span>Lunes a Sábado: 8:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
            <div className="ini-nosotros-image">
              <img src="/Local.jpg" alt="Taller MotOrtega" />
            </div>
          </div>
        </div>
      </section>

      {/* Sección Galería */}
      <section id="galeria" className="ini-section ini-section-galeria">
        <div className="ini-container">
          <h2 className="ini-section-title">Nuestros Trabajos</h2>
          <p className="ini-section-subtitle">Conoce algunos de nuestros proyectos realizados</p>

          <div className="ini-galeria-grid">
            <div className="ini-galeria-item">
              <img src="/pg1.png" alt="Trabajo 1" />
              <div className="ini-galeria-overlay">
                <h4>Restauración Completa</h4>
                <p>Kia</p>
              </div>
            </div>
            <div className="ini-galeria-item">
              <img src="/pg2.png" alt="Trabajo 2" />
              <div className="ini-galeria-overlay">
                <h4>Pintura Premium</h4>
                <p>Xt 660</p>
              </div>
            </div>
            <div className="ini-galeria-item">
              <img src="/pg3.png" alt="Trabajo 3" />
              <div className="ini-galeria-overlay">
                <h4>Recomendacion de clientes</h4>
                <p>Pequeño calvin</p>
              </div>
            </div>
            <div className="ini-galeria-item">
              <img src="/pg4.png" alt="Trabajo 4" />
              <div className="ini-galeria-overlay">
                <h4>Latonería</h4>
                <p>Kia</p>
              </div>
            </div>
            <div className="ini-galeria-item">
              <img src="/pg5.png" alt="Trabajo 5" />
              <div className="ini-galeria-overlay">
                <h4>Mantenimiento</h4>
                <p>Kawasaki 125R</p>
              </div>
            </div>
            <div className="ini-galeria-item">
              <img src="/pg6.png" alt="Trabajo 6" />
              <div className="ini-galeria-overlay">
                <h4>Lavado premium</h4>
                <p>RX 100</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Testimonios */}
      <section id="testimonios" className="ini-section ini-section-testimonios">
        <div className="ini-container">
          <h2 className="ini-section-title">Lo que dicen nuestros clientes</h2>
          <p className="ini-section-subtitle">Experiencias reales de quienes confían en nosotros</p>

          <div className="ini-testimonios-grid">
            <div className="ini-testimonio-card">
              <div className="ini-testimonio-stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="ini-testimonio-text">
                "Excelente servicio, mi carro quedó como nuevo. El equipo de MotOrtega es muy profesional y cumple con
                los tiempos prometidos."
              </p>
              <div className="ini-testimonio-autor">
                <img src="/perfil.jpg" alt="Cliente" />
                <div>
                  <h4>Carlos Rodríguez</h4>
                  <span>Cliente desde 2020</span>
                </div>
              </div>
            </div>

            <div className="ini-testimonio-card">
              <div className="ini-testimonio-stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="ini-testimonio-text">
                "La mejor inversión para mi vehículo. La pintura quedó perfecta y el servicio al cliente es excepcional.
                Totalmente recomendado."
              </p>
              <div className="ini-testimonio-autor">
                <img src="/perfil.jpg" alt="Cliente" />
                <div>
                  <h4>María González</h4>
                  <span>Cliente desde 2019</span>
                </div>
              </div>
            </div>

            <div className="ini-testimonio-card">
              <div className="ini-testimonio-stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
              </div>
              <p className="ini-testimonio-text">
                "Servicio de grúa 24/7 salvó mi día. Llegaron rápido y solucionaron todo de manera profesional.
                MotOrtega es sinónimo de confianza."
              </p>
              <div className="ini-testimonio-autor">
                <img src="/perfil.jpg" alt="Cliente" />
                <div>
                  <h4>Andrés Martínez</h4>
                  <span>Cliente desde 2021</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ini-footer">
        <div className="ini-container">
          <div className="ini-footer-content">
            <div className="ini-footer-brand">
              <img src="/Logo.png" alt="MotOrtega" className="ini-footer-logo " />
              <h3>MotOrtega</h3>
              <p>Tu taller de confianza en Medellín</p>
            </div>

            <div className="ini-footer-links">
              <h4>Enlaces Rápidos</h4>
              <ul>
                <li>
                  <a
                    href="#inicio"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("inicio")
                    }}
                  >
                    Inicio
                  </a>
                </li>
                <li>
                  <a
                    href="#servicios"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("servicios")
                    }}
                  >
                    Servicios
                  </a>
                </li>
                <li>
                  <a
                    href="#nosotros"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("nosotros")
                    }}
                  >
                    Nosotros
                  </a>
                </li>
                <li>
                  <a
                    href="#galeria"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection("galeria")
                    }}
                  >
                    Galería
                  </a>
                </li>
              </ul>
            </div>

            <div className="ini-footer-servicios">
              <h4>Nuestros Servicios</h4>
              <ul>
                <li>Mecánica General</li>
                <li>Latonería y Pintura</li>
                <li>Lavadero</li>
                <li>Repuestos</li>
                <li>Grúa 24/7</li>
              </ul>
            </div>
          </div>

          <div className="ini-footer-bottom">
            <p>&copy; {new Date().getFullYear()} MotOrtega. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MotOrtega

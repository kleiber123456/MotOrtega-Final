import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import '../../../../shared/styles/MotOrtega.css';
import { MdLocalCarWash } from "react-icons/md";
 

function MotOrtega(){
    const usuario = JSON.parse(localStorage.getItem('usuario') || sessionStorage.getItem('usuario'));
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [activeSection, setActiveSection] = useState('inicio');

    // Control de scroll para efectos visuales
    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
            
            // Detectar sección activa para cambios de color
            const sections = document.querySelectorAll('.ini-section');
            sections.forEach(section => {
                const top = section.offsetTop - 100;
                const height = section.offsetHeight;
                if (window.scrollY >= top && window.scrollY < top + height) {
                    setActiveSection(section.id);
                }
            });
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 600);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return(
        <div className="contenedor-MotOrtega">
            {/* Sección Hero */}
            <section id="inicio" className="ini-section ini-section1">
                <div className="imgF">
                    <nav className="menu animate__animated animate__fadeInDown">
                        {isMobile ? (
                            usuario ? (
                                <>
                                    <Link className="opc" to="#galeria" onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('galeria').scrollIntoView({behavior: 'smooth'});
                                    }}>Galería</Link>
                                    <Link className="alogo" to="/"><img className="logoMotOrtega" src="/Logo.png" alt="Logo de MotOrtega"/></Link>
                                    <Link className="opcR" to="/dashboard">Ir al Panel</Link>
                                </>
                            ) : (
                                <>
                                    <Link className="opcR" to="/register">Registrarse</Link>
                                    <Link className="alogo" to="/"><img className="logoMotOrtega" src="/Logo.png" alt="Logo de MotOrtega"/></Link>
                                    <Link className="opcR" to="/login">Iniciar sesión</Link>
                                </>
                            )
                        ) : (
                            <>
                                <Link className="opc" to="#servicios" onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('servicios').scrollIntoView({behavior: 'smooth'});
                                }}>Servicios</Link>
                                <Link className="opc" to="#galeria" onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('galeria').scrollIntoView({behavior: 'smooth'});
                                }}>Galería</Link>
                                <Link className="opc" to="#testimonios" onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('testimonios').scrollIntoView({behavior: 'smooth'});
                                }}>Testimonios</Link>
                                <Link className="alogo" to="/"><img className="logoMotOrtega" src="/Logo.png" alt="Logo de MotOrtega"/></Link>
                                <Link className="opc" to="#contacto" onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('contacto').scrollIntoView({behavior: 'smooth'});
                                }}>Contacto</Link>
                                {usuario ? (
                                    <>
                                        <Link className="opcR" to="/agendar-cita">Agendar Citas</Link>
                                        <Link className="opcR" to="/dashboard">Ir al Panel</Link>
                                    </>
                                ) : (
                                    <>
                                        <Link className="opcR" to="/register">Registrarse</Link>
                                        <Link className="opcR" to="/login">Iniciar sesión</Link>
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
                                {usuario ? 'Agenda tu cita en línea fácilmente' : '¿Quieres agendar tu cita? Registrate Ahora'}
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
                                <i className="fas fa-car-wash"><MdLocalCarWash /></i>
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
                            <p>Somos un taller especializado ubicado en Pedregal, Medellín (Cra 72 #101‑5), con años de experiencia brindando servicios de calidad para todo tipo de vehículos.</p>
                            <p>Nuestro equipo de profesionales está comprometido con ofrecer soluciones efectivas y un servicio de excelencia para mantener tu vehículo en óptimas condiciones.</p>
                            
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
                            <img src="/placeholder.svg?height=300&width=400" alt="Trabajo 1" />
                            <div className="ini-galeria-overlay">
                                <h4>Restauración Completa</h4>
                                <p>Chevrolet Camaro</p>
                            </div>
                        </div>
                        <div className="ini-galeria-item">
                            <img src="/placeholder.svg?height=300&width=400" alt="Trabajo 2" />
                            <div className="ini-galeria-overlay">
                                <h4>Pintura Premium</h4>
                                <p>BMW Serie 3</p>
                            </div>
                        </div>
                        <div className="ini-galeria-item">
                            <img src="/placeholder.svg?height=300&width=400" alt="Trabajo 3" />
                            <div className="ini-galeria-overlay">
                                <h4>Reparación Motor</h4>
                                <p>Toyota Prado</p>
                            </div>
                        </div>
                        <div className="ini-galeria-item">
                            <img src="/placeholder.svg?height=300&width=400" alt="Trabajo 4" />
                            <div className="ini-galeria-overlay">
                                <h4>Latonería</h4>
                                <p>Mercedes-Benz</p>
                            </div>
                        </div>
                        <div className="ini-galeria-item">
                            <img src="/placeholder.svg?height=300&width=400" alt="Trabajo 5" />
                            <div className="ini-galeria-overlay">
                                <h4>Mantenimiento</h4>
                                <p>Ford F-150</p>
                            </div>
                        </div>
                        <div className="ini-galeria-item">
                            <img src="/placeholder.svg?height=300&width=400" alt="Trabajo 6" />
                            <div className="ini-galeria-overlay">
                                <h4>Lavado Premium</h4>
                                <p>Audi A4</p>
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
                                "Excelente servicio, mi carro quedó como nuevo. El equipo de MotOrtega es muy profesional y cumple con los tiempos prometidos."
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
                                "La mejor inversión para mi vehículo. La pintura quedó perfecta y el servicio al cliente es excepcional. Totalmente recomendado."
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
                                "Servicio de grúa 24/7 salvó mi día. Llegaron rápido y solucionaron todo de manera profesional. MotOrtega es sinónimo de confianza."
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

            {/* Sección Contacto */}
            <section id="contacto" className="ini-section ini-section-contacto">
                <div className="ini-container">
                    <h2 className="ini-section-title">Contáctanos</h2>
                    <p className="ini-section-subtitle">Agenda tu cita o solicita información</p>
                    
                    <div className="ini-contacto-content">
                        <div className="ini-contacto-info">
                            <div className="ini-contacto-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <div>
                                    <h4>Ubicación</h4>
                                    <p>Cra 72 #101‑5, Pedregal, Medellín</p>
                                </div>
                            </div>
                            
                            <div className="ini-contacto-item">
                                <i className="fas fa-phone"></i>
                                <div>
                                    <h4>Teléfono</h4>
                                    <p>313 806 0710</p>
                                </div>
                            </div>
                            
                            <div className="ini-contacto-item">
                                <i className="fas fa-envelope"></i>
                                <div>
                                    <h4>Email</h4>
                                    <p>contacto@motortega.com</p>
                                </div>
                            </div>
                            
                            <div className="ini-contacto-item">
                                <i className="fas fa-clock"></i>
                                <div>
                                    <h4>Horarios</h4>
                                    <p>Lunes a Viernes: 8:00 AM - 6:00 PM<br/>Sábados: 8:00 AM - 2:00 PM</p>
                                </div>
                            </div>
                            
                            <div className="ini-contacto-redes">
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="https://wa.me/573138060710" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-whatsapp"></i>
                                </a>
                            </div>
                        </div>
                        
                        <div className="ini-contacto-form">
                            <form>
                                <div className="ini-form-group">
                                    <input type="text" placeholder="Nombre completo" required />
                                </div>
                                <div className="ini-form-group">
                                    <input type="email" placeholder="Correo electrónico" required />
                                </div>
                                <div className="ini-form-group">
                                    <input type="tel" placeholder="Teléfono" required />
                                </div>
                                <div className="ini-form-group">
                                    <select required>
                                        <option value="">Selecciona un servicio</option>
                                        <option value="mecanica">Mecánica General</option>
                                        <option value="latoneria">Latonería y Pintura</option>
                                        <option value="lavado">Lavadero</option>
                                        <option value="repuestos">Repuestos</option>
                                        <option value="grua">Servicio de Grúa</option>
                                    </select>
                                </div>
                                <div className="ini-form-group">
                                    <textarea placeholder="Mensaje" rows="4" required></textarea>
                                </div>
                                <button type="submit" className="btn-unete creativo ini-btn-full">
                                    Enviar Mensaje
                                </button>
                            </form>
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
                                    <a href="#inicio" onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('inicio').scrollIntoView({behavior: 'smooth'});
                                    }}>Inicio</a>
                                </li>
                                <li>
                                    <a href="#servicios" onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('servicios').scrollIntoView({behavior: 'smooth'});
                                    }}>Servicios</a>
                                </li>
                                <li>
                                    <a href="#galeria" onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('galeria').scrollIntoView({behavior: 'smooth'});
                                    }}>Galería</a>
                                </li>
                                <li>
                                    <a href="#contacto" onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('contacto').scrollIntoView({behavior: 'smooth'});
                                    }}>Contacto</a>
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
                        
                        <div className="ini-footer-contacto">
                            <h4>Contacto</h4>
                            <p><i className="fas fa-map-marker-alt"></i> Cra 72 #101‑5, Pedregal, Medellín</p>
                            <p><i className="fas fa-phone"></i> 313 806 0710</p>
                            <p><i className="fas fa-envelope"></i> contacto@motortega.com</p>
                            <div className="ini-footer-redes">
                                <a href="https://www.instagram.com/motortega/?hl=es" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="https://web.facebook.com/Motorteg" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="https://wa.me/573138060710" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-whatsapp"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="ini-footer-bottom">
                        <p>&copy; {new Date().getFullYear()} MotOrtega. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* Botón flotante de WhatsApp */}
            <a href="https://wa.me/573138060710" className="ini-whatsapp-float" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i>
            </a>
        </div>
    );
}

export default MotOrtega;

import React from "react";
import { Link } from 'react-router-dom';
import '../../../../shared/styles/MotOrtega.css';

function MotOrtega(){
    const usuario = JSON.parse(localStorage.getItem('usuario') || sessionStorage.getItem('usuario'));

    return(
        <div className="contenedor-MotOrtega">
            <section className="ini-section1">
                <div className="imgF">
                    <nav className="menu animate__animated animate__fadeInDown">
                        <Link className="opc" to="/opcion1">Opción 1</Link>
                        <Link className="opc" to="/opcion2">Opción 2</Link>
                        <Link className="opc" to="/opcion3">Opción 3</Link>
                        <Link className="alogo" to="/"><img className="logoMotOrtega" src="/Logo.png" alt="Logo de MotOrtega"/></Link>
                        <Link className="opc" to="/opcion4">Opción 4</Link>

                        {usuario ? (
                            <>
                                <Link className="opcR" to="/agendar-cita">Agendar C</Link>
                                <Link className="opcR" to="/dashboard">Ir al Panel</Link>
                            </>
                        ) : (
                            <>
                                <Link className="opcR" to="/register">Registrarse</Link>
                                <Link className="opcR" to="/login">Iniciar sesión</Link>
                            </>
                        )}
                    </nav>

                    <header className="encabezado">
                        <img className="ini-llanta" src="/llantamto.png" alt="" />
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
                    </header>
                </div>
            </section>

            <section className="c1">  
            </section>
        </div>
    );
}

export default MotOrtega;

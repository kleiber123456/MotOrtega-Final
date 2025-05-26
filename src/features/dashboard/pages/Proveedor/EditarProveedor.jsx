import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import '../../../../shared/styles/editarProveedor.css';

const EditarProveedor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const [formulario, setFormulario] = useState({
        nombre: "",
        telefono: "",
        nombre_empresa: "",
        telefono_empresa: "",
        nit: "", // El NIT se cargará de la API pero no será editable
        direccion: "",
        correo: "",
        estado: "Activo",
    });

    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(true);

    const soloNumeros = (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    };

    const soloLetras = (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
    };

    // Validación individual de campo (se excluye 'nit' de la validación de entrada del usuario)
    const validarCampo = (name, value) => {
        let nuevoError = '';

        if (name === 'nombre') {
            if (!value.trim()) {
                nuevoError = 'El nombre es obligatorio.';
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                nuevoError = 'El nombre solo debe contener letras.';
            }
        } else if (name === 'telefono') {
            if (!value.trim()) {
                nuevoError = 'El teléfono es obligatorio.';
            } else if (!/^\d+$/.test(value)) {
                nuevoError = 'El teléfono solo debe contener números.';
            }
        } else if (name === 'nombre_empresa') {
            if (!value.trim()) {
                nuevoError = 'El nombre de la empresa es obligatorio.';
            }
        }else if (name === 'telefono_empresa') {
            if (!value.trim()) {
                nuevoError = 'El teléfono de la empresa es obligatorio.';
            } else if (!/^\d+$/.test(value)) {
                nuevoError = 'El teléfono de la empresa solo debe contener números.';
            }
        }
        // ******************************************************
        // ** Campo 'nit' excluido de la validación del usuario **
        // ******************************************************
        /*
        else if (name === 'nit') {
            if (!value.trim()) {
                nuevoError = 'El NIT es obligatorio.';
            } else if (!/^\d+$/.test(value)) {
                nuevoError = 'El NIT solo debe contener números.';
            }
        }
        */
        else if (name === 'direccion') {
            if (!value.trim()) {
                nuevoError = 'La dirección es obligatoria.';
            }
        } else if (name === 'correo') {
            if (!value.trim()) {
                nuevoError = 'El correo es obligatorio.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                nuevoError = 'El correo no es válido.';
            }
        } else if (name === 'estado') {
            if (!['Activo', 'Inactivo'].includes(value)) {
                nuevoError = 'Estado inválido.';
            }
        }

        setErrores(prev => ({ ...prev, [name]: nuevoError }));
        return nuevoError === '';
    };

    // Validación completa del formulario (se excluye 'nit' de la validación)
    const validarFormulario = () => {
        let esValido = true;

        if (!validarCampo('nombre', formulario.nombre)) esValido = false;
        if (!validarCampo('telefono', formulario.telefono)) esValido = false;
        if (!validarCampo('nombre_empresa', formulario.nombre_empresa)) esValido = false;
        if (!validarCampo('telefono_empresa', formulario.telefono_empresa)) esValido = false;
        // ******************************************************
        // ** Campo 'nit' excluido de la validación del formulario **
        // ******************************************************
        // if (!validarCampo('nit', formulario.nit)) esValido = false; // Ya no validamos el NIT
        if (!validarCampo('direccion', formulario.direccion)) esValido = false;
        if (!validarCampo('correo', formulario.correo)) esValido = false;
        if (!validarCampo('estado', formulario.estado)) esValido = false;

        return esValido;
    };

    useEffect(() => {
        const obtenerProveedor = async () => {
            setCargando(true);
            try {
                if (!token) {
                    Swal.fire("Error", "No autorizado: Token no encontrado.", "error");
                    navigate('/login');
                    return;
                }
                const response = await axios.get(
                    `https://api-final-8rw7.onrender.com/api/proveedores/${id}`,
                    {
                        headers: {
                            Authorization: token,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const data = response.data;
                setFormulario({
                    ...data,
                    estado: data.estado.charAt(0).toUpperCase() + data.estado.slice(1)
                });
            } catch (error) {
                console.error("Error al obtener proveedor:", error);
                Swal.fire("Error", "Error al cargar los datos del proveedor.", "error");
                navigate('/ListarProveedores');
            } finally {
                setCargando(false);
            }
        };

        obtenerProveedor();
    }, [id, navigate, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Solo actualizamos el estado si el campo no es 'nit'
        if (name !== 'nit') {
            setFormulario((prev) => ({ ...prev, [name]: value }));
            validarCampo(name, value);
        }
        // Si fuera 'nit', simplemente no hacemos nada con el cambio
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos inválidos',
                text: 'Por favor corrige los errores antes de continuar.',
            });
            return;
        }

        try {
            if (!token) {
                Swal.fire("Error", "No autorizado: Token no encontrado.", "error");
                navigate('/login');
                return;
            }

            // Opcional: Verificar duplicados *excluyendo el proveedor actual*
            // Si el NIT es readOnly, no debería causar duplicados inesperados por parte del usuario.
            // Si tu lógica de backend ya maneja esto, puedes simplificar esta parte.
            const checkResponse = await axios.get('https://api-final-8rw7.onrender.com/api/proveedores', {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
            });

            const proveedores = checkResponse.data;
            const proveedorDuplicado = proveedores.find((p) =>
                p._id !== id && // Excluir al proveedor que se está editando
                (p.nombre.toLowerCase() === formulario.nombre.toLowerCase() ||
                 p.telefono === formulario.telefono ||
                 p.nombre_empresa.toLowerCase() === formulario.nombre_empresa.toLowerCase() ||
                 // Si el NIT no se puede cambiar, el check de duplicados por NIT para OTROS proveedores
                 // sigue siendo relevante si permites editar otros campos que, combinados, podrían ser únicos.
                 // Si el NIT es una clave única estricta y no se puede cambiar, no necesitas comprobar
                 // que el NIT del formulario sea igual al de otro proveedor (porque siempre será el NIT original de este proveedor).
                 // Sin embargo, si quieres asegurar que el NOMBRE, TELEFONO o NOMBRE_EMPRESA no se dupliquen con otro proveedor
                 // que *ya tiene el mismo NIT* (si el NIT no se puede cambiar), esta lógica es útil.
                 // Si solo te preocupa duplicados de los campos que SÍ se pueden editar, podrías quitar `p.nit === formulario.nit`
                 p.nit === formulario.nit)
            );

            

            const estadoParaAPI = formulario.estado.toLowerCase();

            await axios.put(
                `https://api-final-8rw7.onrender.com/api/proveedores/${id}`,
                { ...formulario, estado: estadoParaAPI },
                {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                }
            );
            Swal.fire("Éxito", "Proveedor actualizado exitosamente.", "success");
            navigate("/ListarProveedores");
        } catch (error) {
            console.error("Error al actualizar proveedor:", error);
            const errorMessage = error.response && error.response.data && error.response.data.message
                                 ? error.response.data.message
                                 : "No se pudo actualizar el proveedor.";
            Swal.fire("Error", errorMessage, "error");
        }
    };

    if (cargando) {
        return (
            <div className="perfil__container">
                <div className="perfil__form">
                    <div className="perfil__title-container">
                        <h2 className="perfil__title">Cargando Proveedor...</h2>
                    </div>
                    <p style={{textAlign: 'center', color: '#555'}}>Por favor, espere mientras cargamos la información.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="perfil__container">
            <form onSubmit={handleSubmit} className="perfil__form">
                <div className="perfil__title-container">
                    <h2 className="perfil__title">Editar Proveedor</h2>
                </div>

                <div className="perfil__grid-container">
                    {/* Nombre */}
                    <div className="perfil__field">
                        <label>Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formulario.nombre}
                            onChange={handleChange}
                            onInput={soloLetras}
                            maxLength={50}
                            autoComplete="off"
                            className={errores.nombre ? "input-error" : ""}
                            required
                        />
                        {errores.nombre && <span className="perfil-validacion">{errores.nombre}</span>}
                    </div>

                    {/* Teléfono */}
                    <div className="perfil__field">
                        <label>Teléfono</label>
                        <input
                            type="text"
                            name="telefono"
                            value={formulario.telefono}
                            onChange={handleChange}
                            onInput={soloNumeros}
                            maxLength={15}
                            autoComplete="off"
                            className={errores.telefono ? "input-error" : ""}
                            required
                        />
                        {errores.telefono && <span className="perfil-validacion">{errores.telefono}</span>}
                    </div>

                    {/* Nombre de la Empresa */}
                    <div className="perfil__field">
                        <label>Nombre de la Empresa</label>
                        <input
                            type="text"
                            name="nombre_empresa"
                            value={formulario.nombre_empresa}
                            onChange={handleChange}
                            maxLength={45}
                            autoComplete="off"
                            className={errores.nombre_empresa ? "input-error" : ""}
                            required
                        />
                        {errores.nombre_empresa && <span className="perfil-validacion">{errores.nombre_empresa}</span>}
                    </div>
                    {/* Teléfono de la Empresa */}
                    <div className="perfil__field">
                        <label>Telefono Empresa</label>
                        <input
                            type="text"
                            name="telefono_empresa"
                            value={formulario.telefono_empresa}
                            onChange={handleChange}
                            maxLength={45}
                            autoComplete="off"
                            className={errores.telefono_empresa ? "input-error" : ""}
                            required
                        />
                        {errores.telefono_empresa && <span className="perfil-validacion">{errores.telefono_empresa}</span>}
                    </div>

                    {/* NIT - Campo de solo lectura */}
                    <div className="perfil__field">
                        <label>NIT</label>
                        <input
                            type="text"
                            name="nit"
                            value={formulario.nit}
                            readOnly // <-- ¡Este es el cambio clave! Hace el campo de solo lectura
                            // onChange ya no lo necesitamos para el NIT, ya que es readOnly
                            // onInput ya no lo necesitamos para el NIT, ya que es readOnly
                            maxLength={15}
                            autoComplete="off"
                            // No aplicamos clase de error porque no se validará por entrada de usuario
                            // className={errores.nit ? "input-error" : ""} // Comentado
                            required
                            style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }} // Estilo para indicar que es no editable
                        />
                        {/* {errores.nit && <span className="perfil-validacion">{errores.nit}</span>} */} {/* Comentado */}
                    </div>

                    {/* Dirección */}
                    <div className="perfil__field">
                        <label>Dirección</label>
                        <input
                            type="text"
                            name="direccion"
                            value={formulario.direccion}
                            onChange={handleChange}
                            maxLength={45}
                            autoComplete="off"
                            className={errores.direccion ? "input-error" : ""}
                            required
                        />
                        {errores.direccion && <span className="perfil-validacion">{errores.direccion}</span>}
                    </div>
                    {/* Correo */}
                    <div className="perfil__field">
                        <label>Correo</label>
                        <input
                            type="text"
                            name="correo"
                            value={formulario.correo}
                            onChange={handleChange}
                            maxLength={45}
                            autoComplete="off"
                            className={errores.correo ? "input-error" : ""}
                            required
                        />
                        {errores.correo && <span className="perfil-validacion">{errores.correo}</span>}
                    </div>

                    {/* Estado */}
                    <div className="perfil__field">
                        <label>Estado</label>
                        <select
                            name="estado"
                            value={formulario.estado}
                            onChange={handleChange}
                            className={errores.estado ? "input-error" : ""}
                            required
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                        {errores.estado && <span className="perfil-validacion">{errores.estado}</span>}
                    </div>
                </div>

                <button type="submit" className="perfil__btn">
                    Actualizar Proveedor
                </button>
            </form>
        </div>
    );
};

export default EditarProveedor;
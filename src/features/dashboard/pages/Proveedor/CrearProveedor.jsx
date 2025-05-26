import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../../../shared/styles/crearUsuarios.css'; 

const CrearProveedor = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token'); 

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    nombre_empresa: '',
    telefono_empresa: '',
    nit: '',
    direccion: '',
    correo: '',
    estado: 'Activo',
  });

  const [errores, setErrores] = useState({});

  const soloNumeros = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  };

  // Función para permitir solo letras en los campos
  const soloLetras = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
  };

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
    } else if (name === 'telefono_empresa') {
      if (!value.trim()) {
        nuevoError = 'El teléfono de la empresa es obligatorio.';
      } else if (!/^\d+$/.test(value)) {
        nuevoError = 'El teléfono de la empresa solo debe contener números.';
      }
    } else if (name === 'nit') {
      if (!value.trim()) {
        nuevoError = 'El NIT es obligatorio.';
      } else if (!/^\d+$/.test(value)) {
        nuevoError = 'El NIT solo debe contener números.';
      }
    } else if (name === 'direccion') {
      if (!value.trim()) {
        nuevoError = 'La dirección es obligatoria.';
      }
    } else if (name === 'correo') {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        nuevoError = 'El correo electrónico no es válido.';
      }
    } else if (name === 'estado') {
      if (!['Activo', 'Inactivo'].includes(value)) {
        nuevoError = 'Estado inválido.';
      }
    }

    setErrores(prev => ({ ...prev, [name]: nuevoError }));
  };


  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre)) {
      nuevosErrores.nombre = 'El nombre solo debe contener letras.';
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio.';
    } else if (!/^\d+$/.test(formData.telefono)) {
      nuevosErrores.telefono = 'El teléfono solo debe contener números.';
    }

    if (!formData.nombre_empresa.trim()) {
      nuevosErrores.nombre_empresa = 'El nombre de la empresa es obligatorio.';
    }

    if (formData.telefono_empresa && !/^\d+$/.test(formData.telefono_empresa)) {
      nuevosErrores.telefono_empresa = 'El teléfono de la empresa solo debe contener números.';
    }

    if (!formData.nit.trim()) {
      nuevosErrores.nit = 'El NIT es obligatorio.';
    } else if (!/^\d+$/.test(formData.nit)) {
      nuevosErrores.nit = 'El NIT solo debe contener números.';
    }

    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es obligatoria.';
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      nuevosErrores.correo = 'El correo electrónico no es válido.';
    }

    if (!['Activo', 'Inactivo'].includes(formData.estado)) {
      nuevosErrores.estado = 'Estado inválido.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validarCampo(name, value); // Validar al cambiar cada campo
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
      // Paso 1: Verificar duplicados
      const checkResponse = await fetch('https://api-final-8rw7.onrender.com/api/proveedores', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (!checkResponse.ok) {

        const errorData = await checkResponse.json();
        throw new Error(errorData.message || 'Error al verificar duplicados.');
      }

      const proveedores = await checkResponse.json();

      const proveedorDuplicado = proveedores.find((p) =>
        p.nit === formData.nit
      );

      if (proveedorDuplicado) {

        Swal.fire(
          'Duplicado detectado',
          'Ya existe un proveedor con el mismo NIT.',
          'warning'
        );
        return;
      }


      const response = await fetch('https://api-final-8rw7.onrender.com/api/proveedores', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear proveedor.');
      }

      Swal.fire('Éxito', 'Proveedor creado exitosamente.', 'success');
      navigate('/ListarProveedores');
    } catch (err) {
      console.error("Error en la creación/verificación:", err); 
      Swal.fire('Error', err.message || 'No se pudo crear el proveedor.', 'error');
    } finally {
    }
  };

  return (
    <div className="perfil__container"> 
      <form onSubmit={handleSubmit} className="perfil__form"> 
        <div className="perfil__title-container"> 
          <h2 className="perfil__title">Crear Proveedor</h2> 
        </div>

        <div className="perfil__grid-container"> 
          {/* Nombre */}
          <div className="perfil__field"> 
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onInput={soloLetras}
              maxLength={50} 
              autoComplete="off" 
              className={errores.nombre ? "input-error" : ""} 
              required // Agregado required
            />
            {errores.nombre && <span className="perfil-validacion">{errores.nombre}</span>} {}
          </div>

    
          <div className="perfil__field">
            <label>Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onInput={soloNumeros} 
              maxLength={15} 
              autoComplete="off" 
              className={errores.telefono ? "input-error" : ""}
              required
            />
            {errores.telefono && <span className="perfil-validacion">{errores.telefono}</span>}
          </div>

          <div className="perfil__field">
            <label>Nombre de la Empresa</label>
            <input
              type="text"
              name="nombre_empresa"
              value={formData.nombre_empresa}
              onChange={handleChange}
              maxLength={45} 
              autoComplete="off" 
              className={errores.nombre_empresa ? "input-error" : ""}
              required
            />
            {errores.nombre_empresa && <span className="perfil-validacion">{errores.nombre_empresa}</span>}
          </div>

          <div className="perfil__field">
            <label>Telefono Empresa</label>
            <input
              type="text"
              name="telefono_empresa"
              value={formData.telefono_empresa}
              onChange={handleChange}
              maxLength={45} 
              autoComplete="off" 
              className={errores.telefono_empresa ? "input-error" : ""}
              required
            />
            {errores.nombre_empresa && <span className="perfil-validacion">{errores.telefono_empresa}</span>}
          </div>

      
          <div className="perfil__field">
            <label>NIT</label>
            <input
              type="text"
              name="nit"
              value={formData.nit}
              onChange={handleChange}
              onInput={soloNumeros} 
              maxLength={15} 
              autoComplete="off" 
              className={errores.nit ? "input-error" : ""}
              required
            />
            {errores.nit && <span className="perfil-validacion">{errores.nit}</span>}
          </div>

          <div className="perfil__field">
            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              maxLength={45} 
              autoComplete="off" 
              className={errores.direccion ? "input-error" : ""}
              required
            />
            {errores.direccion && <span className="perfil-validacion">{errores.direccion}</span>}
          </div>
          <div className="perfil__field">
            <label>Correo</label>
            <input
              type="text"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              maxLength={45} 
              autoComplete="off" 
              className={errores.correo ? "input-error" : ""}
              required
            />
            {errores.direccion && <span className="perfil-validacion">{errores.correo}</span>}
          </div>


          <div className="perfil__field">
            <label>Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className={errores.estado ? "input-error" : ""} 
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            {errores.estado && <span className="perfil-validacion">{errores.estado}</span>}
          </div>
        </div>

        <button type="submit" className="perfil__btn" disabled={false}> 
          Crear Proveedor
        </button>
      </form>
    </div>
  );
};

export default CrearProveedor;

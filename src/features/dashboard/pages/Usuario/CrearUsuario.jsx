import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import '../../../../shared/styles/crearUsuarios.css';

function CrearUsuario() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: 'Cédula de ciudadanía',
    documento: '',
    telefono: '',
    direccion: '',
    correo: '',
    password: '',
    confirmPassword: '',
    estado: 'Activo',
    rol_id: '',
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('token'); // Asegúrate que el token esté aquí

        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const res = await fetch("https://api-final-8rw7.onrender.com/api/roles", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Error al cargar los roles');
        }

        const data = await res.json();
        setRoles(data);
      } catch (error) {
        console.error("Error al obtener roles:", error);
        Swal.fire("Error", error.message, "error");
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return Swal.fire("Error", "Las contraseñas no coinciden", "error");
    }

    try {
      const dataToSend = { ...formData };
      delete dataToSend.confirmPassword;

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Token no encontrado");
      }

      const res = await fetch("https://api-final-8rw7.onrender.com/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al registrar");

      Swal.fire({
        icon: 'success',
        title: '¡Usuario creado!',
        text: 'El usuario fue registrado correctamente.',
        timer: 2000,
        showConfirmButton: false
      });

      setTimeout(() => navigate("/listar-usuarios"), 2000);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="ReUs-contenedor">
      <form className="ReUs-formulario" onSubmit={handleSubmit}>
        <h2 className="ReUs-titulo">Crear Usuario</h2>
        <div className="ReUs-grid">
          {/* Columna 1 */}
          <div className="ReUs-columna">
            <input type="text" name="nombre" placeholder="Nombre*" value={formData.nombre} onChange={handleChange} className="ReUs-input" required />
            <input type="text" name="apellido" placeholder="Apellido*" value={formData.apellido} onChange={handleChange} className="ReUs-input" required />
            <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} className="ReUs-input">
              <option>Cédula de ciudadanía</option>
              <option>Tarjeta de identidad</option>
            </select>
            <input type="text" name="documento" placeholder="Documento*" value={formData.documento} onChange={handleChange} className="ReUs-input" required />
          </div>

          {/* Columna 2 */}
          <div className="ReUs-columna">
            <input type="tel" name="telefono" placeholder="Teléfono*" value={formData.telefono} onChange={handleChange} className="ReUs-input" required />
            <input type="text" name="direccion" placeholder="Dirección*" value={formData.direccion} onChange={handleChange} className="ReUs-input" required />
            <input type="email" name="correo" placeholder="Correo electrónico*" value={formData.correo} onChange={handleChange} className="ReUs-input" required />
            <select name="rol_id" value={formData.rol_id} onChange={handleChange} className="ReUs-input" required>
              <option value="">Seleccionar Rol*</option>
              {roles.map(rol => (
                <option key={rol.id} value={rol.id}>{rol.nombre}</option>
              ))}
            </select>
          </div>

          {/* Columna 3 */}
          <div className="ReUs-columna">
            <input type="password" name="password" placeholder="Contraseña*" value={formData.password} onChange={handleChange} className="ReUs-input" required />
            <input type="password" name="confirmPassword" placeholder="Confirmar Contraseña*" value={formData.confirmPassword} onChange={handleChange} className="ReUs-input" required />
           
            <button type="submit" className="ReUs-boton">Registrar</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CrearUsuario;

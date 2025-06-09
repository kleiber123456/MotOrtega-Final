import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaPlus,
  FaClock,
  FaUser,
  FaCar,
  FaWrench,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import './CitasCalendar.css';

const API_BASE_URL = 'https://api-final-8rw7.onrender.com';

const useApi = () => {
  const makeRequest = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }, []);

  return { makeRequest };
};

const CitasCalendar = () => {
  const navigate = useNavigate();
  const { makeRequest } = useApi();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [citas, setCitas] = useState([]);
  const [citasDelDia, setCitasDelDia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [estadosCita, setEstadosCita] = useState([]);
  
  // Estado para nueva cita
  const [nuevaCita, setNuevaCita] = useState({
    fecha: '',
    hora: '',
    vehiculo_id: '',
    mecanico_id: '',
    estado_cita_id: 1
  });
  const [errors, setErrors] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    cargarCitas();
    cargarVehiculos();
    cargarMecanicos();
    cargarEstadosCita();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const response = await makeRequest('/api/citas');
      setCitas(response.data || []);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las citas'
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarVehiculos = async () => {
    try {
      const response = await makeRequest('/api/vehiculos');
      setVehiculos(response.data || []);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    }
  };

  const cargarMecanicos = async () => {
    try {
      const response = await makeRequest('/api/mecanicos');
      setMecanicos(response.data || []);
    } catch (error) {
      console.error('Error al cargar mecánicos:', error);
    }
  };

  const cargarEstadosCita = async () => {
    try {
      const response = await makeRequest('/api/estados-cita');
      setEstadosCita(response.data || []);
    } catch (error) {
      console.error('Error al cargar estados de cita:', error);
      // Estados por defecto si no se pueden cargar
      setEstadosCita([
        { id: 1, nombre: 'Programada' },
        { id: 2, nombre: 'En Proceso' },
        { id: 3, nombre: 'Completada' },
        { id: 4, nombre: 'Cancelada' }
      ]);
    }
  };

  // Funciones del calendario
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getCitasForDate = (date) => {
    const dateStr = formatDate(date);
    return citas.filter(cita => cita.fecha === dateStr);
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    const citasDelDia = getCitasForDate(clickedDate);
    setCitasDelDia(citasDelDia);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Funciones para crear cita
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaCita(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarCita = () => {
    const newErrors = {};
    
    if (!nuevaCita.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!nuevaCita.hora) newErrors.hora = 'La hora es requerida';
    if (!nuevaCita.vehiculo_id) newErrors.vehiculo_id = 'El vehículo es requerido';
    if (!nuevaCita.mecanico_id) newErrors.mecanico_id = 'El mecánico es requerido';
    
    // Validar que la fecha no sea en el pasado
    if (nuevaCita.fecha) {
      const fechaCita = new Date(nuevaCita.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaCita < hoy) {
        newErrors.fecha = 'La fecha no puede ser en el pasado';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarCita()) return;
    
    try {
      setLoading(true);
      await makeRequest('/api/citas', {
        method: 'POST',
        body: JSON.stringify(nuevaCita)
      });
      
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Cita creada correctamente'
      });
      
      setShowModal(false);
      setNuevaCita({
        fecha: '',
        hora: '',
        vehiculo_id: '',
        mecanico_id: '',
        estado_cita_id: 1
      });
      setErrors({});
      cargarCitas();
    } catch (error) {
      console.error('Error al crear cita:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la cita'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaCita = () => {
    if (selectedDate) {
      setNuevaCita(prev => ({
        ...prev,
        fecha: formatDate(selectedDate)
      }));
    }
    setShowModal(true);
  };

  const getEstadoColor = (estadoId) => {
    switch (estadoId) {
      case 1: return '#007bff'; // Programada - Azul
      case 2: return '#ffc107'; // En Proceso - Amarillo
      case 3: return '#28a745'; // Completada - Verde
      case 4: return '#dc3545'; // Cancelada - Rojo
      default: return '#6c757d'; // Gris
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const citasDelDia = getCitasForDate(date);
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear();
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${
            isSelected ? 'selected' : ''
          } ${isToday ? 'today' : ''} ${
            citasDelDia.length > 0 ? 'has-citas' : ''
          }`}
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {citasDelDia.length > 0 && (
            <div className="citas-indicator">
              <span className="citas-count">{citasDelDia.length}</span>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="citas-calendar-container">
      <div className="citas-calendar-header">
        <div className="header-content">
          <div className="header-title">
            <FaCalendarAlt className="header-icon" />
            <h1>Calendario de Citas</h1>
          </div>
          <button 
            className="btn-nueva-cita"
            onClick={handleNuevaCita}
            disabled={loading}
          >
            <FaPlus /> Nueva Cita
          </button>
        </div>
      </div>

      <div className="calendar-content">
        <div className="calendar-section">
          <div className="calendar-header">
            <button className="nav-btn" onClick={handlePrevMonth}>
              <FaChevronLeft />
            </button>
            <h2 className="month-year">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button className="nav-btn" onClick={handleNextMonth}>
              <FaChevronRight />
            </button>
          </div>

          <div className="calendar-grid">
            <div className="day-names">
              {dayNames.map(day => (
                <div key={day} className="day-name">{day}</div>
              ))}
            </div>
            <div className="calendar-days">
              {renderCalendar()}
            </div>
          </div>
        </div>

        <div className="citas-section">
          <div className="citas-header">
            <h3>
              {selectedDate 
                ? `Citas del ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}`
                : 'Selecciona un día'
              }
            </h3>
          </div>
          
          <div className="citas-list">
            {selectedDate ? (
              citasDelDia.length > 0 ? (
                citasDelDia.map(cita => (
                  <div key={cita.id} className="cita-card">
                    <div className="cita-header">
                      <div className="cita-time">
                        <FaClock /> {cita.hora}
                      </div>
                      <div 
                        className="cita-estado"
                        style={{ backgroundColor: getEstadoColor(cita.estado_cita_id) }}
                      >
                        {estadosCita.find(e => e.id === cita.estado_cita_id)?.nombre || 'Desconocido'}
                      </div>
                    </div>
                    <div className="cita-details">
                      <div className="cita-detail">
                        <FaCar /> 
                        <span>{cita.vehiculo?.marca} {cita.vehiculo?.modelo} - {cita.vehiculo?.placa}</span>
                      </div>
                      <div className="cita-detail">
                        <FaUser /> 
                        <span>{cita.vehiculo?.cliente?.nombre} {cita.vehiculo?.cliente?.apellido}</span>
                      </div>
                      <div className="cita-detail">
                        <FaWrench /> 
                        <span>{cita.mecanico?.nombre} {cita.mecanico?.apellido}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-citas">
                  <FaCalendarAlt className="no-citas-icon" />
                  <p>No hay citas programadas para este día</p>
                  <button 
                    className="btn-crear-cita-dia"
                    onClick={handleNuevaCita}
                  >
                    <FaPlus /> Crear cita para este día
                  </button>
                </div>
              )
            ) : (
              <div className="select-date">
                <FaCalendarAlt className="select-date-icon" />
                <p>Selecciona un día en el calendario para ver las citas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear nueva cita */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><FaPlus /> Nueva Cita</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaCalendarAlt /> Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={nuevaCita.fecha}
                    onChange={handleInputChange}
                    className={errors.fecha ? 'error' : ''}
                  />
                  {errors.fecha && <span className="error-text">{errors.fecha}</span>}
                </div>
                
                <div className="form-group">
                  <label>
                    <FaClock /> Hora
                  </label>
                  <input
                    type="time"
                    name="hora"
                    value={nuevaCita.hora}
                    onChange={handleInputChange}
                    className={errors.hora ? 'error' : ''}
                  />
                  {errors.hora && <span className="error-text">{errors.hora}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>
                  <FaCar /> Vehículo
                </label>
                <select
                  name="vehiculo_id"
                  value={nuevaCita.vehiculo_id}
                  onChange={handleInputChange}
                  className={errors.vehiculo_id ? 'error' : ''}
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehiculos.map(vehiculo => (
                    <option key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa} 
                      ({vehiculo.cliente?.nombre} {vehiculo.cliente?.apellido})
                    </option>
                  ))}
                </select>
                {errors.vehiculo_id && <span className="error-text">{errors.vehiculo_id}</span>}
              </div>
              
              <div className="form-group">
                <label>
                  <FaWrench /> Mecánico
                </label>
                <select
                  name="mecanico_id"
                  value={nuevaCita.mecanico_id}
                  onChange={handleInputChange}
                  className={errors.mecanico_id ? 'error' : ''}
                >
                  <option value="">Seleccionar mecánico</option>
                  {mecanicos.map(mecanico => (
                    <option key={mecanico.id} value={mecanico.id}>
                      {mecanico.nombre} {mecanico.apellido}
                    </option>
                  ))}
                </select>
                {errors.mecanico_id && <span className="error-text">{errors.mecanico_id}</span>}
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default CitasCalendar;
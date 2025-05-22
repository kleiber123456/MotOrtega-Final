import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Pencil, Trash2, Eye } from "lucide-react";
import "../../../../shared/styles/ListarProveedor.css";

const ListarProveedor = () => {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const proveedoresPorPagina = 10;
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    fetchProveedores();
  }, []);

  // Función para obtener proveedores
  const fetchProveedores = async () => {
    try {
      if (!token) {
        Swal.fire("Error", "No autorizado: Token no encontrado.", "error");
        return;
      }

      const res = await axios.get(
        "https://api-final-8rw7.onrender.com/api/proveedores",
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setProveedores(res.data);
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
      setProveedores([]);
      Swal.fire("Error", "Error al obtener la lista de proveedores.", "error");
    }
  };

  // Función para eliminar un proveedor
  const eliminarProveedor = async (id) => {
    // 'id' aquí es el _id del proveedor
    if (!id) {
      Swal.fire("Error", "ID de proveedor inválido", "error");
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará al proveedor permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await axios.delete(
        `https://api-final-8rw7.onrender.com/api/proveedores/${id}`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200 || res.status === 204) {
        // 200 OK o 204 No Content son respuestas válidas para DELETE
        setProveedores((prev) =>
          prev.filter((proveedor) => proveedor._id !== id)
        );
        Swal.fire("Eliminado", "Proveedor eliminado correctamente", "success");
      } else {
        throw new Error(`Error al eliminar el proveedor: ${res.status}`);
      }
    } catch (err) {
      console.error("Error al eliminar el proveedor:", err);
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "No se pudo eliminar el proveedor";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  // Función para cambiar el estado de un proveedor
  const cambiarEstado = async (id) => {
    // 'id' aquí es el _id del proveedor
    try {
      if (!token) {
        Swal.fire("Error", "No autorizado: Token no encontrado.", "error");
        return;
      }
      const res = await axios.put(
        `https://api-final-8rw7.onrender.com/api/proveedores/${id}/cambiar-estado`,
        {},
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setProveedores((prev) =>
        prev.map((p) =>
          p._id === id
            ? {
                ...p,
                estado:
                  p.estado.toLowerCase() === "Activo" ? "Inactivo" : "Activo",
              }
            : p
        )
      );
      Swal.fire(
        "Éxito",
        "Estado del proveedor cambiado correctamente",
        "success"
      );
    } catch (err) {
      console.error("Error al cambiar el estado:", err);
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "No se pudo cambiar el estado del proveedor";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  const handleBuscar = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const proveedoresFiltrados = Array.isArray(proveedores)
    ? proveedores.filter((prov) => {
        const textoBusqueda = busqueda.toLowerCase();
        return (
          prov.nombre.toLowerCase().includes(textoBusqueda) ||
          prov.nombre_empresa.toLowerCase().includes(textoBusqueda) ||
          String(prov.telefono || "")
            .toLowerCase()
            .includes(textoBusqueda) ||
          String(prov.nit || "")
            .toLowerCase()
            .includes(textoBusqueda) ||
          prov.direccion.toLowerCase().includes(textoBusqueda) ||
          prov.estado.toLowerCase().includes(textoBusqueda)
        );
      })
    : [];

  const indexUltimo = paginaActual * proveedoresPorPagina;
  const indexPrimero = indexUltimo - proveedoresPorPagina;
  const proveedoresPaginados = proveedoresFiltrados.slice(
    indexPrimero,
    indexUltimo
  );
  const totalPaginas = Math.ceil(
    proveedoresFiltrados.length / proveedoresPorPagina
  );

  const cambiarPagina = (numero) => {
    setPaginaActual(numero);
  };

  const handleEditar = (id) => {
    navigate(`/EditarProveedor/editar/${id}`);
  };

  const handleEliminar = (id) => {
    eliminarProveedor(id);
  };

  const handleDetalle = (id) => {
    navigate(`/DetalleProveedor/${id}`);
  };

  return (
    <div className="LiUs-contenedor">
      <div className="LiUs-header">
        <h2 className="LiUs-titulo">Lista de Proveedores</h2>
        <button
          className="LiUs-boton-crear"
          onClick={() => navigate("/CrearProveedor")}
        >
          Crear Proveedor
        </button>
      </div>

      <input
        className="LiUs-input-busqueda"
        type="text"
        placeholder="Buscar por nombre, empresa, NIT, etc."
        value={busqueda}
        onChange={handleBuscar}
      />

      <div className="LiUs-tabla-container">
        <table className="LiUs-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Empresa</th>
              <th>NIT</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresPaginados.length > 0 ? (
              proveedoresPaginados.map((prov) => (
                <tr key={prov.id}>
                  <td>{prov.nombre}</td>
                  <td>{prov.telefono}</td>
                  <td>{prov.nombre_empresa}</td>
                  <td>{prov.nit}</td>
                  <td>{prov.direccion}</td>
                  <td>
                    <div
                      className={`estado-switch ${
                        prov.estado === "Activo" ? "activo" : "inactivo"
                      }`}
                      title={prov.estado}
                      onClick={() => cambiarEstado(prov.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="switch-bola"></div>
                    </div>
                  </td>
                  <td>
                    <div className="LiUs-acciones">
                      <button
                        className="icon-button edit"
                        title="Editar"
                        onClick={() => handleEditar(prov.id)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="icon-button delete"
                        title="Eliminar"
                        onClick={() => handleEliminar(prov.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        className="icon-button detail"
                        title="Detalle"
                        onClick={() => handleDetalle(prov.id)}
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No se encontraron proveedores.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {proveedoresFiltrados.length > proveedoresPorPagina && (
        <div className="LiUs-paginacion">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="LiUs-boton-paginacion"
          >
            Anterior
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => cambiarPagina(i + 1)}
              className={`LiUs-boton-paginacion ${
                paginaActual === i + 1 ? "active" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="LiUs-boton-paginacion"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ListarProveedor;

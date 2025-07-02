"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Plus,
  X,
  User,
  Package,
  ShoppingBag,
  Loader,
  AlertTriangle,
  Search,
  Trash,
  Save,
  Wrench,
  Car,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Calendar,
} from "lucide-react"
import Swal from "sweetalert2"
import "../../../../shared/styles/Ventas/CrearVenta.css"

const API_BASE_URL = "https://api-final-8rw7.onrender.com/api"

const formatCurrency = (amount) => {
  const number = Number.parseFloat(amount) || 0
  if (number % 1 === 0) {
    return `$${number.toLocaleString("es-CO")}`
  }
  return `$${number.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const getValidToken = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  if (!token) {
    console.error("No hay token disponible")
    return null
  }
  return token
}

const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const makeRequest = useCallback(async (url, options = {}) => {
    setLoading(true)
    setError(null)
    const token = getValidToken()
    if (!token) {
      setError("Error de autenticación")
      setLoading(false)
      return null
    }
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          ...options.headers,
        },
      })
      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`
        try {
          const data = await response.json()
          errorMsg = data?.message || errorMsg
        } catch {}
        throw new Error(errorMsg)
      }
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      }
      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    makeRequest,
    loading,
    setLoading,
    error,
    setError,
  }
}

const CrearVenta = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { makeRequest, loading: apiLoading, error, setError } = useApi()

  // Estados principales
  const [clientes, setClientes] = useState([])
  const [estadosVenta, setEstadosVenta] = useState([])
  const [mecanicos, setMecanicos] = useState([])

  const [activeTab, setActiveTab] = useState("productos")
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingServices, setLoadingServices] = useState(false)
  const [inputValues, setInputValues] = useState({})
  const [inputErrors, setInputErrors] = useState({})
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3)
  const [cartCurrentPage, setCartCurrentPage] = useState(1)
  const [cartItemsPerPage] = useState(4)
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedVehiculo, setSelectedVehiculo] = useState(null)
  const [selectedMecanico, setSelectedMecanico] = useState(null)
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().substr(0, 10),
    mecanico_id: "",
    vehiculo_id: "",
    cita_id: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vehiculosCliente, setVehiculosCliente] = useState([])

  // Nuevos estados para citas
  const [citaProgramada, setCitaProgramada] = useState(null)
  const [showCitaModal, setShowCitaModal] = useState(false)

  // --- Cargar productos y servicios ---
  useEffect(() => {
    if (activeTab === "productos") {
      setLoadingProducts(true)
      makeRequest("/repuestos")
        .then((data) => {
          if (data && Array.isArray(data)) {
            setProducts(data.filter((p) => p.cantidad > 0 && p.estado === "Activo"))
          }
        })
        .catch((error) => {
          console.error("Error cargando productos:", error)
        })
        .finally(() => {
          setLoadingProducts(false)
        })
    } else {
      setLoadingServices(true)
      makeRequest("/servicios")
        .then((data) => {
          if (data && Array.isArray(data)) {
            setServices(data.filter((s) => s.estado === "Activo"))
          }
        })
        .catch((error) => {
          console.error("Error cargando servicios:", error)
        })
        .finally(() => {
          setLoadingServices(false)
        })
    }
  }, [activeTab, makeRequest])

  // --- Cargar clientes y estados venta ---
  useEffect(() => {
    // Cargar clientes
    makeRequest("/clientes")
      .then((data) => {
        console.log("Respuesta completa clientes:", data)

        let clientesArray = []

        // Intentar diferentes estructuras de respuesta
        if (Array.isArray(data)) {
          clientesArray = data
        } else if (data && typeof data === "object") {
          // Buscar arrays en las propiedades del objeto
          const possibleArrays = Object.values(data).filter((value) => Array.isArray(value))
          if (possibleArrays.length > 0) {
            clientesArray = possibleArrays[0] // Tomar el primer array encontrado
          }
        }

        // Filtrar clientes válidos y activos
        const clientesValidos = clientesArray.filter((cliente) => {
          return (
            cliente &&
            typeof cliente === "object" &&
            cliente.id &&
            cliente.nombre &&
            cliente.apellido &&
            cliente.estado?.toLowerCase() === "activo"
          )
        })

        console.log("Clientes procesados:", clientesValidos)
        setClientes(clientesValidos)
      })
      .catch((error) => {
        console.error("Error cargando clientes:", error)
        setClientes([])
      })

    // Cargar estados de venta
    makeRequest("/estados-venta")
      .then((data) => {
        console.log("Respuesta estados venta:", data)
        if (data && Array.isArray(data)) {
          setEstadosVenta(data)
        }
      })
      .catch((error) => {
        console.error("Error cargando estados venta:", error)
        setEstadosVenta([])
      })
  }, [makeRequest])

  // --- Cargar mecánicos activos ---
  useEffect(() => {
    makeRequest("/mecanicos/estado/Activo")
      .then((data) => {
        console.log("Respuesta completa mecánicos:", data)

        let mecanicosList = []

        // Intentar diferentes estructuras de respuesta
        if (Array.isArray(data)) {
          mecanicosList = data
        } else if (data && typeof data === "object") {
          // Buscar arrays en las propiedades del objeto
          const possibleArrays = Object.values(data).filter((value) => Array.isArray(value))
          if (possibleArrays.length > 0) {
            mecanicosList = possibleArrays[0] // Tomar el primer array encontrado
          }
        }

        // Filtrar mecánicos válidos y activos
        const mecanicosValidos = mecanicosList.filter((mecanico) => {
          return (
            mecanico &&
            typeof mecanico === "object" &&
            mecanico.id &&
            mecanico.nombre &&
            mecanico.apellido &&
            mecanico.estado === "Activo"
          )
        })

        console.log("Mecánicos procesados:", mecanicosValidos)
        setMecanicos(mecanicosValidos)
      })
      .catch((error) => {
        console.error("Error cargando mecánicos:", error)
        setMecanicos([])
      })
  }, [makeRequest])

  // --- Calcular total ---
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      if (item.type === "producto") return sum + item.price * item.quantity
      if (item.type === "servicio") return sum + (item.precio || 0)
      return sum
    }, 0)
    setTotal(total)
  }, [cartItems])

  // --- Filtrado y paginación búsqueda ---
  const filteredProducts = searchTerm.trim()
    ? products.filter(
        (p) =>
          !cartItems.some((e) => e.type === "producto" && e.id === p.id) &&
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []
  const filteredServices = searchTerm.trim()
    ? services.filter(
        (s) =>
          !cartItems.some((e) => e.type === "servicio" && e.id === s.id) &&
          s.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems =
    activeTab === "productos"
      ? filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
      : filteredServices.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages =
    activeTab === "productos"
      ? Math.ceil(filteredProducts.length / itemsPerPage)
      : Math.ceil(filteredServices.length / itemsPerPage)

  // --- Paginación carrito ---
  const cartIndexOfLastItem = cartCurrentPage * cartItemsPerPage
  const cartIndexOfFirstItem = cartIndexOfLastItem - cartItemsPerPage
  const currentCartItems = cartItems.slice(cartIndexOfFirstItem, cartIndexOfLastItem)
  const cartTotalPages = Math.ceil(cartItems.length / cartItemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
    setCartCurrentPage(1)
  }, [searchTerm, activeTab])

  // --- Inputs y validaciones ---
  const handleInputChange2 = (id, field, value) => {
    setInputValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }

  const validateInputs = (id, cantidad, precio) => {
    const errors = {}
    if (!cantidad || isNaN(cantidad) || cantidad < 1) errors.cantidad = "Ingrese una cantidad válida"
    if (!precio || isNaN(precio) || precio <= 0) errors.precio = "Ingrese un precio válido"
    setInputErrors((prev) => ({ ...prev, [id]: errors }))
    return Object.keys(errors).length === 0
  }

  // --- Agregar producto/servicio al carrito ---
  const handleAddItem = (item, cantidad, precio) => {
    if (!validateInputs(item.id, cantidad, precio)) return
    if (activeTab === "productos") {
      setCartItems((prev) => [
        ...prev,
        {
          ...item,
          type: "producto",
          quantity: cantidad,
          price: precio,
          stockOriginal: item.cantidad,
        },
      ])
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          ...item,
          type: "servicio",
          precio: precio,
        },
      ])
    }
    setInputErrors((prev) => ({ ...prev, [item.id]: {} }))
    setInputValues((prev) => ({ ...prev, [item.id]: {} }))
  }

  // --- Eliminar del carrito ---
  const removeCartItem = useCallback(async (id, type) => {
    const result = await Swal.fire({
      title: `¿Eliminar ${type === "producto" ? "producto" : "servicio"}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })
    if (result.isConfirmed) {
      setCartItems((prev) => prev.filter((item) => !(item.id === id && item.type === type)))
      Swal.fire({
        title: "Eliminado",
        text: `${type === "producto" ? "Producto" : "Servicio"} eliminado`,
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      })
    }
  }, [])

  // --- Actualizar cantidad/precio en carrito ---
  const updateCartItemQuantity = (id, value) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.type === "producto" ? { ...item, quantity: value === "" ? "" : Number(value) } : item,
      ),
    )
  }

  // --- Validación y envío ---
  const validateForm = useCallback(() => {
    const errors = {}
    if (!selectedClient) errors.client = "Debe seleccionar un cliente"
    if (cartItems.length === 0) errors.items = "Debe seleccionar al menos un producto o servicio"
    if (!formData.fecha) errors.fecha = "La fecha es obligatoria"
    cartItems.forEach((item, index) => {
      if (item.type === "producto") {
        if (!item.quantity || Number(item.quantity) < 1)
          errors[`item_${index}_quantity`] = `Cantidad inválida para ${item.nombre}`
        if (item.price <= 0) errors[`item_${index}_price`] = `Precio inválido para ${item.nombre}`
        if (item.quantity > item.stockOriginal)
          errors[`item_${index}_stock`] = `Cantidad excede el stock disponible para ${item.nombre}`
      }
    })
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [selectedClient, cartItems, formData])

  // --- Cliente, vehículo, mecánico ---
  const [showClientModal, setShowClientModal] = useState(false)
  const [showVehiculoClienteModal, setShowVehiculoClienteModal] = useState(false)
  const [showMecanicoModal, setShowMecanicoModal] = useState(false)

  // Función mejorada para obtener la fecha actual en formato YYYY-MM-DD
  const getFechaHoy = () => {
    const hoy = new Date()
    return hoy.toISOString().split("T")[0]
  }

  // Función para verificar si una fecha está dentro del rango permitido (hoy + próximos 7 días)
  const esFechaValida = (fechaCita) => {
    if (!fechaCita) return false

    const hoy = new Date()
    const fechaCitaObj = new Date(fechaCita)

    // Normalizar las fechas para comparar solo el día (sin hora)
    hoy.setHours(0, 0, 0, 0)
    fechaCitaObj.setHours(0, 0, 0, 0)

    // Calcular la diferencia en días
    const diferenciaDias = Math.floor((fechaCitaObj - hoy) / (1000 * 60 * 60 * 24))

    // Permitir citas desde hoy hasta los próximos 7 días
    return diferenciaDias >= 0 && diferenciaDias <= 7
  }

  const selectClient = useCallback(
    async (client) => {
      setSelectedClient(client)
      setShowClientModal(false)

      if (formErrors.client) {
        setFormErrors((prev) => ({ ...prev, client: "" }))
      }

      try {
        // Cargar vehículos del cliente con información completa (marca y modelo)
        const dataVehiculos = await makeRequest(`/vehiculos/cliente/${client.id}/completos`)
        console.log("Vehículos completos del cliente:", dataVehiculos)

        let vehiculosArray = []

        // Intentar diferentes estructuras de respuesta
        if (Array.isArray(dataVehiculos)) {
          vehiculosArray = dataVehiculos
        } else if (dataVehiculos && typeof dataVehiculos === "object") {
          // Buscar arrays en las propiedades del objeto
          const possibleArrays = Object.values(dataVehiculos).filter((value) => Array.isArray(value))
          if (possibleArrays.length > 0) {
            vehiculosArray = possibleArrays[0] // Tomar el primer array encontrado
          }
        }

        // Si no funciona el endpoint completo, intentar con el normal
        if (vehiculosArray.length === 0) {
          console.log("Intentando con endpoint normal de vehículos...")
          const dataVehiculosNormal = await makeRequest(`/vehiculos/cliente/${client.id}`)

          if (Array.isArray(dataVehiculosNormal)) {
            vehiculosArray = dataVehiculosNormal
          } else if (dataVehiculosNormal && typeof dataVehiculosNormal === "object") {
            const possibleArrays = Object.values(dataVehiculosNormal).filter((value) => Array.isArray(value))
            if (possibleArrays.length > 0) {
              vehiculosArray = possibleArrays[0]
            }
          }
        }

        // Filtrar vehículos válidos
        const vehiculosValidos = vehiculosArray.filter((vehiculo) => {
          return vehiculo && typeof vehiculo === "object" && vehiculo.id
        })

        console.log("Vehículos válidos del cliente:", vehiculosValidos)
        setVehiculosCliente(vehiculosValidos)

        // Buscar citas programadas vinculadas a este cliente con información completa
        try {
          console.log("=== INICIANDO BÚSQUEDA DE CITAS COMPLETAS ===")
          console.log("Cliente seleccionado:", client)
          console.log("ID del cliente:", client.id)

          // Usar endpoint que incluye información completa del vehículo
          const citas = await makeRequest(`/citas/cliente/${client.id}/completas`)
          console.log("=== RESPUESTA COMPLETA DE CITAS CON VEHÍCULO ===")
          console.log("Respuesta raw de la API:", citas)
          console.log("Tipo de respuesta:", typeof citas)
          console.log("Es array?:", Array.isArray(citas))

          let citasArray = []

          // Intentar diferentes estructuras de respuesta
          if (Array.isArray(citas)) {
            citasArray = citas
            console.log("✅ Citas es un array directo")
          } else if (citas && typeof citas === "object") {
            console.log("🔍 Citas es un objeto, buscando arrays internos...")
            console.log("Propiedades del objeto:", Object.keys(citas))
            const possibleArrays = Object.values(citas).filter((value) => Array.isArray(value))
            console.log("Arrays encontrados:", possibleArrays.length)
            if (possibleArrays.length > 0) {
              citasArray = possibleArrays[0]
              console.log("✅ Usando el primer array encontrado")
            }
          }

          console.log("=== CITAS PROCESADAS ===")
          console.log("Total de citas encontradas:", citasArray.length)
          console.log("Citas completas:", citasArray)

          // Buscar cita programada (estado_cita_id === 1) para fechas válidas (hoy + próximos 7 días)
          const fechaHoy = getFechaHoy()
          console.log("=== FILTRADO POR FECHA Y ESTADO ===")
          console.log("Fecha de hoy:", fechaHoy)
          console.log("Rango permitido: Hoy + próximos 7 días")

          // Log detallado de cada cita
          citasArray.forEach((cita, index) => {
            console.log(`--- Cita ${index + 1} ---`)
            console.log("ID:", cita.id)
            console.log("Estado cita ID:", cita.estado_cita_id)
            console.log("Fecha completa:", cita.fecha)
            console.log("Fecha cortada:", cita.fecha ? cita.fecha.substring(0, 10) : "Sin fecha")
            console.log("Hora:", cita.hora)
            console.log("Vehículo ID:", cita.vehiculo_id)
            console.log("Vehículo placa:", cita.vehiculo_placa)
            console.log("Marca:", cita.marca_nombre || "No disponible")
            console.log("Modelo:", cita.modelo_nombre || "No disponible")
            console.log("Mecánico ID:", cita.mecanico_id)
            console.log("Mecánico nombre:", cita.mecanico_nombre, cita.mecanico_apellido)
            console.log("Observaciones:", cita.observaciones)
            console.log("¿Es estado programado (1)?:", cita.estado_cita_id === 1)
            console.log("¿Fecha es válida (hoy + 7 días)?:", esFechaValida(cita.fecha))

            if (cita.fecha) {
              const fechaCita = cita.fecha.substring(0, 10)
              const hoy = new Date()
              const fechaCitaObj = new Date(fechaCita)
              hoy.setHours(0, 0, 0, 0)
              fechaCitaObj.setHours(0, 0, 0, 0)
              const diferenciaDias = Math.floor((fechaCitaObj - hoy) / (1000 * 60 * 60 * 24))
              console.log(`Diferencia en días: ${diferenciaDias} (0=hoy, 1=mañana, etc.)`)
            }
          })

          // NUEVA LÓGICA: Buscar citas programadas en el rango de fechas válidas
          const citasValidas = citasArray.filter((c) => c.estado_cita_id === 1 && esFechaValida(c.fecha))

          console.log("=== CITAS VÁLIDAS ENCONTRADAS ===")
          console.log("Citas que cumplen criterios:", citasValidas.length)
          console.log("Citas válidas:", citasValidas)

          // Tomar la primera cita válida (más próxima)
          const cita = citasValidas.length > 0 ? citasValidas[0] : null

          console.log("=== RESULTADO DE BÚSQUEDA ===")
          if (cita) {
            console.log("🎉 ¡CITA PROGRAMADA ENCONTRADA!")
            console.log("Cita seleccionada:", cita)
            console.log("Detalles de la cita:")
            console.log("- ID:", cita.id)
            console.log("- Fecha:", cita.fecha)
            console.log("- Hora:", cita.hora)
            console.log("- Vehículo ID:", cita.vehiculo_id)
            console.log("- Vehículo placa:", cita.vehiculo_placa)
            console.log("- Marca:", cita.marca_nombre || "No disponible")
            console.log("- Modelo:", cita.modelo_nombre || "No disponible")
            console.log("- Mecánico ID:", cita.mecanico_id)
            console.log("- Mecánico nombre:", cita.mecanico_nombre, cita.mecanico_apellido)
            console.log("- Observaciones:", cita.observaciones)
            setCitaProgramada(cita)
            setShowCitaModal(true) // Mostrar el modal
          } else {
            console.log("❌ No se encontró cita programada en el rango de fechas válidas")
            console.log("Criterios de búsqueda:")
            console.log("- estado_cita_id debe ser 1 (programado)")
            console.log("- fecha debe estar entre hoy y los próximos 7 días")
            console.log("- debe tener fecha válida")
            setCitaProgramada(null)
            setShowCitaModal(false)
            // Limpiar selecciones previas si no hay cita
            setSelectedVehiculo(null)
            setSelectedMecanico(null)
            setFormData((prev) => ({ ...prev, vehiculo_id: "", mecanico_id: "", cita_id: "" }))
          }
          console.log("=== FIN BÚSQUEDA DE CITAS ===")
        } catch (error) {
          console.error("💥 ERROR AL BUSCAR CITAS:")
          console.error("Mensaje de error:", error.message)
          console.error("Error completo:", error)

          // Si el endpoint completo no existe, intentar con el endpoint normal
          console.log("🔄 Intentando con endpoint normal de citas...")
          try {
            const citasNormales = await makeRequest(`/citas/cliente/${client.id}`)
            console.log("Citas normales obtenidas:", citasNormales)

            let citasArray = []
            if (Array.isArray(citasNormales)) {
              citasArray = citasNormales
            } else if (citasNormales && typeof citasNormales === "object") {
              const possibleArrays = Object.values(citasNormales).filter((value) => Array.isArray(value))
              if (possibleArrays.length > 0) {
                citasArray = possibleArrays[0]
              }
            }

            const citasValidas = citasArray.filter((c) => c.estado_cita_id === 1 && esFechaValida(c.fecha))

            if (citasValidas.length > 0) {
              setCitaProgramada(citasValidas[0])
              setShowCitaModal(true)
              console.log("✅ Cita encontrada con endpoint normal")
            }
          } catch (errorNormal) {
            console.error("Error también con endpoint normal:", errorNormal)
          }

          setCitaProgramada(null)
          setShowCitaModal(false)
          setSelectedVehiculo(null)
          setSelectedMecanico(null)
          setFormData((prev) => ({ ...prev, vehiculo_id: "", mecanico_id: "", cita_id: "" }))
        }
      } catch (error) {
        console.error("Error cargando vehículos del cliente:", error)
        setVehiculosCliente([])
      }
    },
    [formErrors.client, makeRequest],
  )

  const selectVehiculo = useCallback((vehiculo) => {
    setSelectedVehiculo(vehiculo)
    setFormData((prev) => ({ ...prev, vehiculo_id: vehiculo.id }))
    setShowVehiculoClienteModal(false)
  }, [])

  const selectMecanico = useCallback((mecanico) => {
    setSelectedMecanico(mecanico)
    setFormData((prev) => ({ ...prev, mecanico_id: mecanico.id }))
    setShowMecanicoModal(false)
  }, [])

  // --- Submit ---
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (isSubmitting) return
      if (!validateForm()) {
        const errorList = Object.values(formErrors)
          .map((msg) => `<li>${msg}</li>`)
          .join("")
        await Swal.fire({
          icon: "warning",
          title: "Formulario incompleto",
          html: `<ul style="text-align:left">${errorList}</ul>`,
          confirmButtonColor: "#2563eb",
        })
        return
      }
      setIsSubmitting(true)
      try {
        const estadoPendiente = estadosVenta.find((estado) => estado.nombre === "Pendiente")
        if (!estadoPendiente) throw new Error("No se encontró el estado 'Pendiente'")

        const ventaData = {
          cliente_id: selectedClient.id,
          estado_venta_id: estadoPendiente.id,
          fecha: formData.fecha,
          servicios: cartItems.filter((i) => i.type === "servicio").map((s) => ({ servicio_id: s.id })),
          repuestos: cartItems
            .filter((i) => i.type === "producto")
            .map((p) => ({ repuesto_id: p.id, cantidad: p.quantity })),
          ...(formData.cita_id ? { cita_id: formData.cita_id } : {}),
          ...(formData.mecanico_id ? { mecanico_id: formData.mecanico_id } : {}),
          ...(formData.vehiculo_id ? { vehiculo_id: formData.vehiculo_id } : {}),
        }

        console.log("Enviando datos de venta:", ventaData)

        await makeRequest("/ventas", {
          method: "POST",
          body: JSON.stringify(ventaData),
        })
        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "La venta ha sido registrada correctamente",
          confirmButtonColor: "#10b981",
          timer: 2000,
        })
        navigate("/ListarVentas")
      } catch (error) {
        console.error("Error al crear venta:", error)
        await Swal.fire({
          icon: "error",
          title: "No se pudo registrar la venta",
          text: error.message || "Error desconocido",
          confirmButtonColor: "#2563eb",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, validateForm, formErrors, selectedClient, cartItems, estadosVenta, formData, makeRequest, navigate],
  )

  // --- Cancelar ---
  const handleCancel = useCallback(async () => {
    if (cartItems.length > 0 || selectedClient) {
      const result = await Swal.fire({
        title: "¿Cancelar venta?",
        text: "Se perderán todos los datos ingresados",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Continuar editando",
      })
      if (result.isConfirmed) navigate("/ListarVentas")
    } else {
      navigate("/ListarVentas")
    }
  }, [cartItems.length, selectedClient, navigate])

  // --- Deseleccionar cliente, vehículo, mecánico ---
  const deselectClient = useCallback(() => {
    setSelectedClient(null)
    setVehiculosCliente([])
    setSelectedVehiculo(null)
    setSelectedMecanico(null)
    setCitaProgramada(null)
    setFormData((prev) => ({ ...prev, vehiculo_id: "", mecanico_id: "", cita_id: "" }))
  }, [])

  const deselectVehiculo = useCallback(() => {
    setSelectedVehiculo(null)
    setFormData((prev) => ({ ...prev, vehiculo_id: "" }))
  }, [])

  const deselectMecanico = useCallback(() => {
    setSelectedMecanico(null)
    setFormData((prev) => ({ ...prev, mecanico_id: "" }))
  }, [])

  // --- Render ---
  return (
    <div className="crearVenta-container">
      {error && (
        <div className="crearVenta-error-banner">
          <AlertTriangle className="crearVenta-error-icon" />
          <p>Hay problemas de conexión con el servidor. Algunas funciones pueden estar limitadas.</p>
          <button className="crearVenta-retry-button" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      )}
      <div className="crearVenta-header">
        <div className="crearVenta-title-section">
          <h1 className="crearVenta-page-title">
            <ShoppingBag className="crearVenta-title-icon" />
            Crear Venta
          </h1>
          <p className="crearVenta-subtitle">Registra una nueva venta de productos y servicios</p>
        </div>
      </div>

      <form className="crearVenta-form" onSubmit={handleSubmit}>
        <div className="crearVenta-form-section">
          <h3 className="crearVenta-section-title">
            <User className="crearVenta-section-icon" />
            Información General
          </h3>
          <div className="crearVenta-form-grid">
            <div className="crearVenta-form-group">
              <label className="crearVenta-label">Cliente</label>
              <div className="crearVenta-input-with-actions">
                <input
                  type="text"
                  className="crearVenta-form-input"
                  value={selectedClient ? `${selectedClient.nombre} ${selectedClient.apellido}` : ""}
                  readOnly
                  onClick={() => setShowClientModal(true)}
                  placeholder="Seleccione un cliente"
                  required
                />
                {selectedClient && (
                  <button
                    type="button"
                    className="crearVenta-deselect-button"
                    onClick={deselectClient}
                    title="Deseleccionar cliente"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {selectedClient && (
                <div className="crearVenta-client-info">
                  <div>
                    <b>Correo:</b> {selectedClient.correo}
                  </div>
                  <div>
                    <b>Documento:</b> {selectedClient.documento}
                  </div>
                  <div>
                    <b>Teléfono:</b> {selectedClient.telefono}
                  </div>
                </div>
              )}
            </div>
            {selectedClient && (
              <div className="crearVenta-form-group">
                <label className="crearVenta-label">Vehículo del Cliente</label>
                <div className="crearVenta-input-with-actions">
                  <input
                    type="text"
                    className="crearVenta-form-input"
                    value={selectedVehiculo ? `${selectedVehiculo.placa}` : ""}
                    readOnly
                    onClick={() => setShowVehiculoClienteModal(true)}
                    placeholder="Seleccione un vehículo"
                  />
                  {selectedVehiculo && (
                    <button
                      type="button"
                      className="crearVenta-deselect-button"
                      onClick={deselectVehiculo}
                      title="Deseleccionar vehículo"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="crearVenta-form-group">
              <label className="crearVenta-label">Mecánico</label>
              <div className="crearVenta-input-with-actions">
                <input
                  type="text"
                  className="crearVenta-form-input"
                  value={selectedMecanico ? `${selectedMecanico.nombre} ${selectedMecanico.apellido}` : ""}
                  readOnly
                  onClick={() => setShowMecanicoModal(true)}
                  placeholder="Seleccione un mecánico"
                />
                {selectedMecanico && (
                  <button
                    type="button"
                    className="crearVenta-deselect-button"
                    onClick={deselectMecanico}
                    title="Deseleccionar mecánico"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Sección de productos/servicios --- */}
        <div className="crearVenta-cart-main-section">
          <div className="crearVenta-cart-header">
            <h3 className="crearVenta-cart-title-clickable">
              <ShoppingBag className="crearVenta-cart-icon" />
              Carrito
            </h3>
          </div>
          <div className="crearVenta-cart-content">
            {/* Columna Izquierda: Tabs, búsqueda y listado */}
            <div className="crearVenta-search-section">
              <div className="crearVenta-form-section">
                <div className="crearVenta-tabs">
                  <button
                    className={`crearVenta-tab-btn${activeTab === "productos" ? " active" : ""}`}
                    onClick={() => setActiveTab("productos")}
                    type="button"
                  >
                    <Package size={16} /> Productos
                  </button>
                  <button
                    className={`crearVenta-tab-btn${activeTab === "servicios" ? " active" : ""}`}
                    onClick={() => setActiveTab("servicios")}
                    type="button"
                  >
                    <Wrench size={16} /> Servicios
                  </button>
                </div>
                <div className="crearVenta-search-container">
                  <Search className="crearVenta-search-icon" />
                  <input
                    type="text"
                    placeholder={`Buscar ${activeTab === "productos" ? "productos" : "servicios"}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="crearVenta-search-input"
                  />
                </div>
                {(activeTab === "productos" ? loadingProducts : loadingServices) ? (
                  <div className="crearVenta-no-results">
                    <Loader className="spinning" /> Cargando...
                  </div>
                ) : searchTerm.trim() ? (
                  <div className={activeTab === "productos" ? "crearVenta-product-list" : "crearVenta-service-list"}>
                    {currentItems.length === 0 ? (
                      <div className="crearVenta-no-results">
                        <AlertTriangle className="crearVenta-no-results-icon" />
                        <p>No se encontraron {activeTab === "productos" ? "productos" : "servicios"}</p>
                      </div>
                    ) : (
                      <>
                        {currentItems.map((item) => {
                          const values = inputValues[item.id] || {}
                          const cantidad = values.cantidad ?? 1
                          const precio =
                            activeTab === "productos"
                              ? (values.precio ?? item.precio_venta ?? 0)
                              : (values.precio ?? item.precio ?? 0)
                          return (
                            <div key={item.id} className="crearVenta-card-compact">
                              <div className="crearVenta-card-header-compact">
                                <div className="crearVenta-card-info-compact">
                                  <h4 className="crearVenta-card-name-compact">{item.nombre}</h4>
                                  <div className="crearVenta-card-details-compact">
                                    {activeTab === "productos" && (
                                      <span className="crearVenta-card-stock-compact">Stock: {item.cantidad || 0}</span>
                                    )}
                                  </div>
                                  {item.descripcion && (
                                    <span className="crearVenta-card-description-compact">{item.descripcion}</span>
                                  )}
                                </div>
                              </div>
                              <div className="crearVenta-card-inputs-row">
                                {activeTab === "productos" && (
                                  <div className="crearVenta-input-compact">
                                    <label>Cant.</label>
                                    <input
                                      type="number"
                                      className="crearVenta-input-field-compact"
                                      min="1"
                                      value={cantidad === undefined ? "" : cantidad}
                                      onChange={(e) =>
                                        handleInputChange2(
                                          item.id,
                                          "cantidad",
                                          e.target.value === "" ? "" : Number.parseInt(e.target.value),
                                        )
                                      }
                                      onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                                      placeholder="1"
                                    />
                                    {inputErrors[item.id]?.cantidad && (
                                      <span className="crearVenta-error-hint">{inputErrors[item.id].cantidad}</span>
                                    )}
                                  </div>
                                )}
                                <div className="crearVenta-input-compact">
                                  <label>Precio</label>
                                  <input
                                    type="number"
                                    className="crearVenta-input-field-compact crearVenta-readonly"
                                    min="0"
                                    step="0.01"
                                    value={precio === undefined ? "" : precio}
                                    readOnly
                                    disabled
                                    placeholder="0"
                                  />
                                  {inputErrors[item.id]?.precio && (
                                    <span className="crearVenta-error-hint">{inputErrors[item.id].precio}</span>
                                  )}
                                </div>
                                <div className="crearVenta-input-compact">
                                  <label>Subtotal</label>
                                  <input
                                    type="text"
                                    className="crearVenta-input-field-compact crearVenta-readonly"
                                    value={formatCurrency(precio * (activeTab === "productos" ? cantidad : 1))}
                                    readOnly
                                    tabIndex={-1}
                                  />
                                </div>
                                <div className="crearVenta-add-button-container">
                                  <button
                                    type="button"
                                    className="crearVenta-add-button-compact"
                                    onClick={() => handleAddItem(item, cantidad, precio)}
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {totalPages > 1 && (
                          <div className="crearVenta-pagination">
                            <button
                              type="button"
                              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="crearVenta-pagination-button"
                            >
                              <ChevronLeft size={16} /> Anterior
                            </button>
                            <span className="crearVenta-page-info">
                              Página {currentPage} de {totalPages} (
                              {activeTab === "productos" ? filteredProducts.length : filteredServices.length}{" "}
                              encontrados)
                            </span>
                            <button
                              type="button"
                              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="crearVenta-pagination-button"
                            >
                              Siguiente <ChevronRight size={16} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="crearVenta-no-results">
                    <Search className="crearVenta-no-results-icon" />
                    <p>Escriba el nombre del {activeTab === "productos" ? "producto" : "servicio"} que desea buscar</p>
                  </div>
                )}
              </div>
            </div>
            {/* Columna Derecha: Carrito */}
            <div className="crearVenta-selected-items-section">
              {cartItems.length > 0 ? (
                <div className="crearVenta-form-section">
                  <div className="crearVenta-items-header">
                    <h4>
                      <ShoppingBag size={16} /> Productos y Servicios Seleccionados
                    </h4>
                    <span className="crearVenta-items-count">{cartItems.length} item(s)</span>
                  </div>
                  <div className="crearVenta-item-cards">
                    {currentCartItems.map((item) => (
                      <div
                        key={item.id + item.type}
                        className={`crearVenta-item-card-selected${item.type === "servicio" ? " service" : ""}`}
                      >
                        <div className="crearVenta-item-card-header">
                          <h4 className="crearVenta-item-name">
                            {item.nombre}
                            {item.type === "servicio" && (
                              <span style={{ marginLeft: 8, color: "#2563eb", fontWeight: 600 }}>(Servicio)</span>
                            )}
                          </h4>
                          <div className="crearVenta-item-actions">
                            <button
                              type="button"
                              className="crearVenta-remove-button"
                              onClick={() => removeCartItem(item.id, item.type)}
                              title="Eliminar"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="crearVenta-item-card-details">
                          <div className="crearVenta-item-info-grid">
                            {item.type === "producto" ? (
                              <>
                                <div className="crearVenta-info-item">
                                  <span className="crearVenta-info-label">Precio:</span>
                                  <div className="crearVenta-editable-field">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.price}
                                      readOnly
                                      disabled
                                      className="crearVenta-inline-input crearVenta-readonly"
                                    />
                                  </div>
                                </div>
                                <div className="crearVenta-info-item">
                                  <span className="crearVenta-info-label">Cantidad:</span>
                                  <div className="crearVenta-quantity-controls">
                                    <input
                                      type="number"
                                      min="1"
                                      max={item.stockOriginal}
                                      value={item.quantity === 0 ? "" : item.quantity}
                                      style={{
                                        width: 50,
                                        fontWeight: 600,
                                        color: "#2563eb",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: 6,
                                        padding: "2px 6px",
                                        textAlign: "center",
                                      }}
                                      onChange={(e) => {
                                        const value = e.target.value
                                        updateCartItemQuantity(item.id, value === "" ? "" : Number(value))
                                      }}
                                      onBlur={(e) => {
                                        const value = e.target.value
                                        updateCartItemQuantity(
                                          item.id,
                                          value === "" || Number(value) < 1
                                            ? 1
                                            : Number(value) > item.stockOriginal
                                              ? item.stockOriginal
                                              : Number(value),
                                        )
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="crearVenta-info-item crearVenta-subtotal-item">
                                  <span className="crearVenta-info-label">Subtotal:</span>
                                  <span className="crearVenta-subtotal">
                                    {formatCurrency(item.price * item.quantity)}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="crearVenta-info-item">
                                  <span className="crearVenta-info-label">Descripción:</span>
                                  <span className="crearVenta-info-value">{item.descripcion || "Sin descripción"}</span>
                                </div>
                                <div className="crearVenta-info-item crearVenta-subtotal-item">
                                  <span className="crearVenta-info-label">Precio:</span>
                                  <input
                                    type="number"
                                    value={item.precio}
                                    readOnly
                                    disabled
                                    className="crearVenta-inline-input crearVenta-readonly"
                                    style={{ width: 90 }}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          {item.type === "producto" && (
                            <div className="crearVenta-stock-info">
                              <small className="text-gray-600">Stock disponible: {item.stockOriginal} unidades</small>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {cartTotalPages > 1 && (
                    <div className="crearVenta-pagination">
                      <button
                        type="button"
                        onClick={() => setCartCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={cartCurrentPage === 1}
                        className="crearVenta-pagination-button"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="crearVenta-page-info">
                        {cartCurrentPage} / {cartTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCartCurrentPage((prev) => Math.min(prev + 1, cartTotalPages))}
                        disabled={cartCurrentPage === cartTotalPages}
                        className="crearVenta-pagination-button"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                  <div className="crearVenta-total-section">
                    <div className="crearVenta-total-card">
                      <span className="crearVenta-total-label">Total de la Venta:</span>
                      <span className="crearVenta-total-amount">{formatCurrency(total)}</span>
                    </div>
                  </div>
                  <div className="crearVenta-form-actions">
                    <button
                      type="button"
                      className="crearVenta-cancel-button"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      <X className="crearVenta-button-icon" />
                      Cancelar
                    </button>
                    <button type="submit" className="crearVenta-submit-button" disabled={isSubmitting || apiLoading}>
                      {isSubmitting ? (
                        <>
                          <Loader className="crearVenta-button-icon spinning" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="crearVenta-button-icon" />
                          Guardar Venta
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="crearVenta-form-section">
                  <div className="crearVenta-empty-cart">
                    <ShoppingBag className="crearVenta-empty-cart-icon" />
                    <h4>Carrito vacío</h4>
                    <p>Busca y agrega productos o servicios para comenzar tu venta</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Modales */}
      {showClientModal && (
        <ClientModal closeModal={() => setShowClientModal(false)} selectClient={selectClient} clientes={clientes} />
      )}
      {showVehiculoClienteModal && selectedClient && (
        <VehiculoClienteModal
          closeModal={() => setShowVehiculoClienteModal(false)}
          clienteId={selectedClient.id}
          selectVehiculo={selectVehiculo}
          vehiculosCliente={vehiculosCliente}
        />
      )}
      {showMecanicoModal && (
        <MecanicoModal
          closeModal={() => setShowMecanicoModal(false)}
          selectMecanico={selectMecanico}
          mecanicos={mecanicos}
        />
      )}

      {/* Modal para cita programada */}
      {showCitaModal && citaProgramada && (
        <div className="crearCompra-supplier-modal-overlay">
          <div className="crearCompra-supplier-modal">
            <div className="crearCompra-supplier-modal-header">
              <h2>
                <Calendar className="crearCompra-modal-icon" />
                Cita Programada Encontrada
              </h2>
              <button
                type="button"
                className="crearCompra-supplier-close-button"
                onClick={() => setShowCitaModal(false)}
              >
                <X />
              </button>
            </div>
            <div className="crearCompra-supplier-modal-content">
              <div style={{ padding: "20px", textAlign: "left" }}>
                <p style={{ marginBottom: "10px" }}>
                  <b>Fecha:</b> {citaProgramada.fecha?.substring(0, 10)} {citaProgramada.hora}
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <b>Vehículo:</b> {citaProgramada.vehiculo_placa || "No especificado"}
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <b>Marca:</b> {citaProgramada.marca_nombre || "No especificada"}
                </p>
                <p style={{ marginBottom: "20px" }}>
                  <b>Observaciones:</b> {citaProgramada.observaciones || "Sin observaciones"}
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button
                    className="crearCompra-supplier-select-button"
                    onClick={() => {
                      // Llenar ambos estados: selectedVehiculo y formData
                      const vehiculoObj = {
                        id: citaProgramada.vehiculo_id,
                        placa: citaProgramada.vehiculo_placa,
                        marca_nombre: citaProgramada.marca_nombre || "",
                      }
                      const mecanicoObj = {
                        id: citaProgramada.mecanico_id,
                        nombre: citaProgramada.mecanico_nombre,
                        apellido: citaProgramada.mecanico_apellido,
                      }
                      setSelectedVehiculo(vehiculoObj)
                      setSelectedMecanico(mecanicoObj)
                      setFormData((prev) => ({
                        ...prev,
                        vehiculo_id: citaProgramada.vehiculo_id,
                        mecanico_id: citaProgramada.mecanico_id,
                        cita_id: citaProgramada.id,
                      }))
                      setShowCitaModal(false)
                    }}
                  >
                    <CheckCircle /> Usar datos de la cita
                  </button>
                  <button
                    className="crearCompra-supplier-pagination-button"
                    onClick={() => {
                      setShowCitaModal(false)
                      setCitaProgramada(null)
                    }}
                  >
                    Ignorar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Modales Cliente/Vehículo/Mecánico ---

const ClientModal = ({ closeModal, selectClient, clientes }) => {
  const { makeRequest, loading, error } = useApi()
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  console.log("CLIENTES EN MODAL:", clientes)

  const filteredClientes = search.trim()
    ? clientes.filter(
        (c) =>
          (c.nombre && c.nombre.toLowerCase().includes(search.toLowerCase())) ||
          (c.apellido && c.apellido.toLowerCase().includes(search.toLowerCase())) ||
          (c.documento && c.documento.toString().toLowerCase().includes(search.toLowerCase())),
      )
    : clientes

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredClientes.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage)

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), [])

  const handleSelectClient = useCallback(
    async (cliente) => {
      selectClient(cliente)
      await Swal.fire({
        icon: "success",
        title: "Cliente seleccionado",
        text: `${cliente.nombre} ${cliente.apellido} ha sido seleccionado`,
        timer: 1500,
        showConfirmButton: false,
      })
    },
    [selectClient],
  )

  if (loading) {
    return (
      <div className="crearCompra-supplier-modal-overlay">
        <div className="crearCompra-supplier-modal">
          <div className="crearCompra-supplier-modal-header">
            <h2>
              <Loader className="spinning" /> Cargando clientes...
            </h2>
            <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
              <X />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="crearCompra-supplier-modal-overlay">
        <div className="crearCompra-supplier-modal">
          <div className="crearCompra-supplier-modal-header">
            <h2>
              <AlertTriangle /> Error
            </h2>
            <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
              <X />
            </button>
          </div>
          <div className="crearCompra-supplier-modal-content">
            <div className="crearCompra-error-message">
              <p>{error}</p>
              <button className="crearCompra-retry-button" onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="crearCompra-supplier-modal-overlay">
      <div className="crearCompra-supplier-modal">
        <div className="crearCompra-supplier-modal-header">
          <h2>
            <User className="crearCompra-modal-icon" />
            Seleccionar Cliente
          </h2>
          <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
            <X />
          </button>
        </div>
        <div className="crearCompra-supplier-modal-content">
          <div className="crearCompra-supplier-search-container">
            <Search className="crearCompra-supplier-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o documento..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="crearCompra-supplier-search-input"
            />
          </div>
          {currentItems.length === 0 ? (
            <div className="crearCompra-no-results">
              <AlertTriangle className="crearCompra-no-results-icon" />
              <p>No se encontraron clientes</p>
            </div>
          ) : (
            <>
              <div className="crearCompra-supplier-table-container">
                <table className="crearCompra-supplier-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Documento</th>
                      <th>Correo</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((cliente) => (
                      <tr key={cliente.id}>
                        <td>{cliente.nombre}</td>
                        <td>{cliente.apellido}</td>
                        <td>{cliente.documento}</td>
                        <td>{cliente.correo}</td>
                        <td>
                          <button
                            className="crearCompra-supplier-select-button"
                            onClick={() => handleSelectClient(cliente)}
                          >
                            <CheckCircle size={16} />
                            Seleccionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="crearCompra-supplier-pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="crearCompra-supplier-pagination-button"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="crearCompra-supplier-page-info">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="crearCompra-supplier-pagination-button"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const VehiculoClienteModal = ({ closeModal, clienteId, selectVehiculo, vehiculosCliente }) => {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  console.log("VEHÍCULOS EN MODAL:", vehiculosCliente)

  const filteredVehiculos = search.trim()
    ? vehiculosCliente.filter(
        (v) =>
          (v.placa && v.placa.toLowerCase().includes(search.toLowerCase())) ||
          (v.marca_nombre && v.marca_nombre.toLowerCase().includes(search.toLowerCase())),
      )
    : vehiculosCliente

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredVehiculos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredVehiculos.length / itemsPerPage)

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), [])

  const handleSelectVehiculo = useCallback(
    async (vehiculo) => {
      selectVehiculo(vehiculo)
      await Swal.fire({
        icon: "success",
        title: "Vehículo seleccionado",
        text: `Vehículo con placa ${vehiculo.placa} ha sido seleccionado`,
        timer: 1500,
        showConfirmButton: false,
      })
    },
    [selectVehiculo],
  )

  return (
    <div className="crearCompra-supplier-modal-overlay">
      <div className="crearCompra-supplier-modal">
        <div className="crearCompra-supplier-modal-header">
          <h2>
            <Car className="crearCompra-modal-icon" />
            Seleccionar Vehículo
          </h2>
          <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
            <X />
          </button>
        </div>

        <div className="crearCompra-supplier-modal-content">
          <div className="crearCompra-supplier-search-container">
            <Search className="crearCompra-search-icon" />
            <input
              type="text"
              placeholder="Buscar por placa o marca..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="crearCompra-supplier-search-input"
            />
          </div>

          <div className="crearCompra-suppliers-list">
            {currentItems.length === 0 ? (
              <div className="crearCompra-supplier-no-results">
                <AlertTriangle className="crearCompra-no-results-icon" />
                <p>{search ? "No se encontraron vehículos" : "No hay vehículos disponibles para este cliente"}</p>
              </div>
            ) : (
              <table className="crearCompra-suppliers-table">
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Marca</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((vehiculo) => (
                    <tr key={vehiculo.id} className="crearCompra-supplier-row">
                      <td>
                        <div className="crearCompra-supplier-name">{vehiculo.placa || "Sin placa"}</div>
                      </td>
                      <td>{vehiculo.marca_nombre || "Sin marca"}</td>
                      <td>
                        <button
                          type="button"
                          className="crearCompra-supplier-select-button"
                          onClick={() => handleSelectVehiculo(vehiculo)}
                        >
                          <CheckCircle /> Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="crearCompra-supplier-pagination">
              <button
                onClick={() => paginate(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="crearCompra-supplier-pagination-button"
              >
                Anterior
              </button>

              <span className="crearCompra-supplier-page-info">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="crearCompra-supplier-pagination-button"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const MecanicoModal = ({ closeModal, selectMecanico, mecanicos }) => {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  console.log("MECÁNICOS EN MODAL:", mecanicos)

  const filteredMecanicos = search.trim()
    ? mecanicos.filter(
        (m) =>
          (m.nombre && m.nombre.toLowerCase().includes(search.toLowerCase())) ||
          (m.apellido && m.apellido.toLowerCase().includes(search.toLowerCase())) ||
          (m.documento && m.documento.toString().toLowerCase().includes(search.toLowerCase())),
      )
    : mecanicos

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredMecanicos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredMecanicos.length / itemsPerPage)

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), [])

  const handleSelectMecanico = useCallback(
    async (mecanico) => {
      selectMecanico(mecanico)
      await Swal.fire({
        icon: "success",
        title: "Mecánico seleccionado",
        text: `${mecanico.nombre} ${mecanico.apellido} ha sido seleccionado`,
        timer: 1500,
        showConfirmButton: false,
      })
    },
    [selectMecanico],
  )

  return (
    <div className="crearCompra-supplier-modal-overlay">
      <div className="crearCompra-supplier-modal">
        <div className="crearCompra-supplier-modal-header">
          <h2>
            <Wrench className="crearCompra-modal-icon" />
            Seleccionar Mecánico
          </h2>
          <button type="button" className="crearCompra-supplier-close-button" onClick={closeModal}>
            <X />
          </button>
        </div>
        <div className="crearCompra-supplier-modal-content">
          <div className="crearCompra-supplier-search-container">
            <Search className="crearCompra-supplier-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o documento..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="crearCompra-supplier-search-input"
            />
          </div>
          {currentItems.length === 0 ? (
            <div className="crearCompra-no-results">
              <AlertTriangle className="crearCompra-no-results-icon" />
              <p>No se encontraron mecánicos</p>
            </div>
          ) : (
            <>
              <div className="crearCompra-supplier-table-container">
                <table className="crearCompra-supplier-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Documento</th>
                      <th>Especialidad</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((mecanico) => (
                      <tr key={mecanico.id}>
                        <td>{mecanico.nombre}</td>
                        <td>{mecanico.apellido}</td>
                        <td>{mecanico.documento}</td>
                        <td>{mecanico.especialidad || "Sin especialidad"}</td>
                        <td>
                          <button
                            className="crearCompra-supplier-select-button"
                            onClick={() => handleSelectMecanico(mecanico)}
                          >
                            <CheckCircle size={16} />
                            Seleccionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="crearCompra-supplier-pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="crearCompra-supplier-pagination-button"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="crearCompra-supplier-page-info">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="crearCompra-supplier-pagination-button"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CrearVenta

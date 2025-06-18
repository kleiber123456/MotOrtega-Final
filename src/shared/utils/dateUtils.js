// Utilidades para manejo de fechas con zona horaria de Bogotá

/**
 * Obtiene la fecha actual en zona horaria de Bogotá
 */
export const getFechaBogota = () => {
  const now = new Date()
  const bogotaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }))
  return bogotaTime
}

/**
 * Formatea una fecha para input date (YYYY-MM-DD)
 */
export const formatearFechaParaInput = (fecha) => {
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, "0")
  const day = String(fecha.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Calcula el día de la semana para una fecha dada
 */
export const calcularDiaSemana = (fechaStr) => {
  if (!fechaStr) return ""

  try {
    // Manejar tanto fechas ISO completas como fechas simples
    let fecha
    if (fechaStr.includes("T")) {
      // Fecha completa ISO (2025-06-19T00:00:00.000Z)
      fecha = new Date(fechaStr)
    } else {
      // Solo fecha (2025-06-19)
      fecha = new Date(fechaStr + "T12:00:00")
    }

    if (isNaN(fecha.getTime())) {
      console.error("Fecha inválida:", fechaStr)
      return ""
    }

    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    return diasSemana[fecha.getDay()]
  } catch (error) {
    console.error("Error al calcular día de la semana:", error)
    return ""
  }
}

/**
 * Formatea una fecha para mostrar en la interfaz
 */
export const formatearFechaParaMostrar = (fechaStr) => {
  if (!fechaStr) return ""

  try {
    // Agregar hora del mediodía para evitar problemas de zona horaria
    const fecha = new Date(fechaStr + "T12:00:00")
    return fecha.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return fechaStr
  }
}

/**
 * Formatea una fecha simple para mostrar (DD/MM/YYYY)
 */
export const formatearFechaSimple = (fechaStr) => {
  if (!fechaStr) return ""

  try {
    let fecha
    if (fechaStr.includes("T")) {
      // Fecha completa ISO
      fecha = new Date(fechaStr)
    } else {
      // Solo fecha
      fecha = new Date(fechaStr + "T12:00:00")
    }

    if (isNaN(fecha.getTime())) {
      return "Fecha inválida"
    }

    return fecha.toLocaleDateString("es-ES")
  } catch (error) {
    console.error("Error al formatear fecha simple:", error)
    return "Fecha inválida"
  }
}

/**
 * Verifica si una fecha es pasada
 */
export const esFechaPasada = (fechaStr) => {
  if (!fechaStr) return false

  try {
    const fechaHorario = new Date(fechaStr + "T12:00:00")
    const hoy = getFechaBogota()
    hoy.setHours(0, 0, 0, 0)
    return fechaHorario < hoy
  } catch (error) {
    console.error("Error al verificar fecha pasada:", error)
    return false
  }
}

/**
 * Obtiene la fecha mínima permitida (3 días antes de hoy)
 */
export const getFechaMinima = () => {
  const hoyBogota = getFechaBogota()
  const fechaMinima = new Date(hoyBogota)
  fechaMinima.setDate(fechaMinima.getDate() - 3)
  return formatearFechaParaInput(fechaMinima)
}

/**
 * Extrae solo la parte de fecha de un string de fecha-hora
 */
export const extraerSoloFecha = (fechaCompleta) => {
  if (!fechaCompleta) return ""

  try {
    // Si es fecha ISO completa, extraer solo la parte de fecha
    if (fechaCompleta.includes("T")) {
      return fechaCompleta.split("T")[0]
    }
    // Si ya es solo fecha, devolverla tal como está
    return fechaCompleta
  } catch (error) {
    console.error("Error al extraer fecha:", error)
    return fechaCompleta
  }
}

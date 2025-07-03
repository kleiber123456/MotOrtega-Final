import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Función principal para generar PDF de factura compacta (compras y ventas)
export const generarFacturaPDF = async (documento, clienteOProveedor, detallesConProductos, token) => {
  try {
    const doc = new jsPDF()
    const esVenta = documento.tipo === "venta"

    // Configuración de colores en escala de grises
    const colorNegro = [0, 0, 0]
    const colorGrisOscuro = [64, 64, 64]
    const colorGrisMedio = [128, 128, 128]
    const colorGrisClaro = [245, 245, 245]

    // ===== ENCABEZADO COMPACTO =====

    // Línea superior
    doc.setDrawColor(...colorNegro)
    doc.setLineWidth(1)
    doc.line(20, 15, 190, 15)

    // Nombre de empresa compacto
    doc.setTextColor(...colorNegro)
    doc.setFontSize(18)
    doc.setFont(undefined, "bold")
    doc.text("MOTORTEGA S.A.S.", 20, 25)

    // Info empresa en una línea
    doc.setFontSize(8)
    doc.setFont(undefined, "normal")
    doc.setTextColor(...colorGrisOscuro)
    doc.text("Calle 73 N°67-27 | Tel: 313 806 07 10", 20, 31)

    // Título del documento compacto
    doc.setDrawColor(...colorNegro)
    doc.setLineWidth(0.5)
    doc.rect(140, 18, 50, 18)

    const prefijo = esVenta ? "FV" : "OC"
    const tituloDocumento = esVenta ? "FACTURA DE VENTA" : "ORDEN DE COMPRA"
    doc.setTextColor(...colorNegro)
    doc.setFontSize(12)
    doc.setFont(undefined, "bold")
    doc.text(tituloDocumento, 165, 25, { align: "center" })
    doc.setFontSize(10)
    doc.text(`${prefijo}-${documento.id.toString().padStart(6, "0")}`, 165, 32, { align: "center" })

    // ===== INFORMACIÓN BÁSICA =====

    let yPos = 45

    // Fecha y estado en línea compacta
    doc.setTextColor(...colorNegro)
    doc.setFontSize(9)
    doc.setFont(undefined, "bold")
    doc.text("Fecha:", 20, yPos)
    doc.setFont(undefined, "normal")
    doc.text(new Date(documento.fecha).toLocaleDateString("es-CO"), 35, yPos)

    doc.setFont(undefined, "bold")
    doc.text("Estado:", 100, yPos)
    doc.setFont(undefined, "normal")
    const estado = esVenta ? documento.estado || "Pendiente" : documento.estado
    doc.text(estado, 120, yPos)

    // ===== CLIENTE/PROVEEDOR COMPACTO =====

    yPos += 12

    doc.setFillColor(...colorGrisClaro)
    doc.rect(20, yPos - 2, 170, 18, "F")
    doc.setDrawColor(...colorGrisMedio)
    doc.setLineWidth(0.3)
    doc.rect(20, yPos - 2, 170, 18)

    doc.setTextColor(...colorNegro)
    doc.setFontSize(9)
    doc.setFont(undefined, "bold")
    const tituloSeccion = esVenta ? "CLIENTE:" : "PROVEEDOR:"
    doc.text(tituloSeccion, 22, yPos + 3)

    yPos += 8
    doc.setFont(undefined, "normal")
    doc.setFontSize(8)

    if (clienteOProveedor) {
      doc.text(`${clienteOProveedor.nombre || "N/A"}`, 22, yPos)

      if (esVenta) {
        doc.text(`Email: ${clienteOProveedor.correo || "N/A"}`, 100, yPos)
        yPos += 5
        doc.text(`Tel: ${clienteOProveedor.telefono || "N/A"}`, 22, yPos)
        doc.text(`Dir: ${clienteOProveedor.direccion || "N/A"}`, 100, yPos)
      } else {
        doc.text(`NIT: ${clienteOProveedor.nit || "N/A"}`, 100, yPos)
        yPos += 5
        doc.text(`${clienteOProveedor.correo || "N/A"}`, 22, yPos)
        doc.text(`Tel: ${clienteOProveedor.telefono || "N/A"}`, 100, yPos)
      }
    } else {
      doc.text("Información no disponible", 22, yPos)
    }

    // ===== TABLA COMPACTA ALINEADA =====

    yPos += 15

    if (detallesConProductos && detallesConProductos.length > 0) {
      const tableColumn = ["#", "Descripción", "Cant", "Precio", "Total"]
      const tableRows = []

      detallesConProductos.forEach((detalle, index) => {
        // Obtener descripción según el tipo de documento
        let descripcion = ""
        let cantidad = 0
        let precio = 0
        let subtotal = 0

        if (esVenta) {
          // Para ventas, puede ser servicio o repuesto
          if (detalle.repuesto_nombre) {
            // Es un repuesto
            descripcion = detalle.repuesto_nombre
            cantidad = detalle.cantidad || 1
            precio = detalle.repuesto_precio || 0
            subtotal = detalle.subtotal || 0
          } else if (detalle.nombre) {
            // Es un servicio
            descripcion = detalle.nombre
            cantidad = 1
            precio = detalle.subtotal || 0
            subtotal = detalle.subtotal || 0
          } else {
            descripcion = `Item ${index + 1}`
            cantidad = 1
            precio = detalle.subtotal || 0
            subtotal = detalle.subtotal || 0
          }
        } else {
          // Para compras
          descripcion = detalle.nombre_repuesto || `Repuesto ${detalle.repuesto_id}`
          cantidad = detalle.cantidad || 0
          precio = detalle.precio || detalle.precio_compra || 0
          subtotal = detalle.subtotal || 0
        }

        // Truncar descripción si es muy larga
        if (descripcion.length > 35) {
          descripcion = descripcion.substring(0, 32) + "..."
        }

        const productoData = [
          (index + 1).toString(),
          descripcion,
          cantidad.toString(),
          formatearPrecio(precio),
          formatearPrecio(subtotal),
        ]
        tableRows.push(productoData)
      })

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [180, 180, 180],
          lineWidth: 0.2,
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [230, 230, 230],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 12 },
          1: { halign: "left", cellWidth: 70, fontSize: 7 },
          2: { halign: "center", cellWidth: 15 },
          3: { halign: "right", cellWidth: 35 },
          4: { halign: "right", cellWidth: 35 },
        },
        // CLAVE: Alinear exactamente con la sección del cliente/proveedor
        margin: { left: 20, right: 20 },
        tableWidth: 170, // Mismo ancho que la sección del cliente/proveedor
      })

      // ===== TOTAL PERFECTAMENTE ALINEADO =====

      const finalY = doc.lastAutoTable.finalY + 8

      // Marco alineado exactamente con las últimas dos columnas de la tabla
      // Posición calculada: 20 (margen) + 12 (col #) + 70 (col desc) + 15 (col cant) = 117
      doc.setDrawColor(...colorNegro)
      doc.setLineWidth(0.5)
      doc.rect(117, finalY, 70, 15) // Exactamente alineado con columnas Precio + Total

      doc.setTextColor(...colorNegro)
      doc.setFontSize(10)
      doc.setFont(undefined, "bold")
      doc.text("TOTAL:", 122, finalY + 7)
      doc.text(formatearPrecio(documento.total), 182, finalY + 7, { align: "right" })

      doc.setFontSize(7)
      doc.setFont(undefined, "normal")
      doc.setTextColor(...colorGrisMedio)
      doc.text("(Pesos Colombianos)", 122, finalY + 12)

      // ===== TÉRMINOS MÍNIMOS =====

      const termY = finalY + 25

      doc.setTextColor(...colorGrisOscuro)
      doc.setFontSize(7)
      doc.setFont(undefined, "normal")

      if (esVenta) {
        doc.text("• Servicios y productos sujetos a garantía • Precios incluyen impuestos vigentes", 20, termY)
        doc.text("• Válido por 30 días • Para reclamos presentar esta factura", 20, termY + 4)
      } else {
        doc.text("• Productos sujetos a especificaciones técnicas • Entrega según tiempo acordado", 20, termY)
        doc.text("• Precios incluyen impuestos vigentes • Modificaciones requieren autorización escrita", 20, termY + 4)
      }
    } else {
      doc.setTextColor(...colorGrisOscuro)
      doc.setFontSize(10)
      const mensajeVacio = esVenta ? "No hay productos o servicios en esta venta" : "No hay productos en esta orden"
      doc.text(mensajeVacio, 20, yPos)
    }

    // ===== PIE DE PÁGINA MÍNIMO =====

    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)

      const footerY = doc.internal.pageSize.height - 20

      // Línea superior
      doc.setDrawColor(...colorGrisMedio)
      doc.setLineWidth(0.3)
      doc.line(20, footerY, 190, footerY)

      // Info mínima del pie
      doc.setTextColor(...colorGrisMedio)
      doc.setFontSize(6)
      doc.setFont(undefined, "normal")

      doc.text("MotOrtega. | www.motortega.com", 20, footerY + 5)
      doc.text(`Pág. ${i}/${pageCount}`, 105, footerY + 5, { align: "center" })
      doc.text(
        `${new Date().toLocaleDateString("es-CO")} ${new Date().toLocaleTimeString("es-CO")}`,
        190,
        footerY + 5,
        { align: "right" },
      )
    }

    // Guardar con nombre según el tipo
    doc.save(`${prefijo}-${documento.id.toString().padStart(6, "0")}.pdf`)

    return true
  } catch (error) {
    console.error("Error al generar PDF:", error)
    throw error
  }
}

// Función auxiliar para formatear precios
const formatearPrecio = (precio) => {
  if (!precio) return "$0.00"
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
  }).format(precio)
}

// Función para cargar datos completos de una venta
export const cargarDatosCompletosVenta = async (ventaId, token) => {
  try {
    console.log("=== INICIANDO CARGA DE DATOS PARA PDF DE VENTA ===")
    console.log("Venta ID:", ventaId)

    // Cargar detalles de la venta
    const responseVenta = await fetch(`https://api-final-8rw7.onrender.com/api/ventas/${ventaId}`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    })

    if (!responseVenta.ok) {
      throw new Error("Error al cargar los detalles de la venta")
    }

    const dataVenta = await responseVenta.json()
    console.log("Datos de venta para PDF:", dataVenta)

    // Procesar repuestos para asegurar que tengan nombres correctos
    if (dataVenta.repuestos && Array.isArray(dataVenta.repuestos)) {
      console.log("Procesando", dataVenta.repuestos.length, "repuestos para PDF...")

      const repuestosEnriquecidos = []

      for (let i = 0; i < dataVenta.repuestos.length; i++) {
        const repuesto = dataVenta.repuestos[i]
        console.log(`=== PROCESANDO REPUESTO ${i + 1} PARA PDF ===`)
        console.log("Repuesto original:", repuesto)

        try {
          let nombreRepuesto = repuesto.repuesto_nombre || `Repuesto ID: ${repuesto.repuesto_id}`
          let descripcionRepuesto = repuesto.repuesto_descripcion || ""
          let precioRepuesto = repuesto.repuesto_precio || 0

          // Si no tenemos el nombre del repuesto, intentar cargarlo
          if (!repuesto.repuesto_nombre && repuesto.repuesto_id) {
            console.log(`Cargando datos del repuesto ID: ${repuesto.repuesto_id}`)

            try {
              const responseRepuesto = await fetch(
                `https://api-final-8rw7.onrender.com/api/repuestos/${repuesto.repuesto_id}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: token,
                  },
                },
              )

              console.log(`Respuesta API repuesto ${repuesto.repuesto_id}:`, responseRepuesto.status)

              if (responseRepuesto.ok) {
                const dataRepuesto = await responseRepuesto.json()
                console.log(`Datos del repuesto ${repuesto.repuesto_id}:`, dataRepuesto)

                nombreRepuesto = dataRepuesto.nombre || nombreRepuesto
                descripcionRepuesto = dataRepuesto.descripcion || descripcionRepuesto
                // Usar el precio de venta del repuesto si no tenemos precio en la venta
                if (!precioRepuesto) {
                  precioRepuesto = dataRepuesto.precio_venta || dataRepuesto.preciounitario || 0
                }
              } else {
                const errorText = await responseRepuesto.text()
                console.warn(`Error al cargar repuesto ${repuesto.repuesto_id}:`, responseRepuesto.status, errorText)
              }
            } catch (repuestoError) {
              console.error(`Error de red al cargar repuesto ${repuesto.repuesto_id}:`, repuestoError)
            }
          }

          const repuestoEnriquecido = {
            ...repuesto,
            repuesto_nombre: nombreRepuesto,
            repuesto_descripcion: descripcionRepuesto,
            repuesto_precio: precioRepuesto,
          }

          console.log(`Repuesto ${i + 1} enriquecido:`, repuestoEnriquecido)
          repuestosEnriquecidos.push(repuestoEnriquecido)
        } catch (error) {
          console.error(`Error al procesar repuesto ${i + 1}:`, error)
          repuestosEnriquecidos.push({
            ...repuesto,
            repuesto_nombre: repuesto.repuesto_nombre || `Repuesto ID: ${repuesto.repuesto_id}`,
            repuesto_descripcion: repuesto.repuesto_descripcion || "",
            repuesto_precio: repuesto.repuesto_precio || 0,
          })
        }
      }

      dataVenta.repuestos = repuestosEnriquecidos
      console.log("Repuestos finales enriquecidos para PDF:", repuestosEnriquecidos)
    }

    // Cargar información del cliente
    let cliente = null
    if (dataVenta.cliente_id) {
      try {
        const responseCliente = await fetch(
          `https://api-final-8rw7.onrender.com/api/clientes/${dataVenta.cliente_id}`,
          {
            method: "GET",
            headers: {
              Authorization: token,
            },
          },
        )

        if (responseCliente.ok) {
          cliente = await responseCliente.json()
          console.log("Cliente cargado para PDF:", cliente)
        }
      } catch (error) {
        console.warn("No se pudo cargar la información del cliente para PDF:", error)
      }
    }

    // Combinar servicios y repuestos en un solo array para el PDF
    let detallesConProductos = []

    // Agregar servicios
    if (dataVenta.servicios && dataVenta.servicios.length > 0) {
      detallesConProductos = [...detallesConProductos, ...dataVenta.servicios]
    }

    // Agregar repuestos
    if (dataVenta.repuestos && dataVenta.repuestos.length > 0) {
      detallesConProductos = [...detallesConProductos, ...dataVenta.repuestos]
    }

    console.log("=== DETALLES FINALES PARA PDF ===")
    console.log("Total de items:", detallesConProductos.length)
    console.log("Detalles completos:", detallesConProductos)

    return {
      venta: {
        ...dataVenta,
        tipo: "venta",
      },
      cliente,
      detallesConProductos,
    }
  } catch (error) {
    console.error("Error al cargar datos completos de venta:", error)
    throw error
  }
}

// Función para cargar datos completos de una compra
export const cargarDatosCompletosCompra = async (compraId, token) => {
  try {
    console.log("=== INICIANDO CARGA DE DATOS PARA PDF DE COMPRA ===")
    console.log("Compra ID:", compraId)

    // Cargar detalles de la compra
    const responseCompra = await fetch(`https://api-final-8rw7.onrender.com/api/compras/${compraId}`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    })

    if (!responseCompra.ok) {
      throw new Error("Error al cargar los detalles de la compra")
    }

    const dataCompra = await responseCompra.json()
    console.log("Datos de compra para PDF:", dataCompra)

    // Cargar información del proveedor
    let proveedor = null
    if (dataCompra.proveedor_id) {
      try {
        const responseProveedor = await fetch(
          `https://api-final-8rw7.onrender.com/api/proveedores/${dataCompra.proveedor_id}`,
          {
            method: "GET",
            headers: {
              Authorization: token,
            },
          },
        )

        if (responseProveedor.ok) {
          proveedor = await responseProveedor.json()
          console.log("Proveedor cargado para PDF:", proveedor)
        }
      } catch (error) {
        console.warn("No se pudo cargar la información del proveedor para PDF:", error)
      }
    }

    // Cargar detalles de productos
    let detallesConProductos = []
    let detallesParaProcesar = []

    // Primero intentar obtener detalles desde la respuesta de la compra
    if (dataCompra.detalles && Array.isArray(dataCompra.detalles) && dataCompra.detalles.length > 0) {
      detallesParaProcesar = dataCompra.detalles
      console.log("Usando detalles de la compra para PDF:", detallesParaProcesar)
    } else {
      // Si no hay detalles, intentar cargar desde endpoint específico
      try {
        const responseDetalles = await fetch(`https://api-final-8rw7.onrender.com/api/compras/${compraId}/detalles`, {
          method: "GET",
          headers: {
            Authorization: token,
          },
        })

        if (responseDetalles.ok) {
          const detallesData = await responseDetalles.json()
          console.log("Detalles desde endpoint específico para PDF:", detallesData)
          detallesParaProcesar = Array.isArray(detallesData) ? detallesData : []
        }
      } catch (error) {
        console.warn("No se pudieron cargar los detalles desde el endpoint específico para PDF:", error)
      }
    }

    if (detallesParaProcesar.length > 0) {
      console.log("Procesando", detallesParaProcesar.length, "detalles para PDF...")

      detallesConProductos = []

      for (let i = 0; i < detallesParaProcesar.length; i++) {
        const detalle = detallesParaProcesar[i]
        console.log(`=== PROCESANDO DETALLE ${i + 1} PARA PDF ===`)
        console.log("Detalle original:", detalle)

        try {
          let nombreProducto = `Repuesto ID: ${detalle.repuesto_id}`
          let descripcionProducto = ""
          const precioCompra = detalle.precio_compra || 0
          const precioVenta = detalle.precio_venta || 0
          let subtotal = detalle.subtotal || 0

          // Intentar cargar información del repuesto
          if (detalle.repuesto_id) {
            console.log(`Cargando datos del repuesto ID: ${detalle.repuesto_id}`)

            try {
              const responseRepuesto = await fetch(
                `https://api-final-8rw7.onrender.com/api/repuestos/${detalle.repuesto_id}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: token,
                  },
                },
              )

              console.log(`Respuesta API repuesto ${detalle.repuesto_id}:`, responseRepuesto.status)

              if (responseRepuesto.ok) {
                const dataRepuesto = await responseRepuesto.json()
                console.log(`Datos del repuesto ${detalle.repuesto_id}:`, dataRepuesto)

                nombreProducto = dataRepuesto.nombre || nombreProducto
                descripcionProducto = dataRepuesto.descripcion || ""
              } else {
                const errorText = await responseRepuesto.text()
                console.warn(`Error al cargar repuesto ${detalle.repuesto_id}:`, responseRepuesto.status, errorText)
              }
            } catch (repuestoError) {
              console.error(`Error de red al cargar repuesto ${detalle.repuesto_id}:`, repuestoError)
            }
          }

          // Calcular subtotal si no existe
          if (!subtotal && detalle.cantidad && precioCompra) {
            subtotal = detalle.cantidad * precioCompra
          }

          const detalleEnriquecido = {
            ...detalle,
            nombre_repuesto: nombreProducto,
            descripcion: descripcionProducto,
            precio_compra: precioCompra,
            precio_venta: precioVenta,
            precio: precioCompra, // Para compatibilidad
            subtotal: subtotal,
          }

          console.log(`Detalle ${i + 1} enriquecido para PDF:`, detalleEnriquecido)
          detallesConProductos.push(detalleEnriquecido)
        } catch (error) {
          console.error(`Error al procesar detalle ${i + 1} para PDF:`, error)

          // Retornar detalle con información básica si falla
          const precioCompra = detalle.precio_compra || 0
          const precioVenta = detalle.precio_venta || 0
          const subtotal = detalle.subtotal || detalle.cantidad * precioCompra || 0

          detallesConProductos.push({
            ...detalle,
            nombre_repuesto: `Repuesto ID: ${detalle.repuesto_id}`,
            descripcion: "",
            precio_compra: precioCompra,
            precio_venta: precioVenta,
            precio: precioCompra,
            subtotal: subtotal,
          })
        }
      }
    }

    console.log("=== DETALLES FINALES PARA PDF ===")
    console.log("Total de items:", detallesConProductos.length)
    console.log("Detalles completos:", detallesConProductos)

    return {
      compra: dataCompra,
      proveedor,
      detallesConProductos,
    }
  } catch (error) {
    console.error("Error al cargar datos completos de compra:", error)
    throw error
  }
}

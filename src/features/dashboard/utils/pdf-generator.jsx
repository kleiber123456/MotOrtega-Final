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
          precio = detalle.precio || 0
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

// Función auxiliar para formatear precios (sin cambios)
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
        }
      } catch (error) {
        console.warn("No se pudo cargar la información del cliente:", error)
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

// Función para cargar datos completos de una compra (sin cambios)
export const cargarDatosCompletosCompra = async (compraId, token) => {
  try {
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
        }
      } catch (error) {
        console.warn("No se pudo cargar la información del proveedor:", error)
      }
    }

    // Cargar detalles de productos
    let detallesConProductos = []
    if (dataCompra.detalles && dataCompra.detalles.length > 0) {
      detallesConProductos = await Promise.all(
        dataCompra.detalles.map(async (detalle) => {
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

            let nombreProducto = `Repuesto ID: ${detalle.repuesto_id}`
            let descripcionProducto = ""
            let precioUnitario = 0

            if (responseRepuesto.ok) {
              const dataRepuesto = await responseRepuesto.json()
              nombreProducto = dataRepuesto.nombre || nombreProducto
              descripcionProducto = dataRepuesto.descripcion || ""
            }

            if (detalle.cantidad && detalle.cantidad > 0) {
              precioUnitario = (detalle.subtotal || 0) / detalle.cantidad
            }

            return {
              ...detalle,
              nombre_repuesto: nombreProducto,
              descripcion: descripcionProducto,
              precio: precioUnitario,
              subtotal: detalle.subtotal || precioUnitario * (detalle.cantidad || 0),
            }
          } catch (error) {
            console.warn(`Error al cargar repuesto ${detalle.repuesto_id}:`, error)
            const precioUnitario = detalle.cantidad > 0 ? (detalle.subtotal || 0) / detalle.cantidad : 0
            return {
              ...detalle,
              nombre_repuesto: `Repuesto ID: ${detalle.repuesto_id}`,
              descripcion: "",
              precio: precioUnitario,
              subtotal: detalle.subtotal || 0,
            }
          }
        }),
      )
    }

    return {
      compra: dataCompra,
      proveedor,
      detallesConProductos,
    }
  } catch (error) {
    console.error("Error al cargar datos completos:", error)
    throw error
  }
}

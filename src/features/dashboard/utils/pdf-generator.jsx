import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Función principal para generar PDF de factura
export const generarFacturaPDF = async (compra, proveedor, detallesConProductos, token) => {
  try {
    const doc = new jsPDF()

    // Configuración de colores
    const colorPrimario = [37, 99, 235] // Azul
    const colorSecundario = [107, 114, 128] // Gris
    const colorTexto = [31, 41, 55] // Gris oscuro

    // ===== ENCABEZADO CON LOGO Y DATOS DE LA EMPRESA =====

    // Logo (simulado con texto estilizado)
    doc.setFillColor(...colorPrimario)
    doc.rect(20, 15, 50, 25, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont(undefined, "bold")
    doc.text("MotOrtega", 45, 32, { align: "center" })

    // Información de la empresa
    doc.setTextColor(...colorTexto)
    doc.setFontSize(12)
    doc.setFont(undefined, "bold")
    doc.text("MOTORTEGA S.A.S.", 80, 20)

    doc.setFontSize(9)
    doc.setFont(undefined, "normal")
    doc.text("NIT: 900.123.456-7", 80, 26)
    doc.text("Dirección: Calle 123 #45-67, Bogotá D.C.", 80, 31)
    doc.text("Teléfono: +57 (1) 234-5678", 80, 36)
    doc.text("Email: info@motortega.com", 80, 41)

    // Título del documento
    doc.setFillColor(...colorPrimario)
    doc.rect(140, 15, 50, 25, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont(undefined, "bold")
    doc.text("ORDEN DE", 165, 25, { align: "center" })
    doc.text("COMPRA", 165, 33, { align: "center" })

    // Línea separadora
    doc.setDrawColor(...colorPrimario)
    doc.setLineWidth(2)
    doc.line(20, 50, 190, 50)

    // ===== INFORMACIÓN DE LA COMPRA =====

    let yPosition = 65

    // Número de orden y fecha
    doc.setTextColor(...colorTexto)
    doc.setFontSize(11)
    doc.setFont(undefined, "bold")
    doc.text("INFORMACIÓN DE LA ORDEN", 20, yPosition)

    yPosition += 10
    doc.setFont(undefined, "normal")
    doc.text(`Número de Orden: #${compra.id.toString().padStart(6, "0")}`, 20, yPosition)
    doc.text(
      `Fecha: ${new Date(compra.fecha).toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      120,
      yPosition,
    )

    yPosition += 8
    doc.text(`Estado: ${compra.estado}`, 20, yPosition)
    doc.text(`Hora: ${new Date().toLocaleTimeString("es-CO")}`, 120, yPosition)

    // ===== INFORMACIÓN DEL PROVEEDOR =====

    yPosition += 20

    // Recuadro para el proveedor
    doc.setFillColor(248, 250, 252)
    doc.rect(20, yPosition - 5, 170, 25, "F")
    doc.setDrawColor(...colorSecundario)
    doc.setLineWidth(0.5)
    doc.rect(20, yPosition - 5, 170, 25)

    doc.setTextColor(...colorTexto)
    doc.setFontSize(11)
    doc.setFont(undefined, "bold")
    doc.text("PROVEEDOR", 25, yPosition + 2)

    yPosition += 10
    doc.setFont(undefined, "normal")
    doc.setFontSize(10)

    if (proveedor) {
      doc.text(`Nombre: ${proveedor.nombre || "N/A"}`, 25, yPosition)
      doc.text(`Documento: ${proveedor.nit || "N/A"}`, 120, yPosition)
      yPosition += 6
      doc.text(`Email: ${proveedor.correo || "N/A"}`, 25, yPosition)
      doc.text(`Teléfono: ${proveedor.telefono || "N/A"}`, 120, yPosition)
      if (proveedor.direccion) {
        yPosition += 6
        doc.text(`Dirección: ${proveedor.direccion}`, 25, yPosition)
      }
    } else {
      doc.text("Información del proveedor no disponible", 25, yPosition)
    }

    // ===== TABLA DE PRODUCTOS =====

    yPosition += 25

    if (detallesConProductos && detallesConProductos.length > 0) {
      const tableColumn = ["#", "Descripción del Producto", "Cant.", "Precio Unit.", "Subtotal"]
      const tableRows = []

      detallesConProductos.forEach((detalle, index) => {
        const productoData = [
          (index + 1).toString(),
          detalle.nombre_repuesto || `Repuesto ID: ${detalle.repuesto_id}`,
          detalle.cantidad.toString(),
          formatearPrecio(detalle.precio || 0),
          formatearPrecio(detalle.subtotal || 0),
        ]
        tableRows.push(productoData)
      })

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPosition,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: colorPrimario,
          textColor: 255,
          fontStyle: "bold",
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 15 },
          1: { halign: "left", cellWidth: 80 },
          2: { halign: "center", cellWidth: 20 },
          3: { halign: "right", cellWidth: 35 },
          4: { halign: "right", cellWidth: 35 },
        },
        margin: { left: 20, right: 20 },
      })

      // ===== TOTALES =====

      const finalY = doc.lastAutoTable.finalY + 10

      // Recuadro para totales
      doc.setFillColor(...colorPrimario)
      doc.rect(130, finalY, 60, 20, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont(undefined, "bold")
      doc.text("TOTAL:", 135, finalY + 8)
      doc.text(formatearPrecio(compra.total), 185, finalY + 8, { align: "right" })

      doc.setFontSize(10)
      doc.text("(Pesos Colombianos)", 135, finalY + 15)

      // ===== OBSERVACIONES =====

      const observacionesY = finalY + 35
      doc.setTextColor(...colorTexto)
      doc.setFontSize(10)
      doc.setFont(undefined, "bold")
      doc.text("OBSERVACIONES:", 20, observacionesY)

      doc.setFont(undefined, "normal")
      doc.text("• Esta orden de compra está sujeta a los términos y condiciones acordados.", 20, observacionesY + 8)
      doc.text("• Los productos deben ser entregados según las especificaciones solicitadas.", 20, observacionesY + 15)
      doc.text("• Cualquier cambio debe ser autorizado por escrito.", 20, observacionesY + 22)
    } else {
      doc.setTextColor(...colorTexto)
      doc.setFontSize(12)
      doc.text("No hay productos registrados en esta orden de compra", 20, yPosition)
    }

    // ===== PIE DE PÁGINA =====

    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)

      // Línea superior del pie
      doc.setDrawColor(...colorSecundario)
      doc.setLineWidth(0.5)
      doc.line(20, doc.internal.pageSize.height - 25, 190, doc.internal.pageSize.height - 25)

      // Información del pie
      doc.setTextColor(...colorSecundario)
      doc.setFontSize(8)
      doc.setFont(undefined, "normal")

      // Izquierda
      doc.text("MotOrtega S.A.S. - Soluciones Automotrices", 20, doc.internal.pageSize.height - 18)
      doc.text("www.motortega.com", 20, doc.internal.pageSize.height - 12)

      // Centro
      doc.text(`Página ${i} de ${pageCount}`, 105, doc.internal.pageSize.height - 18, { align: "center" })

      // Derecha
      doc.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`, 190, doc.internal.pageSize.height - 18, {
        align: "right",
      })
      doc.text(`${new Date().toLocaleTimeString("es-CO")}`, 190, doc.internal.pageSize.height - 12, { align: "right" })
    }

    // Guardar el PDF
    doc.save(`Orden-Compra-${compra.id.toString().padStart(6, "0")}-MotOrtega.pdf`)

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

// Función para cargar datos completos de una compra (para usar desde el listado)
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

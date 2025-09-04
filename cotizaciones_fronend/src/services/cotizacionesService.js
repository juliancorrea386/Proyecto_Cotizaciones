import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = `${import.meta.env.VITE_API_URL}/api/cotizaciones`;

const cotizacionesService = {
  listar: (params = {}) => axios.get(API_URL, { params }).then(res => res.data),
  eliminar: (id) => axios.delete(`${API_URL}/${id}`),
  guardarCotizacion: async (cotizacion) => {
    try {
      const res = await axios.post(API_URL, cotizacion);
      return res.data;
    } catch (error) {
      console.error("Error al guardar la cotización:", error);
      throw error; // propagar el error para manejarlo en el componente
    }
  },
  actualizar: (id, data) => axios.put(`${API_URL}/${id}`, data).then(res => res.data),
  obtenerUltimoNumero: async () => {
    try {
      const res = await axios.get(`${API_URL}/Numero`);
      const numero = parseInt(res.data.mayor_numero) || 0;
      return numero + 1;
    } catch (error) {
      console.error("Error al obtener el último número de cotización:", error);
      return 1; // valor por defecto si hay error
    }
  }, obtenerPorId: async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error al obtener la cotización:", error);
      throw error;
    }
  },
  obtenerPorCliente: async (clienteId) => {
    try {
      const res = await axios.get(`${API_URL}/cliente/${clienteId}`);
      return Array.isArray(res.data) ? res.data : [res.data];
    } catch (error) {
      console.error("Error al obtener cotizaciones por cliente:", error);
      throw error;
    }
  },
  obtenerDetalle: async (id) => {
    const res = await axios.get(`${API_URL}/${id}/detalle`);
    return res.data;
  },
  exportarCotizacionPDF: (cotizacion) => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(14);
    doc.text("Cotización", 14, 20);

    doc.setFontSize(10);
    doc.text(`N° Cotización: ${cotizacion.numero_cotizacion}`, 14, 30);
    doc.text(`Cliente: ${cotizacion.cliente_nombre} (Cedula - Nit: ${cotizacion.cliente_id})`, 14, 36);
    doc.text(`Fecha: ${new Date(cotizacion.fecha).toLocaleDateString("es-CO")}`, 14, 42);
    doc.text(`Tipo: ${cotizacion.tipo}`, 14, 48);

    // Tabla de productos
    const body = cotizacion.detalles.map((d) => [
      d.producto_nombre,
      d.cantidad,
      new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(d.precio_unitario),
      new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(d.total),
    ]);

    doc.autoTable({
      startY: 65,
      head: [["Producto", "Cantidad", "Precio Unitario", "Total"]],
      body,
    });

    // Totales
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(
      `Subtotal: ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(
        cotizacion.subtotal
      )}`,
      14,
      finalY
    );
    doc.save(`cotizacion_${cotizacion.numero_cotizacion}.pdf`);
  },

};

export default cotizacionesService;
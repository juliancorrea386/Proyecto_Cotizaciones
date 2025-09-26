import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import reportesService from "../services/reportesService";

const API_URL = import.meta.env.VITE_API_URL;

export default function ReporteInvPage() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [reporte, setReporte] = useState([]);
  const [detalles, setDetalles] = useState({}); // detalles de cada producto

  const generarReporte = async () => {
    try {
      const res = await reportesService.getReporteInv({ desde, hasta });
      setReporte(res);
      setDetalles({});
    } catch (err) {
      console.error(err);
    }
  };

  const exportarExcel = () => {
    if (reporte.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      reporte.map((r) => ({
        Referencia: r.referencia,
        Producto: r.nombre,
        "Cantidad Salida": r.total_salidas,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Reporte_Inventario_${desde}_a_${hasta}.xlsx`);
  };

  const toggleDetalle = async (productoId) => {
    if (detalles[productoId]) {
      const newDetalles = { ...detalles };
      delete newDetalles[productoId];
      setDetalles(newDetalles);
    } else {
      const movimientos = await reportesService.getMovimientosProducto(productoId, { desde, hasta });
      setDetalles({ ...detalles, [productoId]: movimientos });
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">
        📊 Reporte de Inventario y Movimientos
      </h2>

      {/* Filtros */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-600">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border rounded px-3 py-2 w-40 focus:ring focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border rounded px-3 py-2 w-40 focus:ring focus:ring-blue-300"
          />
        </div>
        <button
          onClick={generarReporte}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md"
        >
          Generar
        </button>
        <button
          onClick={exportarExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md"
        >
          📥 Exportar Excel
        </button>
      </div>

      {/* Tabla de resultados */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white text-sm uppercase">
              <th className="px-3 py-2 text-left">Referencia</th>
              <th className="px-3 py-2 text-left">Producto</th>
              <th className="px-3 py-2 text-center">Cantidad Salida</th>
              <th className="px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reporte.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No hay datos
                </td>
              </tr>
            ) : (
              reporte.map((r) => (
                <React.Fragment key={r.id}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="border px-3 py-2">{r.referencia}</td>
                    <td className="border px-3 py-2">{r.nombre}</td>
                    <td className="border px-3 py-2 text-center font-semibold">
                      {r.total_salidas}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      <button
                        onClick={() => toggleDetalle(r.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md shadow-sm"
                      >
                        {detalles[r.id] ? "Ocultar" : "Ver movimientos"}
                      </button>
                    </td>
                  </tr>

                  {/* Movimientos detallados */}
                  {detalles[r.id] && (
                    <tr>
                      <td colSpan="4" className="bg-gray-50 p-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-gray-200">
                                <th className="px-3 py-2 text-left">Cotización</th>
                                <th className="px-3 py-2 text-left">Fecha</th>
                                <th className="px-3 py-2 text-left">Cliente</th>
                                <th className="px-3 py-2 text-center">Cantidad</th>
                                <th className="px-3 py-2 text-center">Precio</th>
                                <th className="px-3 py-2 text-center">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detalles[r.id].map((d, idx) => (
                                <tr key={idx} className="hover:bg-white transition">
                                  <td className="border px-3 py-2">{d.numero_cotizacion}</td>
                                  <td className="border px-3 py-2">
                                    {d.fecha}
                                  </td>
                                  <td className="border px-3 py-2">{d.cliente}</td>
                                  <td className="border px-3 py-2 text-center">{d.cantidad}</td>
                                  <td className="border px-3 py-2 text-center">
                                    ${Number(d.precio_venta).toLocaleString()}
                                  </td>
                                  <td className="border px-3 py-2 text-center">
                                    ${Number(d.subtotal).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                              {/* Totales */}
                              <tr className="bg-gray-200 font-bold">
                                <td colSpan="3" className="border px-3 py-2 text-right">
                                  Total
                                </td>
                                <td className="border px-3 py-2 text-center">
                                  {detalles[r.id].reduce((sum, d) => sum + d.cantidad, 0)}
                                </td>
                                <td></td>
                                <td className="border px-3 py-2 text-center text-green-700">
                                  $
                                  {detalles[r.id]
                                    .reduce((sum, d) => sum + Number(d.subtotal), 0)
                                    .toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ReporteInvPage() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [reporte, setReporte] = useState([]);

  const generarReporte = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reportes/inventario`, {
        params: { desde, hasta }
      });
      setReporte(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const exportarExcel = () => {
    if (reporte.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    // Convertir datos a hoja de Excel
    const worksheet = XLSX.utils.json_to_sheet(
      reporte.map((r) => ({
        Producto: r.nombre,
        "Cantidad Salida": r.total_salidas,
      }))
    );

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");

    // Generar archivo y descargar
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Reporte_Inventario_${desde}_a_${hasta}.xlsx`);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📊 Reporte de Inventario</h2>

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={generarReporte}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generar
        </button>
        <button
          onClick={exportarExcel}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          📥 Exportar Excel
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        {/* Tabla de resultados */}
        <table className="w-full border-collapse bg-white">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th className="p-3 text-center">Producto</th>
              <th className="p-3 text-center">Cantidad Salida</th>
            </tr>
          </thead>
          <tbody>
            {reporte.length === 0 ? (
              <tr>
                <td colSpan="2" className="p-4 text-center">
                  No hay datos
                </td>
              </tr>
            ) : (
              reporte.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 text-left font-semibold">{r.nombre}</td>
                  <td className="p-3 text-left font-semibold">{r.total_salidas}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

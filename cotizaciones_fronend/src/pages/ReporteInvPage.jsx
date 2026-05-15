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
  const [detalles, setDetalles] = useState({});

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

  const totalGeneral = reporte.reduce((sum, r) => sum + Number(r.total_salidas), 0);

  return (
    <div className="p-3 sm:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4 sm:mb-6">
        📊 Reporte de Inventario y Movimientos
      </h2>

      {/* Filtros */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-4 sm:mb-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-40 focus:ring focus:ring-blue-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-40 focus:ring focus:ring-blue-300 text-sm"
          />
        </div>
        <button
          onClick={generarReporte}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md text-sm col-span-1"
        >
          Generar
        </button>
        <button
          onClick={exportarExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md text-sm col-span-1"
        >
          📥 Excel
        </button>
      </div>

      {/* Vista tabla en desktop */}
      <div className="hidden sm:block overflow-x-auto bg-white shadow-lg rounded-lg">
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
                <td colSpan="4" className="p-4 text-center text-gray-500 text-sm">
                  No hay datos
                </td>
              </tr>
            ) : (
              reporte.map((r) => (
                <React.Fragment key={r.id}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="border px-3 py-2 text-sm">{r.referencia}</td>
                    <td className="border px-3 py-2 text-sm">{r.nombre}</td>
                    <td className="border px-3 py-2 text-center font-semibold text-sm">{r.total_salidas}</td>
                    <td className="border px-3 py-2 text-center">
                      <button
                        onClick={() => toggleDetalle(r.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md shadow-sm text-sm"
                      >
                        {detalles[r.id] ? "Ocultar" : "Ver movimientos"}
                      </button>
                    </td>
                  </tr>
                  {detalles[r.id] && (
                    <tr>
                      <td colSpan="4" className="bg-gray-50 p-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse min-w-[500px]">
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
                                  <td className="border px-3 py-2">{d.fecha}</td>
                                  <td className="border px-3 py-2">{d.cliente}</td>
                                  <td className="border px-3 py-2 text-center">{d.cantidad}</td>
                                  <td className="border px-3 py-2 text-center">${Number(d.precio_venta).toLocaleString()}</td>
                                  <td className="border px-3 py-2 text-center">${Number(d.subtotal).toLocaleString()}</td>
                                </tr>
                              ))}
                              <tr className="bg-gray-200 font-bold">
                                <td colSpan="3" className="border px-3 py-2 text-right">Total</td>
                                <td className="border px-3 py-2 text-center">
                                  {detalles[r.id].reduce((sum, d) => sum + d.cantidad, 0)}
                                </td>
                                <td></td>
                                <td className="border px-3 py-2 text-center text-green-700">
                                  ${detalles[r.id].reduce((sum, d) => sum + Number(d.subtotal), 0).toLocaleString()}
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
          <tfoot>
            <tr className="bg-blue-100 font-bold">
              <td colSpan="2" className="border px-3 py-2 text-right text-sm">Total general</td>
              <td className="border px-3 py-2 text-center text-blue-700 text-sm">{totalGeneral.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Vista tarjetas en móvil */}
      <div className="sm:hidden space-y-3">
        {reporte.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 text-sm">
            No hay datos. Selecciona un rango de fechas y genera el reporte.
          </div>
        ) : (
          <>
            {reporte.map((r) => (
              <div key={r.id} className="bg-white rounded-lg shadow border">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-gray-800 text-sm flex-1 pr-2">{r.nombre}</p>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">
                      {r.total_salidas} uds
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Ref: {r.referencia}</p>
                  <button
                    onClick={() => toggleDetalle(r.id)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                      detalles[r.id]
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {detalles[r.id] ? "▲ Ocultar movimientos" : "▼ Ver movimientos"}
                  </button>
                </div>

                {/* Movimientos en móvil: mini-tarjetas */}
                {detalles[r.id] && (
                  <div className="border-t bg-gray-50 p-3 space-y-2">
                    {detalles[r.id].map((d, idx) => (
                      <div key={idx} className="bg-white rounded border p-3 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Cotización</span>
                          <span className="font-medium">{d.numero_cotizacion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fecha</span>
                          <span>{d.fecha}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Cliente</span>
                          <span className="text-right max-w-[60%]">{d.cliente}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Cantidad</span>
                          <span className="font-semibold">{d.cantidad}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Precio</span>
                          <span>${Number(d.precio_venta).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-green-700">
                          <span>Subtotal</span>
                          <span>${Number(d.subtotal).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {/* Totales del producto */}
                    <div className="bg-gray-200 rounded p-2 text-xs font-bold flex justify-between">
                      <span>Total: {detalles[r.id].reduce((sum, d) => sum + d.cantidad, 0)} uds</span>
                      <span className="text-green-700">
                        ${detalles[r.id].reduce((sum, d) => sum + Number(d.subtotal), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Total general en móvil */}
            <div className="bg-blue-100 rounded-lg p-3 flex justify-between font-bold text-sm text-blue-700">
              <span>Total general</span>
              <span>{totalGeneral.toLocaleString()} uds</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
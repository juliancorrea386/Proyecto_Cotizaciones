import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clientesService from "../services/clientesService";
import recibosService from "../services/recibosService";

export default function EditarRecibos() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [cotizaciones, setCotizaciones] = useState([]);
  const [numeroRecibo, setNumeroRecibo] = useState("");
  const [fecha, setFecha] = useState("");
  const [abonos, setAbonos] = useState([]);
  const [observacion, setObservacion] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await clientesService.listar();
        setClientes(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClientes();
  }, []);

  useEffect(() => {
    const fetchRecibo = async () => {
      try {
        const data = await recibosService.obtenerPorId(id);
        setNumeroRecibo(data.numero_recibo);
        setFecha(data.fecha.split("T")[0]);
        setClienteId(data.cliente_id);
        setObservacion(data.observacion || "");
        setAbonos(
          (data.abonos || []).map((a) => ({
            id: a.id,
            cotizacion_id: a.cotizacion_id,
            numero_cotizacion: a.numero_cotizacion,
            fecha_abono: a.fecha_abono,
            fecha: a.fecha || data.fecha,
            saldo: a.saldo,
            valor: a.valor || a.valor_abono || 0,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Error cargando recibo");
      }
    };
    fetchRecibo();
  }, [id]);

  const agregarAbono = () => {
    setAbonos([...abonos, { cotizacion_id: "", valor: "" }]);
  };

  const eliminarAbono = (index) => {
    const copia = [...abonos];
    copia.splice(index, 1);
    setAbonos(copia);
  };

  const actualizarAbono = (index, field, value) => {
    const copia = [...abonos];
    if (field === "valor") {
      const cot = cotizaciones.find((c) => c.id == copia[index].cotizacion_id);
      if (cot && Number(value) > Number(cot.saldo)) {
        toast.error("⚠️ El abono no puede ser mayor al saldo de la cotización");
        return;
      }
    }
    copia[index][field] = value;
    setAbonos(copia);
  };

  const actualizarRecibo = async () => {
    try {
      const payload = {
        numero_recibo: numeroRecibo,
        fecha,
        cliente_id: clienteId,
        observacion,
        detalles: abonos,
      };
      await recibosService.actualizar(id, payload);
      toast.success("✅ Recibo actualizado con éxito");
      setTimeout(() => navigate("/lista-recibos"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("❌ Error al actualizar recibo");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ToastContainer />
      <div className="bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          ✏️ Editar Recibo
        </h2>

        {/* Número */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Número de Recibo
          </label>
          <input
            type="text"
            value={numeroRecibo}
            disabled
            className="border p-2 rounded w-full bg-gray-100 text-gray-700"
          />
        </div>

        {/* Fecha */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Cliente */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Cliente
          </label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Seleccione un cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Observación */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Observación
          </label>
          <textarea
            value={observacion || ""}
            onChange={(e) => setObservacion(e.target.value)}
            className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Tabla abonos */}
        {clienteId && (
          <div className="overflow-x-auto shadow-md rounded-lg mb-6">
            <table className="w-full border-collapse bg-white">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <tr>
                  <th className="p-3 text-center">Cotización</th>
                  <th className="p-3 text-center">Fecha</th>
                  <th className="p-3 text-center">Saldo</th>
                  <th className="p-3 text-center">Valor Abono</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {abonos.map((abono, index) => (
                  <tr
                    key={index}
                    className="odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                  >
                    <td className="p-3 text-center font-medium">
                      {abono.numero_cotizacion}
                    </td>
                    <td className="p-3 text-center">
                      {new Date(abono.fecha_abono).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center text-blue-600 font-semibold">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(abono.saldo)}
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={abono.valor}
                        onChange={(e) =>
                          actualizarAbono(index, "valor", e.target.value)
                        }
                        className="border rounded p-2 w-28 text-right focus:ring-2 focus:ring-green-400"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => eliminarAbono(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
                      >
                        ❌ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan="3" className="p-3 text-right">
                    Subtotal:
                  </td>
                  <td className="p-3 text-center text-green-700">
                    {abonos
                      .reduce((acc, abono) => acc + Number(abono.valor || 0), 0)
                      .toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Botones */}
        {clienteId && (
          <div className="flex gap-4">
            <button
              onClick={agregarAbono}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg shadow font-medium"
            >
              ➕ Agregar Abono
            </button>
            <button
              onClick={actualizarRecibo}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow font-medium"
            >
              💾 Guardar Cambios
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

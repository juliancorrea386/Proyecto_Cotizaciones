import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clientesService from "../services/clientesService";
import recibosService from "../services/recibosService";
import cotizacionesService from "../services/cotizacionesService";
import { PlusCircle, Save, Trash2, FileText } from "lucide-react";

export default function RecibosPage() {
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [cotizaciones, setCotizaciones] = useState([]);
  const [numeroRecibo, setNumeroRecibo] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [abonos, setAbonos] = useState([]);
  const [observacion, setObservacion] = useState("");

  // Cargar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await clientesService.listar();
        const ultimoNumero = await recibosService.obtenerUltimoNumero();
        setNumeroRecibo(ultimoNumero);
        setClientes(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClientes();
  }, []);

  // Cargar cotizaciones del cliente
  useEffect(() => {
    if (!clienteId) return;

    const fetchCotizaciones = async () => {
      try {
        const todasCotizaciones = await cotizacionesService.obtenerPorCliente(
          clienteId
        );
        const fechaRecibo = fecha;
        const cotizacionesFiltradas = todasCotizaciones.filter((cot) => {
          const [dia, mes, anio] = cot.fecha.split("-");
          const fechaCot = new Date(`${anio}-${mes}-${dia}`); // convertimos a YYYY-MM-DD
          return fechaCot <= new Date(fecha);
        });

        setCotizaciones(cotizacionesFiltradas);
        setAbonos([]);
      } catch (err) {
        console.error("Error cargando cotizaciones del cliente:", err);
      }
    };

    fetchCotizaciones();
  }, [clienteId, fecha]);

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

  const guardarRecibo = async () => {
    try {
      const payload = {
        numero_recibo: numeroRecibo,
        fecha,
        cliente_id: clienteId,
        observacion,
        abonos,
      };
      await recibosService.crear(payload);
      toast.success("✅ Recibo registrado con éxito");
      setClienteId("");
      setObservacion("");
      setAbonos([]);
      setNumeroRecibo((num) => num + 1);
      setCotizaciones([]);
    } catch (err) {
      console.error(err);
      toast.error("❌ Error al registrar recibo");
    }
  };

  const subtotal = abonos.reduce(
    (acc, abono) => acc + Number(abono.valor || 0),
    0
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer />
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-green-600 w-8 h-8" />
        <h2 className="text-2xl font-bold text-gray-800">🧾 Nuevo Recibo</h2>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        {/* Número de Recibo y Fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Número de Recibo
            </label>
            <input
              type="text"
              value={numeroRecibo}
              onChange={(e) => setNumeroRecibo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        {/* Selección de Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Cliente
          </label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
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
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Observación
          </label>
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Tabla de abonos */}
        {clienteId && (
          <div className="overflow-x-auto border rounded-xl shadow-md">
            <table className="w-full border-collapse bg-white">
              <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <tr>
                  <th className="p-3 text-center">Cotización</th>
                  <th className="p-3 text-center">Fecha</th>
                  <th className="p-3 text-center">Saldo</th>
                  <th className="p-3 text-center">Valor Abono</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {abonos.map((abono, index) => {
                  const cot = cotizaciones.find(
                    (c) => c.id == abono.cotizacion_id
                  );
                  return (
                    <tr
                      key={index}
                      className={`border-t ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                    >
                      <td className="p-3 text-center">
                        <select
                          value={abono.cotizacion_id}
                          onChange={(e) =>
                            actualizarAbono(
                              index,
                              "cotizacion_id",
                              e.target.value
                            )
                          }
                          className="border rounded-lg px-2 py-1"
                        >
                          <option value="">Seleccione...</option>
                          {cotizaciones.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.numero_cotizacion}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        {cot ? cot.fecha : "-"}
                      </td>
                      <td className="p-3 text-center">
                        {cot
                          ? new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(cot.saldo)
                          : "-"}
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="text"
                          value={
                            abono.valor
                              ? new Intl.NumberFormat("es-CO", {
                                style: "currency",
                                currency: "COP",
                                minimumFractionDigits: 0,
                              }).format(abono.valor)
                              : ""
                          }
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, "");
                            actualizarAbono(
                              index,
                              "valor",
                              rawValue ? parseInt(rawValue, 10) : ""
                            );
                          }}
                          className="border-2 border-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-lg px-2 py-1 w-32 text-right bg-white text-gray-800 shadow-sm"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => eliminarAbono(index)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Subtotal */}
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan="3" className="p-3 text-right">
                    Subtotal:
                  </td>
                  <td className="p-3 text-center">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(subtotal)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Botones */}
        {clienteId && (
          <div className="flex flex-wrap gap-4 justify-end">
            <button
              onClick={agregarAbono}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              <PlusCircle size={18} /> Agregar Abono
            </button>
            <button
              onClick={guardarRecibo}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              <Save size={18} /> Guardar Recibo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

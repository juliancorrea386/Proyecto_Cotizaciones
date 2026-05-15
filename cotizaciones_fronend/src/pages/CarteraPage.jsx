import React, { useEffect, useState } from "react";
import axios from "axios";
import carteraService from "../services/carteraService";
import Select from "react-select";
import jsPDF from "jspdf";
import "jspdf-autotable";
import municipiosService from "../services/municipiosService";

export default function CarteraPage() {
    const [cartera, setCartera] = useState([]);
    const [nombreCliente, setNombreCliente] = useState("");
    const [cedula, setCedula] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [municipiosSeleccionados, setMunicipiosSeleccionados] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

    useEffect(() => {
        fetchCartera();
        fetchMunicipios();
    }, []);

    const fetchCartera = async (params = {}) => {
        try {
            const res = await carteraService.listar(params);
            setCartera(res);
        } catch (err) {
            console.error("Error cargando cartera:", err);
        }
    };

    const fetchMunicipios = async () => {
        try {
            const data = await municipiosService.getMunicipios();
            setMunicipios(data);
        } catch (err) {
            console.error("Error al obtener municipios:", err);
        }
    };

    const aplicarFiltros = () => {
        const params = {};
        if (nombreCliente) params.nombreCliente = nombreCliente;
        if (cedula) params.cedula = cedula;
        if (fechaInicio) params.desde = fechaInicio;
        if (fechaFin) params.hasta = fechaFin;
        if (municipiosSeleccionados.length > 0) params.municipios = municipiosSeleccionados.join(",");
        fetchCartera(params);
        setFiltrosAbiertos(false);
    };

    const limpiarFiltros = () => {
        setNombreCliente("");
        setCedula("");
        setFechaInicio("");
        setFechaFin("");
        setMunicipiosSeleccionados([]);
        fetchCartera();
    };

    const municipiosOptions = municipios.map((muni) => ({
        value: muni.id,
        label: muni.nombre,
    }));

    const exportarPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFontSize(16);
        doc.text("Cartera de Clientes", pageWidth / 2, 15, { align: "center" });

        cartera.forEach((cliente) => {
            const previousY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 25;
            doc.setFontSize(12);
            doc.text(`${cliente.nombre} - ${cliente.municipio}`, 14, previousY - 5);
            doc.autoTable({
                startY: previousY,
                head: [["N° Cotización", "Fecha", "Total", "Saldo Pendiente"]],
                body: cliente.cotizaciones.map((cot) => [
                    cot.numero_cotizacion,
                    new Date(cot.fecha).toLocaleDateString("es-CO"),
                    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(cot.total),
                    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(cot.saldo),
                ]),
                theme: "grid",
                styles: { halign: "center" },
                headStyles: { fillColor: [240, 240, 240], textColor: 20 },
            });
            const total = cliente.cotizaciones.reduce((sum, c) => sum + (Number(c.saldo) || 0), 0);
            doc.setFontSize(11);
            doc.text(
                `TOTAL SALDO: ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(total)}`,
                14,
                doc.lastAutoTable.finalY + 7,
                { align: "left" }
            );
        });

        doc.save("cartera.pdf");
    };

    const formatCOP = (value) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);

    return (
        <div className="p-3 sm:p-6 bg-white rounded shadow">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">📌 Cartera de Clientes</h2>

            {/* Filtros colapsables en móvil */}
            <div className="mb-4">
                <button
                    onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                    className="sm:hidden w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded shadow flex justify-between items-center"
                >
                    <span>🔎 Filtros</span>
                    <span>{filtrosAbiertos ? "▲" : "▼"}</span>
                </button>

                <div className={`bg-white p-4 rounded-lg shadow mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-end ${filtrosAbiertos ? "block" : "hidden sm:grid"}`}>
                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Nombre:</label>
                        <input
                            type="text"
                            placeholder="Nombre cliente"
                            value={nombreCliente}
                            onChange={(e) => setNombreCliente(e.target.value)}
                            className="border px-3 py-2 rounded w-full text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Cédula:</label>
                        <input
                            type="text"
                            placeholder="Cédula cliente"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            className="border px-3 py-2 rounded w-full text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Desde:</label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="border px-3 py-2 rounded w-full text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Hasta:</label>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="border px-3 py-2 rounded w-full text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Municipio:</label>
                        <Select
                            isMulti
                            options={municipiosOptions}
                            value={municipiosOptions.filter(opt => municipiosSeleccionados.includes(opt.value))}
                            onChange={(selected) => setMunicipiosSeleccionados(selected.map(opt => opt.value))}
                            className="w-full text-sm"
                            placeholder="Selecciona municipios..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={aplicarFiltros}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow w-full text-sm"
                        >
                            🔍 Filtrar
                        </button>
                        <button
                            onClick={limpiarFiltros}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow w-full text-sm"
                        >
                            ❌ Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Botón Exportar PDF */}
            <div className="mb-4">
                <button
                    onClick={exportarPDF}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow text-sm w-full sm:w-auto"
                >
                    📄 Exportar PDF
                </button>
            </div>

            {cartera.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay clientes con deudas pendientes.</p>
            ) : (
                cartera.map((cliente) => (
                    <div key={cliente.id} className="mb-6 border-b pb-4">
                        <h3 className="text-base sm:text-lg font-semibold mb-2">
                            {cliente.nombre} - <span className="text-gray-600">{cliente.municipio}</span>
                        </h3>

                        {/* Tabla con scroll horizontal en móvil */}
                        <div className="overflow-x-auto -mx-3 sm:mx-0">
                            <table className="w-full mt-2 border text-sm min-w-[420px]">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-2 py-2 text-left">N° Cotización</th>
                                        <th className="border px-2 py-2 text-left">Fecha</th>
                                        <th className="border px-2 py-2 text-right">Total</th>
                                        <th className="border px-2 py-2 text-right">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cliente.cotizaciones.map((cot) => (
                                        <tr key={cot.id} className="hover:bg-gray-50">
                                            <td className="border px-2 py-2">{cot.numero_cotizacion}</td>
                                            <td className="border px-2 py-2 whitespace-nowrap">
                                                {new Date(cot.fecha).toLocaleDateString("es-CO")}
                                            </td>
                                            <td className="border px-2 py-2 text-right">${cot.total}</td>
                                            <td className="border px-2 py-2 text-right text-red-500">${cot.saldo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {cliente.cotizaciones.length > 0 && (
                                    <tfoot className="bg-gray-100 font-bold">
                                        <tr>
                                            <td colSpan="3" className="px-2 py-2 text-right text-sm">
                                                TOTAL GENERAL:
                                            </td>
                                            <td className="px-2 py-2 text-right text-sm">
                                                {formatCOP(
                                                    cliente.cotizaciones.reduce((sum, c) => sum + (Number(c.saldo) || 0), 0)
                                                )}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
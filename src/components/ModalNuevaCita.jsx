import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function ModalNuevaCita({ isOpen, onClose, onCitaCreada }) {
    // 1. Estados para los desplegables
    const [clientes, setClientes] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [servicios, setServicios] = useState([]);

    // 2. Estado para los datos del formulario (coincidiendo con tu CitaCreateDto)
    const [formData, setFormData] = useState({
        clienteId: '',
        empleadoId: '',
        fecha_hora_inicio: '',
        observaciones: '',
        serviciosIds: [] // Lista para multiselección
    });

    // Cargar datos cuando el modal se abre
    useEffect(() => {
        if (isOpen) {
            const cargarDatos = async () => {
                try {
                    const [resClientes, resEmpleados, resServicios] = await Promise.all([
                        api.get('/clientes'),
                        api.get('/empleados'),
                        api.get('/servicios')
                    ]);
                    setClientes(resClientes.data);
                    setEmpleados(resEmpleados.data);
                    setServicios(resServicios.data);
                } catch (error) {
                    console.error("Error cargando maestros para el modal", error);
                }
            };
            cargarDatos();
        }
    }, [isOpen]);

    // Manejador para los servicios (añadir/quitar de la lista)
    const handleServicioChange = (servicioId) => {
        setFormData(prev => {
            const existe = prev.serviciosIds.includes(servicioId);
            return {
                ...prev,
                serviciosIds: existe 
                    ? prev.serviciosIds.filter(id => id !== servicioId) // Quitar
                    : [...prev.serviciosIds, servicioId] // Añadir
            };
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Nueva Cita</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CLIENTE */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Cliente</label>
                        <select 
                            className="border rounded p-2"
                            value={formData.clienteId}
                            onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                        >
                            <option value="">Seleccione Cliente...</option>
                            {clientes.map(c => <option key={c.clienteid} value={c.clienteid}>{c.nombre} {c.apellidos}</option>)}
                        </select>
                    </div>

                    {/* EMPLEADO */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Empleado</label>
                        <select 
                            className="border rounded p-2"
                            value={formData.empleadoId}
                            onChange={(e) => setFormData({...formData, empleadoId: e.target.value})}
                        >
                            <option value="">Seleccione Empleado...</option>
                            {empleados.map(e => <option key={e.empleadoid} value={e.empleadoid}>{e.nombre}</option>)}
                        </select>
                    </div>

                    {/* FECHA Y HORA */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Fecha y Hora</label>
                        <input 
                            type="datetime-local" 
                            className="border rounded p-2"
                            value={formData.fecha_hora_inicio}
                            onChange={(e) => setFormData({...formData, fecha_hora_inicio: e.target.value})}
                        />
                    </div>
                </div>

                {/* SERVICIOS (Checkboxes) */}
                <div className="mt-6">
                    <label className="text-sm font-semibold mb-2 block">Servicios (Selecciona uno o varios)</label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded border">
                        {servicios.map(s => (
                            <label key={s.servicioid} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                <input 
                                    type="checkbox"
                                    checked={formData.serviciosIds.includes(s.servicioid)}
                                    onChange={() => handleServicioChange(s.servicioid)}
                                />
                                <span className="text-sm">{s.nombre} ({s.precio_actual}€)</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* NOTAS */}
                <div className="mt-4 flex flex-col">
                    <label className="text-sm font-semibold mb-1">Notas/Observaciones</label>
                    <textarea 
                        className="border rounded p-2" 
                        rows="2"
                        value={formData.observaciones}
                        onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    ></textarea>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
                    <button 
                        onClick={() => console.log("Enviando...", formData)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Guardar Cita
                    </button>
                </div>
            </div>
        </div>
    );
}

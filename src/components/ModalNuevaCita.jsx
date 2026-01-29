import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function ModalNuevaCita({ isOpen, onClose, onCitaCreada, citaAEditar }) {
    // 1. Estados para los desplegables
    const [clientes, setClientes] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [servicios, setServicios] = useState([]);

    // 2. Estado para los datos del formulario (coincidiendo con tu CitaCreateDto)
    const [formData, setFormData] = useState({
        clienteid: '',
        empleadoid: '',
        fecha_hora_inicio: '',
        observaciones: '',
        serviciosids: [] // Lista para multiselección
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

    // 4. EFECTO CLAVE: Rellenar formulario si venimos a EDITAR
    useEffect(() => {
        if (citaAEditar) {
            // MODO EDICIÓN: Rellenamos con los datos de la cita
            setFormData({
                clienteid: citaAEditar.clienteid || '',
                empleadoid: citaAEditar.empleadoid || '',
                // Truco: La fecha viene en formato ISO, el input necesita YYYY-MM-DDTHH:mm
                fecha_hora_inicio: citaAEditar.fecha_hora_inicio ? citaAEditar.fecha_hora_inicio.substring(0, 16) : '',
                observaciones: citaAEditar.observaciones || '',
                // Asumimos que tu GET /citas devuelve una lista de objetos 'servicios' dentro de la cita
                serviciosids: citaAEditar.servicios ? citaAEditar.servicios.map(s => s.servicioid) : []
            });
        } else {
            // MODO CREACIÓN: Limpiamos
            setFormData({
                clienteid: '',
                empleadoid: '',
                fecha_hora_inicio: '',
                observaciones: '',
                serviciosids: []
            });
        }
    }, [citaAEditar, isOpen]);

    // Manejador para los servicios (añadir/quitar de la lista)
    const handleServicioChange = (servicioId) => {
        setFormData(prev => {
            const existe = prev.serviciosids.includes(servicioId);
            return {
                ...prev,
                serviciosids: existe 
                    ? prev.serviciosids.filter(id => id !== servicioId) // Quitar
                    : [...prev.serviciosids, servicioId] // Añadir
            };
        });
    };
   // GUARDAR (CREAR O EDITAR)
    const handleGuardar = async () => {
        if (!formData.clienteId || !formData.empleadoId || !formData.fecha_hora_inicio) {
            alert("Rellena los campos obligatorios");
            return;
        }

        try {
            if (citaAEditar) {
                // --- PUT (EDITAR) ---
                await api.put(`/citas/${citaAEditar.citaid}`, formData);
                alert("Cita actualizada correctamente");
            } else {
                // --- POST (CREAR) ---
                await api.post('/citas', formData);
                alert("Cita creada correctamente");
            }
            
            onCitaCreada(); // Refrescar Agenda
            onClose();

        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error al guardar la cita.");
        }
    };

    // BORRAR
    const handleBorrar = async () => {
        if (!window.confirm("¿Seguro que quieres eliminar esta cita?")) return;

        try {
            await api.delete(`/citas/${citaAEditar.citaid}`);
            alert("Cita eliminada");
            onCitaCreada();
            onClose();
        } catch (error) {
            console.error("Error al borrar:", error);
            alert("No se pudo eliminar la cita");
        }
    };
  
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold">
                        {citaAEditar ? `Editar Cita #${citaAEditar.citaid}` : "Nueva Cita"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 font-bold text-xl">&times;</button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CLIENTE */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Cliente</label>
                        <select 
                            className="border rounded p-2"
                            value={formData.clienteid}
                            onChange={(e) => setFormData({...formData, clienteid: e.target.value})}
                        >
                            <option value="">Seleccione Cliente...</option>
                            {clientes.map(c => <option key={c.clienteId} value={c.clienteId}>{c.nombre} {c.apellidos}</option>)}
                        </select>
                    </div>

                    {/* EMPLEADO */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Empleado</label>
                        <select 
                            className="border rounded p-2"
                            value={formData.empleadoid}
                            onChange={(e) => setFormData({...formData, empleadoid: e.target.value})}
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
                                    checked={formData.serviciosids?.includes(s.servicioid) || false}
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

               {/* BOTONERA */}
                <div className="flex justify-between mt-6">
                    {/* Botón Borrar (Solo visible al editar) */}
                    <div>
                        {citaAEditar && (
                            <button 
                                onClick={handleBorrar}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 border border-red-300"
                            >
                                🗑️ Eliminar
                            </button>
                        )}
                    </div>
                    
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
                        <button 
                            onClick={handleGuardar}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {citaAEditar ? "Actualizar" : "Guardar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';
import moment from 'moment';

export default function ModalNuevaCita({ isOpen, onClose, onCitaGuardada, citaAEditar, datosNuevoHueco }) {
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
        estado: '', // Nuevo campo para el estado de la cita      
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
                estado: citaAEditar.estado || '', // Por si quieres mostrarlo o editarlo también
                // Asumimos que tu GET /citas devuelve una lista de objetos 'servicios' dentro de la cita
                serviciosIds: citaAEditar.servicios ? citaAEditar.servicios.map(s => s.servicioid) : []
            });
        } 
        else if (datosNuevoHueco) {
            // ESCENARIO 2: MODO NUEVO DESDE CALENDARIO GRID (Clic en hueco vacío)
            setFormData({
                clienteid: '', // Vacío, hay que elegirlo
                empleadoid: datosNuevoHueco.empleadoId || '', // 🎯 Autoseleccionamos el empleado
                
                // 🎯 Formateamos la fecha del clic al formato 'YYYY-MM-DDTHH:mm' que exige HTML
                fecha_hora_inicio: moment(datosNuevoHueco.fechaInicio).format('YYYY-MM-DDTHH:mm'), 
                
                // (Si tienes otros campos en tu formData, ponlos vacíos o con valores por defecto aquí)
                serviciosIds: [],
                observaciones: ''
            });
        }
        else {
            // MODO CREACIÓN: Limpiamos
            setFormData({
                clienteid: '',
                empleadoid: '',
                fecha_hora_inicio: '',
                observaciones: '',
                estado: '',
                serviciosIds: []
            });
        }
    }, [citaAEditar, datosNuevoHueco, isOpen]);

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
   // GUARDAR (CREAR O EDITAR)
    const handleGuardar = async () => {
        if (!formData.clienteid || !formData.empleadoid || !formData.fecha_hora_inicio) {
            Swal.fire({
                icon: 'warning',
                title: 'Faltan datos',
                text: 'Por favor, rellena Cliente, Empleado y Fecha.'
            });
            return;
        }

        try {
            if (citaAEditar) {
                // --- PUT (EDITAR) ---
                await api.put(`/citas/${citaAEditar.citaid}`, formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Actualizado',
                    text: 'La cita se ha modificado correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                // --- POST (CREAR) ---
                await api.post('/citas', formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Creada',
                    text: 'Cita agendada correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            
            onCitaGuardada(); // Refrescar Agenda
            onClose();

        } catch (error) {
           console.error("Error al guardar:", error);

            // 🧠 AQUÍ ESTÁ LA MAGIA PARA LEER EL MENSAJE DEL BACKEND
            // 1. Si el backend manda un string simple (Conflict), está en error.response.data
            // 2. Si manda un objeto de validación (BadRequest), a veces está en title o errors
            let mensajeError = "Ocurrió un error inesperado.";

            if (error.response) {
                if (typeof error.response.data === 'string') {
                    // Caso del Solapamiento (Conflict)
                    mensajeError = error.response.data; 
                } else if (error.response.data?.title) {
                    // Caso de Validación .NET automática
                    mensajeError = error.response.data.title;
                }
            }

            // Mostramos el error bonito
            Swal.fire({
                icon: 'error',
                title: 'No se pudo guardar',
                text: mensajeError,
                confirmButtonColor: '#d33'
            });
        }
    };

    // BORRAR
    const handleBorrar = async () => {
        if (!window.confirm("¿Seguro que quieres eliminar esta cita?")) return;

        try {
            await api.delete(`/citas/${citaAEditar.citaid}`);
            alert("Cita eliminada");
            onCitaGuardada();
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
                            <option value="" disabled>Seleccione Cliente...</option>
                            {clientes.map(c => 
                                <option 
                                    key={c.clienteid} 
                                    value={c.clienteid}>{c.nombre} {c.apellidos}                                   
                                    
                                </option>)}
                        
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
                    {/* ESTADO (Solo si quieres mostrarlo o editarlo) */}
                    {citaAEditar && (
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Estado</label>
                        <select 
                            className="border rounded p-2"
                            value={formData.estado}
                            onChange={(e) => setFormData({...formData, estado: e.target.value})}
                        >                            
                            <option value="Confirmada">Confirmada</option>
                            <option value="Completada">Completada</option>
                            <option value="No presentado">No presentado</option>
                            <option value="Cancelada">Cancelada</option>
                        </select>
                    </div>
                    )}
                </div>

                {/* SERVICIOS (Checkboxes) */}
                <div className="mt-6">
                    <label className="text-sm font-semibold mb-2 block">Servicios (Selecciona uno o varios)</label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded border">
                        {servicios.map(s => (
                            <label key={s.servicioid} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                <input 
                                    type="checkbox"
                                    checked={formData.serviciosIds?.includes(s.servicioid) || false}
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

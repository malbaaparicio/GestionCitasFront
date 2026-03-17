import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';

export default function ModalEmpleados ({isOpen, onClose, onGuardado, empleadoAEditar}) {

       // 2. Estado para los datos del formulario (coincidiendo con tu EmpleadoCreateDTO)
        const [formData, setFormData] = useState({
            nombre: '',
            apellidos: '',           
            telefono: '',
            color_agenda: '',
            estado: ''
        });

        // 4. EFECTO CLAVE: Rellenar formulario si venimos a EDITAR
            useEffect(() => {
                if (empleadoAEditar) {
                    // MODO EDICIÓN: Rellenamos con los datos del empleado a editar
                    setFormData({
                        nombre: empleadoAEditar.nombre || '',
                        apellidos: empleadoAEditar.apellidos || '',                       
                        telefono: empleadoAEditar.telefono || '',
                        color_agenda: empleadoAEditar.color_agenda || '',
                        estado: empleadoAEditar.estado || ''
                    });
                } else {
                    // MODO CREACIÓN: Limpiamos
                    setFormData({
                        nombre: '',
                        apellidos: '',                       
                        telefono: '',
                        color_agenda: '',
                        estado: ''
                    });
                }
            }, [empleadoAEditar, isOpen]);


            // GUARDAR (CREAR O EDITAR)
            const handleGuardar = async () => {
                if (!formData.nombre || !formData.apellidos || !formData.telefono) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Faltan datos',
                        text: 'Por favor, rellena Nombre, Apellidos y Teléfono.'
                    });
                    return;
                }

                try {
                    if (empleadoAEditar) {
                        // --- PUT (EDITAR) ---
                        await api.put(`/empleados/${empleadoAEditar.empleadoid}`, formData);
                        Swal.fire({
                            icon: 'success',
                            title: 'Actualizado',
                            text: 'El empleado se ha modificado correctamente',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    } else {
                        // --- POST (CREAR) ---
                        await api.post('/empleados', formData);
                        Swal.fire({
                            icon: 'success',
                            title: 'Creado',
                            text: 'Empleado creado correctamente',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    }
                    
                    onGuardado(); // Refrescar lista de empleados
                    onClose();

                } catch (error) {
                console.error("Error al guardar:", error);

                    // 🧠 AQUÍ ESTÁ LA MAGIA PARA LEER EL MENSAJE DEL BACKEND
                    // 1. Si el backend manda un string simple (Conflict), está en error.response.data
                    // 2. Si manda un objeto de validación (BadRequest), a veces está en title o errors
                    let mensajeError = "Ocurrió un error inesperado.";

                    if (error.response) {
                        if (typeof error.response.data === 'string') {
                            
                            mensajeError = error.response.data; 
                        } else if (error.response.data?.title) {
                            // Caso de Validación (BadRequest)
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
            // 1. Preguntar con estilo (SweetAlert)
                const result = await Swal.fire({
                    title: '¿Estás seguro?',
                    text: `Se eliminará a ${formData.nombre} ${formData.apellidos} y su historial.`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33', // Rojo para peligro
                    cancelButtonColor: '#3085d6', // Azul para cancelar
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                });

                if(result.isConfirmed) {

                try {
                    await api.delete(`/empleados/${empleadoAEditar.empleadoid}`);
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'El empleado ha sido eliminado',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    onGuardado();
                    onClose();
                    } catch (error) {
                        console.error("Error al borrar:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo eliminar el empleado',
                            confirmButtonColor: '#d33'
                        });
                    }
                }
            };

            if (!isOpen) return null;
        return (
             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold">
                        {empleadoAEditar ? `Editar Empleado #${empleadoAEditar.empleadoid}` : "Nuevo Empleado"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 font-bold text-xl">&times;</button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* NOMBRE */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Nombre</label>
                        <input 
                            type="text" 
                            className="border rounded p-2" 
                            value={formData.nombre}
                            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        />
                    </div>
                    {/* APELLIDOS */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Apellidos</label>
                        <input
                            type="text" 
                            className="border rounded p-2" 
                            value={formData.apellidos}
                            onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                        />
                    </div>                    
                    {/* TELÉFONO */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Teléfono</label>
                        <input 
                            type="text" 
                            className="border rounded p-2" 
                            value={formData.telefono}
                            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        />
                    </div>
                    {/* ESTADO solo si empleadoAEditar */}
                     {empleadoAEditar && (
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Estado</label>
                        <select
                            className="border rounded p-2"
                            value={formData.estado}
                            onChange={(e) => setFormData({...formData, estado: e.target.value})}
                        >
                            <option value="">Selecciona un estado</option>
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                     )}
                        {/* COLOR AGENDA */}
                    <div className="flex flex-col md:col-span-2">
                        <label className="text-sm font-semibold mb-1">Color Agenda</label>
                        <input 
                            type="color" 
                            className="w-16 h-10 border rounded p-1"                           
                            value={formData.color_agenda}
                            onChange={(e) => setFormData({...formData, color_agenda: e.target.value})}
                        />
                    </div>
                    
                </div>

               {/* BOTONERA */}
                <div className="flex justify-between mt-6">
                    {/* Botón Borrar (Solo visible al editar) 
                    <div>
                        {empleadoAEditar && (
                            <button 
                                onClick={handleBorrar}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 border border-red-300"
                            >
                                🗑️ Eliminar
                            </button>
                        )}
                    </div>*/}
                    
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
                        <button 
                            onClick={handleGuardar}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {empleadoAEditar ? "Actualizar" : "Guardar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        )
}



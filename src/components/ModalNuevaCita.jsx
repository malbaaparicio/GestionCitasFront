import React from 'react';

export default function ModalNuevaCita({ isOpen, onClose }) {
    // Si no está abierto, no renderizamos nada (invisible)
    if (!isOpen) return null;

    return (
        // 1. EL FONDO OSCURO (BACKDROP)
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
            
            {/* 2. LA CAJA BLANCA (CONTENIDO) */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                
                {/* CABECERA */}
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                    <h2 className="text-xl font-bold text-gray-800">Nueva Cita</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold text-xl">
                        &times;
                    </button>
                </div>

                {/* CUERPO (AQUÍ IRÁ EL FORMULARIO MAÑANA) */}
                <div className="space-y-4 mb-6">
                    <p className="text-gray-600">
                        Aquí cargaremos los desplegables de Clientes, Empleados y Servicios mañana.
                        De momento, esto es solo el contenedor.
                    </p>
                    
                    {/* Placeholder visual */}
                    <div className="h-32 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center">
                        Próximamente: Formulario
                    </div>
                </div>

                {/* PIE (BOTONES) */}
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                    >
                        Cancelar
                    </button>
                    <button 
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Guardar Cita
                    </button>
                </div>

            </div>
        </div>
    );
}
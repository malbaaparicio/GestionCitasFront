import { useState } from 'react';
import api from '../api/axiosConfig'; // Importamos tu API

export default function BuscadorHuecos() {
    // 1. Estados para los parámetros de búsqueda
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]); // Fecha de hoy por defecto
    const [duracion, setDuracion] = useState(45); // 45 min por defecto
    const [empleadoId, setEmpleadoId] = useState('');
    
    // 2. Estados para los resultados y la interfaz
    const [huecos, setHuecos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [horaSeleccionada, setHoraSeleccionada] = useState(null);

    // 3. Función que llama al backend
    const buscarHuecos = async () => {
        setLoading(true);
        setHuecos([]);
        setHoraSeleccionada(null); // Reseteamos la selección anterior

        try {
            // Nota: Según tu captura de Postman, tu endpoint se llama /citas/huecos
            const response = await api.get('/citas/huecos', {
                params: {
                    fecha: fecha,
                    duracionMinutos: duracion,
                    empleadoId: empleadoId ? parseInt(empleadoId) : null
                }
            });
            
            setHuecos(response.data);
        } catch (error) {
            console.error("Error al buscar huecos libres:", error);
            alert("Hubo un error al buscar los huecos. Revisa la consola.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto border rounded shadow-sm bg-white">
            <h2 className="text-xl font-bold mb-4">Buscar Huecos Libres</h2>
            
            {/* --- PANEL DE BÚSQUEDA --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Fecha</label>
                    <input 
                        type="date" 
                        value={fecha} 
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Duración (min)</label>
                    <input 
                        type="number" 
                        step="15"
                        value={duracion} 
                        onChange={(e) => setDuracion(Number(e.target.value))}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Empleado (Opcional)</label>
                    <input 
                        type="number" 
                        placeholder="ID Empleado"
                        value={empleadoId} 
                        onChange={(e) => setEmpleadoId(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
            </div>

            <button 
                onClick={buscarHuecos}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Buscando...' : 'Buscar Disponibilidad'}
            </button>

            {/* --- PARRILLA DE RESULTADOS --- */}
            <div className="mt-8">
                {huecos.length > 0 ? (
                    <div>
                        <h3 className="text-lg font-medium mb-3">Horas Disponibles:</h3>
                        <div className="flex flex-wrap gap-2">
                            {huecos.map((hora, index) => (
                                <button
                                    key={index}
                                    onClick={() => setHoraSeleccionada(hora)}
                                    className={`py-2 px-4 border rounded font-semibold transition-colors
                                        ${horaSeleccionada === hora 
                                            ? 'bg-green-600 text-white border-green-600' 
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {hora}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    !loading && <p className="text-gray-500 italic">No hay huecos buscados o no hay disponibilidad.</p>
                )}
            </div>

            {/* --- ACCIÓN FINAL --- */}
            {horaSeleccionada && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800">
                        Has seleccionado las <strong>{horaSeleccionada}</strong> el día <strong>{fecha}</strong>.
                    </p>
                    <button className="mt-2 bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">
                        Confirmar Cita (Paso Siguiente)
                    </button>
                </div>
            )}
        </div>
    );
}
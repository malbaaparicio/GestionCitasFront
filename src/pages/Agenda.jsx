import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { 
    format, 
    startOfWeek, endOfWeek, 
    startOfMonth, endOfMonth, 
    addDays, addWeeks, addMonths, 
    subDays, subWeeks, subMonths,
    isSameDay, parseISO 
} from 'date-fns';
import { es } from 'date-fns/locale'; // Para fechas en español
import ModalNuevaCita from '../components/ModalNuevaCita';

export default function Agenda() {
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(false);

    // 2. NUEVO ESTADO PARA EL MODAL
    const [modalAbierto, setModalAbierto] = useState(false);
    
    // Estados de control
    const [vista, setVista] = useState('dia'); // 'dia', 'semana', 'mes'
    const [fechaActual, setFechaActual] = useState(new Date());

    // 1. CÁLCULO DE FECHAS
    const obtenerRangoFechas = () => {
        let desde, hasta;

        if (vista === 'dia') {
            desde = fechaActual;
            hasta = fechaActual;
        } else if (vista === 'semana') {
            // weekStartsOn: 1 significa que la semana empieza en Lunes
            desde = startOfWeek(fechaActual, { weekStartsOn: 1 }); 
            hasta = endOfWeek(fechaActual, { weekStartsOn: 1 });
        } else { // vista === 'mes'
            desde = startOfMonth(fechaActual);
            hasta = endOfMonth(fechaActual);
        }

        return {
            fecha_desde: format(desde, 'yyyy-MM-dd'),
            fecha_hasta: format(hasta, 'yyyy-MM-dd')
        };
    };

    // 2. LLAMADA A LA API
    useEffect(() => {
        const fetchCitas = async () => {
            setCargando(true);
            try {
                const rango = obtenerRangoFechas();
                
                // Axios convierte automáticamente el objeto 'params' en ?fecha_desde=X&fecha_hasta=Y
                const response = await api.get('/citas', { params: rango });
                setCitas(response.data);
            } catch (error) {
                console.error("Error cargando agenda:", error);
            } finally {
                setCargando(false);
            }
        };

        fetchCitas();
    }, [fechaActual, vista]); // Se recarga si cambias de día o de vista

    // 3. MANEJADORES DE NAVEGACIÓN
    const navegar = (direccion) => {
        if (direccion === 'prev') {
            if (vista === 'dia') setFechaActual(subDays(fechaActual, 1));
            if (vista === 'semana') setFechaActual(subWeeks(fechaActual, 1));
            if (vista === 'mes') setFechaActual(subMonths(fechaActual, 1));
        } else {
            if (vista === 'dia') setFechaActual(addDays(fechaActual, 1));
            if (vista === 'semana') setFechaActual(addWeeks(fechaActual, 1));
            if (vista === 'mes') setFechaActual(addMonths(fechaActual, 1));
        }
    };

    // Función para pintar etiqueta de rango (Ej: "Enero 2026")
    const renderEtiquetaFecha = () => {
        if (vista === 'dia') return format(fechaActual, "EEEE d 'de' MMMM", { locale: es });
        if (vista === 'mes') return format(fechaActual, "MMMM yyyy", { locale: es });
        
        const inicio = startOfWeek(fechaActual, { weekStartsOn: 1 });
        const fin = endOfWeek(fechaActual, { weekStartsOn: 1 });
        return `${format(inicio, 'd MMM', { locale: es })} - ${format(fin, 'd MMM', { locale: es })}`;
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* --- BARRA SUPERIOR DE HERRAMIENTAS --- */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow mb-6 gap-4">
                
                {/* Botones de Vista */}
                <div className="flex bg-gray-200 rounded p-1">
                    {['dia', 'semana', 'mes'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setVista(v)}
                            className={`px-4 py-2 rounded capitalize ${
                                vista === v ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>

                {/* Navegación Central */}
                <div className="flex items-center gap-4">
                    <button onClick={() => navegar('prev')} className="p-2 hover:bg-gray-100 rounded-full">◀</button>
                    <span className="text-lg font-semibold capitalize min-w-[200px] text-center">
                        {renderEtiquetaFecha()}
                    </span>
                    <button onClick={() => navegar('next')} className="p-2 hover:bg-gray-100 rounded-full">▶</button>
                </div>

                {/* Selector Manual */}
                <div>
                    <input 
                        type="date" 
                        value={format(fechaActual, 'yyyy-MM-dd')}
                        onChange={(e) => setFechaActual(parseISO(e.target.value))} // parseISO es más seguro
                        className="border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button 
                    onClick={() => setModalAbierto(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2"
                >
                    <span>+</span> Nueva Cita
                </button>
            </div>

            {/* --- ÁREA DE CONTENIDO (LISTA DE CITAS TEMPORAL) --- */}
            <div className="bg-white rounded-lg shadow p-6">
                {cargando ? (
                    <div className="text-center py-10 text-gray-500">Cargando agenda...</div>
                ) : citas.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">No hay citas para este periodo.</div>
                ) : (
                    <div className="space-y-4">
                        {/* Aquí pintamos una lista simple por ahora. Luego haremos un calendario visual */}
                        {citas.map((cita) => (
                            <div key={cita.citaId} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-blue-900">
                                        {format(parseISO(cita.fecha_hora_inicio), 'HH:mm')} - {format(parseISO(cita.fecha_hora_fin), 'HH:mm')}
                                    </div>
                                    <div className="text-gray-700 font-medium">{cita.nombreCliente}</div>
                                    <div className="text-sm text-gray-500">con {cita.nombreEmpleado}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">{cita.precio_total} €</div>
                                    <div className={`text-xs px-2 py-1 rounded inline-block ${
                                        cita.estado === 'Cancelada' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                                    }`}>
                                        {cita.estado}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ModalNuevaCita 
                isOpen={modalAbierto} 
                onClose={() => setModalAbierto(false)} 
            />
        </div>
    );
}
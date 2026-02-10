import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { 
    format, 
    startOfWeek, endOfWeek, 
    startOfMonth, endOfMonth, 
    addDays, addWeeks, addMonths, 
    subDays, subWeeks, subMonths,
    parseISO 
} from 'date-fns';
import { es } from 'date-fns/locale'; 
import ModalNuevaCita from '../components/ModalNuevaCita';

export default function Agenda() {
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(false);
    
    // --- ESTADOS DE CONTROL ---
    const [modalAbierto, setModalAbierto] = useState(false);
    const [citaEditar, setCitaEditar] = useState(null); // Para saber qué cita editamos
    const [refreshKey, setRefreshKey] = useState(0);    // Contador para forzar recarga
    
    const [vista, setVista] = useState('dia'); 
    const [fechaActual, setFechaActual] = useState(new Date());

    // 1. CÁLCULO DE FECHAS
    const obtenerRangoFechas = () => {
        let desde, hasta;
        if (vista === 'dia') {
            desde = fechaActual;
            hasta = fechaActual;
        } else if (vista === 'semana') {
            desde = startOfWeek(fechaActual, { weekStartsOn: 1 }); 
            hasta = endOfWeek(fechaActual, { weekStartsOn: 1 });
        } else { 
            desde = startOfMonth(fechaActual);
            hasta = endOfMonth(fechaActual);
        }
        return {
            fecha_desde: format(desde, 'yyyy-MM-dd'),
            fecha_hasta: format(hasta, 'yyyy-MM-dd')
        };
    };

    // 2. CARGA DE CITAS
    useEffect(() => {
        const fetchCitas = async () => {
            setCargando(true);
            try {
                const rango = obtenerRangoFechas();
                const response = await api.get('/citas', { params: rango });
                setCitas(response.data);
            } catch (error) {
                console.error("Error cargando agenda:", error);
            } finally {
                setCargando(false);
            }
        };

        fetchCitas();
    // AÑADIDO 'refreshKey' AQUÍ ABAJO: Cada vez que cambie, se recarga la lista
    }, [fechaActual, vista, refreshKey]); 

    // --- MANEJADORES DE NAVEGACIÓN ---
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

    const renderEtiquetaFecha = () => {
        if (vista === 'dia') return format(fechaActual, "EEEE d 'de' MMMM", { locale: es });
        if (vista === 'mes') return format(fechaActual, "MMMM yyyy", { locale: es });
        const inicio = startOfWeek(fechaActual, { weekStartsOn: 1 });
        const fin = endOfWeek(fechaActual, { weekStartsOn: 1 });
        return `${format(inicio, 'd MMM', { locale: es })} - ${format(fin, 'd MMM', { locale: es })}`;
    };

    // --- MANEJADORES DEL MODAL ---
    const abrirModalCrear = () => {
        setCitaEditar(null); // Limpiamos para que sea una cita nueva
        setModalAbierto(true);
    };

    const abrirModalEditar = (cita) => {
        setCitaEditar(cita); // Pasamos los datos de la cita clicada
        setModalAbierto(true);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* BARRA SUPERIOR */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow mb-6 gap-4">
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

                <div className="flex items-center gap-4">
                    <button onClick={() => navegar('prev')} className="p-2 hover:bg-gray-100 rounded-full">◀</button>
                    <span className="text-lg font-semibold capitalize min-w-[200px] text-center">
                        {renderEtiquetaFecha()}
                    </span>
                    <button onClick={() => navegar('next')} className="p-2 hover:bg-gray-100 rounded-full">▶</button>
                </div>

                {/* BOTÓN NUEVA CITA */}
                <button 
                    onClick={abrirModalCrear} // Usamos la función nueva
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2"
                >
                    <span>+</span> Nueva Cita
                </button>
            </div>

            {/* LISTA DE CITAS */}
            <div className="bg-white rounded-lg shadow p-6">
                {cargando ? (
                    <div className="text-center py-10 text-gray-500">Cargando agenda...</div>
                ) : citas.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">No hay citas para este periodo.</div>
                ) : (
                    <div className="space-y-4">
                        {citas.map((cita) => (
                            <div 
                                key={cita.citaid} 
                                onClick={() => abrirModalEditar(cita)} // Al hacer clic, editamos
                                className="cursor-pointer border-l-8 p-4 rounded shadow-sm flex justify-between items-center hover:shadow-md transition bg-white mb-3"
                                style={{ 
                                    borderLeftColor: cita.color_agenda_empleado || '#ccc',
                                    backgroundColor: cita.color_agenda_empleado ? `${cita.color_agenda_empleado}15` : '#ffffff' 
                                    // El '15' al final del hex añade un 15% de opacidad (truco hex)
                                }}
                            >           
                                <div>
                                    {/*Mostramos la fecha de la cita sin hora, solo el día y mes*/}
                                    <div className="text-sm text-gray-500">
                                        {format(parseISO(cita.fecha_hora_inicio), 'd MMMM', { locale: es })}
                                    </div>
                                    <div className="font-bold text-blue-900">
                                        {/* Protegemos con ? por si viene nulo */}
                                        {cita.fecha_hora_inicio && format(parseISO(cita.fecha_hora_inicio), 'HH:mm')} - 
                                        {cita.fecha_hora_fin && format(parseISO(cita.fecha_hora_fin), 'HH:mm')}
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

            {/* MODAL CONFIGURADO CORRECTAMENTE */}
            <ModalNuevaCita 
                isOpen={modalAbierto} 
                onClose={() => setModalAbierto(false)} 
                // Al guardar, sumamos 1 al refreshKey, lo que dispara el useEffect de arriba
                onCitaGuardada={() => setRefreshKey(prev => prev + 1)}
                citaAEditar={citaEditar} // Pasamos la cita a editar (o null si es nueva)
            />
        </div>
    );
}
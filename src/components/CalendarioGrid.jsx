import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api/axiosConfig'; // Importamos tu API

moment.locale('es', { week: { dow: 1 } });
const localizer = momentLocalizer(moment);

export default function CalendarioGrid() {
    const [eventos, setEventos] = useState([]);
    const [recursos, setRecursos] = useState([]); // <-- Aquí guardaremos las columnas (Empleados)
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // 1. Cargamos Empleados (Solo los activos)
                const resEmpleados = await api.get('/empleados');
                const empleadosActivos = resEmpleados.data.filter(emp => (emp.estado || 'Activo') === 'Activo');
                
                // Mapeamos al formato estricto que pide el calendario para las columnas
                const recursosMapeados = empleadosActivos.map(emp => ({
                    id: emp.empleadoid,       // ID del recurso
                    title: emp.nombre         // Nombre de la columna
                }));
                setRecursos(recursosMapeados);

                // 2. Cargamos Citas 
                // Nota: Tu API por defecto devuelve las de "Hoy", ideal para esta vista
                const resCitas = await api.get('/citas');
                
                // Mapeamos las citas al formato estricto de react-big-calendar
                const eventosMapeados = resCitas.data.map(cita => ({
                    id: cita.citaid,
                    title: `${cita.nombreCliente} - ${cita.estado}`, // Lo que se lee en el bloque
                    start: new Date(cita.fecha_hora_inicio), // IMPRESCINDIBLE: Convertir string a Objeto Date
                    end: new Date(cita.fecha_hora_fin),
                    resourceId: cita.empleadoid, // ⬅️ LA CLAVE MÁGICA: Esto le dice en qué columna pintarlo
                    color: cita.color_agenda_empleado // Lo guardamos para pintar luego
                }));
                setEventos(eventosMapeados);

            } catch (error) {
                console.error("Error cargando el calendario:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []);

    if (cargando) return <div className="p-10">Cargando calendario...</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Calendario Diario (Columnas)</h1>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg" style={{ height: '75vh' }}>
                <Calendar
                    localizer={localizer}
                    events={eventos}
                    startAccessor="start"
                    endAccessor="end"
                    
                    // --- CONFIGURACIÓN DE RECURSOS (COLUMNAS) ---
                    resources={recursos}
                    resourceIdAccessor="id"
                    resourceTitleAccessor="title"
                    
                    // Forzamos a que empiece en la vista de Día
                    defaultView="day"
                    views={['day', 'week', 'month']} 
                    
                    min={moment().set({ hour: 9, minute: 0 }).toDate()} // Abre a las 09:00
                    max={moment().set({ hour: 21, minute: 0 }).toDate()} // Cierra a las 21:00
                    
                    messages={{
                        next: "Sig",
                        previous: "Ant",
                        today: "Hoy",
                        month: "Mes",
                        week: "Semana",
                        day: "Día",
                        showMore: total => `+ Ver más (${total})`
                    }}
                />
            </div>
        </div>
    );
}
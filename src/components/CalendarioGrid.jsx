import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment/min/moment-with-locales'; 
import ModalNuevaCita from './ModalNuevaCita'; 
moment.locale('es', {
  week: { dow: 1 } // Lunes como primer día
});
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api/axiosConfig'; // Importamos tu API

moment.locale('es', { week: { dow: 1 } });
const localizer = momentLocalizer(moment);

export default function CalendarioGrid() {
    const [eventos, setEventos] = useState([]);
    const [recursos, setRecursos] = useState([]); // <-- Aquí guardaremos las columnas (Empleados)
    const [cargando, setCargando] = useState(true);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [citaAEditar, setCitaAEditar] = useState(null);
    const [datosNuevoHueco, setDatosNuevoHueco] = useState(null); // Para pre-rellenar fecha y empleado
    const [refreshKey, setRefreshKey] = useState(0); // Para forzar recarga del calendario  


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
                    color: cita.color_agenda_empleado, // Lo guardamos para pintar luego
                    citaOriginal: cita // Guardamos la cita original por si queremos usar más datos en el futuro
                }));
                setEventos(eventosMapeados);

            } catch (error) {
                console.error("Error cargando el calendario:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [refreshKey]);

    // Función para inyectar el color del empleado a la cita
    const estiloEventos = (event, start, end, isSelected) => {
        return {
            style: {
                backgroundColor: event.color || '#3174ad', // El color que mapeamos de la BD
                borderColor: event.color || '#3174ad',
                color: 'white', // Texto blanco para que contraste
                borderRadius: '5px',
                display: 'block'
            }
        };
    };

    // 1. FORZAMOS LOS FORMATOS (Idioma y 24h)
    const formatos = {
        timeGutterFormat: 'HH:mm', // La columna de horas de la izquierda (09:00)
        dayFormat: 'dddd DD MMM', // Cabecera de las columnas (Jueves 09 Abr)
        dayHeaderFormat: 'dddd DD MMMM YYYY', // El título superior
        agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
        // Ocultamos la hora dentro del bloque de la cita para dejar sitio al nombre
        eventTimeRangeFormat: () => '', 
    };

   // 2. DISEÑAMOS EL INTERIOR DE LA CITA Y EL TOOLTIP
    const componentes = {
        event: ({ event }) => {
            const horaInicio = moment(event.start).format('HH:mm');
            const horaFin = moment(event.end).format('HH:mm'); // Añadimos también el fin
            
            // 🧠 Extraemos los nombres de los servicios
            // OJO: Asegúrate de que 's.nombre' coincide con la propiedad de tu CitaServicioGetDto
            // Si en tu backend se llama de otra forma (ej: s.nombreServicio), cámbialo aquí.
            const nombresServicios = event.citaOriginal?.servicios && event.citaOriginal.servicios.length > 0
                ? event.citaOriginal.servicios.map(s => s.nombre_servicio).join(', ') 
                : 'Sin servicios registrados';

            // Construimos el Tooltip con saltos de línea (\n) y unos emojis para darle estilo
            const tooltipTexto = `⏰ Horario: ${horaInicio} - ${horaFin}\n👤 Cliente: ${event.citaOriginal.nombreCliente}\n✂️ Servicios: ${nombresServicios}\n📝 Notas: ${event.citaOriginal.observaciones || 'Ninguna'}`;

            return (
                <div 
                    className="h-full overflow-hidden text-md leading-tight pt-0.5 px-1"
                    title={tooltipTexto}
                >
                    <span className="font-bold">{horaInicio}</span> - {event.title}
                </div>
            );
        }
    };

    // 1. Al hacer clic en una cita existente
    const handleSeleccionarCita = (evento) => {
        // Le pasamos la cita original completa al modal
        setCitaAEditar(evento.citaOriginal);
        setModalAbierto(true);
    };

    // 2. Al hacer clic en un hueco vacío
    const handleSeleccionarHueco = (slotInfo) => {
        setCitaAEditar(null);
        // Guardamos la hora y el empleado (resourceId) donde ha hecho clic
        setDatosNuevoHueco({
            fechaInicio: slotInfo.start,
            empleadoId: slotInfo.resourceId
        });
        setModalAbierto(true);
    };

    if (cargando) return <div className="p-10">Cargando calendario...</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Calendario Diario (Columnas)</h1>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg" style={{ height: '75vh' }}>
                <Calendar
                    culture="es"
                    eventPropGetter={estiloEventos}
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
                    formats={formatos}
                    components={componentes}
                    // 👇 NUEVAS PROPIEDADES DE INTERACTIVIDAD 👇
                    selectable={true} // Activa la posibilidad de hacer clic en huecos
                    onSelectEvent={handleSeleccionarCita} // Clic en cita
                    onSelectSlot={handleSeleccionarHueco} // Clic en hueco vacío
                    step={15} // Define que cada clic selecciona bloques de 15 minutos
                    timeslots={2} // Muestra 2 bloques por cada hora (ej: 10:00 y 10:30 visualmente)
                />
            </div>
            {/* MODAL DE CITAS */}
            <ModalNuevaCita 
                isOpen={modalAbierto} 
                onClose={() => setModalAbierto(false)} 
                onCitaGuardada={() => setRefreshKey(prev => prev + 1)} // Necesitarás un estado refreshKey para recargar el calendario
                citaAEditar={citaAEditar} 
                datosNuevoHueco={datosNuevoHueco}
            />
        </div>
    );
}
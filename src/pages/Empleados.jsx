import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ModalEmpleados from '../components/ModalEmpleados';

export default function Empleados() {
    const [empleados, setEmpleados] = useState([]);
    const [cargando, setCargando] = useState(true);

     // --- ESTADOS DE CONTROL ---
    const [modalAbierto, setModalAbierto] = useState(false);
    const [empleadoEditar, setEmpleadoEditar] = useState(null); // Para saber qué empleado editamos
    const [refreshKey, setRefreshKey] = useState(0);    // Contador para forzar recarga

    // NUEVO: Estados para Filtro y Paginación
    const [mostrarInactivos, setMostrarInactivos] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 5; // Puedes cambiar esto a 10 o 15
    
    // useEffect se ejecuta al cargar la página (como el OnInitialized)
    useEffect(() => {
        const fetchEmpleados = async () => {
            try {
                const response = await api.get('/empleados');
                setEmpleados(response.data);
            } catch (error) {
                console.error("Error cargando empleados:", error);
            } finally {
                setCargando(false);
            }
        };

        fetchEmpleados();
    }, [refreshKey]);

    // NUEVO: Resetear a la página 1 cada vez que cambiamos el filtro
    useEffect(() => {
        setPaginaActual(1);
    }, [mostrarInactivos, empleados]);

     // --- MANEJADORES DEL MODAL ---
    const abrirModalCrear = () => {
        setEmpleadoEditar(null); // Limpiamos para que sea un empleado nuevo
        setModalAbierto(true);
    };

    const abrirModalEditar = (empleado) => {
        setEmpleadoEditar(empleado); // Pasamos los datos del empleado clicado
        setModalAbierto(true);
    };

    // NUEVO: Lógica de Filtrado
    const empleadosFiltrados = empleados.filter(emp => {
        // Asumimos que si el estado viene nulo, es Activo por defecto
        const estadoActual = emp.estado || 'Activo';
        return mostrarInactivos ? estadoActual === 'Inactivo' : estadoActual === 'Activo';
    });

    // NUEVO: Lógica de Paginación
    const indiceUltimoRegistro = paginaActual * registrosPorPagina;
    const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
    const empleadosPaginados = empleadosFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);
    const totalPaginas = Math.ceil(empleadosFiltrados.length / registrosPorPagina);

    const irPaginaAnterior = () => {
        if (paginaActual > 1) setPaginaActual(paginaActual - 1);
    };

    const irPaginaSiguiente = () => {
        if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
    };

    if (cargando) return <div className="p-4">Cargando datos...</div>;

    return (
        <div className="p-10 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Listado de Empleados</h1>

             {/* CABECERA: Título, Botón Nuevo y Toggle de Estado */}
            <div className="flex flex-row justify-between items-center bg-white p-4 rounded-lg shadow mb-6 w-full">
                
                {/* Izquierda: Botón Nuevo Empleado */}
                <button 
                    onClick={abrirModalCrear} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2"
                >
                    <span>+</span> Nuevo Empleado
                </button>

                {/* Derecha: Toggle Switch para Inactivos */}
                <label className="flex items-center cursor-pointer">
                    <span className="mr-3 text-sm font-semibold text-gray-700">
                        {mostrarInactivos ? "Viendo Inactivos" : "Viendo Activos"}
                    </span>
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={mostrarInactivos}
                            onChange={(e) => setMostrarInactivos(e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${mostrarInactivos ? 'bg-red-400' : 'bg-green-400'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${mostrarInactivos ? 'translate-x-6' : ''}`}></div>
                    </div>
                </label>
                
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Nombre
                            </th>
                             <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Teléfono
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Color Agenda
                            </th>   
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Estado
                            </th>                              
                        </tr>
                    </thead>
                    <tbody>
                        {empleadosPaginados.map((empleado) => (
                            <tr key={empleado.empleadoid} 
                                onClick={() => abrirModalEditar(empleado)}   
                                className="cursor-pointer hover:bg-gray-50">

                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                        {empleado.nombre} {empleado.apellidos}
                                    </p>
                                </td>
                                 <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                        {empleado.telefono}
                                    </p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">                                    
                                    <p 
                                        className="w-6 h-6 rounded-full"
                                        style={{ backgroundColor: empleado.color_agenda }}
                                    />                                    
                                </td> 
                                 <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{empleado.estado}</p>
                                </td>                                 
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* NUEVO: Controles de Paginación */}
                {!cargando && empleadosFiltrados.length > 0 && (
                    <div className="px-5 py-4 flex items-center justify-between border-t border-gray-200 bg-white">
                        <span className="text-sm text-gray-600">
                            Mostrando {indicePrimerRegistro + 1} a {Math.min(indiceUltimoRegistro, empleadosFiltrados.length)} de {empleadosFiltrados.length} Entradas
                        </span>
                        <div className="inline-flex mt-2 xs:mt-0 gap-2">
                            <button 
                                onClick={irPaginaAnterior} 
                                disabled={paginaActual === 1}
                                className={`text-sm font-semibold py-2 px-4 rounded ${paginaActual === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                            >
                                Anterior
                            </button>
                            <button 
                                onClick={irPaginaSiguiente} 
                                disabled={paginaActual === totalPaginas}
                                className={`text-sm font-semibold py-2 px-4 rounded ${paginaActual === totalPaginas ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* MODAL CONFIGURADO CORRECTAMENTE */}
                                    <ModalEmpleados 
                                        isOpen={modalAbierto} 
                                        onClose={() => setModalAbierto(false)} 
                                        // Al guardar, sumamos 1 al refreshKey, lo que dispara el useEffect de arriba
                                        onGuardado={() => setRefreshKey(prev => prev + 1)}
                                        empleadoAEditar={empleadoEditar} // Pasamos el empleado a editar (o null si es nuevo)
                                        />
        </div>
    );
}